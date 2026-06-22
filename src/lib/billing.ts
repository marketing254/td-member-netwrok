import type Stripe from "stripe";
import type { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Shared subscription-sync helpers used by both:
 *
 *   - /api/stripe/webhook   (authoritative path — fires on every event)
 *   - /api/member/billing/sync   (manual recovery path — used when the
 *                                  webhook didn't fire for any reason)
 *
 * Anything that mirrors Stripe state onto the members row should live
 * here so the two paths never drift.
 */

type SupabaseClient = ReturnType<typeof getSupabaseAdmin>;

/**
 * Look up the member id for a Stripe customer id. Falls back to a
 * member_id passed via subscription metadata if we haven't yet stored
 * the mapping (this can happen if checkout finished but the webhook
 * raced ahead of the customer-id update from the checkout handler).
 */
export async function memberIdForCustomer(
  sb: SupabaseClient,
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
 * Write the full subscription shadow onto the members row. Idempotent —
 * safe to call repeatedly. Handles the founding-lock invariant so we
 * never undo a member's locked rate.
 */
export async function applySubscriptionToMember(
  sb: SupabaseClient,
  memberId: string,
  sub: Stripe.Subscription,
): Promise<void> {
  const firstItem = sub.items.data[0];
  const price = firstItem?.price;
  const status = sub.status;
  // In API version 2025-03-31+ the period fields live on each
  // subscription item. DMN subs only ever have a single item.
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : null;
  const canceledAt = sub.canceled_at
    ? new Date(sub.canceled_at * 1000).toISOString()
    : null;
  const cancelAtPeriodEnd = !!sub.cancel_at_period_end;
  const interval = price?.recurring?.interval ?? null;
  const isFoundingMeta = sub.metadata?.founding_member === "true";
  const isEarlyMeta = sub.metadata?.early_member === "true";
  // Fall back to subscription.metadata.tier if the boolean flags are missing
  // (older sessions or manual Stripe edits). `tier` is also written by the
  // checkout route for every new sub.
  const tierMeta = (sub.metadata?.tier as "founding" | "early" | "standard" | undefined) ?? null;

  // Card metadata — only available if default_payment_method is expanded
  // to a Card payment method.
  let cardBrand: string | null = null;
  let cardLast4: string | null = null;
  if (sub.default_payment_method && typeof sub.default_payment_method !== "string") {
    const pm = sub.default_payment_method;
    if (pm.card) {
      cardBrand = pm.card.brand ?? null;
      cardLast4 = pm.card.last4 ?? null;
    }
  }

  const { data: current } = await sb
    .from("members")
    .select("founding_member_locked, early_member_locked, tier")
    .eq("id", memberId)
    .single();

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
    early_member_locked?: boolean;
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

  // Lock the tier on first successful sub. Once locked, never reset — that's
  // the cancellation-doesn't-free-a-seat invariant. tierMeta is the
  // ground truth from checkout (it's set on every new session).
  if ((isFoundingMeta || tierMeta === "founding") && !current?.founding_member_locked) {
    patch.founding_member_locked = true;
    if (current?.tier !== "founding") patch.tier = "founding";
  } else if ((isEarlyMeta || tierMeta === "early") && !current?.early_member_locked) {
    patch.early_member_locked = true;
    if (current?.tier !== "early" && current?.tier !== "founding") patch.tier = "early";
  } else if (tierMeta === "standard" && !current?.tier) {
    patch.tier = "standard";
  }

  if (status === "active" || status === "trialing") {
    patch.status = "active";
  }

  await sb.from("members").update(patch).eq("id", memberId);
}
