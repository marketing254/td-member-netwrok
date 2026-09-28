#!/usr/bin/env node
/**
 * Sends ONE draft of the founding invite email, rendered with sample data,
 * to the reviewer(s) so the team can see exactly what an invitee receives.
 * LOCAL SCRIPT ONLY. It never reads a real invite and never emails anyone
 * but the addresses on the command line.
 *
 *   node scripts/founding-invite-draft.mjs <to> [cc...] [--role=expert|partner|both]
 *
 * Default role is expert. The attached PDF is the same personalized,
 * unaccepted agreement the send button generates, rendered from the
 * real template with the real renderer (needs a local Chrome).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}

const args = process.argv.slice(2);
const roleArg = args.find((a) => a.startsWith("--role="));
const role = roleArg ? roleArg.slice(7) : "expert";
const [to, ...cc] = args.filter((a) => !a.startsWith("--"));
if (!to || !["expert", "partner", "both"].includes(role)) {
  console.error("usage: node scripts/founding-invite-draft.mjs <to> [cc...] [--role=expert|partner|both]");
  process.exit(1);
}

// Both modules start with `import "server-only"`, which throws outside a
// React server context. Load copies with that line removed. The email
// copy also exports its private builders so we can send with a Cc and a
// [DRAFT] subject through our own transporter. The PDF copy has to live
// next to the original so its ./templates and ./resolveLocalChrome
// imports still resolve.
function loadCopy(srcRel, copyAbs, append = "", tweak = (s) => s) {
  const src = fs.readFileSync(path.join(root, srcRel), "utf8");
  fs.writeFileSync(copyAbs, tweak(src.replace(/^import "server-only";\r?\n/, "")) + append);
  return copyAbs;
}
const emailCopy = loadCopy(
  "src/lib/email/foundingInvite.ts",
  path.join(root, "scripts/.founding-invite-copy.ts"),
  "\nexport { buildHtml, buildText };\n",
);
// Plain Node needs the .ts extension on relative imports (Next does not),
// and the Chrome resolver is server-only too, so it gets its own copy.
const chromeCopy = loadCopy(
  "src/lib/pdf/resolveLocalChrome.ts",
  path.join(root, "src/lib/pdf/.resolve-chrome-draft-copy.ts"),
);
const pdfCopy = loadCopy(
  "src/lib/pdf/foundingAgreementPdf.ts",
  path.join(root, "src/lib/pdf/.founding-pdf-draft-copy.ts"),
  "",
  (s) => s.replace('"./resolveLocalChrome"', '"./.resolve-chrome-draft-copy.ts"'),
);

try {
  const email = await import(pathToFileURL(emailCopy).href);
  const pdf = await import(pathToFileURL(pdfCopy).href);

  // Sample invitee. Nothing here is a real person or a real invite code.
  const sample = {
    expert: { fullName: "Dr. Jane Example", companyName: null, memberOffer: null },
    partner: { fullName: "Alex Example", companyName: "Example Dental Supply Co.", memberOffer: "15% off first order for DMN members" },
    both: { fullName: "Dr. Jane Example", companyName: "Example Coaching Group", memberOffer: "Free 30-minute strategy call for DMN members" },
  }[role];
  const agreementVersion = "v4";
  const inviteUrl = "https://www.dentalmembernetwork.com/founding/SAMPLE-CODE-NOT-LIVE";
  const roleLabel = role === "both" ? "Founding Expert + Partner" : role === "partner" ? "Founding Partner" : "Founding Expert";
  const firstName = sample.fullName.split(/\s+/)[0];

  console.log(`Rendering the ${role} agreement PDF with the real template…`);
  const pdfBuffer = await pdf.renderFoundingAgreementPdf({
    role,
    pricing: "flat_49",
    signer: { name: sample.fullName, email: to, companyName: sample.companyName },
    memberOffer: sample.memberOffer,
    signedAt: new Date(),
    ipHashLast6: "pending",
    accepted: false,
  });

  const input = { to, fullName: sample.fullName, role, inviteUrl, agreementVersion, roleLabel, firstName };
  const banner =
    '<div style="max-width:560px;margin:0 auto 12px auto;padding:10px 14px;background:#FFF4D6;border:1px solid #E5C76B;border-radius:8px;font:13px system-ui,sans-serif;color:#5C4A12;">' +
    `DRAFT FOR REVIEW · sample data · this is what a ${roleLabel} receives when the team clicks Send / Resend. The link and the name are placeholders. Nothing was sent to any expert or partner.</div>`;
  const html = email.buildHtml(input).replace(/<body([^>]*)>/, `<body$1>${banner}`);
  const text = `DRAFT FOR REVIEW (sample data, nothing sent to any expert or partner)\n\n` + email.buildText(input);

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new Error("SMTP_HOST / SMTP_USER / SMTP_PASS missing in .env.local");
  const port = Number(process.env.SMTP_PORT ?? "465");
  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  const info = await transporter.sendMail({
    from: process.env.WAITLIST_EMAIL_FROM ?? "Dental Member Network <hello@joindmn.com>",
    to,
    cc: cc.length ? cc : undefined,
    subject: `[DRAFT for review] Dental Member Network agreement for review (${roleLabel})`,
    html,
    text,
    attachments: [{ filename: `DMN-Founding-Agreement-${agreementVersion}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
  });
  console.log(`✓ sent to ${to}${cc.length ? ` cc ${cc.join(", ")}` : ""} · ${info.messageId}`);
} finally {
  fs.unlinkSync(emailCopy);
  fs.unlinkSync(pdfCopy);
  fs.unlinkSync(chromeCopy);
}
