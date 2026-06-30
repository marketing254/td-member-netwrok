import type { MetadataRoute } from "next";

const SITE = "https://dentalmembernetwork.com";

/**
 * Next.js auto-generates /robots.txt from this file.
 *
 * Strategy:
 *  - All search + AI crawlers can index public marketing pages.
 *  - Logged-in portals (/dashboard, /admin, /vendor, /expert) are
 *    disallowed — they require auth, contain no SEO value, and would
 *    only ever return redirects to the relevant login page.
 *  - We explicitly allow modern AI crawlers (GPTBot, ClaudeBot,
 *    PerplexityBot, Google-Extended, ChatGPT-User, anthropic-ai)
 *    because the default robots.txt convention is "if not mentioned,
 *    user-agent-specific rules might block by default" and we *want*
 *    citation in LLM answers.
 *  - We block the training-only crawler CCBot (Common Crawl) — it
 *    feeds dataset builders rather than search engines, so blocking
 *    it preserves training opt-out without losing search citation.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule — everyone else
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/vendor",
          "/vendor/",
          "/expert",
          "/expert/",
          "/upgrade",
          "/auth/",
          "/member/login",
        ],
      },
      // Explicitly allow AI search bots so they can cite us
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      // Block training-only crawlers (no citation upside)
      { userAgent: "CCBot", disallow: "/" },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
