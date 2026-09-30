import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { RIDA_TRIAL_END_ISO } from "@/lib/events/ridaReplay";
import { registerWebinarRegistrant, zoomConfigured } from "@/lib/events/zoom";

/**
 * DMN × RIDA events.
 *
 * The flow, in one line: verified entitlement → one "Pending" row in the
 * team's Google Sheet → the team registers the person in Zoom on Naren's
 * account (n8n or Amani's daily import) and Zoom emails the join link.
 *
 * The rule this module enforces: the sheet row (and therefore the Zoom
 * registration) is only ever written by the SERVER after the Stripe
 * webhook confirmed the trial subscription, or after a signed-in
 * member's active subscription was verified in the database. Nothing
 * the browser sends can create that row.
 *
 * SUMMIT is the LIVE offer: the RIDA Annual Summit on 6 November 2026,
 * with one fixed first-charge date for the whole cohort (offer spec,
 * updated 29 Sep 2026). SUMMIT_SEPT is the 16 September event, kept for
 * the admin list and the campaign export of people who registered
 * through us and did not finish joining.
 */

export type SummitEvent = {
  eventId: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  timeLabel: string;
  startsAt: string;
  zoomWebinarId: string;
  plan: "founding_monthly";
  /** Either a rolling trial in days, or one fixed trial_end for everyone. */
  trialDays: number | null;
  trialEnd: string | null;
  campaign: string;
  closesAt: string;
  ceCredits: number;
};

export const SUMMIT_SEPT: SummitEvent = {
  eventId: "rida-summit-2026-09-16",
  title: "Stop Losing Revenue You Already Earned",
  subtitle: "The Dental Practice Team Performance and Patient Retention System",
  dateLabel: "Wednesday, September 16, 2026",
  timeLabel: "7 to 9 PM Eastern",
  startsAt: "2026-09-16T19:00:00-04:00",
  zoomWebinarId: "83649870723",
  plan: "founding_monthly",
  trialDays: 30,
  trialEnd: null,
  campaign: "rida_summit_2026_09",
  closesAt: "2026-09-16T21:00:00-04:00",
  ceCredits: 2,
};

export const SUMMIT: SummitEvent = {
  eventId: "rida-annual-summit-2026-11-06",
  title: "Built to Stay: The Independent Practice Operating System",
  subtitle: "The Playbook for Practices Feeling the Squeeze",
  dateLabel: "Friday, November 6, 2026",
  timeLabel: "12:00 to 4:30 PM Eastern",
  /** ISO start, Eastern Standard Time (UTC−5). Confirm against Zoom before launch. */
  startsAt: "2026-11-06T12:00:00-05:00",
  /** The November webinar runs on Naren's Zoom account; set SUMMIT_ZOOM_WEBINAR_ID in the environment once it exists. */
  zoomWebinarId: process.env.SUMMIT_ZOOM_WEBINAR_ID ?? "",
  plan: "founding_monthly",
  /** The campaign offer: $0 today, nothing to pay until Wednesday 6 January 2027 for everyone, then $49/month. */
  trialDays: null,
  trialEnd: RIDA_TRIAL_END_ISO,
  /** utm_campaign the ads use for this event. The replay page sends utm_source=replay&utm_campaign=rida. */
  campaign: "rida_summit",
  /** Registrations close when the event ends. */
  closesAt: "2026-11-06T16:30:00-05:00",
  ceCredits: 4,
};

export const SUMMIT_EVENTS: SummitEvent[] = [SUMMIT, SUMMIT_SEPT];

export type RegistrationStatus =
  | "pending_payment"
  | "entitled"
  | "zoom_requested"
  | "zoom_registered"
  | "zoom_failed";

