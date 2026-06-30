import Stripe from "stripe";

/**
 * Single source of truth for the Stripe SDK + DMN's pricing catalogue.
 *
 * Price IDs are read from env vars so the same code runs against the test
 * sandbox locally and against live prices in production without an edit.
 *
 *   STRIPE_PRICE_FOUNDING_MONTHLY  - $49/mo   (CAD)  — first 100 members
 *   STRIPE_PRICE_FOUNDING_ANNUAL   - $490/yr  (CAD)
 *   STRIPE_PRICE_EARLY_MONTHLY     - $99/mo   (CAD)  — members 101–500
 *   STRIPE_PRICE_EARLY_ANNUAL      - $990/yr  (CAD)
 *   STRIPE_PRICE_STANDARD_MONTHLY  - $199/mo  (CAD)  — open enrollment
 *   STRIPE_PRICE_STANDARD_ANNUAL   - $1,990/yr (CAD)
 *
 * Tier caps (lifetime — cancellations do NOT free a seat):
 *   Founding: first 100 lifetime  → FOUNDING_MEMBER_CAP
 *   Early:    next 400 (101–500) → EARLY_MEMBER_CAP
 *   Standard: unlimited
 *
 * The webhook handler also needs STRIPE_WEBHOOK_SECRET.
 */

// Lifetime caps. Once N members have ever subscribed to a tier, the tier
// closes permanently — cancellations do NOT free a seat. We track this by
// the {founding,early}_member_locked boolean on members, set by the
// Stripe webhook on first successful checkout and never reset.
export const FOUNDING_MEMBER_CAP = 100;
export const EARLY_MEMBER_CAP = 400; // members 101–500 inclusive

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
  | "early_monthly"
  | "early_annual"
  | "standard_monthly"
  | "standard_annual";

export type SubscriptionTier = "founding" | "early" | "standard";

export const ALL_PLAN_KEYS: SubscriptionPlanKey[] = [
  "founding_monthly",
  "founding_annual",
  "early_monthly",
  "early_annual",
  "standard_monthly",
  "standard_annual",
];

/**
 * Display price for each plan (CAD). Used by the UI — Stripe still
 * charges based on the price ID in the env var, this is just the label.
 */
export const PLAN_DISPLAY: Record<
  SubscriptionPlanKey,
  { amount: number; per: "mo" | "yr"; tier: SubscriptionTier; label: string }
> = {
  founding_monthly: { amount: 49,   per: "mo", tier: "founding", label: "Founding Monthly" },
  founding_annual:  { amount: 490,  per: "yr", tier: "founding", label: "Founding Annual"  },
  early_monthly:    { amount: 99,   per: "mo", tier: "early",    label: "Early Monthly"    },
  early_annual:     { amount: 990,  per: "yr", tier: "early",    label: "Early Annual"     },
  standard_monthly: { amount: 199,  per: "mo", tier: "standard", label: "Standard Monthly" },
  standard_annual:  { amount: 1990, per: "yr", tier: "standard", label: "Standard Annual"  },
};

export function tierForPlan(plan: SubscriptionPlanKey): SubscriptionTier {
  return PLAN_DISPLAY[plan].tier;
}

/**
 * Map our plan keys to the price IDs configured in Stripe Dashboard.
 * Throws a clear error if any are missing so misconfiguration shows up
 * at request time, not silently at runtime.
 */
export function priceIdFor(plan: SubscriptionPlanKey): string {
  const envKey =
    plan === "founding_monthly"   ? "STRIPE_PRICE_FOUNDING_MONTHLY"
      : plan === "founding_annual"  ? "STRIPE_PRICE_FOUNDING_ANNUAL"
      : plan === "early_monthly"    ? "STRIPE_PRICE_EARLY_MONTHLY"
      : plan === "early_annual"     ? "STRIPE_PRICE_EARLY_ANNUAL"
      : plan === "standard_monthly" ? "STRIPE_PRICE_STANDARD_MONTHLY"
      : "STRIPE_PRICE_STANDARD_ANNUAL";
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

export function isEarlyPlan(plan: SubscriptionPlanKey): boolean {
  return plan === "early_monthly" || plan === "early_annual";
}

export function billingIntervalFor(plan: SubscriptionPlanKey): "month" | "year" {
  return PLAN_DISPLAY[plan].per === "yr" ? "year" : "month";
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
