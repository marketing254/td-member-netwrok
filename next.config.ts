import type { NextConfig } from "next";

/**
 * Security headers shipped on every response.
 *
 * - HSTS: 2y, includeSubDomains, preload — locks the domain to HTTPS once
 *   you've pushed the apex + www onto the HSTS preload list (https://hstspreload.org).
 * - X-Frame-Options + frame-ancestors CSP: block clickjacking.
 * - X-Content-Type-Options: stops MIME sniffing.
 * - Referrer-Policy: leaks no path/query to third-party sites.
 * - Permissions-Policy: kill features we don't use.
 * - Content-Security-Policy: tight by default; expand allowlist only when
 *   a new vendor needs a new origin (Supabase storage, Gmail SMTP doesn't
 *   touch the browser, etc).
 *
 * If you add Stripe, Posthog, or any other browser-loaded SDK, you MUST
 * update the CSP allowlist below.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const SUPABASE_HOST = SUPABASE_URL.replace(/^https?:\/\//, "");
const SUPABASE_WSS = SUPABASE_HOST ? `wss://${SUPABASE_HOST}` : "";
const SUPABASE_HTTPS = SUPABASE_HOST ? `https://${SUPABASE_HOST}` : "";

const csp = [
  "default-src 'self'",
  // Next.js inlines small chunks at runtime; 'unsafe-inline' is required
  // unless we switch to strict-dynamic with nonce — leave for now.
  // googletagmanager.com hosts gtag.js (Google Analytics 4 loader).
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com",
  // Three.js (and other 3D / animation libraries) spawn Web Workers from
  // blob: URLs for offloading geometry/physics work to a background thread.
  // Without this directive, browsers fall back to script-src — and even
  // though we allow blob: there, some browsers strictly require an explicit
  // worker-src for blob workers.
  "worker-src 'self' blob:",
  // Same reasoning for child-src (some older Chromium-based browsers
  // resolve worker creation via child-src instead of worker-src).
  "child-src 'self' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // Supabase storage public buckets serve images over https; allow data: for
  // base64 placeholders the MUI Image component uses. Google Analytics
  // also fires beacons as image GETs (the gif/collect endpoints).
  `img-src 'self' data: blob: ${SUPABASE_HTTPS} https://www.google-analytics.com https://www.googletagmanager.com`,
  // jsdelivr.net is used by troika-three-text (3D-text library on the
  // landing page) to fetch unicode font glyph lookup tables on demand.
  // gstatic.com hosts the actual font WOFF files Google Fonts pulls.
  // google-analytics.com + googletagmanager.com receive GA4 events.
  // *.analytics.google.com covers regional analytics endpoints.
  `connect-src 'self' ${SUPABASE_HTTPS} ${SUPABASE_WSS} https://cdn.jsdelivr.net https://fonts.gstatic.com https://www.google-analytics.com https://www.googletagmanager.com https://*.analytics.google.com`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

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
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
