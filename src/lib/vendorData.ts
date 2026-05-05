// Sample data for the vendor portal + admin panel prototype.
// Mirror of memberData.ts but for the vendor side and the admin side.

export type VendorPlanId = "founding" | "standard" | "annual";

export type VendorPlan = {
  id: VendorPlanId;
  name: string;
  priceLabel: string;
  cadenceLabel: string;
  blurb: string;
  features: string[];
  highlight: boolean;
  ctaLabel: string;
  badge?: string;
};

export const vendorPlans: VendorPlan[] = [
  {
    id: "founding",
    name: "Founding Partner",
    priceLabel: "$0",
    cadenceLabel: "for 6 months · then $49/mo for months 7–12",
    blurb:
      "Limited to a fixed number of vendors per category. Six months free, six months at $49, then standard $199. Founding badge in the directory launch announcement.",
    features: [
      "Months 1–6: $0 waiver",
      "Months 7–12: $49/mo locked",
      "Month 13+: $199/mo standard rate",
      "Priority placement in launch announcement",
      "Featured Partner benefits (Schedule A)",
      "Verified Partner badge",
    ],
    highlight: true,
    ctaLabel: "Apply for Founding",
    badge: "LIMITED · LAUNCH PROGRAM",
  },
  {
    id: "standard",
    name: "Featured Partner",
    priceLabel: "$199",
    cadenceLabel: "/month, billed monthly",
    blurb:
      "Full Featured Partner tier with enhanced directory listing, priority category placement, quarterly newsletter mentions, dedicated email, and lead dashboard access.",
    features: [
      "Enhanced directory listing",
      "Priority placement within category",
      "Quarterly newsletter mentions",
      "1 dedicated email to members per year",
      "Eligible for podcast / webinar features",
      "Full lead dashboard access",
      "Verified Partner badge",
    ],
    highlight: false,
    ctaLabel: "Become a Partner",
  },
  {
    id: "annual",
    name: "Annual Pre-Pay",
    priceLabel: "$1,990",
    cadenceLabel: "/year · 12 months for the price of 10",
    blurb:
      "Pre-pay 12 months upfront, get 2 months free (≈17% savings). Same Featured Partner benefits, locked-in for 12 months.",
    features: [
      "All Featured Partner benefits",
      "$1,990 / year ($165.83 effective monthly)",
      "Save ~$398 vs monthly",
      "Locked rate for 12 months",
      "Annual renewal terms apply",
    ],
    highlight: false,
    ctaLabel: "Save with Annual",
  },
];

export const vendorCategories = [
  "Dental Supplies",
  "Practice Management Software",
  "Membership Plan Software",
  "Digital Marketing",
  "Hiring / HR / Payroll",
  "Insurance (Malpractice + Business)",
  "CPA / Bookkeeping",
  "Practice Financing / Equipment Lending",
  "Legal / Attorney",
  "Equipment / Imaging / Handpieces",
  "CE / CME Providers",
  "Real Estate / Practice Brokers",
] as const;

export type VendorCategory = (typeof vendorCategories)[number];

export type DiscountMechanic = "promo_code" | "affiliate_link" | "portal_redemption" | "manual_verification";

// Sample logged-in vendor for the prototype
export const vendor = {
  id: "v_001",
  companyName: "Henry Schein Dental",
  displayName: "Henry Schein",
  category: "Dental Supplies" as VendorCategory,
  website: "https://www.henryschein.com",
  description:
    "Largest distributor of dental supplies and equipment in North America. Stack TDN's negotiated rate on top of any existing volume rebate program.",
  contactName: "Marcus Reilly",
  contactEmail: "marcus.reilly@henryschein.com",
  contactPhone: "+1 (212) 555-0184",
  billingEmail: "ap@henryschein.com",
  status: "active" as "pending" | "active" | "suspended",
  agreementSignedAt: "2026-04-24",
  agreementVersion: "v1.0",
  planId: "founding" as VendorPlanId,
  monthsInProgram: 2,
  commissionRate: 0,
  payoutMethod: "ACH",
  joinedAt: "2026-04-24",
  avatarInitials: "HS",
  verified: true,
};

