import "server-only";
import nodemailer from "nodemailer";
import { SUMMIT } from "@/lib/events/summit";

/**
 * Summit ops alert. The registrant's own confirmation and reminders come
 * from ZOOM (the webinar's confirmation email is on), so the website
 * sends the registrant nothing for the event itself. The only email here
 * is the one that goes to the team when a paid registrant could not be
 * added to the sheet and therefore will not reach Zoom on their own.
 *
 * Alerts go to Rushdha and Lester. Nothing here ever goes to a member.
 */
const OPS_ALERT_TO = ["rushdhaakbar82@gmail.com", "lester@ekwa.com"];
const FROM = "Dental Member Network <noreply@dentalmembernetwork.com>";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function transport(): nodemailer.Transporter | null {
  const host = process.env.SMTP_TX_HOST ?? process.env.SMTP_HOST;
  const user = process.env.SMTP_TX_USER ?? process.env.SMTP_USER;
  const pass = process.env.SMTP_TX_PASS ?? process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_TX_PORT ?? process.env.SMTP_PORT ?? "465");
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

/**
 * The seat email (spec v2): sent to the member once the Zoom API has
 * booked their place, with their personal join link. BCC to the team so
 * there is a record. Fail-soft: the link is also on the confirmation
 * page and in the portal.
 */
export async function sendSummitSeatEmail(input: { to: string; firstName: string; joinUrl: string }): Promise<boolean> {
  const tx = transport();
  if (!tx) {
    console.info(`[summit seat] (no transport) ${input.to}`);
    return false;
  }
  const first = esc(input.firstName || "there");
  const url = esc(input.joinUrl);
  const subject = `Your seat at the RIDA Annual Summit on 6 November is booked`;
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0A1A2F;max-width:560px;margin:0 auto;padding:24px;line-height:1.6;">
<p>Hi ${first},</p>
<p><b>You are registered for RIDA.</b> You came in through the Dental Member Network, so your seat at the RIDA Annual Summit on Friday 6 November 2026, 12:00 to 4:30 PM Eastern, is booked for you. Four CE credits through RIDA.</p>
<p>This is your personal Zoom link. It is unique to you, so please do not forward it:</p>
<p><a href="${url}" style="display:inline-block;background:#0E2A3D;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">Join the summit on 6 November</a></p>
<p style="font-size:13px;color:#5C6770;">${url}</p>
<p><b>Your membership is already open.</b> You do not have to wait for the event to start using it. The Practice Playbook from RIDA Live is on your dashboard now: <a href="https://www.dentalmembernetwork.com/dashboard">dentalmembernetwork.com/dashboard</a>.</p>
<p>Nothing to pay until Wednesday 6 January 2027. Cancel any time before then and you will not be charged at all.</p>
<p>Warmly,<br>The Dental Member Network team<br><span style="color:#5C6770;">Powered by Thriving Dentist Inc.</span></p>
</div>`;
  const text = `Hi ${input.firstName || "there"},\n\nYou are registered for RIDA. You came in through the Dental Member Network, so your seat at the RIDA Annual Summit on Friday 6 November 2026, 12:00 to 4:30 PM Eastern, is booked for you. Four CE credits through RIDA.\n\nYour personal Zoom link (unique to you, please do not forward it):\n${input.joinUrl}\n\nYour membership is already open. The Practice Playbook from RIDA Live is on your dashboard now: https://www.dentalmembernetwork.com/dashboard\n\nNothing to pay until Wednesday 6 January 2027. Cancel any time before then and you will not be charged at all.\n\nThe Dental Member Network team\nPowered by Thriving Dentist Inc.`;
  try {
    await tx.sendMail({ from: FROM, to: input.to, bcc: OPS_ALERT_TO, subject, html, text });
    return true;
  } catch (err) {
    console.error("[summit seat] send failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function sendSummitFailureAlert(input: {
  registrationId: string;
  email: string;
  name: string;
  error: string;
}): Promise<boolean> {
  const tx = transport();
  if (!tx) {
    console.info(`[summit alert] (no transport) ${input.email}: ${input.error}`);
    return false;
  }
  const subject = `Summit: ${input.name} paid but is NOT in the registrants sheet`;
  const html = `<p>A summit registrant is entitled (payment verified) but could not be added to the registrants sheet, so n8n will not register them in Zoom.</p>
<p><b>${esc(input.name)}</b> · ${esc(input.email)}<br>Registration id: ${esc(input.registrationId)}<br>Error: ${esc(input.error)}</p>
<p>Fix: add them as a "Pending" row in the Registrants sheet (n8n will pick it up), or register them directly in the Zoom webinar ${esc(SUMMIT.zoomWebinarId)}.</p>`;
  const text = `Summit registrant needs manual help.\n${input.name} · ${input.email}\nRegistration id: ${input.registrationId}\nError: ${input.error}\n\nAdd them as a Pending row in the Registrants sheet, or register them directly in Zoom webinar ${SUMMIT.zoomWebinarId}.`;
  try {
    await tx.sendMail({ from: FROM, to: OPS_ALERT_TO, subject, html, text });
    return true;
  } catch (err) {
    console.error("[summit alert] send failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
