import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/directory/experts?page=1&pageSize=6
 *
 * PUBLIC — powers the founding-experts directory on the marketing site.
 * Only ACTIVE experts (i.e. accepted / provisioned) are listed, and only
 * public-safe fields are returned: never email, phone, or billing.
 * Paginated so the landing page stays light as the bench grows.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(24, Math.max(1, Number(url.searchParams.get("pageSize")) || 6));
    const from = (page - 1) * pageSize;

    const sb = getSupabaseAdmin();
    // PUBLISH-READY gate: active AND has a headshot AND a bio. Half-set or
    // internal test rows (no profile assets) never reach the public site.
    // booking_link deliberately excluded — schedulers are a member benefit
    // and never surface on the public site.
    const { data, error, count } = await sb
      .from("experts")
      .select("id, display_name, full_name, specialty, company_name, bio, headshot_url, website", {
        count: "exact",
      })
      .eq("status", "active")
      .not("headshot_url", "is", null)
      .not("bio", "is", null)
      .order("display_name", { ascending: true, nullsFirst: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;

    return NextResponse.json({
      experts: (data ?? []).map((e) => ({
        id: e.id,
        name: e.display_name || e.full_name || "(unnamed expert)",
        specialty: e.specialty,
        company_name: e.company_name,
        bio: e.bio,
        headshot_url: e.headshot_url,
        website: e.website,
      })),
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err) {
    return serverError(err, { route: "GET /api/directory/experts" });
  }
}
