import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { validateWaitlist } from "@/lib/waitlist/validate";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import { notifySignup } from "@/lib/email/teamNotify";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { resolveReferralCode } from "@/lib/referral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/member/signup
 *
 * Self-serve member signup. Replaces the old "fill form → admin reviews →
 * admin activates" flow. Now:
 *
 *   1. Validate the form payload (reuses validateWaitlist for shape).
 *   2. Check if a members row already exists for that email — if so,
 *      just resend the magic link rather than erroring (idempotent
 *      double-submits, support re-onboarding).
 *   3. Insert the members row with status='active' so the auth gate
 *      passes the moment they verify their email.
 *   4. Pre-create the Supabase auth user (email_confirm:true) so
 *      shouldCreateUser:false on /api/member/login still works.
 *   5. Send a magic-link sign-in email via signInWithOtp.
 *      The link points at /auth/callback?next=/upgrade so the user
 *      lands on the plan picker after verifying their email.
 *   6. They pay via Stripe Checkout; the webhook then flips
 *      subscription_status='active' which unlocks /dashboard.
 *
 * Admins no longer need to activate new members. They CAN deactivate
 * existing ones via /api/admin/members/[id] PATCH action=deactivate
 * (sets status='paused' which middleware blocks immediately).
 *
 * Rate-limited per IP+email so a bot can't spray.
 */

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() ?? "0.0.0.0";
}

function splitName(fullName: string): { first: string; last: string | null } {
  const t = fullName.trim();
  const parts = t.split(/\s+/);
  if (parts.length <= 1) return { first: t || "Member", last: null };
  return { first: parts[0]!, last: parts.slice(1).join(" ") };
}

export async function POST(req: Request) {
  const route = "POST /api/member/signup";

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return apiError.badRequest();
  }

  const result = validateWaitlist(json);
  if (!result.ok) {
    return apiError.validation(result.error, route);
  }
  const payload = result.data;

  const ip = clientIp(req);
  const rl = checkRateLimit(`member-signup:${ip}:${payload.email}`);
  if (!rl.allowed) {
    return apiError.rateLimited(route);
  }

  const sb = getSupabaseAdmin();
  const email = payload.email;
  const { first, last } = splitName(payload.fullName);

  try {
    // 1. Is there an existing members row for this email? Idempotent path.
    const { data: existing } = await sb
      .from("members")
      .select("id, status, auth_user_id")
      .eq("email", email)
      .maybeSingle();

    let memberId: string;
    let alreadyExisted = false;

    if (existing) {
      memberId = existing.id;
      alreadyExisted = true;

      // If the row was previously paused/churned, reactivate it as
      // part of self-serve resignup. Admin can always deactivate again.
      if (existing.status !== "active") {
        await sb
          .from("members")
          .update({ status: "active" })
          .eq("id", memberId);
      }
    } else {
      // 2. Fresh signup — create the members row.
      // utm + practice info captured so the team can see acquisition
      // context per row.
      const utm =
        payload.utm && typeof payload.utm === "object"
          ? (payload.utm as Record<string, string>)
          : null;

      // Capture ?ref=CODE if present. Looked up from the payload first
      // (set client-side by the signup form), then from a `ref` UTM field.
      const refCandidate =
        (payload as { ref?: string }).ref ??
        (utm && typeof utm === "object" ? utm.ref : undefined);
      const referralCodeId = await resolveReferralCode(refCandidate ?? null);

      const { data: inserted, error: insErr } = await sb
        .from("members")
        .insert({
          first_name: first,
          last_name: last,
          email,
          phone: payload.phone ?? null,
          practice_name: payload.practiceName ?? null,
          city: payload.cityState ?? null,
          status: "active",
          tier: "founding",
          practice_role: utm?.role_label ?? null,
          sms_consent_at: payload.smsConsentAt ?? null,
          sms_consent_text: payload.smsConsentText ?? null,
          referral_code_id: referralCodeId,
        })
        .select("id")
        .single();
      if (insErr) {
        return serverError(insErr, { route, extra: { stage: "members_insert" } });
      }
      memberId = inserted.id;

      // Record the attribution row so the analytics dashboard can count
      // signups per code without re-joining through members each time.
      if (referralCodeId) {
        try {
          await sb.from("referral_signups").insert({
            code_id: referralCodeId,
            member_id: memberId,
          });
        } catch { /* best-effort */ }
      }
    }

    // 3. Pre-create the Supabase auth user. shouldCreateUser:false on
    //    /api/member/login means this user MUST exist before they can
    //    request a magic link to sign in.
    try {
      const { error: createErr } = await sb.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { user_type: "member", member_id: memberId },
      });
      if (createErr && !/already.*registered|exists/i.test(createErr.message)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[member:signup] auth user create failed:", createErr);
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[member:signup] auth user create threw:", err);
      }
      // Continue — magic-link send will give us the real error if any.
    }

    // 4. Send the OTP sign-in email. We deliberately DO NOT pass
    //    emailRedirectTo here — the Supabase email template uses
    //    {{ .Token }} so the user sees a 6-digit code to type, not a
    //    clickable URL. Verification happens at /api/member/verify-otp.
    const cookieClient = await createServerSupabase();
    const { error: otpErr } = await cookieClient.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (otpErr) {
      return serverError(otpErr, { route, extra: { stage: "send_otp" } });
    }

    // 5. Audit trail.
    await sb.from("auth_audit").insert({
      event: alreadyExisted ? "signup_resend" : "signup_new",
      email,
      user_type: "member",
      metadata: {
        member_id: memberId,
        existed: alreadyExisted,
        source: payload.source ?? null,
      },
    });

    await sb.from("email_events").insert({
      template: "member_signup_otp",
      recipient: email,
      provider: "supabase_auth",
      status: "queued",
      subject: "Your DMN sign-in code",
    });

    // Alert the team on brand-new members only — a resend/re-login
    // (alreadyExisted) shouldn't re-notify everyone.
    if (!alreadyExisted) {
      const utm =
        payload.utm && typeof payload.utm === "object"
          ? (payload.utm as Record<string, string>)
          : null;
      void notifySignup({
        role: "member",
        name: payload.fullName,
        email,
        adminLink: "https://dentalmembernetwork.com/admin/members?filter=new",
        fields: [
          { label: "Full name", value: payload.fullName },
          { label: "Email", value: email },
          { label: "Phone", value: payload.phone },
          { label: "Practice name", value: payload.practiceName },
          { label: "Role", value: utm?.role_label },
          { label: "Number of locations", value: utm?.locations },
          { label: "City / state", value: payload.cityState },
          { label: "Biggest challenge", value: utm?.challenge },
          { label: "SMS consent", value: payload.smsConsent ? "Yes" : "No" },
          { label: "Source", value: payload.source ?? null },
        ],
      });
    }

    return NextResponse.json({
      ok: true,
      member_id: memberId,
      existed: alreadyExisted,
      message:
        "Check your email for a 6-digit code. Enter it to finish signing in.",
    });
  } catch (err) {
    return serverError(err, { route });
  }
}
