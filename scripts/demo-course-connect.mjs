#!/usr/bin/env node
/**
 * demo-course-connect.mjs — SANDBOX DEMO of the 70/30 course split.
 *
 * Proves the Stripe Connect money-split with FAKE money in Stripe TEST mode.
 * Nothing here touches the live app, the database, or a real card. It exists
 * only to see the split happen (and to test whether our Canadian platform can
 * pay a US expert — the cross-border question).
 *
 * HARD SAFETY: refuses to run unless STRIPE_SECRET_KEY starts with sk_test_.
 *
 * Commands (run from landing/):
 *   node scripts/demo-course-connect.mjs account          create a test "expert" payout account + print onboarding link
 *   node scripts/demo-course-connect.mjs status           show the expert account's readiness
 *   node scripts/demo-course-connect.mjs sell 500         create a $500 course checkout (30% fee to us, 70% to expert)
 *   node scripts/demo-course-connect.mjs split            show the split on the last paid checkout
 *   node scripts/demo-course-connect.mjs refund           refund the last payment (see the proportional clawback)
 *   node scripts/demo-course-connect.mjs reset            forget saved state (start over)
 *
 * Env overrides:
 *   EXPERT_COUNTRY=US   country of the test expert account (default US — probes cross-border from our CA platform)
 *   COURSE_CURRENCY=usd currency of the demo sale (default usd)
 */

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(dir, "..", ".env.local") });

const KEY = (process.env.STRIPE_SECRET_KEY || "").trim();
if (!KEY.startsWith("sk_test_")) {
  console.error("⛔ REFUSING TO RUN — this demo only works with a TEST key (sk_test_...).");
  console.error(`   Current key starts with: ${KEY.slice(0, 8) || "(none)"}`);
  console.error("   This guard is what makes the demo safe: fake money, never a real charge.");
  process.exit(1);
}

const stripe = new Stripe(KEY);
const COUNTRY = (process.env.EXPERT_COUNTRY || "US").toUpperCase();
const CURRENCY = (process.env.COURSE_CURRENCY || "usd").toLowerCase();
const FEE_BPS = 3000; // 30% platform fee → expert keeps 70%
const STATE_FILE = path.join(dir, ".course-demo-state.json");

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { return {}; }
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }
function money(cents, cur = CURRENCY) { return `${(cents / 100).toFixed(2)} ${cur.toUpperCase()}`; }

const cmd = process.argv[2];
const arg = process.argv[3];

