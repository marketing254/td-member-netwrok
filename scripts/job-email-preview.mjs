/**
 * Sends every job-board email, rendered with sample data, to the
 * reviewer(s) for approval. LOCAL SCRIPT ONLY — uses the module's
 * setApprovalPreview hook, which refuses to arm in production.
 *
 *   node scripts/job-email-preview.mjs rushdhaakbar82@gmail.com
 *
 * First argument = To, remaining (optional) = Cc. Send to the reviewer
 * only unless someone has asked for a wider send. Sends one email per sender,
 * ~4 s apart, subjects prefixed "[FOR APPROVAL n/6]".
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// .env.local → process.env (only keys not already set)
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}

const [to, ...cc] = process.argv.slice(2);
if (!to) {
  console.error("usage: node scripts/job-email-preview.mjs <to> [cc...]");
  process.exit(1);
}

// The module starts with `import "server-only"`, which throws outside a
// React server context. Load a copy with that line removed, kept inside
// the project so `import("nodemailer")` still resolves.
const src = fs.readFileSync(path.join(root, "src/lib/email/jobEmails.ts"), "utf8");
const tmp = path.join(root, "scripts/.job-emails-preview-copy.ts");
fs.writeFileSync(tmp, src.replace(/^import "server-only";\r?\n/, ""));
let mod;
try {
  mod = await import(pathToFileURL(tmp).href);
} finally {
  fs.unlinkSync(tmp);
}

const {
  setApprovalPreview,
  notifyTeamNewJob,
  sendJobApproved,
  sendJobRejected,
  sendJobExpiring,
  sendApplicationToPractice,
  sendApplicationCopyToApplicant,
} = mod;

const site = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.dentalmembernetwork.com";
const slug = "dental-hygienist-austin-tx-4k2m";
const jobId = "8c1f0f6a-2b7e-4d7c-9a1e-5f3b2c9d1e70";
const expires = new Date(Date.now() + 30 * 86_400_000).toISOString();

// A tiny valid PDF so the practice email shows the CV attachment.
const cvPdf = Buffer.from(
  "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 88>>stream\nBT /F1 18 Tf 72 720 Td (Jordan Lee - Registered Dental Hygienist - sample CV) Tj ET\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
);

const steps = [
  [
    "Team alert — job pending review (to Lester, BCC Rushdha in production)",
    () =>
      notifyTeamNewJob({
        jobId,
        practiceName: "Riverside Family Dental",
        roleLabel: "Dental hygienist",
        location: "Austin, TX",
        memberEmail: "dr.mitchell@riversidefamilydental.com",
        memberName: "Dr. Sarah Mitchell",
        employmentLabel: "Full time",
        payLine: "$45 to $55 an hour",
        postFormat: "detailed",
        resubmitted: false,
      }),
  ],
  [
    "Member — your post is live",
    () =>
      sendJobApproved({
        to: "dr.mitchell@riversidefamilydental.com",
        firstName: "Dr. Sarah",
        lastName: "Mitchell",
        roleLabel: "Dental hygienist",
        practiceName: "Riverside Family Dental",
        slug,
        location: "Austin, TX",
        expiresAt: expires,
        applyEmail: "careers@riversidefamilydental.com",
        applyUrl: null,
      }),
  ],
  [
    "Member — post needs a change (rejected with reason)",
    () =>
      sendJobRejected({
        to: "dr.mitchell@riversidefamilydental.com",
        firstName: "Dr. Sarah",
        lastName: "Mitchell",
        roleLabel: "Dental hygienist",
        practiceName: "Riverside Family Dental",
        reason:
          "The pay range is missing from the post. Every listing on the board shows pay, so please add an hourly or annual range and resubmit.",
      }),
  ],
  [
    "Member — post expires in 5 days (renew reminder)",
    () =>
      sendJobExpiring({
        to: "dr.mitchell@riversidefamilydental.com",
        firstName: "Dr. Sarah",
        lastName: "Mitchell",
        roleLabel: "Dental hygienist",
        practiceName: "Riverside Family Dental",
        slug,
        daysLeft: 5,
        renewUrl: `${site}/dashboard/jobs?renew=${jobId}`,
        viewCount: 214,
        applicationCount: 6,
      }),
  ],
  [
    "Practice — new application received (CV attached, reply-to applicant)",
    () =>
      sendApplicationToPractice({
        to: "careers@riversidefamilydental.com",
        posterFirstName: "Dr. Sarah",
        posterLastName: "Mitchell",
        jobId,
        jobSlug: slug,
        roleLabel: "Dental hygienist",
        practiceName: "Riverside Family Dental",
        applicantName: "Jordan Lee",
        applicantEmail: "jordan.lee@example.com",
        applicantPhone: "(512) 555-0142",
        message:
          "Hi Dr. Mitchell, I'm a registered hygienist with six years in family practice, currently in Round Rock. I'm available to start in early October and would love to talk about the role.",
        cv: { filename: "Jordan-Lee-CV.pdf", content: cvPdf, contentType: "application/pdf" },
      }),
  ],
  [
    "Applicant — copy of your application",
    () =>
      sendApplicationCopyToApplicant({
        to: "jordan.lee@example.com",
        applicantName: "Jordan Lee",
        applicantEmail: "jordan.lee@example.com",
        applicantPhone: "(512) 555-0142",
        cvFilename: "Jordan-Lee-CV.pdf",
        roleLabel: "Dental hygienist",
        practiceName: "Riverside Family Dental",
        message:
          "Hi Dr. Mitchell, I'm a registered hygienist with six years in family practice, currently in Round Rock. I'm available to start in early October and would love to talk about the role.",
      }),
  ],
];

console.log(`Sending ${steps.length} approval emails → to: ${to}${cc.length ? `, cc: ${cc.join(", ")}` : ""}`);
for (let i = 0; i < steps.length; i++) {
  const [label, run] = steps[i];
  setApprovalPreview({ to, cc, prefix: `[FOR APPROVAL ${i + 1}/${steps.length}]` });
  const ok = await run();
  console.log(`${ok ? "✓" : "✗"} ${i + 1}/${steps.length} ${label}`);
  if (i < steps.length - 1) await new Promise((r) => setTimeout(r, 4000));
}
setApprovalPreview(null);
