import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireVendor } from "@/lib/auth/guards";
import { renderFoundingAgreementPdf } from "@/lib/pdf/foundingAgreementPdf";
import { normalizePlan } from "@/lib/billing/partnerPlan";
import { PORTAL_AGREEMENT_VERSION } from "@/lib/billing/agreementState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/vendor/agreement/pdf — the v4 Partner agreement the signed-in
 * partner is about to accept on the start-trial card, rendered for their
 * company and price plan (unsigned).
 */
export async function GET() {
  const guard = await requireVendor();
  if (!guard.ok) return guard.response;

  const sb = getSupabaseAdmin();
  const { data: vendor } = await sb
    .from("vendors")
    .select("id, contact_email, contact_name, company_name, pricing_plan")
    .eq("id", guard.vendorId)
    .maybeSingle();
  if (!vendor) return NextResponse.json({ error: "Vendor not found." }, { status: 404 });

  const { data: alsoExpert } = await sb
    .from("experts")
    .select("id")
    .eq("email", (vendor.contact_email ?? "").toLowerCase())
    .maybeSingle();

  try {
    const pdf = await renderFoundingAgreementPdf({
      role: alsoExpert ? "both" : "partner",
      pricing: normalizePlan(vendor.pricing_plan),
      signer: { name: vendor.contact_name ?? "Partner", email: vendor.contact_email, companyName: vendor.company_name ?? null },
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
    console.error("[vendor:agreement:pdf] render failed", err);
    return NextResponse.json({ error: "Couldn't render the agreement right now." }, { status: 500 });
  }
}
