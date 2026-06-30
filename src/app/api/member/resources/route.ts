import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/member/resources[?topic_slug=...]
 *
 * Returns published resources joined with the signed-in member's progress.
 * If `topic_slug` is provided, narrows to that topic; otherwise returns
 * all published resources for the topics list page.
 */
export async function GET(req: Request) {
  const guard = await requireMember();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const topicSlug = url.searchParams.get("topic_slug");
  const expertId = url.searchParams.get("expert");
  const sb = getSupabaseAdmin();

  let query = sb
    .from("resources")
    .select(
      "id, topic_slug, topic_title, topic_summary, category, portal_card_url, resource_card_url, title, description, kind, storage_path, external_url, thumbnail_url, mime_type, file_size_bytes, duration_label, position, is_free, is_published, created_at, kit_type, book_club_payload, originating_expert_id",
    )
    .eq("is_published", true)
    .eq("submission_status", "approved")
    .order("topic_slug", { ascending: true })
    .order("position", { ascending: true });

  if (topicSlug) query = query.eq("topic_slug", topicSlug);
  if (expertId) query = query.eq("originating_expert_id", expertId);

  const { data: resources, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Pull the member's progress rows for these resources.
  const ids = (resources ?? []).map((r) => r.id);
  let progress: { resource_id: string; last_viewed_at: string | null; completed_at: string | null; watch_seconds: number }[] = [];
  if (ids.length > 0) {
    const { data: progressRows } = await sb
      .from("member_resource_progress")
      .select("resource_id, last_viewed_at, completed_at, watch_seconds")
      .eq("member_id", guard.memberId)
      .in("resource_id", ids);
    progress = progressRows ?? [];
  }

  const progressByResource = new Map(progress.map((p) => [p.resource_id, p]));
  const decorated = (resources ?? []).map((r) => ({
    ...r,
    progress: progressByResource.get(r.id) ?? null,
  }));

  return NextResponse.json({ resources: decorated });
}
