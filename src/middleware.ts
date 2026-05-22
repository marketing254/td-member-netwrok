import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabase } from "@/lib/supabase/middleware-ssr";

/**
 * Auth gates for the portal surfaces.
 *
 *   /vendor/*  → requires a Supabase session OR the legacy test/test cookie.
 *                Public exceptions: /vendor/login, /vendor/signup, /vendor/applied.
 *   /admin/*   → requires a Supabase session AND an active admin_users row.
 *                Public exceptions: /admin/login.
 *
 * The middleware also refreshes the Supabase session cookie on every
 * request (createMiddlewareSupabase + getUser handles this automatically).
 */

const VENDOR_LEGACY_COOKIE = "vendor_session";

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

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const res = NextResponse.next({ request: req });

  // Only run on protected portal paths. Auth callback is always allowed.
  if (pathname.startsWith("/auth/")) return res;

  const isVendor = pathname.startsWith("/vendor") && !isPublicVendorPath(pathname);
  const isAdmin = pathname.startsWith("/admin") && !isPublicAdminPath(pathname);

  if (!isVendor && !isAdmin) {
    // Outside the gated surfaces — still run Supabase to keep the session
    // cookie fresh so /vendor/login etc. read the latest state.
    try {
      const supabase = createMiddlewareSupabase(req, res);
      await supabase.auth.getUser();
    } catch {
      // ignore — session refresh is best effort
    }
    return res;
  }

  // ─────────────────────────────────────────────────────────────────
  // VENDOR PORTAL
  // ─────────────────────────────────────────────────────────────────
  if (isVendor) {
    const legacySession = req.cookies.get(VENDOR_LEGACY_COOKIE)?.value;
    if (legacySession) {
      // Preview test/test session — allow through.
      return res;
    }

    try {
      const supabase = createMiddlewareSupabase(req, res);
      const { data } = await supabase.auth.getUser();
      if (data.user) return res;
    } catch (err) {
      console.error("[middleware:vendor] auth check failed:", err);
    }

    const target = req.nextUrl.clone();
    target.pathname = "/vendor/login";
    target.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(target);
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
        return NextResponse.redirect(target);
      }

      // Confirm the user has an active admin row. We use the same anon-key
      // client because the admin_users policy grants self-select.
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id, active")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();

      if (!adminRow || !adminRow.active) {
        // Signed in but not an admin — kick them to the public homepage.
        const target = req.nextUrl.clone();
        target.pathname = "/admin/login";
        target.search = `?error=${encodeURIComponent("Your account is not an admin.")}`;
        return NextResponse.redirect(target);
      }

      return res;
    } catch (err) {
      console.error("[middleware:admin] auth check failed:", err);
      const target = req.nextUrl.clone();
      target.pathname = "/admin/login";
      return NextResponse.redirect(target);
    }
  }

  return res;
}

export const config = {
  // Match every page route, but exclude Next.js internals and static
  // assets. The middleware short-circuits early for non-gated paths.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
