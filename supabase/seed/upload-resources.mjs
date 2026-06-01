#!/usr/bin/env node
/**
 * Walks ../../../Resources/ (relative to this file), uploads each file to
 * the `member-resources` Supabase Storage bucket, and inserts a row in
 * public.resources for each.
 *
 * USAGE
 *   1. Ensure landing/.env.local has NEXT_PUBLIC_SUPABASE_URL and
 *      SUPABASE_SERVICE_ROLE_KEY set.
 *   2. From the landing/ folder:
 *
 *        node supabase/seed/upload-resources.mjs
 *
 *   3. The script is IDEMPOTENT — re-running uploads with upsert=true and
 *      uses ON CONFLICT for the DB rows. Safe to run multiple times.
 *
 * What it does:
 *   - For each subfolder of Resources/, treats it as a "topic"
 *   - Maps the folder name to a topic_slug + topic_title (see TOPIC_LABELS)
 *   - For each file in the topic folder, infers the resource_kind from
 *     filename pattern (DMN_Action_Guide_X.pdf → action_guide, etc.)
 *   - Uploads to member-resources bucket at "{topic_slug}/{filename}"
 *   - Inserts/upserts a public.resources row pointing at the public URL
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, basename, extname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Walk up to landing/ for .env.local
config({ path: resolve(__dirname, "..", "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in landing/.env.local.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Topic labels — convert folder names into nice slug + title + summary.
// Any folder not in here falls back to auto-derivation.
// ---------------------------------------------------------------------------
const TOPIC_LABELS = {
  EP420_6_Digital_Photos: {
    slug: "digital-photos",
    title: "6 Digital Photos Every Practice Should Take",
    summary:
      "The six clinical photos that lift case acceptance, give clarity to specialists, and protect you in disputes.",
  },
  EP422_5_Scheduling_Tips: {
    slug: "scheduling-tips",
    title: "5 Scheduling Tips That Free Up 90 Minutes a Day",
    summary:
      "Block-scheduling, hygiene cadence, recall, and morning prep — the small tweaks that compound.",
  },
  EP_Case_Acceptance: {
    slug: "case-acceptance",
    title: "Case Acceptance",
    summary:
      "Frame, present, and close treatment plans without pressure. Quick-start intro.",
  },
  EP_KPIs: {
    slug: "kpis",
    title: "Practice KPIs — Intro",
    summary: "Why the right metrics matter and where most owners look in the wrong places.",
  },
  EP_KPIs_9_Core_KPIs: {
    slug: "kpis-9-core",
    title: "The 9 Core KPIs Every Owner Should Watch",
    summary:
      "Production, collections, hygiene reappointment, treatment acceptance — and the 5 others that quietly run your practice.",
  },
  EP_Marketing_Mistakes: {
    slug: "marketing-mistakes",
    title: "The Marketing Mistakes Costing You New Patients",
    summary:
      "Why most practices waste 40% of their marketing spend, and how to fix it this quarter.",
  },
  EP_Mindset_Shift: {
    slug: "mindset-shift",
    title: "The Operator Mindset Shift",
    summary:
      "From clinician-doing-everything to owner running a business that scales.",
  },
  EP_Morning_Huddle: {
    slug: "morning-huddle",
    title: "The Morning Huddle Playbook",
    summary:
      "A 12-minute meeting structure that aligns the team, raises production, and reduces no-shows.",
  },
  EP_PPO_Negotiation: {
    slug: "ppo-negotiation",
    title: "PPO Renegotiation in 90 Days",
    summary:
      "The four-letter framework for raising fee schedules without losing patients.",
  },
  EP_Phone_Skills: {
    slug: "phone-skills",
    title: "Front-Desk Phone Skills",
    summary:
      "What the first 30 seconds of a new-patient call should sound like, with role-play scripts.",
  },
  EP_Reviews_Trust: {
    slug: "reviews-trust",
    title: "Reviews & Online Trust",
    summary:
      "How to get more 5-star reviews without bribing patients — and what to do about the bad ones.",
  },
  EP_SEO: {
    slug: "seo-intro",
    title: "Local SEO — Intro",
    summary: "The 80/20 of ranking in the Google map pack for your city.",
  },
  EP_SEO_Google_Rankings: {
    slug: "seo-google-rankings",
    title: "Local SEO — Climbing Google Rankings",
    summary:
      "Citations, schema, reviews, Google Business Profile — the levers that actually move rank.",
  },
  EP_Scheduling: {
    slug: "scheduling-intro",
    title: "Scheduling — Intro",
    summary: "Start-here video on practice scheduling.",
  },
};

// ---------------------------------------------------------------------------
// Filename → resource_kind classification.
// Looks at the basename in lowercase and matches a fragment.
// Order matters — first match wins.
// ---------------------------------------------------------------------------
const KIND_RULES = [
  { match: /_video_intro_/i, kind: "video_intro", title: "Video Intro" },
  { match: /_full_video_|_video_full_/i, kind: "video_full", title: "Full Video" },
  { match: /_explainer_video_|_video_explainer_/i, kind: "video_explainer", title: "Explainer Video" },
  { match: /_trailer_/i, kind: "video_trailer", title: "Trailer" },
  { match: /_audio_episode_|_audio_/i, kind: "audio", title: "Audio Episode" },
  { match: /_action_guide_/i, kind: "action_guide", title: "Action Guide" },
  { match: /_checklist_/i, kind: "checklist", title: "Checklist" },
  { match: /_key_takeaways_/i, kind: "key_takeaways", title: "Key Takeaways" },
  { match: /_worksheet_/i, kind: "worksheet", title: "Worksheet" },
  { match: /_slide_deck_/i, kind: "slide_deck", title: "Slide Deck" },
  { match: /_email_sequence_/i, kind: "email_sequence", title: "Email Sequence" },
];

function classify(filename) {
  for (const rule of KIND_RULES) {
    if (rule.match.test(filename)) {
      return { kind: rule.kind, title: rule.title };
    }
  }
  return { kind: "other", title: basename(filename, extname(filename)) };
}

const MIME = {
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function topicMeta(folderName) {
  if (TOPIC_LABELS[folderName]) return TOPIC_LABELS[folderName];
  // Fallback — turn "EP_Some_Thing" into a slug + title.
  const cleaned = folderName.replace(/^EP[0-9]*_/, "").replace(/^EP_/, "");
  const slug = cleaned.toLowerCase().replace(/_+/g, "-");
  const title = cleaned.replace(/_+/g, " ");
  return { slug, title, summary: "" };
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const RESOURCES_ROOT = resolve(__dirname, "..", "..", "..", "Resources");

console.log(`Reading resources from: ${RESOURCES_ROOT}\n`);

let uploadedCount = 0;
let skippedCount = 0;
let failedCount = 0;

const topicFolders = readdirSync(RESOURCES_ROOT).filter((name) => {
  try {
    return statSync(join(RESOURCES_ROOT, name)).isDirectory();
  } catch {
    return false;
  }
});

for (const folder of topicFolders) {
  const meta = topicMeta(folder);
  const folderPath = join(RESOURCES_ROOT, folder);
  const files = readdirSync(folderPath).filter((f) =>
    statSync(join(folderPath, f)).isFile(),
  );

  console.log(`\n▸ ${folder} → ${meta.slug} (${files.length} files)`);

  let position = 0;
  for (const file of files) {
    position += 10; // gaps for manual reorder later
    const localPath = join(folderPath, file);
    const storagePath = `${meta.slug}/${file}`;
    const ext = extname(file).toLowerCase();
    const mime = MIME[ext] ?? "application/octet-stream";
    const { kind, title } = classify(file);

    let stats;
    try {
      stats = statSync(localPath);
    } catch (err) {
      console.log(`    ✗ ${file} — stat failed: ${err.message}`);
      failedCount++;
      continue;
    }

    // 1. Upload to Storage (idempotent via upsert)
    let buffer;
    try {
      buffer = readFileSync(localPath);
    } catch (err) {
      console.log(`    ✗ ${file} — read failed: ${err.message}`);
      failedCount++;
      continue;
    }

    const { error: upErr } = await sb.storage
      .from("member-resources")
      .upload(storagePath, buffer, { contentType: mime, upsert: true });
    if (upErr) {
      console.log(`    ✗ ${file} — upload failed: ${upErr.message}`);
      failedCount++;
      continue;
    }

    // 2. Get the public URL
    const { data: pub } = sb.storage
      .from("member-resources")
      .getPublicUrl(storagePath);

    // 3. Upsert the DB row.
    //    Unique key: (topic_slug, storage_path). We use a manual delete+insert
    //    pattern since there's no composite unique constraint to ON CONFLICT on.
    const { error: delErr } = await sb
      .from("resources")
      .delete()
      .eq("topic_slug", meta.slug)
      .eq("storage_path", storagePath);
    if (delErr) {
      console.log(`    ✗ ${file} — pre-delete failed: ${delErr.message}`);
      failedCount++;
      continue;
    }

    const { error: insErr } = await sb.from("resources").insert({
      topic_slug: meta.slug,
      topic_title: meta.title,
      topic_summary: meta.summary || null,
      title,
      description: null,
      kind,
      storage_path: storagePath,
      external_url: pub.publicUrl,
      mime_type: mime,
      file_size_bytes: stats.size,
      position,
      is_free: true,
      is_published: true,
    });
    if (insErr) {
      console.log(`    ✗ ${file} — DB insert failed: ${insErr.message}`);
      failedCount++;
      continue;
    }

    console.log(
      `    ✓ ${file.padEnd(60)} ${kind.padEnd(16)} ${Math.round(stats.size / 1024)}KB`,
    );
    uploadedCount++;
  }
}

console.log(`\n──────────────────────────────────────────────────────────`);
console.log(`Done. Uploaded: ${uploadedCount}  Failed: ${failedCount}  Skipped: ${skippedCount}`);
console.log(`──────────────────────────────────────────────────────────`);
