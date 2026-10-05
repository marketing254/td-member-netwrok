#!/usr/bin/env node
/**
 * Renders the sample Found Money report (same data as /audit/found-money/preview)
 * to a PDF and emails it as a draft. LOCAL ONLY.
 *
 *   node scripts/found-money-report-draft.mjs                # saves the PDF only
 *   node scripts/found-money-report-draft.mjs --send         # also emails it
 *
 * Recipients are fixed below. Change them here, nowhere else.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import nodemailer from "nodemailer";

const TO = "rushdhaakbar82@gmail.com";
const CC = ["lester@ekwa.com"];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}

const { renderFoundMoneyReportPdf } = await import(pathToFileURL(path.join(root, "src/lib/pdf/foundMoneyReportPdf.ts")).href);

const findings = [
  {
    title: "Three card-processor fees you can have removed",
    why: "Your statement charges a PCI non-compliance fee of $39.95, a statement fee of $9.95 and a $25 monthly minimum. All three are printed on your statement and all three are negotiable.",
    action: "Call your processor and ask for the PCI, statement and minimum fees to be removed. If they refuse, ask for a written reason and let us know.",
    script: "I'm reviewing our account. I'd like the PCI non-compliance fee, the statement fee and the monthly minimum removed from next month's statement. Can you confirm that today?",
    annual_saving: 899,
    confidence: "high",
  },
  {
    title: "Two scheduling tools charged every month",
    why: "Two charges for online scheduling software appear on your card statement in the same month: $129 and $89. Practices usually need one.",
    action: "Check which one the front desk actually uses and cancel the other after the notice period.",
    script: null,
    annual_saving: 1068,
    confidence: "medium",
  },
  {
    title: "Check whether you still use: streaming subscription, $15.99 a month",
    why: "A $15.99 monthly charge for a consumer streaming service appears on the business card. It may be intended, so we have not counted it.",
    action: "Check who uses it. If nobody does, cancel it after the notice period.",
    script: null,
    annual_saving: 192,
    confidence: "low",
  },
];
const headline = findings.filter((f) => f.confidence !== "low").reduce((n, f) => n + f.annual_saving, 0);

const pdf = await renderFoundMoneyReportPdf({
  practiceName: "Maple Grove Family Dental",
  headline,
  findings,
  alreadyFine: ["No other avoidable card fees appeared on your statement.", "No other repeat subscription charges stood out on the card statement we read."],
  limits: ["Card processing: your effective rate reads as 2.41%. We have not compared it to a benchmark yet; that comparison is added once a sourced fair rate is confirmed.", "Supplies: 14 item lines read. Price comparison against other members' prices is added as the member price list grows; none is claimed here."],
  uploadedAt: new Date("2026-10-05T10:00:00Z"),
  releasedAt: new Date("2026-10-08T15:00:00Z"),
  promise: "Our promise. If we don't find at least one year of your membership in savings, $490, we refund your first year.",
});

const outDir = path.join(root, "scripts", ".out");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "found-money-report-sample.pdf");
fs.writeFileSync(outFile, pdf);
console.log(`PDF written: ${outFile} (${Math.round(pdf.length / 1024)} KB)`);

if (!process.argv.includes("--send")) process.exit(0);

const host = process.env.SMTP_TX_HOST ?? process.env.SMTP_HOST;
const user = process.env.SMTP_TX_USER ?? process.env.SMTP_USER;
const pass = process.env.SMTP_TX_PASS ?? process.env.SMTP_PASS;
const port = Number(process.env.SMTP_TX_PORT ?? process.env.SMTP_PORT ?? "465");
if (!host || !user || !pass) throw new Error("SMTP not configured");
const tx = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });

const logo = fs.readFileSync(path.join(root, "public", "dmn-wordmark.png"));
const html = `<!doctype html><html style="background:#F6F1E7;"><body style="background:#F6F1E7;margin:0;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;"><tr><td style="background:#fff;border:1px solid #E6DDCF;border-radius:14px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:26px 32px 16px;text-align:center;"><img src="cid:dmn-wordmark" alt="Dental Member Network" width="150" style="max-width:150px;height:auto;"></td></tr>
<tr><td style="padding:0 32px;"><div style="height:2px;background:#D9A84B;"></div></td></tr>
<tr><td style="padding:26px 32px 4px;">
<div style="font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#A07823;">Found Money Audit · draft for review</div>
<div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;line-height:1.25;color:#0A1A2F;margin-top:8px;">Sample checked report, as a PDF.</div>
</td></tr>
<tr><td style="padding:14px 32px 8px;color:#1A1A1A;font-size:15px;line-height:1.65;">
<p style="margin:0 0 14px;">Attached is the Found Money report as a member would receive it once the team has checked and released it. The practice and the numbers are sample data from the test documents.</p>
<p style="margin:0 0 14px;">This is the same report shown in the member portal. The PDF is for download and for the walkthrough call.</p>
</td></tr>
<tr><td style="padding:18px 32px 24px;"><div style="border-top:1px solid #EFE8DA;padding-top:16px;color:#7A8590;font-size:12px;line-height:1.6;text-align:center;">Dental Member Network &middot; Powered by Thriving Dentist Inc.</div></td></tr>
</table></td></tr></table></body></html>`;

const info = await tx.sendMail({
  from: "Dental Member Network <noreply@dentalmembernetwork.com>",
  to: TO,
  cc: CC,
  subject: "[DRAFT] Found Money Audit: sample checked report (PDF)",
  html,
  text: "Attached: the sample Found Money checked report as a PDF (sample data).",
  attachments: [
    { filename: "dmn-wordmark.png", content: logo, cid: "dmn-wordmark" },
    { filename: "Found-Money-Audit-Maple-Grove-Family-Dental.pdf", content: pdf, contentType: "application/pdf" },
  ],
});
console.log(`Sent to ${TO} cc ${CC.join(", ")}: ${info.messageId}`);
