import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

/**
 * Team notification + lead-magnet email helpers.
 *
 * Sends through the same Rackspace SMTP transport configured for the
 * waitlist emails. The team distribution list is hard-coded here so it
 * survives env changes; tweak it by editing this file.
 */

export const TEAM_DISTRIBUTION_LIST = [
  "lester@ekwa.com",
  "chamika.p@ekwa.com",
  "rushdha@ekwa.com",
  "rushdhaakbar82@gmail.com",
  "reshani@ekwa.com",
];

function fromAddress(): string {
  return (
    process.env.WAITLIST_EMAIL_FROM ||
    "Dental Member Network <hello@joindmn.com>"
  );
}

/**
 * Fire an internal-only email to the team distribution list. Used for
 * lead-magnet downloads + Stripe payment notifications. Returns true on
 * success, false on any transport failure — never throws.
 */
export async function notifyTeam(opts: {
  subject: string;
  html: string;
  text: string;
  tag: string; // e.g. "lead-magnet" / "stripe-payment" — used in server logs
}): Promise<boolean> {
  try {
    const from = fromAddress();
    const to = TEAM_DISTRIBUTION_LIST.join(", ");

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpHost && smtpUser && smtpPass) {
      const port = Number(process.env.SMTP_PORT ?? "465");
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from,
        to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      console.info(`[team-notify:${opts.tag}] sent via SMTP`, { recipients: TEAM_DISTRIBUTION_LIST.length });
      return true;
    }

    // Resend fallback
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: TEAM_DISTRIBUTION_LIST,
          subject: opts.subject,
          html: opts.html,
          text: opts.text,
        }),
      });
      if (!res.ok) {
        console.error(`[team-notify:${opts.tag}] Resend failed`, await res.text().catch(() => ""));
        return false;
      }
      console.info(`[team-notify:${opts.tag}] sent via Resend`);
      return true;
    }

    // No transport configured → log-only mode (dev / pre-launch)
    console.info(`[team-notify:${opts.tag}] (no transport) ${opts.subject}`);
    return false;
  } catch (err) {
    console.error(`[team-notify:${opts.tag}] send failed`, err);
    return false;
  }
}

/**
 * Send a lead-magnet PDF as an attachment to the requester. Used by the
 * homepage "Free Kit" form. The PDF lives in `public/free-kit/` and is
 * loaded from disk per request (small enough — ~1 MB).
 */
