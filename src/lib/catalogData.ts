// Catalog + Offers mock data store.
// Vendors list services, products, and courses. Each offer attaches to a
// specific catalog item. Both go through team review before going live in the
// member directory. Preview-mode only — wire to Supabase when the model is
// stable.

export type CatalogItemType = "service" | "product" | "course";

export type ReviewStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "needs_changes";

export type CatalogMedia = {
  url: string;
  /** Short caption shown in the gallery thumbnail and image-detail card. */
  caption: string;
};

export type CatalogVideo = {
  /** Direct URL or embed URL (YouTube, Vimeo). */
  url: string;
  thumbnail: string;
  title: string;
  durationLabel: string;
};

export type CatalogItem = {
  id: string;
  vendorId: string;
  type: CatalogItemType;
  name: string;
  category: string;
  /** Short subtitle used on cards (under the name). */
  tagline: string;
  description: string;
  /** Display price ("$4,200", "Quote", "$99/mo"). Free-form. */
  priceLabel: string;
  /** Course-only: total duration in hours. */
  durationHours?: number;
  /** Course-only: count of modules in the curriculum. */
  moduleCount?: number;
  /** Course-only: CE credit hours awarded. */
  ceCredits?: number;
  /** Bullet highlights surfaced under the description. */
  highlights: string[];
  images: CatalogMedia[];
  videos: CatalogVideo[];
  /** Tags for browsing (e.g. ["AI", "Digital", "Award-winning"]). */
  tags: string[];
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  createdOn: string;
  updatedOn: string;
  /** Derived; cached for UI lists. */
  offerCount: number;
  /** Lifetime member redemptions tied to offers on this item. */
  redemptionsLifetime: number;
};

export type Offer = {
  id: string;
  vendorId: string;
  catalogItemId: string;
  headline: string;
  discountValue: string;
  promoCode: string;
  terms: string;
  description: string;
  images: CatalogMedia[];
  videos: CatalogVideo[];
  validFrom: string;
  validTo: string;
  redemptionLimitPerMember: string;
  reviewStatus: ReviewStatus;
  reviewNote?: string;
  createdOn: string;
};

export const CATALOG_CATEGORIES: Record<CatalogItemType, string[]> = {
  service: [
    "Practice consulting",
    "Marketing",
    "Bookkeeping & tax",
    "HR & recruiting",
    "Legal",
    "Insurance billing",
    "IT & cybersecurity",
    "Other",
  ],
  product: [
    "Equipment",
    "Software",
    "Supplies & consumables",
    "Lab services",
    "Practice furnishings",
    "Other",
  ],
  course: [
    "Clinical",
    "Practice operations",
    "Marketing",
    "Leadership",
    "Finance",
    "Insurance & billing",
    "Other",
  ],
};

export const REDEMPTION_LIMIT_OPTIONS = [
  "unlimited",
  "once per member",
  "monthly",
  "quarterly",
  "annually",
] as const;

export const VENDOR_ID = "vnd_henryschein";

// One richly-populated example per type. Images are sourced from Unsplash
// (CC0) so the preview shows what a real listing looks like after a vendor
// uploads media. Videos use YouTube placeholder URLs + standard thumbnails;
// none are loaded on the page itself — they're surfaced as media cards only.

