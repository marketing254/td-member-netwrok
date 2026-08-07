import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { renderAgreementPdf } from "@/lib/pdf/agreementPdf";
import { apiError, serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/invite/[code]/agreement
 *
 * The personalized-but-unaccepted STANDARD agreement PDF for an invite
 * link — same document the person will receive once they accept, with
 * the signature block reading "Prepared for / Awaiting acceptance".
 * Streams inline so "Read the full agreement" opens the actual PDF.
 *
 * Public + code-gated (the unguessable code is the credential), same as
 * the invite landing page itself.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const route = "GET /api/invite/[code]/agreement";
  if (!code) return apiError.badRequest("Missing code.", route);

  try {
    const sb = getSupabaseAdmin();
    const { data: invite } = await sb
      .from("invite_links")
      .select("kind, full_name, email, company_name, status, expires_at")
      .eq("code", code)
      .maybeSingle();

    if (!invite || invite.status === "revoked") return apiError.notFound(route);
    if (new Date(invite.expires_at).getTime() < Date.now() && invite.status !== "accepted") {
      return apiError.notFound(route);
    }

    const pdf = await renderAgreementPdf({
      role: invite.kind,
      agreementVersion: "v1",
      signer: {
        name: invite.full_name,
        email: invite.email ?? "—",
        companyName: invite.company_name,
      },
      signedAt: new Date(),
      ipHashLast6: "",
      accepted: false,
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="DMN-${invite.kind === "expert" ? "Expert" : "Partner"}-Agreement-v1.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return serverError(err, { route });
  }
}