export type VendorOfferStatus = "draft" | "pending_review" | "published" | "paused" | "rejected";

export type VendorOfferRow = {
  id: string;
  title: string;
  code: string;
  mechanic: DiscountMechanic;
  discountLabel: string;
  status: VendorOfferStatus;
  redemptions: number;
  savingsDeliveredYtd: number;
  expiresOn: string;
  createdOn: string;
  reviewerNote?: string;
};

export const vendorOwnOffers: VendorOfferRow[] = [
  {
    id: "off_001",
    title: "12% off recurring orders",
    code: "TDN-HSDN-12",
    mechanic: "promo_code",
    discountLabel: "12% off",
    status: "published",
    redemptions: 47,
    savingsDeliveredYtd: 18420,
    expiresOn: "2026-12-31",
    createdOn: "2026-04-24",
  },
  {
    id: "off_002",
    title: "Free 1st-month autoship setup",
    code: "TDN-HSDN-AS",
    mechanic: "manual_verification",
    discountLabel: "Setup waived",
    status: "published",
    redemptions: 12,
    savingsDeliveredYtd: 1440,
    expiresOn: "2026-09-30",
    createdOn: "2026-04-24",
  },
  {
    id: "off_003",
    title: "Premium tier members — 18% off",
    code: "TDN-HSDN-PRM",
    mechanic: "promo_code",
    discountLabel: "18% off",
    status: "pending_review",
    redemptions: 0,
    savingsDeliveredYtd: 0,
    expiresOn: "2026-12-31",
    createdOn: "2026-05-02",
    reviewerNote: "Awaiting Reshani's approval — submitted 2 days ago.",
  },
  {
    id: "off_004",
    title: "Black Friday flash — 22% off (3 days)",
    code: "TDN-HSDN-BF",
    mechanic: "promo_code",
    discountLabel: "22% off",
    status: "draft",
    redemptions: 0,
    savingsDeliveredYtd: 0,
    expiresOn: "2026-11-30",
    createdOn: "2026-05-04",
  },
];

// Recent member redemptions (vendor-side view, anonymized to first name + city)
export type RedemptionRow = {
  id: string;
  offerId: string;
  offerTitle: string;
  memberDisplay: string;
  city: string;
  redeemedOn: string;
  amountSaved: number;
  commissionAccrued: number;
};

export const vendorRedemptions: RedemptionRow[] = [
  {
    id: "rd_2026_05_03_1",
    offerId: "off_001",
    offerTitle: "12% off recurring orders",
    memberDisplay: "Dr. Marcus C.",
    city: "San Francisco, CA",
    redeemedOn: "May 03, 2026",
    amountSaved: 214,
    commissionAccrued: 0,
  },
  {
    id: "rd_2026_05_02_1",
    offerId: "off_001",
    offerTitle: "12% off recurring orders",
    memberDisplay: "Dr. Sarah T.",
    city: "Boston, MA",
    redeemedOn: "May 02, 2026",
    amountSaved: 388,
    commissionAccrued: 0,
  },
  {
    id: "rd_2026_05_01_1",
    offerId: "off_002",
    offerTitle: "Free 1st-month autoship setup",
    memberDisplay: "Dr. Diana W.",
    city: "Chicago, IL",
    redeemedOn: "May 01, 2026",
    amountSaved: 120,
    commissionAccrued: 0,
  },
  {
    id: "rd_2026_04_28_1",
    offerId: "off_001",
    offerTitle: "12% off recurring orders",
    memberDisplay: "Dr. Allen P.",
    city: "Austin, TX",
    redeemedOn: "Apr 28, 2026",
    amountSaved: 502,
    commissionAccrued: 0,
  },
  {
    id: "rd_2026_04_25_1",
    offerId: "off_001",
    offerTitle: "12% off recurring orders",
    memberDisplay: "Dr. Hannah K.",
    city: "Portland, OR",
    redeemedOn: "Apr 25, 2026",
    amountSaved: 178,
    commissionAccrued: 0,
  },
];

