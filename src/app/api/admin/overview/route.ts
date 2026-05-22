import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/overview
 *
 * Aggregates dashboard KPIs in one round trip. Admin-gated.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const supabase = getSupabaseAdmin();

    const [
      vendors,
      members,
      waitlist,
      offers,
      catalog,
      redemptions,
      recentApplications,
      pendingOffers,
    ] = await Promise.all([
      supabase
        .from("vendors")
        .select("id, status, verified, created_at, plan_id"),
      supabase.from("members").select("id, status, tier, joined_at, created_at"),
      supabase
        .from("waitlist_signups")
        .select("id, role, created_at"),
      supabase
        .from("offers")
        .select("id, headline, discount_value, vendor_id, review_status, submitted_for_review_at, created_at"),
      supabase
        .from("catalog_items")
        .select("id, name, vendor_id, review_status, submitted_for_review_at, created_at"),
      supabase
        .from("redemptions")
        .select("id, amount_saved, redeemed_on, created_at"),
      supabase
        .from("vendor_applications")
        .select("id, company_name, contact_name, contact_email, status, created_at, vendor_id")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("offers")
        .select("id, headline, discount_value, vendor_id, review_status, submitted_for_review_at, created_at, catalog_items(name, type)")
        .eq("review_status", "pending_review")
        .order("submitted_for_review_at", { ascending: false, nullsFirst: false })
        .limit(6),
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const v = vendors.data ?? [];
    const m = members.data ?? [];
    const w = waitlist.data ?? [];
    const o = offers.data ?? [];
    const c = catalog.data ?? [];
    const r = redemptions.data ?? [];

    const vendorCounts = {
      total: v.length,
      pending: v.filter((x) => x.status === "pending_review").length,
      approved: v.filter((x) => x.status === "approved").length,
      suspended: v.filter((x) => x.status === "suspended").length,
      rejected: v.filter((x) => x.status === "rejected").length,
      verified: v.filter((x) => x.verified).length,
    };

    const memberCounts = {
      total: m.length,
      active: m.filter((x) => x.status === "active").length,
      thisWeek: m.filter((x) => x.created_at >= weekAgo).length,
    };

    const waitlistCounts = {
      total: w.length,
      members: w.filter((x) => x.role === "member").length,
      vendors: w.filter((x) => x.role === "vendor").length,
      last24h: w.filter((x) => x.created_at >= new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()).length,
    };

    const offerCounts = {
      pending: o.filter((x) => x.review_status === "pending_review").length,
      approved: o.filter((x) => x.review_status === "approved").length,
      total: o.length,
    };

    const catalogCounts = {
      pending: c.filter((x) => x.review_status === "pending_review").length,
      approved: c.filter((x) => x.review_status === "approved").length,
      total: c.length,
    };

    const redemptionStats = {
      lifetimeCount: r.length,
      thisMonthCount: r.filter((x) => (x.redeemed_on ?? "") >= monthStart).length,
      lifetimeSavings: Math.round(r.reduce((sum, x) => sum + (Number(x.amount_saved) || 0), 0)),
    };

    return NextResponse.json({
      vendors: vendorCounts,
      members: memberCounts,
      waitlist: waitlistCounts,
      offers: offerCounts,
      catalog: catalogCounts,
      redemptions: redemptionStats,
      recentApplications: recentApplications.data ?? [],
      pendingOffers: pendingOffers.data ?? [],
      foundingCap: 1000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
