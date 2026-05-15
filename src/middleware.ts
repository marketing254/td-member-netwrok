import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require any signed-in user.
const isAuthenticated = createRouteMatcher([
  "/welcome",
  "/dashboard(.*)",
  "/vendor(/.*)?",
  "/admin(.*)",
]);

// Per-role surfaces — used to redirect authenticated-but-wrong-role users.
const isMemberArea = createRouteMatcher(["/dashboard(.*)", "/welcome"]);
const isVendorArea = createRouteMatcher(["/vendor(/.*)?"]);
const isAdminArea = createRouteMatcher(["/admin(.*)"]);

// Vendor signup is public — anyone can apply (it creates the vendor account).
// Vendor + admin sign-in pages are also public so users can authenticate.
const isPublicVendorRoute = createRouteMatcher([
  "/vendor/signup",
  "/vendor/signin(.*)",
  "/admin/signin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Public routes: vendor signup form is unauthenticated.
  if (isPublicVendorRoute(req)) return;

  if (!isAuthenticated(req)) return;

  // Block unauthenticated requests — redirect to the role-appropriate sign-in
  // page based on which area they were trying to reach. Without this, every
  // gated link would dump people on /signin (member-branded), even vendors.
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    const url = new URL(req.url);
    let signInPath = "/signin";
    if (isVendorArea(req)) signInPath = "/vendor/signin";
    else if (isAdminArea(req)) signInPath = "/admin/signin";
    const target = new URL(signInPath, req.url);
    target.searchParams.set("redirect_url", url.pathname + url.search);
    return NextResponse.redirect(target);
  }

  // Read role from Clerk publicMetadata (set at signup time).
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ?? "member";

  // Cross-role gating: signed-in users hitting the wrong portal get bounced.
  // (Skip during prototype phase if metadata isn't yet wired — comment out the block.)
  if (process.env.NEXT_PUBLIC_ENFORCE_ROLES === "true") {
    if (isMemberArea(req) && role !== "member") {
      const fallback = role === "vendor" ? "/vendor" : role === "admin" ? "/admin" : "/";
      return NextResponse.redirect(new URL(fallback, req.url));
    }
    if (isVendorArea(req) && role !== "vendor") {
      const fallback = role === "member" ? "/dashboard" : role === "admin" ? "/admin" : "/";
      return NextResponse.redirect(new URL(fallback, req.url));
    }
    if (isAdminArea(req) && role !== "admin") {
      const fallback = role === "vendor" ? "/vendor" : role === "member" ? "/dashboard" : "/";
      return NextResponse.redirect(new URL(fallback, req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
