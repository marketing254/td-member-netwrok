import type { MetadataRoute } from "next";

const SITE = "https://dentalmembernetwork.com";

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
