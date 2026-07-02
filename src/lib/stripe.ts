import Stripe from "stripe";

/**
 * Single source of truth for the Stripe SDK + DMN's pricing catalogue.
 *
 * Price IDs are read from env vars so the same code runs against the test
 * sandbox locally and against live prices in production without an edit.
 *
 *   STRIPE_PRICE_FOUNDING_MONTHLY            - $49/mo   (CAD)  — first 100 members
 *   STRIPE_PRICE_FOUNDING_ANNUAL             - $490/yr  (CAD)
 *   STRIPE_PRICE_EARLY_MONTHLY               - $99/mo   (CAD)  — members 101–500
 *   STRIPE_PRICE_EARLY_ANNUAL                - $990/yr  (CAD)
 *   STRIPE_PRICE_STANDARD_MONTHLY            - $199/mo  (CAD)  — open enrollment
 *   STRIPE_PRICE_STANDARD_ANNUAL             - $1,990/yr (CAD)
 *
 *   STRIPE_PRICE_PARTNER_GROWTH_MONTHLY      - $49/mo   (USD)  — partner months 7-12
 *   STRIPE_PRICE_PARTNER_STANDARD_MONTHLY    - $199/mo  (USD)  — partner month 13+
 *   STRIPE_PRICE_PARTNER_STANDARD_ANNUAL     - $1,990/yr (USD) — annual pre-pay
 *
 *   STRIPE_PRICE_EXPERT_GROWTH_MONTHLY       - $49/mo   (USD)  — expert months 7-12
 *   STRIPE_PRICE_EXPERT_STANDARD_MONTHLY     - $199/mo  (USD)  — expert month 13+
 *   STRIPE_PRICE_EXPERT_STANDARD_ANNUAL      - $1,990/yr (USD) — annual pre-pay
 *
 * Note: months 1-6 (launch / founding waiver) are NOT in Stripe at all —
 * the partner/expert signs up via form, an admin activates them from the
 * admin portal, and they get free portal access without a Stripe
 * customer. Stripe enters the picture only when they upgrade at month 7.
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

// =====================================================================
// EXPERT + PARTNER PLANS
// =====================================================================
//
// Members and the two business audiences (vendors/partners + experts) all
// run through Stripe but with separate products + price IDs so we can
// tell them apart in reports + dashboards. Both partners and experts use
// the same 3-phase ladder:
//
//   Phase 1 (months 1-6)   $0/mo   "Launch" — waived founding cohort
//   Phase 2 (months 7-12)  $49/mo  "Growth" — locked launch rate
//   Phase 3 (month 13+)    $199/mo "Standard" — open rate
//   Annual pre-pay         $1,990/yr — 2 months free, available after month 6
//
// The "phase" is just the price the customer is paying RIGHT NOW. We move
// them between prices either by:
//   (a) subscription schedules — define the ladder once on signup, Stripe
//       auto-rolls the customer up at month 7 and month 13, or
//   (b) admin-side switch via the customer portal at the right time.
// (a) is the recommended approach; the dashboard guide covers it.

// Phase 1 (months 1-6) doesn't exist in Stripe — admin activates the
// partner/expert and they get free portal access. The keys here only
// cover the phases where money actually changes hands.
export type PartnerPlanKey =
  | "partner_growth_monthly"     // $49 months 7-12
  | "partner_standard_monthly"   // $199 month 13+
  | "partner_standard_annual";   // $1,990/year

export type ExpertPlanKey =
  | "expert_growth_monthly"      // $49 months 7-12
  | "expert_standard_monthly"    // $199 month 13+
  | "expert_standard_annual";    // $1,990/year

export type PartnerPhase = "launch" | "growth" | "standard";
export type ExpertPhase = "launch" | "growth" | "standard";

export const ALL_PARTNER_PLAN_KEYS: PartnerPlanKey[] = [
  "partner_growth_monthly",
  "partner_standard_monthly",
  "partner_standard_annual",
];

export const ALL_EXPERT_PLAN_KEYS: ExpertPlanKey[] = [
  "expert_growth_monthly",
  "expert_standard_monthly",
  "expert_standard_annual",
];

export const PARTNER_PLAN_DISPLAY: Record<
  PartnerPlanKey,
  { amount: number; per: "mo" | "yr"; phase: PartnerPhase; label: string }
> = {
  partner_growth_monthly:   { amount: 49,   per: "mo", phase: "growth",   label: "Partner Growth (months 7-12)" },
  partner_standard_monthly: { amount: 199,  per: "mo", phase: "standard", label: "Partner Standard Monthly" },
  partner_standard_annual:  { amount: 1990, per: "yr", phase: "standard", label: "Partner Standard Annual" },
};

export const EXPERT_PLAN_DISPLAY: Record<
  ExpertPlanKey,
  { amount: number; per: "mo" | "yr"; phase: ExpertPhase; label: string }
> = {
  expert_growth_monthly:   { amount: 49,   per: "mo", phase: "growth",   label: "Expert Growth (months 7-12)" },
  expert_standard_monthly: { amount: 199,  per: "mo", phase: "standard", label: "Expert Standard Monthly" },
  expert_standard_annual:  { amount: 1990, per: "yr", phase: "standard", label: "Expert Standard Annual" },
};

export function partnerPriceIdFor(plan: PartnerPlanKey): string {
  const envKey =
    plan === "partner_growth_monthly"   ? "STRIPE_PRICE_PARTNER_GROWTH_MONTHLY"
      : plan === "partner_standard_monthly" ? "STRIPE_PRICE_PARTNER_STANDARD_MONTHLY"
      : "STRIPE_PRICE_PARTNER_STANDARD_ANNUAL";
  const value = process.env[envKey];
  if (!value) {
    throw new Error(
      `Missing env var ${envKey}. Set this in landing/.env.local (and Vercel) to a Stripe price ID like "price_1Te9...".`,
    );
  }
  return value;
}

export function expertPriceIdFor(plan: ExpertPlanKey): string {
  const envKey =
    plan === "expert_growth_monthly"   ? "STRIPE_PRICE_EXPERT_GROWTH_MONTHLY"
      : plan === "expert_standard_monthly" ? "STRIPE_PRICE_EXPERT_STANDARD_MONTHLY"
      : "STRIPE_PRICE_EXPERT_STANDARD_ANNUAL";
  const value = process.env[envKey];
  if (!value) {
    throw new Error(
      `Missing env var ${envKey}. Set this in landing/.env.local (and Vercel) to a Stripe price ID like "price_1Te9...".`,
    );
  }
  return value;
}

/**
 * Phase the customer is currently in, derived from months_in_program.
 * Used to render the right "current rate" line in the billing UI without
 * round-tripping to Stripe on every render.
 */
