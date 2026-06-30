import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireExpert } from "@/lib/auth/guards";
import { getOrCreateExpertReferral } from "@/lib/referral";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/expert/referral
 *
 * Returns the expert's referral code (creates one on first call) plus
 * lifetime + last-30-day signup counts so the portal card can show the
 * traction at a glance.
 */
export async function GET() {
  const guard = await requireExpert();
  if (!guard.ok) return guard.response;

  try {
    const admin = getSupabaseAdmin();
    const { data: expert } = await admin
      .from("experts")
      .select("display_name, full_name")
      .eq("id", guard.expertId)
      .maybeSingle();
    const name = expert?.display_name || expert?.full_name || "DMN";
    const { code } = await getOrCreateExpertReferral(guard.expertId, name);

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

    return NextResponse.json({
      code,
      signupsLifetime,
      signupsLast30,
      conversions,
    });
  } catch (err) {
    return serverError(err, { route: "GET /api/expert/referral" });
  }
}