// Aggregate KPIs for the vendor overview
export const vendorKpis = {
  redemptionsThisMonth: 18,
  redemptionsLifetime: 59,
  savingsDeliveredMonth: 4840,
  savingsDeliveredLifetime: 19860,
  leadsThisMonth: 7,
  pendingOffersCount: 1,
};

// =====================================================================
// ADMIN PANEL DATA
// =====================================================================

export type AdminMemberRow = {
  id: string;
  name: string;
  email: string;
  practice: string;
  city: string;
  tier: "Founding" | "Pro" | "Premium" | "Free";
  founding: boolean;
  joinedOn: string;
  status: "active" | "trial" | "past_due" | "canceled";
  hotlineCases: number;
  ceCredits: number;
};

export const adminMembers: AdminMemberRow[] = [
  {
    id: "m_001",
    name: "Dr. Marcus Chen",
    email: "marcus.chen@bayareafamilydental.com",
    practice: "Bay Area Family Dental",
    city: "San Francisco, CA",
    tier: "Founding",
    founding: true,
    joinedOn: "Mar 15, 2026",
    status: "active",
    hotlineCases: 1,
    ceCredits: 11.5,
  },
  {
    id: "m_002",
    name: "Dr. Diana Walsh",
    email: "diana@walshdental.com",
    practice: "Walsh Family Dentistry",
    city: "Chicago, IL",
    tier: "Founding",
    founding: true,
    joinedOn: "Mar 18, 2026",
    status: "active",
    hotlineCases: 3,
    ceCredits: 18.0,
  },
  {
    id: "m_003",
    name: "Dr. Sarah Thompson",
    email: "sarah@thompsondds.com",
    practice: "Thompson Dental Care",
    city: "Boston, MA",
    tier: "Founding",
    founding: true,
    joinedOn: "Mar 22, 2026",
    status: "active",
    hotlineCases: 0,
    ceCredits: 6.5,
  },
  {
    id: "m_004",
    name: "Dr. Allen Park",
    email: "allen.park@parkfamilydental.com",
    practice: "Park Family Dental",
    city: "Austin, TX",
    tier: "Pro",
    founding: false,
    joinedOn: "Apr 02, 2026",
    status: "active",
    hotlineCases: 2,
    ceCredits: 8.0,
  },
  {
    id: "m_005",
    name: "Dr. Hannah Kim",
    email: "hannah@kimdental.com",
    practice: "Kim Dental Group",
    city: "Portland, OR",
    tier: "Premium",
    founding: false,
    joinedOn: "Apr 12, 2026",
    status: "active",
    hotlineCases: 4,
    ceCredits: 22.0,
  },
  {
    id: "m_006",
    name: "Dr. Roberto Diaz",
    email: "rdiaz@diazfamilydds.com",
    practice: "Diaz Family DDS",
    city: "Miami, FL",
    tier: "Founding",
    founding: true,
    joinedOn: "Apr 28, 2026",
    status: "trial",
    hotlineCases: 0,
    ceCredits: 0.5,
  },
];

export type AdminVendorRow = {
  id: string;
  companyName: string;
  category: VendorCategory;
  status: "pending" | "active" | "suspended";
  contactName: string;
  contactEmail: string;
  planId: VendorPlanId;
  redemptionsLifetime: number;
  commissionAccrued: number;
  agreementSignedAt: string | null;
  appliedOn: string;
};

