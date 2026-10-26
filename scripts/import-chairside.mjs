#!/usr/bin/env node
/**
 * import-chairside.mjs
 *
 * Imports ONE Chairside episode into the member library (migration 0075).
 * The episode becomes a topic in `resources` with kit_type 'chairside':
 *
 *   video_full    "* web version.mp4"            → member-resources/<slug>/
 *   captions      *.vtt (or *.srt, converted)    → member-resources/<slug>/
 *   audio         *.mp3 / *.m4a                  → member-resources/<slug>/
 *   action_guide  the PDF whose name has "Monday"→ member-resources/<slug>/
 *   portal card   "Card - Portal Grid*.png" (3:4) → kit-thumbnails/<slug>/portal-card.png
 *   hero          "Cover - Detail Hero*.png" 16:9 → kit-thumbnails/<slug>/resource-card.png
 *
 * Every row carries episode_payload (episode number, guest, host, minutes,
 * chapters, captions URL) so the portal can draw the chapters card and
 * attach the caption track.
 *
 * Usage (from landing/):
 *   node scripts/import-chairside.mjs \
 *     --folder "D:/.../Chairside Episode 1 - Dr. Michael Sonick/Members portal" \
 *     --slug treating-people-not-patients \
 *     --title "Treating people, not patients" \
 *     --episode 1 \
 *     --expert-email msonick@... \
 *     --category "Patient Experience" \
 *     --minutes 61 \
 *     --host "Don Adeesha" \
 *     --guest-role "Periodontist, Fairfield, Connecticut" \
 *     --summary "The full one-hour episode, plus the Monday page: the first hour on one page." \
 *     --chapters "D:/.../chapters.md" \
 *     [--publish] [--dry-run]
 *
 * --chapters accepts .json ([{time,label}]) or a text/markdown file with one
 * chapter per line: "0:00 Cold open", "1:00:10 Where to go next" (a dash,
 * dot or tab between time and label is fine).
 *
 * Idempotent: if the slug already exists in `resources`, nothing is written.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

try {
  let undici;
  try {
    undici = await import("node:undici");
  } catch {
    undici = await import("undici");
  }
  if (undici?.Agent && undici?.setGlobalDispatcher) {
    undici.setGlobalDispatcher(
      new undici.Agent({ headersTimeout: 0, bodyTimeout: 0, connectTimeout: 60_000, keepAliveTimeout: 60_000, keepAliveMaxTimeout: 600_000 }),
    );
  }
} catch {
  /* fall back to the retry loop */
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landingDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(landingDir, ".env.local") });
dotenv.config({ path: path.join(landingDir, ".env") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE env. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const required = ["folder", "slug", "title", "episode", "expert-email"];
for (const k of required) {
  if (!args[k]) {
    console.error(`Missing --${k}`);
    process.exit(1);
  }
}

const FOLDER = path.resolve(String(args.folder));
const SLUG = slugify(String(args.slug));
const TITLE = String(args.title);
const EPISODE = Number(args.episode);
const EXPERT_EMAIL = String(args["expert-email"]).trim().toLowerCase();
const CATEGORY = args.category ? String(args.category) : "Patient Experience";
const MINUTES = args.minutes ? Number(args.minutes) : null;
const HOST = args.host ? String(args.host) : null;
const GUEST_ROLE = args["guest-role"] ? String(args["guest-role"]) : null;
const SUMMARY = args.summary ? String(args.summary) : null;
const CHAPTERS_FILE = args.chapters ? path.resolve(String(args.chapters)) : null;
const PUBLISH = !!args.publish;
const DRY_RUN = !!args["dry-run"];

if (!existsSync(FOLDER)) {
  console.error(`Folder doesn't exist: ${FOLDER}`);
  process.exit(1);
}
if (!SLUG || !Number.isFinite(EPISODE)) {
  console.error("Bad --slug or --episode");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MIME = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".vtt": "text/vtt",
  ".srt": "application/x-subrip",
};

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
const mimeFor = (f) => MIME[path.extname(f).toLowerCase()] ?? "application/octet-stream";
const safeName = (f) => f.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");

function publicUrl(bucket, storagePath) {
  return supabase.storage.from(bucket).getPublicUrl(storagePath).data?.publicUrl ?? null;
}

async function uploadBuffer(bucket, storagePath, buf, contentType) {
  if (DRY_RUN) {
    console.log(`    [dry] upload -> ${bucket}/${storagePath} (${(buf.length / 1e6).toFixed(1)} MB)`);
    return publicUrl(bucket, storagePath);
  }
  const sizeMb = buf.length / 1024 / 1024;
  const MAX_ATTEMPTS = sizeMb > 200 ? 8 : sizeMb > 100 ? 5 : 3;
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      if (sizeMb > 50 && attempt === 1) console.log(`    uploading ${sizeMb.toFixed(0)} MB → ${bucket}/${storagePath} (may take a while)`);
      else if (attempt > 1) console.log(`    retry ${attempt}/${MAX_ATTEMPTS} for ${bucket}/${storagePath}`);
      const { error } = await supabase.storage.from(bucket).upload(storagePath, buf, { contentType, upsert: true });
      if (error) {
        if (/already exists|Duplicate/i.test(error.message)) return publicUrl(bucket, storagePath);
        throw new Error(error.message);
      }
      return publicUrl(bucket, storagePath);
    } catch (err) {
      lastErr = err;
      console.log(`    attempt ${attempt} failed: ${err?.message ?? err}`);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, Math.min(3000 * 2 ** (attempt - 1) + Math.random() * 2000, 60_000)));
      }
    }
  }
  throw new Error(`Upload failed (${bucket}/${storagePath}): ${lastErr?.message ?? "unknown"}`);
}

