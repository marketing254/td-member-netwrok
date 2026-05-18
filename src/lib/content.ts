// Single source of truth for the pre-launch waitlist landing.
// COPY IS VERBATIM from DMN_Website_Content_Guide.docx (May 2026 revision).
// If you change wording here, the doc is the source of truth — update there first.

export const brand = {
  name: "Dental Member Network",
  shortName: "DMN",
  phoneDisplay: "(800) 555-1234",
  phoneTel: "+18005551234",
  email: "founding@dentalmembernetwork.com",
  domain: "dentalmembernetwork.com",
  joinUrl: "#waitlist",
  signInUrl: "#waitlist",
};

export const founding = {
  totalSpots: 100,
  spotsClaimed: 0,
  priceMonthly: 49,
  priceRegular: 199,
  priceAnnual: 490,
  annualNote: "Pay for 10 months, get 12 — save $98/year",
};

// HERO (Section 2 in doc) — verbatim
export const hero = {
  topChip: "FOUNDING MEMBERSHIP — FIRST 100 ONLY",
  headline: "The only network with a human expert on the line for every practice problem.",
  subtitle:
    "Built for US dental practice owners who want fast answers, measurable vendor savings, and a peer room full of operators who have already solved the problem in front of you.",
  bottomNote:
    "No four-figure upsells. No surprise coaching pitches. The membership is the product.",
  proofPoints: [
    { value: "247+", label: "Practice owners in the waitlist" },
  ],
  progressLabel: "of 100 founding spots claimed",
};

// MARQUEE (Section 3 in doc) — 6 badges verbatim
export const marqueeBadges = [
  "24/7 Expert Helpline",
  "Exclusive Partner Discounts",
  "Exclusive Content Library",
  "Proven Systems & SOPs",
  "500+ Practice Owner Network",
  "Vendor Savings Averaging $6K+",
];

// FEATURES (Section 6 in doc) — verbatim
export const featuresSection = {
  eyebrow: "WHAT YOU GET",
  title:
    "Six things you would otherwise hire a consultant, a buyer, and an HR firm to do.",
  subtitle:
    "Bundled into one membership. Built for the operator side of running a practice.",
};

export const features = [
  {
    title: "24/7 Expert Helpline",
    summary:
      "Direct line to business coaches and practice advisors. Every case gets a written summary and a follow-up plan within 3 days.",
    size: "large",
    accent: false,
  },
  {
    title: "Member Directory",
    summary:
      "500+ practice owners, searchable by city, specialty, revenue.",
    size: "regular",
    accent: false,
  },
  {
    title: "Vendor Network",
    summary:
      "Negotiated savings averaging $6,000+ per year.",
    size: "regular",
    accent: false,
  },
  {
    title: "Proven Systems",
    summary:
      "Battle-tested templates, checklists, and SOPs. From HR onboarding to expansion playbooks — the work, already done.",
    size: "regular",
    accent: false,
  },
  {
    title: "Learning Academy",
    summary:
      "Weekly audio, monthly video, live AMAs. Led by practice owners who have actually built what you are trying to build.",
    size: "regular",
    accent: true,
  },
  {
    title: "Quarterly Strategy",
    summary:
      "Premium tier members get a 90-minute review every quarter.",
    size: "large",
    accent: false,
  },
];

// WAITLIST SECTION (Section 10 in doc — replaces free tier) — verbatim
export const waitlist = {
  eyebrow: "JOIN THE WAITLIST",
  headline: "Not ready to join? Get on the list.",
  subtitle:
    "Join the waitlist for early access, exclusive launch pricing, and priority access to founding spots before they fill.",
  benefits: [
    "Early access — be the first to know when new features and vendor deals launch",
    "Exclusive launch pricing — waitlist members get first crack at founding rate",
    "Priority founding access — limited to 100 spots, waitlist members notified first",
    "First notice — new content, partner deals, and expert panel invitations",
  ],
  submitLabel: "Join the Waitlist",
  submittingLabel: "Saving your spot…",
  footerNote:
    "No spam. Just early access, launch updates, and founding-member opportunities.",
};