export type EventRegistrationRow = {
  id: string;
  event_id: string;
  member_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  practice_website_name: string | null;
  country: string | null;
  speaker_question: string | null;
  rida_member_interest: string | null;
  utm: Record<string, string>;
  landing_url: string | null;
  status: RegistrationStatus;
  entitled_via: "trial_checkout" | "existing_member" | null;
  stripe_session_id: string | null;
  stripe_subscription_id: string | null;
  entitled_at: string | null;
  zoom_webinar_id: string | null;
  zoom_registrant_id: string | null;
  zoom_join_url: string | null;
  zoom_requested_at: string | null;
  zoom_registered_at: string | null;
  zoom_attempts: number;
  zoom_error: string | null;
  confirmation_sent_at: string | null;
  sheet_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

/** event_registrations is post-typegen → untyped client (same escape hatch as lib/abandoned.ts). */
export function eventsDb(): SupabaseClient {
  return getSupabaseAdmin() as unknown as SupabaseClient;
}

export function summitOpen(now: Date = new Date()): boolean {
  return now.getTime() < new Date(SUMMIT.closesAt).getTime();
}

/** Stripe `trial_end` (unix seconds) for the live offer, or null when the event uses rolling trial days. */
export function summitTrialEndUnix(): number | null {
  return SUMMIT.trialEnd ? Math.floor(new Date(SUMMIT.trialEnd).getTime() / 1000) : null;
}

// ---------------------------------------------------------------------
// Sheet hand-off. Same pattern as the sales tracker: an Apps Script web
// app on the registrants spreadsheet accepts a JSON POST and appends
// one row. The shared secret keeps random posts out of the sheet.
//
//   SUMMIT_SHEET_WEBHOOK_URL   Apps Script /exec URL
//   SUMMIT_SHEET_SECRET        must equal SECRET in the Apps Script
// ---------------------------------------------------------------------

/** One sheet row. Column names must match the Registrants sheet headers exactly. */
export function sheetRowFor(reg: EventRegistrationRow): Record<string, string> {
  const utm = reg.utm ?? {};
  return {
    Registration_ID: reg.id,
    Registered_At: reg.entitled_at ?? new Date().toISOString(),
    Event_ID: reg.event_id,
    "First name": reg.first_name,
    "Last Name": reg.last_name,
    "Email address": reg.email,
    Phone: reg.phone ?? "",
    "Practice Website and Name": reg.practice_website_name ?? "",
    Country: reg.country ?? "",
    "Speaker Question": reg.speaker_question ?? "",
    "RIDA Member": reg.rida_member_interest ?? "",
    Member_ID: reg.member_id ?? "",
    Entitled_Via: reg.entitled_via ?? "",
    Member_Status: reg.entitled_via === "trial_checkout" ? "trialing" : "active",
    Status: "Pending",
    utm_source: utm.source ?? "",
    utm_medium: utm.medium ?? "",
    utm_campaign: utm.campaign ?? SUMMIT.campaign,
    utm_content: utm.content ?? "",
    utm_term: utm.term ?? "",
  };
}

/**
 * Append the entitled registration to the sheet. Idempotent on our side
 * (sheet_synced_at is set once) and on the Apps Script side (it skips a
 * Registration_ID it has already seen). Never throws: a sheet outage
 * must not break the Stripe webhook — the row stays `entitled` with
 * sheet_synced_at null and the ops alert goes out so a person can add
 * them by hand.
 */
export async function pushRegistrationToSheet(registrationId: string): Promise<boolean> {
  const sb = eventsDb();
  const { data } = await sb.from("event_registrations").select("*").eq("id", registrationId).maybeSingle();
  const reg = data as EventRegistrationRow | null;
  if (!reg || reg.status === "pending_payment") return false;
  if (reg.status === "zoom_registered" || reg.sheet_synced_at) return true;

  // Rushdha, 30 Sep 2026: the November event runs exactly like September.
  // The site writes ONE Pending row to the registrants sheet and the n8n
  // workflow "DMN x RIDA Summit" registers the person in Zoom on Naren's
  // account and writes the join link back; Zoom emails the registrant.
  // The direct Zoom API path below stays available but only switches on
  // with ZOOM_DIRECT_REGISTRATION=true plus the Zoom credentials.
  if (process.env.ZOOM_DIRECT_REGISTRATION === "true" && zoomConfigured() && SUMMIT.zoomWebinarId) {
    try {
      const z = await registerWebinarRegistrant({
        webinarId: SUMMIT.zoomWebinarId,
        email: reg.email,
        firstName: reg.first_name,
        lastName: reg.last_name,
        phone: reg.phone,
        org: reg.practice_website_name,
        customQuestion: reg.speaker_question,
      });
      await sb
        .from("event_registrations")
        .update({
          status: "zoom_registered",
          zoom_webinar_id: SUMMIT.zoomWebinarId,
          zoom_registrant_id: z.registrantId,
          zoom_join_url: z.joinUrl,
          zoom_requested_at: new Date().toISOString(),
          zoom_registered_at: new Date().toISOString(),
          zoom_error: null,
        })
        .eq("id", registrationId);
      try {
        const { sendSummitSeatEmail } = await import("@/lib/email/summitEmails");
        const sent = await sendSummitSeatEmail({ to: reg.email, firstName: reg.first_name, joinUrl: z.joinUrl });
        if (sent) await sb.from("event_registrations").update({ confirmation_sent_at: new Date().toISOString() }).eq("id", registrationId);
      } catch {
        /* the link is also on the confirmation page and in the portal */
      }
      return true;
    } catch (err) {
      const why = err instanceof Error ? err.message : "zoom failed";
      await sb.from("event_registrations").update({ zoom_error: why.slice(0, 900), zoom_attempts: reg.zoom_attempts + 1 }).eq("id", registrationId);
      // fall through to the sheet so the seat is still booked by a person
    }
  }

  const url = process.env.SUMMIT_SHEET_WEBHOOK_URL;
  const secret = process.env.SUMMIT_SHEET_SECRET;
  const fail = async (why: string) => {
    await sb.from("event_registrations").update({ zoom_error: why.slice(0, 900), zoom_attempts: reg.zoom_attempts + 1 }).eq("id", registrationId);
    try {
      const { sendSummitFailureAlert } = await import("@/lib/email/summitEmails");
      await sendSummitFailureAlert({ registrationId, email: reg.email, name: `${reg.first_name} ${reg.last_name}`.trim(), error: why });
    } catch {
      /* alert is best-effort */
    }
    return false;
  };

  if (!url || !secret) return fail("SUMMIT_SHEET_WEBHOOK_URL / SUMMIT_SHEET_SECRET not configured");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "summit_registration", secret, row: sheetRowFor(reg) }),
      signal: AbortSignal.timeout(10000),
      redirect: "follow", // Apps Script /exec answers with a 302 to the result
    });
    const text = (await res.text().catch(() => "")).trim();
    if (!res.ok || !/^ok/i.test(text)) return fail(`sheet append: ${res.status} ${text.slice(0, 200)}`);
    await sb
      .from("event_registrations")
      .update({ status: "zoom_requested", sheet_synced_at: new Date().toISOString(), zoom_requested_at: new Date().toISOString(), zoom_webinar_id: SUMMIT.zoomWebinarId, zoom_error: null })
      .eq("id", registrationId);
    return true;
  } catch (err) {
    return fail(`sheet unreachable: ${err instanceof Error ? err.message.slice(0, 300) : "unknown"}`);
  }
}

