#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * chairside-ep2-extras.mjs — after scripts/import-chairside.mjs has created
 * the "nice-or-kind" episode: add the full transcript PDF as a download
 * (position 35, after the Monday page), keep the .txt copy in storage next
 * to it for Beacon, and set the item descriptions to match Episode 1.
 * Idempotent. Run from landing/:  node scripts/chairside-ep2-extras.mjs
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SLUG = "nice-or-kind";
const DIR = "D:/TD - Member Network/Chairside/Chairside Episode 2 - Julie Parker-20261103T041617Z-1-001/Chairside Episode 2 - Julie Parker/Members portal";
const PDF = `${DIR}/Chairside Ep2 - Nice or kind - the conversation you keep putting off - FULL TRANSCRIPT (members).pdf`;
const TXT = `${DIR}/Chairside Ep2 - Nice or kind - the conversation you keep putting off - FULL TRANSCRIPT (members).txt`;

async function put(dest, file, contentType) {
  const buf = fs.readFileSync(file);
  const up = await sb.storage.from("member-resources").upload(dest, buf, { contentType, upsert: true, cacheControl: "3600" });
  if (up.error) throw new Error(`${dest}: ${up.error.message}`);
  return { url: sb.storage.from("member-resources").getPublicUrl(dest).data.publicUrl, size: buf.length };
}

const { data: rows, error } = await sb.from("resources").select("*").eq("topic_slug", SLUG).order("position");
if (error) throw error;
if (!rows.length) { console.error("import the episode first (scripts/import-chairside.mjs)"); process.exit(1); }

// Descriptions, same pattern as Episode 1.
const desc = {
  video_full: "Julie Parker, with host Don Adeesha. Captions on.",
  audio: "Julie Parker, with host Don Adeesha. Listen anywhere.",
  action_guide: "Julie's five steps for the conversation you've been putting off, on one page, with a team huddle checklist.",
};
for (const r of rows) {
  if (desc[r.kind] && r.description !== desc[r.kind]) {
    const u = await sb.from("resources").update({ description: desc[r.kind] }).eq("id", r.id);
    if (u.error) throw u.error;
    console.log(`description set: ${r.title}`);
  }
}
// Label the Monday page as Lester wrote it.
const monday = rows.find((r) => r.kind === "action_guide");
if (monday && monday.title !== "The Monday page: the conversation you've been putting off") {
  await sb.from("resources").update({ title: "The Monday page: the conversation you've been putting off" }).eq("id", monday.id);
  console.log("Monday page title set");
}

// Transcript PDF row + txt copy.
const pdfPath = `${SLUG}/Chairside_Ep2_-_FULL_TRANSCRIPT_members.pdf`;
const txtPath = `${SLUG}/Chairside_Ep2_-_FULL_TRANSCRIPT_members.txt`;
const pdf = await put(pdfPath, PDF, "application/pdf");
await put(txtPath, TXT, "text/plain; charset=utf-8");
const base = rows.find((r) => r.kind === "action_guide") ?? rows[0];
const row = { ...base };
for (const k of ["id", "created_at", "updated_at"]) delete row[k];
Object.assign(row, {
  title: "Read the full transcript",
  description: "Every word of the episode, with the times that match the player. Read along, or search it later.",
  kind: "other",
  storage_path: pdfPath,
  external_url: pdf.url,
  mime_type: "application/pdf",
  file_size_bytes: pdf.size,
  position: 35,
  duration_label: null,
  thumbnail_url: null,
});
const existing = rows.find((r) => r.storage_path === pdfPath);
if (existing) {
  const u = await sb.from("resources").update(row).eq("id", existing.id); if (u.error) throw u.error;
  console.log("transcript row updated");
} else {
  const i = await sb.from("resources").insert(row).select("id").single(); if (i.error) throw i.error;
  console.log("transcript row added", i.data.id);
}
console.log("done");