// CTA FORM (Section 13 in doc) — bottom-of-page founding-team contact form
export const ctaForm = {
  eyebrow: "FOUNDING ACCESS",
  title: "Tell us about your practice.",
  subtitle:
    "Skip the funnel. Tell us what you're working on and we'll match you with the right expert, vendor deal, or peer connection. One business day response, from a real person.",
  responseWindowLabel: "Response window",
  responseWindowValue: "Under 1 business day",
  trustNote: "Encrypted in transit. Never shared.",
  rightTitle: "Send us a note",
  rightSubtitle: "Clear form, real human on the other side.",
  reassurances: [
    "30-day money-back guarantee with no retention call.",
    "We do not store any patient data. Ever.",
    "$49/mo founding rate locked for life — will never increase.",
    "Cancel anytime, in two clicks, from your account page.",
  ],
};

// FAQ (Section 12 in doc) — 10 verbatim Q&As
export const faqSection = {
  eyebrow: "QUESTIONS",
  title: "The honest answers.",
  subtitle: "The questions we get most, answered without sales gloss.",
};

export const faqs = [
  {
    q: "What exactly do I get with my membership?",
    a: "Four core things: (1) a 24/7 expert helpline staffed by business coaches and practice advisors, (2) exclusive partner discounts averaging $6,000+ per year on supplies, labs, equipment, and services, (3) an exclusive content library with recorded expert panels, training, and knowledge resources, and (4) a searchable directory of 500+ practice owners. Plus proven systems, SOPs, and monthly live AMAs with specialists.",
  },
  {
    q: "What is the expert helpline?",
    a: "A direct line to business coaches and practice advisors. Call or message 24/7 with any practice problem — staffing, vendor issues, PPO renegotiation, expansion planning, anything. Every case gets a written summary and a follow-up plan within 3 business days. Median first response is under 2 hours.",
  },
  {
    q: "How do the vendor savings work?",
    a: "We negotiate group rates with suppliers, labs, equipment companies, and service providers on behalf of our members. You get access to the full vendor network as part of your membership — no extra fees, no per-deal commissions. Members save an average of $6,400 in their first year.",
  },
  {
    q: "What is the founding member rate?",
    a: "$49/month, locked for the life of your membership. This rate is only available to the first 100 members. After those spots fill, the standard price is $199/month. There is also an annual option: $490/year (pay for 10 months, get 12 — save $98). Cancel anytime.",
  },
  {
    q: "What if I'm not ready to join yet?",
    a: "Join the waitlist. You'll get early access, exclusive launch pricing, and priority access to founding spots before they fill. No spam — just launch updates and founding-member opportunities.",
  },
  {
    q: "Is this just another dental membership I won't use?",
    a: "The helpline and vendor savings deliver value whether you open the content library or not. Most members call the helpline within their first week and recoup their membership cost through vendor savings within the first quarter. This is an operating tool, not a course you have to finish.",
  },
  {
    q: "What if I'm a solo practitioner?",
    a: "Solo practitioners often get the most value. The helpline replaces the business partner or consultant you don't have. The vendor network delivers savings regardless of practice size. And the member directory connects you with peers who have solved the exact problems you're facing.",
  },
  {
    q: "Can vendors join too?",
    a: "Yes. We have a vendor membership tier for companies that want to be featured in our vendor directory and gain access to our member network. Vendor partners get preferred placement, warm introductions, and co-branded content opportunities. Contact us to apply.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes. 30-day money-back guarantee, no retention call, no hassle. If the membership doesn't deliver value in the first month, we refund in full.",
  },
  {
    q: "Do you store patient data?",
    a: "No. The Dental Member Network is a membership and business services platform. We do not collect, store, or process any patient data. Ever.",
  },
];

// FOOTER (Section 15 in doc)
export const footer = {
  brandDescription:
    "The only network with a human expert on the line for every practice problem. Expert helpline, vendor savings, exclusive content, and 500+ practice owners — all in one membership.",
  primaryCta: "Claim founding spot",
  secondaryCta: "Email founding team",
  supportLabel: "Support",
  responseLabel: "Response standard",
  responseValue: "Human reply in under 1 business day",
  copyright: "© 2026 Dental Member Network. Built for practice owners running real businesses.",
  dataNote:
    "We do not store patient data. The Dental Member Network is a training and education platform.",
};

