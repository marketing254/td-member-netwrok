/**
 * Partner price plans, in one place.
 *
 * Four plans. The first two bill monthly, the other two every three
 * months (Lester, 5 Oct 2026: quarterly option for experts and partners,
 * first person Lisa Grogan). Every plan starts with six free months.
 *
 *   flat_49        $49 a month from month 7, no increase.
 *   ladder         $49 a month for months 7-12, then $199 a month.
 *   quarterly_49   $49 every three months from month 7, no increase.
 *   quarterly_149  $49 every three months for months 7-12, then $149.
 *
 * The admin picks "Monthly or Quarterly" and "the fee from month 13";
 * those two choices map onto one of these values, which is what the
 * invite row, the vendor row, the agreement PDF, the sign-up page, the
 * billing page, the confirmation email and the Stripe schedule all read.
 *
 * Safe to import from client components: no server-only code here.
 */

export type PartnerPlan = "flat_49" | "ladder" | "quarterly_49" | "quarterly_149";
export type BillingCadence = "monthly" | "quarterly";

export const PARTNER_PLANS: readonly PartnerPlan[] = ["flat_49", "ladder", "quarterly_49", "quarterly_149"];

export function isPartnerPlan(v: unknown): v is PartnerPlan {
  return typeof v === "string" && (PARTNER_PLANS as readonly string[]).includes(v);
}

/** Anything unknown (old rows, nulls) is the site default, the flat $49. */
export function normalizePlan(v: unknown): PartnerPlan {
  return isPartnerPlan(v) ? v : "flat_49";
}

export function cadenceOf(plan: PartnerPlan): BillingCadence {
  return plan === "quarterly_49" || plan === "quarterly_149" ? "quarterly" : "monthly";
}

/** Dollar amounts, no formatting. */
export function planAmounts(plan: PartnerPlan): { growth: number; standard: number } {
  switch (plan) {
    case "ladder":
      return { growth: 49, standard: 199 };
    case "quarterly_49":
      return { growth: 49, standard: 49 };
    case "quarterly_149":
      return { growth: 49, standard: 149 };
    default:
      return { growth: 49, standard: 49 };
  }
}

/** True when the fee changes at month 13 (a third Stripe phase is needed). */
export function hasStep(plan: PartnerPlan): boolean {
  return plan === "ladder" || plan === "quarterly_149";
}

/** Compose the plan from the two admin choices. */
export function planFrom(cadence: BillingCadence, standard: number): PartnerPlan {
  if (cadence === "quarterly") return standard === 149 ? "quarterly_149" : "quarterly_49";
  return standard === 199 ? "ladder" : "flat_49";
}

/** "$49/mo" or "$49 every 3 months", for compact ramps. */
export function priceShort(plan: PartnerPlan, amount: number): string {
  return cadenceOf(plan) === "monthly" ? `$${amount}/mo` : `$${amount} every 3 months`;
}

/** "$49 a month" or "$49 every three months", for prose. */
export function priceProse(plan: PartnerPlan, amount: number): string {
  return cadenceOf(plan) === "monthly" ? `$${amount} a month` : `$${amount} every three months`;
}

export type RampStep = { label: string; price: string; note?: string };

/** The fee steps a partner sees on the sign-up page, billing page and emails. */
export function rampSteps(plan: PartnerPlan): RampStep[] {
  const a = planAmounts(plan);
  const first: RampStep = { label: "Now to month 6", price: cadenceOf(plan) === "monthly" ? "$0/mo" : "$0", note: "Founding waiver, applies automatically" };
  if (hasStep(plan)) {
    return [
      first,
      { label: "Months 7 to 12", price: priceShort(plan, a.growth), note: "Locked launch rate" },
      { label: "Month 13 onward", price: priceShort(plan, a.standard), note: "Standard partner rate" },
    ];
  }
  return [first, { label: "Month 7 onward", price: priceShort(plan, a.growth), note: "Locked launch rate" }];
}

/** Short label for admin lists. */
export function planLabel(plan: PartnerPlan): string {
  switch (plan) {
    case "ladder":
      return "Monthly · $49 then $199";
    case "quarterly_49":
      return "Quarterly · $49";
    case "quarterly_149":
      return "Quarterly · $49 then $149";
    default:
      return "Monthly · $49 flat";
  }
}

/**
 * Agreement wording, section 3 "What it costs" (Lester, 5 Oct 2026).
 * The quarterly text is his verbatim; the monthly text is his two fixes
 * applied to the existing wording.
 */
export function costsParagraph(plan: PartnerPlan): string {
  if (cadenceOf(plan) === "quarterly") {
    return "Your first six months are free, counted from the day you accept. After that, the fee is $49 every three months. From month 13, the fee is the amount shown on your sign-up page, either $49 or $149 every three months. One fee covers every role on this agreement, and your rate is locked while you stay.";
  }
  return "Your first six months are free, counted from the day you accept. After that, the fee is $49 a month. From month 13, the fee is the amount shown on your sign-up page, either $49 or $199 a month. One fee covers every role on this agreement, and your rate is locked while you stay.";
}

/** The referral reward line in Schedule B. */
export function referralLine(plan: PartnerPlan): string {
  if (cadenceOf(plan) === "quarterly") {
    return "For every three practices you bring in as paying members, your next three months are free.";
  }
  return "Every practice you bring in as a paying member takes one month off your fee. Five paying members = six months off.";
}

/** Env var names for the Stripe prices each plan needs. */
export function stripePriceEnvKeys(plan: PartnerPlan): { growth: string; standard: string | null } {
  if (cadenceOf(plan) === "quarterly") {
    return { growth: "STRIPE_PRICE_PARTNER_GROWTH_QUARTERLY", standard: plan === "quarterly_149" ? "STRIPE_PRICE_PARTNER_STANDARD_QUARTERLY" : null };
  }
  return { growth: "STRIPE_PRICE_PARTNER_GROWTH_MONTHLY", standard: plan === "ladder" ? "STRIPE_PRICE_PARTNER_STANDARD_MONTHLY" : null };
}