export const adminVendors: AdminVendorRow[] = [
  {
    id: "v_001",
    companyName: "Henry Schein Dental",
    category: "Dental Supplies",
    status: "active",
    contactName: "Marcus Reilly",
    contactEmail: "marcus.reilly@henryschein.com",
    planId: "founding",
    redemptionsLifetime: 59,
    commissionAccrued: 0,
    agreementSignedAt: "2026-04-24",
    appliedOn: "2026-04-22",
  },
  {
    id: "v_002",
    companyName: "Weave",
    category: "Practice Management Software",
    status: "active",
    contactName: "Eleanor Davis",
    contactEmail: "eleanor@getweave.com",
    planId: "founding",
    redemptionsLifetime: 31,
    commissionAccrued: 1620,
    agreementSignedAt: "2026-04-26",
    appliedOn: "2026-04-25",
  },
  {
    id: "v_003",
    companyName: "Patterson Dental",
    category: "Equipment / Imaging / Handpieces",
    status: "active",
    contactName: "James Patel",
    contactEmail: "j.patel@pattersondental.com",
    planId: "standard",
    redemptionsLifetime: 8,
    commissionAccrued: 320,
    agreementSignedAt: "2026-05-01",
    appliedOn: "2026-04-30",
  },
  {
    id: "v_004",
    companyName: "CareStack",
    category: "Practice Management Software",
    status: "pending",
    contactName: "Priya Sharma",
    contactEmail: "priya@carestack.com",
    planId: "founding",
    redemptionsLifetime: 0,
    commissionAccrued: 0,
    agreementSignedAt: null,
    appliedOn: "2026-05-04",
  },
  {
    id: "v_005",
    companyName: "Yapi",
    category: "Practice Management Software",
    status: "pending",
    contactName: "Tom Boyle",
    contactEmail: "tom@yapiapp.com",
    planId: "standard",
    redemptionsLifetime: 0,
    commissionAccrued: 0,
    agreementSignedAt: null,
    appliedOn: "2026-05-04",
  },
  {
    id: "v_006",
    companyName: "Practice-Web",
    category: "Digital Marketing",
    status: "pending",
    contactName: "Anita Vega",
    contactEmail: "avega@practice-web.com",
    planId: "annual",
    redemptionsLifetime: 0,
    commissionAccrued: 0,
    agreementSignedAt: null,
    appliedOn: "2026-05-03",
  },
];

export type AdminPendingOfferRow = {
  id: string;
  vendor: string;
  vendorId: string;
  title: string;
  discountLabel: string;
  category: VendorCategory;
  submittedOn: string;
};

export const adminPendingOffers: AdminPendingOfferRow[] = [
  {
    id: "off_003",
    vendor: "Henry Schein",
    vendorId: "v_001",
    title: "Premium tier members — 18% off",
    discountLabel: "18% off (Premium-only)",
    category: "Dental Supplies",
    submittedOn: "2026-05-02",
  },
  {
    id: "off_w001",
    vendor: "Weave",
    vendorId: "v_002",
    title: "6 months free + waived onboarding",
    discountLabel: "6 mo free",
    category: "Practice Management Software",
    submittedOn: "2026-05-04",
  },
];

export type AdminHotlineCase = {
  id: string;
  member: string;
  memberId: string;
  pillar: "Practice Ops" | "HR" | "Marketing" | "Tech" | "M&A" | "Finance";
  urgency: "critical" | "high" | "normal";
  summary: string;
  status: "received" | "triaged" | "matched" | "replied" | "resolved";
  assignedTo?: string;
  expert?: string;
  openedAt: string;
  slaDueIn: string;
};

export const adminHotlineCases: AdminHotlineCase[] = [
  {
    id: "hc_2026_05_05_1",
    member: "Dr. Marcus Chen",
    memberId: "m_001",
    pillar: "Finance",
    urgency: "high",
    summary: "PPO renegotiation strategy for two-location practice",
    status: "matched",
    assignedTo: "Lester",
    expert: "Lester Carrington",
    openedAt: "2 days ago",
    slaDueIn: "Reply due in 1 day",
  },
  {
    id: "hc_2026_05_05_2",
    member: "Dr. Diana Walsh",
    memberId: "m_002",
    pillar: "HR",
    urgency: "critical",
    summary: "Office manager resigned mid-week — emergency cover plan",
    status: "received",
    openedAt: "2 hrs ago",
    slaDueIn: "Triage due now",
  },
  {
    id: "hc_2026_05_04_1",
    member: "Dr. Allen Park",
    memberId: "m_004",
    pillar: "Marketing",
    urgency: "normal",
    summary: "New patient acquisition — local SEO for second location",
    status: "triaged",
    assignedTo: "VA",
    openedAt: "Yesterday",
    slaDueIn: "Match expert in 22 hrs",
  },
  {
    id: "hc_2026_05_03_1",
    member: "Dr. Hannah Kim",
    memberId: "m_005",
    pillar: "M&A",
    urgency: "normal",
    summary: "Practice acquisition LOI review — buy-side timing",
    status: "replied",
    assignedTo: "Lester",
    expert: "External M&A counsel",
    openedAt: "3 days ago",
    slaDueIn: "Awaiting member feedback",
  },
];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "lester" | "reshani" | "rushda" | "chamika" | "va";
  workstream: string;
  status: "active";
  lastActive: string;
};

