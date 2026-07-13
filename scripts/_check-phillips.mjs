/* Read-only: find every remaining "Phillips Group Tax" in the DB. */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local") });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BAD = "%Phillips Group Tax%";
const checks = [
  ["vendors (company_name)", sb.from("vendors").select("id, company_name, display_name").ilike("company_name", BAD)],
  ["vendors (display_name)", sb.from("vendors").select("id, company_name, display_name").ilike("display_name", BAD)],
  ["vendor_applications", sb.from("vendor_applications").select("id, company_name").ilike("company_name", BAD)],
  ["experts (company_name)", sb.from("experts").select("id, full_name, company_name").ilike("company_name", BAD)],
  ["founding_invites (company_name)", sb.from("founding_invites").select("id, company_name").ilike("company_name", BAD)],
  ["expert_applications (company_name)", sb.from("expert_applications").select("id, company_name").ilike("company_name", BAD)],
];

let found = 0;
for (const [label, q] of checks) {
  const { data, error } = await q;
  if (error) { console.log(`${label}: ERROR ${error.message}`); continue; }
  if (data?.length) { found += data.length; console.log(`✗ ${label}: ${data.length} row(s)`, JSON.stringify(data)); }
  else console.log(`✓ ${label}: clean`);
}

// Current canonical rows for confirmation.
const { data: v } = await sb.from("vendors").select("company_name, display_name, stripe_customer_id").eq("contact_email", "andrew@phillipsgrouptax.com").maybeSingle();
const { data: e } = await sb.from("experts").select("display_name, company_name").eq("email", "andrew@phillipsgrouptax.com").maybeSingle();
const { data: fi } = await sb.from("founding_invites").select("company_name, companies").ilike("email", "andrew@phillipsgrouptax.com").maybeSingle();
console.log("\nCanonical vendor row:", JSON.stringify(v));
console.log("Canonical expert row:", JSON.stringify(e));
console.log("Founding invite:", JSON.stringify(fi));
console.log(`\nTotal stale rows: ${found}`);
