import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";

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

async function memberIdForCustomer(
  sb: ReturnType<typeof getSupabaseAdmin>,
  customerId: string,
  fallbackMemberId?: string | null,
): Promise<string | null> {
  const { data } = await sb
    .from("members")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? fallbackMemberId ?? null;
}

/**
 * Write the full subscription shadow onto the member row. Handles the
 * founding-lock invariant: once true, never flips back.
 */
async function applySubscriptionToMember(
  sb: ReturnType<typeof getSupabaseAdmin>,
  memberId: string,
  sub: Stripe.Subscription,
) {
  const firstItem = sub.items.data[0];
  const price = firstItem?.price;
  const status = sub.status;
  // In API version 2025-03-31+ the period fields moved from the
  // subscription onto each subscription item. We use the first item's
  // period end since DMN subscriptions only ever have one item.
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : null;
  const canceledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null;
  const cancelAtPeriodEnd = !!sub.cancel_at_period_end;
  const interval = price?.recurring?.interval ?? null;
  const isFoundingMeta = sub.metadata?.founding_member === "true";

  // Card metadata — only available if default_payment_method is a Card.
  let cardBrand: string | null = null;
  let cardLast4: string | null = null;
  if (sub.default_payment_method && typeof sub.default_payment_method !== "string") {
    const pm = sub.default_payment_method;
    if (pm.card) {
      cardBrand = pm.card.brand ?? null;
      cardLast4 = pm.card.last4 ?? null;
    }
  }

  // Read the current member row so we never undo the founding lock.
  const { data: current } = await sb
    .from("members")
    .select("founding_member_locked, tier")
    .eq("id", memberId)
    .single();

  // Typed patch shape — keeps supabase-js happy without an unsafe cast.
  type MemberPatch = {
    stripe_subscription_id?: string | null;
    stripe_price_id?: string | null;
    subscription_status?: string | null;
    subscription_interval?: string | null;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
    canceled_at?: string | null;
    card_brand?: string | null;
    card_last4?: string | null;
    founding_member_locked?: boolean;
    tier?: string;
    status?: "waitlist" | "invited" | "active" | "paused" | "churned";
  };

  const patch: MemberPatch = {
    stripe_subscription_id: sub.id,
    stripe_price_id: price?.id ?? null,
    subscription_status: status,
    subscription_interval: interval,
    current_period_end: periodEnd,
    cancel_at_period_end: cancelAtPeriodEnd,
    canceled_at: canceledAt,
    card_brand: cardBrand,
    card_last4: cardLast4,
  };

  // First time we see a founding subscription, lock it in.
  if (isFoundingMeta && !current?.founding_member_locked) {
    patch.founding_member_locked = true;
    if (current?.tier !== "founding") patch.tier = "founding";
  }

  // Active payments also implicitly activate the member account so they
  // can see resources (in case admin pre-activation didn't fire).
  if (status === "active" || status === "trialing") {
    patch.status = "active";
  }

  await sb.from("members").update(patch).eq("id", memberId);
}
