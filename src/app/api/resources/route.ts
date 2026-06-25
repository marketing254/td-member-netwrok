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
 * visitors — except for the FEATURED kit's video, which is intentionally
 * surfaced so the landing card can play a short muted preview when it
 * scrolls into view (YouTube-style). The video is already public via
 * Supabase Storage; we're just exposing the URL to one card.
 */

/** Slug of the kit that gets the hover/scroll preview treatment. */
const FEATURED_KIT_SLUG = "9-kpis";

type Kit = {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  resourceCardUrl: string | null;
  videoCount: number;
  itemCount: number;
  isFree: boolean;
  /**
   * Public URL of the training video — only populated for the featured kit.
   * Used by the landing-page card to autoplay a muted preview when in view.
   */
  previewVideoUrl: string | null;
  /** True only on the featured kit, for the UI to render the preview shell. */
  featured: boolean;
};

export async function GET() {
  const sb = getSupabaseAdmin();

  // Public landing page only — exclude expert-originated resources so they
  // never appear on /resources. Those belong inside the gated member
  // portal (members can see them via /api/member/resources). The marker is
  // `originating_expert_id IS NULL` — admin-curated resources have no
  // expert link; expert-uploaded ones do.
  const { data: rows, error } = await sb
    .from("resources")
    .select(
      "topic_slug, topic_title, topic_summary, category, resource_card_url, external_url, kind, is_free",
    )
    .eq("is_published", true)
    .eq("submission_status", "approved")
    .is("originating_expert_id", null)
    .order("topic_slug", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byKit = new Map<string, Kit>();
  // Track first encountered video URL per kit (only used for the featured one).
  const firstVideoBySlug = new Map<string, string>();

  for (const r of rows ?? []) {
    const isVideo = r.kind.startsWith("video_") || r.kind === "audio";
    if (isVideo && r.external_url && !firstVideoBySlug.has(r.topic_slug)) {
      firstVideoBySlug.set(r.topic_slug, r.external_url);
    }
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
        previewVideoUrl: null,
        featured: false,
      });
    }
  }

  // Annotate the featured kit (if present) with its preview video URL.
  const featured = byKit.get(FEATURED_KIT_SLUG);
  if (featured) {
    featured.featured = true;
    featured.previewVideoUrl = firstVideoBySlug.get(FEATURED_KIT_SLUG) ?? null;
  }

  const kits = Array.from(byKit.values()).sort((a, b) => {
    // Featured first, then alphabetical.
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  return NextResponse.json({ kits });
}
