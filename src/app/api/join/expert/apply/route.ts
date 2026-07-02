import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { renderAgreementPdf } from "@/lib/pdf/agreementPdf";
import { sendJoinConfirmationEmail } from "@/lib/email/joinConfirmation";
import { appOrigin } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/join/expert/apply
 *
 * Public expert application — same shape as /api/join/partner/apply.
 * Inserts an experts row in `invited` status, PDF + email, no Stripe.
 * Card capture happens later in /expert/billing after the team
 * approves and the expert signs in.
 */
type Body = {
  contactName?: string;
  contactEmail?: string;
  focusArea?: string;
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
  const focusArea = (body.focusArea ?? "").trim();
  const agreementVersion = (body.agreementVersion ?? "").trim() || "v1";

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }
  if (!focusArea || focusArea.length < 2) {
    return NextResponse.json({ error: "Enter your topic or firm." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const signedAt = new Date();
  const ipHash = hashIp(clientIp(req));
  const userAgent = req.headers.get("user-agent") ?? null;

  const { data: existing } = await sb
    .from("experts")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  let expertId: string;
  if (existing) {
    if (existing.status === "active" || existing.status === "suspended") {
      return NextResponse.json(
        {
          error:
            "This email is already registered as an expert. Sign in at /expert/login to manage your account.",
        },
        { status: 409 },
      );
    }
    expertId = existing.id;
    await sb
      .from("experts")
      .update({
        full_name: name,
        display_name: name,
        specialty: focusArea,
        agreement_signed_at: signedAt.toISOString(),
        agreement_version: agreementVersion,
        agreement_ip_hash: ipHash,
        agreement_user_agent: userAgent,
      } as never)
      .eq("id", expertId);
  } else {
    const { data: inserted, error: insErr } = await sb
      .from("experts")
      .insert({
        email,
        full_name: name,
        display_name: name,
        specialty: focusArea,
        status: "invited",
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
    expertId = inserted.id;
  }

  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await renderAgreementPdf({
      role: "expert",
      agreementVersion,
      signer: { name, email, companyName: focusArea },
      signedAt,
      ipHashLast6: ipHash.slice(-6),
    });
    const pdfPath = `expert/${expertId}/${signedAt.getTime()}.pdf`;
    const { error: upErr } = await sb.storage
      .from("agreements")
      .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });
    if (upErr) {
      console.error("[join:expert:apply] PDF upload failed", upErr);
    } else {
      await sb
        .from("experts")
        .update({ agreement_pdf_path: pdfPath } as never)
        .eq("id", expertId);
    }
  } catch (err) {
    console.error("[join:expert:apply] PDF render failed", err);
    pdfBuffer = null;
  }

  if (pdfBuffer) {
    void sendJoinConfirmationEmail({
      role: "expert",
      to: email,
      contactName: name,
      companyName: focusArea,
      pdfBuffer,
      pdfFilename: `DMN-Founding-Expert-Agreement-${agreementVersion}.pdf`,
      portalUrl: `${appOrigin()}/expert/login`,
      agreementVersion,
    });
  }

  return NextResponse.json({ ok: true, expertId });
}
