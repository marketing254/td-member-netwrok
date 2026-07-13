import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import PublicPartnerProfileView from "@/components/directory/PublicPartnerProfileView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /partners/[id] — PUBLIC profile page for an accepted founding partner.
 * Linked from the founding-partners directory on /partners. This server
 * component only fetches + gates the data; the UI lives in the client
 * view (MUI's `component={Link}` can't cross the server boundary).
 */
export default async function PublicPartnerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = getSupabaseAdmin();

  const { data: v } = await sb
    .from("vendors")
    .select("id, company_name, display_name, category, description, logo_url, avatar_url, website, calendar_link, status, verified, billing_parent_id")
    .eq("id", id)
    .maybeSingle();
  // Same publish-ready gate as the directory: no logo/description → not public.
  if (!v || v.status !== "approved" || !v.verified || !(v.logo_url ?? v.avatar_url) || !v.description) notFound();
  if (v.billing_parent_id) {
    const { data: parent } = await sb
      .from("vendors")
      .select("status, verified")
      .eq("id", v.billing_parent_id)
      .maybeSingle();
    if (!parent || parent.status !== "approved" || !parent.verified) notFound();
  }

  // Approved offer headlines as a public teaser (no promo codes).
  const { data: offerRows } = await sb
    .from("offers")
    .select("id, headline, discount_value")
    .eq("vendor_id", id)
    .eq("review_status", "approved")
    .order("created_at", { ascending: false });

  return (
    <PublicPartnerProfileView
      partner={{
        name: v.display_name || v.company_name || "DMN Partner",
        category: v.category,
        description: v.description,
        logo_url: v.logo_url ?? v.avatar_url ?? null,
        website: v.website,
        // calendar_link intentionally NOT passed — member-portal-only benefit.
      }}
      offers={(offerRows ?? []).map((o) => ({ id: o.id, headline: o.headline, discount_value: o.discount_value }))}
    />
  );
}
