import { NextResponse } from "next/server";
import { requireMemberOrAdminPreview } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";
import { loadEventBySlug, loadPublishedEvents } from "@/lib/events/portalEventsServer";
import { eventsDb, SUMMIT } from "@/lib/events/summit";
import { EVENTS_ENABLED, eventPhase, type PortalEvent } from "@/lib/events/portalEvents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/member/events            → { upcoming, replays }
 * GET /api/member/events?slug=…     → { event }
 *
 * Upcoming = not ended yet (live events stay here until they end).
 * Replays  = every ended event, newest first (with or without a replay
 * link; the card says "Replay coming soon" until one is added).
 *
 * For the RIDA summit, `registered` says whether the signed-in member
 * already has a seat (the portal's existing registration path).
 */
export async function GET(req: Request) {
  const guard = await requireMemberOrAdminPreview();
  if (!guard.ok) return guard.response;

  // Hidden from members until the switch is on; admins can still check.
  if (!EVENTS_ENABLED && !guard.isAdminPreview) return NextResponse.json({ error: "Events are not open yet." }, { status: 404 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  try {
    const registeredSlugs = await registrationsFor(guard.isAdminPreview ? null : guard.memberId);
    const decorate = (e: PortalEvent): PortalEvent => ({
      ...e,
      registered: registeredSlugs.has(e.slug),
      // The summit always registers in the portal (its webinar id lives in
      // the environment, not on the row).
      registerInPortal: e.registerInPortal || e.slug === SUMMIT.eventId,
      registrationKind: e.slug === SUMMIT.eventId ? "rida" : e.registrationKind,
    });

    if (slug) {
      const event = await loadEventBySlug(slug);
      if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
      return NextResponse.json({ event: decorate(event) });
    }

    const all = (await loadPublishedEvents()).map(decorate);
    const now = Date.now();
    const upcoming = all.filter((e) => eventPhase(e, now) !== "ended");
    // Past: every ended event, newest first, the moment it ends (the next
    // one takes the spotlight). Cards without a replay yet say so.
    const replays = all
      .filter((e) => eventPhase(e, now) === "ended")
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    return NextResponse.json({ upcoming, replays });
  } catch (err) {
    return serverError(err, { route: "GET /api/member/events" });
  }
}

/** Slugs of every event the member holds a seat for (event_id = the event slug). Keyed by member, since a seat may be booked under another email. */
async function registrationsFor(memberId: string | null): Promise<Set<string>> {
  const out = new Set<string>();
  if (!memberId) return out;
  const { data } = await eventsDb()
    .from("event_registrations")
    .select("event_id, status")
    .eq("member_id", memberId)
    .in("status", ["entitled", "zoom_requested", "zoom_registered"]);
  for (const r of (data ?? []) as { event_id: string }[]) out.add(r.event_id);
  return out;
}
