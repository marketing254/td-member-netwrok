#!/usr/bin/env node
/**
 * fix-founding-expert-billing.mjs
 *
 * One-off repair for the founding-expert billing policy:
 *   - Founding experts are LIFETIME FREE (experts.billing_exempt = true).
 *     We never charge them and never keep a card for the expert role.
 *   - Their COMPANY (vendors row) still bills normally. Expert-side only.
 *
 * The tricky part: dual-role people (expert + company) share ONE Stripe
 * customer + subscription, written into BOTH the experts row and the
 * vendors row. So we must NOT cancel those — that subscription IS the
 * company's. We only detach it from the experts row.
 *
 * SAFETY RULE (do not remove): an expert's Stripe columns are cleared
 * only when the subscription is provably still tracked elsewhere (the
 * same sub id on a vendors row) OR has been cancelled. Clearing an
 * untracked, live subscription would orphan it — it would keep running
 * and eventually charge with nothing pointing at it.
 *
 * Usage (from landing/):
 *   node scripts/fix-founding-expert-billing.mjs --dry-run
 *   node scripts/fix-founding-expert-billing.mjs
 *   # to also cancel expert-only subscriptions (needs the LIVE key,
 *   # passed per-run and never saved to a file):
 *   STRIPE_LIVE_KEY=sk_live_xxx node scripts/fix-founding-expert-billing.mjs --cancel
 *
 * Requires 0042_expert_billing_exempt.sql to have been run first.
 */

import { createClient } from "@supabase/supabase-js";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const landingDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landingDir, ".env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const DO_CANCEL = process.argv.includes("--cancel");
// Operator override: "I already cancelled these in the Stripe Dashboard."
// Needed because the webhook never syncs expert subscription status, so
// the DB can't confirm a manual cancellation on its own.
const FORCE_CLEAR = process.argv.includes("--force-clear");

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// The founding cohort to make lifetime-free. Test / internal accounts are
// deliberately EXCLUDED (confirmed with Rushdha):
//   rakshanarazik@gmail.com (TT1)  — test, test-mode Stripe
//   rushdha@ekwa.com        (LOP)  — internal testing done on live; sub already removed
const FREE_EXPERTS = [
  "ashley@mintconceptions.com",
  "andrew@phillipsgrouptax.com",
  "dashdentalconsulting@gmail.com",
  "monica@blossomdentalconsulting.com",
];

const REASON = "Founding expert cohort — lifetime free (first 20, test accounts excluded)";

