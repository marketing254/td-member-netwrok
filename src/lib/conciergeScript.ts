/**
 * Concierge script — the option tree shown in MemberAssistant.
 *
 * Each node has:
 *   - id        unique key
 *   - reply     what the bot says
 *   - options   buttons the member can click. Each option can either link
 *               (deep-link to a portal page) or branch to another node.
 *
 * Adding a new branch: drop a new entry in NODES and reference it via
 * `next: "<id>"` on an option somewhere. The bot resets to "root" if a
 * branch is missing.
 */

export type ConciergeOption = {
  label: string;
  /** Deep-link the user away. Renders as a "View →" pill. */
  href?: string;
  /** Branch to another node id in the same tree. */
  next?: string;
  /** Optional flag tone — gold for the lead CTA in a branch. */
  tone?: "primary" | "default";
};

export type ConciergeNode = {
  id: string;
  reply: string;
  options: ConciergeOption[];
};

export const CONCIERGE_NODES: Record<string, ConciergeNode> = {
  root: {
    id: "root",
    reply:
      "Hi! I'm your portal Concierge. Pick what you'd like to do and I'll point you at the right place.",
    options: [
      { label: "Find a resource", next: "resources", tone: "primary" },
      { label: "Talk to an expert", next: "experts" },
      { label: "Use a partner deal", next: "partners" },
      { label: "Manage my membership", next: "billing" },
      { label: "I have a question for the team", next: "support" },
    ],
  },

  // ─── Resources ──────────────────────────────────────────────────────
  resources: {
    id: "resources",
    reply:
      "The Library has every published kit — training videos, action guides, checklists, slide decks. What are you looking for?",
    options: [
      { label: "Browse the whole library", href: "/dashboard/resources", tone: "primary" },
      { label: "Filter by an expert", href: "/dashboard/experts" },
      { label: "Continue where I left off", href: "/dashboard" },
      { label: "Show me a Book Club kit", next: "bookclub" },
      { label: "Back", next: "root" },
    ],
  },
  bookclub: {
    id: "bookclub",
    reply:
      "Book Club kits are designed to be read alongside the book — a training video, named key principles as 9×16 shorts, plus a study guide, discussion questions, and an infographic.",
    options: [
      { label: "Open the Library and filter by Book Club", href: "/dashboard/resources", tone: "primary" },
      { label: "Back", next: "resources" },
    ],
  },

  // ─── Experts ────────────────────────────────────────────────────────
  experts: {
    id: "experts",
    reply:
      "You can browse experts as a directory, or ask the team to route you to the right one through the Hotline.",
    options: [
      { label: "Browse experts", href: "/dashboard/experts", tone: "primary" },
      { label: "Open the Hotline", href: "tel:+18556334707" },
      { label: "Email the team", href: "mailto:hello@joindmn.com" },
      { label: "Back", next: "root" },
    ],
  },

  // ─── Partners (vendor deals) ────────────────────────────────────────
  partners: {
    id: "partners",
    reply:
      "Members get exclusive partner discounts — software, supplies, marketing, training. Most savings come through the partner network.",
    options: [
      { label: "How does a discount work?", next: "partner_how" },
      { label: "Browse partners", href: "/dashboard/resources", tone: "primary" },
      { label: "Back", next: "root" },
    ],
  },
  partner_how: {
    id: "partner_how",
    reply:
      "Pick a partner, request the discount, and we forward your details to them so you skip the funnel. Most deals are stackable with existing partnerships; no per-deal commissions to DMN.",
    options: [
      { label: "Got it — browse partners", href: "/dashboard/resources", tone: "primary" },
      { label: "Back", next: "partners" },
    ],
  },

  // ─── Billing ────────────────────────────────────────────────────────
  billing: {
    id: "billing",
    reply:
      "Your billing, plan, invoices, and payment method live on the Account page.",
    options: [
      { label: "Open my account", href: "/dashboard/account", tone: "primary" },
      { label: "How do I cancel?", next: "cancel" },
      { label: "Refund policy", href: "/legal/refund" },
      { label: "Back", next: "root" },
    ],
  },
  cancel: {
    id: "cancel",
    reply:
      "You can cancel in two clicks from the Account page — Manage subscription → Cancel. No retention call. Your founding rate stays locked while you're a member; once you cancel, it's released.",
    options: [
      { label: "Open Account", href: "/dashboard/account", tone: "primary" },
      { label: "Back", next: "billing" },
    ],
  },

  // ─── Support ────────────────────────────────────────────────────────
  support: {
    id: "support",
    reply:
      "Three ways to reach the team. Pick whichever's easiest.",
    options: [
      { label: "Hotline — (855) 633-4707", href: "tel:+18556334707", tone: "primary" },
      { label: "Email hello@joindmn.com", href: "mailto:hello@joindmn.com" },
      { label: "Submit a written question", next: "written" },
      { label: "Back", next: "root" },
    ],
  },
  written: {
    id: "written",
    reply:
      "Open an inquiry on any resource page and the team will reply in 2–3 business days. Your inquiry shows up in your dashboard once we respond.",
    options: [
      { label: "Open the Library", href: "/dashboard/resources", tone: "primary" },
      { label: "Back", next: "support" },
    ],
  },
};

export const CONCIERGE_ROOT = CONCIERGE_NODES.root!;