export const catalogItems: CatalogItem[] = [
  {
    id: "cat_iotc_scanner",
    vendorId: VENDOR_ID,
    type: "product",
    name: "Henry Schein IO-1 Intraoral Scanner",
    category: "Equipment",
    tagline: "Full-color digital impressions in 90 seconds.",
    description:
      "Compact wand scanner with AI-assisted margin detection and direct lab transmission. Wireless or USB-C. Ships with 18-month warranty, three onboarding calls, and a year of cloud storage for scans.",
    priceLabel: "$4,200",
    highlights: [
      "AI margin detection trained on 12M scans",
      "Direct lab transmission to 400+ partner labs",
      "Cloud scan history with patient-friendly viewer",
      "18-month full warranty, replaceable wand tip",
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80",
        caption: "IO-1 wand in operatory",
      },
      {
        url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
        caption: "Software UI on chairside tablet",
      },
      {
        url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
        caption: "Lab transmission dashboard",
      },
    ],
    videos: [
      {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=70",
        title: "60-second product overview",
        durationLabel: "1:02",
      },
      {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=70",
        title: "Live scan walkthrough with Dr. Patel",
        durationLabel: "4:38",
      },
    ],
    tags: ["AI", "Digital impressions", "Bestseller"],
    reviewStatus: "approved",
    reviewNote: undefined,
    createdOn: "2026-04-18",
    updatedOn: "2026-05-15",
    offerCount: 2,
    redemptionsLifetime: 12,
  },
  {
    id: "cat_supply_concierge",
    vendorId: VENDOR_ID,
    type: "service",
    name: "Quarterly Supply Concierge",
    category: "Practice consulting",
    tagline: "A dedicated buyer who saves your practice ~$1,400 every quarter.",
    description:
      "Your assigned concierge audits supply orders every 90 days, surfaces switching opportunities across labs / consumables / lab cases, consolidates ordering, and negotiates volume discounts on your behalf. Average member saves $1,400 per quarter without changing brands.",
    priceLabel: "$0/mo for DMN members",
    highlights: [
      "Dedicated account manager (1:1, not a pool)",
      "90-day audit cadence with written savings report",
      "Brand-agnostic — we won't push you to one supplier",
      "Includes consolidated invoicing on request",
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
        caption: "Quarterly business review",
      },
      {
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
        caption: "Savings report sample",
      },
    ],
    videos: [
      {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=70",
        title: "How the concierge service works",
        durationLabel: "2:14",
      },
    ],
    tags: ["Savings", "Concierge", "Member-only pricing"],
    reviewStatus: "approved",
    reviewNote: undefined,
    createdOn: "2026-04-22",
    updatedOn: "2026-05-09",
    offerCount: 1,
    redemptionsLifetime: 7,
  },
  {
    id: "cat_ppo_course",
    vendorId: VENDOR_ID,
    type: "course",
    name: "PPO Renegotiation in 90 Days",
    category: "Insurance & billing",
    tagline: "Negotiate higher fee schedules with the payors you already work with.",
    description:
      "Four modules covering payor relationships, fee schedule analysis, and the exact negotiation cadence Dr. Lester Carrington used to add $312k in annual collections. Includes templates, scripts, a private cohort hotline, and a CE credit certificate on completion.",
    priceLabel: "$1,250",
    durationHours: 18,
    moduleCount: 4,
    ceCredits: 12,
    highlights: [
      "4 modules, 18 hours of video + workbook",
      "12 CE credits (ADA-recognized provider)",
      "Templates: 7 negotiation letters + 3 phone scripts",
      "Private cohort hotline for 90 days post-enrollment",
    ],
    images: [
      {
        url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
        caption: "Course cover art",
      },
      {
        url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
        caption: "Module 02 — fee schedule analysis",
      },
      {
        url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
        caption: "Sample negotiation letter template",
      },
    ],
    videos: [
      {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=70",
        title: "Course trailer",
        durationLabel: "2:48",
      },
      {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=70",
        title: "Module 01 preview",
        durationLabel: "5:12",
      },
      {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=70",
        title: "Dr. Carrington on negotiation outcomes",
        durationLabel: "8:24",
      },
    ],
    tags: ["CE credit", "Cohort", "Insurance"],
    reviewStatus: "pending_review",
    reviewNote: "Awaiting CE credit confirmation from accreditor.",
    createdOn: "2026-05-12",
    updatedOn: "2026-05-18",
    offerCount: 1,
    redemptionsLifetime: 0,
  },
];

