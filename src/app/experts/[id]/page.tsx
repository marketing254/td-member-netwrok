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
    />
  );
}