async function main() {
  console.log(`Founding-expert billing fix${DRY_RUN ? "  (DRY RUN)" : ""}\n`);

  // Guard: migration must be applied.
  const { error: colErr } = await sb.from("experts").select("billing_exempt").limit(1);
  if (colErr) {
    console.error("✗ experts.billing_exempt does not exist.");
    console.error("  Run supabase/migrations/0042_expert_billing_exempt.sql first.");
    process.exit(1);
  }

  const { data: vendors } = await sb
    .from("vendors")
    .select("id, contact_email, company_name, stripe_subscription_id");
  const subsOwnedByAVendor = new Set(
    (vendors ?? []).map((v) => v.stripe_subscription_id).filter(Boolean),
  );

  let exempted = 0;
  let detached = 0;
  let cancelled = 0;
  const needsCancel = [];
  const cardsToDetach = [];

  for (const email of FREE_EXPERTS) {
    const { data: e } = await sb
      .from("experts")
      .select("id, email, display_name, full_name, billing_exempt, stripe_customer_id, stripe_subscription_id, subscription_status, card_last4")
      .ilike("email", email)
      .maybeSingle();

    if (!e) {
      console.warn(`! no experts row for ${email} — skipping`);
      continue;
    }
    const name = e.display_name || e.full_name || e.email;
    console.log(`→ ${name} <${e.email}>`);

    // 1. Grant the lifetime exemption (idempotent).
    if (e.billing_exempt) {
      console.log("   · already billing_exempt");
    } else if (DRY_RUN) {
      console.log("   [dry] set billing_exempt = true");
      exempted++;
    } else {
      const { error } = await sb
        .from("experts")
        .update({
          billing_exempt: true,
          billing_exempt_reason: REASON,
          billing_exempt_granted_at: new Date().toISOString(),
        })
        .eq("id", e.id);
      if (error) { console.error(`   ✗ exempt failed: ${error.message}`); continue; }
      console.log("   ✓ billing_exempt = true");
      exempted++;
    }

    // 2. Detach Stripe from the EXPERT row, honoring the safety rule.
    if (!e.stripe_subscription_id && !e.stripe_customer_id && !e.card_last4) {
      console.log("   · no expert-side Stripe data to clear\n");
      continue;
    }

    // No subscription at all — a Stripe customer (and possibly a saved
    // card) exists, but nothing is billing. There is no live sub to
    // orphan, so the DB columns are safe to clear. The card itself still
    // lives on the Stripe customer; --cancel detaches it, or you can
    // delete it from the Stripe Dashboard.
    if (!e.stripe_subscription_id) {
      console.log(`   · Stripe customer ${e.stripe_customer_id} exists but NO subscription — nothing is billing`);
      if (DRY_RUN) {
        console.log("   [dry] clear expert Stripe columns (card must still be detached in Stripe)");
      } else {
        const { error } = await sb.from("experts").update({
          stripe_customer_id: null, stripe_subscription_id: null, stripe_price_id: null,
          subscription_status: null, subscription_interval: null, current_period_end: null,
          cancel_at_period_end: false, canceled_at: null, card_brand: null, card_last4: null,
        }).eq("id", e.id);
        if (error) { console.error(`   ✗ clear failed: ${error.message}`); continue; }
        console.log("   ✓ expert Stripe columns cleared");
      }
      cardsToDetach.push({ email: e.email, customer: e.stripe_customer_id });
      detached++;
      console.log("");
      continue;
    }

    const ownedByCompany = subsOwnedByAVendor.has(e.stripe_subscription_id);

    if (ownedByCompany) {
      const v = (vendors ?? []).find((x) => x.stripe_subscription_id === e.stripe_subscription_id);
      console.log(`   · sub ${e.stripe_subscription_id} belongs to company "${v?.company_name}" — keeping it there, detaching from expert row`);
      if (DRY_RUN) {
        console.log("   [dry] clear expert Stripe columns");
      } else {
        const { error } = await sb.from("experts").update({
          stripe_customer_id: null,
          stripe_subscription_id: null,
          stripe_price_id: null,
          subscription_status: null,
          subscription_interval: null,
          current_period_end: null,
          cancel_at_period_end: false,
          canceled_at: null,
          card_brand: null,
          card_last4: null,
        }).eq("id", e.id);
        if (error) { console.error(`   ✗ detach failed: ${error.message}`); continue; }
        console.log("   ✓ expert Stripe columns cleared (company billing untouched)");
      }
      detached++;
      console.log("");
      continue;
    }

    // Expert-only subscription — must be cancelled before we can clear it.
    const isCancelled = e.subscription_status === "canceled";
    if (isCancelled) {
      if (!DRY_RUN) {
        await sb.from("experts").update({
          stripe_customer_id: null, stripe_subscription_id: null, stripe_price_id: null,
          subscription_status: null, subscription_interval: null, current_period_end: null,
          cancel_at_period_end: false, canceled_at: null, card_brand: null, card_last4: null,
        }).eq("id", e.id);
      }
      console.log("   ✓ sub already canceled — expert Stripe columns cleared");
      detached++;
      console.log("");
      continue;
    }

    // --force-clear: the subscription was cancelled by hand in the Stripe
    // Dashboard. The webhook doesn't sync expert subs, so the DB still
    // says "trialing" and the safety rule above can't tell. This is the
    // explicit human override. We keep the old sub id in the exempt
    // reason so the trail isn't lost.
    if (FORCE_CLEAR) {
      const note = `${REASON} · cancelled in Stripe by hand (was ${e.stripe_subscription_id}, ${e.subscription_status}, card ****${e.card_last4})`;
      if (DRY_RUN) {
        console.log(`   [dry] force-clear (operator confirmed Stripe cancellation) — ${e.stripe_subscription_id}`);
      } else {
        const { error } = await sb.from("experts").update({
          billing_exempt_reason: note,
          stripe_customer_id: null, stripe_subscription_id: null, stripe_price_id: null,
          subscription_status: null, subscription_interval: null, current_period_end: null,
          cancel_at_period_end: false, canceled_at: null, card_brand: null, card_last4: null,
        }).eq("id", e.id);
        if (error) { console.error(`   ✗ force-clear failed: ${error.message}`); continue; }
        console.log(`   ✓ force-cleared (was ${e.stripe_subscription_id}) — old id kept in billing_exempt_reason`);
      }
      detached++;
      console.log("");
      continue;
    }

    if (!DO_CANCEL || !process.env.STRIPE_LIVE_KEY) {
      console.warn(`   ! EXPERT-ONLY live sub ${e.stripe_subscription_id} (${e.subscription_status}, card ****${e.card_last4})`);
      console.warn("     NOT cleared — clearing without cancelling would orphan a live subscription.");
      console.warn("     Re-run with: STRIPE_LIVE_KEY=sk_live_xxx node scripts/fix-founding-expert-billing.mjs --cancel");
      needsCancel.push(e);
      console.log("");
      continue;
    }

    // Cancel in Stripe, then clear.
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_LIVE_KEY);
    if (DRY_RUN) {
      console.log(`   [dry] stripe.subscriptions.cancel(${e.stripe_subscription_id})`);
    } else {
      try {
        await stripe.subscriptions.cancel(e.stripe_subscription_id);
        console.log(`   ✓ cancelled Stripe sub ${e.stripe_subscription_id}`);
        cancelled++;
        // Detach the saved card so nothing is retained.
        if (e.stripe_customer_id) {
          const pms = await stripe.paymentMethods.list({ customer: e.stripe_customer_id, type: "card" });
          for (const pm of pms.data) {
            await stripe.paymentMethods.detach(pm.id);
            console.log(`   ✓ detached card ${pm.card?.brand} ****${pm.card?.last4}`);
          }
        }
        await sb.from("experts").update({
          stripe_customer_id: null, stripe_subscription_id: null, stripe_price_id: null,
          subscription_status: null, subscription_interval: null, current_period_end: null,
          cancel_at_period_end: false, canceled_at: null, card_brand: null, card_last4: null,
        }).eq("id", e.id);
        console.log("   ✓ expert Stripe columns cleared");
        detached++;
      } catch (err) {
        console.error(`   ✗ Stripe cancel failed: ${err.message}`);
        console.error("     (Is this the right Stripe account? live vs test)");
      }
    }
    console.log("");
  }

  // ---- Sweep Stripe itself for subscriptions the DB never recorded ----
  // The webhook only syncs MEMBER subscriptions — expert/vendor rows are
  // written at checkout time, so a missed callback (e.g. the apex->www
  // redirect failure) can leave a live subscription in Stripe with no
  // trace in the DB. Those still charge. Find them by email.
  if (DO_CANCEL && process.env.STRIPE_LIVE_KEY) {
    console.log("\n--- Sweeping Stripe for untracked expert subscriptions ---");
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_LIVE_KEY);
    for (const email of FREE_EXPERTS) {
      // Skip anyone whose sub belongs to their company — that one stays.
      const customers = await stripe.customers.list({ email, limit: 10 });
      for (const c of customers.data) {
        const subs = await stripe.subscriptions.list({ customer: c.id, status: "all", limit: 20 });
        for (const s of subs.data) {
          if (!["trialing", "active", "past_due", "unpaid"].includes(s.status)) continue;
          if (subsOwnedByAVendor.has(s.id)) {
            console.log(`   · ${email}: ${s.id} belongs to their company — leaving it`);
            continue;
          }
          if (DRY_RUN) {
            console.log(`   [dry] would cancel ${s.id} (${s.status}) for ${email}`);
            continue;
          }
          await stripe.subscriptions.cancel(s.id);
          console.log(`   ✓ cancelled untracked sub ${s.id} (${s.status}) for ${email}`);
          cancelled++;
        }
        const pms = await stripe.paymentMethods.list({ customer: c.id, type: "card" });
        for (const pm of pms.data) {
          if (DRY_RUN) { console.log(`   [dry] would detach card ****${pm.card?.last4} for ${email}`); continue; }
          await stripe.paymentMethods.detach(pm.id);
          console.log(`   ✓ detached card ${pm.card?.brand} ****${pm.card?.last4} for ${email}`);
        }
      }
    }
  }

  console.log(`\nDone. exempted=${exempted} detached=${detached} cancelled=${cancelled}`);
  if (needsCancel.length) {
    console.log(`\n⚠ ${needsCancel.length} expert-only subscription(s) still need CANCELLING in Stripe:`);
    needsCancel.forEach((e) => console.log(`   ${e.email}  ${e.stripe_subscription_id}  (${e.subscription_status})`));
  }
  if (cardsToDetach.length) {
    console.log(`\n· ${cardsToDetach.length} Stripe customer(s) with a saved card but no subscription —`);
    console.log("  nothing is billing, but delete the card in Stripe if you want it gone:");
    cardsToDetach.forEach((c) => console.log(`   ${c.email}  ${c.customer}`));
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
