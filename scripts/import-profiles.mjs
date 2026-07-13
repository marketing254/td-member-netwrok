#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * import-profiles.mjs
 *
 * Populate the member-portal + directory profile fields for accepted
 * experts / partners from their "LISTING INFO" folders, and upload their
 * headshots + logos to Storage. Also fixes any wrong company display names.
 *
 * These people already exist in the DB (they accepted a founding invite),
 * so this UPDATES their `experts` / `vendors` rows by email — it never
 * creates rows. Idempotent: safe to re-run.
 *
 * It does NOT touch status/verification (they're already approved from
 * acceptance) and it does NOT create offers (add those via Admin → Partner
 * offers, which handles the catalog item + review properly).
 *
 * Usage (from landing/):
 *   node scripts/import-profiles.mjs --root "D:/TD - Member Network"
 *   node scripts/import-profiles.mjs --root "D:/TD - Member Network" --dry-run
 *
 * Requires landing/.env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landingDir = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(landingDir, ".env.local") });
dotenv.config({ path: path.join(landingDir, ".env") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE env (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const ROOT = path.resolve(args.root || "D:/TD - Member Network");
const DRY_RUN = !!args["dry-run"];
const BUCKET = "kit-thumbnails"; // public bucket; headshots/logos go under profiles/

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── The people to populate ──────────────────────────────────────────────
// `email` must match the row already in the DB (the founding-invite email).
const PEOPLE = [
  {
    label: "Ashley Boaz / Mint Conceptions",
    expert: {
      email: "ashley@mintconceptions.com",
      display_name: "Ashley Boaz",
      full_name: "Ashley Boaz, B.S., SHRM-SCP, RDH, CDA",
      specialty: "Practice Transitions",
      company_name: "Mint Conceptions",
      website: "https://www.mintconceptions.com",
      booking_link: "https://mintconceptions.hbportal.co/schedule/6a4be588b565a6e2d652acc5",
      bio:
        "Ashley Boaz, B.S., SHRM-SCP, RDH, CDA is the CEO of Mint Conceptions and a Maxwell Leadership Certified coach. With a background spanning the clinical side of dentistry (as a registered dental hygienist and certified dental assistant) and senior human resources practice, she coaches dental practice owners and their teams on operational strategy, leadership development, and sustainable growth, including guiding practices through ownership transitions while protecting culture, patients, and cash flow.",
      // Square headshot from the canonical directory-data set.
      headshot: "Website - Directory Data/Headshots/ashley_sq.jpg",
    },
    partner: {
      contact_email: "ashley@mintconceptions.com",
      company_name: "Mint Conceptions",
      display_name: "Mint Conceptions",
      category: "Coaching and consulting",
      website: "https://www.mintconceptions.com",
      calendar_link: "https://mintconceptions.hbportal.co/schedule/6a4be588b565a6e2d652acc5",
      description:
        "At Mint Conceptions, we help business owners regain control. By combining leadership development with fractional administrative support, we bridge the gap by diagnosing daily bottlenecks in your systems and processes and offering solutions. Whether we address these gaps directly or connect you with our vetted outsourcing partners, our goal is simple: to make your business work for you, instead of you working for it.",
      logo: "Resources/Ashley E Boaz/Profile Assets/Mint Conceptions - Logo (transparent).png",
      // For the Admin → Partner offers step (not created by this script):
      offer_note: "Free discovery call, plus 5% off any services booked after the call, exclusive to DMN members.",
    },
  },
  {
    label: "Laura Phillips / The Phillips Group",
    expert: {
      // NOTE: the account/invite email is Andrew's; the expert is named Laura.
      email: "andrew@phillipsgrouptax.com",
      display_name: "Laura Phillips",
      full_name: "Laura Phillips, E.A.",
      specialty: "Tax & Accounting",
      company_name: "The Phillips Group",
      website: "https://phillipsgrouptax.com",
      booking_link: null, // Calendly pending
      bio:
        "Laura Phillips, E.A. is the Co-Founder & Chief Executive Officer of The Phillips Group, a healthcare-focused and technology-driven accounting, tax, and advisory firm based in Orange County, CA, with clients across the United States. Laura began her career as an entry-level staff accountant and rose over 15 years through senior accountant, accounting manager, and accounting & tax manager roles, specializing almost exclusively in healthcare, before founding The Phillips Group with her husband Andrew, who serves as its Chief Growth Officer.",
      // Square headshot from the canonical directory-data set.
      headshot: "Website - Directory Data/Headshots/laura_sq.jpg",
    },
    partner: {
      contact_email: "andrew@phillipsgrouptax.com",
      company_name: "The Phillips Group", // FIX: never "Phillips Group Tax"
      display_name: "The Phillips Group",
      category: "Tax & Accounting",
      website: "https://phillipsgrouptax.com",
      calendar_link: null, // Calendly pending
      description:
        "The Phillips Group is a healthcare-focused, technology-driven accounting, tax, and advisory firm based in Orange County, CA, serving clients nationwide.",
      logo: "Resources/The Phillips Group/Profile Assets/The Phillips Group - Logo (dark).svg",
      offer_note:
        "One free 30-minute consultation with Laura Phillips per year; 15% off monthly services for the first year.",
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────
function mimeFor(f) {
  return MIME[path.extname(f).toLowerCase()] ?? "application/octet-stream";
}
function slugify(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function uploadImage(relPath, destName) {
  const abs = path.join(ROOT, relPath);
  if (!existsSync(abs)) {
    console.warn(`   ! file not found, skipping: ${relPath}`);
    return null;
  }
  const dest = `profiles/${destName}${path.extname(relPath).toLowerCase()}`;
  if (DRY_RUN) {
    console.log(`   [dry] upload ${relPath} -> ${BUCKET}/${dest}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(dest);
    return data?.publicUrl ?? null;
  }
  const buf = await fs.readFile(abs);
  const { error } = await supabase.storage.from(BUCKET).upload(dest, buf, {
    contentType: mimeFor(relPath),
    upsert: true,
  });
  if (error && !/already exists|Duplicate/i.test(error.message)) {
    throw new Error(`upload failed (${dest}): ${error.message}`);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(dest);
  console.log(`   ✓ uploaded ${dest}`);
  return data?.publicUrl ?? null;
}

async function updateRow(table, matchCol, matchVal, patch) {
  if (DRY_RUN) {
    console.log(`   [dry] update ${table} where ${matchCol}=${matchVal}:`, Object.keys(patch).join(", "));
    return true;
  }
  const { data, error } = await supabase.from(table).update(patch).ilike(matchCol, matchVal).select("id");
  if (error) throw new Error(`${table} update failed: ${error.message}`);
  if (!data || data.length === 0) {
    console.warn(`   ! no ${table} row matched ${matchCol}=${matchVal} — is the person accepted/added yet?`);
    return false;
  }
  console.log(`   ✓ updated ${table} (${data.length} row)`);
  return true;
}

// ─── Driver ──────────────────────────────────────────────────────────────
(async () => {
  console.log(`Profiles import — root: ${ROOT}${DRY_RUN ? "  (DRY RUN)" : ""}\n`);
  let ok = 0;
  let warn = 0;

  for (const person of PEOPLE) {
    console.log(`→ ${person.label}`);

    // Expert
    if (person.expert) {
      const e = person.expert;
      const slug = slugify(e.display_name);
      let headshotUrl = null;
      try {
        if (e.headshot) headshotUrl = await uploadImage(e.headshot, `${slug}-headshot`);
      } catch (err) { console.warn(`   ! headshot: ${err.message}`); warn++; }
      const patch = {
        display_name: e.display_name,
        full_name: e.full_name,
        specialty: e.specialty,
        company_name: e.company_name,
        bio: e.bio,
        website: e.website,
        booking_link: e.booking_link,
      };
      if (headshotUrl) { patch.headshot_url = headshotUrl; patch.avatar_url = headshotUrl; }
      try {
        (await updateRow("experts", "email", e.email, patch)) ? ok++ : warn++;
      } catch (err) { console.error(`   ! expert update: ${err.message}`); warn++; }
    }

    // Partner (vendor)
    if (person.partner) {
      const p = person.partner;
      const slug = slugify(p.company_name);
      let logoUrl = null;
      try {
        if (p.logo) logoUrl = await uploadImage(p.logo, `${slug}-logo`);
      } catch (err) { console.warn(`   ! logo: ${err.message}`); warn++; }
      const patch = {
        company_name: p.company_name,
        display_name: p.display_name,
        category: p.category,
        website: p.website,
        calendar_link: p.calendar_link,
        description: p.description,
      };
      if (logoUrl) { patch.logo_url = logoUrl; patch.avatar_url = logoUrl; }
      try {
        (await updateRow("vendors", "contact_email", p.contact_email, patch)) ? ok++ : warn++;
      } catch (err) { console.error(`   ! partner update: ${err.message}`); warn++; }
      if (p.offer_note) console.log(`   ↳ Offer to add via Admin → Partner offers: "${p.offer_note}"`);
    }
    console.log("");
  }

  // Belt-and-suspenders: fix the Phillips company name anywhere it's still wrong.
  if (!DRY_RUN) {
    for (const col of ["company_name", "display_name"]) {
      await supabase.from("vendors").update({ [col]: "The Phillips Group" }).ilike(col, "Phillips Group Tax");
    }
    await supabase.from("founding_invites").update({ company_name: "The Phillips Group" }).ilike("company_name", "Phillips Group Tax");
  }

  console.log(`Done. updated=${ok}  warnings=${warn}`);
  if (warn > 0) console.log("Review warnings above (usually: person not accepted yet, or a missing image file).");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}
