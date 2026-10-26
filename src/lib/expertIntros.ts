/**
 * Expert introductions opt-in (Lester, Oct 2026).
 *
 * Members can tick a box on the join form asking the team to introduce
 * them to experts who can help with what they joined for. The team sends
 * the introductions by hand; the site only records the answer, lets the
 * member change it in account settings, and reports the new yeses daily.
 *
 * Switched OFF until the privacy wording is live: set
 * NEXT_PUBLIC_EXPERT_INTROS_ENABLED=true in Vercel to show the box and the
 * account toggle. The daily report runs regardless (it only emails when
 * someone has said yes). Safe to import from client components.
 */
export const EXPERT_INTROS_ENABLED = process.env.NEXT_PUBLIC_EXPERT_INTROS_ENABLED === "true";

/** Join-form tick box, exactly as Lester wrote it. Unticked by default. */
export const EXPERT_INTROS_LABEL = "Yes, introduce me to experts who can help with this.";

/** Account settings row. */
export const EXPERT_INTROS_SETTING_LABEL = "Introductions to experts";
export const EXPERT_INTROS_SETTING_HELP = "We introduce you to experts who can help with what you joined for.";

/** Who gets the daily list of members who said yes. */
export const EXPERT_INTROS_REPORT_TO = process.env.EXPERT_INTROS_REPORT_TO ?? "lester@dentalmembernetwork.com";