export const adminUsers: AdminUser[] = [
  { id: "ad_lester", name: "Lester Carrington", email: "lester@thrivingdentist.com", role: "lester", workstream: "Hotline · Resources · Directory · Pricing · Legal", status: "active", lastActive: "2 hrs ago" },
  { id: "ad_reshani", name: "Reshani Wijesuriya", email: "reshani@thrivingdentist.com", role: "reshani", workstream: "Vendor Network", status: "active", lastActive: "30 min ago" },
  { id: "ad_rushda", name: "Rushdha Fathima", email: "rushda@thrivingdentist.com", role: "rushda", workstream: "Tech Build", status: "active", lastActive: "Active now" },
  { id: "ad_chamika", name: "Chamika Perera", email: "chamika@thrivingdentist.com", role: "chamika", workstream: "Pre-Launch · Marketing", status: "active", lastActive: "5 hrs ago" },
];

export const adminKpis = {
  membersTotal: 247,
  membersFoundingCap: 1000,
  membersThisWeek: 14,
  vendorsActive: 9,
  vendorsPending: 3,
  vendorsTotal: 12,
  hotlineOpenCases: 4,
  hotlineSlaCompliance: 0.97,
  mrr: 12103,
  arr: 145236,
  vendorMrr: 1791,
  pendingOffers: 2,
  redemptionsThisMonth: 89,
  savingsDeliveredYtd: 47820,
};

// =====================================================================
// VENDOR AGREEMENT — sectioned for the signup terms display
// =====================================================================

export type AgreementSection = {
  id: string;
  number: string;
  title: string;
  body: string;
};

export const vendorAgreementMeta = {
  title: "Vendor Network Partnership Agreement",
  version: "v1.0",
  effective: "Effective on the date of last signature",
  intro:
    "This Vendor Network Partnership Agreement (the “Agreement”) is between Thriving Dentist (“we” / “us”) and the Vendor (“you”). Read carefully — you must agree to all terms before continuing onboarding.",
};

