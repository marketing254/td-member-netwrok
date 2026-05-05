import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require any signed-in user.
const isAuthenticated = createRouteMatcher([
  "/welcome",
  "/dashboard(.*)",
  "/vendor(.*)",
  "/admin(.*)",
]);

// Per-role surfaces — used to redirect authenticated-but-wrong-role users.
const isMemberArea = createRouteMatcher(["/dashboard(.*)", "/welcome"]);
const isVendorArea = createRouteMatcher(["/vendor(.*)"]);
const isAdminArea = createRouteMatcher(["/admin(.*)"]);

// Vendor signup is public — anyone can apply (it creates the vendor account).
const isPublicVendorRoute = createRouteMatcher(["/vendor/signup"]);

export default clerkMiddleware(async (auth, req) => {
  // Public routes: vendor signup form is unauthenticated.
  if (isPublicVendorRoute(req)) return;

  if (!isAuthenticated(req)) return;

  // Block unauthenticated requests, redirect to sign-in.
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  // Read role from Clerk publicMetadata (set at signup time).
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ?? "member";

  // Cross-role gating: signed-in users hitting the wrong portal get bounced.
  // (Skip during prototype phase if metadata isn't yet wired — comment out the block.)
  if (process.env.NEXT_PUBLIC_ENFORCE_ROLES === "true") {
    if (isMemberArea(req) && role !== "member") {
      const fallback = role === "vendor" ? "/vendor" : role === "admin" ? "/admin" : "/";
      return Response.redirect(new URL(fallback, req.url));
    }
    if (isVendorArea(req) && role !== "vendor") {
      const fallback = role === "member" ? "/dashboard" : role === "admin" ? "/admin" : "/";
      return Response.redirect(new URL(fallback, req.url));
    }
    if (isAdminArea(req) && role !== "admin") {
      const fallback = role === "vendor" ? "/vendor" : role === "member" ? "/dashboard" : "/";
      return Response.redirect(new URL(fallback, req.url));
    }
  }
  console.log(sessionClaims);
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