async function main() {
  const state = loadState();

  if (cmd === "reset") {
    try { fs.unlinkSync(STATE_FILE); } catch {}
    console.log("State cleared. Next `account` creates a fresh test expert.");
    return;
  }

  // ---- 1. Create the test "expert" payout account + onboarding link ----
  if (cmd === "account") {
    let acct = state.expertAccountId;
    if (!acct) {
      const created = await stripe.accounts.create({
        type: "express",
        country: COUNTRY,
        email: `demo-expert+${Date.now()}@example.com`,
        business_type: "individual",
        capabilities: { transfers: { requested: true } },
        metadata: { demo: "course-connect" },
      });
      acct = created.id;
      saveState({ ...state, expertAccountId: acct, expertCountry: COUNTRY });
      console.log(`✓ created test expert account: ${acct} (country ${COUNTRY})`);
    } else {
      console.log(`· reusing test expert account: ${acct}`);
    }
    const link = await stripe.accountLinks.create({
      account: acct,
      refresh_url: "https://example.com/reauth",
      return_url: "https://example.com/done",
      type: "account_onboarding",
    });
    console.log("\nSTEP: open this link and complete Stripe's TEST onboarding");
    console.log("(in test mode you can use the 'skip / fill with test data' shortcuts):\n");
    console.log("  " + link.url);
    console.log("\nThen run:  node scripts/demo-course-connect.mjs status");
    return;
  }

  if (["status", "sell", "split", "refund"].includes(cmd) && !state.expertAccountId) {
    console.error("No expert account yet. Run:  node scripts/demo-course-connect.mjs account");
    process.exit(1);
  }

  // ---- Account readiness ----
  if (cmd === "status") {
    const a = await stripe.accounts.retrieve(state.expertAccountId);
    const transfers = a.capabilities?.transfers ?? "n/a";
    console.log(`Expert account: ${a.id} (country ${a.country})`);
    console.log(`  transfers capability: ${transfers}   ${transfers === "active" ? "✓ can receive the 70%" : "⏳ finish onboarding first"}`);
    console.log(`  charges_enabled: ${a.charges_enabled}   payouts_enabled: ${a.payouts_enabled}`);
    if (transfers !== "active") {
      console.log("\n  Not ready yet — open the onboarding link from `account` and complete it.");
      console.log("  (If it never activates for a US account, that IS the cross-border answer:");
      console.log("   our Canadian platform can't pay US experts directly → use Standard accounts.)");
    } else {
      console.log("\n  Ready. Run:  node scripts/demo-course-connect.mjs sell 500");
    }
    return;
  }

  // ---- 2. Sell a course: 30% fee to us, 70% to the expert ----
  if (cmd === "sell") {
    const dollars = Number(arg || "500");
    if (!Number.isFinite(dollars) || dollars <= 0) { console.error("Usage: sell <dollars>, e.g. sell 500"); process.exit(1); }
    const amount = Math.round(dollars * 100);
    const fee = Math.round((amount * FEE_BPS) / 10000);
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: amount,
            product_data: { name: "DEMO Course — Seen, Felt and Acknowledged" },
          },
        }],
        payment_intent_data: {
          application_fee_amount: fee,                 // → us (30%)
          transfer_data: { destination: state.expertAccountId }, // → expert (70%)
        },
        success_url: "https://example.com/success?s={CHECKOUT_SESSION_ID}",
        cancel_url: "https://example.com/cancel",
      });
    } catch (err) {
      console.error(`✗ Stripe rejected the split: ${err.message}`);
      console.error("\nIf this mentions the destination country / cross-border, that's the");
      console.error("informative result: Express destination charges from our CA platform to a");
      console.error(`${COUNTRY} expert aren't allowed → the Standard-account path is the fix.`);
      process.exit(1);
    }
    saveState({ ...state, lastSessionId: session.id, lastAmount: amount, lastFee: fee });
    console.log(`✓ checkout created for ${money(amount)}`);
    console.log(`   → us (30% fee):   ${money(fee)}`);
    console.log(`   → expert (70%):   ${money(amount - fee)}`);
    console.log("\nSTEP: open this checkout and pay with test card  4242 4242 4242 4242  (any future date, any CVC):\n");
    console.log("  " + session.url);
    console.log("\nThen run:  node scripts/demo-course-connect.mjs split");
    return;
  }

  // ---- 3. Show the split actually happened ----
  if (cmd === "split") {
    if (!state.lastSessionId) { console.error("Nothing sold yet. Run:  sell 500"); process.exit(1); }
    const s = await stripe.checkout.sessions.retrieve(state.lastSessionId, { expand: ["payment_intent"] });
    const pi = s.payment_intent;
    if (!pi || s.payment_status !== "paid") {
      console.log(`Payment status: ${s.payment_status}. Open the checkout URL from \`sell\` and pay with 4242 first.`);
      return;
    }
    const charge = await stripe.charges.retrieve(pi.latest_charge, { expand: ["application_fee", "transfer"] });
    saveState({ ...state, lastPaymentIntent: pi.id });
    console.log(`✓ PAID: ${money(charge.amount)}`);
    console.log(`   platform fee (to us):   ${money(charge.application_fee?.amount ?? state.lastFee)}  → our balance`);
    console.log(`   transferred (to expert): ${money(charge.transfer?.amount ?? (charge.amount - (state.lastFee || 0)))}  → ${state.expertAccountId}`);
    console.log("\nSee it in the Stripe test dashboard → Payments (the charge shows the fee),");
    console.log("and switch to the connected account to see its 70% balance.");
    console.log("\nOptional:  node scripts/demo-course-connect.mjs refund");
    return;
  }

  // ---- 4. Refund → proportional clawback from both sides ----
  if (cmd === "refund") {
    if (!state.lastPaymentIntent) { console.error("No paid payment yet. Run `split` after paying."); process.exit(1); }
    const r = await stripe.refunds.create({
      payment_intent: state.lastPaymentIntent,
      refund_application_fee: true, // give back our 30%
      reverse_transfer: true,       // claw back the expert's 70%
    });
    console.log(`✓ refunded ${money(r.amount)} — Stripe reversed BOTH sides:`);
    console.log("   our 30% fee returned, and the expert's 70% pulled back automatically.");
    console.log("   (No chasing the expert for their share.)");
    return;
  }

  console.log("Commands: account | status | sell <dollars> | split | refund | reset");
  console.log("Start with:  node scripts/demo-course-connect.mjs account");
}

main().catch((err) => { console.error(err.message || err); process.exit(1); });
