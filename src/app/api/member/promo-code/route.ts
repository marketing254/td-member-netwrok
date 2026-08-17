import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resolveCheckoutMember } from "@/lib/auth/guards";
import { apiError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/member/promo-code — { code }
 *
 * UX validation for the /upgrade payment page's "Have a promotional
 * code?" field. Same audience as checkout (session or signup cookie).
 * Checkout re-validates server-side regardless, so this endpoint is
 * purely for instant feedback.
 */
export async function POST(req: Request) {
  const guard = await resolveCheckoutMember();
  if (!guard.ok) return guard.response;

  const route = "POST /api/member/promo-code";
  const body = (await req.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) return apiError.badRequest("Enter a code.", route);

  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("member_promo_codes")
      .select("code, active, trial_days")
      .ilike("code", code)
      .maybeSingle();

    if (!data) return NextResponse.json({ valid: false, reason: "invalid" });
    if (!data.active) return NextResponse.json({ valid: false, reason: "inactive" });
    return NextResponse.json({ valid: true, code: data.code, trialDays: data.trial_days });
  } catch {
    // Table missing (migration 0054 not run) or transient failure — treat
    // as invalid rather than erroring the payment page.
    return NextResponse.json({ valid: false, reason: "invalid" });
  }
}
