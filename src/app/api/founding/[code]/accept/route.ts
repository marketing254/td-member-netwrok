import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  getStripe,
  appOrigin,
  expertPriceIdFor,
  partnerPriceIdFor,
} from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { renderAgreementPdf } from "@/lib/pdf/agreementPdf";
import { sendJoinConfirmationEmail } from "@/lib/email/joinConfirmation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRIAL_DAYS = 180;

type Body = { setupIntentId?: string; paymentMethodId?: string };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() ?? "0.0.0.0";
}
function hashIp(ip: string): string {
  const salt = process.env.SIGNUP_IP_SALT ?? "dmn-fixed-dev-salt";
  return crypto.createHash("sha256").update(`${salt}::${ip}`).digest("hex");
}

/**
 * POST /api/founding/[code]/accept
 *
 * Completes a founding invite: verifies the saved card, provisions the
 * expert and/or vendor row(s) + auth user, creates the trial
 * subscription, records the acceptance (who / version / when / IP),
 * regenerates the signed PDF, emails it, and marks the invite accepted.
 */
export async function POST(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Body;
  const setupIntentId = (body.setupIntentId ?? "").trim();
  const paymentMethodId = (body.paymentMethodId ?? "").trim();
  if (!code || !setupIntentId || !paymentMethodId) {
    return NextResponse.json({ error: "Missing references." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data: invite } = await sb
    .from("founding_invites")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  if (invite.status === "accepted") {
    return NextResponse.json({ error: "Already accepted." }, { status: 409 });
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This invite has expired." }, { status: 410 });
  }
  if (!invite.stripe_customer_id) {
    return NextResponse.json({ error: "Payment not set up. Refresh and retry." }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe unavailable." },
      { status: 503 },
    );
  }

  // Verify the SetupIntent belongs to this invite's customer.
  const si = await stripe.setupIntents.retrieve(setupIntentId);
  if (
    si.status !== "succeeded" ||
    typeof si.customer !== "string" ||
    si.customer !== invite.stripe_customer_id ||
    si.payment_method !== paymentMethodId
  ) {
    return NextResponse.json({ error: "Payment setup didn't complete." }, { status: 400 });
  }

  const customerId = invite.stripe_customer_id;
  try {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  } catch {
    /* already attached */
  }
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  const wantsExpert = invite.role === "expert" || invite.role === "both";
  const wantsPartner = invite.role === "partner" || invite.role === "both";
  const email = invite.email.toLowerCase();
  const signedAt = new Date();
  const ipHash = hashIp(clientIp(req));
  const userAgent = req.headers.get("user-agent") ?? null;

  // Card details for the portal.
  let cardBrand: string | null = null;
  let cardLast4: string | null = null;
  try {
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
    cardBrand = pm.card?.brand ?? null;
    cardLast4 = pm.card?.last4 ?? null;
  } catch {
    /* best effort */
  }

  // Create ONE subscription. For both-role, a single fee covers both —
  // we bill on the expert price and mark both rows active. (Expert +
  // partner price are the same $49 ramp, so either works; expert chosen
  // for the "both" case.)
  let priceId: string;
  try {
    priceId = wantsExpert ? expertPriceIdFor("expert_growth_monthly") : partnerPriceIdFor("partner_growth_monthly");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe price missing." },
      { status: 503 },
    );
  }

  let subscription;
  try {
    subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: TRIAL_DAYS,
      default_payment_method: paymentMethodId,
      trial_settings: { end_behavior: { missing_payment_method: "pause" } },
      metadata: { founding_invite: code, role: invite.role },
      expand: ["latest_invoice"],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? `Stripe rejected the subscription: ${err.message}` : "Stripe error" },
      { status: 502 },
    );
  }
  const periodEnd =
    typeof subscription.items.data[0]?.current_period_end === "number"
      ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
      : null;

  // Pre-create the auth user so they can log into the portal later.
  try {
    await sb.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { user_type: invite.role, invited_founding: true },
    });
  } catch {
    /* already exists */
  }

  const subFields = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    subscription_status: subscription.status,
    subscription_interval: "month",
    current_period_end: periodEnd,
    card_brand: cardBrand,
    card_last4: cardLast4,
    agreement_signed_at: signedAt.toISOString(),
    agreement_version: invite.agreement_version,
    agreement_ip_hash: ipHash,
    agreement_user_agent: userAgent,
  };

  let expertId: string | null = null;
  let vendorId: string | null = null;

  if (wantsExpert) {
    const { data: existing } = await sb.from("experts").select("id").eq("email", email).maybeSingle();
    if (existing) {
      expertId = existing.id;
      await sb
        .from("experts")
        .update({ ...subFields, status: "active", founding_expert_locked: true } as never)
        .eq("id", expertId);
    } else {
      const { data: ins } = await sb
        .from("experts")
        .insert({
          email,
          full_name: invite.full_name,
          display_name: invite.full_name,
          specialty: invite.company_name ?? "Founding expert",
          status: "active",
          months_in_program: 0,
          founding_expert_locked: true,
          ...subFields,
        } as never)
        .select("id")
        .single();
      expertId = ins?.id ?? null;
    }
  }

  if (wantsPartner) {
    const { data: existing } = await sb
      .from("vendors")
      .select("id")
      .eq("contact_email", email)
      .maybeSingle();
    if (existing) {
      vendorId = existing.id;
      await sb
        .from("vendors")
        .update({ ...subFields, status: "approved", verified: true, founding_partner_locked: true } as never)
        .eq("id", vendorId);
    } else {
      const { data: ins } = await sb
        .from("vendors")
        .insert({
          company_name: invite.company_name ?? invite.full_name,
          display_name: invite.company_name ?? invite.full_name,
          contact_name: invite.full_name,
          contact_email: email,
          billing_email: email,
          plan_id: "founding",
          status: "approved",
          verified: true,
          months_in_program: 0,
          founding_partner_locked: true,
          ...subFields,
        } as never)
        .select("id")
        .single();
      vendorId = ins?.id ?? null;
    }
  }

  // Regenerate the signed PDF (with the acceptance record filled).
  let signedPdf: Buffer | null = null;
  try {
    signedPdf = await renderAgreementPdf({
      role: invite.role,
      agreementVersion: invite.agreement_version,
      signer: { name: invite.full_name, email, companyName: invite.company_name },
      memberOffer: invite.member_offer,
      signedAt,
      ipHashLast6: ipHash.slice(-6),
      accepted: true,
    });
    const signedPath = `founding/${code}-signed.pdf`;
    await sb.storage
      .from("agreements")
      .upload(signedPath, signedPdf, { contentType: "application/pdf", upsert: true });
  } catch (err) {
    console.error("[founding:accept] signed PDF failed", err);
  }

  // Mark the invite accepted.
  await sb
    .from("founding_invites")
    .update({
      status: "accepted",
      accepted_at: signedAt.toISOString(),
      accepted_ip_hash: ipHash,
      accepted_user_agent: userAgent,
      stripe_subscription_id: subscription.id,
      expert_id: expertId,
      vendor_id: vendorId,
    } as never)
    .eq("id", invite.id);

  // Send a magic-link so they can jump into the portal immediately, and
  // the confirmation email with the signed PDF.
  try {
    const origin = appOrigin();
    const next = wantsExpert ? "/expert" : "/vendor";
    const role = wantsExpert ? "expert" : "vendor";
    const cookieClient = await createServerSupabase();
    await cookieClient.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${next}&role=${role}`, shouldCreateUser: false },
    });
  } catch (err) {
    console.error("[founding:accept] magic-link failed", err);
  }
  if (signedPdf) {
    void sendJoinConfirmationEmail({
      role: wantsPartner && !wantsExpert ? "partner" : "expert",
      to: email,
      contactName: invite.full_name,
      companyName: invite.company_name,
      pdfBuffer: signedPdf,
      pdfFilename: `DMN-Founding-Agreement-${invite.agreement_version}.pdf`,
      portalUrl: `${appOrigin()}${wantsExpert ? "/expert/login" : "/vendor/login"}`,
      agreementVersion: invite.agreement_version,
    });
  }

  const next = wantsExpert ? "/expert/login" : "/vendor/login";
  return NextResponse.json({ ok: true, next });
}
