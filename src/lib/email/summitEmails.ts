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
