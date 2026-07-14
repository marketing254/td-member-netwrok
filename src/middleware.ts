import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabase } from "@/lib/supabase/middleware-ssr";

/**
 * Auth gates for the portal surfaces + security headers on every response.
 *
 *   /vendor/*  → requires a Supabase session OR the legacy test/test cookie.
 *                Public exceptions: /vendor/login, /vendor/applied.
 *                (Partner applications now live inline on /partners#apply —
 *                the standalone /vendor/signup wizard has been removed.)
 *   /admin/*   → requires a Supabase session AND an active admin_users row.
 *                Public exceptions: /admin/login.
 *   /dashboard/* → requires a member session AND subscription_status = 'active'.
 *                  Unpaid members are redirected to /upgrade.
 *   /upgrade   → requires a member session. Already-paid members are
 *                redirected back to /dashboard.
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
    // YCBM (YouCanBookMe) embed.ycb.me + youcanbook.me — the coaching-session
    // booking widget on member kit detail pages.
    // Stripe.js — js.stripe.com hosts the script; m.stripe.network is the
    // 3D-Secure / risk-check iframe host used by PaymentElement.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://vercel.live https://embed.ycb.me https://*.ycb.me https://*.youcanbook.me https://js.stripe.com https://*.js.stripe.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live https://*.ycb.me https://*.youcanbook.me",
    "font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com https://*.ycb.me https://*.youcanbook.me data:",
    `img-src 'self' data: blob: ${supabaseHttps} https://www.google-analytics.com https://www.googletagmanager.com https://vercel.live https://vercel.com https://*.ycb.me https://*.youcanbook.me https://*.stripe.com`,
    // media-src controls <video> and <audio> sources. Without this, videos
    // from Supabase Storage are blocked because default-src 'self' falls back.
    `media-src 'self' blob: ${supabaseHttps}`,
    // Stripe XHR: api.stripe.com for tokenization + subscription lookups,
    // js.stripe.com + m.stripe.network for risk-check calls the SDK makes.
    `connect-src 'self' ${supabaseHttps} ${supabaseWss} https://cdn.jsdelivr.net https://fonts.gstatic.com https://www.google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://vercel.live https://*.pusher.com wss://*.pusher.com https://*.ycb.me https://*.youcanbook.me https://api.stripe.com https://js.stripe.com https://m.stripe.network https://maps.googleapis.com`,
    // frame-src controls <iframe> sources. Supabase is needed so the resource
    // viewer can render PDFs inline; Microsoft Office Online viewer is needed
    // for slide decks (.pptx). YCBM domains let the booking widget render
    // the calendar iframe. Spline (my.spline.design + prod.spline.design)
    // hosts the 3D hero scene iframe. Stripe: js.stripe.com hosts the
    // PaymentElement iframe; hooks.stripe.com hosts 3-D Secure challenges.
    `frame-src 'self' ${supabaseHttps} https://view.officeapps.live.com https://vercel.live https://*.ycb.me https://*.youcanbook.me https://my.spline.design https://*.spline.design https://js.stripe.com https://hooks.stripe.com https://*.js.stripe.com`,
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
    pathname === "/vendor/applied"
  );
}

// `/experts` (plural, public marketing page with the application form) is
// completely separate from `/expert/*` (the authenticated portal). The
// gate below only matches the singular form.
function isPublicExpertPath(pathname: string) {
  return (
    pathname === "/expert/login" ||
    pathname.startsWith("/expert/login/") ||
    pathname === "/expert/applied"
  );
}

function isPublicAdminPath(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

function isPublicMemberPath(_pathname: string) {
  // All /dashboard/* paths are gated. Members enter via /member/login → magic
  // link → /auth/callback → /upgrade (if unpaid) → /dashboard (once paid).
  return false;
}

function isUpgradePath(pathname: string) {
  return pathname === "/upgrade" || pathname.startsWith("/upgrade/");
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const res = NextResponse.next({ request: req });

  // Member tools render inside the portal's own <iframe>. The global
  // frame-ancestors 'none' would make the browser refuse to frame them —
  // even by our own page — so this one path gets a same-origin framing
  // policy instead. Auth is enforced inside the route itself
  // (requireMemberOrAdminPreview), and 'self' still blocks any other
  // site from embedding the tools.
  if (pathname.startsWith("/api/member/tools/")) {
    applySecurityHeaders(res);
    res.headers.set(
      "Content-Security-Policy",
      CSP.replace("frame-ancestors 'none'", "frame-ancestors 'self'"),
    );
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  // Only run on protected portal paths. Auth callback is always allowed.
  if (pathname.startsWith("/auth/")) return applySecurityHeaders(res);

  const isVendor = pathname.startsWith("/vendor") && !isPublicVendorPath(pathname);
  const isAdmin = pathname.startsWith("/admin") && !isPublicAdminPath(pathname);
  const isMember = pathname.startsWith("/dashboard") && !isPublicMemberPath(pathname);
  const isUpgrade = isUpgradePath(pathname);
  // Only the singular `/expert/*` is gated. `/experts` (plural) is the
  // public marketing page — Next.js routes /expert and /experts to
  // different folders, so prefix-matching with the boundary trailing
  // slash here is enough to avoid a false positive.
  const isExpert =
    (pathname === "/expert" || pathname.startsWith("/expert/")) &&
    !isPublicExpertPath(pathname);

  if (!isVendor && !isAdmin && !isMember && !isUpgrade && !isExpert) {
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
  // EXPERT PORTAL  (/expert/*)
  // Requires a Supabase session AND an `experts` row that isn't
  // suspended/archived. New auth users for experts are only created by
  // /api/admin/experts (PATCH invite), so a session belonging to a
  // non-expert email is rejected here too.
  // ─────────────────────────────────────────────────────────────────
  if (isExpert) {
    try {
      const supabase = createMiddlewareSupabase(req, res);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const target = req.nextUrl.clone();
        target.pathname = "/expert/login";
        target.search = `?redirect=${encodeURIComponent(pathname + search)}`;
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      const { data: expertRow } = await supabase
        .from("experts")
        .select("id, status")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();

      if (
        !expertRow ||
        expertRow.status === "suspended" ||
        expertRow.status === "archived"
      ) {
        const target = req.nextUrl.clone();
        target.pathname = "/expert/login";
        target.search = `?error=${encodeURIComponent("Your expert portal isn't available right now.")}`;
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      return applySecurityHeaders(res);
    } catch (err) {
      console.error("[middleware:expert] auth check failed:", err);
      const target = req.nextUrl.clone();
      target.pathname = "/expert/login";
      return applySecurityHeaders(NextResponse.redirect(target));
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // MEMBER PORTAL  (/dashboard/*)  — requires paid subscription
  // /upgrade — requires member session but blocks if already paid
  //
  // Admin bypass: an active admin_users row lets the same auth user hit
  // /dashboard without needing a members row or an active subscription.
  // This is a read-only preview for the team — the dashboard pages
  // handle a missing member row by rendering a lightweight admin
  // banner instead of crashing on `.first_name` etc.
  // ─────────────────────────────────────────────────────────────────
  if (isMember || isUpgrade) {
    try {
      const supabase = createMiddlewareSupabase(req, res);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const target = req.nextUrl.clone();
        target.pathname = "/member/login";
        target.search = `?redirect=${encodeURIComponent(pathname + search)}`;
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      // Admin bypass — checked before the member-row lookup so admins
      // whose auth account is NOT also linked to a members row still
      // pass through. Cheap query (single indexed lookup).
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id, active")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();
      if (adminRow?.active) {
        return applySecurityHeaders(res);
      }

      // Confirm the user has an active members row + read their billing status.
      const { data: memberRow } = await supabase
        .from("members")
        .select("id, status, subscription_status")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();

      if (!memberRow || memberRow.status !== "active") {
        const target = req.nextUrl.clone();
        target.pathname = "/member/login";
        target.search = `?error=${encodeURIComponent("Your member portal isn't active yet. We'll email you when it is.")}`;
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      const isPaid = memberRow.subscription_status === "active";

      // /dashboard/* → must be paid. Bounce unpaid members to /upgrade.
      if (isMember && !isPaid) {
        const target = req.nextUrl.clone();
        target.pathname = "/upgrade";
        target.search = "";
        return applySecurityHeaders(NextResponse.redirect(target));
      }

      // /upgrade → already paid members go straight to /dashboard.
      // Exception: keep them on /upgrade if they're returning from Stripe
      // (subscribed=1 or subscribed=0) so they see the processing banner /
      // cancel note instead of getting punted away mid-flow.
      if (isUpgrade && isPaid) {
        const sub = req.nextUrl.searchParams.get("subscribed");
        if (sub !== "1" && sub !== "0") {
          const target = req.nextUrl.clone();
          target.pathname = "/dashboard";
          target.search = "";
          return applySecurityHeaders(NextResponse.redirect(target));
        }
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
