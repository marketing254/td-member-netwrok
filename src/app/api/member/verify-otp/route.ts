import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import { apiError, serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/member/verify-otp
 *
 * Body: { email: string, token: string }   token = 6-digit OTP code
 *
 * Verifies the OTP that Supabase sent on /api/member/login or
 * /api/member/signup. On success, Supabase sets the auth session
 * cookies on our domain and we return the right next path so the
 * client can router.push() there.
 *
 * Security rails:
 *   - Per-IP+email rate limit on verify attempts (5 per 10 min then
 *     soft lockout). The Supabase server also enforces its own
 *     attempt-counting at the OTP layer.
 *   - OTP itself is never echoed back to the caller, never logged,
 *     never stored — only the verdict travels.
 *   - Failed verify returns a generic "Invalid or expired code"
 *     message; we don't leak whether the email is unknown vs the
 *     code is wrong vs the code expired (prevents enumeration).
 *   - The next path is computed from the member's current state at
 *     verify time, NOT trusted from a client-supplied parameter
 *     (prevents open-redirect via ?next=external.com).
 */

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() ?? "0.0.0.0";
}

const TOKEN_RE = /^\d{6}$/;
const GENERIC_FAIL = "That code didn't work. Request a new one and try again.";

export async function POST(req: Request) {
  const route = "POST /api/member/verify-otp";

  let body: { email?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return apiError.badRequest();
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const token = (body.token ?? "").trim();

  if (!email || !email.includes("@") || !TOKEN_RE.test(token)) {
    return apiError.validation(GENERIC_FAIL);
  }

  const ip = clientIp(req);
  const rl = checkRateLimit(`member-verify:${ip}:${email}`);
  if (!rl.allowed) {
    return apiError.rateLimited(route);
  }

  try {
    // verifyOtp on the cookie-bound server client sets the session
    // cookies on our domain automatically. Type 'email' matches
    // signInWithOtp's behavior on the request side.
    const cookieClient = await createServerSupabase();
    const { data, error } = await cookieClient.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error || !data?.user) {
      // Audit FAILED attempt (no token logged) for forensic visibility.
      try {
        const admin = getSupabaseAdmin();
        await admin.from("auth_audit").insert({
          event: "otp_verify_failed",
          email,
          user_type: "member",
          metadata: { reason: "invalid_or_expired" },
        });
      } catch {
        /* audit best-effort */
      }
      return apiError.validation(GENERIC_FAIL);
    }

    // Look up the member to decide where to land them.
    const admin = getSupabaseAdmin();
    const { data: memberRow } = await admin
      .from("members")
      .select("id, status, subscription_status, auth_user_id")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    // If members row exists but isn't linked yet (race between signup
    // insert and verify), link it now using the email match.
    let resolvedMember = memberRow;
    if (!resolvedMember) {
      const { data: byEmail } = await admin
        .from("members")
        .select("id, status, subscription_status, auth_user_id")
        .eq("email", email)
        .maybeSingle();
      if (byEmail) {
        if (!byEmail.auth_user_id) {
          await admin
            .from("members")
            .update({ auth_user_id: data.user.id })
            .eq("id", byEmail.id);
        }
        resolvedMember = { ...byEmail, auth_user_id: data.user.id };
      }
    }

    if (!resolvedMember) {
      // Verified the OTP but there's no members row — block.
      return apiError.forbidden(route);
    }

    if (resolvedMember.status !== "active") {
      // Member exists but admin paused / churned them.
      return NextResponse.json(
        {
          ok: false,
          error: "Your portal isn't active. Contact the team to reactivate.",
        },
        { status: 403 },
      );
    }

    // Audit success.
    try {
      await admin.from("auth_audit").insert({
        event: "otp_verify_success",
        email,
        user_id: data.user.id,
        user_type: "member",
        metadata: { member_id: resolvedMember.id },
      });
    } catch {
      /* audit best-effort */
    }

    // Decide where to send them. NOT trusted from any client parameter.
    const isPaid = resolvedMember.subscription_status === "active";
    const next = isPaid ? "/dashboard" : "/upgrade";

    return NextResponse.json({ ok: true, next });
  } catch (err) {
    return serverError(err, { route });
  }
}