/** True when the object is already in storage at exactly this size (a rerun after a dropped connection). */
async function alreadyUploaded(bucket, storagePath, size) {
  try {
    const dir = storagePath.includes("/") ? storagePath.slice(0, storagePath.lastIndexOf("/")) : "";
    const name = storagePath.slice(dir.length + (dir ? 1 : 0));
    const { data } = await supabase.storage.from(bucket).list(dir, { search: name, limit: 50 });
    return (data ?? []).some((f) => f.name === name && Number(f.metadata?.size ?? -1) === size);
  } catch {
    return false;
  }
}

async function uploadFile(bucket, storagePath, absFilePath, contentType) {
  const stat = await fs.stat(absFilePath);
  if (!DRY_RUN && (await alreadyUploaded(bucket, storagePath, stat.size))) {
    console.log(`    already in storage, skipping ${bucket}/${storagePath}`);
    return publicUrl(bucket, storagePath);
  }
  // A one-hour episode is ~1 GB. A single PUT of that size fails ("fetch
  // failed") before Supabase ever answers, so anything over 100 MB goes
  // through Storage's resumable (TUS) endpoint in 6 MB chunks instead.
  if (stat.size > 100 * 1024 * 1024 && !DRY_RUN) {
    return uploadResumable(bucket, storagePath, absFilePath, contentType, stat.size);
  }
  const buf = await fs.readFile(absFilePath);
  return uploadBuffer(bucket, storagePath, buf, contentType);
}

/**
 * Resumable upload (TUS 1.0) to Supabase Storage, no extra dependency.
 * Creates the upload, then PATCHes 6 MB chunks; a failed chunk is retried
 * from the server's reported offset.
 */
process.on("unhandledRejection", (e) => { console.error("unhandled:", e); process.exit(1); });

