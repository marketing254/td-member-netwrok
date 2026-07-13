/* Read-only: migration 0040/0041 state + kit attribution state. */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local") });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Migration 0040: vendors.billing_parent_id — selecting it fails if missing.
const m40 = await sb.from("vendors").select("billing_parent_id").limit(1);
console.log(`0040 (vendors.billing_parent_id): ${m40.error ? "✗ NOT RUN — " + m40.error.message : "✓ applied"}`);

// Migration 0041: founding_invites.companies
const m41 = await sb.from("founding_invites").select("companies").limit(1);
console.log(`0041 (founding_invites.companies): ${m41.error ? "✗ NOT RUN — " + m41.error.message : "✓ applied"}`);

// Kits: did they land, and are they attributed to the right experts?
const { data: kits } = await sb
  .from("resources")
  .select("topic_slug, kind, is_published, submission_status, originating_expert_id, portal_card_url")
  .in("topic_slug", ["transition-without-turbulence", "know-your-real-numbers"]);

const { data: experts } = await sb
  .from("experts")
  .select("id, display_name, email")
  .in("email", ["ashley@mintconceptions.com", "andrew@phillipsgrouptax.com"]);
const byId = new Map((experts ?? []).map((e) => [e.id, `${e.display_name} <${e.email}>`]));

console.log(`\nKit rows found: ${kits?.length ?? 0}`);
const grouped = {};
for (const k of kits ?? []) {
  const g = (grouped[k.topic_slug] ||= { files: 0, kinds: new Set(), expert: null, published: true, square: false });
  g.files++;
  g.kinds.add(k.kind);
  g.expert = k.originating_expert_id ? (byId.get(k.originating_expert_id) ?? k.originating_expert_id) : "(NOT attributed!)";
  g.published = g.published && k.is_published && k.submission_status === "approved";
  if (k.portal_card_url?.includes("portal-card")) g.square = true;
}
for (const [slug, g] of Object.entries(grouped)) {
  console.log(`\n→ ${slug}`);
  console.log(`   files: ${g.files} | published: ${g.published} | thumbnail set: ${g.square}`);
  console.log(`   under expert: ${g.expert}`);
  console.log(`   kinds: ${[...g.kinds].join(", ")}`);
}
if (!kits?.length) console.log("→ kits NOT imported yet — run: node scripts/upload-all.mjs --publish");
