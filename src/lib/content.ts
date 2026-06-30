// Single source of truth for the pre-launch waitlist landing.
// COPY IS VERBATIM from DMN_Website_Content_Guide.docx (May 2026 revision).
// If you change wording here, the doc is the source of truth, update there first.

export const brand = {
  name: "Dental Member Network",
  shortName: "DMN",
  // Ekwa Call Tracking number — every inbound call/SMS to this number is
  // logged with source attribution and forwarded by Ekwa's tracking platform,
  // then notified to the team's Outlook inbox. Do not replace with an
  // untracked direct number; we lose attribution if we do.
  phoneDisplay: "(855) 633-4707",
  phoneTel: "+18556334707",
  email: "hello@joindmn.com",
  domain: "dentalmembernetwork.com",
  joinUrl: "/join",
  signInUrl: "/member/login",
};

export const founding = {
  totalSpots: 100,
  spotsClaimed: 0,
  priceMonthly: 49,
  priceRegular: 199,
  priceAnnual: 490,
  annualNote: "Pay for 10 months, get 12, save $98/year",
};

// HERO (Section 2 in doc), verbatim
export const hero = {
  topChip: "FOUNDING MEMBERSHIP, FIRST 100 ONLY",
  headline: "The only network where every practice problem gets a written action plan in 2–3 business days.",
  subtitle:
    "Built for US dental practice owners who want fast answers, measurable vendor savings, and a peer room full of operators who have already solved the problem in front of you.",
  bottomNote:
    "The membership is the product. No funnels, no “next step” that costs four figures. Just the value you joined for.",
  proofPoints: [
    { value: "247+", label: "Practice owners in the waitlist" },
  ],
  progressLabel: "founding spots claimed",
};

// MARQUEE (Section 3 in doc), 6 badges verbatim
export const marqueeBadges = [
  "Expert Hotline · 2–3 day reply",
  "Exclusive Partner Discounts",
  "Exclusive Content Library",
  "Proven Systems & SOPs",
  "500+ Practice Owner Network",
  "Vendor Savings Averaging $6K+",
];

// FEATURES → "Why This Network Works" (verbatim from index - test.html)
export const featuresSection = {
  eyebrow: "Why This Network Works",
  title: "The difference is curation, not catalog.",
  titleEmphasis: "curation, not catalog.",
  subtitle:
    "Most dental directories are crowded with anyone who paid for a listing. The Dental Member Network is curated, every expert and partner is vetted by the team that hosts Thriving Dentist.",
};

export const features = [
  {
    title: "Vetted Experts",
    summary:
      "Every expert is reviewed before they're listed. Members get coaches who actually deliver, not just anyone with a website.",
    icon: "star",
  },
  {
    title: "Trusted Partners",
    summary:
      "Partners commit to giving members the best deal they offer anywhere. Discounts are real and clearly stated.",
    icon: "check",
  },
  {
    title: "Curated Content",
    summary:
      "Free access to years of podcast, webinar, and panel recordings, plus member rates on every paid expert course.",
    icon: "target",
  },
  {
    title: "Founding Pricing",
    summary:
      "The first 100 founding members lock in $49/month at the founding rate for as long as their membership stays active. Founding rate ends after 20 days or the cap, whichever comes first.",
    icon: "infinity",
  },
];

// WAITLIST SECTION (Section 10 in doc, replaces free tier), verbatim
export const waitlist = {
  eyebrow: "JOIN THE WAITLIST",
  headline: "Not ready to join? Get on the list.",
  subtitle:
    "Join the waitlist for early access, exclusive launch pricing, and priority access to founding spots before they fill.",
  benefits: [
    "Early access, be the first to know when new features and vendor deals launch",
    "Exclusive launch pricing, waitlist members get first crack at founding rate",
    "Priority founding access, limited to 100 spots, waitlist members notified first",
    "First notice, new content, partner deals, and expert panel invitations",
  ],
  submitLabel: "Join the Waitlist",
  submittingLabel: "Saving your spot…",
  footerNote:
    "No spam. Just early access, launch updates, and founding-member opportunities.",
};

// Copy for the WaitlistSection LEFT panel. Members-only; vendors don't use
// the waitlist (they apply directly via /vendor/signup).
export const waitlistByRole = {
  member: {
    eyebrow: "FOUNDING MEMBER",
    headline: "Lock in the $49/month founding rate. First 100 only.",
    subtitle:
      "The waitlist is how we onboard the founding cohort before launch. Get a guaranteed spot, the founding rate, and first access to every feature we ship.",
    benefits: [
      "$49/month founding rate, never increases while your membership stays active",
      "Expert Hotline — written action plan, by text and email, within 2–3 business days",
      "Vendor savings averaging $6,000+/year, no per-deal commissions",
      "Cancel anytime, in two clicks, from your account page",
    ],
  },
};

// CTA FORM (Section 13 in doc), bottom-of-page founding-team contact form
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
    "We do not store any patient data. Ever.",
    "$49/mo founding rate stays as long as your membership is active.",
    "Cancel anytime, in two clicks, from your account page.",
  ],
};

