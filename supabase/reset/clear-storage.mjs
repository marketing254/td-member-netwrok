#!/usr/bin/env node
/**
 * Wipes every object from the vendor-logos and catalog-media buckets via
 * the Supabase Storage API (raw DELETE on storage.objects is blocked by
 * the protect_delete() trigger).
 *
 * Pairs with _reset_data.sql — run this BEFORE or AFTER the SQL wipe.
 * Order doesn't matter because the buckets are independent of the
 * relational data.
 *
 * USAGE
 *   1. Ensure landing/.env.local has NEXT_PUBLIC_SUPABASE_URL and
 *      SUPABASE_SERVICE_ROLE_KEY set.
 *   2. From the landing/ folder:
 *
 *        node supabase/reset/clear-storage.mjs
 *
 * The script:
 *   - Walks every folder in each bucket recursively
 *   - Collects all file paths
 *   - Calls .remove() in batches of 100
 *   - Prints a summary line per bucket
 *
 * The bucket definitions themselves are NOT deleted, only their contents.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Walk up two folders to reach landing/, where .env.local lives.
config({ path: resolve(__dirname, "..", "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in landing/.env.local.",
  );
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKETS = ["vendor-logos", "catalog-media"];

/**
 * Recursively collect every file path under `prefix` in `bucket`.
 * Storage uses a flat object store but lets you list with a "folder"
 * prefix; we walk the tree depth-first.
 */
async function collectPaths(bucket, prefix = "") {
  const paths = [];
  let offset = 0;
  const PAGE = 100;
  while (true) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, {
      limit: PAGE,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const item of data) {
      const full = prefix ? `${prefix}/${item.name}` : item.name;
      // Folders have id === null in the Supabase Storage list response.
      if (item.id === null) {
        const child = await collectPaths(bucket, full);
        paths.push(...child);
      } else {
        paths.push(full);
      }
    }

    if (data.length < PAGE) break;
    offset += PAGE;
  }
  return paths;
}

async function wipeBucket(bucket) {
  const paths = await collectPaths(bucket);
  if (paths.length === 0) {
    console.log(`  ${bucket.padEnd(16)} already empty`);
    return;
  }
  // Storage API caps .remove() at ~1000 keys per call; we use 100 to stay
  // well under PostgREST URL length limits.
  let removed = 0;
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    const { error } = await sb.storage.from(bucket).remove(batch);
    if (error) {
      console.log(`  ${bucket.padEnd(16)} batch starting at ${i} failed: ${error.message}`);
      continue;
    }
    removed += batch.length;
  }
  console.log(`  ${bucket.padEnd(16)} removed ${removed} / ${paths.length} object(s)`);
}

console.log("Clearing Supabase storage buckets…");
for (const bucket of BUCKETS) {
  try {
    await wipeBucket(bucket);
  } catch (err) {
    console.log(`  ${bucket.padEnd(16)} FAILED: ${err.message ?? err}`);
  }
}
console.log("Done.");
