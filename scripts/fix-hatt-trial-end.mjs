#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix-hatt-trial-end.mjs — Dr. Jesper Hatt's addendum (Lester, 28 Oct 2026):
 * six months free from acceptance, so the trial ends 26 Apr 2027, then $49
 * a month flat forever. The dashboard editor fails on this subscription
 * because it runs on a phase schedule, so this does the two API calls:
 *   1. release the schedule (subscription keeps running, phases removed),
 *   2. set trial_end = 26 Apr 2027 with no proration.
 * Nothing is charged by either step.
 *
 * Needs the LIVE secret key, passed on the command line only (it is not
 * saved anywhere). From landing/, PowerShell:
 *   add STRIPE_LIVE_KEY=sk_live_... to landing/.env.local, then
 *   node scripts/fix-hatt-trial-end.mjs --dry-run   (shows the current state, changes nothing)
 *   node scripts/fix-hatt-trial-end.mjs             (release schedule + set trial end)
 *   then remove STRIPE_LIVE_KEY from .env.local again.
 * Preview only (no changes): add --dry-run
 */
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Reads STRIPE_LIVE_KEY from landing/.env.local (or the shell).
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local"), quiet: true });

const SUB = "sub_1UUuXSEQkmH9QblbiQs7F2RW"; // Hatt Consulting GmbH (AlignerService), mail@hattconsulting.com
const CUSTOMER = "cus_VVmldUVOCuzb57"; // must match, or the script stops
const TRIAL_END = Math.floor(Date.UTC(2027, 3, 26, 4, 0, 0) / 1000); // 26 Apr 2027 00:00 EDT
const DRY = process.argv.includes("--dry-run");

const key = process.env.STRIPE_LIVE_KEY;
if (!key || !key.startsWith("sk_live_")) {
  console.error("Set STRIPE_LIVE_KEY to the live secret key (sk_live_...). The .env.local key is test mode.");
  process.exit(1);
}
const stripe = new Stripe(key);

let sub = await stripe.subscriptions.retrieve(SUB);
const fmt = (t) => (t ? new Date(t * 1000).toISOString().slice(0, 10) : "none");
console.log(`before: status=${sub.status} trial_end=${fmt(sub.trial_end)} schedule=${sub.schedule ?? "none"} price=${sub.items.data[0]?.price.id} $${(sub.items.data[0]?.price.unit_amount ?? 0) / 100}/${sub.items.data[0]?.price.recurring?.interval}`);
if (sub.customer !== CUSTOMER) {
  console.error(`STOP: subscription belongs to ${sub.customer}, expected ${CUSTOMER}. Nothing changed.`);
  process.exit(1);
}
if (sub.status !== "trialing") {
  console.error(`STOP: subscription status is ${sub.status}, expected trialing. Nothing changed.`);
  process.exit(1);
}
if (DRY) { console.log("dry run: no changes"); process.exit(0); }

if (sub.schedule) {
  const id = typeof sub.schedule === "string" ? sub.schedule : sub.schedule.id;
  await stripe.subscriptionSchedules.release(id);
  console.log(`released schedule ${id}`);
}
sub = await stripe.subscriptions.update(SUB, { trial_end: TRIAL_END, proration_behavior: "none" });
console.log(`after:  status=${sub.status} trial_end=${fmt(sub.trial_end)} schedule=${sub.schedule ?? "none"} cancel_at_period_end=${sub.cancel_at_period_end}`);
console.log("done — the subscription page should now say 'Free trial ends Apr 26, 2027'.");
