/* Check + fix the Stripe customer name and the auth user's company metadata
   for The Phillips Group. Pass --apply to write; default is read-only. */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local") });

const APPLY = process.argv.includes("--apply");
const GOOD = "The Phillips Group";
const CUSTOMER_ID = "cus_Ur6yrdNoIicViw";
const EMAIL = "andrew@phillipsgrouptax.com";

// --- Stripe customer name ---
// Live customer: pass STRIPE_LIVE_KEY for this run (falls back to the
// test key in .env.local, where the customer won't exist).
const stripeKey = process.env.STRIPE_LIVE_KEY || process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.log("No Stripe key set — skipping Stripe check.");
} else {
  console.log(`Stripe mode: ${stripeKey.startsWith("sk_live") ? "LIVE" : "TEST"}`);
  try {
    const stripe = new Stripe(stripeKey);
    const c = await stripe.customers.retrieve(CUSTOMER_ID);
    console.log(`Stripe customer name: "${c.name}"  (email: ${c.email})`);
    if (c.name !== GOOD) {
      if (APPLY) {
        await stripe.customers.update(CUSTOMER_ID, { name: GOOD });
        console.log(`✓ Stripe customer renamed to "${GOOD}"`);
      } else {
        console.log(`→ would rename to "${GOOD}" (run with --apply)`);
      }
    } else {
      console.log("✓ Stripe name already correct");
    }
  } catch (err) {
    console.log(`Stripe: ${err?.message ?? err}`);
    console.log("→ customer likely lives in LIVE mode; this env has a TEST key. Fix in the Stripe live dashboard, or re-run with the live key.");
  }
}

// --- Supabase auth user metadata (user_metadata.company) ---
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
const user = list.users.find((u) => u.email?.toLowerCase() === EMAIL);
if (!user) {
  console.log("Auth user not found — skipping metadata check.");
} else {
  const company = user.user_metadata?.company;
  console.log(`Auth user metadata company: "${company ?? "(unset)"}"`);
  if (company && company !== GOOD) {
    if (APPLY) {
      await sb.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, company: GOOD } });
      console.log(`✓ auth metadata company set to "${GOOD}"`);
    } else {
      console.log(`→ would set to "${GOOD}" (run with --apply)`);
    }
  } else {
    console.log("✓ auth metadata fine");
  }
}
