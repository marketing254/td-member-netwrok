import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/guards";
import {
  appOrigin,
  billingIntervalFor,
  getStripe,
  isFoundingPlan,
  priceIdFor,
  type SubscriptionPlanKey,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/checkout
 *
 * Body: { plan: "founding_monthly" | "founding_annual" | "standard_monthly" }
 *
 * Creates a Stripe Checkout Session for a subscription and returns the
 * redirect URL. The actual subscription state lives in Stripe — we just
 * mirror it via the /api/stripe/webhook endpoint once the customer pays.
 *
 * Founding-tier checkouts include `metadata.founding_member = "true"` on
 * the subscription so the webhook can lock the member into the founding
 * grandfathered rate.
 */
const VALID_PLANS: SubscriptionPlanKey[] = [
  "founding_monthly",
  "founding_annual",
  "standard_monthly",
];

function isValidPlan(p: unknown): p is SubscriptionPlanKey {
  return typeof p === "string" && (VALID_PLANS as string[]).includes(p);
}

export async function POST(req: Request) {
  const guard = await requireMember();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as { plan?: unknown };
  if (!isValidPlan(body.plan)) {
    return NextResponse.json(
      { error: `Invalid plan. Use one of: ${VALID_PLANS.join(", ")}` },
      { status: 400 },
    );
  }
  const plan = body.plan;

  const sb = getSupabaseAdmin();

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
  const founding = isFoundingPlan(plan);

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
        founding_member: founding ? "true" : "false",
      },
    },
    metadata: {
      member_id: member.id,
      plan,
    },
    success_url: `${origin}/dashboard?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard?subscribed=0`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe didn't return a session URL." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
