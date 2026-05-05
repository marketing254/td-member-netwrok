// Single source of truth for landing page copy. Swap brand name, pricing, and
// numbers here — all sections read from this file.

export const brand = {
  name: "Thriving Dentist Network",
  shortName: "TD Network",
  phoneDisplay: "1-212-DPN-HELP",
  phoneTel: "+12123764357",
  email: "hello@thrivingdentist.com",
  domain: "thrivingdentist.com",
  joinUrl: "/signup",
  signInUrl: "/signin",
};

export const founding = {
  totalSpots: 1000,
  spotsClaimed: 247,
  priceMonthly: 49,
};

export const sla = [
  { stat: "2 hrs", label: "First response", detail: "Business hours, 7 days a week" },
  { stat: "1 day", label: "Expert match", detail: "Routed to the right specialist" },
  { stat: "3 days", label: "Case summary", detail: "Written recap + recommended next steps" },
];

export const cadence = [
  { count: "4", unit: "audio episodes", note: "One every Tuesday" },
  { count: "1", unit: "video deep-dive", note: "Monthly long-form analysis" },
  { count: "1", unit: "live AMA", note: "With invited specialists" },
  { count: "4+", unit: "vendor deals", note: "New offers every week" },
];

export const features = [
  {
    title: "24/7 Expert Hotline",
    summary:
      "Direct line to business coaches and practice advisors. Every case gets a written summary and follow-up plan.",
    icon: "phone",
  },
  {
    title: "Proven Systems",
    summary:
      "Battle-tested templates, checklists, and SOPs. From HR onboarding to expansion playbooks — the work, already done.",
    icon: "systems",
  },
  {
    title: "Exclusive Vendor Network",
    summary:
      "Negotiated partnerships with top vendors that save the average member $6,000+ per year on supplies and software.",
    icon: "handshake",
  },
  {
    title: "Learning Academy",
    summary:
      "Weekly audio, monthly video, live AMAs. Led by practice owners who have actually built what you're trying to build.",
    icon: "library",
  },
  {
    title: "Member Directory",
    summary:
      "Connect directly with 500+ practices for referrals, hiring, peer review, and accountability partners.",
    icon: "people",
  },
  {
    title: "Quarterly Strategy",
    summary:
      "Premium-tier members get a 90-minute business review every quarter. Real planning, not feel-good coaching.",
    icon: "target",
  },
];

export const testimonials = [
  {
    initials: "DW",
    name: "Dr. Diana Walsh",
    practice: "Practice Owner · Chicago, IL",
    quote:
      "The hotline alone has saved us over $150K in bad decisions. The team's guidance was invaluable when we were planning our expansion.",
  },
  {
    initials: "MC",
    name: "Dr. Marcus Chen",
    practice: "Practice Owner · San Francisco, CA",
    quote:
      "Found amazing team members through the directory. The templates cut our HR setup time by 50%. Best investment we've made in the practice.",
  },
  {
    initials: "ST",
    name: "Dr. Sarah Thompson",
    practice: "Practice Owner · Boston, MA",
    quote:
      "The vendor partnerships saved $40K in year one alone. The coaching helped us systemize everything. Membership pays for itself in months.",
  },
];

export const pricing = [
  {
    tier: "Free",
    price: "$0",
    cadence: "Forever",
    blurb: "A taste of the network. Limited to public-facing assets.",
    features: [
      "Public podcast feed",
      "2 free practice playbooks",
      "Waitlist for paid tiers",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    tier: "Founding",
    price: "$49",
    cadence: "/month, locked for life",
    blurb: "First 1,000 owners only. Full access at the lowest price we will ever offer.",
    features: [
      "Everything in Pro",
      "Founding-member badge",
      "Direct line to product team",
      "Lifetime $49 on the current product",
    ],
    cta: "Claim founding spot",
    highlight: true,
  },
  {
    tier: "Pro",
    price: "$199",
    cadence: "/month",
    blurb: "Everything you need to run, hire, buy, and grow.",
    features: [
      "24/7 hotline access",
      "Vendor savings network",
      "Member directory",
      "Full library + weekly content",
      "Live AMAs",
    ],
    cta: "Start Pro",
    highlight: false,
  },
  {
    tier: "Premium",
    price: "$499",
    cadence: "/month",
    blurb: "Pro, plus 1:1 coaching and quarterly strategy.",
    features: [
      "Everything in Pro",
      "1:1 coaching, twice a month",
      "Quarterly strategy review (90 min)",
      "Priority hotline routing",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

export const faqs = [
  {
    q: "Is this just a funnel into expensive coaching?",
    a: "No. The membership is the product. There are no four-figure upsells, no surprise pitches, no 'now let me tell you about our $25K mastermind.' Premium tier ($499) bundles 1:1 coaching transparently — that's the only coaching we sell.",
  },
  {
    q: "What does 'founding member, lifetime $49' actually mean?",
    a: "Your $49/month rate is locked for the life of the current product. You will never be moved to the $199 tier. If we launch new products in the future (e.g. an enterprise tier), those are not grandfathered — but everything you signed up for stays $49 forever.",
  },
  {
    q: "What is your refund policy?",
    a: "30 days, no questions asked. If the network is not earning its keep, email us and we refund the full month. No retention call, no friction.",
  },
  {
    q: "How fast does the hotline actually respond?",
    a: "Two business hours for first response. One business day to be matched with the right specialist. Three business days for a written case summary with recommended next steps. We publish this SLA because we measure it.",
  },
  {
    q: "Do I need to be a current Thriving Dentist listener?",
    a: "No. Many members come from the podcast, but the network stands on its own. You will get more out of it if you are a practice owner or operator — that is the room we are building.",
  },
  {
    q: "What is NOT included?",
    a: "Patient marketing services, clinical CE, and anything that requires us to handle protected health information. We deliberately do not store patient data. The network is for the owner-operator side of running a practice.",
  },
];

export const footerLinks = {
  Members: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Stories", href: "#stories" },
    { label: "FAQ", href: "#faq" },
    { label: "Member sign in", href: brand.signInUrl },
    { label: "Become a member", href: brand.joinUrl },
  ],
  Vendors: [
    { label: "Why partner", href: "/partners" },
    { label: "Partner pricing", href: "/partners/pricing" },
    { label: "Apply now", href: "/vendor/signup" },
    { label: "Partner sign in", href: "/vendor" },
  ],
  Contact: [
    { label: brand.email, href: `mailto:${brand.email}` },
    { label: brand.phoneDisplay, href: `tel:${brand.phoneTel}` },
    { label: "Member workspace", href: "#preview" },
    { label: "Private intake", href: "#apply" },
  ],
};

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Stories", href: "#stories" },
  { label: "FAQ", href: "#faq" },
];
