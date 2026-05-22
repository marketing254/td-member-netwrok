import type { NextConfig } from "next";

/**
 * Minimal Next.js config — security headers moved to middleware.ts
 * because Vercel's modifyConfig step on Next.js 16.2.x was choking on
 * the headers() function. Middleware applies the same headers at request
 * time, with the bonus that they're testable and easier to evolve.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
