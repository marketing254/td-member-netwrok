import { NextResponse, type NextRequest } from "next/server";

// Vendor portal gate.
// Authenticated routes: /vendor/* — except the public sign-in / sign-up surfaces.
// Auth signal: presence of the `vendor_session` cookie set by /api/vendor/login.
// Member + admin areas remain ungated during the open-portal preview phase.

const SESSION_COOKIE = "vendor_session";

function isPublicVendorPath(pathname: string) {
  return (
    pathname === "/vendor/login" ||
    pathname.startsWith("/vendor/login/") ||
    pathname === "/vendor/signup" ||
    pathname.startsWith("/vendor/signup/")
  );
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only gate the vendor portal. Everything else is unrestricted in preview.
  if (!pathname.startsWith("/vendor")) return NextResponse.next();
  if (isPublicVendorPath(pathname)) return NextResponse.next();

  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (session) return NextResponse.next();

  const target = req.nextUrl.clone();
  target.pathname = "/vendor/login";
  target.search = `?redirect=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(target);
}

export const config = {
  // Limit middleware to vendor pages — keeps everything else fast and
  // sidesteps matching Next internals or static assets.
  matcher: ["/vendor/:path*"],
};
