import type { MetadataRoute } from "next";
import { getReleasedArticles } from "@/lib/blog";
import { CHAIRSIDE_ENABLED, getLiveEpisodes } from "@/lib/chairside";
import { MEMBER_TOOLS } from "@/lib/toolsData";

const SITE = "https://www.dentalmembernetwork.com";

/**
 * Next.js auto-generates /sitemap.xml from this file. Update PAGES when
 * you add a new public route; private (gated) routes intentionally
 * stay out of the sitemap so they don't leak the URL surface to Google
 * but more importantly because there's nothing crawlable on them.
 *
 * `lastModified` uses build time — every redeploy refreshes the date,
 * which is the right signal for marketing pages that get small copy
 * tweaks but no full rewrites.
 */
// Scheduled blog posts enter the sitemap on their day without a redeploy.
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Priorities follow Google's de-facto convention: 1.0 = homepage,
  // 0.8 = primary conversion pages, 0.6 = secondary marketing, 0.3 = legal.
  const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/join", priority: 0.9, changeFrequency: "weekly" },
    { path: "/experts", priority: 0.8, changeFrequency: "weekly" },
    { path: "/partners", priority: 0.8, changeFrequency: "weekly" },
    { path: "/resources", priority: 0.8, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    // Public RIDA Live replay (free, no login), spec v2 29 Sep 2026. Not in the nav.
    { path: "/replay/rida-summit", priority: 0.8, changeFrequency: "monthly" },
    // Public tool previews — one indexable page per calculator. The tool
    // itself stays member-gated; only the preview image and copy are public.
    { path: "/tools", priority: 0.8, changeFrequency: "weekly" },
    ...MEMBER_TOOLS.map((t) => ({
      path: `/tools/${t.id}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
    })),
    // One entry per published article — the registry is the source of truth.
    ...getReleasedArticles().map((a) => ({
      path: `/blog/${a.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
    // Chairside, the podcast: the show home plus one page per episode.
    ...(CHAIRSIDE_ENABLED ? [{ path: "/chairside", priority: 0.8, changeFrequency: "weekly" as const }] : []),
    ...getLiveEpisodes().map((e) => ({
      path: `/chairside/${e.slug}`,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
    { path: "/reviews", priority: 0.6, changeFrequency: "monthly" },
    { path: "/waitlist/thanks", priority: 0.3, changeFrequency: "yearly" },
    { path: "/legal/refund", priority: 0.3, changeFrequency: "yearly" },
    { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/agreement/member", priority: 0.3, changeFrequency: "yearly" },
    { path: "/agreement/vendor", priority: 0.3, changeFrequency: "yearly" },
  ];

  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
