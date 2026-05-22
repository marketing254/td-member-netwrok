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
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // Supabase storage public buckets serve images over https; allow data: for
  // base64 placeholders the MUI Image component uses.
  `img-src 'self' data: blob: ${SUPABASE_HTTPS}`,
  `connect-src 'self' ${SUPABASE_HTTPS} ${SUPABASE_WSS}`,
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
