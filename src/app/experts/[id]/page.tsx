import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import PublicExpertProfileView from "@/components/directory/PublicExpertProfileView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /experts/[id] — PUBLIC profile page for an accepted founding expert.
 * Linked from the founding-experts directory on /experts. This server
 * component only fetches + gates the data; the UI lives in the client
 * view (MUI's `component={Link}` can't cross the server boundary).
 */
export default async function PublicExpertProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = getSupabaseAdmin();

  const { data: expert } = await sb
    .from("experts")
    .select("id, display_name, full_name, specialty, company_name, bio, topics, website, booking_link, headshot_url, status")
    .eq("id", id)
    .maybeSingle();
  // Same publish-ready gate as the directory: no headshot/bio → not public.
  if (!expert || expert.status !== "active" || !expert.headshot_url || !expert.bio) notFound();

  // Kit titles only — a public teaser; the content stays members-only.
  const { data: kitRows } = await sb
    .from("resources")
    .select("topic_slug, topic_title")
    .eq("originating_expert_id", id)
    .eq("is_published", true)
    .eq("submission_status", "approved");
  const kits = [...new Map((kitRows ?? []).map((r) => [r.topic_slug, r.topic_title])).values()];

  // Spotlight teaser — kind + date ONLY. Titles/bodies stay members-only;
  // the public view paints blurred decoy text (real content never ships).
  const { data: spotRows } = await sb
    .from("profile_spotlights")
    .select("id, kind, event_date")
    .eq("expert_id", id)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(5);
  const spotlights = (spotRows ?? []).map((s) => ({
    id: s.id,
    kind: s.kind.charAt(0).toUpperCase() + s.kind.slice(1),
    dateLabel: s.event_date
      ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(s.event_date))
      : null,
  }));

  const topics = (expert.topics ?? "")
    .split(/[,\n;]+/)
    .map((t: string) => t.trim())
    .filter(Boolean);

  return (
    <PublicExpertProfileView
      expert={{
        name: expert.display_name || expert.full_name || "DMN Expert",
        specialty: expert.specialty,
        company_name: expert.company_name,
        bio: expert.bio,
        headshot_url: expert.headshot_url,
        website: expert.website,
        // booking_link intentionally NOT passed — member-portal-only benefit.
      }}
      topics={topics}
      kits={kits}
      spotlights={spotlights}
    />
  );
}