export const vendorAgreementSections: AgreementSection[] = [
  {
    id: "definitions",
    number: "1",
    title: "Definitions",
    body:
      "Member: a registered participant of the Thriving Dentist community or any affiliated community (Less Insurance Dependence, RIDA Academy, Dental Marketing Society, Insurance Untangled) with Network access. Vendor Profile: your dedicated listing page including logo, description, service details, contact form. Member Discount: the discount or benefit you commit to make available to Members. Lead: an inquiry attributed to or routed by the Network. Term: the duration of this Agreement.",
  },
  {
    id: "listing",
    number: "2",
    title: "Network Listing & Benefits",
    body:
      "You are enrolled as a Featured Partner — benefits in Schedule A (enhanced directory listing, priority category placement, quarterly newsletter mentions, 1 dedicated email to members per year, eligibility for podcast/webinar features, full lead dashboard, Verified Partner badge). You supply all profile content (logo, description, pricing guidance, member discount). Promotional placements (podcast, webinar) are subject to editorial discretion and scheduling. The Verified Partner mark license is non-exclusive, non-transferable, and terminates with this Agreement.",
  },
  {
    id: "leads",
    number: "3",
    title: "Leads & Attribution",
    body:
      "Member inquiries are routed to you by email, dashboard notification, or other reasonable means. You will respond professionally and timely. A sale or engagement is attributed to the Network if the Lead originated through a Network-issued contact, code, or link within the prior 12 months, or if the Member identifies Thriving Dentist as the source at point of contact and you confirm. You will provide a monthly account of Lead activity and revenue, due by the 5th of the following month.",
  },
  {
    id: "discount",
    number: "4",
    title: "Member Discount Commitment",
    body:
      "You commit to offer Members a meaningful Member Discount that is NOT generally available to non-Members, throughout the Term. The discount may be a percentage off, a flat-dollar discount, a waived setup fee, bonus inclusions (extra hours, bundled products, extended trials), or preferred payment terms. You will honor the discount when a Member identifies as a Thriving Dentist Member. You may not reduce or withdraw the discount during the Term without our prior written consent. You may improve it at any time.",
  },
  {
    id: "fees",
    number: "5",
    title: "Fees & Payment",
    body:
      "Monthly Fee: USD $199.00/month (subject to the Founding Partner Offer in Schedule C, if applicable). Annual Pre-Pay: 12 months in advance buys 10 months of fees (≈17% savings) — non-refundable except as expressly provided. Billing: Net 15 from invoice date; 1.5%/mo late fees apply past 30 days. Taxes: all fees exclusive of taxes; you are responsible for sales/use/VAT etc. No Refunds: termination for convenience does not entitle you to a refund of the current billing period.",
  },
  {
    id: "standards",
    number: "6",
    title: "Vendor Standards",
    body:
      "You represent and warrant that you are duly authorized; will operate in compliance with all applicable laws and professional standards (dental industry, advertising, consumer protection, data privacy); will provide responsive, professional support to Members at the same level of care as your general customer base; have rights to all content and marks supplied; and will not engage in conduct that brings the Thriving Dentist brand into disrepute (no misleading advertising, no harassment of Members, no violations of professional codes).",
  },
  {
    id: "data",
    number: "7",
    title: "Confidentiality & Member Data",
    body:
      "Each Party will protect the other's Confidential Information with at least the care it gives its own confidential information of like importance. Member contact information shared in connection with Leads may ONLY be used to respond to and service the Lead. You will not sell, resell, or transfer Member data to any third party. You will not enroll Members in unrelated marketing programs without their consent. You will comply with all applicable data protection laws. These obligations survive termination.",
  },
  {
    id: "term",
    number: "8",
    title: "Term & Termination",
    body:
      "Initial Term: 12 months. Auto-renews for successive 12-month terms unless either Party gives 30 days' written notice of non-renewal. Termination for convenience: either Party with 30 days' written notice; you remain responsible for accrued fees. Termination for cause: immediate, on uncured material breach (15-day cure period), insolvency, or conduct materially harming the Network. On termination, your profile and promotional placements are removed, the Verified Partner badge license terminates, all unpaid fees are due, and confidentiality obligations survive.",
  },
  {
    id: "disclaimers",
    number: "9",
    title: "Disclaimers & Limitation of Liability",
    body:
      "We make no guarantee about the volume, quality, conversion rate, or revenue value of Leads — results depend on factors outside our control. The Network is provided AS IS, AS AVAILABLE. Except for breaches of Sections 4, 6, or 7, IP infringement, or indemnification, neither Party is liable for indirect, incidental, special, consequential, or punitive damages, or lost profits/revenue/data. Each Party's total liability is capped at the fees you paid in the 12 months preceding the event giving rise to liability.",
  },
  {
    id: "indemnification",
    number: "10",
    title: "Indemnification",
    body:
      "You will defend, indemnify, and hold harmless Thriving Dentist and its affiliates from third-party claims arising from your products, services, or sales practices; your breach of this Agreement; content you supplied; or any failure to honor the Member Discount.",
  },
  {
    id: "general",
    number: "11",
    title: "General Provisions",
    body:
      "Independent contractors — no partnership/joint venture/agency/employment created. You may not assign this Agreement without our consent; we may assign to an affiliate or in M&A. Notices in writing by email (with confirmation) or overnight courier. This Agreement is the entire agreement; modifications must be in writing signed by both Parties. Governed by the laws of [State]; venue [City]. If any provision is unenforceable, the remaining provisions stay in effect. Electronic signatures (PDF, DocuSign, click-to-agree) have the same effect as original signatures.",
  },
];
