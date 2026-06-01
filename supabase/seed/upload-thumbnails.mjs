#!/usr/bin/env node
/**
 * Uploads kit cover thumbnails from ../../../thumbnails/ to the
 * `kit-thumbnails` Supabase Storage bucket, then writes the public URL
 * onto every resources row that shares the same topic_slug.
 *
 * USAGE  (from landing/):
 *   node supabase/seed/upload-thumbnails.mjs
 *
 * Pre-requisites:
 *   - landing/.env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - migration 0012_kit_thumbnails.sql has been applied
 *   - resource rows already exist (run upload-resources.mjs first)
 *
 * Idempotent — safe to re-run when you add or replace a cover.
 *
 * Convention: filename without extension == topic_slug.
 *   thumbnails/kpis.jpg            →  topic_slug = "kpis"
 *   thumbnails/ppo-negotiation.jpg →  topic_slug = "ppo-negotiation"
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

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// thumbnails/ lives at the project root, two levels above landing/.
const THUMBS_ROOT = resolve(__dirname, "..", "..", "..", "thumbnails");

console.log(`Reading thumbnails from: ${THUMBS_ROOT}\n`);

let uploaded = 0;
let linked = 0;
let failed = 0;
let unmatched = 0;

let files;
try {
  files = readdirSync(THUMBS_ROOT).filter((f) => {
    try {
      return statSync(join(THUMBS_ROOT, f)).isFile() && /\.(jpe?g|png|webp)$/i.test(f);
    } catch {
      return false;
    }
  });
} catch (err) {
  console.error(`Could not read thumbnails folder: ${err.message}`);
  process.exit(1);
}

if (files.length === 0) {
  console.warn("No image files found in thumbnails/. Add JPG/PNG/WEBP files named after each topic slug.");
  process.exit(0);
}

for (const file of files) {
  const ext = extname(file).toLowerCase();
  const slug = basename(file, ext); // "kpis.jpg" → "kpis"
  const localPath = join(THUMBS_ROOT, file);
  const storagePath = `${slug}${ext}`; // flat layout in the bucket
  const mime = MIME[ext] ?? "application/octet-stream";

  let buf;
  try {
    buf = readFileSync(localPath);
  } catch (err) {
    console.log(`  ✗ ${file} — read failed: ${err.message}`);
    failed++;
    continue;
  }

  // 1. Upload to Storage (idempotent via upsert).
  const { error: upErr } = await sb.storage
    .from("kit-thumbnails")
    .upload(storagePath, buf, {
      contentType: mime,
      upsert: true,
      cacheControl: "31536000", // 1 year — covers rarely change
    });
  if (upErr) {
    console.log(`  ✗ ${file} — upload failed: ${upErr.message}`);
    failed++;
    continue;
  }
  uploaded++;

  // 2. Resolve the public URL for the just-uploaded object.
  const { data: pub } = sb.storage.from("kit-thumbnails").getPublicUrl(storagePath);
  const publicUrl = pub.publicUrl;

  // 3. Write the URL onto every resources row in this topic.
  const { error: updErr, count } = await sb
    .from("resources")
    .update({ topic_thumbnail_url: publicUrl }, { count: "exact" })
    .eq("topic_slug", slug);

  if (updErr) {
    console.log(`  ✗ ${file} — DB update failed: ${updErr.message}`);
    failed++;
    continue;
  }

  const rows = count ?? 0;
  if (rows === 0) {
    unmatched++;
    console.log(
      `  · ${file.padEnd(34)} → ${slug.padEnd(24)} uploaded, but no resources rows match this topic_slug yet`,
    );
  } else {
    linked += rows;
    console.log(`  ✓ ${file.padEnd(34)} → ${slug.padEnd(24)} (${rows} rows linked)`);
  }
}

console.log(`\n──────────────────────────────────────────────────────────`);
console.log(
  `Done. Uploaded: ${uploaded}  Rows linked: ${linked}  Unmatched: ${unmatched}  Failed: ${failed}`,
);
console.log(`──────────────────────────────────────────────────────────`);
if (unmatched > 0) {
  console.log(
    `\nHeads-up: ${unmatched} thumbnail(s) didn't match any topic_slug in the resources table.`,
  );
  console.log(`Make sure the file basename matches a topic_slug exactly (case-sensitive).`);
}
