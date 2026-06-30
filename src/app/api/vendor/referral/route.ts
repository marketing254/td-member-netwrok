import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireVendor } from "@/lib/auth/guards";
import { getOrCreateVendorReferral } from "@/lib/referral";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/vendor/referral
 *
 * Same shape as the expert endpoint, scoped to the signed-in partner.
 */
export async function GET() {
  const guard = await requireVendor();
  if (!guard.ok) return guard.response;

  try {
    const admin = getSupabaseAdmin();
    const { data: vendor } = await admin
      .from("vendors")
      .select("display_name, company_name")
      .eq("id", guard.vendorId)
      .maybeSingle();
    const name = vendor?.display_name || vendor?.company_name || "DMN";
    const { code } = await getOrCreateVendorReferral(guard.vendorId, name);

    const { data: row } = await admin
      .from("referral_codes")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    let signupsLifetime = 0;
    let signupsLast30 = 0;
    let conversions = 0;
    if (row) {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: signups } = await admin
        .from("referral_signups")
        .select("id, created_at, converted_at")
        .eq("code_id", row.id);
      signupsLifetime = (signups ?? []).length;
      signupsLast30 = (signups ?? []).filter((s) => s.created_at >= cutoff).length;
      conversions = (signups ?? []).filter((s) => !!s.converted_at).length;
    }

    return NextResponse.json({ code, signupsLifetime, signupsLast30, conversions });
  } catch (err) {
    return serverError(err, { route: "GET /api/vendor/referral" });
  }
}