/**
 * Mark a registration ENTITLED (payment verified or existing member) and
 * push it to the sheet. Called from the Stripe webhook and the member
 * route. Safe to call repeatedly: only a pending row is moved, so a
 * replayed webhook cannot create a second sheet row.
 */
export async function entitleRegistration(
  registrationId: string,
  via: "trial_checkout" | "existing_member",
  extra: { memberId?: string | null; stripeSessionId?: string | null; stripeSubscriptionId?: string | null } = {},
): Promise<void> {
  await markEntitled(registrationId, via, extra);
  await pushRegistrationToSheet(registrationId);
}

/** Flip a pending row to entitled without touching the sheet (the caller pushes). */
export async function markEntitled(
  registrationId: string,
  via: "trial_checkout" | "existing_member",
  extra: { memberId?: string | null; stripeSessionId?: string | null; stripeSubscriptionId?: string | null } = {},
): Promise<void> {
  const sb = eventsDb();
  await sb
    .from("event_registrations")
    .update({
      status: "entitled",
      entitled_via: via,
      entitled_at: new Date().toISOString(),
      ...(extra.memberId ? { member_id: extra.memberId } : {}),
      ...(extra.stripeSessionId ? { stripe_session_id: extra.stripeSessionId } : {}),
      ...(extra.stripeSubscriptionId ? { stripe_subscription_id: extra.stripeSubscriptionId } : {}),
    })
    .eq("id", registrationId)
    .eq("status", "pending_payment");
}
