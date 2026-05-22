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
  "Dental supplies and consumables",
  "Laboratory services",
  "Equipment and operatory build-outs",
  "Practice management software",
  "Billing, coding and credentialing",
  "HR, payroll and compliance",
  "Patient financing and lending",
  "Phone, call tracking and AI receptionists",
  "Coaching and consulting",
  "Continuing education",
  "Accounting, tax and CFO services",
  "Marketing and digital services",
  "Other",
] as const;

export type VendorCategory = (typeof vendorCategories)[number];

export type DiscountMechanic = "promo_code" | "affiliate_link" | "portal_redemption" | "manual_verification";

// Sample logged-in vendor for the prototype
export const vendor = {
  id: "v_001",
  companyName: "Henry Schein Dental",
  displayName: "Henry Schein",
  category: "Dental supplies and consumables" as VendorCategory,
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
    title: "Premium tier members, 18% off",
    code: "TDN-HSDN-PRM",
    mechanic: "promo_code",
    discountLabel: "18% off",
    status: "pending_review",
    redemptions: 0,
    savingsDeliveredYtd: 0,
    expiresOn: "2026-12-31",
    createdOn: "2026-05-02",
    reviewerNote: "Awaiting team approval, submitted 2 days ago.",
  },
  {
    id: "off_004",
    title: "Black Friday flash, 22% off (3 days)",
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
    category: "Dental supplies and consumables",
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
    category: "Practice management software",
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
    category: "Equipment and operatory build-outs",
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
    category: "Practice management software",
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
    category: "Practice management software",
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
    category: "Marketing and digital services",
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
    title: "Premium tier members, 18% off",
    discountLabel: "18% off (Premium-only)",
    category: "Dental supplies and consumables",
    submittedOn: "2026-05-02",
  },
  {
    id: "off_w001",
    vendor: "Weave",
    vendorId: "v_002",
    title: "6 months free + waived onboarding",
    discountLabel: "6 mo free",
    category: "Practice management software",
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
    summary: "Office manager resigned mid-week, emergency cover plan",
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
    summary: "New patient acquisition, local SEO for second location",
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
    summary: "Practice acquisition LOI review, buy-side timing",
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
// VENDOR AGREEMENT, sectioned for the signup terms display
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
  effective: "Effective on the date of sign-up",
  tagline: "Built around five simple commitments.",
  intro:
    "This Vendor Network Partnership Agreement (the “Agreement”) is between Thriving Dentist (“we,” “us”) and the Vendor who signs up below (“you,” “Vendor”). It takes effect on the date of signup. By joining the network, you agree to five commitments, outlined below, plus the operational and legal terms that follow. The structure is intentionally short. We'd rather have a clear handshake than a 40-page document nobody reads.",
};

export type VendorCommitment = {
  number: string;
  title: string;
  body: string;
};

// The five commitments, the headline framing of the agreement.
export const vendorCommitments: VendorCommitment[] = [
  {
    number: "01",
    title: "Offer our members the best deal you have.",
    body:
      "You agree to give Thriving Dentist members a discount, bonus, or exclusive benefit that is at least as good as any offer you make available to comparable customers. If your terms get better elsewhere, ours match or improve. We promote this deal, it has to be real.",
  },
  {
    number: "02",
    title: "Join our private partner hotline.",
    body:
      "We host a private hotline that connects our members with vendors in the network. We keep one team member responsive there during business hours, and use it for fast coordination between members and vendors. It's where deals get sorted, leads get triaged, and we share what's working.",
  },
  {
    number: "03",
    title: "Provide a calendar link.",
    body:
      "You give us a working calendar booking link (Calendly, HubSpot, Cal.com, anything) where members can book a call with you directly. We feature it on your profile. You agree to keep it live, keep availability open, and respond to bookings within one business day.",
  },
  {
    number: "04",
    title: "Accept that we'll evolve the network.",
    body:
      "The network is new. We reserve the right to update the terms, benefits, fees, and operating rules from time to time on at least thirty (30) days' written notice. If a change materially reduces your benefits, you can terminate before it takes effect with no penalty.",
  },
  {
    number: "05",
    title: "Pay the fee, waived for your first six months.",
    body:
      "The standard fee is $199 per month. Founding partners pay $0 for months 1-6, $49 for months 7-12, and the standard $199 from month thirteen onward. You're free to cancel with 30 days' written notice at any time, but you remain responsible for fees accrued during notice.",
  },
];

// The fee schedule presented as a flat table (matches Schedule A in HTML).
export type FeeScheduleRow = {
  period: string;
  fee: string;
  note: string;
};

export const vendorFeeSchedule: FeeScheduleRow[] = [
  { period: "Months 1-6", fee: "$0", note: "Founding partner waiver, applies automatically" },
  { period: "Months 7-12", fee: "$49", note: "Locked-in launch rate" },
  { period: "Month 13 onward", fee: "$199", note: "Standard partner rate" },
];

// Headline numbers shown above the agreement (the "key terms band" in the HTML).
export const vendorAgreementKeyTerms = [
  { label: "Months 1-6", value: "$0", sub: "Waived" },
  { label: "Months 7-12", value: "$49", sub: "per month" },
  { label: "Month 13+", value: "$199", sub: "per month" },
  { label: "Commitment", value: "12 mo", sub: "Initial term" },
  { label: "Cancel", value: "30 d", sub: "Written notice" },
];

