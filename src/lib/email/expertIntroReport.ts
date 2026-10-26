import "server-only";
import { EXPERT_INTROS_REPORT_TO } from "@/lib/expertIntros";

/**
 * The daily "members who asked for expert introductions" report
 * (Lester, Oct 2026). One email with a table plus the same rows as a CSV
 * attachment. Sent through the same SMTP / Resend transport as the team
 * notifications. Returns true on success, false on any transport failure.
 */

export type ExpertIntroRow = {
  name: string;
  practice: string;
  email: string;
  phone: string;
  helpArea: string;
  chosenAt: string; // ISO
};

const COLUMNS: { key: keyof ExpertIntroRow; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "practice", label: "Practice" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "helpArea", label: "Help area" },
  { key: "chosenAt", label: "Date chosen" },
];

function csvCell(v: string): string {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** CSV text for a list of rows (header + one line per member). */
export function expertIntroCsv(rows: ExpertIntroRow[]): string {
  const lines = [COLUMNS.map((c) => c.label).join(",")];
  for (const r of rows) lines.push(COLUMNS.map((c) => csvCell(c.key === "chosenAt" ? fmtDate(r.chosenAt) : r[c.key])).join(","));
  return lines.join("\r\n") + "\r\n";
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(iso)) + " ET";
  } catch {
    return iso;
  }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fromAddress(): string {
  return process.env.WAITLIST_EMAIL_FROM || "Dental Member Network <hello@joindmn.com>";
}

export async function sendExpertIntroReport(rows: ExpertIntroRow[], reportDate: string): Promise<boolean> {
  if (rows.length === 0) return true;
  const to = EXPERT_INTROS_REPORT_TO;
  const subject = `Expert introductions: ${rows.length} new member${rows.length === 1 ? "" : "s"} said yes`;
  const filename = `expert-introductions-${reportDate}.csv`;
  const csv = expertIntroCsv(rows);

  const th = COLUMNS.map((c) => `<th style="text-align:left;padding:8px 10px;border-bottom:2px solid #D9A84B;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#0A1A2F">${c.label}</th>`).join("");
  const tr = rows
    .map(
      (r) =>
        `<tr>${COLUMNS.map((c) => `<td style="padding:8px 10px;border-bottom:1px solid #E6DDCF;font-size:14px;color:#0A1A2F">${esc(c.key === "chosenAt" ? fmtDate(r.chosenAt) : r[c.key] || "-")}</td>`).join("")}</tr>`,
    )
    .join("");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#FBF8F1;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0A1A2F">
<p style="font-size:15px;margin:0 0 16px">${rows.length === 1 ? "One member" : `${rows.length} members`} ticked "introduce me to experts who can help with this." The same list is attached as a CSV.</p>
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#fff;border:1px solid #E6DDCF;border-radius:8px;width:100%"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>
<p style="font-size:12px;color:#7A8590;margin:16px 0 0">Dental Member Network, expert introductions report for ${reportDate}.</p>
</body></html>`;
  const text = [`${rows.length} member(s) said yes to expert introductions.`, "", ...rows.map((r) => `${r.name} | ${r.practice} | ${r.email} | ${r.phone} | ${r.helpArea} | ${fmtDate(r.chosenAt)}`)].join("\n");

  try {
    const from = fromAddress();
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpHost && smtpUser && smtpPass) {
      const port = Number(process.env.SMTP_PORT ?? "465");
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({ host: smtpHost, port, secure: port === 465, auth: { user: smtpUser, pass: smtpPass } });
      await transporter.sendMail({ from, to, subject, html, text, attachments: [{ filename, content: csv, contentType: "text/csv" }] });
      console.info("[expert-intros] report sent via SMTP", { to, rows: rows.length });
      return true;
    }
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject, html, text, attachments: [{ filename, content: Buffer.from(csv).toString("base64") }] }),
      });
      if (!res.ok) {
        console.error("[expert-intros] Resend failed", await res.text().catch(() => ""));
        return false;
      }
      console.info("[expert-intros] report sent via Resend", { to, rows: rows.length });
      return true;
    }
    console.info("[expert-intros] no mail transport configured; report not sent", { to, rows: rows.length });
    return false;
  } catch (err) {
    console.error("[expert-intros] report failed", err);
    return false;
  }
}
