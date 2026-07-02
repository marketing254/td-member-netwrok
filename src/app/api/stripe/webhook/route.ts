import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, appOrigin } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { applySubscriptionToMember, memberIdForCustomer } from "@/lib/billing";
import { notifyTeam } from "@/lib/email/teamNotify";
import { sendTrialEndingReminder } from "@/lib/email/trialEndingReminder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Stripe sometimes batches events; allow enough time to process.
export const maxDuration = 30;

/**
 * POST /api/stripe/webhook
 *
 * Stripe POSTs subscription / invoice events here. We:
 *   1. Verify the signature so a random caller can't spoof events
 *   2. Skip events we've already processed (idempotency)
 *   3. Update the members row to mirror the new state
 *   4. Append a row to stripe_events for the audit trail
 *
 * The signing secret comes from STRIPE_WEBHOOK_SECRET (Developers →
 * Webhooks → your endpoint → reveal "Signing secret").
 */
const RELEVANT_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
]);

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("STRIPE_WEBHOOK_SECRET is not set", { status: 503 });
  }

  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return new NextResponse(err instanceof Error ? err.message : "Stripe unavailable", {
      status: 503,
    });
  }

  // Stripe needs the raw body to verify the signature.
  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    return new NextResponse(
      `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown"}`,
      { status: 400 },
    );
  }

  const sb = getSupabaseAdmin();

  // Idempotency — bail out if we've already processed this event id.
  const { data: prior } = await sb
    .from("stripe_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (prior) {
    return NextResponse.json({ received: true, deduped: true });
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    // Log unhandled events too — easier to add handling later if we need it.
    await sb.from("stripe_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
    });
    return NextResponse.json({ received: true, ignored: true });
  }

  let memberId: string | null = null;
  try {
    memberId = await handleEvent(event, stripe);
  } catch (err) {
    console.error("[stripe webhook] handler failed:", err);
    // We intentionally still record the event so it's not silently lost.
    await sb.from("stripe_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Handler failed" },
      { status: 500 },
    );
  }

  await sb.from("stripe_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    member_id: memberId,
    payload: event as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ received: true });
}

/**
 * Apply an event to our members table. Returns the affected member_id
 * (if known) so we can stamp it on the stripe_events row.
 */
