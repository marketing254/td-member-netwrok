import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/referrals
 *
 * Returns every referral code with owner info + signups / conversions.
 * Powers the admin `/admin/referrals` analytics page.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const admin = getSupabaseAdmin();

    const { data: codes, error } = await admin
      .from("referral_codes")
      .select("id, code, expert_id, vendor_id, active, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const expertIds = Array.from(new Set((codes ?? []).map((c) => c.expert_id).filter(Boolean) as string[]));
    const vendorIds = Array.from(new Set((codes ?? []).map((c) => c.vendor_id).filter(Boolean) as string[]));

    const [{ data: experts }, { data: vendors }] = await Promise.all([
      expertIds.length
        ? admin.from("experts").select("id, display_name, full_name").in("id", expertIds)
        : Promise.resolve({ data: [] }),
      vendorIds.length
        ? admin.from("vendors").select("id, display_name, company_name").in("id", vendorIds)
        : Promise.resolve({ data: [] }),
    ]);

    const expertMap = new Map((experts ?? []).map((e) => [e.id, e.display_name || e.full_name || ""]));
    const vendorMap = new Map((vendors ?? []).map((v) => [v.id, v.display_name || v.company_name || ""]));

    // One round-trip for all signup rows (cheap at this scale).
    const codeIds = (codes ?? []).map((c) => c.id);
    let signupsByCode = new Map<string, { signups: number; conversions: number }>();
    if (codeIds.length > 0) {
      const { data: signups } = await admin
        .from("referral_signups")
        .select("code_id, converted_at")
        .in("code_id", codeIds);
      const m = new Map<string, { signups: number; conversions: number }>();
      for (const s of signups ?? []) {
        const cur = m.get(s.code_id) ?? { signups: 0, conversions: 0 };
        cur.signups += 1;
        if (s.converted_at) cur.conversions += 1;
        m.set(s.code_id, cur);
      }
      signupsByCode = m;
    }

    const enriched = (codes ?? []).map((c) => {
      const owner = c.expert_id
        ? { kind: "expert" as const, id: c.expert_id, name: expertMap.get(c.expert_id) || "(unnamed expert)" }
        : { kind: "vendor" as const, id: c.vendor_id!, name: vendorMap.get(c.vendor_id!) || "(unnamed partner)" };
      const stats = signupsByCode.get(c.id) ?? { signups: 0, conversions: 0 };
      return {
        id: c.id,
        code: c.code,
        active: c.active,
        created_at: c.created_at,
        owner,
        signups: stats.signups,
        conversions: stats.conversions,
      };
    });

    // Sort by signups desc so the table opens with the highest impact.
    enriched.sort((a, b) => b.signups - a.signups);

    return NextResponse.json({ codes: enriched });
  } catch (err) {
    return serverError(err, { route: "GET /api/admin/referrals" });
  }
}
