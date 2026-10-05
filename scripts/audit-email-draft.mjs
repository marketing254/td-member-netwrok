#!/usr/bin/env node
/**
 * Sends the four Found Money Audit emails with sample data so the team can
 * see the design. LOCAL ONLY. The module is sandboxed, so every email lands
 * in the sandbox inbox (rushdhaakbar82@gmail.com) whatever address is passed.
 *
 *   node scripts/audit-email-draft.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}
delete process.env.AUDIT_EMAILS_LIVE; // never live from this script

// Load a copy without "server-only", with appOrigin inlined so lib/stripe is not pulled in.
const src = fs.readFileSync(path.join(root, "src/lib/email/auditEmails.ts"), "utf8")
  .replace(/^import "server-only";\r?\n/, "")
  .replace(/import \{ appOrigin \} from "@\/lib\/stripe";/, 'const appOrigin = () => "http://localhost:3000";');
const tmp = path.join(root, "scripts/.audit-emails-copy.ts");
fs.writeFileSync(tmp, src);
let mod;
try {
  mod = await import(pathToFileURL(tmp).href);
} finally {
  fs.unlinkSync(tmp);
}

const steps = [
  ["Team alert: new upload", () => mod.sendAuditTeamAlert({ kind: "upload", auditId: "00000000-0000-0000-0000-000000000001", email: "dr.patel@maplegrovedental.example", practiceName: "Maple Grove Family Dental", headline: 899 })],
  ["Visitor: your estimate is ready", () => mod.sendAuditEstimateEmail({ to: "dr.patel@maplegrovedental.example", token: "00000000-0000-0000-0000-000000000002", headline: 899, practiceName: "Maple Grove Family Dental" })],
  ["Team alert: member joined and unlocked", () => mod.sendAuditTeamAlert({ kind: "unlock", auditId: "00000000-0000-0000-0000-000000000001", email: "dr.patel@maplegrovedental.example", practiceName: "Maple Grove Family Dental", headline: 899 })],
  ["Member: report released", () => mod.sendAuditReleasedEmail({ to: "dr.patel@maplegrovedental.example", headline: 899, practiceName: "Maple Grove Family Dental" })],
];
for (const [label, run] of steps) {
  const ok = await run();
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  await new Promise((r) => setTimeout(r, 2500));
}
