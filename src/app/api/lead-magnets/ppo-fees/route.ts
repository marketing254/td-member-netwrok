import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { notifyTeam, sendLeadMagnetEmail, TEAM_DISTRIBUTION_LIST } from "@/lib/email/teamNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAGNET_SLUG = "ppo-fees";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() ?? "0.0.0.0";
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "no-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * POST /api/lead-magnets/ppo-fees
 *
 * Body: { email, fullName? }
 *
 * - Records the lead in `lead_magnet_leads` (unique on magnet_slug+email,
 *   re-asking is idempotent — the email still goes out, no duplicate row).
 * - Emails the PDF attachment to the requester.
 * - Notifies the team distribution list so they can follow up.
 *
 * Rate-limited per IP+email so a bot can't drain the team's inbox.
 */
export async function POST(req: Request) {
  const route = "POST /api/lead-magnets/ppo-fees";

  let body: { email?: string; fullName?: string };
  try {
    body = await req.json();
  } catch {
    return apiError.badRequest();
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const fullName = (body.fullName ?? "").trim() || null;

  if (!email || !EMAIL_RE.test(email)) {
    return apiError.validation("Enter a valid email address.");
  }

  const ip = clientIp(req);
  const rl = checkRateLimit(`lead-magnet:${MAGNET_SLUG}:${ip}:${email}`);
  if (!rl.allowed) {
    return apiError.rateLimited(route);
  }

  try {
    const admin = getSupabaseAdmin();

    // Idempotent upsert — re-asking returns the original row id.
    const { data: existing } = await admin
      .from("lead_magnet_leads")
      .select("id, contacted_at")
      .eq("magnet_slug", MAGNET_SLUG)
      .eq("email", email)
      .maybeSingle();

    if (!existing) {
      await admin.from("lead_magnet_leads").insert({
        magnet_slug: MAGNET_SLUG,
        email,
        full_name: fullName,
        source: "landing-free-kit",
        ip_hash: hashIp(ip),
        user_agent: req.headers.get("user-agent")?.slice(0, 256) ?? null,
      });
    }

    // Fire both sends and SURFACE the outcome (not via Promise.allSettled
    // hiding everything). We still don't fail the request when an email
    // bounces — the DB row is saved and the download URL is returned —
    // but the response now reports each leg so the form can warn the user
    // (and the diagnostic page can show what happened).
    const pdfPromise = sendLeadMagnetEmail({
      to: email,
      firstName: fullName,
      magnetSlug: "ppo-fees",
    }).catch((err: unknown) => {
      console.error("[lead-magnet] PDF send threw:", err);
      return false;
    });
    const teamPromise = notifyTeam({
      tag: "lead-magnet",
      subject: `Lead-magnet download — ${fullName ?? email}`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#0A1A2F;">
          <p><strong>New free-kit download.</strong></p>
          <ul>
            <li><strong>Magnet:</strong> Negotiating Better PPO Fees</li>
            <li><strong>Email:</strong> ${email}</li>
            ${fullName ? `<li><strong>Name:</strong> ${fullName}</li>` : ""}
            <li><strong>Source:</strong> landing-free-kit</li>
            <li><strong>Time:</strong> ${new Date().toUTCString()}</li>
          </ul>
          <p>Full list at <a href="https://www.dentalmembernetwork.com/admin/lead-magnets">/admin/lead-magnets</a>.</p>
        </div>
      `,
      text: [
        "New free-kit download.",
        `Magnet: Negotiating Better PPO Fees`,
        `Email:  ${email}`,
        fullName ? `Name:   ${fullName}` : null,
        `Source: landing-free-kit`,
        `Time:   ${new Date().toUTCString()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    }).catch((err: unknown) => {
      console.error("[lead-magnet] team notify threw:", err);
      return false;
    });

    const [pdfSent, teamSent] = await Promise.all([pdfPromise, teamPromise]);
    console.info(
      `[lead-magnet] dispatch summary — pdf:${pdfSent ? "ok" : "FAIL"} team:${teamSent ? "ok" : "FAIL"}`,
    );

    return NextResponse.json({
      ok: true,
      message: pdfSent
        ? "Check your inbox — the PDF is on its way."
        : "Saved your request. If the email doesn't arrive, use the download button below.",
      // Diagnostic flags — the form reads `pdfSent` to decide whether to
      // surface the download fallback prominently. teamSent is logged for
      // the team to know whether the alert fired.
      pdfSent,
      teamSent,
      teamRecipients: TEAM_DISTRIBUTION_LIST.length,
      // Direct download path — always returned so the form can offer it
      // even when the email transport succeeded (some users prefer it).
      downloadUrl: "/free-kit/ppo-fees-free-kit.pdf",
    });
  } catch (err) {
    return serverError(err, { route });
  }
}
