import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { renderFoundingAgreementPdf } from "@/lib/pdf/foundingAgreementPdf";
import { sendFoundingInviteEmail } from "@/lib/email/foundingInvite";
import { appOrigin } from "@/lib/stripe";
import type { FoundingInviteRole } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Placeholder / undeliverable addresses used while an invite's real
 * contact detail is still TBD. The send action refuses these so a draft
 * can never be emailed to a fake inbox.
 */
function isSendableEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e) || e.length > 320) return false;
  const domain = e.split("@")[1] ?? "";
  if (domain.endsWith(".invalid") || domain.endsWith(".local") || domain.endsWith(".example")) {
    return false;
  }
  return true;
}

/**
 * PATCH /api/admin/founding-invite/[id]
 * Edit a draft (or not-yet-accepted) invite's details.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await ctx.params;

  let body: Partial<{
    role: FoundingInviteRole;
    full_name: string;
    email: string;
    company_name: string;
    member_offer: string;
    phone: string;
    notes: string;
    website: string;
    category: string;
    calendar_link: string;
    description: string;
    secondary_email: string;
    secondary_phone: string;
    signer_name: string;
    signer_title: string;
  }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data: invite } = await sb
    .from("founding_invites")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  if (invite.status === "accepted" || invite.status === "revoked") {
    return NextResponse.json(
      { error: `This invite is ${invite.status} and can no longer be edited.` },
      { status: 409 },
    );
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.role) {
    if (body.role !== "expert" && body.role !== "partner" && body.role !== "both") {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    patch.role = body.role;
  }
  if (typeof body.full_name === "string") {
    const v = body.full_name.trim();
    if (v.length < 2) return NextResponse.json({ error: "Full name is too short." }, { status: 400 });
    patch.full_name = v;
  }
  if (typeof body.email === "string") {
    patch.email = body.email.trim().toLowerCase();
  }
  if (typeof body.company_name === "string") patch.company_name = body.company_name.trim() || null;
  if (typeof body.member_offer === "string") patch.member_offer = body.member_offer.trim() || null;
  if (typeof body.phone === "string") patch.phone = body.phone.trim() || null;
  if (typeof body.notes === "string") patch.notes = body.notes.trim() || null;
  if (typeof body.website === "string") patch.website = body.website.trim() || null;
  if (typeof body.category === "string") patch.category = body.category.trim() || null;
  if (typeof body.calendar_link === "string") patch.calendar_link = body.calendar_link.trim() || null;
  if (typeof body.description === "string") patch.description = body.description.trim() || null;
  if (typeof body.secondary_email === "string")
    patch.secondary_email = body.secondary_email.trim().toLowerCase() || null;
  if (typeof body.secondary_phone === "string") patch.secondary_phone = body.secondary_phone.trim() || null;
  if (typeof body.signer_name === "string") patch.signer_name = body.signer_name.trim() || null;
  if (typeof body.signer_title === "string") patch.signer_title = body.signer_title.trim() || null;

  const { error } = await sb.from("founding_invites").update(patch as never).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/**
 * POST /api/admin/founding-invite/[id]  { action: "send" | "revoke" }
 *
 * "send" is the ONLY action that renders the personalized agreement and
 * emails the private /founding/<code> link. Nothing is sent until an
 * admin triggers it here.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await ctx.params;

  let action: string | undefined;
  try {
    action = (await req.json())?.action;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { data: invite } = await sb
    .from("founding_invites")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });

  // ---- Revoke -------------------------------------------------------
  if (action === "revoke") {
    if (invite.status === "accepted") {
      return NextResponse.json(
        { error: "This invite was already accepted and can't be revoked." },
        { status: 409 },
      );
    }
    const { error } = await sb
      .from("founding_invites")
      .update({ status: "revoked", updated_at: new Date().toISOString() } as never)
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: "revoked" });
  }

  // ---- Send (or re-send) --------------------------------------------
  if (action === "send") {
    if (invite.status === "accepted") {
      return NextResponse.json({ error: "This invite was already accepted." }, { status: 409 });
    }
    if (invite.status === "revoked") {
      return NextResponse.json(
        { error: "This invite is revoked. Create a new draft to invite them." },
        { status: 409 },
      );
    }
    if (!isSendableEmail(invite.email)) {
      return NextResponse.json(
        { error: "Set a real, deliverable email on this invite before sending." },
        { status: 400 },
      );
    }
    if ((invite.role === "partner" || invite.role === "both") && !invite.company_name) {
      return NextResponse.json(
        { error: "Company name is required before sending a partner / both invite." },
        { status: 400 },
      );
    }

    // Render the personalized (unaccepted) agreement fresh at send time
    // so the latest name / company / offer is what they receive.
    let pdfBuffer: Buffer | null = null;
    let pdfPath: string | null = invite.agreement_pdf_path ?? null;
    const signerName = invite.signer_name || invite.full_name;
    try {
      pdfBuffer = await renderFoundingAgreementPdf({
        role: invite.role,
        signer: { name: signerName, email: invite.email, companyName: invite.company_name },
        memberOffer: invite.member_offer,
        signedAt: new Date(),
        ipHashLast6: "pending",
        accepted: false,
      });
      pdfPath = `founding/${invite.code}.pdf`;
      const { error: upErr } = await sb.storage
        .from("agreements")
        .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });
      if (upErr) {
        console.error("[admin:founding-invite:send] PDF upload failed", upErr);
        pdfPath = invite.agreement_pdf_path ?? null;
      }
    } catch (err) {
      console.error("[admin:founding-invite:send] PDF render failed", err);
      return NextResponse.json(
        { error: "Couldn't generate the agreement PDF. Nothing was sent." },
        { status: 500 },
      );
    }

    const inviteUrl = `${appOrigin()}/founding/${invite.code}`;
    const sent = await sendFoundingInviteEmail({
      to: invite.email,
      fullName: signerName,
      role: invite.role,
      inviteUrl,
      pdfBuffer,
      pdfFilename: `DMN-Founding-Agreement-${invite.agreement_version}.pdf`,
      agreementVersion: invite.agreement_version,
    });

    // Only advance a draft to 'sent'. A re-send of an already
    // sent/viewed invite keeps its lifecycle status.
    const nextStatus = invite.status === "draft" ? "sent" : invite.status;
    await sb
      .from("founding_invites")
      .update({
        status: nextStatus,
        agreement_pdf_path: pdfPath,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id);

    await sb.from("notifications").insert({
      audience: "admin",
      admin_id: null,
      kind: "founding_invite_sent",
      title: `Founding invite sent: ${invite.full_name}`,
      body: `${invite.role} invite emailed to ${invite.email}.`,
      link: "/admin/founding",
      metadata: { invite_id: invite.id, role: invite.role },
    });

    if (!sent) {
      // Row is updated so the admin can copy the link manually, but be
      // honest that the email transport didn't confirm delivery.
      return NextResponse.json({
        ok: true,
        status: nextStatus,
        emailed: false,
        invite_url: inviteUrl,
        warning: "Saved and marked sent, but the email transport didn't confirm. Copy the link and send it manually if needed.",
      });
    }
    return NextResponse.json({ ok: true, status: nextStatus, emailed: true, invite_url: inviteUrl });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