async function handleEvent(event: Stripe.Event, stripe: Stripe): Promise<string | null> {
  const sb = getSupabaseAdmin();

  // ---- checkout.session.completed -----------------------------------
  // Fires the moment the customer finishes paying. We pull the freshly
  // created subscription and write the full shape onto the member row,
  // then notify the team distribution list so they can see the sale.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const memberId = (session.metadata?.member_id ?? null) as string | null;
    if (!memberId || !session.subscription) return memberId;

    const subId =
      typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId, {
      expand: ["default_payment_method", "items.data.price"],
    });

    await applySubscriptionToMember(sb, memberId, sub, stripe);

    // Best-effort team alert. Pull the member's name + email + amount.
    try {
      const { data: member } = await sb
        .from("members")
        .select("first_name, last_name, email, practice_name, tier, subscription_interval")
        .eq("id", memberId)
        .maybeSingle();
      const firstItem = sub.items.data[0];
      const amountCents = firstItem?.price?.unit_amount ?? 0;
      const currency = (firstItem?.price?.currency ?? "usd").toUpperCase();
      const interval = firstItem?.price?.recurring?.interval ?? null;
      const memberName = member
        ? `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() || member.email
        : "Unknown member";
      const amountStr = (amountCents / 100).toFixed(2);

      await notifyTeam({
        tag: "stripe-payment",
        subject: `New paid member: ${memberName} — $${amountStr}/${interval ?? "subscription"}`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#0A1A2F;">
            <p><strong>A new member just completed checkout.</strong></p>
            <ul>
              <li><strong>Name:</strong> ${memberName}</li>
              <li><strong>Email:</strong> ${member?.email ?? "—"}</li>
              <li><strong>Practice:</strong> ${member?.practice_name ?? "—"}</li>
              <li><strong>Tier:</strong> ${member?.tier ?? "—"}</li>
              <li><strong>Interval:</strong> ${interval ?? "—"}</li>
              <li><strong>Amount:</strong> ${currency} $${amountStr}</li>
              <li><strong>Stripe sub:</strong> ${sub.id}</li>
            </ul>
            <p>See it at <a href="https://www.dentalmembernetwork.com/admin/members">/admin/members</a>.</p>
          </div>
        `,
        text: [
          "New paid member.",
          `Name:     ${memberName}`,
          `Email:    ${member?.email ?? "—"}`,
          `Practice: ${member?.practice_name ?? "—"}`,
          `Tier:     ${member?.tier ?? "—"}`,
          `Interval: ${interval ?? "—"}`,
          `Amount:   ${currency} $${amountStr}`,
          `Stripe sub: ${sub.id}`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("[stripe webhook] team-notify failed:", err);
    }

    return memberId;
  }

  // ---- customer.subscription.* --------------------------------------
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const memberId = await memberIdForCustomer(sb, customerId, sub.metadata?.member_id);
    if (!memberId) return null;

    // Hydrate default_payment_method on the way through so we can store
    // brand + last4. The webhook payload doesn't always include it expanded.
    const hydrated = sub.default_payment_method
      ? sub
      : await stripe.subscriptions.retrieve(sub.id, { expand: ["default_payment_method"] });

    await applySubscriptionToMember(sb, memberId, hydrated, stripe);
    return memberId;
  }

  // ---- customer.subscription.trial_will_end -------------------------
  // Fires ~3 days before a trial ends (Stripe's fixed default). Routes
  // the ping to the founding partner or expert, prompting them to
  // update their card if the on-file one has expired. For the 7-day
  // reminder in the product spec, add a daily cron that queries
  // vendors/experts where trial_end is 7 days away and calls
  // sendTrialEndingReminder directly.
  if (event.type === "customer.subscription.trial_will_end") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const audience = (sub.metadata?.audience ?? "") as string;

    const trialEnd = sub.trial_end
      ? new Date(sub.trial_end * 1000)
      : sub.items.data[0]?.current_period_end
        ? new Date(sub.items.data[0].current_period_end * 1000)
        : new Date();
    const daysLeft = Math.max(
      1,
      Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );

    if (audience === "vendor") {
      const { data: vendor } = await sb
        .from("vendors")
        .select("id, contact_name, contact_email, billing_email")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (vendor) {
        void sendTrialEndingReminder({
          role: "partner",
          to: vendor.billing_email ?? vendor.contact_email,
          contactName: vendor.contact_name ?? "there",
          daysLeft,
          trialEndDate: trialEnd,
          portalUrl: `${appOrigin()}/vendor/account`,
        });
      }
      return null;
    }
    if (audience === "expert") {
      const { data: expert } = await sb
        .from("experts")
        .select("id, full_name, email")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (expert) {
        void sendTrialEndingReminder({
          role: "expert",
          to: expert.email,
          contactName: expert.full_name ?? "there",
          daysLeft,
          trialEndDate: trialEnd,
          portalUrl: `${appOrigin()}/expert/billing`,
        });
      }
      return null;
    }
    return null;
  }

  // ---- invoice.paid / invoice.payment_failed ------------------------
  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId =
      typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
    if (!customerId) return null;
    const memberId = await memberIdForCustomer(sb, customerId);
    if (!memberId) return null;

    if (event.type === "invoice.payment_failed") {
      await sb.from("members").update({ subscription_status: "past_due" }).eq("id", memberId);
    }
    // invoice.paid is a confirmation; subscription.updated also fires
    // and carries the canonical state, so we don't double-write here.
    return memberId;
  }

  return null;
}

