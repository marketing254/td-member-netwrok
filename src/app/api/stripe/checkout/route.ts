import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/guards";
import {
  ALL_PLAN_KEYS,
  appOrigin,
  billingIntervalFor,
  EARLY_MEMBER_CAP,
  FOUNDING_MEMBER_CAP,
  getStripe,
  isEarlyPlan,
  isFoundingPlan,
  priceIdFor,
  tierForPlan,
  type SubscriptionPlanKey,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/checkout
 *
 * Body: { plan: "founding_monthly" | "founding_annual" | "standard_monthly" | "standard_annual" }
 *
 * Creates a Stripe Checkout Session for a subscription and returns the
 * redirect URL. The actual subscription state lives in Stripe — we just
 * mirror it via the /api/stripe/webhook endpoint once the customer pays.
 *
 * Founding-tier checkouts include `metadata.founding_member = "true"` on
 * the subscription so the webhook can lock the member into the founding
 * grandfathered rate.
 */
function isValidPlan(p: unknown): p is SubscriptionPlanKey {
  return typeof p === "string" && (ALL_PLAN_KEYS as string[]).includes(p);
}

export async function POST(req: Request) {
  const guard = await requireMember();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as { plan?: unknown };
  if (!isValidPlan(body.plan)) {
    return NextResponse.json(
      { error: `Invalid plan. Use one of: ${ALL_PLAN_KEYS.join(", ")}` },
      { status: 400 },
    );
  }
  const plan = body.plan;

  const sb = getSupabaseAdmin();

  // Tier caps — Founding (100) and Early (400) are LIFETIME. Cancellations
  // do NOT free a seat. We count the {tier}_member_locked boolean which is
  // set on first successful checkout and never reset.
  if (isFoundingPlan(plan) || isEarlyPlan(plan)) {
    const tier = tierForPlan(plan); // "founding" | "early"
    const column = tier === "founding" ? "founding_member_locked" : "early_member_locked";
    const cap = tier === "founding" ? FOUNDING_MEMBER_CAP : EARLY_MEMBER_CAP;

    const { count, error: countErr } = await sb
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq(column, true);
    if (countErr) {
      return NextResponse.json(
        { error: `Could not verify ${tier} availability. Please try again.` },
        { status: 500 },
      );
    }
    if ((count ?? 0) >= cap) {
      const msg =
        tier === "founding"
          ? "Founding seats are sold out — all 100 spots are taken. Early Member or Standard membership is still available."
          : "Early Member seats are sold out — all 400 spots are taken. Standard membership is still available.";
      return NextResponse.json(
        { error: msg, tierSoldOut: tier },
        { status: 409 },
      );
    }
  }

  // Pull the latest member row to see if they already have a Stripe customer/sub.
  const { data: member, error: memErr } = await sb
    .from("members")
    .select(
      "id, email, first_name, last_name, stripe_customer_id, stripe_subscription_id, subscription_status, founding_member_locked",
    )
    .eq("id", guard.memberId)
    .single();

  if (memErr || !member) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }

  // If they already have an active subscription, don't double-charge — send
  // them to the Customer Portal instead.
  if (
    member.stripe_subscription_id &&
    (member.subscription_status === "active" || member.subscription_status === "trialing")
  ) {
    return NextResponse.json(
      {
        error: "You already have an active subscription.",
        redirectTo: "/api/stripe/portal",
      },
      { status: 409 },
    );
  }

  let stripe;
  let priceId: string;
  try {
    stripe = getStripe();
    priceId = priceIdFor(plan);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe is not configured." },
      { status: 503 },
    );
  }

  // Create or reuse the Stripe Customer for this member. Storing the
  // customer_id back in our DB means we never create duplicates.
  let customerId = member.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: member.email,
      name: [member.first_name, member.last_name].filter(Boolean).join(" ") || undefined,
      metadata: { member_id: member.id },
    });
    customerId = customer.id;
    await sb.from("members").update({ stripe_customer_id: customerId }).eq("id", member.id);
  }

  const origin = appOrigin();
  const tier = tierForPlan(plan);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    subscription_data: {
      metadata: {
        member_id: member.id,
        plan,
        billing_interval: billingIntervalFor(plan),
        tier,
        founding_member: isFoundingPlan(plan) ? "true" : "false",
        early_member: isEarlyPlan(plan) ? "true" : "false",
      },
    },
    metadata: {
      member_id: member.id,
      plan,
      tier,
    },
    success_url: `${origin}/upgrade?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/upgrade?subscribed=0`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe didn't return a session URL." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
