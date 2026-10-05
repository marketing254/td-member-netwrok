import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { appOrigin } from "@/lib/stripe";

/**
 * Found Money Audit emails.
 *
 * Without AUDIT_EMAILS_LIVE=true in the environment, EVERY email from this
 * file goes to AUDIT_SANDBOX_TO only, with the intended recipient written in
 * the subject. With it set, visitors and members get their emails, team
 * alerts go to AUDIT_TEAM_TO, and AUDIT_BCC is blind-copied on all of them.
 *
 * Links: on the live site they use NEXT_PUBLIC_APP_URL (the real domain);
 * when running locally they point at http://localhost:3000 so you can open
 * them from the test emails.
 */
const AUDIT_SANDBOX_TO = "rushdhaakbar82@gmail.com";
const AUDIT_TEAM_TO: string[] = ["lester@dentalmembernetwork.com", "reshani@dentalmembernetwork.com"];
/** Rushdha is blind-copied on every live send: team alerts and member emails. */
const AUDIT_BCC = "rushdhaakbar82@gmail.com";
const FROM = "Dental Member Network <noreply@dentalmembernetwork.com>";
const LOGO_CID = "dmn-wordmark";

function siteUrl(): string {
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/[/]+$/, "");
  return configured || appOrigin() || "https://www.dentalmembernetwork.com";
}

function live(): boolean {
  return process.env.AUDIT_EMAILS_LIVE === "true";
}

function transport(): nodemailer.Transporter | null {
  const host = process.env.SMTP_TX_HOST ?? process.env.SMTP_HOST;
  const user = process.env.SMTP_TX_USER ?? process.env.SMTP_USER;
  const pass = process.env.SMTP_TX_PASS ?? process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_TX_PORT ?? process.env.SMTP_PORT ?? "465");
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

let LOGO: Buffer | null | undefined;
function logoAttachment() {
  if (LOGO === undefined) {
    try {
      LOGO = readFileSync(path.join(process.cwd(), "public", "dmn-wordmark.png"));
    } catch {
      LOGO = null;
    }
  }
  return LOGO ? [{ filename: "dmn-wordmark.png", content: LOGO, cid: LOGO_CID }] : [];
}

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** The branded shell: cream background, white card, wordmark, gold rule, serif headline, Arial body. */
export function auditEmailLayout(opts: { eyebrow: string; headline: string; body: string; footerNote?: string }): string {
  return `<!doctype html>
<html style="background:#F6F1E7;"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dental Member Network</title></head>
<body style="background:#F6F1E7;margin:0;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;">
  <tr><td style="background:#FFFFFF;border:1px solid #E6DDCF;border-radius:14px;overflow:hidden;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr><td style="padding:26px 32px 16px;text-align:center;">
        <img src="cid:${LOGO_CID}" alt="Dental Member Network" width="150" style="display:inline-block;max-width:150px;height:auto;">
      </td></tr>
      <tr><td style="padding:0 32px;"><div style="height:2px;background:#D9A84B;border-radius:2px;"></div></td></tr>
      <tr><td style="padding:26px 32px 4px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#A07823;">${esc(opts.eyebrow)}</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;line-height:1.25;color:#0A1A2F;margin-top:8px;">${opts.headline}</div>
      </td></tr>
      <tr><td style="padding:14px 32px 8px;color:#1A1A1A;font-size:15px;line-height:1.65;">
${opts.body}
      </td></tr>
      <tr><td style="padding:18px 32px 24px;">
        <div style="border-top:1px solid #EFE8DA;padding-top:16px;color:#7A8590;font-size:12px;line-height:1.6;text-align:center;">
          ${opts.footerNote ? `${esc(opts.footerNote)}<br>` : ""}
          Dental Member Network &middot; Powered by Thriving Dentist Inc.<br>
          Questions? Just reply. A real person reads every message.
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export function auditButton(href: string, label: string, tone: "gold" | "navy" = "gold"): string {
  const bg = tone === "gold" ? "#D9A84B" : "#0E2A3D";
  const color = tone === "gold" ? "#0A1A2F" : "#FFFFFF";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr>
<td style="background:${bg};border-radius:999px;text-align:center;">
<a href="${href}" style="display:inline-block;padding:13px 30px;color:${color};font-weight:800;font-size:15px;text-decoration:none;">${label}</a>
</td></tr></table>`;
}

function numberBox(label: string, value: string, sub: string): string {
  return `<div style="background:#0A1A2F;border-radius:12px;padding:18px 20px;margin:6px 0 18px;">
  <div style="font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#F0C16E;">${esc(label)}</div>
  <div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:700;color:#F0C16E;line-height:1.1;margin-top:6px;">${esc(value)}</div>
  <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;">${esc(sub)}</div>
</div>`;
}

