import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/resources
 *
 * Public, no-auth endpoint that powers the landing /resources teaser grid.
 * Returns one entry per kit (grouped by topic_slug) with only the metadata
 * needed for a locked card:
 *   - title, summary, category
 *   - resource_card_url (the wide hero used as the card background)
 *   - item / video count (for the meta line)
 *   - is_free
 *
 * No file URLs (external_url / storage_path) are exposed to anonymous
 * visitors — those are gated by member auth via /api/member/resources.
 */
type Kit = {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  resourceCardUrl: string | null;
  videoCount: number;
  itemCount: number;
  isFree: boolean;
};

export async function GET() {
  const sb = getSupabaseAdmin();

  const { data: rows, error } = await sb
    .from("resources")
    .select(
      "topic_slug, topic_title, topic_summary, category, resource_card_url, kind, is_free",
    )
    .eq("is_published", true)
    .eq("submission_status", "approved")
    .order("topic_slug", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byKit = new Map<string, Kit>();
  for (const r of rows ?? []) {
    const isVideo = r.kind.startsWith("video_") || r.kind === "audio";
    const existing = byKit.get(r.topic_slug);
    if (existing) {
      existing.itemCount += 1;
      if (isVideo) existing.videoCount += 1;
      if (!r.is_free) existing.isFree = false;
    } else {
      byKit.set(r.topic_slug, {
        slug: r.topic_slug,
        title: r.topic_title,
        summary: r.topic_summary,
        category: r.category,
        resourceCardUrl: r.resource_card_url,
        videoCount: isVideo ? 1 : 0,
        itemCount: 1,
        isFree: r.is_free,
      });
    }
  }

  const kits = Array.from(byKit.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  return NextResponse.json({ kits });
}
