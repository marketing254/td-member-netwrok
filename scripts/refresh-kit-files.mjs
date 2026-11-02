#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * refresh-kit-files.mjs — replace every file of an already-imported kit with
 * the rebuilt files in its Drive folder, keeping the same storage paths and
 * rows (so nothing a member has opened changes address).
 *
 * For each resources row of the kit it finds the local file whose sanitised
 * name matches the row's storage path basename, uploads it over the old
 * object and updates file_size_bytes. The portal card and the resource card
 * are re-uploaded too, and portal_card_url is pointed back at the PNG so
 * scripts/shrink-portal-cards.mjs regenerates the 720px WebP afterwards.
 *
 * Videos: pass --videos-from <dir> holding already-compressed MP4s (same
 * sanitised names, see feedback_compress_kit_videos); without it, .mp4 rows
 * are left untouched so a 90 MB source is never uploaded raw.
 *
 * Run from landing/:
 *   node scripts/refresh-kit-files.mjs --slug <topic_slug> --folder "<kit folder>" [--videos-from <dir>] [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const SLUG = opt("--slug"), FOLDER = opt("--folder"), VIDEOS = opt("--videos-from"), DRY = args.includes("--dry-run");
if (!SLUG || !FOLDER) { console.error("need --slug and --folder"); process.exit(1); }

const sanitise = (name) => name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
const mimeFor = (f) => ({ ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".mp4": "video/mp4", ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation", ".vtt": "text/vtt" })[path.extname(f).toLowerCase()] ?? "application/octet-stream";

const localFiles = fs.readdirSync(FOLDER).filter((f) => fs.statSync(path.join(FOLDER, f)).isFile());
const bySanitised = new Map(localFiles.map((f) => [sanitise(f), path.join(FOLDER, f)]));
if (VIDEOS) for (const f of fs.readdirSync(VIDEOS)) if (f.endsWith(".mp4")) bySanitised.set(f, path.join(VIDEOS, f));

async function put(bucket, dest, file, contentType) {
  const buf = fs.readFileSync(file);
  if (DRY) { console.log(`[dry] ${bucket}/${dest} <- ${path.basename(file)} (${(buf.length / 1e6).toFixed(2)} MB)`); return buf.length; }
  let last;
  for (let i = 0; i < 4; i++) {
    const up = await sb.storage.from(bucket).upload(dest, buf, { contentType, upsert: true, cacheControl: "3600" });
    if (!up.error) return buf.length;
    last = up.error.message; console.log(`  retry ${i + 1}: ${last}`);
  }
  throw new Error(`${bucket}/${dest}: ${last}`);
}

const { data: rows, error } = await sb.from("resources").select("id, title, kind, storage_path, file_size_bytes, portal_card_url, resource_card_url").eq("topic_slug", SLUG).order("position");
if (error) throw error;
if (!rows.length) { console.error("no rows for", SLUG); process.exit(1); }

let done = 0, skipped = 0;
for (const r of rows) {
  const base = path.basename(r.storage_path ?? "");
  const file = bySanitised.get(base);
  if (!file) { console.log(`skip  ${r.title}: no local file named ${base}`); skipped++; continue; }
  if (base.endsWith(".mp4") && !VIDEOS) { console.log(`skip  ${r.title}: video (no --videos-from)`); skipped++; continue; }
  const size = await put("member-resources", r.storage_path, file, mimeFor(file));
  if (!DRY) { const u = await sb.from("resources").update({ file_size_bytes: size }).eq("id", r.id); if (u.error) throw u.error; }
  console.log(`ok    ${r.title}: ${(r.file_size_bytes / 1e6).toFixed(2)} -> ${(size / 1e6).toFixed(2)} MB`);
  done++;
}

// Card art: portal card PNG + detail hero. Point the row at the PNG again
// so shrink-portal-cards.mjs makes a fresh 720px WebP.
const portal = localFiles.find((f) => /^Card - Portal Grid.*\.png$/i.test(f));
const hero = localFiles.find((f) => /^Cover - Detail Hero \(wide\)\.png$/i.test(f));
const patch = {};
if (portal) { await put("kit-thumbnails", `${SLUG}/portal-card.png`, path.join(FOLDER, portal), "image/png"); patch.portal_card_url = sb.storage.from("kit-thumbnails").getPublicUrl(`${SLUG}/portal-card.png`).data.publicUrl; }
if (hero) { await put("kit-thumbnails", `${SLUG}/resource-card.png`, path.join(FOLDER, hero), "image/png"); patch.resource_card_url = sb.storage.from("kit-thumbnails").getPublicUrl(`${SLUG}/resource-card.png`).data.publicUrl; }
if (!DRY && Object.keys(patch).length) { const u = await sb.from("resources").update(patch).eq("topic_slug", SLUG); if (u.error) throw u.error; }
console.log(`cards: ${portal ? "portal " : ""}${hero ? "hero " : ""}refreshed`);
console.log(`done=${done} skipped=${skipped}${DRY ? " (dry run)" : ""}`);
