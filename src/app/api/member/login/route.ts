import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/member/login
 *
 * Magic-link sign-in for members. shouldCreateUser:false — only emails
 * that already exist in auth.users can receive a link. New auth users
 * are pre-created when an admin activates a waitlist signup
 * (/api/admin/members/activate).
 *
 * Rate-limited per IP+email so a bot can't spray.
 *
 * DELETE clears the Supabase session cookie.
 */

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() ?? "0.0.0.0";
}

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const ip = clientIp(req);
  const rl = checkRateLimit(`member-magic:${ip}:${email}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  const origin =
    req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const emailRedirectTo = `${origin}/auth/callback?next=/dashboard&role=member`;

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo, shouldCreateUser: false },
  });

  if (error) {
    const msg = error.message ?? "";
    const isUserNotFound =
      /not allowed|not found|invalid/i.test(msg) || error.status === 422 || error.status === 400;

    try {
      const admin = getSupabaseAdmin();
      await admin.from("auth_audit").insert({
        event: "magic_link_denied",
        email,
        user_type: "member",
        metadata: { reason: msg, isUserNotFound },
      });
    } catch {
      /* ignore */
    }

    if (isUserNotFound) {
      return NextResponse.json(
        {
          error:
            "We couldn't find a member account for that email. The team will email you once your access is active.",
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: msg || "Could not send sign-in link. Please try again." },
      { status: 500 },
    );
  }

  try {
    const admin = getSupabaseAdmin();
    await admin.from("auth_audit").insert({
      event: "magic_link_issued",
      email,
      user_type: "member",
      metadata: { provider: "supabase", redirect: emailRedirectTo },
    });
    await admin.from("email_events").insert({
      template: "member_magic_link",
      recipient: email,
      provider: "supabase_auth",
      status: "queued",
      subject: "Sign in to your DMN portal",
    });
  } catch (err) {
    console.error("[member:magic-link] audit log failed:", err);
  }

  return NextResponse.json({
    ok: true,
    sent: true,
    message: "We sent a sign-in link to your inbox. It expires in 60 minutes.",
  });
}

export async function DELETE() {
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[member:logout] signOut failed:", err);
  }
  return NextResponse.json({ ok: true });
}
