import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireExpert } from "@/lib/auth/guards";
import { renderFoundingAgreementPdf } from "@/lib/pdf/foundingAgreementPdf";
import { normalizePlan } from "@/lib/billing/partnerPlan";
import { PORTAL_AGREEMENT_VERSION } from "@/lib/billing/agreementState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/expert/agreement/pdf — the v4 agreement the signed-in expert
 * is about to accept on the start-trial card, rendered for them
 * (unsigned). An expert whose email also holds a partner company gets the
 * combined Expert + Partner agreement, as before.
 */
export async function GET() {
  const guard = await requireExpert();
  if (!guard.ok) return guard.response;

  const sb = getSupabaseAdmin();
  const { data: expert } = await sb
    .from("experts")
    .select("id, email, full_name, company_name")
    .eq("id", guard.expertId)
    .maybeSingle();
  if (!expert) return NextResponse.json({ error: "Expert not found." }, { status: 404 });

  const { data: alsoPartner } = await sb
    .from("vendors")
    .select("id, company_name, pricing_plan")
    .eq("contact_email", expert.email.toLowerCase())
    .maybeSingle();

  try {
    const pdf = await renderFoundingAgreementPdf({
      role: alsoPartner ? "both" : "expert",
      pricing: alsoPartner ? normalizePlan(alsoPartner.pricing_plan) : null,
      signer: { name: expert.full_name ?? "Expert", email: expert.email, companyName: alsoPartner?.company_name ?? expert.company_name ?? null },
      signedAt: new Date(),
      ipHashLast6: "pending",
      accepted: false,
    });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="DMN-Founding-Agreement-${PORTAL_AGREEMENT_VERSION}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[expert:agreement:pdf] render failed", err);
    return NextResponse.json({ error: "Couldn't render the agreement right now." }, { status: 500 });
  }
}
