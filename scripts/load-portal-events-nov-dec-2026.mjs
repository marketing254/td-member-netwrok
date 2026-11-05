#!/usr/bin/env node
/**
 * load-portal-events-nov-dec-2026.mjs — the four TD / DMS webinars (Rushdha's
 * brief, 5 Nov 2026) as portal_events rows. Upserts by slug, so it is safe to
 * re-run after editing titles or copy. Speakers are left empty on purpose
 * (headshots to come); add them in /admin/events later.
 *
 * All four run on the Marketing Zoom account. Their event_key matches the
 * Events Config row in the DMN x RIDA registrants sheet.
 *
 * From landing/:  node scripts/load-portal-events-nov-dec-2026.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const DRY = process.argv.includes("--dry-run");

const EVENTS = [
  {
    slug: "td-2026-11-17-independent-dental-practice",
    event_key: "td-2026-11-17",
    title: "The Independent Dental Practice",
    subtitle: "Reducing Insurance Dependence, Rebuilding Margin and Setting Your 2027 Targets",
    series: "thriving_dentist",
    starts_at: "2026-11-17T19:00:00-05:00",
    duration_minutes: 60,
    format: "Live webinar",
    ce_credits: null,
    zoom_webinar_id: "86560075938",
    banner_url: "/events/td-2026-11-17-banner.jpg",
    description: [
      "Is your dental practice too dependent on insurance? This event will show you how to evaluate insurance plans by their true value, identify plans worth dropping, and make smarter network decisions before 2027. We'll also cover realistic production benchmarks for 3-, 4-, and 5-chair practices, year-end bonus structures that protect your margin, and how to set 2027 targets based on the practice and lifestyle you want. Walk away with practical benchmarks and a clear plan to reduce insurance dependence, improve profitability, and start 2027 stronger.",
      "Key takeaways",
      "• Rank every plan by net yield per hour of chair time and cut one before January renewal.",
      "• The 90-day clock starts now: a 2027 network exit has to be decided in November or December.",
      "• What a 3, 4 or 5-chair practice should actually be producing: real benchmark ranges.",
      "• Year-end bonus structures that survive January, funded from margin you can prove.",
      "• Build the 2027 number backward from the life you want, not forward from last year's production.",
      "Who this event is for",
      "Dental practice owners, associate dentists, office managers, and leadership teams who want to reduce insurance dependence and improve profitability. You will learn how to evaluate insurance plans, benchmark production, protect margins, and set realistic 2027 targets for a stronger, more sustainable practice.",
    ].join("\n"),
  },
  {
    slug: "td-2026-12-08-three-decisions-january",
    event_key: "td-2026-12-08",
    title: "Three Decisions to Make in January (Not March)",
    subtitle: "Your fee schedule, your membership plan and financing, and your practice capacity",
    series: "thriving_dentist",
    starts_at: "2026-12-08T20:00:00-05:00",
    duration_minutes: 60,
    format: "Live webinar",
    ce_credits: null,
    zoom_webinar_id: "85814600160",
    banner_url: "/events/td-2026-12-08-banner.jpg",
    description: [
      "January is the time to make the decisions that will shape your entire 2027, not March. This event focuses on three critical choices: your fee schedule, your membership plan and financing strategy, and your practice capacity. We'll look at when to raise fees, how to make care more affordable without sacrificing margin, and whether to hire, extend hours, or change your pricing. You'll also learn why delaying these decisions can cost you the year. Walk away with clear priorities and specific deadlines for putting your 2027 plan into action.",
      "Key discussion topics",
      "• The three decisions, and why March is too late. Owners who defer these lose the year, not the quarter.",
      "• The market is growing and your margin is not: US dental spend projected past $203 billion by 2027 while expenses per dentist rose 13.2% against a 1.2% revenue decline. This is the case for the fee decision.",
      "• Membership plans and financing move from courtesy to baseline expectation. The affordability squeeze is permanent, not cyclical.",
      "• You cannot hire your way out: roughly 90% of practices are still struggling to hire, and 88% say hygienist recruiting is very or extremely difficult. Capacity is a pricing decision as much as a staffing one.",
      "• Put dates on the January calendar, not intentions. Each decision gets a deadline before the session ends.",
    ].join("\n"),
  },
  {
    slug: "dms-2026-11-10-the-leaky-funnel",
    event_key: "dms-2026-11-10",
    title: "The Leaky Funnel",
    subtitle: "How Many New Patients Are You Losing Before They Ever Book?",
    series: "dms_live",
    starts_at: "2026-11-10T20:00:00-05:00",
    duration_minutes: 60,
    format: "Live webinar",
    ce_credits: 1,
    zoom_webinar_id: "83448917659",
    banner_url: "/events/dms-2026-11-10-banner.jpg",
    description: [
      "More leads do not automatically create more appointments. Missed calls, delayed follow-up, booking friction, and weak tracking can quietly waste the demand a practice already generates. This 60-minute session helps dental practice owners find the leaks between first inquiry and attended appointment, then build a more reliable conversion process.",
      "What you'll walk away with",
      "• Where new-patient opportunities disappear after marketing generates the lead",
      "• The four biggest leak points: missed calls, delayed follow-up, booking friction, and weak accountability",
      "• How the first phone conversation influences whether a patient books",
      "• Practical ways to handle common booking objections without sounding scripted",
      "• Why speed-to-response matters and what same-day follow-up should include",
      "• How to measure the path from inquiry to booked and attended appointment",
      "Earn 1 CE credit. Replay access included.",
    ].join("\n"),
  },
  {
    slug: "dms-2026-12-10-attract-the-right-patients",
    event_key: "dms-2026-12-10",
    title: "Attract the Right Patients",
    subtitle: "The Leadership, Care & Marketing Blueprint for a Full Schedule",
    series: "dms_live",
    starts_at: "2026-12-10T21:00:00-05:00",
    duration_minutes: 120,
    format: "Live virtual summit",
    ce_credits: 1,
    zoom_webinar_id: "89903175011",
    banner_url: "/events/dms-2026-12-10-banner.jpg",
    description: [
      "A full schedule is most valuable when it supports the practice you are actually trying to build. This two-hour summit connects leadership, marketing, and patient experience: defining the right growth destination, making the practice visible to the right prospective patients, and delivering care experiences that earn loyalty, treatment acceptance, and referrals.",
      "What you'll walk away with",
      "• How to define the right patients, procedures, services, and growth goals for the practice",
      "• How leadership decisions shape patient mix, capacity, profitability, and team alignment",
      "• How to turn the practice's real strengths into clear, credible positioning",
      "• How search, reviews, websites, social proof, and AI-assisted discovery influence patient choice",
      "• Where trust is won or lost across the complete patient journey",
      "• How consistent experiences turn new patients into loyal advocates and referral sources",
      "Earn 1 CE credit. Replay access included.",
    ].join("\n"),
  },
];

for (const e of EVENTS) {
  const row = { ...e, speakers: [], register_url: null, is_published: true, source: "admin" };
  if (DRY) { console.log("would upsert", e.slug, e.starts_at, "key", e.event_key); continue; }
  let { error } = await sb.from("portal_events").upsert(row, { onConflict: "slug" });
  if (error && /event_key/.test(error.message)) {
    // Migration 0081 not run yet: load the event without its key (members get
    // the fallback, not in-portal registration). Re-run after 0081 to set it.
    const noKey = { ...row };
    delete noKey.event_key;
    ({ error } = await sb.from("portal_events").upsert(noKey, { onConflict: "slug" }));
    if (!error) { console.warn("upserted WITHOUT event_key (run 0081 then re-run this script):", e.slug); continue; }
  }
  if (error) { console.error(e.slug, error.message); process.exit(1); }
  console.log("upserted", e.slug);
}
