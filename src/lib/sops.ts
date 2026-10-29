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
  // Lisa Grogan approved all three in writing (Lester, 26 Oct 2026).
  {
    slug: "bife-conversation",
    title: "The B-I-F-E conversation",
    category: "Team & Culture",
    expert: { name: "Lisa Grogan", id: "2e69f0a0-4e40-4ba7-a0a1-573f6eeebe24" },
    cardUrl: `${CARD_BASE}/bife-conversation-card.jpg`,
    pdfUrl: `${PDF_BASE}/bife-conversation.pdf`,
    approved: "2026-10-26",
  },
  {
    slug: "how-we-come-across-audit",
    title: "The how-we-come-across audit",
    category: "Marketing & SEO",
    expert: { name: "Lisa Grogan", id: "2e69f0a0-4e40-4ba7-a0a1-573f6eeebe24" },
    cardUrl: `${CARD_BASE}/how-we-come-across-audit-card.jpg`,
    pdfUrl: `${PDF_BASE}/how-we-come-across-audit.pdf`,
    approved: "2026-10-26",
  },
  {
    slug: "regular-feedback-one-to-one",
    title: "The regular feedback one-to-one",
    category: "Team & Culture",
    expert: { name: "Lisa Grogan", id: "2e69f0a0-4e40-4ba7-a0a1-573f6eeebe24" },
    cardUrl: `${CARD_BASE}/regular-feedback-one-to-one-card.jpg`,
    pdfUrl: `${PDF_BASE}/regular-feedback-one-to-one.pdf`,
    approved: "2026-10-26",
  },
  {
    slug: "three-question-performance-check",
    title: "The three-question performance check",
    category: "Team & Culture",
    expert: { name: "Denise Ciardello", id: "4d394d39-f04a-4cf2-b22f-c3c0b6b515df" },
    cardUrl: `${CARD_BASE}/three-question-performance-check-card.jpg`,
    pdfUrl: `${PDF_BASE}/three-question-performance-check.pdf`,
    approved: "2026-10-22",
  },
  {
    // Joint SOP from the Reducing Insurance Dependence Academy panel; both
    // Denise and Janice approved it (Janice by email, 26 Oct 2026). Listed
    // under Janice so her page carries it; the card names both.
    slug: "do-you-take-my-insurance-call",
    title: "The “do you take my insurance?” call",
    category: "Insurance & PPOs",
    expert: { name: "Denise Ciardello & Janice Janssen", id: "f714ec6c-21f5-463c-a10d-82993b7b1338" },
    cardUrl: `${CARD_BASE}/do-you-take-my-insurance-call-card.jpg`,
    pdfUrl: `${PDF_BASE}/do-you-take-my-insurance-call.pdf`,
    approved: "2026-10-26",
  },
  // STAGED, NOT LIVE (Lester, 9 Oct 2026): Laura Webber's SOP is a draft
  // until she approves the wording. The PDF is already in storage at
  // member-resources/sops/ten-minute-huddle-DRAFT.pdf. When Lester confirms:
  // rename the PDF to ten-minute-huddle.pdf, add the card image, and move
  // this entry into the array with the approval date.
  // {
  //   slug: "ten-minute-huddle",
  //   title: "The ten minute huddle that stops the finger pointing",
  //   category: "Team & Culture",
  //   expert: { name: "Laura Webber", id: "4d0ddc82-1593-48aa-81d8-a3094c7bfac1" },
  //   cardUrl: `${CARD_BASE}/ten-minute-huddle-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/ten-minute-huddle.pdf`,
  //   approved: "",
  // },
  // STAGED, NOT LIVE (Lester, 9 Oct 2026): Danielle Kramer's SOP, draft until
  // she approves. PDF at member-resources/sops/first-ninety-seconds-DRAFT.pdf.
  // {
  //   slug: "first-ninety-seconds",
  //   title: "The first ninety seconds when a caller asks, do you take my insurance",
  //   category: "Insurance & PPOs",
  //   expert: { name: "Danielle Kramer", id: "66a1b63f-cff6-4fb1-95fc-19abd0bdff38" },
  //   cardUrl: `${CARD_BASE}/first-ninety-seconds-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/first-ninety-seconds.pdf`,
  //   approved: "",
  // },
  // STAGED, NOT LIVE (Lester, 9 Oct 2026): David Bolden's SOP, draft until he
  // approves. PDF at member-resources/sops/before-you-buy-any-ai-DRAFT.pdf.
  // {
  //   slug: "before-you-buy-any-ai",
  //   title: "Before you buy any AI",
  //   category: "Dental AI",
  //   expert: { name: "David Bolden", id: "caa52e4d-e583-44c2-be32-594071b55800" },
  //   cardUrl: `${CARD_BASE}/before-you-buy-any-ai-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/before-you-buy-any-ai.pdf`,
  //   approved: "",
  // },
  // STAGED, NOT LIVE (Lester, 20 Oct 2026): Perrin DesPortes' two SOPs, drafts
  // until he approves. PDFs at member-resources/sops/recruiting-your-next-associate-DRAFT.pdf
  // and member-resources/sops/growth-readiness-review-DRAFT.pdf.
  // {
  //   slug: "recruiting-your-next-associate",
  //   title: "Recruiting your next associate",
  //   category: "Practice Transitions",
  //   expert: { name: "Perrin DesPortes", id: "06a8a085-d8f4-4b89-8a37-4c60b2c92c97" },
  //   cardUrl: `${CARD_BASE}/recruiting-your-next-associate-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/recruiting-your-next-associate.pdf`,
  //   approved: "",
  // },
  // {
  //   slug: "growth-readiness-review",
  //   title: "The growth readiness review",
  //   category: "Practice Transitions",
  //   expert: { name: "Perrin DesPortes", id: "06a8a085-d8f4-4b89-8a37-4c60b2c92c97" },
  //   cardUrl: `${CARD_BASE}/growth-readiness-review-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/growth-readiness-review.pdf`,
  //   approved: "",
  // },
  // STAGED, NOT LIVE (Lester, 21 Oct 2026): Perrin DesPortes' three Leadership
  // Series SOPs, drafts until he approves. PDFs at member-resources/sops/
  // screening-a-practice-before-you-offer-DRAFT.pdf, partnership-conversation-DRAFT.pdf
  // and monthly-executive-scorecard-DRAFT.pdf.
  // {
  //   slug: "screening-a-practice-before-you-offer",
  //   title: "Screening a practice before you offer",
  //   category: "Practice Transitions",
  //   expert: { name: "Perrin DesPortes", id: "06a8a085-d8f4-4b89-8a37-4c60b2c92c97" },
  //   cardUrl: `${CARD_BASE}/screening-a-practice-before-you-offer-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/screening-a-practice-before-you-offer.pdf`,
  //   approved: "",
  // },
  // {
  //   slug: "partnership-conversation",
  //   title: "The partnership conversation",
  //   category: "Practice Transitions",
  //   expert: { name: "Perrin DesPortes", id: "06a8a085-d8f4-4b89-8a37-4c60b2c92c97" },
  //   cardUrl: `${CARD_BASE}/partnership-conversation-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/partnership-conversation.pdf`,
  //   approved: "",
  // },
  // {
  //   slug: "monthly-executive-scorecard",
  //   title: "The monthly executive scorecard",
  //   category: "Practice Management",
  //   expert: { name: "Perrin DesPortes", id: "06a8a085-d8f4-4b89-8a37-4c60b2c92c97" },
  //   cardUrl: `${CARD_BASE}/monthly-executive-scorecard-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/monthly-executive-scorecard.pdf`,
  //   approved: "",
  // },
  // STAGED, NOT LIVE (Lester, 21 Oct 2026): Greg Essenmacher's SOP, draft until
  // he approves. PDF at member-resources/sops/turn-the-mirror-on-yourself-DRAFT.pdf.
  // {
  //   slug: "turn-the-mirror-on-yourself",
  //   title: "Turn the mirror on yourself",
  //   category: "Team & Culture",
  //   expert: { name: "Greg Essenmacher", id: "e1e71c2f-17c0-45a5-ab0f-f18449a6d620" },
  //   cardUrl: `${CARD_BASE}/turn-the-mirror-on-yourself-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/turn-the-mirror-on-yourself.pdf`,
  //   approved: "",
  // },
  // STAGED, NOT LIVE (Lester, 21 Oct 2026): Thomas Passalacqua's SOP, draft until
  // he approves. PDF at member-resources/sops/rolling-out-a-change-DRAFT.pdf.
  // {
  //   slug: "rolling-out-a-change",
  //   title: "Rolling out a change without exhausting the team",
  //   category: "Team & Culture",
  //   expert: { name: "Thomas Passalacqua", id: "5535355e-8f77-4e80-b48a-93ecb12eadb7" },
  //   cardUrl: `${CARD_BASE}/rolling-out-a-change-card.jpg`,
  //   pdfUrl: `${PDF_BASE}/rolling-out-a-change.pdf`,
  //   approved: "",
  // },
];
