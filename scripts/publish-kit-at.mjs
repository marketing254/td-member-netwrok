#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * publish-kit-at.mjs — flip a library kit / Chairside episode to published
 * at a given moment (or now). Used for timed go-lives such as Chairside
 * Episode 2 at 6:00 am New York on 3 Nov 2026.
 *
 *   node scripts/publish-kit-at.mjs --slug nice-or-kind --at 2026-11-03T11:00:00Z
 *   node scripts/publish-kit-at.mjs --slug nice-or-kind            (publish now)
 *
 * Waits (sleeping) until --at, then sets is_published=true,
 * submission_status=approved, approved_at=now on every row of the slug.
 * Safe to run twice.
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const SLUG = opt("--slug");
const AT = opt("--at") ? new Date(opt("--at")) : new Date();
if (!SLUG || Number.isNaN(AT.getTime())) { console.error("need --slug and a valid --at"); process.exit(1); }

const wait = AT.getTime() - Date.now();
if (wait > 0) {
  console.log(`${new Date().toISOString()} waiting ${Math.round(wait / 60000)} min, publishing ${SLUG} at ${AT.toISOString()}`);
  await new Promise((r) => setTimeout(r, wait));
}
for (let attempt = 1; attempt <= 5; attempt++) {
  const { data, error } = await sb
    .from("resources")
    .update({ is_published: true, submission_status: "approved", approved_at: new Date().toISOString() })
    .eq("topic_slug", SLUG)
    .select("id");
  if (!error) { console.log(`${new Date().toISOString()} published ${SLUG}: ${data.length} rows`); process.exit(0); }
  console.log(`attempt ${attempt} failed: ${error.message}`);
  await new Promise((r) => setTimeout(r, 30000));
}
process.exit(1);
