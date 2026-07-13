#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * upload-all.mjs — ONE command to load Ashley + Phillips end-to-end.
 *
 * Runs, in order:
 *   1. import-profiles.mjs   → bios, headshots, logos, categories, name fix
 *   2. import-resources.mjs  → Ashley's kit  (attributed → her expert portal + member portal only)
 *   3. import-resources.mjs  → Phillips kit  (attributed → Laura's portal + member portal only)
 *
 * Attribution means each kit shows up:
 *   - inside the expert's own portal (read-only "published on your behalf" list),
 *   - in the member portal library + on their member-facing profile,
 *   - and NEVER on the public /resources page.
 *
 * Usage (from landing/):
 *   node scripts/upload-all.mjs --dry-run     # preview everything, uploads nothing
 *   node scripts/upload-all.mjs               # upload, kits staged as pending_review
 *   node scripts/upload-all.mjs --publish     # upload + publish (live in member portal)
 *
 *   Optional: --root "D:/TD - Member Network"  (default shown)
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const PUBLISH = argv.includes("--publish");
const rootIdx = argv.indexOf("--root");
const ROOT = rootIdx >= 0 ? argv[rootIdx + 1] : "D:/TD - Member Network";

const KITS = [
  {
    label: "Ashley Boaz — Transition Without Turbulence",
    root: path.join(ROOT, "Resources", "Ashley E Boaz"),
    only: "Kit - Transition Without Turbulence",
    expertEmail: "ashley@mintconceptions.com",
    category: "Practice Transitions",
  },
  {
    label: "Laura Phillips — Know Your Real Numbers",
    root: path.join(ROOT, "Resources", "The Phillips Group"),
    only: "Kit - Know Your Real Numbers",
    expertEmail: "andrew@phillipsgrouptax.com",
    category: "Tax & Accounting",
  },
];

function run(label, script, args) {
  console.log(`\n════════════════════════════════════════════════════════`);
  console.log(`▶ ${label}`);
  console.log(`════════════════════════════════════════════════════════`);
  const res = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
    stdio: "inherit",
  });
  return res.status === 0;
}

const results = [];

// 1. Profiles (bios / headshots / logos / categories / Phillips name fix)
results.push({
  step: "Profiles (bios, headshots, logos)",
  ok: run("Step 1/3 — Profiles", "import-profiles.mjs", [
    "--root", ROOT,
    ...(DRY ? ["--dry-run"] : []),
  ]),
});

// 2 + 3. The two kits, attributed + square cover.
for (const [i, kit] of KITS.entries()) {
  results.push({
    step: kit.label,
    ok: run(`Step ${i + 2}/3 — ${kit.label}`, "import-resources.mjs", [
      "--root", kit.root,
      "--only", kit.only,
      "--expert-email", kit.expertEmail,
      "--square-cover",
      "--category", kit.category,
      ...(PUBLISH ? ["--publish"] : []),
      ...(DRY ? ["--dry-run"] : []),
    ]),
  });
}

console.log(`\n════════════════════ SUMMARY ════════════════════`);
let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? "✓" : "✗"} ${r.step}`);
  if (!r.ok) failed += 1;
}
if (DRY) console.log("\n(DRY RUN — nothing was uploaded. Re-run without --dry-run.)");
else if (!PUBLISH) console.log("\nKits are staged as pending_review. Re-run with --publish (or approve in Admin → Resources) to go live.");
else console.log("\nEverything published. Verify with the SQL in Resources/UPLOAD_AND_TEST_GUIDE.md §4.");
process.exit(failed ? 1 : 0);