export async function sendLeadMagnetEmail(opts: {
  to: string;
  firstName?: string | null;
  magnetSlug: "ppo-fees";
}): Promise<boolean> {
  try {
    const config = LEAD_MAGNETS[opts.magnetSlug];
    if (!config) {
      console.error("[lead-magnet] unknown slug", opts.magnetSlug);
      return false;
    }

    const pdfPath = path.join(process.cwd(), "public", "free-kit", config.pdfFilename);
    if (!existsSync(pdfPath)) {
      console.error("[lead-magnet] PDF missing on disk", pdfPath);
      return false;
    }
    const pdfBuffer = await fs.readFile(pdfPath);

    const from = fromAddress();
    const firstName = opts.firstName ? opts.firstName.split(" ")[0] : "there";
    // Subject per the canonical Lead Magnet Email.md copy
    const subject = `Here's your PPO fee-negotiation kit, ${firstName}`;
    const preheader =
      "The script, checklist, and worksheet — yours to keep. Here's how to use them.";

    // Verbatim from /Lead Magnet Email.md — copy is the source of truth.
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.65;color:#0A1A2F;max-width:600px;">
        <!-- preheader hidden but read by inbox preview -->
        <span style="display:none!important;visibility:hidden;mso-hide:all;max-height:0;overflow:hidden;color:#FBF8F1;">
          ${preheader}
        </span>

        <p>Hi ${firstName},</p>

        <p>Here it is — your free <strong>Negotiating Better PPO Fees</strong> kit. No strings, yours to keep.</p>

        <p style="margin:22px 0;">
          <a href="https://dentalmembernetwork.com/ppo"
             style="display:inline-block;padding:12px 20px;border-radius:6px;background:#0A1A2F;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;">
            👉 Download your kit
          </a>
        </p>

        <p>Here's how to get the most out of it this week:</p>

        <ol style="padding-left:20px;margin:0 0 16px 0;">
          <li style="margin-bottom:10px;">
            <strong>Start with the script (page 2).</strong> It's word for word — you can read it straight off the page on your next carrier call.
          </li>
          <li style="margin-bottom:10px;">
            <strong>Run the pre-call checklist first.</strong> Five minutes of prep is where the leverage comes from.
          </li>
          <li style="margin-bottom:10px;">
            <strong>Don't skip the downgrade codes.</strong> It's the most overlooked money on the call — a crown fee can climb 40% while an un-negotiated downgrade quietly costs your patients hundreds.
          </li>
        </ol>

        <p>You don't need to overhaul anything. Pick one carrier you haven't touched in a couple of years and make one call. That's how most of our members got their first win.</p>

        <p>And if it helps, hit reply and tell us how it goes — a real person reads every one.</p>

        <p style="margin-top:24px;">
          — The Dental Member Network team<br />
          <span style="color:#7A8590;font-size:13px;">Powered by Thriving Dentist</span>
        </p>

        <hr style="border:none;border-top:1px solid #E6DDCF;margin:28px 0 20px 0;" />

        <p style="font-size:13px;color:#3B4A55;line-height:1.6;">
          <strong>P.S.</strong> This is one of dozens of kits our members get — a new done-for-you kit drops every week inside the Dental Member Network, plus an expert hotline for the problems a PDF can't solve. If this was useful,
          <a href="https://dentalmembernetwork.com" style="color:#A07823;font-weight:600;">there's a lot more where it came from</a>.
          Founding spots are <strong>$49/mo</strong>, locked for life.
        </p>
      </div>
    `;

    const text = [
      `Hi ${firstName},`,
      "",
      "Here it is — your free Negotiating Better PPO Fees kit. No strings, yours to keep.",
      "",
      "Download your kit: https://dentalmembernetwork.com/ppo",
      "(The PDF is also attached to this email.)",
      "",
      "Here's how to get the most out of it this week:",
      "",
      "1. Start with the script (page 2). It's word for word — you can read it straight off the page on your next carrier call.",
      "2. Run the pre-call checklist first. Five minutes of prep is where the leverage comes from.",
      "3. Don't skip the downgrade codes. It's the most overlooked money on the call — a crown fee can climb 40% while an un-negotiated downgrade quietly costs your patients hundreds.",
      "",
      "You don't need to overhaul anything. Pick one carrier you haven't touched in a couple of years and make one call. That's how most of our members got their first win.",
      "",
      "And if it helps, hit reply and tell us how it goes — a real person reads every one.",
      "",
      "— The Dental Member Network team",
      "Powered by Thriving Dentist",
      "",
      "P.S. This is one of dozens of kits our members get — a new done-for-you kit drops every week inside the Dental Member Network, plus an expert hotline for the problems a PDF can't solve. If this was useful, there's a lot more where it came from: https://dentalmembernetwork.com",
      "Founding spots are $49/mo, locked for life.",
    ].join("\n");

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpHost && smtpUser && smtpPass) {
      const port = Number(process.env.SMTP_PORT ?? "465");
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from,
        to: opts.to,
        subject,
        html,
        text,
        attachments: [
          {
            filename: config.attachmentFilename,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
      console.info(`[lead-magnet:${opts.magnetSlug}] sent via SMTP`, { to: opts.to });
      return true;
    }

    // Resend (uses base64-encoded attachment)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [opts.to],
          subject,
          html,
          text,
          attachments: [
            {
              filename: config.attachmentFilename,
              content: pdfBuffer.toString("base64"),
            },
          ],
        }),
      });
      if (!res.ok) {
        console.error(`[lead-magnet:${opts.magnetSlug}] Resend failed`, await res.text().catch(() => ""));
        return false;
      }
      console.info(`[lead-magnet:${opts.magnetSlug}] sent via Resend`);
      return true;
    }

    console.info(`[lead-magnet:${opts.magnetSlug}] (no transport) would have sent PDF to ${opts.to}`);
    return false;
  } catch (err) {
    console.error("[lead-magnet] send failed", err);
    return false;
  }
}

const LEAD_MAGNETS = {
  "ppo-fees": {
    title: "Negotiating Better PPO Fees",
    pdfFilename: "ppo-fees-free-kit.pdf",
    attachmentFilename: "Negotiating Better PPO Fees - Free Kit.pdf",
  },
} as const;

export type LeadMagnetSlug = keyof typeof LEAD_MAGNETS;