export function phaseForMonth(monthsInProgram: number): "launch" | "growth" | "standard" {
  if (monthsInProgram <= 6) return "launch";
  if (monthsInProgram <= 12) return "growth";
  return "standard";
}

/**
 * Pretty "$0/mo" / "$49/mo" / "$199/mo" label for the given phase.
 */
export function priceLabelForPhase(phase: "launch" | "growth" | "standard"): string {
  if (phase === "launch") return "$0 / mo";
  if (phase === "growth") return "$49 / mo";
  return "$199 / mo";
}

// =====================================================================
// BILLING ACCESS GATE — applied to vendor + expert portals.
// =====================================================================
// Decide whether the user's portal access should be locked based on
// their position in the 3-phase ladder + current Stripe subscription
// status. Used by:
//   - components/shared/BillingGate.tsx (renders a paywall card if
//     blocked, but always lets them through to the billing page itself
//     so they can update the card or re-subscribe)
//   - lib/auth/guards.ts (returns 402 Payment Required on API calls if
//     blocked, so a client that bypasses the wall still can't write).
//
// Why the months-in-program check matters: during the founding waiver
// (months 1-6) we don't expect a card on file, so a NULL subscription
// status is normal — don't lock those users out. After the waiver ends,
// they should have an `active`/`trialing` subscription; anything else
// means there's a problem we should surface.

export type BillingAccess =
  | { allowed: true }
  | { allowed: false; reason: BillingBlockReason; title: string; message: string; cta: string };

export type BillingBlockReason =
  | "subscription_required"  // waiver ended, no subscription created
  | "past_due"               // card declined on latest invoice
  | "canceled"               // subscription terminated
  | "unpaid";                // multiple retry failures, Stripe marked unpaid

export function checkBillingAccess(opts: {
  monthsInProgram: number;
  subscriptionStatus: string | null;
  /**
   * True if the user has any Stripe subscription on file (even one
   * that's `canceled` or `past_due`). Newly-approved users who haven't
   * hit TrialStartCard yet arrive here with `false`, and we block
   * portal access until they add a card and start the trial.
   */
  hasSubscription: boolean;
}): BillingAccess {
  const { monthsInProgram, subscriptionStatus, hasSubscription } = opts;

  // No subscription at all — regardless of where they are in the
  // program timeline, they need to add a card first. Fresh signups
  // land here on their first portal login; the BillingGate's "Go to
  // billing page" button routes them to /vendor/account or
  // /expert/billing, where TrialStartCard captures the card and spins
  // up the trial subscription.
  if (!hasSubscription) {
    return {
      allowed: false,
      reason: "subscription_required",
      title: "One more step — add your card",
      message:
        "You're approved. Add a card to activate your 6-month free trial. Nothing is charged today; the first $49 charge fires on day 181.",
      cta: "Add card & start trial",
    };
  }

  // Healthy subscriptions always pass.
  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    return { allowed: true };
  }

  // Waiver-era grandfather clause — if someone signed up under the old
  // no-subscription flow (months_in_program still ≤ 6 with a NULL
  // status), let them through. The `hasSubscription` short-circuit
  // above catches new-flow users; this block only matches legacy rows.
  if (monthsInProgram <= 6 && !subscriptionStatus) return { allowed: true };

  if (subscriptionStatus === "past_due") {
    return {
      allowed: false,
      reason: "past_due",
      title: "Payment failed on your last invoice",
      message:
        "Your card was declined on the latest charge. Update your payment method to keep your portal and listing active. Stripe will retry once more before suspending.",
      cta: "Update payment method",
    };
  }
  if (subscriptionStatus === "unpaid") {
    return {
      allowed: false,
      reason: "unpaid",
      title: "Subscription suspended",
      message:
        "Your subscription was suspended after repeated payment failures. Add a working card to reactivate.",
      cta: "Reactivate subscription",
    };
  }
  if (
    subscriptionStatus === "canceled" ||
    subscriptionStatus === "incomplete_expired"
  ) {
    return {
      allowed: false,
      reason: "canceled",
      title: "Subscription is no longer active",
      message:
        "Your subscription has ended. Reactivate to restore portal access and your public listing.",
      cta: "Reactivate subscription",
    };
  }

  // No subscription at all, past the waiver — they never started one.
  return {
    allowed: false,
    reason: "subscription_required",
    title: "Founding waiver has ended",
    message:
      "Your 6-month founding waiver is up. Add a subscription to keep your portal and public listing active.",
    cta: "Start subscription",
  };
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
