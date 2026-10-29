import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireExpert } from "@/lib/auth/guards";
import { hasSignedFoundingAgreement } from "@/lib/billing/agreementState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/expert/billing/trial/prepare
 *
 * Mirror of /api/vendor/billing/trial/prepare for the expert bench.
 */
export async function POST() {
  const guard = await requireExpert();
  if (!guard.ok) return guard.response;

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe is not configured." },
      { status: 503 },
    );
  }

  const sb = getSupabaseAdmin();
  const { data: expert } = await sb
    .from("experts")
    .select("id, email, full_name, stripe_customer_id, stripe_subscription_id, subscription_status, agreement_signed_at, agreement_version")
    .eq("id", guard.expertId)
    .maybeSingle();
  if (!expert) {
    return NextResponse.json({ error: "Expert not found." }, { status: 404 });
  }
  if (
    expert.stripe_subscription_id &&
    (expert.subscription_status === "active" || expert.subscription_status === "trialing")
  ) {
    return NextResponse.json(
      { error: "You already have an active subscription." },
      { status: 409 },
    );
  }

  let customerId = expert.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: expert.email,
      name: expert.full_name || undefined,
      metadata: { audience: "expert", expert_id: expert.id },
    });
    customerId = customer.id;
    await sb
      .from("experts")
      .update({ stripe_customer_id: customerId } as never)
      .eq("id", expert.id);
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session",
    metadata: { audience: "expert", expert_id: expert.id, purpose: "trial_start" },
  });
  if (!setupIntent.client_secret) {
    return NextResponse.json(
      { error: "Stripe didn't return a client secret. Try again." },
      { status: 500 },
    );
  }

  // The v4 agreement, rendered for this expert (combined Expert + Partner
  // when the same email also holds a company). Someone who already signed
  // on the founding accept page is told so, and the card skips the
  // agreement step entirely.
  const agreementSigned = await hasSignedFoundingAgreement(sb, { expertId: expert.id }, expert);
  return NextResponse.json({ clientSecret: setupIntent.client_secret, agreementHref: "/api/expert/agreement/pdf", agreementSigned });
}
