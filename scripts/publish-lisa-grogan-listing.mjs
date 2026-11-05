#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * publish-lisa-grogan-listing.mjs — switch on the Lisa Grogan Dental
 * Coaching company listing (Lester, 5 Nov 2026: "keep the company listing
 * hidden until her member offer arrives").
 *
 * The logo is already in the vendor-logos bucket; the listing stays hidden
 * because the directory needs logo_url + description + approved + verified.
 * This sets logo_url, which is the last missing piece. Nothing else changes.
 *
 * From landing/:   node scripts/publish-lisa-grogan-listing.mjs            (publish)
 *                  node scripts/publish-lisa-grogan-listing.mjs --dry-run  (show only)
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const VENDOR_ID = "f00800fa-f7f3-4bfa-90cb-94f15a6bcee7"; // Lisa Grogan Dental Coaching
const LOGO_PATH = "f00800fa-f7f3-4bfa-90cb-94f15a6bcee7-lisa-grogan-coaching.png"; // uploaded 5 Nov 2026
const DRY = process.argv.includes("--dry-run");

const { data: v, error } = await sb.from("vendors").select("id, company_name, status, verified, logo_url, description").eq("id", VENDOR_ID).maybeSingle();
if (error || !v) { console.error("vendor not found", error?.message); process.exit(1); }
console.log(`before: ${v.company_name} status=${v.status} verified=${v.verified} logo=${v.logo_url ? "set" : "none"} description=${v.description ? "set" : "none"}`);

const url = sb.storage.from("vendor-logos").getPublicUrl(LOGO_PATH).data.publicUrl;
const head = await fetch(url, { method: "HEAD" });
if (!head.ok) { console.error(`logo missing in storage (${head.status}): ${url}`); process.exit(1); }

if (DRY) { console.log("dry run: would set logo_url =", url); process.exit(0); }
const { error: uErr } = await sb.from("vendors").update({ logo_url: url }).eq("id", VENDOR_ID);
if (uErr) { console.error(uErr.message); process.exit(1); }
console.log("published: listing is now visible at /partners/" + VENDOR_ID + " and in the member directory");
