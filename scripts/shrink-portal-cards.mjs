#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * shrink-portal-cards.mjs
 *
 * The portal cards Lester ships are 2400x3200 PNGs of 2 to 3 MB each. The
 * library grid, the homepage "Just dropped" shelf and the join page show
 * them at 150 to 320 px wide, and Next's image optimiser times out pulling
 * a 2.5 MB source per card (7 s limit). This makes a 720 px wide WebP of
 * every kit's card (about 40 to 80 KB), uploads it next to the original as
 * <slug>/portal-card-720.webp and points `resources.portal_card_url` at it.
 * The original PNG stays in storage untouched.
 *
 * Idempotent: kits already on a .webp card are skipped. Run from landing/:
 *   node scripts/shrink-portal-cards.mjs [--dry-run] [--only <slug>]
 */
import { createClient } from "@supabase/supabase-js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local") });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const WIDTH = 720;
const BUCKET = "kit-thumbnails";

const { data: rows, error } = await sb.from("resources").select("topic_slug, portal_card_url").not("portal_card_url", "is", null);
if (error) throw error;
const bySlug = new Map();
for (const r of rows) if (!bySlug.has(r.topic_slug)) bySlug.set(r.topic_slug, r.portal_card_url);

let done = 0, skipped = 0, failed = 0;
for (const [slug, url] of bySlug) {
  if (ONLY && slug !== ONLY) continue;
  if (/\.webp(\?|$)/i.test(url)) { skipped++; continue; }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const img = await loadImage(buf);
    const w = Math.min(WIDTH, img.width);
    const h = Math.round(img.height * (w / img.width));
    const c = createCanvas(w, h);
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    const webp = c.toBuffer("image/webp", 82);
    const dest = `${slug}/portal-card-${WIDTH}.webp`;
    if (DRY) { console.log(`[dry] ${slug}: ${(buf.length / 1e6).toFixed(2)} MB -> ${(webp.length / 1e3).toFixed(0)} KB (${w}x${h})`); done++; continue; }
    const up = await sb.storage.from(BUCKET).upload(dest, webp, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
    if (up.error) throw new Error(up.error.message);
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
    const upd = await sb.from("resources").update({ portal_card_url: publicUrl }).eq("topic_slug", slug);
    if (upd.error) throw new Error(upd.error.message);
    console.log(`${slug}: ${(buf.length / 1e6).toFixed(2)} MB -> ${(webp.length / 1e3).toFixed(0)} KB`);
    done++;
  } catch (err) {
    failed++;
    console.log(`FAILED ${slug}: ${err?.message ?? err}`);
  }
}
console.log(`done=${done} skipped=${skipped} failed=${failed}`);
