import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabase } from "@/lib/supabase/middleware-ssr";

/**
 * Auth gates for the portal surfaces + security headers on every response.
 *
 *   /vendor/*  → requires a Supabase session OR the legacy test/test cookie.
 *                Public exceptions: /vendor/login, /vendor/signup, /vendor/applied.
 *   /admin/*   → requires a Supabase session AND an active admin_users row.
 *                Public exceptions: /admin/login.
 *
 * The middleware also refreshes the Supabase session cookie on every
 * request (createMiddlewareSupabase + getUser handles this automatically).
 *
 * Security headers (HSTS, CSP, X-Frame-Options, etc.) are applied here
 * rather than in next.config.ts so that Vercel's modifyConfig step doesn't
 * choke on the headers() function (a Next.js 16.2.x + Vercel quirk).
 */

const VENDOR_LEGACY_COOKIE = "vendor_session";

function buildCsp(): string {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const supabaseHost = supabaseUrl.replace(/^https?:\/\//, "");
  const supabaseHttps = supabaseHost ? `https://${supabaseHost}` : "";
  const supabaseWss = supabaseHost ? `wss://${supabaseHost}` : "";

  return [
    "default-src 'self'",
    // vercel.live is the Vercel Live feedback widget that gets auto-injected
    // into preview deployments. It's harmless and Vercel-owned; allowlisting
    // it just silences the CSP console errors on preview URLs. The same
    // CSP ships to production (where vercel.live is never loaded), so this
    // doesn't expand the attack surface for real users.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://vercel.live",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
    "font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com data:",
    `img-src 'self' data: blob: ${supabaseHttps} https://www.google-analytics.com https://www.googletagmanager.com https://vercel.live https://vercel.com`,
    // media-src controls <video> and <audio> sources. Without this, videos
    // from Supabase Storage are blocked because default-src 'self' falls back.
    `media-src 'self' blob: ${supabaseHttps}`,
    `connect-src 'self' ${supabaseHttps} ${supabaseWss} https://cdn.jsdelivr.net https://fonts.gstatic.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://vercel.live https://*.pusher.com wss://*.pusher.com`,
    // frame-src controls <iframe> sources. Supabase is needed so the resource
    // viewer can render PDFs inline; Microsoft Office Online viewer is needed
    // for slide decks (.pptx).
    `frame-src 'self' ${supabaseHttps} https://view.officeapps.live.com https://vercel.live`,
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ]
    .map((d) => d.replace(/\s+/g, " ").trim())
    .join("; ");
}

const CSP = buildCsp();

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  );
  res.headers.set("X-DNS-Prefetch-Control", "on");
  res.headers.set("Content-Security-Policy", CSP);
  return res;
}

function isPublicVendorPath(pathname: string) {
  return (
    pathname === "/vendor/login" ||
    pathname.startsWith("/vendor/login/") ||
    pathname === "/vendor/signup" ||
    pathname.startsWith("/vendor/signup/") ||
    pathname === "/vendor/applied"
  );
}

function isPublicAdminPath(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

function isPublicMemberPath(_pathname: string) {
  // All /dashboard/* paths are gated. Members enter via /member/login → magic
  // link → /auth/callback → /dashboard.
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const res = NextResponse.next({ request: req });

  // Only run on protected portal paths. Auth callback is always allowed.
  if (pathname.startsWith("/auth/")) return applySecurityHeaders(res);

  const isVendor = pathname.startsWith("/vendor") && !isPublicVendorPath(pathname);
  const isAdmin = pathname.startsWith("/admin") && !isPublicAdminPath(pathname);
  const isMember = pathname.startsWith("/dashboard") && !isPublicMemberPath(pathname);

  if (!isVendor && !isAdmin && !isMember) {
    // Outside the gated surfaces — still run Supabase to keep the session
    // cookie fresh so /vendor/login etc. read the latest state.
    try {
      const supabase = createMiddlewareSupabase(req, res);
      await supabase.auth.getUser();
    } catch {
      // ignore — session refresh is best effort
    }
    return applySecurityHeaders(res);
  }

  // ─────────────────────────────────────────────────────────────────
  // VENDOR PORTAL
  // ─────────────────────────────────────────────────────────────────
  if (isVendor) {
    const legacySession = req.cookies.get(VENDOR_LEGACY_COOKIE)?.value;
    if (legacySession) {
      return applySecurityHeaders(res);
    }

    try {
      const supabase = createMiddlewareSupabase(req, res);
      const { data } = await supabase.auth.getUser();
      if (data.user) return applySecurityHeaders(res);
    } catch (err) {
      console.error("[middleware:vendor] auth check failed:", err);
    }

    const target = req.nextUrl.clone();
    target.pathname = "/vendor/login";
    target.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return applySecurityHeaders(NextResponse.redirect(target));
  }

  // ─────────────────────────────────────────────────────────────────
  // ADMIN CONSOLE
  // ─────────────────────────────────────────────────────────────────
  if (isAdmin) {
    try {
      const supabase = createMiddlewareSupabase(req, res);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const target = req.nextUrl.clone();
        target.pathname = "/admin/login";
        target.search = `?redirect=${encodeURIComponent(pathname + search)}`;
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id, active")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();

      if (!adminRow || !adminRow.active) {
        const target = req.nextUrl.clone();
        target.pathname = "/admin/login";
        target.search = `?error=${encodeURIComponent("Your account is not an admin.")}`;
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      return applySecurityHeaders(res);
    } catch (err) {
      console.error("[middleware:admin] auth check failed:", err);
      const target = req.nextUrl.clone();
      target.pathname = "/admin/login";
      return applySecurityHeaders(NextResponse.redirect(target));
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // MEMBER PORTAL  (/dashboard/*)
  // ─────────────────────────────────────────────────────────────────
  if (isMember) {
    try {
      const supabase = createMiddlewareSupabase(req, res);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const target = req.nextUrl.clone();
        target.pathname = "/member/login";
        target.search = `?redirect=${encodeURIComponent(pathname + search)}`;
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      // Confirm the user has an active members row.
      const { data: memberRow } = await supabase
        .from("members")
        .select("id, status")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();

      if (!memberRow || memberRow.status !== "active") {
        const target = req.nextUrl.clone();
        target.pathname = "/member/login";
        target.search = `?error=${encodeURIComponent("Your member portal isn't active yet. We'll email you when it is.")}`;
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      return applySecurityHeaders(res);
    } catch (err) {
      console.error("[middleware:member] auth check failed:", err);
      const target = req.nextUrl.clone();
      target.pathname = "/member/login";
      return applySecurityHeaders(NextResponse.redirect(target));
    }
  }

  return applySecurityHeaders(res);
}

export const config = {
  // Match every page route, but exclude Next.js internals and static
  // assets. The middleware short-circuits early for non-gated paths.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
