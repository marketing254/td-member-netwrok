/**
 * Systems — the member-portal SOP & template library.
 *
 * One entry per approved SOP. Each arrives from Lester as a PDF + a
 * duotone portal card (same treatment as the kit cards), both uploaded
 * to Supabase storage:
 *   card → kit-thumbnails/sops/<slug>-card.jpg   (public bucket)
 *   pdf  → member-resources/sops/<slug>.pdf
 *
 * Publishing a new SOP = upload the two files + add an entry here.
 * Every SOP is expert-approved IN WRITING before it appears — never add
 * one without that approval on record.
 */

const CARD_BASE =
  "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/sops";
const PDF_BASE =
  "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/member-resources/sops";

export type Sop = {
  slug: string;
  title: string;
  category: string;
  expert: {
    name: string;
    /** experts.id — links to /dashboard/experts/[id]. */
    id: string;
  };
  cardUrl: string;
  pdfUrl: string;
  /** Date the expert approved it in writing. */
  approved: string;
};

export const SOPS: Sop[] = [
  {
    slug: "hiring-when-short-staffed",
    title: "Hiring when you are short-staffed",
    category: "Team & Culture",
    expert: { name: "Ameena Basile", id: "65479ac7-4739-43a8-ab5d-fdb1ff1b34d2" },
    cardUrl: `${CARD_BASE}/hiring-when-short-staffed-card.jpg`,
    pdfUrl: `${PDF_BASE}/hiring-when-short-staffed.pdf`,
    approved: "2026-08-30",
  },
  {
    slug: "changing-systems-after-takeover",
    title: "Changing systems after you take over a practice",
    category: "Practice Transitions",
    expert: { name: "Ashley Boaz", id: "73a95417-74cd-4ed7-b8ce-9e0843270a5d" },
    cardUrl: `${CARD_BASE}/changing-systems-after-takeover-card.jpg`,
    pdfUrl: `${PDF_BASE}/changing-systems-after-takeover.pdf`,
    approved: "2026-08-20",
  },
  {
    slug: "performance-conversation",
    title: "The performance conversation that actually lands",
    category: "Team & Culture",
    expert: { name: "Julie Parker", id: "e49a90a8-7edb-4d2a-b688-57d477065b44" },
    cardUrl: `${CARD_BASE}/performance-conversation-card.jpg`,
    pdfUrl: `${PDF_BASE}/performance-conversation.pdf`,
    approved: "2026-08-30",
  },
  {
    slug: "front-desk-room-to-breathe",
    title: "Giving the front desk room to breathe",
    category: "Front Desk",
    expert: { name: "Rebecca Herring", id: "8f8de38c-52f6-4580-8471-d334f0da700c" },
    cardUrl: `${CARD_BASE}/front-desk-room-to-breathe-card.jpg`,
    pdfUrl: `${PDF_BASE}/front-desk-room-to-breathe.pdf`,
    approved: "2026-08-30",
  },
];