async function send(to: string[], subject: string, html: string, text: string): Promise<boolean> {
  const tx = transport();
  if (!tx) {
    console.info(`[audit mail] (no transport) ${subject} -> ${to.join(", ")}`);
    return false;
  }
  const realTo = live() ? to : [AUDIT_SANDBOX_TO];
  const realSubject = live() ? subject : `[SANDBOX, intended for ${to.join(", ")}] ${subject}`;
  try {
    await tx.sendMail({ from: FROM, to: realTo, ...(live() ? { bcc: AUDIT_BCC } : {}), subject: realSubject, html, text, attachments: logoAttachment() });
    return true;
  } catch (err) {
    console.error("[audit mail] send failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

/** Team alert: a new upload, or a member unlocked their report. */
export async function sendAuditTeamAlert(input: { kind: "upload" | "unlock"; auditId: string; email: string; practiceName: string | null; headline: number | null }): Promise<boolean> {
  const link = `${siteUrl()}/admin/audits?open=${input.auditId}`;
  const who = input.practiceName || input.email;
  const subject = input.kind === "upload" ? `Found Money: new upload from ${who}` : `Found Money: ${who} joined and unlocked their report`;
  const headline = input.kind === "upload" ? `New upload from <span style="color:#A07823;">${esc(who)}</span>` : `${esc(who)} has joined. Their report is waiting for a check.`;
  const body = `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FBF8F1;border:1px solid #EFE8DA;border-radius:10px;margin:4px 0 12px;">
  <tr><td style="padding:14px 18px;font-size:14px;line-height:1.7;color:#1A1A1A;">
    <b>Practice:</b> ${esc(input.practiceName || "(not given)")}<br>
    <b>Email:</b> ${esc(input.email)}<br>
    <b>Estimate:</b> ${input.headline == null ? "not available" : `${usd(input.headline)} a year`}<br>
    <b>Status:</b> ${input.kind === "upload" ? "Free estimate shown, not yet a member" : "Member. Review every finding against the documents, then release."}
  </td></tr>
</table>
${auditButton(link, "Open in the admin console", "navy")}`;
  const html = auditEmailLayout({ eyebrow: "Found Money Audit · team alert", headline, body });
  const text = `${subject}\n${input.email}\n${link}`;
  return send(AUDIT_TEAM_TO, subject, html, text);
}

/** Team only: the model call failed (credit, key, rate limit, outage). The visitor saw the calm message. */
export async function sendAuditOutageAlert(input: { auditId: string; email: string; practiceName: string | null; detail: string }): Promise<boolean> {
  const link = `${siteUrl()}/admin/audits?open=${input.auditId}`;
  const subject = "Found Money: audit paused, the reading service failed";
  const body = `
<p style="margin:0 0 14px;">An audit could not run because the OpenAI call failed. The visitor was told to try again in a few minutes and was not told why. Check the OpenAI credit and key.</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FBF8F1;border:1px solid #EFE8DA;border-radius:10px;margin:4px 0 12px;">
  <tr><td style="padding:14px 18px;font-size:14px;line-height:1.7;color:#1A1A1A;">
    <b>Practice:</b> ${esc(input.practiceName || "(not given)")}<br>
    <b>Email:</b> ${esc(input.email)}<br>
    <b>Reason (internal):</b> ${esc(input.detail.slice(0, 300))}
  </td></tr>
</table>
${auditButton(link, "Open in the admin console", "navy")}`;
  const html = auditEmailLayout({ eyebrow: "Found Money Audit · action needed", headline: "An audit could not run.", body });
  return send(AUDIT_TEAM_TO, subject, html, `${subject}
${input.email}
${input.detail}
${link}`);
}

/** To the visitor after the free estimate: the link back to their number. */
export async function sendAuditEstimateEmail(input: { to: string; token: string; headline: number | null; practiceName: string | null }): Promise<boolean> {
  const link = `${siteUrl()}/audit/found-money/${input.token}`;
  const has = input.headline != null && input.headline > 0;
  const subject = has ? `Your number: about ${usd(input.headline!)} a year` : "Your Found Money Audit estimate";
  const body = `
<p style="margin:0 0 14px;">Hi${input.practiceName ? ` ${esc(input.practiceName)}` : ""},</p>
<p style="margin:0 0 14px;">Our tool has read your documents. Here is your estimate, before a person has checked it.</p>
${has ? numberBox("Your instant estimate", `~${usd(input.headline!)}`, "a year you may be overpaying") : ""}
<p style="margin:0 0 6px;">Your first fix is open on the page. Members unlock every fix, the exact words to use on the phone, and a person on our team checking every line.</p>
${auditButton(link, "See my number")}
<p style="margin:0 0 14px;font-size:13px;color:#5C6770;">Your documents stay private to you. You can delete them any time from the same link.</p>`;
  const html = auditEmailLayout({ eyebrow: "Found Money Audit", headline: has ? "Your estimate is ready." : "Your audit has been read.", body, footerNote: "An estimate from our tool, before a person has checked it. The checked report can be higher or lower." });
  const text = `Your Found Money Audit estimate is ready: ${link}\n\nAn estimate from our tool, before a person has checked it. Members unlock every fix, the words to use, and a person checking every line.`;
  return send([input.to], subject, html, text);
}

/** To the member when the team releases the checked report. */
export async function sendAuditReleasedEmail(input: { to: string; headline: number; practiceName: string | null }): Promise<boolean> {
  const link = `${siteUrl()}/dashboard/tools/found-money`;
  const subject = `Your Found Money report is ready: ${usd(input.headline)} a year, checked`;
  const body = `
<p style="margin:0 0 14px;">Hi${input.practiceName ? ` ${esc(input.practiceName)}` : ""},</p>
<p style="margin:0 0 14px;">A person on our team has checked every line of your Found Money Audit against your documents. The full report is in your portal.</p>
${numberBox("Checked by a person", usd(input.headline), "a year, every finding verified")}
<p style="margin:0 0 6px;">Inside: every fix with exactly what to do, the words to say on the phone, and what is already fine.</p>
${auditButton(link, "Open my report", "navy")}
<p style="margin:0 0 14px;font-size:14px;">If you would like a 20-minute walkthrough of the report, reply to this email and we will book it.</p>`;
  const html = auditEmailLayout({ eyebrow: "Found Money Audit · your report", headline: "Checked, and ready for you.", body });
  const text = `Your Found Money report has been checked and released: ${link}`;
  return send([input.to], subject, html, text);
}
