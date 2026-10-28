import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Newest kits shown on the homepage shelf. */
const SHELF_SIZE = 6;

/**
 * GET /api/kit-cards — PUBLIC.
 *
 * The homepage "Just dropped." shelf: the newest few published kits (card
 * art, title, category, expert) plus the total count of kits in the
 * library. Card art + titles only — no resource contents, no member data.
 * The art itself is the marketing asset (titles are baked into the
 * images), so exposing it is the point.
 */
export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("resources")
      .select("topic_slug, topic_title, category, portal_card_url, created_at, kit_type, originating_expert_id")
      .eq("is_published", true)
      .eq("submission_status", "approved")
      .not("portal_card_url", "is", null)
      .order("created_at", { ascending: false });
    if (error) throw error;

    // One card per kit, keeping the newest created_at per topic (rows come
    // back newest-first, so first occurrence wins).
    const seen = new Set<string>();
    const kits: { slug: string; title: string; card: string; category: string | null; expertId: string | null; href?: string }[] = [];
    const chairsideOn = process.env.NEXT_PUBLIC_CHAIRSIDE_ENABLED === "true";
    for (const r of data ?? []) {
      if (seen.has(r.topic_slug) || !r.portal_card_url) continue;
      const isEpisode = (r as { kit_type?: string | null }).kit_type === "chairside";
      // While the Chairside switch is off the episode is left out entirely.
      if (isEpisode && !chairsideOn) continue;
      seen.add(r.topic_slug);
      kits.push({
        slug: r.topic_slug,
        title: r.topic_title,
        card: r.portal_card_url,
        category: isEpisode ? "Chairside" : r.category,
        expertId: r.originating_expert_id ?? null,
        // Chairside episodes link to their public page (Lester, 27 Oct 2026).
        ...(isEpisode ? { href: `/chairside/${r.topic_slug}` } : {}),
      });
    }

    const shelf = kits.slice(0, SHELF_SIZE);
    const expertIds = [...new Set(shelf.map((k) => k.expertId).filter((id): id is string => !!id))];
    const names = new Map<string, string>();
    if (expertIds.length > 0) {
      const { data: experts } = await admin.from("experts").select("id, full_name").in("id", expertIds);
      for (const e of experts ?? []) if (e.full_name) names.set(e.id, e.full_name);
    }

    const cards = shelf.map(({ expertId, ...k }) => ({ ...k, expert: expertId ? names.get(expertId) ?? null : null }));

    return NextResponse.json(
      { cards, total: kits.length },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (err) {
    return serverError(err, { route: "GET /api/kit-cards" });
  }
}
