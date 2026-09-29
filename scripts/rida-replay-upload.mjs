#!/usr/bin/env node
/**
 * Uploads the RIDA replay clips to Supabase Storage (public bucket
 * `member-resources`, folder rida-replay/clips/), where the replay page
 * and the portal's Event Replays section play them from. The files are
 * too big for the repo (10 to 20 MB each), so they stream straight to the
 * Storage REST API.
 *
 *   node scripts/rida-replay-upload.mjs "D:\TD - Member Network\RIDA Emails\RIDA Summit Replay\Clips"
 *
 * Storage only: no database rows, no emails. Re-running overwrites.
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
}

const clipsDir = process.argv[2];
if (!clipsDir || !fs.existsSync(clipsDir)) {
  console.error("usage: node scripts/rida-replay-upload.mjs <Clips folder>");
  process.exit(1);
}
const base = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WANTED = ["01", "03", "04", "05", "06"]; // the five on the page, per Lester's email 3

function put(dest, file) {
  return new Promise((resolve, reject) => {
    const size = fs.statSync(file).size;
    const req = https.request(
      `${base}/storage/v1/object/member-resources/${dest}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          apikey: key,
          "Content-Type": "video/mp4",
          "Content-Length": size,
          "x-upsert": "true",
          "cache-control": "max-age=31536000",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => (res.statusCode === 200 ? resolve(size) : reject(new Error(`HTTP ${res.statusCode} ${body.slice(0, 120)}`))));
      },
    );
    req.on("error", reject);
    fs.createReadStream(file).pipe(req);
  });
}

for (const n of WANTED) {
  const file = fs.readdirSync(clipsDir).find((f) => f.startsWith(`Clip ${n} (16x9)`) && f.endsWith(".mp4"));
  if (!file) {
    console.error(`missing clip ${n}`);
    continue;
  }
  const dest = `rida-replay/clips/clip-${n}.mp4`;
  try {
    const size = await put(dest, path.join(clipsDir, file));
    console.log(`✓ ${dest} (${(size / 1024 / 1024).toFixed(1)} MB)`);
  } catch (err) {
    console.error(`✗ ${dest}: ${err.message}`);
  }
}
console.log("Done. Public URL base:", `${base}/storage/v1/object/public/member-resources/rida-replay/clips/`);
