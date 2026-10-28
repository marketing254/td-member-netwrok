#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * sonick-oct28-updates.mjs — Lester's two file updates for Dr. Sonick (28 Oct 2026).
 *
 *  1. Chairside Episode 1: adds the full members' transcript PDF as a download
 *     (a new row on the episode, position 35, right after the Monday page).
 *  2. "Take Care Of The Basics" playbook: swaps the Key Takeaways PDF for the new
 *     one in his Kit folder (new storage path so nobody gets a cached old copy;
 *     the old object is removed afterwards).
 *
 * Safe to run twice: the transcript row is updated if it already exists.
 * Run from landing/:  node scripts/sonick-oct28-updates.mjs
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const BUCKET = "member-resources";

const TRANSCRIPT_SRC =
  "D:/TD - Member Network/Chairside/Chairside Episode 1 - Dr. Michael Sonick/Members portal/Chairside Ep1 - Treating people, not patients - Full transcript (members).pdf";
const TRANSCRIPT_PATH = "treating-people-not-patients/Chairside_Ep1_-_Treating_people_not_patients_-_FULL_TRANSCRIPT_members.pdf";
const MONDAY_PAGE_ROW_ID = "83217e03-eb09-49ab-9d5f-5663da13165b"; // cloned for topic/kit fields

const TAKEAWAYS_SRC = "D:/TD - Member Network/Resources/Dr. Michael Sonick/Kit - Take Care Of The Basics/Key Takeaways.pdf";
const TAKEAWAYS_PATH = "take-care-of-the-basics/Key_Takeaways_2026-10.pdf";
const TAKEAWAYS_OLD_PATH = "take-care-of-the-basics/Key_Takeaways.pdf";
const TAKEAWAYS_ROW_ID = "808bdc92-5708-465d-a619-74460b0eeb14";

async function upload(dest, file) {
  const buf = fs.readFileSync(file);
  const up = await sb.storage.from(BUCKET).upload(dest, buf, { contentType: "application/pdf", upsert: true, cacheControl: "3600" });
  if (up.error) throw new Error(`upload ${dest}: ${up.error.message}`);
  return { url: sb.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl, size: buf.length };
}

// 1. Transcript
{
  const { url, size } = await upload(TRANSCRIPT_PATH, TRANSCRIPT_SRC);
  const { data: monday, error } = await sb.from("resources").select("*").eq("id", MONDAY_PAGE_ROW_ID).single();
  if (error) throw error;
  const row = { ...monday };
  for (const k of ["id", "created_at", "updated_at"]) delete row[k];
  Object.assign(row, {
    title: "Full transcript",
    description: "Every word of the hour, with the times that match the player. Read along, or search it later.",
    kind: "other",
    storage_path: TRANSCRIPT_PATH,
    external_url: url,
    mime_type: "application/pdf",
    file_size_bytes: size,
    position: 35,
    duration_label: null,
    thumbnail_url: null,
  });
  const { data: existing } = await sb.from("resources").select("id").eq("storage_path", TRANSCRIPT_PATH).maybeSingle();
  if (existing) {
    const r = await sb.from("resources").update(row).eq("id", existing.id);
    if (r.error) throw r.error;
    console.log(`transcript: row updated (${existing.id})`);
  } else {
    const r = await sb.from("resources").insert(row).select("id").single();
    if (r.error) throw r.error;
    console.log(`transcript: row added (${r.data.id})`);
  }
  console.log(`transcript: ${(size / 1e3).toFixed(0)} KB at ${url}`);
}

// 2. Key Takeaways swap
{
  const { url, size } = await upload(TAKEAWAYS_PATH, TAKEAWAYS_SRC);
  const r = await sb
    .from("resources")
    .update({ storage_path: TAKEAWAYS_PATH, external_url: url, file_size_bytes: size })
    .eq("id", TAKEAWAYS_ROW_ID)
    .select("id, title")
    .single();
  if (r.error) throw r.error;
  const rm = await sb.storage.from(BUCKET).remove([TAKEAWAYS_OLD_PATH]);
  console.log(`key takeaways: "${r.data.title}" now ${(size / 1e3).toFixed(0)} KB at ${url}`);
  console.log(`key takeaways: old file ${rm.error ? "NOT removed: " + rm.error.message : "removed"}`);
}

console.log("done");
