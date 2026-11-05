import { NextResponse, after } from "next/server";
import { requireMember } from "@/lib/auth/guards";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import { SUMMIT, eventsDb, markEntitled, pushEventRegistrationToSheet, pushRegistrationToSheet, type EventRegistrationRow } from "@/lib/events/summit";
import { countryFromGeo, isCountryCode, isEventCountryCode, isJobTitle, isMemberInterest } from "@/lib/events/summitForm";
import { loadEventBySlug } from "@/lib/events/portalEventsServer";
import { EVENTS_ENABLED, eventPhase } from "@/lib/events/portalEvents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * In-portal event registration (Rushdha, 5 Nov 2026): a member never leaves
 * the portal to book a seat. Same chain as the summit's member path:
 *
 *   member clicks Register → form pre-filled from their member row →
 *   POST here → row in event_registrations (status entitled) → one Pending
 *   row in the registrants sheet → n8n registers them in Zoom → Zoom emails
 *   the join link.
 *
 *   GET  → { firstName, lastName, email, phone, practiceName, geoCountry,
 *            registration: { status } | null }
 *   POST { email, phone, practiceWebsiteName, jobTitle, country, speakerQuestion, memberInterest }
 *        → { ok, status }
 *
 * Non-RIDA events ask what their Zoom webinars require (TD and DMS, Nov/Dec
 * 2026): mobile, job title, practice name and website, country, a question,
 * and on DMS webinars "Would you like to become a DMS member?". n8n maps the
 * answers onto the webinar's own question titles, so every required Zoom
 * question is answered and the registration cannot fail on a missing one.
 *
 * The member may register with a different email (Rushdha, 5 Nov 2026):
 * `email` on the row is where Zoom sends the join link; the account is
 * always kept on `member_id` plus `utm.member_email`, and both go to the
 * sheet, so we always know which member booked the seat. Registrations
 * are looked up by member, not by email.
 *
 * Works for the RIDA summit (slug = SUMMIT.eventId) and for any portal
 * event that has a Zoom webinar id. Paid or trialing members only.
 */

const PHONE_RE = /^[+()\d][\d\s().-]{5,39}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SEATED = ["entitled", "zoom_requested", "zoom_registered"];

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function memberEntitlement(memberId: string) {
  const { data } = await getSupabaseAdmin()
    .from("members")
    .select("id, email, first_name, last_name, phone, practice_name, subscription_status, stripe_subscription_id")
    .eq("id", memberId)
    .maybeSingle();
  const paid = !!data?.stripe_subscription_id && (data.subscription_status === "active" || data.subscription_status === "trialing");
  return { member: data, paid };
}

/** The member's seat for this event, if any (latest row by member, not by email). */
async function seatFor(slug: string, memberId: string) {
  const { data } = await eventsDb()
    .from("event_registrations")
    .select("id, status, email")
    .eq("event_id", slug)
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Pick<EventRegistrationRow, "id" | "status" | "email"> | null;
}

