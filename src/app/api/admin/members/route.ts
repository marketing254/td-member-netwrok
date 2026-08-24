import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/members — list members from the real `members` table */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const rows = data ?? [];

    // Enrich with acquisition attribution so the detail drawer shows the
    // FULL picture: who referred them (resolved to the owner's name) and
    // which promo code they joined with. Best-effort — the list still
    // renders if any lookup fails.
    let referredBy = new Map<string, string>();
    let promoByMember = new Map<string, string>();
    try {
      const codeIds = [...new Set(rows.map((r) => r.referral_code_id).filter(Boolean))] as string[];
      if (codeIds.length > 0) {
        const { data: codes } = await supabase
          .from("referral_codes")
          .select("id, code, slug, expert_id, vendor_id")
          .in("id", codeIds);
        const expertIds = (codes ?? []).map((c) => c.expert_id).filter(Boolean) as string[];
        const vendorIds = (codes ?? []).map((c) => c.vendor_id).filter(Boolean) as string[];
        const [{ data: experts }, { data: vendors }] = await Promise.all([
          expertIds.length
            ? supabase.from("experts").select("id, display_name, full_name").in("id", expertIds)
            : Promise.resolve({ data: [] as { id: string; display_name: string | null; full_name: string | null }[] }),
          vendorIds.length
            ? supabase.from("vendors").select("id, display_name, company_name").in("id", vendorIds)
            : Promise.resolve({ data: [] as { id: string; display_name: string | null; company_name: string | null }[] }),
        ]);
        const eMap = new Map((experts ?? []).map((e) => [e.id, e.display_name || e.full_name || ""]));
        const vMap = new Map((vendors ?? []).map((v) => [v.id, v.display_name || v.company_name || ""]));
        const codeName = new Map(
          (codes ?? []).map((c) => {
            const owner = (c.expert_id && eMap.get(c.expert_id)) || (c.vendor_id && vMap.get(c.vendor_id)) || null;
            const link = c.slug ? `/${c.slug}` : c.code;
            return [c.id, owner ? `${owner} (${link})` : link] as const;
          }),
        );
        referredBy = new Map(
          rows
            .filter((r) => r.referral_code_id && codeName.has(r.referral_code_id))
            .map((r) => [r.id, codeName.get(r.referral_code_id!)!]),
        );
      }

      const memberIds = rows.map((r) => r.id);
      if (memberIds.length > 0) {
        const { data: redemptions } = await supabase
          .from("member_promo_redemptions")
          .select("member_id, promo_code_id")
          .in("member_id", memberIds);
        const promoIds = [...new Set((redemptions ?? []).map((r) => r.promo_code_id))];
        if (promoIds.length > 0) {
          const { data: promos } = await supabase
            .from("member_promo_codes")
            .select("id, code")
            .in("id", promoIds);
          const pMap = new Map((promos ?? []).map((p) => [p.id, p.code]));
          promoByMember = new Map(
            (redemptions ?? []).map((r) => [r.member_id, pMap.get(r.promo_code_id) ?? ""]),
          );
        }
      }
    } catch {
      /* attribution stays blank */
    }

    return NextResponse.json({
      rows: rows.map((r) => ({
        ...r,
        referred_by: referredBy.get(r.id) ?? null,
        promo_code_used: promoByMember.get(r.id) || null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
