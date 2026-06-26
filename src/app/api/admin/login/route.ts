import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import { apiError, serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/login
 *
 * Sends a 6-digit OTP to an email on the admin allow-list. Uses
 * shouldCreateUser:false so unknown emails get a generic 404 — no
 * silent allow-list creation. Verification happens at
 * /api/admin/verify-otp.
 *
 * DELETE clears the Supabase session cookie.
 */

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() ?? "0.0.0.0";
}

export async function POST(req: Request) {
  const route = "POST /api/admin/login";

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return apiError.badRequest();
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return apiError.validation("Enter a valid email address.");
  }

  const ip = clientIp(req);
  const rl = checkRateLimit(`admin-otp-send:${ip}:${email}`);
  if (!rl.allowed) return apiError.rateLimited(route);

  // Pre-check the admin allow-list so the 404 message is accurate even
  // if Supabase's signInWithOtp returns a generic error.
  try {
    const admin = getSupabaseAdmin();
    const { data: adminRow } = await admin
      .from("admin_users")
      .select("id, active")
      .eq("email", email)
      .maybeSingle();
    if (!adminRow || !adminRow.active) {
      try {
        await admin.from("auth_audit").insert({
          event: "otp_send_denied",
          email,
          user_type: "admin",
          metadata: { reason: "not_on_allowlist" },
        });
      } catch {
        /* audit best-effort */
      }
      return NextResponse.json(
        {
          error:
            "That email isn't on the admin allow-list. Ask an owner-role admin to add you.",
        },
        { status: 404 },
      );
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      const msg = error.message ?? "";
      const isUserNotFound =
        /not allowed|not found|invalid/i.test(msg) ||
        error.status === 422 ||
        error.status === 400;
      if (isUserNotFound) {
        return NextResponse.json(
          {
            error:
              "This admin email exists in the allow-list but not in Supabase Auth yet. Ask another admin to create the auth user.",
          },
          { status: 404 },
        );
      }
      return serverError(error, { route, extra: { stage: "send_otp" } });
    }

    try {
      await admin.from("auth_audit").insert({
        event: "otp_issued",
        email,
        user_type: "admin",
        metadata: { provider: "supabase" },
      });
      await admin.from("email_events").insert({
        template: "admin_login_otp",
        recipient: email,
        provider: "supabase_auth",
        status: "queued",
        subject: "Your DMN admin sign-in code",
      });
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.error("[admin:login] audit log failed:", err);
    }

    return NextResponse.json({
      ok: true,
      sent: true,
      message: "We sent a 6-digit code to your inbox. It expires in 5 minutes.",
    });
  } catch (err) {
    return serverError(err, { route });
  }
}

export async function DELETE() {
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } catch (err) {
    if (process.env.NODE_ENV !== "production")
      console.error("[admin:logout] signOut failed:", err);
  }
  return NextResponse.json({ ok: true });
}
