#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * indexnow.mjs — submit URLs to Bing + Yandex via the IndexNow protocol
 * for instant indexing. (Google does NOT honour IndexNow; for Google we
 * rely on the sitemap + Search Console.)
 *
 * Why it matters: Bing, Yandex, DuckDuckGo (Bing-powered), and Brave
 * (also Bing-derived) re-crawl submitted URLs within minutes instead of
 * days. ChatGPT search and Copilot pull from the Bing index, so faster
 * Bing re-crawling also speeds up AI citation refresh.
 *
 * Usage:
 *   # Every URL in the live sitemap (blog articles included):
 *   node scripts/indexnow.mjs
 *
 *   # Specific URLs (override sitemap):
 *   node scripts/indexnow.mjs https://www.dentalmembernetwork.com/blog/some-slug
 *
 *   # Dry run (print what would be submitted):
 *   node scripts/indexnow.mjs --dry-run
 *
 * The host is www because Vercel serves production on www and 308s the
 * bare domain there; IndexNow rejects URLs whose host doesn't match the
 * key file's host. The key file lives at /public/<API_KEY>.txt.
 */

const HOST = "www.dentalmembernetwork.com";
const API_KEY = "20a869c927f1d8a7a854d6ca37917378";
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const SITEMAP = `https://${HOST}/sitemap.xml`;

const dryRun = process.argv.includes("--dry-run");
const overrideUrls = process.argv.slice(2).filter((a) => !a.startsWith("--"));

/** Read the live sitemap and normalise every URL onto the www host. */
async function sitemapUrls() {
  const res = await fetch(SITEMAP, { redirect: "follow" });
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  const normalised = urls.map((u) => u.replace(/^https?:\/\/(www\.)?dentalmembernetwork\.com/i, `https://${HOST}`));
  return [...new Set(normalised)];
}

const urls = overrideUrls.length
  ? overrideUrls.map((u) => u.replace(/^https?:\/\/(www\.)?dentalmembernetwork\.com/i, `https://${HOST}`))
  : await sitemapUrls();

const payload = { host: HOST, key: API_KEY, keyLocation: KEY_LOCATION, urlList: urls };

console.log(`IndexNow → ${ENDPOINT}`);
console.log(`Submitting ${urls.length} URL${urls.length === 1 ? "" : "s"}:`);
for (const u of urls) console.log("  •", u);

if (dryRun) {
  console.log("[dry-run] payload:");
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

const body = await res.text().catch(() => "");
console.log(`Status: ${res.status} ${res.statusText}`);
if (body) console.log(`Body  : ${body}`);

if (res.status === 200 || res.status === 202) {
  console.log("✓ Submitted. Bing/Yandex will recrawl within minutes.");
  process.exit(0);
}
console.error("✗ Submission failed. Check the host + keyLocation match.");
process.exit(1);
