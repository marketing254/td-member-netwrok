#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * _audit-stripe-sync.mjs — READ-ONLY audit: live Stripe vs the database.
 *
 * Lists every Stripe customer with a subscription and checks the matching
 * vendors / experts / members row agrees on subscription id + status.
 * Changes NOTHING in Stripe or the DB.
 *
 * Your .env.local holds the TEST key, so pass the LIVE key just for this run:
 *   PowerShell:  $env:STRIPE_LIVE_KEY="sk_live_..." ; node scripts/_audit-stripe-sync.mjs
 *   Git Bash:    STRIPE_LIVE_KEY=sk_live_... node scripts/_audit-stripe-sync.mjs
 * (Without STRIPE_LIVE_KEY it falls back to STRIPE_SECRET_KEY = test mode.)
 */
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local") });

const key = process.env.STRIPE_LIVE_KEY || process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("No Stripe key. Set STRIPE_LIVE_KEY for a live audit.");
  process.exit(1);
}
console.log(`Mode: ${key.startsWith("sk_live") ? "LIVE" : "TEST"}\n`);

const stripe = new Stripe(key);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Pull DB rows that carry Stripe linkage.
const [vendors, experts, members] = await Promise.all([
  sb.from("vendors").select("company_name, contact_email, stripe_customer_id, stripe_subscription_id, subscription_status"),
  sb.from("experts").select("full_name, email, stripe_customer_id, stripe_subscription_id, subscription_status"),
  sb.from("members").select("first_name, last_name, email, stripe_customer_id, stripe_subscription_id, subscription_status"),
]);
const dbByCustomer = new Map();
for (const v of vendors.data ?? []) if (v.stripe_customer_id) dbByCustomer.set(v.stripe_customer_id, { kind: "partner", label: v.company_name, ...v });
for (const e of experts.data ?? []) if (e.stripe_customer_id) dbByCustomer.set(e.stripe_customer_id, { kind: "expert", label: e.full_name, ...e });
for (const m of members.data ?? []) if (m.stripe_customer_id) dbByCustomer.set(m.stripe_customer_id, { kind: "member", label: `${m.first_name} ${m.last_name ?? ""}`.trim(), ...m });

let issues = 0;
console.log("=== Stripe subscriptions vs DB ===");
for await (const sub of stripe.subscriptions.list({ status: "all", limit: 100, expand: ["data.customer"] })) {
  const cust = typeof sub.customer === "string" ? { id: sub.customer, email: "?" } : sub.customer;
  const row = dbByCustomer.get(cust.id);
  const who = row ? `${row.kind}: ${row.label}` : "NO DB ROW";
  const subMatch = row?.stripe_subscription_id === sub.id;
  const statusMatch = row?.subscription_status === sub.status;
  const flag = !row ? "✗ MISSING" : !subMatch ? "✗ SUB-ID MISMATCH" : !statusMatch ? `✗ STATUS (db=${row.subscription_status})` : "✓";
  if (flag !== "✓") issues++;
  console.log(`${flag}  ${cust.email ?? cust.id} | stripe: ${sub.id} ${sub.status} | ${who}`);
}

console.log("\n=== Recent completed checkouts (last 30 days) — fulfillment check ===");
const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
for await (const s of stripe.checkout.sessions.list({ limit: 100, created: { gte: since } })) {
  if (s.status !== "complete") continue;
  const email = s.customer_details?.email?.toLowerCase() ?? "?";
  const { data: m } = await sb.from("members").select("id, status, subscription_status").ilike("email", email).maybeSingle();
  const ok = !!m && !!m.subscription_status;
  if (!ok) issues++;
  console.log(`${ok ? "✓" : "✗ NOT FULFILLED"}  ${email} | session ${s.id} | member row: ${m ? m.status + "/" + (m.subscription_status ?? "no-sub-status") : "MISSING"}`);
}

console.log(`\nDone. Discrepancies: ${issues}${issues ? " — fix by resending the failed webhook events in Stripe, then re-run this audit." : " — DB matches Stripe."}`);
