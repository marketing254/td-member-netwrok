#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * publish-janice-janssen.mjs — Lester's 28 Oct 2026 request, items 1 and 4.
 *
 *  1. Expert listing: Janice Janssen, RDH, CFE (Co-Founder, Global Team
 *     Solutions). New headshot (26 Oct), bio, category, booking link from
 *     LISTING INFO.md in For Dev > Denise Ciardello.
 *  4. SOP "The do you take my insurance call" (approved by Janice 26 Oct):
 *     uploads the approved PDF (DRAFT header replaced) and its card to the
 *     sops folders that src/lib/sops.ts reads from.
 *
 * The playbook itself (item 2) is imported by scripts/import-resources.mjs.
 * Safe to run twice. Run from landing/:  node scripts/publish-janice-janssen.mjs
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const JANICE_ID = "f714ec6c-21f5-463c-a10d-82993b7b1338";
const SCRATCH = "C:/Users/FATHIM~1/AppData/Local/Temp/claude/d--TD---Member-Network/615985bd-42ac-481b-8c3d-62590cbebabe/scratchpad/janice";
const KIT_DIR = "D:/TD - Member Network/Resources/Denise Ciardello/Kit - It_s Rarely About Insurance";
const HEADSHOT_JPG = fs.existsSync(`${SCRATCH}/janice-headshot.jpg`) ? `${SCRATCH}/janice-headshot.jpg` : null;
const SOP_PDF = fs.existsSync(`${KIT_DIR}/SOP - The do-you-take-my-insurance call (Denise Ciardello and Janice Janssen).pdf`)
  ? `${KIT_DIR}/SOP - The do-you-take-my-insurance call (Denise Ciardello and Janice Janssen).pdf`
  : `${SCRATCH}/sop-approved.pdf`;
const SOP_CARD = fs.existsSync(`${KIT_DIR}/../SOP card/do-you-take-my-insurance-call-card.jpg`)
  ? `${KIT_DIR}/../SOP card/do-you-take-my-insurance-call-card.jpg`
  : `${SCRATCH}/do-you-take-my-insurance-call-card.jpg`;

const BIO = `At age 14, Janice Janssen got an after-school job working for her dentist. Little did she know how that choice would determine the course of her future. Twenty-something years later, she is the co-founder of Global Team Solutions and an expert in dental practice consulting. Since her introduction into the field as a teen, she has enjoyed a long career as a dental hygienist and served and excelled in many other roles including office management, insurance billing, and collections. Now Janice enjoys consulting because it allows her to share her techniques with the doctors, hygienists, and office staff who are on the front line every day. She is co-author of OMG! Office Management Guide, the "bible" used in GTS training workshops. She is a member and former Treasurer of the Academy of Dental Management Consultants (ADMC), and is a Certified Fraud Examiner (CFE), which positions her as an expert in educating dentists to deter fraud and embezzlement in their practice.`;

async function upload(bucket, dest, file, contentType) {
  const up = await sb.storage.from(bucket).upload(dest, fs.readFileSync(file), { contentType, upsert: true, cacheControl: "3600" });
  if (up.error) throw new Error(`upload ${bucket}/${dest}: ${up.error.message}`);
  return sb.storage.from(bucket).getPublicUrl(dest).data.publicUrl;
}

// 1. Expert listing
{
  let headshot_url;
  if (HEADSHOT_JPG) headshot_url = await upload("kit-thumbnails", `profiles/${JANICE_ID}-${Date.now()}.jpg`, HEADSHOT_JPG, "image/jpeg");
  const patch = {
    display_name: "Janice Janssen, RDH, CFE",
    company_name: "Global Team Solutions",
    specialty: "Insurance & PPOs",
    topics: "Co-Founder, Global Team Solutions\nInsurance billing and collections\nFront office systems and office management\nFraud and embezzlement prevention (Certified Fraud Examiner)",
    website: "https://gtsgurus.com",
    booking_link: "https://calendly.com/infogts/discovery-call-30-minutes",
    bio: BIO,
    ...(headshot_url ? { headshot_url } : {}),
    notes: "Published 28 Oct 2026 from Lester's LISTING INFO (For Dev > Denise Ciardello). Second expert on Denise Ciardello's fee; co-founder, Global Team Solutions. Not a dentist, never \"Dr.\".",
  };
  const r = await sb.from("experts").update(patch).eq("id", JANICE_ID).select("id, display_name, headshot_url, status").single();
  if (r.error) throw r.error;
  console.log("expert:", r.data);
}

// 4. SOP PDF + card
{
  const pdfUrl = await upload("member-resources", "sops/do-you-take-my-insurance-call.pdf", SOP_PDF, "application/pdf");
  const cardUrl = await upload("kit-thumbnails", "sops/do-you-take-my-insurance-call-card.jpg", SOP_CARD, "image/jpeg");
  console.log("sop pdf:", pdfUrl);
  console.log("sop card:", cardUrl);
}
console.log("done");
