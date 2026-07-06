import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { renderAgreementPdf } from "@/lib/pdf/agreementPdf";
import { sendFoundingInviteEmail } from "@/lib/email/foundingInvite";
import { appOrigin } from "@/lib/stripe";
import type { FoundingInviteRole } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGREEMENT_VERSION = "v3";

/**
 * POST /api/admin/founding-invite
 *
 * Creates a private, invitation-only onboarding for a hand-picked
 * expert / partner (or both). Mints an unguessable code, renders their
 * PERSONALIZED agreement (name / company / offer merged in), stores it,
 * and emails the /founding/<code> link. No expert/vendor row is created
 * yet — that happens at acceptance (/api/founding/[code]/accept).
 */
type Body = {
  role?: FoundingInviteRole;
  full_name?: string;
  email?: string;
  company_name?: string;
  member_offer?: string;
  phone?: string;
  notes?: string;
};

function genCode(): string {
  // 18 bytes → 24-char base64url. ~144 bits of entropy — unguessable.
  return crypto.randomBytes(18).toString("base64url");
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const role = body.role;
  if (role !== "expert" && role !== "partner" && role !== "both") {
    return NextResponse.json({ error: "role must be expert, partner or both." }, { status: 400 });
  }
  const fullName = (body.full_name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const companyName = (body.company_name ?? "").trim() || null;
  const memberOffer = (body.member_offer ?? "").trim() || null;

  if (!fullName || fullName.length < 2) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if ((role === "partner" || role === "both") && !companyName) {
    return NextResponse.json(
      { error: "Company name is required for partner / both invites." },
      { status: 400 },
    );
  }

  const sb = getSupabaseAdmin();
  const code = genCode();

  // Render the personalized agreement (unaccepted copy) + upload it.
  let pdfBuffer: Buffer | null = null;
  let pdfPath: string | null = null;
  try {
    pdfBuffer = await renderAgreementPdf({
      role,
      agreementVersion: AGREEMENT_VERSION,
      signer: { name: fullName, email, companyName },
      memberOffer,
      signedAt: new Date(),
      ipHashLast6: "pending",
      accepted: false,
    });
    pdfPath = `founding/${code}.pdf`;
    const { error: upErr } = await sb.storage
      .from("agreements")
      .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });
    if (upErr) {
      console.error("[admin:founding-invite] PDF upload failed", upErr);
      pdfPath = null;
    }
  } catch (err) {
    console.error("[admin:founding-invite] PDF render failed", err);
    pdfBuffer = null;
  }

  const { data: inserted, error: insErr } = await sb
    .from("founding_invites")
    .insert({
      code,
      role,
      full_name: fullName,
      email,
      company_name: companyName,
      member_offer: memberOffer,
      phone: body.phone?.trim() || null,
      notes: body.notes?.trim() || null,
      agreement_version: AGREEMENT_VERSION,
      agreement_pdf_path: pdfPath,
      status: "sent",
      created_by: guard.adminId,
    } as never)
    .select("id")
    .single();
  if (insErr || !inserted) {
    return NextResponse.json(
      { error: insErr?.message ?? "Couldn't create the invite." },
      { status: 500 },
    );
  }

  const inviteUrl = `${appOrigin()}/founding/${code}`;

  // Email the private link + the personalized PDF.
  void sendFoundingInviteEmail({
    to: email,
    fullName,
    role,
    inviteUrl,
    pdfBuffer,
    pdfFilename: `DMN-Founding-Agreement-${AGREEMENT_VERSION}.pdf`,
    agreementVersion: AGREEMENT_VERSION,
  });

  // Admin notification.
  await sb.from("notifications").insert({
    audience: "admin",
    admin_id: null,
    kind: "founding_invite_sent",
    title: `Founding invite sent: ${fullName}`,
    body: `${role} invite emailed to ${email}.${memberOffer ? ` Offer: "${memberOffer}".` : ""}`,
    link: "/admin/vendors?filter=approved",
    metadata: { invite_id: inserted.id, role },
  });

  return NextResponse.json({ ok: true, code, inviteUrl });
}