export const offers: Offer[] = [
  {
    id: "ofr_scanner_pct_off",
    vendorId: VENDOR_ID,
    catalogItemId: "cat_iotc_scanner",
    headline: "12% off the IO-1 Scanner",
    discountValue: "12% off",
    promoCode: "DMN-IO1-12",
    terms:
      "Discount applies to the standalone scanner SKU. Excludes service contracts. Stacks with the quarterly volume rebate. Limit one scanner per practice location.",
    description:
      "Member-only discount on the IO-1 scanner. Free shipping in the contiguous US included.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80",
        caption: "IO-1 promo card",
      },
    ],
    videos: [],
    validFrom: "2026-05-01",
    validTo: "2026-08-31",
    redemptionLimitPerMember: "once per member",
    reviewStatus: "approved",
    createdOn: "2026-05-05",
  },
  {
    id: "ofr_scanner_bundle",
    vendorId: VENDOR_ID,
    catalogItemId: "cat_iotc_scanner",
    headline: "Free training when you buy the IO-1",
    discountValue: "Free $1,200 onboarding",
    promoCode: "DMN-IO1-TRAIN",
    terms:
      "Three live onboarding calls and one in-office training visit included with any IO-1 purchase. Must be redeemed within 60 days of delivery.",
    description: "Add-on training package included free with any IO-1 scanner purchase. Normally $1,200.",
    images: [],
    videos: [],
    validFrom: "2026-05-01",
    validTo: "2026-12-31",
    redemptionLimitPerMember: "once per member",
    reviewStatus: "pending_review",
    reviewNote: "Confirm whether the training visit travels to all US zip codes.",
    createdOn: "2026-05-14",
  },
  {
    id: "ofr_supply_waived",
    vendorId: VENDOR_ID,
    catalogItemId: "cat_supply_concierge",
    headline: "Setup fee waived for DMN members",
    discountValue: "$350 setup waived",
    promoCode: "DMN-SUPPLY",
    terms:
      "$350 onboarding setup fee waived for any DMN member who signs up for Quarterly Supply Concierge. 90-day commitment.",
    description: "Skip the setup fee. Member sees savings from the very first quarterly review.",
    images: [],
    videos: [],
    validFrom: "2026-04-22",
    validTo: "2026-10-31",
    redemptionLimitPerMember: "once per member",
    reviewStatus: "approved",
    createdOn: "2026-04-22",
  },
  {
    id: "ofr_course_early",
    vendorId: VENDOR_ID,
    catalogItemId: "cat_ppo_course",
    headline: "20% off PPO Renegotiation course",
    discountValue: "20% off",
    promoCode: "DMN-PPO-20",
    terms:
      "Member-only rate on the launch cohort. Cohort cap: 40 members. Includes CE credit certificate on completion.",
    description: "Founding-member discount for the inaugural cohort. Live + recorded sessions.",
    images: [],
    videos: [],
    validFrom: "2026-06-01",
    validTo: "2026-07-31",
    redemptionLimitPerMember: "once per member",
    reviewStatus: "draft",
    createdOn: "2026-05-18",
  },
];

export function getCatalogItem(id: string): CatalogItem | undefined {
  return catalogItems.find((c) => c.id === id);
}

export function getOffersForItem(catalogItemId: string): Offer[] {
  return offers.filter((o) => o.catalogItemId === catalogItemId);
}

export function statusLabel(status: ReviewStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_review":
      return "In review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "needs_changes":
      return "Needs changes";
  }
}

export function statusPalette(status: ReviewStatus): { bg: string; fg: string; border: string } {
  switch (status) {
    case "approved":
      return { bg: "rgba(34,108,78,0.1)", fg: "#1F5C40", border: "rgba(34,108,78,0.28)" };
    case "pending_review":
      return { bg: "rgba(217,168,75,0.14)", fg: "#A07823", border: "rgba(217,168,75,0.32)" };
    case "needs_changes":
      return { bg: "rgba(217,168,75,0.14)", fg: "#A07823", border: "rgba(217,168,75,0.32)" };
    case "rejected":
      return { bg: "rgba(220,60,60,0.1)", fg: "#8C1D1D", border: "rgba(220,60,60,0.26)" };
    case "draft":
    default:
      return { bg: "rgba(14,42,61,0.05)", fg: "#5C6770", border: "rgba(14,42,61,0.12)" };
  }
}

export function typeLabel(type: CatalogItemType): string {
  switch (type) {
    case "service":
      return "Service";
    case "product":
      return "Product";
    case "course":
      return "Course";
  }
}
