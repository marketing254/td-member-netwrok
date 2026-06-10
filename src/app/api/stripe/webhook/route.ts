import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { applySubscriptionToMember, memberIdForCustomer } from "@/lib/billing";

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
  // created subscription and write the full shape onto the member row.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const memberId = (session.metadata?.member_id ?? null) as string | null;
    if (!memberId || !session.subscription) return memberId;

    const subId =
      typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId, {
      expand: ["default_payment_method", "items.data.price"],
    });

    await applySubscriptionToMember(sb, memberId, sub);
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

    await applySubscriptionToMember(sb, memberId, hydrated);
    return memberId;
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