// FAQ (Section 12 in doc), 10 verbatim Q&As
export const faqSection = {
  eyebrow: "QUESTIONS",
  title: "The honest answers.",
  subtitle: "The questions we get most, answered without sales gloss.",
};

export const faqs = [
  {
    q: "What exactly do I get with my membership?",
    a: "Four core things:",
    items: [
      "An Expert Hotline — leave a voicemail with your question, get a written action plan plus the right experts to contact, by text and email, within 2–3 business days.",
      "Exclusive partner discounts averaging $6,000+ per year on supplies, labs, equipment, and services.",
      "An exclusive content library with recorded expert panels, training, and knowledge resources.",
      "DMN exclusive expert podcasts — full-length conversations with the people running the most profitable practices.",
    ],
    aClose: "Plus proven systems, SOPs, and monthly live AMAs with specialists.",
  },
  {
    q: "How do the partner savings work?",
    a: "We negotiate group rates with suppliers, labs, equipment companies, and service providers on behalf of our members. You get access to the full partner network as part of your membership, no extra fees, no per-deal commissions. Members save an average of $6,400 in their first year.",
  },
  {
    q: "What is the founding member rate?",
    a: "$49/month, the founding rate. It never increases for as long as your membership stays active. This rate is only available to the first 100 members. After those spots fill, the standard price is $199/month. There is also an annual option: $490/year (pay for 10 months, get 12, save $98). Cancel anytime.",
  },
  {
    q: "What if I'm not ready to join yet?",
    a: "Honestly, it's rarely about being “not ready” — it's usually about not yet knowing what's actually waiting for you inside. Founding membership locks in $49/month for life, the Expert Hotline turns your hardest practice problems into written action plans in 2–3 days, and our partner network pays for the membership several times over in the first quarter. Join the waitlist if you want to take a closer look first — you'll get launch updates, founding pricing, and a heads-up before spots fill. But the practices that move first are the ones that stop paying the cost of figuring it out alone.",
  },
  {
    q: "Is this just another dental membership I won't use?",
    a: "The helpline and partner savings deliver value whether you open the content library or not. Most members call the helpline within their first week and recoup their membership cost through partner savings within the first quarter. This is an operating tool, not a course you have to finish.",
  },
  {
    q: "What if I'm a solo practitioner?",
    a: "Solo practitioners often get the most value. The helpline replaces the business partner or consultant you don't have. The partner network delivers savings regardless of practice size. And the member directory connects you with experts and partners who have solved the exact problems you're facing.",
  },
  {
    q: "Can partners join too?",
    a: "Yes. We have a partner membership tier for companies that want to be featured in our partner directory and gain access to our member network. Partners get preferred placement, warm introductions, and co-branded content opportunities. Contact us to apply.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel in two clicks from your account page. No retention call, no hassle, no minimum term. Your founding rate stays locked for as long as your membership is active.",
  },
  {
    q: "Do you store patient data?",
    a: "No. The Dental Member Network is a membership and business services platform. We do not collect, store, or process any patient data. Ever.",
  },
];

// FOOTER (Section 15 in doc)
export const footer = {
  brandDescription:
    "The Expert Hotline answers every practice problem with a written action plan in 2–3 business days. Plus exclusive partner discounts, a curated resource library, and a community of Experts and Partners at your fingertips.",
  primaryCta: "Claim founding spot",
  secondaryCta: "Email founding team",
  supportLabel: "Support",
  responseLabel: "Response standard",
  responseValue: "Human reply in under 1 business day",
  copyright: "Â© 2026 Dental Member Network. Built for practice owners running real businesses.",
  dataNote:
    "We do not store patient data. The Dental Member Network is a training and education platform.",
};

