import Stripe from "stripe";

/**
 * Single source of truth for the Stripe SDK + DMN's pricing catalogue.
 *
 * Price IDs are read from env vars so the same code runs against the test
 * sandbox locally and against live prices in production without an edit.
 *
 *   STRIPE_PRICE_FOUNDING_MONTHLY  - $49/mo
 *   STRIPE_PRICE_FOUNDING_ANNUAL   - $490/yr
 *   STRIPE_PRICE_STANDARD_MONTHLY  - $99/mo (or whatever you settle on)
 *
 * The webhook handler also needs STRIPE_WEBHOOK_SECRET.
 */

let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to landing/.env.local for local dev and to Vercel env vars (Preview + Production).",
    );
  }
  _client = new Stripe(key, {
    // Pinning the API version keeps webhook payloads + types stable
    // even when Stripe ships new defaults.
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  });
  return _client;
}

export type SubscriptionPlanKey =
  | "founding_monthly"
  | "founding_annual"
  | "standard_monthly";

/**
 * Map our plan keys to the price IDs configured in Stripe Dashboard.
 * Throws a clear error if any are missing so misconfiguration shows up
 * at request time, not silently at runtime.
 */
export function priceIdFor(plan: SubscriptionPlanKey): string {
  const envKey =
    plan === "founding_monthly"
      ? "STRIPE_PRICE_FOUNDING_MONTHLY"
      : plan === "founding_annual"
        ? "STRIPE_PRICE_FOUNDING_ANNUAL"
        : "STRIPE_PRICE_STANDARD_MONTHLY";
  const value = process.env[envKey];
  if (!value) {
    throw new Error(
      `Missing env var ${envKey}. Set this in landing/.env.local (and Vercel) to a Stripe price ID like "price_1Te9...".`,
    );
  }
  return value;
}

export function isFoundingPlan(plan: SubscriptionPlanKey): boolean {
  return plan === "founding_monthly" || plan === "founding_annual";
}

export function billingIntervalFor(plan: SubscriptionPlanKey): "month" | "year" {
  return plan === "founding_annual" ? "year" : "month";
}

/**
 * Where the user lands after Checkout. Resolved in this order so it
 * works without manual env-var fiddling for each preview deploy:
 *
 *   1. NEXT_PUBLIC_APP_ORIGIN  — explicit override (use for production)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel auto-sets this for the
 *      project's production deployment, even on preview builds
 *   3. VERCEL_BRANCH_URL       — Vercel auto-sets this to a STABLE
 *      per-branch URL (e.g. <project>-git-<branch>-<team>.vercel.app)
 *      that survives across pushes — great for previews
 *   4. VERCEL_URL              — Vercel auto-sets this to the specific
 *      deployment's URL (changes per push) — last-resort fallback
 *   5. http://localhost:3000   — local dev
 *
 * All Vercel system env vars are bare hostnames (no scheme), so we
 * prepend https:// when we use them.
 */
export function appOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_ORIGIN ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return stripTrailingSlash(explicit);

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost && process.env.VERCEL_ENV === "production") {
    return `https://${productionHost}`;
  }

  const branchHost = process.env.VERCEL_BRANCH_URL;
  if (branchHost) return `https://${branchHost}`;

  const deploymentHost = process.env.VERCEL_URL;
  if (deploymentHost) return `https://${deploymentHost}`;

  return "http://localhost:3000";
}

function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, "");
}