async function uploadResumable(bucket, storagePath, absFilePath, contentType, size) {
  const CHUNK = 6 * 1024 * 1024; // Supabase requires exactly 6 MB chunks (last one smaller)
  const base = SUPABASE_URL.endsWith("/") ? SUPABASE_URL.slice(0, -1) : SUPABASE_URL;
  const endpoint = `${base}/storage/v1/upload/resumable`;
  const auth = { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, apikey: SUPABASE_SERVICE_ROLE_KEY, "Tus-Resumable": "1.0.0" };
  const meta = Object.entries({ bucketName: bucket, objectName: storagePath, contentType, cacheControl: "3600" })
    .map(([k, v]) => `${k} ${Buffer.from(String(v)).toString("base64")}`)
    .join(",");
  console.log(`    resumable upload ${(size / 1e6).toFixed(0)} MB → ${bucket}/${storagePath}`);

  // The upload URL is remembered next to the file, so a run that dies on a
  // flaky uplink picks up where the server says it got to instead of
  // starting from zero. The sidecar is deleted once the upload completes.
  const sidecar = `${absFilePath}.tus.json`;
  const headOffset = async (u) => {
    try {
      const h = await fetch(u, { method: "HEAD", headers: auth });
      if (h.status !== 200) return null;
      const o = h.headers.get("upload-offset");
      return o == null ? null : Number(o);
    } catch {
      return null;
    }
  };
  let url = null;
  let offset = 0;
  try {
    const saved = JSON.parse(await fs.readFile(sidecar, "utf8"));
    if (saved?.url && saved.size === size) {
      const o = await headOffset(saved.url);
      if (o != null && o <= size) { url = saved.url; offset = o; console.log(`      resuming at ${(offset / 1e6).toFixed(0)} MB`); }
    }
  } catch { /* no sidecar */ }
  if (!url) {
    const create = await fetch(endpoint, { method: "POST", headers: { ...auth, "Upload-Length": String(size), "Upload-Metadata": meta, "x-upsert": "true" } });
    if (create.status !== 201) throw new Error(`TUS create failed: ${create.status} ${await create.text()}`);
    const location = create.headers.get("location");
    if (!location) throw new Error("TUS create returned no Location header");
    url = location.startsWith("http") ? location : `${base}${location}`;
    await fs.writeFile(sidecar, JSON.stringify({ url, size, storagePath }));
  }

  const fh = await fs.open(absFilePath, "r");
  try {
    let failures = 0;
    let lastPct = -1;
    while (offset < size) {
      const len = Math.min(CHUNK, size - offset);
      const chunk = Buffer.alloc(len);
      await fh.read(chunk, 0, len, offset);
      try {
        const res = await fetch(url, {
          method: "PATCH",
          headers: { ...auth, "Upload-Offset": String(offset), "Content-Type": "application/offset+octet-stream" },
          body: chunk,
          signal: AbortSignal.timeout(120_000),
        });
        if (res.status !== 204) throw new Error(`TUS patch ${res.status} ${await res.text()}`);
        offset = Number(res.headers.get("upload-offset") ?? offset + len);
        failures = 0;
        const pct = Math.floor((offset / size) * 10) * 10;
        if (pct !== lastPct) { console.log(`      ${pct}%`); lastPct = pct; }
      } catch (err) {
        failures += 1;
        console.log(`      chunk at ${(offset / 1e6).toFixed(0)} MB failed (${err?.cause?.message ?? err?.message ?? err}), retry ${failures}/30`);
        if (failures > 30) throw err;
        await new Promise((r) => setTimeout(r, Math.min(1500 * failures, 20_000)));
        const o = await headOffset(url);
        if (o != null) offset = o;
      }
    }
  } finally {
    await fh.close();
  }
  await fs.rm(sidecar, { force: true });
  return publicUrl(bucket, storagePath);
}

/** SRT → WebVTT (browsers only play .vtt tracks). */
function srtToVtt(srt) {
  const body = srt
    .replace(/\r/g, "")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2")
    .trim();
  return `WEBVTT\n\n${body}\n`;
}

