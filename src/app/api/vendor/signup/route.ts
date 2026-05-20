import { NextResponse } from "next/server";
import { buildVendorMagicLink } from "@/lib/auth/magicToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Open-portal phase: Clerk was removed. Vendor signups are accepted, logged to
// the server console, and a magic sign-in link is generated for the contact
// email. The link is logged (and emailed if the SMTP transport env vars exist)
// so the previewer can click straight into the partner portal. The real path
// (persist application → queue for team review → email onboarding link) is
// wired in a later step.

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (
    !body.companyName ||
    !body.contactEmail ||
    !body.agreedToTerms ||
    !body.confirmedAuthority
  ) {
    return NextResponse.json(
      { error: "Both agreement checkboxes must be confirmed before submitting." },
      { status: 400 },
    );
  }

  const application = {
    submitted_at: new Date().toISOString(),
    company: body.companyName,
    category: body.category,
    website: body.website,
    plan_id: body.planId,
    contact_name: body.contactName,
    contact_email: body.contactEmail,
    contact_phone: body.contactPhone ?? "",
    hotline_email: body.hotlineEmail ?? body.contactEmail,
    calendar_link: body.calendarLink ?? "",
    signature_name: body.signatureName,
    signature_title: body.signatureTitle,
    agreement_version: "v1.0",
    offer_draft: {
      title: body.offerTitle,
      discount: body.offerDiscount,
      mechanic: body.offerMechanic,
      code: body.offerCode,
      terms: body.offerTerms,
    },
  };

  console.log("[vendor:signup] application received", application);

  const email = String(body.contactEmail).trim().toLowerCase();
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = buildVendorMagicLink(origin, email);
  console.log(`[vendor:signup:magic-link] for ${email} → ${link}`);

  try {
    const mailer = await import("@/lib/waitlist/confirmationEmail");
    const sender = (mailer as { sendVendorMagicLinkEmail?: (a: { email: string; link: string }) => Promise<unknown> })
      .sendVendorMagicLinkEmail;
    if (typeof sender === "function") {
      await sender({ email, link });
    }
  } catch {
    // No-op: preview mode tolerates missing transport.
  }

  return NextResponse.json({
    success: true,
    status: "pending_review",
    message: "Application received. We sent a sign-in link to your email — click it to access your partner portal.",
  });
}
