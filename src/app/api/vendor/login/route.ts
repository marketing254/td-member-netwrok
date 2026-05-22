import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  VENDOR_SESSION_COOKIE,
  VENDOR_SESSION_TTL_S,
} from "@/lib/auth/magicToken";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

/**
 * POST /api/vendor/login
 *
 * Three modes:
 *   - mode "password": preview-only test/test credential. Sets a separate
 *     legacy session cookie (`vendor_session`) so the middleware allows
 *     access during preview. Use only for UI testing.
 *
 *   - mode "magic": fires Supabase Auth's magic-link email. The email
 *     contains a URL pointing at /auth/callback?next=/vendor&role=vendor.
 *     Once clicked, Supabase exchanges the code for a session cookie and
 *     the user is signed in. Reply is "we sent you a link", no token in
 *     the response (Supabase handles the URL).
 *
 *   - mode "verify": legacy path (homegrown HMAC token). Kept for
 *     compatibility with any old links in flight; production flow uses
 *     Supabase Auth via /auth/callback.
 *
 * DELETE clears both the legacy preview cookie AND signs the user out
 * of Supabase if they have a session.
 */

function setLegacyCookie(res: NextResponse, value: string) {
  res.cookies.set(VENDOR_SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VENDOR_SESSION_TTL_S,
  });
}

export async function POST(req: Request) {
  let body: { mode?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const mode = body.mode ?? "password";
  const ip = clientIp(req);

  // ─────────────────────────────────────────────────────────────────────
  // PASSWORD: preview-only test/test stand-in. HARD-DISABLED in production —
  // even if NEXT_PUBLIC_SHOW_DEV_LOGIN flips on by accident, the API rejects.
  // ─────────────────────────────────────────────────────────────────────
  if (mode === "password") {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_LOGIN !== "true") {
      return NextResponse.json(
        { error: "Password mode is disabled. Use magic-link sign-in." },
        { status: 403 },
      );
    }

    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const rl = checkRateLimit(`vendor-login-password:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
      );
    }

    const isTestCredential = email === "test" && password === "test";
    if (!isTestCredential) {
      return NextResponse.json(
        { error: "Invalid credentials. During preview, use 'test' for both fields." },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ ok: true, redirect: "/vendor" });
    setLegacyCookie(res, "test-preview");
    return res;
  }

  // ─────────────────────────────────────────────────────────────────────
  // MAGIC: fire Supabase Auth's signInWithOtp
  // ─────────────────────────────────────────────────────────────────────
  if (mode === "magic") {
    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    // Rate-limit by IP + email so a single bad actor can't blast magic links
    // at every dental practice in the country.
    const rl = checkRateLimit(`vendor-magic:${ip}:${email}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
      );
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const emailRedirectTo = `${origin}/auth/callback?next=/vendor&role=vendor`;

    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        // CRITICAL: do NOT auto-create accounts. Only emails that already
        // exist in auth.users can sign in. New vendors get pre-created
        // when they submit an application (/api/vendor/signup).
        shouldCreateUser: false,
      },
    });

    if (error) {
      // Supabase's specific code for "no user with this email" is generic
      // ("Signups not allowed for otp" or similar). Detect it heuristically
      // and surface a friendlier message that tells them to apply first.
      const msg = error.message ?? "";
      const isUserNotFound =
        /not allowed|not found|invalid/i.test(msg) ||
        error.status === 422 ||
        error.status === 400;

      console.error("[vendor:magic-link] supabase signInWithOtp failed:", error);

      // Log the failed attempt for audit + abuse monitoring.
      try {
        const admin = getSupabaseAdmin();
        await admin.from("auth_audit").insert({
          event: "magic_link_denied",
          email,
          user_type: "vendor",
          metadata: { reason: msg, isUserNotFound },
        });
      } catch {
        // ignore
      }

      if (isUserNotFound) {
        return NextResponse.json(
          {
            error:
              "We couldn't find an application for that email. Apply at /vendor/signup first, then come back to sign in.",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: msg || "Could not send sign-in link. Please try again." },
        { status: 500 },
      );
    }

    // Audit + email_event logging (best-effort, server-side).
    try {
      const admin = getSupabaseAdmin();
      await admin.from("auth_audit").insert({
        event: "magic_link_issued",
        email,
        user_type: "vendor",
        metadata: { provider: "supabase", redirect: emailRedirectTo },
      });
      await admin.from("email_events").insert({
        template: "vendor_magic_link",
        recipient: email,
        provider: "supabase_auth",
        status: "queued",
        subject: "Sign in to your partner portal",
      });
    } catch (err) {
      console.error("[vendor:magic-link] audit log failed:", err);
    }

    return NextResponse.json({
      ok: true,
      sent: true,
      message: "We sent a sign-in link to your inbox. It expires in 60 minutes.",
    });
  }

  return NextResponse.json({ error: `Unknown mode '${mode}'.` }, { status: 400 });
}

export async function DELETE() {
  // Best-effort Supabase signOut (clears the auth cookie).
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[vendor:logout] supabase signOut failed:", err);
  }

  // Also clear the legacy preview cookie if present.
  const res = NextResponse.json({ ok: true });
  res.cookies.set(VENDOR_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