async function parseChapters(file) {
  if (!file) return [];
  const raw = await fs.readFile(file, "utf8");
  if (file.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(raw);
    return parsed.map((c) => ({ time: String(c.time), label: String(c.label) }));
  }
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    const m = line.trim().replace(/^[-*|]\s*/, "").match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—·.\t|]*\s*(.+?)\s*\|?$/);
    if (m) out.push({ time: m[1], label: m[2].replace(/\*\*/g, "").trim() });
  }
  return out;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

// ─── Main ────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Chairside episode ${EPISODE}: ${TITLE}`);
  console.log(`  folder: ${FOLDER}`);
  console.log(`  slug:   ${SLUG}`);
  console.log(`  publish: ${PUBLISH ? "yes (live)" : "no (pending_review, hidden)"}`);
  if (DRY_RUN) console.log("DRY RUN — nothing will be uploaded or inserted.\n");

  // Expert attribution (required: the inquiry box and "Go deeper" use it).
  const { data: expert, error: expertErr } = await supabase
    .from("experts")
    .select("id, display_name, specialty, company_name")
    .eq("email", EXPERT_EMAIL)
    .maybeSingle();
  if (expertErr) throw new Error(expertErr.message);
  if (!expert) {
    console.error(`No expert with email ${EXPERT_EMAIL}`);
    process.exit(1);
  }
  console.log(`  guest:  ${expert.display_name} (${expert.id})`);

  const { count } = await supabase.from("resources").select("*", { count: "exact", head: true }).eq("topic_slug", SLUG);
  if ((count ?? 0) > 0) {
    console.log(`  ✓ ${SLUG} already in DB — nothing to do (idempotent)`);
    return;
  }

  const entries = await fs.readdir(FOLDER, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);

  const videoName = files.find((n) => /web version\.mp4$/i.test(n)) ?? files.find((n) => /\.mp4$/i.test(n) && !/short|9x16/i.test(n));
  const vttName = files.find((n) => /\.vtt$/i.test(n));
  const srtName = files.find((n) => /\.srt$/i.test(n));
  const audioName = files.find((n) => /\.(mp3|m4a)$/i.test(n));
  const mondayName = files.find((n) => /monday/i.test(n) && /\.pdf$/i.test(n));
  const portalCardName = files.find((n) => /^Card - Portal Grid.*\.png$/i.test(n)) ?? files.find((n) => /portal.*card.*\.(png|jpg)$/i.test(n));
  const heroName = files.find((n) => /^Cover - Detail Hero.*\.png$/i.test(n)) ?? files.find((n) => /cover.*(wide|16x9).*\.(png|jpg)$/i.test(n));

  if (!videoName) {
    console.error("  ! no episode video found (expected '* web version.mp4')");
    process.exit(1);
  }
  console.log(`  video:    ${videoName}`);
  console.log(`  captions: ${vttName ?? srtName ?? "(none)"}`);
  console.log(`  audio:    ${audioName ?? "(none)"}`);
  console.log(`  Monday:   ${mondayName ?? "(none)"}`);
  console.log(`  card:     ${portalCardName ?? "(none — the card will not show in the grid or Just dropped)"}`);
  console.log(`  hero:     ${heroName ?? "(none)"}`);

  const chapters = await parseChapters(CHAPTERS_FILE);
  console.log(`  chapters: ${chapters.length}`);
  for (const c of chapters) console.log(`     ${c.time.padStart(7)}  ${c.label}`);

  // Covers
  let portalCardUrl = null;
  let resourceCardUrl = null;
  if (portalCardName) portalCardUrl = await uploadFile("kit-thumbnails", `${SLUG}/portal-card${path.extname(portalCardName).toLowerCase()}`, path.join(FOLDER, portalCardName), mimeFor(portalCardName));
  if (heroName) resourceCardUrl = await uploadFile("kit-thumbnails", `${SLUG}/resource-card${path.extname(heroName).toLowerCase()}`, path.join(FOLDER, heroName), mimeFor(heroName));

  // Captions first, so their URL can ride in episode_payload on every row.
  let captionsUrl = null;
  let captionsRow = null;
  if (vttName || srtName) {
    const src = vttName ?? srtName;
    const buf = vttName ? await fs.readFile(path.join(FOLDER, src)) : Buffer.from(srtToVtt(await fs.readFile(path.join(FOLDER, src), "utf8")), "utf8");
    const storagePath = `${SLUG}/${safeName(src).replace(/\.srt$/i, ".vtt")}`;
    captionsUrl = await uploadBuffer("member-resources", storagePath, buf, "text/vtt");
    captionsRow = { title: "Captions", kind: "captions", storage_path: storagePath, external_url: captionsUrl, mime_type: "text/vtt", file_size_bytes: buf.length, position: 15, description: null };
  }

  const rows = [];
  const pushFile = async (name, kind, title, position, description = null) => {
    const storagePath = `${SLUG}/${safeName(name)}`;
    const stats = await fs.stat(path.join(FOLDER, name));
    const url = await uploadFile("member-resources", storagePath, path.join(FOLDER, name), mimeFor(name));
    rows.push({ title, kind, storage_path: storagePath, external_url: url, mime_type: mimeFor(name), file_size_bytes: stats.size, position, description });
  };

  const guestLine = `${expert.display_name}${HOST ? `, with host ${HOST}` : ""}.${captionsUrl ? " Captions on." : ""}`;
  await pushFile(videoName, "video_full", "The full episode", 10, guestLine);
  if (captionsRow) rows.push(captionsRow);
  if (audioName) await pushFile(audioName, "audio", "The full episode, audio only", 20, `${expert.display_name}${HOST ? `, with host ${HOST}` : ""}. Listen anywhere.`);
  if (mondayName) await pushFile(mondayName, "action_guide", "The Monday page: the first hour", 30, "All the steps from this episode on one page, with a team huddle checklist.");

  const episodePayload = {
    episode: EPISODE,
    guest: { name: expert.display_name, role: GUEST_ROLE ?? ([expert.specialty, expert.company_name].filter(Boolean).join(", ") || null) },
    host: HOST,
    minutes: MINUTES,
    chapters,
    captions_url: captionsUrl,
  };

  const now = new Date().toISOString();
  const inserts = rows.map((r) => ({
    topic_slug: SLUG,
    topic_title: TITLE,
    topic_summary: SUMMARY,
    category: CATEGORY,
    portal_card_url: portalCardUrl,
    resource_card_url: resourceCardUrl,
    title: r.title,
    description: r.description,
    kind: r.kind,
    storage_path: r.storage_path,
    external_url: r.external_url,
    mime_type: r.mime_type,
    file_size_bytes: r.file_size_bytes,
    duration_label: r.kind === "video_full" || r.kind === "audio" ? (MINUTES ? `${MINUTES} min` : null) : null,
    position: r.position,
    is_free: false,
    is_published: PUBLISH,
    submission_status: PUBLISH ? "approved" : "pending_review",
    submitted_at: now,
    approved_at: PUBLISH ? now : null,
    kit_type: "chairside",
    book_club_payload: null,
    episode_payload: episodePayload,
    originating_expert_id: expert.id,
    originating_vendor_id: null,
  }));

  if (DRY_RUN) {
    console.log(`\n[dry] would insert ${inserts.length} rows:`);
    for (const r of inserts) console.log(`   ${r.kind.padEnd(12)} ${r.title}`);
    return;
  }
  const { error } = await supabase.from("resources").insert(inserts);
  if (error) throw new Error(`insert failed: ${error.message}`);
  console.log(`\n✓ inserted ${inserts.length} resources for ${SLUG}`);
  console.log(`  member page: https://www.dentalmembernetwork.com/dashboard/resources/${SLUG}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