function geoCountry(req: Request): string {
  const c = (req.headers.get("x-vercel-ip-country") ?? "").toUpperCase();
  return c ? countryFromGeo(c) : "";
}

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const guard = await requireMember();
  if (!guard.ok) return guard.response;
  if (!EVENTS_ENABLED) return NextResponse.json({ error: "Events are not open yet." }, { status: 404 });
  const { slug } = await ctx.params;
  try {
    const { member, paid } = await memberEntitlement(guard.memberId);
    const reg = await seatFor(slug, guard.memberId);
    return NextResponse.json({
      ok: true,
      paid,
      firstName: member?.first_name ?? guard.firstName ?? "",
      lastName: member?.last_name ?? "",
      email: reg?.email ?? member?.email ?? guard.email,
      accountEmail: member?.email ?? guard.email,
      phone: member?.phone ?? "",
      practiceName: member?.practice_name ?? "",
      geoCountry: geoCountry(req),
      registration: reg ? { status: reg.status } : null,
    });
  } catch (err) {
    return serverError(err, { route: "GET /api/member/events/[slug]/register" });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const route = "POST /api/member/events/[slug]/register";
  const guard = await requireMember();
  if (!guard.ok) return guard.response;
  if (!EVENTS_ENABLED) return NextResponse.json({ error: "Events are not open yet." }, { status: 404 });
  const { slug } = await ctx.params;

  const rl = checkRateLimit(`event-register:${guard.memberId}`);
  if (!rl.allowed) return apiError.rateLimited(route);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return apiError.badRequest();
  }

  const email = str(body.email, 254).toLowerCase();
  const phone = str(body.phone, 40);
  const practiceWebsiteName = str(body.practiceWebsiteName, 200);
  const jobTitle = isJobTitle(body.jobTitle) ? body.jobTitle : null;
  const country = isCountryCode(body.country) || isEventCountryCode(body.country) ? (body.country as string).toUpperCase() : null;
  const speakerQuestion = str(body.speakerQuestion, 1000) || null;
  const memberInterest = isMemberInterest(body.memberInterest) ? (body.memberInterest as string) : null;
  if (email && !EMAIL_RE.test(email)) return apiError.validation("Please enter a valid email address.", route);
  if (!PHONE_RE.test(phone)) return apiError.validation("Please enter a valid mobile phone number.", route);
  if (practiceWebsiteName.length < 2) return apiError.validation("Please enter your practice name.", route);

  try {
    const event = await loadEventBySlug(slug);
    if (!event) return apiError.notFound(route);
    const isSummit = slug === SUMMIT.eventId;
    if (!isSummit && !event.eventKey) {
      return NextResponse.json({ error: "This event is registered on the organiser's page." }, { status: 409 });
    }
    if (!jobTitle) return apiError.validation("Please tell us which best describes you.", route);
    if (!isSummit) {
      // The webinar's questions are all required in Zoom.
      if (!country) return apiError.validation("Please choose your country.", route);
      if (!speakerQuestion) return apiError.validation("Please add a question for the panel.", route);
      if (event.series === "dms_live" && !memberInterest) return apiError.validation("Please tell us if you'd like to become a DMS member.", route);
    }
    if (eventPhase(event) === "ended") return NextResponse.json({ error: "This event has ended." }, { status: 410 });

    const { member, paid } = await memberEntitlement(guard.memberId);
    if (!member) return apiError.forbidden(route);
    if (!paid) {
      return NextResponse.json({ error: "Your membership isn't active yet. Activate it to register for events.", reason: "payment_required" }, { status: 402 });
    }

    // Already seated (under any email) → say so, never book a second seat.
    const existing = await seatFor(slug, member.id);
    if (existing && SEATED.includes(existing.status)) {
      return NextResponse.json({ ok: true, status: "zoom_registered", message: "You're already registered. Your Zoom link was emailed to you." });
    }

    const accountEmail = member.email.toLowerCase();
    if (email && email !== accountEmail) {
      // The chosen email must not belong to someone else's seat for this event.
      const { data: taken } = await eventsDb().from("event_registrations").select("member_id").eq("event_id", slug).eq("email", email).maybeSingle();
      if (taken && (taken as { member_id: string | null }).member_id !== member.id) {
        return apiError.validation("That email already has a seat for this event. Please use another one.", route);
      }
    }
    const { data: reg, error } = await eventsDb()
      .from("event_registrations")
      .upsert(
        {
          event_id: slug,
          member_id: member.id,
          email: email || accountEmail,
          first_name: member.first_name || guard.firstName || "Member",
          last_name: member.last_name || "",
          phone,
          practice_website_name: practiceWebsiteName,
          speaker_question: speakerQuestion,
          job_title: jobTitle,
          country,
          // Organiser membership question: RIDA's on the summit, DMS's on the DMS webinars.
          ...(memberInterest ? { rida_member_interest: memberInterest } : {}),
          utm: { source: "member_portal", campaign: isSummit ? SUMMIT.campaign : "portal_events", member_email: accountEmail },
        },
        { onConflict: "event_id,email" },
      )
      .select("id, status")
      .single();
    if (error || !reg) return serverError(error ?? new Error("upsert failed"), { route });

    if (reg.status === "zoom_registered") {
      return NextResponse.json({ ok: true, status: "zoom_registered", message: "You're already registered. Your Zoom link was emailed to you." });
    }

    // Verified member → entitled now; the sheet append runs after the reply
    // so the button answers at once. markEntitled only moves pending rows, so
    // a double click cannot create a second sheet row.
    await markEntitled(reg.id, "existing_member", { memberId: member.id });
    const eventKey = event.eventKey;
    after(() => (isSummit || !eventKey ? pushRegistrationToSheet(reg.id) : pushEventRegistrationToSheet(reg.id, eventKey)));
    return NextResponse.json({ ok: true, status: "entitled" });
  } catch (err) {
    return serverError(err, { route });
  }
}
