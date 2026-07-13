import { NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  getStripe,
  appOrigin,
  partnerPriceIdFor,
} from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { renderFoundingAgreementPdf } from "@/lib/pdf/foundingAgreementPdf";
import { sendJoinConfirmationEmail } from "@/lib/email/joinConfirmation";
import { notifyTeamEvent } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRIAL_DAYS = 180;

// Founding billing anchor. The founding ramp is a fixed-date schedule tied
// to the Aug 1, 2026 launch: 6 months free → $49/mo → $199/mo, the same for
// every founding partner regardless of when they accept (the "clock anchors
// to launch" rule). Verify/adjust these two dates if the launch shifts.
//   • Free ($0)      : acceptance → FOUNDING_TRIAL_END_ISO
//   • Growth ($49/mo): FOUNDING_TRIAL_END_ISO → FOUNDING_STANDARD_START_ISO
//   • Standard ($199): FOUNDING_STANDARD_START_ISO onward
const FOUNDING_TRIAL_END_ISO = "2027-02-01T00:00:00Z";
const FOUNDING_STANDARD_START_ISO = "2027-08-01T00:00:00Z";

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
  if (!code) {
    return NextResponse.json({ error: "Missing invite code." }, { status: 400 });
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
  if (invite.status === "draft") {
    return NextResponse.json({ error: "This invite has not been sent yet." }, { status: 404 });
  }
  if (invite.status === "revoked") {
    return NextResponse.json({ error: "This invite has been revoked." }, { status: 410 });
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "This invite has expired." }, { status: 410 });
  }

  const wantsExpert = invite.role === "expert" || invite.role === "both";
  const wantsPartner = invite.role === "partner" || invite.role === "both";
  if (wantsPartner && (!setupIntentId || !paymentMethodId)) {
    return NextResponse.json({ error: "Missing payment references." }, { status: 400 });
  }
  if (wantsPartner && !invite.stripe_customer_id) {
    return NextResponse.json({ error: "Payment not set up. Refresh and retry." }, { status: 400 });
  }

  const email = invite.email.toLowerCase();
  const signerName = invite.signer_name || invite.full_name;
  const signedAt = new Date();
  const ipHash = hashIp(clientIp(req));
  const userAgent = req.headers.get("user-agent") ?? null;

  let customerId: string | null = null;
  let priceId: string | null = null;
  let subscriptionId: string | null = null;
  let subscriptionStatus: string | null = null;
  let periodEnd: string | null = null;

  // Card details for the portal.
  let cardBrand: string | null = null;
  let cardLast4: string | null = null;
  if (wantsPartner) {
    let stripe;
    try {
      stripe = getStripe();
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Stripe unavailable." },
        { status: 503 },
      );
    }

    const si = await stripe.setupIntents.retrieve(setupIntentId);
    if (
      si.status !== "succeeded" ||
      typeof si.customer !== "string" ||
      si.customer !== invite.stripe_customer_id ||
      si.payment_method !== paymentMethodId
    ) {
      return NextResponse.json({ error: "Payment setup didn't complete." }, { status: 400 });
    }

    customerId = invite.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json({ error: "Payment not set up. Refresh and retry." }, { status: 400 });
    }
    try {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } catch {
      /* already attached */
    }
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    try {
      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      cardBrand = pm.card?.brand ?? null;
      cardLast4 = pm.card?.last4 ?? null;
    } catch {
      /* best effort */
    }

    // Partner-bearing invites keep ONE Stripe subscription for the paid
    // partner ramp. Expert-only founding invites do not enter Stripe.
    // The ramp is a phased subscription schedule so month 13 steps up to
    // $199 on its own: $0 (trial) → $49 growth → $199 standard.
    let growthPrice: string;
    let standardPrice: string;
    try {
      growthPrice = partnerPriceIdFor("partner_growth_monthly");
      standardPrice = partnerPriceIdFor("partner_standard_monthly");
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Stripe price missing." },
        { status: 503 },
      );
    }
    priceId = growthPrice; // stored as the "current" price on the row

    const nowSec = Math.floor(Date.now() / 1000);
    const trialEndSec = Math.floor(new Date(FOUNDING_TRIAL_END_ISO).getTime() / 1000);
    const standardStartSec = Math.floor(new Date(FOUNDING_STANDARD_START_ISO).getTime() / 1000);
    const canSchedule = trialEndSec > nowSec && standardStartSec > trialEndSec;

    let subscription;
    try {
      if (canSchedule) {
        // Fixed-date founding ramp.
        const schedule = await stripe.subscriptionSchedules.create({
          customer: customerId,
          start_date: nowSec,
          end_behavior: "release",
          default_settings: {
            default_payment_method: paymentMethodId,
            collection_method: "charge_automatically",
          },
          phases: [
            // $0 until the free period ends (card on file, no charge).
            { items: [{ price: growthPrice }], trial: true, end_date: trialEndSec },
            // $49/mo growth phase (months 7–12).
            { items: [{ price: growthPrice }], end_date: standardStartSec },
            // $199/mo standard, month 13 onward (open-ended).
            { items: [{ price: standardPrice }] },
          ],
          metadata: { founding_invite: code, role: invite.role },
        });
        const subId =
          typeof schedule.subscription === "string"
            ? schedule.subscription
            : schedule.subscription?.id;
        if (!subId) throw new Error("Schedule did not create a subscription.");
        subscription = await stripe.subscriptions.retrieve(subId);
      } else {
        // Safety fallback (only if the anchor dates have already passed):
        // a simple 180-day trial on the growth price so acceptance never
        // breaks. The $199 step can be scheduled manually if this fires.
        subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: growthPrice }],
          trial_period_days: TRIAL_DAYS,
          default_payment_method: paymentMethodId,
          trial_settings: { end_behavior: { missing_payment_method: "pause" } },
          metadata: { founding_invite: code, role: invite.role, ramp: "fallback-no-schedule" },
        });
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? `Stripe rejected the subscription: ${err.message}` : "Stripe error" },
        { status: 502 },
      );
    }
    subscriptionId = subscription.id;
    subscriptionStatus = subscription.status;
    periodEnd =
      typeof subscription.items.data[0]?.current_period_end === "number"
        ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
        : null;
  }

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

  const agreementFields = {
    agreement_signed_at: signedAt.toISOString(),
    agreement_version: invite.agreement_version,
    agreement_ip_hash: ipHash,
    agreement_user_agent: userAgent,
  };
  const billingFields = wantsPartner
    ? {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        subscription_status: subscriptionStatus,
        subscription_interval: "month",
        current_period_end: periodEnd,
        card_brand: cardBrand,
        card_last4: cardLast4,
      }
    : {};
  const subFields = { ...agreementFields, ...billingFields };

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
          specialty: invite.description ?? invite.company_name ?? "Founding expert",
          company_name: invite.company_name ?? null,
          phone: invite.phone ?? null,
          website: invite.website ?? null,
          booking_link: invite.calendar_link ?? null,
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
          contact_phone: invite.phone ?? null,
          billing_email: email,
          category: invite.category ?? null,
          website: invite.website ?? null,
          description: invite.description ?? null,
          calendar_link: invite.calendar_link ?? null,
          hotline_email: email,
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

  // Fan out the EXTRA companies (companies[1..]) into covered listings under
  // the principal partner. One fee already covers them; each is created as a
  // draft (pending_review) for the team to publish. companies[0] is the
  // principal created above.
  if (wantsPartner && vendorId && Array.isArray(invite.companies) && invite.companies.length > 1) {
    const emailLocal = email.split("@")[0] ?? "partner";
    const emailDomain = email.split("@")[1] ?? "example.com";
    const extras = invite.companies.slice(1);
    for (let i = 0; i < extras.length; i++) {
      const c = extras[i];
      const name = (c?.name ?? "").trim();
      if (!name) continue;
      // Each covered company needs its own contact email. Use the provided
      // one; otherwise a plus-addressed alias of the principal keeps it
      // unique and still deliverable to them.
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20) || `co${i + 2}`;
      const cEmail = c.contact_email?.trim().toLowerCase() || `${emailLocal}+${slug}@${emailDomain}`;
      // eslint-disable-next-line no-await-in-loop
      const { data: dup } = await sb.from("vendors").select("id").eq("contact_email", cEmail).maybeSingle();
      if (dup) continue;
      // eslint-disable-next-line no-await-in-loop
      await sb.from("vendors").insert({
        company_name: name,
        display_name: name,
        contact_name: invite.full_name,
        contact_email: cEmail,
        billing_email: email,
        category: c.category ?? null,
        website: c.website ?? null,
        description: c.description ?? null,
        calendar_link: c.calendar_link ?? null,
        plan_id: "covered",
        billing_parent_id: vendorId,
        status: "pending_review",
        verified: false,
        months_in_program: 0,
      } as never);
    }
  }

  // Regenerate the signed PDF (with the acceptance record filled).
  let signedPdf: Buffer | null = null;
  let signedPath: string | null = null;
  try {
    signedPdf = await renderFoundingAgreementPdf({
      role: invite.role,
      signer: { name: signerName, email, companyName: invite.company_name },
      companies: invite.companies ?? undefined,
      memberOffer: invite.member_offer,
      signedAt,
      ipHashLast6: ipHash.slice(-6),
      accepted: true,
    });
    signedPath = `founding/${code}-signed.pdf`;
    await sb.storage
      .from("agreements")
      .upload(signedPath, signedPdf, { contentType: "application/pdf", upsert: true });
    if (expertId) {
      await sb.from("experts").update({ agreement_pdf_path: signedPath } as never).eq("id", expertId);
    }
    if (vendorId) {
      await sb.from("vendors").update({ agreement_pdf_path: signedPath } as never).eq("id", vendorId);
    }
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
      stripe_subscription_id: subscriptionId,
      agreement_pdf_path: signedPath ?? invite.agreement_pdf_path,
      expert_id: expertId,
      vendor_id: vendorId,
    } as never)
    .eq("id", invite.id);

  // No code or magic-link is sent here. The confirmation email below tells
  // them to check their inbox and sign in; the portal login screen is what
  // sends the 6-digit code, only once they submit their email there.
  if (signedPdf) {
    void sendJoinConfirmationEmail({
      role: invite.role,
      to: email,
      contactName: signerName,
      companyName: invite.company_name,
      pdfBuffer: signedPdf,
      pdfFilename: `DMN-Founding-Agreement-${invite.agreement_version}.pdf`,
      portalUrl: `${appOrigin()}${wantsExpert ? "/expert/login" : "/vendor/login"}`,
      agreementVersion: invite.agreement_version,
      signedAt,
      memberOffer: invite.member_offer,
      companies: invite.companies ?? undefined,
      trialEndsAt: periodEnd,
      cardCaptured: invite.role === "partner" || invite.role === "both",
    });
  }

  // Alert the whole team that the invitee accepted + saved their card so
  // they know this person is ready to sign in.
  const cardCaptured = invite.role === "partner" || invite.role === "both";
  const trialEndsNice = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;
  void notifyTeamEvent({
    kind: "invite_accepted",
    role: invite.role,
    name: signerName,
    email,
    adminLink: "https://dentalmembernetwork.com/admin/founding",
    highlight: cardCaptured
      ? "Card on file — they're ready to sign in."
      : "Accepted — they're ready to sign in.",
    fields: [
      { label: "Role", value: invite.role === "both" ? "Expert + Partner" : invite.role },
      { label: "Company", value: invite.company_name },
      { label: "Payment method", value: cardCaptured ? "On file" : null },
      { label: "Subscription", value: subscriptionStatus },
      { label: "Free trial ends", value: trialEndsNice },
      { label: "Member offer", value: invite.member_offer },
    ],
  });

  const loginPath = wantsExpert ? "/expert/login" : "/vendor/login";
  const next = `${loginPath}?welcome=1&prefill=${encodeURIComponent(email)}`;
  return NextResponse.json({ ok: true, next });
}
