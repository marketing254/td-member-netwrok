#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * janice-ride-denise-billing.mjs — Lester, 28 Oct 2026, item 5.
 *
 * Janice Janssen is the second expert on Denise Ciardello's fee (Global
 * Team Solutions, quarterly). The portal put her on her own Monthly $49
 * trial with a card on file. This:
 *   1. cancels Janice's own Stripe subscription immediately (she is still
 *      in the free trial, so nothing is refunded or charged),
 *   2. detaches her saved card so it can never be charged,
 *   3. marks her experts row billing-exempt with the reason, pointing at
 *      Denise's subscription, and clears her own subscription fields.
 * The experts table has no billing_parent_id column (that is the vendors
 * table); the exemption + reason is how the expert portal handles a free
 * seat, and the billing page then shows "free for life", no card prompt.
 *
 * Shows the plan first; run with --go to apply. From landing/:
 *   node scripts/janice-ride-denise-billing.mjs        (preview)
 *   node scripts/janice-ride-denise-billing.mjs --go
 */
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const GO = process.argv.includes("--go");

const JANICE_ID = "f714ec6c-21f5-463c-a10d-82993b7b1338";
const DENISE_ID = "4d394d39-f04a-4cf2-b22f-c3c0b6b515df";

const { data: j, error } = await sb.from("experts").select("id, full_name, email, stripe_customer_id, stripe_subscription_id, subscription_status, card_brand, card_last4, billing_exempt").eq("id", JANICE_ID).single();
if (error) throw error;
const { data: d } = await sb.from("experts").select("id, full_name, stripe_subscription_id, subscription_status, subscription_interval, current_period_end").eq("id", DENISE_ID).single();

console.log("Janice now:", j);
console.log("Denise's subscription:", d);

if (j.billing_exempt && !j.stripe_subscription_id) {
  console.log("Already done: Janice is billing-exempt with no subscription of her own.");
  process.exit(0);
}

const reason = `Second expert on Denise Ciardello's quarterly fee (Global Team Solutions) — rides Denise's subscription ${d?.stripe_subscription_id ?? ""}, no separate charge, ever (Lester, 28 Oct 2026). Own trial subscription ${j.stripe_subscription_id ?? "none"} cancelled and card ****${j.card_last4 ?? "----"} detached on ${new Date().toISOString().slice(0, 10)}.`;

if (!GO) {
  console.log("\nPLAN (nothing changed; re-run with --go):");
  console.log(`  cancel Stripe subscription ${j.stripe_subscription_id} (status ${j.subscription_status})`);
  console.log(`  detach saved cards on customer ${j.stripe_customer_id}`);
  console.log(`  experts.${JANICE_ID}: billing_exempt=true, clear subscription/card fields`);
  console.log(`  reason: ${reason}`);
  process.exit(0);
}

if (j.stripe_subscription_id) {
  const sub = await stripe.subscriptions.retrieve(j.stripe_subscription_id);
  if (sub.status !== "canceled") {
    await stripe.subscriptions.cancel(j.stripe_subscription_id, { prorate: false });
    console.log("cancelled", j.stripe_subscription_id);
  } else console.log("subscription already cancelled");
}
if (j.stripe_customer_id) {
  const pms = await stripe.paymentMethods.list({ customer: j.stripe_customer_id, type: "card" });
  for (const pm of pms.data) {
    await stripe.paymentMethods.detach(pm.id);
    console.log("detached card", pm.card?.brand, "****" + pm.card?.last4);
  }
}
const upd = await sb
  .from("experts")
  .update({
    billing_exempt: true,
    billing_exempt_reason: reason,
    billing_exempt_granted_at: new Date().toISOString(),
    stripe_subscription_id: null,
    stripe_price_id: null,
    subscription_status: null,
    subscription_interval: null,
    current_period_end: null,
    card_brand: null,
    card_last4: null,
  })
  .eq("id", JANICE_ID)
  .select("id, billing_exempt, stripe_subscription_id, card_last4")
  .single();
if (upd.error) throw upd.error;
console.log("experts row:", upd.data);
console.log("done");