// The 9 operational/legal sections that follow the five commitments.
export const vendorAgreementSections: AgreementSection[] = [
  {
    id: "whats-included",
    number: "01",
    title: "What's included",
    body:
      "Profile in the directory: we create and maintain a dedicated profile page for you in the Thriving Dentist Vendor Directory, logo, description, services, contact form, member-exclusive offer, and your calendar link. Promotion to members: priority category placement, quarterly newsletter mentions, one dedicated email to members per year, and eligibility for podcast and webinar features at our editorial discretion. Lead routing: inquiries from members are routed directly to you by email and via your partner dashboard. All leads are pre-qualified, these are members who chose the network specifically to find someone like you. Verified Partner badge: a “Thriving Dentist Verified Partner” mark you can use on your site, email signature, and sales materials while this Agreement is active. The license ends when this Agreement ends.",
  },
  {
    id: "fees-and-payment",
    number: "02",
    title: "Fees and payment",
    body:
      "Fees are billed in advance and due Net 15 from invoice date. Payments more than 30 days past due may accrue late charges at 1.5% per month or the maximum rate permitted by law, whichever is lower. Fees are exclusive of applicable taxes. Annual pre-pay option: if you commit to twelve months at the standard rate up front, you get two months free (effectively 10 months for the price of 12). Available after the founding partner period or at any time during the term. No refunds: except as expressly stated in this Agreement, fees are non-refundable. If you cancel mid-period, you remain responsible for fees through the end of the current billing period.",
  },
  {
    id: "member-discount-details",
    number: "03",
    title: "Member discount details",
    body:
      "The member discount you commit to in the signup form is binding for the term of this Agreement. You can improve it any time, you just can't reduce or withdraw it without our written consent. Acceptable discount formats include: a percentage off your standard pricing (typically 3-20%), a flat-dollar discount on first purchase or engagement, a waived setup/onboarding/implementation fee, bonus inclusions (extra hours, bundled products, extended trials), or preferred payment terms or deferred billing. You honor the discount when a member identifies themselves as a Thriving Dentist member, books through your network calendar link, or is referred via the network's lead routing.",
  },
  {
    id: "standards",
    number: "04",
    title: "Standards we hold partners to",
    body:
      "While in the network, you confirm and agree that: you operate in compliance with all applicable laws, regulations, and professional standards; you provide responsive, professional sales and customer support to members, at least at the quality level you give your best customers; you have the rights to all logos, copy, and content you give us, and you grant us a non-exclusive license to use them to promote you in the network; you will not engage in conduct that damages the Thriving Dentist brand, including misleading advertising, harassment of members, or violation of professional codes of conduct.",
  },
  {
    id: "confidentiality",
    number: "05",
    title: "Confidentiality and member data",
    body:
      "Both parties may receive non-public information from the other. Each agrees to use it only for purposes of this Agreement and protect it with at least reasonable care. Member contact information shared with you in connection with leads may only be used to respond to and service that lead. You will not sell, transfer, or use member data for unrelated marketing, and you will comply with all applicable data protection laws. This survives termination of this Agreement.",
  },
  {
    id: "changes",
    number: "06",
    title: "Changes to terms",
    body:
      "Thriving Dentist may modify these terms, including pricing, benefits, eligibility, and operating rules, from time to time. We will provide at least thirty (30) days' prior written notice by email and via the partner dashboard. If a change materially reduces your benefits or increases your fees, you may terminate this Agreement before the change takes effect with no further obligation, provided you give us written notice within the 30-day notice window. Your continued participation after the effective date of a change constitutes acceptance of the updated terms.",
  },
  {
    id: "term",
    number: "07",
    title: "Term, renewal, and termination",
    body:
      "Initial term and renewal: this Agreement starts on the date you sign up and continues for an initial term of twelve (12) months. It then renews automatically for successive twelve-month terms unless either party gives written notice of non-renewal at least 30 days before the end of the current term. Termination for convenience: either party may terminate at any time on 30 days' prior written notice. You remain responsible for fees accrued through the effective date of termination. Termination for cause: immediate, on uncured material breach (15-day cure period), insolvency, or conduct that materially harms the network. What happens at termination: your profile and promotional placements are removed; the Verified Partner badge license ends; any unpaid accrued fees become immediately due; provisions that by their nature survive, confidentiality, member data protection, indemnification, and limits of liability, continue to apply.",
  },
  {
    id: "disclaimers",
    number: "08",
    title: "Disclaimers and liability",
    body:
      "We do not guarantee any specific number of leads, conversion rate, or revenue outcome from network participation. Results depend on your products, pricing, sales process, and responsiveness. Except as expressly stated here, the network is provided “as is.” Neither party is liable for indirect, incidental, special, or consequential damages, or for lost profits or revenue. Total cumulative liability of either party is capped at the total fees paid by Vendor under this Agreement in the twelve months immediately preceding the event giving rise to liability. Vendor will indemnify Thriving Dentist from third-party claims arising out of Vendor's products, services, sales practices, breach of this Agreement, or content supplied to the network.",
  },
  {
    id: "miscellaneous",
    number: "09",
    title: "Miscellaneous",
    body:
      "The parties are independent contractors, this Agreement does not create a partnership, joint venture, agency, or employment relationship. You may not assign or transfer this Agreement without our prior written consent. This Agreement is the entire agreement between the parties on its subject and supersedes prior discussions. Any modification must be by written notice as described in Section 06 or by a signed amendment. If any provision is unenforceable, the remaining provisions stay in effect. This Agreement is governed by the laws of the State of [State], and any disputes will be resolved in the state or federal courts located in [Venue]. Electronic signatures and acceptance via this online form have the same effect as original written signatures.",
  },
];
