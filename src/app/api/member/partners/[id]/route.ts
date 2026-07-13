import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireMemberOrAdminPreview } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/member/partners/[id]
 *
 * Full public profile for one partner company plus its approved member
 * offers. Only surfaces member-safe fields — never contact email / phone
 * or billing.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireMemberOrAdminPreview();
  if (!guard.ok) return guard.response;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing partner id." }, { status: 400 });

  try {
    const admin = getSupabaseAdmin();

    const { data: v, error } = await admin
      .from("vendors")
      .select(
        "id, company_name, display_name, category, description, logo_url, avatar_url, website, calendar_link, status, verified, billing_parent_id",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    // Same publish-ready gate as the directory list: no logo/description →
    // not visible to members (test rows, half-set listings).
    if (!v || v.status !== "approved" || !v.verified || !(v.logo_url ?? v.avatar_url) || !v.description) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }
    // Covered company hidden if its paying partner isn't live.
    if (v.billing_parent_id) {
      const { data: parent } = await admin
        .from("vendors")
        .select("status, verified")
        .eq("id", v.billing_parent_id)
        .maybeSingle();
      if (!parent || parent.status !== "approved" || !parent.verified) {
        return NextResponse.json({ error: "Partner not found." }, { status: 404 });
      }
    }

    const { data: offerRows } = await admin
      .from("offers")
      .select("id, headline, discount_value, promo_code, description, terms, valid_to")
      .eq("vendor_id", id)
      .eq("review_status", "approved")
      .order("created_at", { ascending: false });

    return NextResponse.json({
      partner: {
        id: v.id,
        name: v.display_name || v.company_name || "(unnamed partner)",
        category: v.category,
        description: v.description,
        logo_url: v.logo_url ?? v.avatar_url ?? null,
        website: v.website,
        calendar_link: v.calendar_link,
      },
      offers: (offerRows ?? []).map((o) => ({
        id: o.id,
        headline: o.headline,
        discount_value: o.discount_value,
        promo_code: o.promo_code,
        description: o.description,
        terms: o.terms,
        valid_to: o.valid_to,
      })),
    });
  } catch (err) {
    return serverError(err, { route: "GET /api/member/partners/[id]" });
  }
}