// FOOTER LINKS (Section 1 in doc) — trimmed to what exists at waitlist stage
export const footerLinks = {
  Network: [
    { label: "What You Get", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Waitlist", href: "#waitlist" },
    { label: "FAQ", href: "#faq" },
  ],
  Legal: [
    { label: "Vendor Partnership Agreement", href: "/agreement/vendor" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
  ],
};

export const navLinks = [
  { label: "What You Get", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Vendor", href: "#waitlist" },
  { label: "Expert", href: "#waitlist" },
  { label: "FAQ", href: "#faq" },
];

// Waitlist form field options (Section 10 in doc)
export const memberRoles = [
  "Practice Owner",
  "Dentist",
  "Office Manager",
  "Associate",
  "DSO Leader",
  "Other",
];

export const locationOptions = ["1", "2–5", "6–10", "11+"];

export const challengeOptions = [
  "Vendor costs",
  "Hiring & retention",
  "Insurance fees",
  "Case acceptance",
  "Marketing",
  "Other",
];

// Expert form options (new role)
export const expertSpecialties = [
  "Practice management",
  "PPO renegotiation & insurance",
  "Marketing & SEO",
  "HR, hiring & team development",
  "Clinical (CE / continuing education)",
  "Finance, accounting & tax",
  "Legal & compliance",
  "M&A, valuations & exits",
  "Operations & scaling",
  "Other",
];

export const expertExperienceLevels = [
  "5–10 years",
  "10–20 years",
  "20+ years",
];

export const expertAvailability = [
  "Helpline only",
  "Helpline + monthly AMA",
  "Helpline + 1:1 sessions",
  "Quarterly strategy reviews",
  "Custom — let's talk",
];

// PRICING (Section 10 in doc) — verbatim
export const pricingSection = {
  eyebrow: "MEMBERSHIP",
  title: "One membership. One price. First 100 lock it for life.",
  subtitle:
    "No tiers to decode, no upsell ladder. The first 100 founding members pay $49/month — locked for the life of their membership. After that, it's $199.",
  bottomNote:
    "30-day money-back guarantee. Cancel anytime. Founding-member rate is locked for the life of your membership — it will never increase.",
};

export const pricing = [
  {
    tier: "Member",
    audience: "Practice owners and dentists",
    price: "$49",
    cadence: "/month, locked for life",
    regularNote: "Regular price will be $199/month after founding spots fill",
    blurb:
      "Full access to every feature in the Dental Member Network. The same membership everyone gets — at a rate that never goes up.",
    features: [
      "24/7 expert helpline — business coaches and practice advisors on call",
      "Exclusive partner discounts — negotiated vendor savings averaging $6,000+/year",
      "Exclusive content library — recorded expert panels, training, and knowledge resources",
      "Member directory — 500+ practice owners searchable by city, specialty, revenue",
      "Proven systems — battle-tested templates, checklists, and SOPs",
      "Monthly live AMAs with specialists",
    ],
    cta: "Claim founding spot",
    ctaHref: "/#waitlist",
    highlight: true,
    role: "member",
  },
  {
    tier: "Vendor Partner",
    audience: "Suppliers, labs, software, services",
    price: "Apply",
    cadence: "Founding cohort: $0 for 12 months",
    blurb:
      "Get featured to our member network. Preferred placement, warm introductions, and direct access to practice owners who are actively buying.",
    features: [
      "Featured listing in the vendor directory",
      "Access to the member network for warm introductions",
      "Inclusion in negotiated deals program",
      "Co-branded content opportunities",
      "Priority placement in new vendor deal announcements",
    ],
    cta: "Apply as vendor partner",
    ctaHref: "/#waitlist",
    highlight: false,
    role: "vendor",
  },
  {
    tier: "Expert",
    audience: "Coaches, consultants, specialists",
    price: "Apply",
    cadence: "Revenue share on member sessions",
    blurb:
      "Join the helpline bench. Take calls and written cases from practice owners in your specialty, host monthly AMAs, and contribute to the content library.",
    features: [
      "Inclusion on the helpline expert bench",
      "Profile in the expert directory members search",
      "Monthly live AMA hosting opportunities",
      "Revenue share on member-paid 1:1 sessions",
      "Co-branded content (recorded panels, written guides)",
    ],
    cta: "Apply as expert",
    ctaHref: "/#waitlist",
    highlight: false,
    role: "expert",
  },
];
