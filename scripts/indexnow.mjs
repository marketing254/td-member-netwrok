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
 *   # All sitemap URLs:
 *   node scripts/indexnow.mjs
 *
 *   # Specific URLs (override sitemap):
 *   node scripts/indexnow.mjs https://dentalmembernetwork.com/pricing https://dentalmembernetwork.com/experts
 *
 *   # Dry run (print what would be submitted):
 *   node scripts/indexnow.mjs --dry-run
 *
 * Set the API_KEY constant below to match the file you place in /public.
 */

const HOST = "dentalmembernetwork.com";
const API_KEY = "20a869c927f1d8a7a854d6ca37917378";
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

const SITEMAP_URLS = [
  "https://dentalmembernetwork.com/",
  "https://dentalmembernetwork.com/pricing",
  "https://dentalmembernetwork.com/join",
  "https://dentalmembernetwork.com/experts",
  "https://dentalmembernetwork.com/partners",
  "https://dentalmembernetwork.com/partners/pricing",
  "https://dentalmembernetwork.com/resources",
  "https://dentalmembernetwork.com/reviews",
];

const dryRun = process.argv.includes("--dry-run");
const overrideUrls = process.argv
  .slice(2)
  .filter((a) => !a.startsWith("--"));
const urls = overrideUrls.length ? overrideUrls : SITEMAP_URLS;

const payload = {
  host: HOST,
  key: API_KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
};

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
