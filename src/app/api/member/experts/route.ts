import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireMemberOrAdminPreview } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/member/experts
 *
 * Returns every active expert plus the count of published resources
 * attributed to them. Powers the member-portal "Experts" page where
 * members browse experts as discovery cards and pick "View kits" to
 * filter the resources list by that expert.
 *
 * Admin preview passes through — the response is identical either way
 * (no per-member personalisation on this endpoint).
 */
export async function GET() {
  const guard = await requireMemberOrAdminPreview();
  if (!guard.ok) return guard.response;

  try {
    const admin = getSupabaseAdmin();

    const { data: experts, error } = await admin
      .from("experts")
      .select("id, display_name, full_name, specialty, headshot_url, bio")
      .neq("status", "archived")
      .neq("status", "suspended")
      .order("display_name", { ascending: true, nullsFirst: false });
    if (error) throw error;

    const ids = (experts ?? []).map((e) => e.id);
    const kitCounts = new Map<string, number>();
    if (ids.length > 0) {
      const { data: resourceCounts } = await admin
        .from("resources")
        .select("originating_expert_id, topic_slug")
        .in("originating_expert_id", ids)
        .eq("is_published", true)
        .eq("submission_status", "approved");
      // Group by (expert, topic_slug) so we count distinct kits, not rows.
      const kitsByExpert = new Map<string, Set<string>>();
      for (const r of resourceCounts ?? []) {
        if (!r.originating_expert_id) continue;
        const set = kitsByExpert.get(r.originating_expert_id) ?? new Set();
        set.add(r.topic_slug);
        kitsByExpert.set(r.originating_expert_id, set);
      }
      for (const [expertId, slugs] of kitsByExpert) {
        kitCounts.set(expertId, slugs.size);
      }
    }

    return NextResponse.json({
      experts: (experts ?? []).map((e) => ({
        id: e.id,
        name: e.display_name || e.full_name || "(unnamed expert)",
        specialty: e.specialty,
        headshot_url: e.headshot_url,
        bio: e.bio,
        kit_count: kitCounts.get(e.id) ?? 0,
      })),
    });
  } catch (err) {
    return serverError(err, { route: "GET /api/member/experts" });
  }
}
