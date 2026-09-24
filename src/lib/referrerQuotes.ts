/**
 * "Why we built this" quotes on the referral join page.
 *
 * Keyed by the referrer's display name exactly as it resolves from their
 * expert/partner record (lib/referralContext). A referrer with no entry
 * here simply gets no quote block. Wording comes from the referrer's own
 * invitation email; if they send a change, edit the text here and nothing
 * else.
 */
export type ReferrerQuote = {
  quote: string;
  role: string;
};

export const REFERRER_QUOTES: Record<string, ReferrerQuote> = {
  // Drafted from Gary's own directory bio, 24 September 2026. Replace with
  // his approved wording when it arrives.
  "Gary Takacs": {
    quote:
      "I started coaching because I believed dentists deserved better. After 42 years and more than 2,200 practices, that belief has not changed. The Dental Member Network is where the systems, the people and the answers a practice needs sit in one place, so you are never solving a problem on your own. Your first three months are on me.",
    role: "Founder, Thriving Dentist. Host of the Thriving Dentist Show.",
  },
  "Naren Arulrajah": {
    quote:
      "Working with dental practices, I see how often an owner or a team member has a question and no obvious place to take it. A staffing problem, a process that leaks money, a decision about growing. We built the Dental Member Network to be that place: one dependable spot for practical answers, useful tools, and people who can actually help. Your first six months are on me.",
    role: "CEO, Ekwa Marketing. Host of the Less Insurance Dependence podcast.",
  },
};

export function quoteFor(name: string | null | undefined): ReferrerQuote | null {
  if (!name) return null;
  return REFERRER_QUOTES[name.trim()] ?? null;
}
