import type { NextConfig } from "next";

/**
 * Minimal Next.js config — security headers moved to middleware.ts
 * because Vercel's modifyConfig step on Next.js 16.2.x was choking on
 * the headers() function. Middleware applies the same headers at request
 * time, with the bonus that they're testable and easier to evolve.
 *
 * `compiler.removeConsole` strips every `console.*` call from client-
 * bundled code in production builds — except `console.error`, which
 * we keep for diagnostic logging that surfaces in browser dev tools but
 * never leaks PII (we route detailed errors through server logs via the
 * lib/api/errorResponse helper).
 *
 * Server-side console.log is untouched — server logs stay on the
 * platform (Vercel logs / your hosting provider) and never reach the
 * end user's browser.
 */
const supabaseHost = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  // next/image needs to know about external image hosts before it'll
  // optimize them. Adding the Supabase Storage host means every cover,
  // headshot, infographic, and partner logo gets resized + served as
  // WebP/AVIF via Vercel's image CDN.
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https" as const,
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    // Cache optimized variants on the edge for 24 hours. Keeps the
    // bandwidth bill flat for hot covers + headshots.
    minimumCacheTTL: 60 * 60 * 24,
  },
};

export default nextConfig;