// FOOTER LINKS (Section 1 in doc), trimmed to what exists at waitlist stage
export const footerLinks = {
  Network: [
    { label: "What is DMN?", href: "#features" },
    { label: "Resources", href: "/resources" },
    { label: "Experts", href: "/experts" },
    { label: "Partners", href: "/partners" },
    { label: "Reviews", href: "/reviews" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Agreements: [
    { label: "Member Agreement", href: "/agreement/member" },
    { label: "Partner Agreement", href: "/agreement/vendor" },
  ],
  Legal: [
    { label: "Cancellation Policy", href: "/legal/refund" },
    { label: "Privacy Policy", href: "/legal/privacy" },
  ],
};

export const navLinks = [
  { label: "What is DMN", href: "#features" },
  { label: "Resources", href: "/resources" },
  { label: "Experts", href: "/experts" },
  { label: "Partners", href: "/partners" },
  { label: "Reviews", href: "/reviews" },
  { label: "Pricing", href: "/pricing" },
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

// PRICING (Section 10 in doc), verbatim
export const pricingSection = {
  eyebrow: "MEMBERSHIP",
  title: "One membership. One price. First 100 get the founding rate.",
  subtitle:
    "No tiers to decode, no upsell ladder. The first 100 founding members pay $49/month, locked at that rate for as long as their membership stays active. After that, it's $199.",
  bottomNote:
    "Cancel anytime, in two clicks. Founding-member rate stays as long as your membership is active.",
};

export const pricing = [
  {
    tier: "Member",
    audience: "Practice owners and dentists",
    price: "$49",
    cadence: "/month, founding rate",
    regularNote: "Regular price will be $199/month after founding spots fill",
    blurb:
      "Full access to every feature in the Dental Member Network. The same membership everyone gets, at a rate that never goes up.",
    features: [
      "Expert Hotline — written action plan from business coaches and practice advisors within 2–3 business days",
      "Exclusive partner discounts, negotiated vendor savings averaging $6,000+/year",
      "Exclusive content library, recorded expert panels, training, and knowledge resources",
      "Member directory,500+ practice owners searchable by city, specialty, revenue",
      "Proven systems, battle-tested templates, checklists, and SOPs",
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
    cadence: "Founding cohort: $0 for 6 months, $49/mo months 7-12, then $199/mo",
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
];

// FOUNDING TEAM — for the "Founded by the team behind Thriving Dentist" section
// Bios distilled from the DMN content guide (the experts on the helpline).
export const foundingTeamSection = {
  eyebrow: "FOUNDING TEAM",
  title: "Founded by the team behind Thriving Dentist.",
  subtitle:
    "Every expert, vendor, and resource is vetted by Gary, Naren, and the Thriving Dentist team — not by an algorithm and not by a marketing department.",
};

export const foundingTeam = [
  {
    initials: "GT",
    photo: "/team/gary-takacs.jpg",
    name: "Gary Takacs",
    role: "Founder, Thriving Dentist",
    blurb: "2,200+ practices coached over 30+ years. Host of the Thriving Dentist Show.",
    color: "#163357",
  },
  {
    initials: "NA",
    photo: "/team/naren-arulrajah.jpg",
    name: "Naren Arulrajah",
    role: "Founder & CEO, Ekwa Marketing",
    blurb: "Co-host, Less Insurance Dependent. Author of the FFS conversion playbook.",
    color: "#A07823",
  },
];

// POWERED BY — the connected communities behind DMN. Files in /public.
// Used on the /experts page as a medium-size carousel under the founders.
// Renamed from `asHeardOn` to reflect the new positioning.
export const poweredBy = [
  { name: "Thriving Dentist Show", logo: "/td-logo.png", host: "Gary Takacs" },
  { name: "Less Insurance Dependence", logo: "/lid-logo.png", host: "Naren Arulrajah" },
  { name: "Insurance Untangled", logo: "/iu-logo.png", host: "Industry panel" },
  { name: "RIDA Academy", logo: "/rida-logo.png", host: "Clinical & operational training" },
  { name: "Dental Marketing Society", logo: "/dms-logo.png", host: "Community partner" },
  { name: "Dental Growth Network", logo: "/DGN-logo.png", host: "Growth network" },
];

// MEMBER LIBRARY PREVIEW — the colorful topic cards shown inside the member portal
// Distilled from the doc Appendix B launch library (the 10 modules across 4 tracks).
export const libraryPreviewSection = {
  eyebrow: "A LOOK INSIDE THE MEMBER LIBRARY",
  title: "What you actually see after you sign in.",
  subtitle:
    "Practice management, marketing, team training, and insurance independence — taught by the operators who built it. Plus the helpline, the vendor savings ledger, and the directory of 500+ practice owners.",
};

// Library topics — single-presenter, single-palette (on-brand navy) for a
// professional, calm UI inside the member portal preview. `kind` maps each
// card to a topic-specific icon used as the still-frame graphic inside its
// video thumbnail.
export type LibraryTopicKind =
  | "kpi"
  | "ppo"
  | "seo"
  | "patient"
  | "book"
  | "huddle"
  | "reviews"
  | "photos";

export const libraryTopics: {
  title: string;
  track: string;
  duration: string;
  kind: LibraryTopicKind;
}[] = [
  { title: "9 KPIs that drive your practice", track: "Practice Management", duration: "47 min", kind: "kpi" },
  { title: "Negotiating better PPO fees", track: "Insurance Independence", duration: "58 min", kind: "ppo" },
  { title: "SEO & Google rankings", track: "Marketing & Growth", duration: "52 min", kind: "seo" },
  { title: "The patient experience", track: "Team Training", duration: "33 min", kind: "patient" },
  { title: "Book studies: Influence", track: "Mindset & Growth", duration: "Monthly", kind: "book" },
  { title: "Morning huddle playbook", track: "Practice Management", duration: "28 min", kind: "huddle" },
  { title: "Reviews & online reputation", track: "Marketing & Growth", duration: "44 min", kind: "reviews" },
  { title: "Case acceptance with photos", track: "Practice Management", duration: "42 min", kind: "photos" },
];

// All resources are presented by Gary Takacs at launch.
export const libraryPresenter = {
  name: "Gary Takacs",
  initials: "GT",
};

// Portal nav items shown in the preview mock
export const portalNavItems = [
  { label: "Helpline", badge: "2hr" },
  { label: "Library", badge: "Live" },
  { label: "Vendor Deals", badge: "$6.4K" },
  { label: "Directory", badge: "500+" },
  { label: "Live AMAs", badge: "Monthly" },
];

