import type { NextConfig } from "next";

/**
 * Security headers + Next.js production config.
 *
 * - HSTS: 2y, includeSubDomains, preload — once the apex + www are on the
 *   HSTS preload list (hstspreload.org), every visitor is locked to HTTPS.
 * - frame-ancestors / X-Frame-Options: block clickjacking embed attempts.
 * - X-Content-Type-Options: stops MIME sniffing.
 * - Referrer-Policy: leaks no path/query to third-party sites.
 * - Permissions-Policy: kills features we don't use.
 * - Content-Security-Policy: tight by default; expand allowlist only when
 *   a new vendor or third party legitimately needs a new origin.
 *
 * If you add Stripe, PostHog, Cloudflare Turnstile, or any other browser
 * SDK, update the CSP below.
 */

function buildCsp(): string {
  // Env-driven hosts get pulled in lazily and defensively — if a var is
  // missing at build time the directive still ends up syntactically valid.
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "");
  const supabaseHttps = supabaseHost ? `https://${supabaseHost}` : "";
  const supabaseWss = supabaseHost ? `wss://${supabaseHost}` : "";

  const directives: string[] = [
    "default-src 'self'",
    // googletagmanager.com hosts gtag.js (Google Analytics 4 loader).
    // blob: + 'unsafe-eval' are needed for Three.js workers on the landing page.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com",
    // Three.js spawns Web Workers from blob: URLs.
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    // Supabase public storage + GA tracking-pixel beacons (the gif fallback)
    `img-src 'self' data: blob: ${supabaseHttps} https://www.google-analytics.com https://www.googletagmanager.com`.trim(),
    // Supabase REST + realtime, jsdelivr (troika-three-text glyph data),
    // gstatic.com (Google Fonts WOFF files), GA4 collect endpoints.
    `connect-src 'self' ${supabaseHttps} ${supabaseWss} https://cdn.jsdelivr.net https://fonts.gstatic.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com`.trim(),
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.map((d) => d.replace(/\s+/g, " ").trim()).join("; ");
}

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy", value: buildCsp() },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Match every path. `/(.*)` is more universally understood by
        // Next.js's config validator than the `:path*` named-capture form,
        // which has tripped up Vercel's modifyConfig step on 16.2.x.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
