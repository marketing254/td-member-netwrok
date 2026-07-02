import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { renderAgreementPdf } from "@/lib/pdf/agreementPdf";
import { sendJoinConfirmationEmail } from "@/lib/email/joinConfirmation";
import { appOrigin } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/join/partner/apply
 *
 * Public partner application. Inserts a vendors row in `pending_review`
 * status with the agreement acceptance stamped on it, renders the
 * signed agreement PDF, uploads it to storage, and emails a copy back
 * to the applicant. No Stripe involved — the card is captured later,
 * inside the portal, after the team approves and the vendor signs in.
 */
type Body = {
  contactName?: string;
  contactEmail?: string;
  companyName?: string;
  agreementVersion?: string;
};

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() ?? "0.0.0.0";
}

function hashIp(ip: string): string {
  const salt = process.env.SIGNUP_IP_SALT ?? "dmn-fixed-dev-salt";
  return crypto.createHash("sha256").update(`${salt}::${ip}`).digest("hex");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const name = (body.contactName ?? "").trim();
  const email = (body.contactEmail ?? "").trim().toLowerCase();
  const company = (body.companyName ?? "").trim();
  const agreementVersion = (body.agreementVersion ?? "").trim() || "v1";

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!company || company.length < 2) {
    return NextResponse.json({ error: "Enter your company." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const signedAt = new Date();
  const ipHash = hashIp(clientIp(req));
  const userAgent = req.headers.get("user-agent") ?? null;

  // Upsert vendor row. If they applied before (same email) we update
  // the acceptance stamp — never overwrite an already-approved row.
  const { data: existing } = await sb
    .from("vendors")
    .select("id, status")
    .eq("contact_email", email)
    .maybeSingle();

  let vendorId: string;
  if (existing) {
    if (existing.status === "approved" || existing.status === "suspended") {
      return NextResponse.json(
        {
          error:
            "This email is already registered as a partner. Sign in at /vendor/login to manage your account.",
        },
        { status: 409 },
      );
    }
    vendorId = existing.id;
    await sb
      .from("vendors")
      .update({
        company_name: company,
        display_name: company,
        contact_name: name,
        agreement_signed_at: signedAt.toISOString(),
        agreement_version: agreementVersion,
        agreement_ip_hash: ipHash,
        agreement_user_agent: userAgent,
      } as never)
      .eq("id", vendorId);
  } else {
    const { data: inserted, error: insErr } = await sb
      .from("vendors")
      .insert({
        company_name: company,
        display_name: company,
        contact_name: name,
        contact_email: email,
        status: "pending_review",
        agreement_signed_at: signedAt.toISOString(),
        agreement_version: agreementVersion,
        agreement_ip_hash: ipHash,
        agreement_user_agent: userAgent,
        months_in_program: 0,
      } as never)
      .select("id")
      .single();
    if (insErr || !inserted) {
      return NextResponse.json(
        { error: insErr?.message ?? "Couldn't record your application." },
        { status: 500 },
      );
    }
    vendorId = inserted.id;
  }

  // Render + upload PDF. Best-effort — the acceptance columns are
  // already saved so a PDF failure doesn't invalidate the application.
  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await renderAgreementPdf({
      role: "partner",
      agreementVersion,
      signer: { name, email, companyName: company },
      signedAt,
      ipHashLast6: ipHash.slice(-6),
    });
    const pdfPath = `vendor/${vendorId}/${signedAt.getTime()}.pdf`;
    const { error: upErr } = await sb.storage
      .from("agreements")
      .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });
    if (upErr) {
      console.error("[join:partner:apply] PDF upload failed", upErr);
    } else {
      await sb
        .from("vendors")
        .update({ agreement_pdf_path: pdfPath } as never)
        .eq("id", vendorId);
    }
  } catch (err) {
    console.error("[join:partner:apply] PDF render failed", err);
    pdfBuffer = null;
  }

  if (pdfBuffer) {
    void sendJoinConfirmationEmail({
      role: "partner",
      to: email,
      contactName: name,
      companyName: company,
      pdfBuffer,
      pdfFilename: `DMN-Founding-Partner-Agreement-${agreementVersion}.pdf`,
      portalUrl: `${appOrigin()}/vendor/login`,
      agreementVersion,
    });
  }

  return NextResponse.json({ ok: true, vendorId });
}
