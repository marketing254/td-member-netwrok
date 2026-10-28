#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * short-thumbnails.mjs — poster frames for the 9x16 principle shorts.
 *
 * Every `video_short` row shipped without a thumbnail, so the shorts rail
 * showed a black box until play. This grabs one frame per short (1.5 s in,
 * after the title card settles), saves it as a 540px-wide JPEG in the
 * kit-thumbnails bucket at <slug>/shorts/<resource id>.jpg and writes the
 * URL to resources.thumbnail_url. Titles exported with "_t" (Drive's
 * apostrophe) are repaired at the same time ("Don_t" -> "Don't").
 *
 * Run from landing/ (needs ffmpeg + ffprobe on PATH):
 *   node scripts/short-thumbnails.mjs --expert <expert id>   one expert's kits
 *   node scripts/short-thumbnails.mjs --slug <topic slug>     one kit
 *   node scripts/short-thumbnails.mjs --all                   every short
 * Options: --at <seconds> (default 1.5), --force (redo existing), --dry-run
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const EXPERT = opt("--expert");
const SLUG = opt("--slug");
const ALL = args.includes("--all");
const AT = Number(opt("--at") ?? 1.5);
const FORCE = args.includes("--force");
const DRY = args.includes("--dry-run");
if (!EXPERT && !SLUG && !ALL) {
  console.log("Pick a scope: --expert <id>, --slug <topic slug> or --all");
  process.exit(1);
}

let q = sb.from("resources").select("id, topic_slug, title, external_url, thumbnail_url").eq("kind", "video_short").order("topic_slug").order("position");
if (EXPERT) q = q.eq("originating_expert_id", EXPERT);
if (SLUG) q = q.eq("topic_slug", SLUG);
const { data: shorts, error } = await q;
if (error) throw error;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dmn-shorts-"));
let done = 0, skipped = 0, failed = 0;
for (const s of shorts) {
  if (s.thumbnail_url && !FORCE) { skipped++; continue; }
  try {
    if (!s.external_url) throw new Error("no video url");
    const mp4 = path.join(tmp, `${s.id}.mp4`);
    const jpg = path.join(tmp, `${s.id}.jpg`);
    fs.writeFileSync(mp4, Buffer.from(await (await fetch(s.external_url)).arrayBuffer()));
    const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]).toString());
    const at = Math.max(0, Math.min(AT, dur - 0.5));
    execFileSync("ffmpeg", ["-nostdin", "-y", "-loglevel", "error", "-ss", String(at), "-i", mp4, "-frames:v", "1", "-vf", "scale=540:-2", "-q:v", "3", jpg]);
    const fixedTitle = s.title.replace(/_t\b/g, "'t").replace(/_s\b/g, "'s");
    const dest = `${s.topic_slug}/shorts/${s.id}.jpg`;
    if (DRY) { console.log(`[dry] ${s.topic_slug} · ${fixedTitle} -> ${dest} (${(fs.statSync(jpg).size / 1e3).toFixed(0)} KB)`); done++; continue; }
    const up = await sb.storage.from("kit-thumbnails").upload(dest, fs.readFileSync(jpg), { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
    if (up.error) throw new Error(up.error.message);
    const url = sb.storage.from("kit-thumbnails").getPublicUrl(dest).data.publicUrl;
    const patch = { thumbnail_url: url, ...(fixedTitle !== s.title ? { title: fixedTitle } : {}) };
    const upd = await sb.from("resources").update(patch).eq("id", s.id);
    if (upd.error) throw new Error(upd.error.message);
    console.log(`${s.topic_slug} · ${fixedTitle}${fixedTitle !== s.title ? " (title fixed)" : ""}`);
    done++;
  } catch (err) {
    failed++;
    console.log(`FAILED ${s.topic_slug} · ${s.title}: ${err?.message ?? err}`);
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`done=${done} skipped=${skipped} failed=${failed}`);
