import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resolveNetworkAuthor } from "@/lib/network/author";
import { apiError, serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/network/feed
 *
 * Returns the global network feed of published expert posts, newest first.
 * Open to anyone with a valid session who resolves to a network author
 * (expert / member / partner / admin). Anonymous visitors are blocked.
 *
 * Each post is joined with:
 *   - The author expert (display name, headshot, specialty) so the UI
 *     doesn't have to round-trip.
 *   - The current viewer's reaction (if any) so the UI can render the
 *     correct toggle state without a second fetch.
 *   - The most-recent 2 comments inline (for preview); the full thread
 *     loads via /api/network/posts/[id]/comments on demand.
 *
 * Pagination: cursor-based by published_at. Pass ?before=<iso> to get
 * the next page; pass ?limit=N (max 50, default 20).
 */
export async function GET(req: Request) {
  const cookieClient = await createServerSupabase();
  const { data: userData, error: userErr } = await cookieClient.auth.getUser();
  if (userErr || !userData?.user) return apiError.unauthorized();

  const author = await resolveNetworkAuthor(userData.user.id, userData.user.email ?? null);
  if (!author) return apiError.forbidden();

  const url = new URL(req.url);
  const before = url.searchParams.get("before");
  const limitRaw = Number(url.searchParams.get("limit") ?? "20");
  const limit = Math.min(50, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 20));

  try {
    const admin = getSupabaseAdmin();

    // 1. Fetch posts (published only).
    let query = admin
      .from("expert_posts")
      .select(
        "id, expert_id, content, image_url, link_url, published_at, reaction_count, comment_count, created_at",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (before) {
      query = query.lt("published_at", before);
    }
    const { data: posts, error: postsErr } = await query;
    if (postsErr) throw postsErr;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ posts: [], cursor: null });
    }

    const postIds = posts.map((p) => p.id);
    const expertIds = Array.from(new Set(posts.map((p) => p.expert_id)));

    // 2. Hydrate expert metadata once for the batch.
    const { data: experts } = await admin
      .from("experts")
      .select("id, display_name, full_name, specialty, headshot_url")
      .in("id", expertIds);
    const expertMap = new Map(
      (experts ?? []).map((e) => [e.id, e]),
    );

    // 3. Viewer's own reactions (so the UI knows what's already pressed).
    const { data: myReactions } = await admin
      .from("post_reactions")
      .select("post_id, kind")
      .eq("author_auth_user_id", author.authUserId)
      .in("post_id", postIds);
    const myReactionMap = new Map(
      (myReactions ?? []).map((r) => [r.post_id, r.kind]),
    );

    // 4. Preview comments — last 2 per post. Postgres doesn't have a
    //    LIMIT-per-group out of the box, so we fetch a small batch and
    //    bucket in JS. Plenty fast at v1 traffic.
    const { data: previewComments } = await admin
      .from("post_comments")
      .select(
        "id, post_id, author_kind, author_display_name, author_subtitle, content, created_at",
      )
      .in("post_id", postIds)
      .is("hidden_at", null)
      .order("created_at", { ascending: false })
      .limit(postIds.length * 4);

    const commentsByPost = new Map<string, typeof previewComments>();
    for (const c of previewComments ?? []) {
      const bucket = commentsByPost.get(c.post_id) ?? [];
      if (bucket.length < 2) bucket.push(c);
      commentsByPost.set(c.post_id, bucket);
    }

    // 5. Assemble.
    const enriched = posts.map((p) => {
      const expert = expertMap.get(p.expert_id);
      const preview = (commentsByPost.get(p.id) ?? []).slice().reverse();
      return {
        ...p,
        author_kind: "expert" as const,
        author_display_name: expert?.display_name || expert?.full_name || "Expert",
        author_subtitle: expert?.specialty ?? null,
        author_headshot_url: expert?.headshot_url ?? null,
        my_reaction: myReactionMap.get(p.id) ?? null,
        preview_comments: preview,
      };
    });

    const cursor = enriched.length === limit
      ? enriched[enriched.length - 1]!.published_at
      : null;

    return NextResponse.json({ posts: enriched, cursor, viewer: { kind: author.kind } });
  } catch (err) {
    return serverError(err, { route: "GET /api/network/feed" });
  }
}
