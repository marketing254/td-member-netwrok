#!/usr/bin/env node
/**
 * Uploads the new founding-set resource kits to Supabase Storage and
 * inserts the matching rows in public.resources.
 *
 * USAGE  (from landing/):
 *   # Upload the default single kit (9 KPIs), marked APPROVED.
 *   node supabase/seed/upload-new-kits.mjs
 *
 *   # Upload every kit in the master index, all APPROVED.
 *   node supabase/seed/upload-new-kits.mjs --all
 *
 *   # Upload a single named kit (folder name as it appears in Resources/).
 *   node supabase/seed/upload-new-kits.mjs --kit "Scheduling for Profitability"
 *
 *   # Upload as pending review (simulates a team-submitted kit waiting on
 *   # admin approval).
 *   node supabase/seed/upload-new-kits.mjs --kit "Case Acceptance Mastery" --pending
 *
 * Convention per kit folder (../../../Resources/<KitFolder>/):
 *   Cover - Square (social).png    →  portal_card_url
 *   Cover - Detail Hero (wide).png →  resource_card_url
 *   Training Video.mp4             →  resource row (kind=video_full)
 *   Action Guide.pdf               →  resource row (kind=action_guide)
 *   Checklist.pdf                  →  resource row (kind=checklist)
 *   Worksheet.pdf                  →  resource row (kind=worksheet)
 *   Key Takeaways.pdf              →  resource row (kind=key_takeaways)
 *   Slide Deck.pdf                 →  resource row (kind=slide_deck)
 *   Wall Poster.pdf                →  resource row (kind=other)
 *
 *   Slide Deck.pptx is intentionally skipped — the PDF version previews
 *   inline; the PPTX can be added later via the admin portal if anyone
 *   needs an editable source file.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, extname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "..", "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in landing/.env.local.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const wantAll = args.includes("--all");
const wantPending = args.includes("--pending");
const kitIdx = args.indexOf("--kit");
const specificKit = kitIdx >= 0 ? args[kitIdx + 1] : null;

// ---------------------------------------------------------------------------
// Master index — kit folder → slug, title, category, summary
// (copied from Resources/_Master Index.xlsx — keep in sync if the sheet
// changes)
// ---------------------------------------------------------------------------
const KITS = [
  {
    folder: "9 KPIs That Drive Your Practice",
    slug: "9-kpis",
    title: "The 9 KPIs That Drive Your Practice",
    category: "Practice Management",
    summary:
      "The nine numbers every practice owner should watch — production, collections, hygiene reappointment, treatment acceptance, and five more that quietly run your business.",
  },
  {
    folder: "Scheduling for Profitability",
    slug: "scheduling-for-profitability",
    title: "Scheduling for Profitability",
    category: "Practice Management",
    summary:
      "Block scheduling, hygiene cadence, recall, and morning prep — the small tweaks that compound across the calendar.",
  },
  {
    folder: "Case Acceptance Mastery",
    slug: "case-acceptance-mastery",
    title: "Case Acceptance Mastery",
    category: "Practice Management",
    summary: "Frame, present, and close treatment plans without pressure.",
  },
  {
    folder: "The Overhead Equation - Getting Under 60_",
    slug: "overhead-equation",
    title: "The Overhead Equation — Getting Under 60%",
    category: "Practice Management",
    summary: "How to bring overhead under 60% without slashing the team or the patient experience.",
  },
  {
    folder: "The 24 Business Systems Framework",
    slug: "24-business-systems",
    title: "The 24 Business Systems Framework",
    category: "Practice Management",
    summary: "The 24 systems every practice needs documented if you want it to run without you.",
  },
  {
    folder: "The First 100 Days Plan for Practice Owners",
    slug: "first-100-days",
    title: "The First 100 Days",
    category: "Practice Management",
    summary: "A week-by-week onboarding plan for new (or recently-acquired) practice owners.",
  },
  {
    folder: "5 Decisions Every Thriving Dentist Needs to Make",
    slug: "5-decisions",
    title: "5 Decisions Every Thriving Dentist Makes",
    category: "Practice Management",
    summary: "The five compounding decisions that separate thriving practices from average ones.",
  },
  {
    folder: "The New Patient Phone Call - From Ring to Booking",
    slug: "new-patient-phone-call",
    title: "The New-Patient Phone Call",
    category: "Front Desk",
    summary: "What the first 30 seconds of a new-patient call should sound like — with role-play scripts.",
  },
  {
    folder: "Handling the Hard Questions",
    slug: "hard-questions",
    title: "Handling the Hard Questions",
    category: "Front Desk",
    summary: "Scripts for the three patient questions that derail front-desk conversations.",
  },
  {
    folder: "Building Your Dream Team",
    slug: "dream-team",
    title: "Building Your Dream Team",
    category: "Team & Culture",
    summary: "Hiring, onboarding, and retaining the people who turn a practice into a great one.",
  },
  {
    folder: "Morning Huddles & Team Communication",
    slug: "morning-huddle",
    title: "The 10-Minute Morning Huddle",
    category: "Team & Culture",
    summary: "A 12-minute structure that aligns the team, raises production, and reduces no-shows.",
  },
  {
    folder: "How to Use DISC Personality Styles in Your Practice",
    slug: "disc",
    title: "DISC Personality Styles",
    category: "Team & Culture",
    summary: "Reading the four DISC styles to communicate with team members and patients alike.",
  },
  {
    folder: "5 Tips to Be a Rockstar Dental Team Member",
    slug: "rockstar-team-member",
    title: "Be a Rockstar Team Member",
    category: "Team & Culture",
    summary: "Five habits to share with new team members in their first week.",
  },
  {
    folder: "The Patient Experience - Before, During, and After",
    slug: "patient-experience",
    title: "The Patient Experience",
    category: "Patient Experience",
    summary: "Designing the patient journey end-to-end — before, during, and after the visit.",
  },
  {
    folder: "The Evening _We Care_ Call That Creates Patient Loyalty",
    slug: "evening-we-care-call",
    title: "The Evening 'We Care' Call",
    category: "Patient Experience",
    summary: "The 90-second post-op call that turns new patients into raving fans.",
  },
];

// ---------------------------------------------------------------------------
// File → resource_kind classification
// ---------------------------------------------------------------------------
const FILE_RULES = [
  { match: /^Training Video\.mp4$/i, kind: "video_full", title: "Training Video", position: 10 },
  { match: /^Action Guide\.pdf$/i, kind: "action_guide", title: "Action Guide", position: 20 },
  { match: /^Checklist\.pdf$/i, kind: "checklist", title: "Checklist", position: 30 },
  { match: /^Worksheet\.pdf$/i, kind: "worksheet", title: "Worksheet", position: 40 },
  { match: /^Key Takeaways\.pdf$/i, kind: "key_takeaways", title: "Key Takeaways", position: 50 },
  { match: /^Slide Deck\.pdf$/i, kind: "slide_deck", title: "Slide Deck", position: 60 },
  // Editable PowerPoint version — kept alongside the PDF so members can
  // download and present from it. Office viewer renders this inline.
  { match: /^Slide Deck\.pptx$/i, kind: "slide_deck", title: "Slide Deck (PowerPoint)", position: 65 },
  // Wall Poster is a PDF — kept as 'other' kind but the page detector
  // previews any application/pdf inline regardless of kind.
  { match: /^Wall Poster\.pdf$/i, kind: "other", title: "Wall Poster", position: 70 },
];

const MIME = {
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function classify(filename) {
  for (const rule of FILE_RULES) {
    if (rule.match.test(filename)) return rule;
  }
  return null; // unknown file, skip
}

// ---------------------------------------------------------------------------
// Pick which kits to upload based on CLI flags
// ---------------------------------------------------------------------------
let kitsToUpload;
if (wantAll) {
  kitsToUpload = KITS;
} else if (specificKit) {
  const k = KITS.find((x) => x.folder === specificKit);
  if (!k) {
    console.error(`No kit found matching folder "${specificKit}". Known folders:`);
    KITS.forEach((kk) => console.error("  -", kk.folder));
    process.exit(1);
  }
  kitsToUpload = [k];
} else {
  // Default: just the 9 KPIs kit, marked approved
  kitsToUpload = [KITS[0]];
}

const submissionStatus = wantPending ? "pending_review" : "approved";

console.log(`Uploading ${kitsToUpload.length} kit(s) with status="${submissionStatus}".\n`);

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// Ensure the two public Storage buckets exist. The supabase migrations
// (0011_member_resources, 0012_kit_thumbnails) create these via SQL, but
// if anyone runs this script against a fresh project where the buckets
// haven't been provisioned yet, we want a clear self-healing path instead
// of "Bucket not found" failures on every upload.
// ---------------------------------------------------------------------------
async function ensureBucket(id) {
  const { data: existing, error: getErr } = await sb.storage.getBucket(id);
  if (existing && !getErr) {
    return; // already there
  }
  const { error: createErr } = await sb.storage.createBucket(id, {
    public: true,
  });
  if (createErr) {
    // If two parallel runs raced and the bucket appeared in between, that's fine.
    if (/already exists/i.test(createErr.message)) return;
    throw new Error(`Could not create bucket "${id}": ${createErr.message}`);
  }
  console.log(`  + Created Storage bucket "${id}" (public).`);
}

console.log("Ensuring Storage buckets exist…");
try {
  await ensureBucket("kit-thumbnails");
  await ensureBucket("member-resources");
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const RESOURCES_ROOT = resolve(__dirname, "..", "..", "..", "Resources");

let uploadedFiles = 0;
let insertedRows = 0;
let failed = 0;
let skipped = 0;

for (const kit of kitsToUpload) {
  const folderPath = join(RESOURCES_ROOT, kit.folder);
  if (!existsSync(folderPath)) {
    console.log(`✗ ${kit.folder} — folder not found at ${folderPath}`);
    failed++;
    continue;
  }
  console.log(`\n▸ ${kit.folder}  (${kit.slug})  [${kit.category}]`);

  // ---- 1. Upload the two thumbnail covers to the kit-thumbnails bucket ----
  let portalCardUrl = null;
  let resourceCardUrl = null;

  const covers = [
    { localName: "Cover - Square (social).png", storageName: `${kit.slug}/portal-card.png`, target: "portal" },
    { localName: "Cover - Detail Hero (wide).png", storageName: `${kit.slug}/resource-card.png`, target: "resource" },
  ];

  for (const c of covers) {
    const lp = join(folderPath, c.localName);
    if (!existsSync(lp)) {
      console.log(`    · ${c.localName.padEnd(40)} not found, skipping`);
      continue;
    }
    let buf;
    try {
      buf = readFileSync(lp);
    } catch (err) {
      console.log(`    ✗ ${c.localName} — read failed: ${err.message}`);
      failed++;
      continue;
    }
    const { error } = await sb.storage.from("kit-thumbnails").upload(c.storageName, buf, {
      contentType: "image/png",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) {
      console.log(`    ✗ ${c.localName} — upload failed: ${error.message}`);
      failed++;
      continue;
    }
    const { data: pub } = sb.storage.from("kit-thumbnails").getPublicUrl(c.storageName);
    if (c.target === "portal") portalCardUrl = pub.publicUrl;
    else resourceCardUrl = pub.publicUrl;
    uploadedFiles++;
    console.log(`    ✓ ${c.localName.padEnd(40)}  →  kit-thumbnails/${c.storageName}`);
  }

  // ---- 2. Upload the content files to the member-resources bucket
  //         + insert a resources row per file ----
  const files = readdirSync(folderPath).filter((f) =>
    statSync(join(folderPath, f)).isFile(),
  );

  // Clear any existing rows for this slug (idempotent re-runs).
  const { error: delErr } = await sb.from("resources").delete().eq("topic_slug", kit.slug);
  if (delErr) {
    console.log(`    ✗ pre-delete failed: ${delErr.message}`);
    failed++;
    continue;
  }

  for (const file of files) {
    const rule = classify(file);
    if (!rule) {
      skipped++;
      continue;
    }
    const localPath = join(folderPath, file);
    const storagePath = `${kit.slug}/${file.replace(/\s+/g, "_")}`;
    const ext = extname(file).toLowerCase();
    const mime = MIME[ext] ?? "application/octet-stream";

    let buf;
    try {
      buf = readFileSync(localPath);
    } catch (err) {
      console.log(`    ✗ ${file} — read failed: ${err.message}`);
      failed++;
      continue;
    }
    const stats = statSync(localPath);

    const { error: upErr } = await sb.storage
      .from("member-resources")
      .upload(storagePath, buf, { contentType: mime, upsert: true });
    if (upErr) {
      console.log(`    ✗ ${file} — upload failed: ${upErr.message}`);
      failed++;
      continue;
    }
    const { data: pub } = sb.storage.from("member-resources").getPublicUrl(storagePath);

    const { error: insErr } = await sb.from("resources").insert({
      topic_slug: kit.slug,
      topic_title: kit.title,
      topic_summary: kit.summary,
      category: kit.category,
      portal_card_url: portalCardUrl,
      resource_card_url: resourceCardUrl,
      title: rule.title,
      description: null,
      kind: rule.kind,
      storage_path: storagePath,
      external_url: pub.publicUrl,
      mime_type: mime,
      file_size_bytes: stats.size,
      position: rule.position,
      is_free: true,
      is_published: true,
      submission_status: submissionStatus,
      submitted_at: new Date().toISOString(),
      approved_at: submissionStatus === "approved" ? new Date().toISOString() : null,
    });
    if (insErr) {
      console.log(`    ✗ ${file} — DB insert failed: ${insErr.message}`);
      failed++;
      continue;
    }

    uploadedFiles++;
    insertedRows++;
    console.log(
      `    ✓ ${file.padEnd(40)} ${rule.kind.padEnd(14)} ${Math.round(stats.size / 1024).toString().padStart(6)}KB`,
    );
  }
}

console.log(`\n──────────────────────────────────────────────────────────`);
console.log(
  `Done. Files uploaded: ${uploadedFiles}   Rows inserted: ${insertedRows}   Skipped: ${skipped}   Failed: ${failed}`,
);
console.log(`──────────────────────────────────────────────────────────`);
