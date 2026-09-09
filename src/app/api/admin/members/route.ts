import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A "pending member" started signup (a members row exists — the pay-first
 * flows create it at the payment step) but never completed payment and
 * was never activated by an admin. They must not show as members.
 */
function isPendingMember(r: { activated_at: string | null; stripe_subscription_id: string | null }): boolean {
  return !r.activated_at && !r.stripe_subscription_id;
}

// signup_channel / utm_* were added after the last type generation — read
// them loosely rather than blocking on a typegen refresh.
function sourceLabel(r: Record<string, unknown>): string {
  const channel = typeof r.signup_channel === "string" ? r.signup_channel : null;
  const utm = typeof r.utm_source === "string" ? r.utm_source : null;
  if (channel === "meta_ads" || utm === "meta") return "Meta ad";
  if (r.referral_code_id) return "Referral";
  if (utm) return utm;
  return "Direct / organic";
}

/**
 * GET /api/admin/members            — completed members only
 * GET /api/admin/members?view=pending — started-but-unpaid signups, with
 *                                       their follow-up sequence state
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const view = req.nextUrl.searchParams.get("view");

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const all = data ?? [];

    if (view === "pending") {
      const pending = all.filter(isPendingMember);
      // Follow-up sequence state (pending_registrations is post-typegen →
      // untyped client, same escape hatch as lib/abandoned.ts).
      type FollowUp = {
        email: string; plan: string | null; captured_at: string;
        email1_sent_at: string | null; email2_sent_at: string | null; email3_sent_at: string | null;
        code: string | null; code_expires_at: string | null; code_used_at: string | null;
        resumed_at: string | null; stopped_at: string | null; stop_reason: string | null;
      };
      const byEmail = new Map<string, FollowUp>();
      try {
        const emails = pending.map((r) => r.email.toLowerCase());
        if (emails.length > 0) {
          const { data: fu } = await (supabase as unknown as SupabaseClient)
            .from("pending_registrations")
            .select("email, plan, captured_at, email1_sent_at, email2_sent_at, email3_sent_at, code, code_expires_at, code_used_at, resumed_at, stopped_at, stop_reason")
            .in("email", emails)
            .order("captured_at", { ascending: false });
          for (const f of (fu ?? []) as FollowUp[]) {
            const k = f.email.toLowerCase();
            if (!byEmail.has(k)) byEmail.set(k, f);
          }
        }
      } catch {
        /* table absent — rows render without follow-up state */
      }
      return NextResponse.json({
        rows: pending.map((r) => ({
          ...r,
          source: sourceLabel(r),
          follow_up: byEmail.get(r.email.toLowerCase()) ?? null,
        })),
      });
    }

    const rows = all.filter((r) => !isPendingMember(r));

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
