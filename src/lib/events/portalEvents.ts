/**
 * Portal events (Lester's design pick, 5 Nov 2026): the shared, client-safe
 * helpers for /dashboard/events, the event page, the Overview card and the
 * admin editor. Data comes from the portal_events table (migration 0080)
 * through /api/member/events; nothing here touches the database.
 *
 * Rules from the brief:
 *  - every time is shown in Eastern, plus the member's own time;
 *  - "Add to calendar" for Google, Outlook and Apple;
 *  - an event moves to Replays on its own once it has ended;
 *  - never label an event "members only" or show a price when it is open
 *    to everyone.
 */

export const EASTERN = "America/New_York";

/**
 * Master switch (Rushdha, 5 Nov 2026): nothing under Events is shown to
 * members until this is "true" in the environment. Admin sessions can
 * still open the pages to check them.
 */
export const EVENTS_ENABLED = process.env.NEXT_PUBLIC_EVENTS_ENABLED === "true";

export type EventSpeaker = {
  name: string;
  title: string | null;
  company: string | null;
  /** Set when the speaker is a DMN expert; the page links to their profile. */
  expertId: string | null;
  /** From the sheet, or the expert's profile headshot. Initials when null. */
  photoUrl: string | null;
};

export type PortalEvent = {
  slug: string;
  title: string;
  subtitle: string | null;
  series: SeriesKey;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  format: string | null;
  ceCredits: number | null;
  speakers: EventSpeaker[];
  description: string | null;
  bannerUrl: string | null;
  registerUrl: string | null;
  replayUrl: string | null;
  replaySlug: string | null;
  replayRuntime: string | null;
  /** Non-RIDA events: the Events Config key in the registrants sheet. */
  eventKey: string | null;
  /** The signed-in member already has a seat (event_registrations). */
  registered?: boolean;
  /**
   * Register opens the in-portal form (details pre-filled, Zoom's questions,
   * seat booked through the sheet and n8n). False = the Register button
   * opens registerUrl instead.
   */
  registerInPortal?: boolean;
  /** Which questions the in-portal form asks: the RIDA set, or the event set (practice + question). */
  registrationKind?: "rida" | "event";
};

// ─── series ──────────────────────────────────────────────────────────
export type SeriesKey = "rida" | "dms_live" | "thriving_dentist" | "insurance_untangled" | "other";

export const SERIES: Record<SeriesKey, { label: string; color: string; soft: string; gradient: string }> = {
  rida: { label: "RIDA", color: "#1F4E8C", soft: "#E6EEF8", gradient: "linear-gradient(135deg, #16365F 0%, #2A5D9E 60%, #6B7B8C 100%)" },
  dms_live: { label: "DMS Live", color: "#0F766E", soft: "#E3F2F0", gradient: "linear-gradient(135deg, #0B4F4A 0%, #15897F 100%)" },
  thriving_dentist: { label: "Thriving Dentist", color: "#7C3F1F", soft: "#F6E9E2", gradient: "linear-gradient(135deg, #5A2C14 0%, #9C5A33 100%)" },
  insurance_untangled: { label: "Insurance Untangled", color: "#5B3D9A", soft: "#EDE7F7", gradient: "linear-gradient(135deg, #3F2A6E 0%, #7556B8 100%)" },
  other: { label: "DMN", color: "#0A1A2F", soft: "#EEF1F4", gradient: "linear-gradient(135deg, #0A1A2F 0%, #2C4A6E 100%)" },
};

export const SERIES_KEYS = Object.keys(SERIES) as SeriesKey[];

/** Accepts the sheet's wording ("DMS Live", "Thriving Dentist", "RIDA") or the key itself. */
export function normalizeSeries(input: string | null | undefined): SeriesKey {
  const v = (input ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (v.startsWith("rida")) return "rida";
  if (v.startsWith("dms")) return "dms_live";
  if (v.startsWith("thriving")) return "thriving_dentist";
  if (v.startsWith("insurance")) return "insurance_untangled";
  return "other";
}

// ─── format filters ──────────────────────────────────────────────────
export type FormatFilter = "all" | "summit" | "live" | "webinar" | "ce";

export const FORMAT_FILTERS: { key: FormatFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "summit", label: "Summits" },
  { key: "live", label: "Live shows" },
  { key: "webinar", label: "Webinars" },
  { key: "ce", label: "CE credits" },
];

export function formatBucket(format: string | null): "summit" | "live" | "webinar" {
  const f = (format ?? "").toLowerCase();
  if (f.includes("summit")) return "summit";
  if (f.includes("webinar")) return "webinar";
  return "live";
}

export function matchesFilter(e: PortalEvent, f: FormatFilter): boolean {
  if (f === "all") return true;
  if (f === "ce") return (e.ceCredits ?? 0) > 0;
  return formatBucket(e.format) === f;
}

// ─── timing ──────────────────────────────────────────────────────────
export type EventPhase = "upcoming" | "live" | "ended";

export function eventPhase(e: Pick<PortalEvent, "startsAt" | "endsAt">, now = Date.now()): EventPhase {
  const s = Date.parse(e.startsAt);
  const en = Date.parse(e.endsAt);
  if (now < s) return "upcoming";
  if (now < en) return "live";
  return "ended";
}

export function hasReplay(e: Pick<PortalEvent, "replayUrl" | "replaySlug">): boolean {
  return !!(e.replayUrl || e.replaySlug);
}

/** Where "Watch" goes: the in-portal replay page when there is one, else the link from the sheet. */
export function replayHref(e: Pick<PortalEvent, "slug" | "replayUrl" | "replaySlug">): string | null {
  if (e.replaySlug) return `/dashboard/replays/${e.replaySlug}`;
  if (e.replayUrl) return `/dashboard/events/${e.slug}`;
  return null;
}

export function countdownParts(target: string, now = Date.now()) {
  const s = Math.max(0, Math.floor((Date.parse(target) - now) / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function countdownLabel(target: string, now = Date.now()): string {
  const t = countdownParts(target, now);
  if (t.d > 0) return `${t.d} d ${t.h} h ${t.m} m`;
  if (t.h > 0) return `${t.h} h ${t.m} m ${t.s} s`;
  return `${t.m} m ${t.s} s`;
}

// ─── formatting ──────────────────────────────────────────────────────
const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(opts: Intl.DateTimeFormatOptions & { timeZone?: string }): Intl.DateTimeFormat {
  const key = JSON.stringify(opts);
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", opts);
    fmtCache.set(key, f);
  }
  return f;
}

/** "Fri 6 Nov 2026" */
export function dateLabel(iso: string, tz = EASTERN): string {
  const d = new Date(iso);
  const parts = fmt({ timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}

/** "Friday 6 November 2026" */
export function longDateLabel(iso: string, tz = EASTERN): string {
  const d = new Date(iso);
  const parts = fmt({ timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}

/** "11:00 AM" */
export function timeLabel(iso: string, tz = EASTERN): string {
  return fmt({ timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** "11:00 AM ET" (uses EST/EDT as appropriate but prints the plain "ET"). */
export function easternTimeLabel(iso: string): string {
  return `${timeLabel(iso, EASTERN)} ET`;
}

/** The member's own browser time zone, or null on the server. */
export function localTimeZone(): string | null {
  if (typeof Intl === "undefined") return null;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

/** "9:30 PM your time", or "" when the member is already on Eastern time. */
export function yourTimeLabel(iso: string, tz: string | null): string {
  if (!tz || tz === EASTERN) return "";
  const eastern = timeLabel(iso, EASTERN);
  const local = timeLabel(iso, tz);
  const localDay = fmt({ timeZone: tz, day: "numeric" }).format(new Date(iso));
  const easternDay = fmt({ timeZone: EASTERN, day: "numeric" }).format(new Date(iso));
  if (eastern === local && localDay === easternDay) return "";
  const dayNote = localDay !== easternDay ? ` ${fmt({ timeZone: tz, weekday: "short" }).format(new Date(iso))}` : "";
  return `${local}${dayNote} your time`;
}

/** { month: "NOV", day: "18", weekday: "WED" } for the date tiles, in Eastern. */
export function dateTile(iso: string) {
  const d = new Date(iso);
  return {
    month: fmt({ timeZone: EASTERN, month: "short" }).format(d).toUpperCase(),
    day: fmt({ timeZone: EASTERN, day: "numeric" }).format(d),
    weekday: fmt({ timeZone: EASTERN, weekday: "short" }).format(d).toUpperCase(),
  };
}

/** "YYYY-MM-DD" of the event in Eastern, used to place it on the month grid. */
export function easternDateKey(iso: string): string {
  const parts = fmt({ timeZone: EASTERN, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function ceLabel(credits: number | null): string | null {
  if (!credits || credits <= 0) return null;
  const n = Number.isInteger(credits) ? String(credits) : credits.toFixed(1);
  return `${n} CE credit${credits === 1 ? "" : "s"}`;
}

/** "Next up · This Friday" / "Next up · Tomorrow" / "Next up · 18 November" */
export function nextUpLabel(iso: string, now = Date.now()): string {
  const days = Math.floor((Date.parse(iso) - now) / 86400000);
  if (days < 0) return "Happening now";
  if (days === 0) return "Next up · Today";
  if (days === 1) return "Next up · Tomorrow";
  if (days < 7) return `Next up · This ${fmt({ timeZone: EASTERN, weekday: "long" }).format(new Date(iso))}`;
  return `Next up · ${fmt({ timeZone: EASTERN, day: "numeric", month: "long" }).format(new Date(iso))}`;
}

export function speakersSummary(speakers: EventSpeaker[]): string {
  if (!speakers.length) return "";
  const experts = speakers.filter((s) => s.expertId).length;
  const n = speakers.length;
  const base = `${n} speaker${n === 1 ? "" : "s"}`;
  return experts ? `${base}, ${experts} of them in this network` : base;
}

export function initials(name: string): string {
  return name
    .replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── banners ─────────────────────────────────────────────────────────
/**
 * The sheet gives a Google Drive share link. Browsers cannot show those
 * directly, so a Drive link is turned into Drive's image endpoint. The
 * file must be shared as "Anyone with the link". Any other URL is used
 * as-is.
 */
export function bannerSrc(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1600`;
  return url;
}

// ─── calendar links ──────────────────────────────────────────────────
function compactUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function eventPageUrl(slug: string, origin = "https://www.dentalmembernetwork.com"): string {
  return `${origin}/dashboard/events/${slug}`;
}

export function calendarDescription(e: PortalEvent, origin?: string): string {
  const lines = [e.subtitle, e.description?.split(/\n+/)[0], "", `Event page: ${eventPageUrl(e.slug, origin)}`];
  if (e.registerUrl) lines.push(`Register: ${e.registerUrl.startsWith("/") ? (origin ?? "https://www.dentalmembernetwork.com") + e.registerUrl : e.registerUrl}`);
  return lines.filter((l): l is string => l !== null && l !== undefined).join("\n");
}

export function googleCalendarUrl(e: PortalEvent, origin?: string): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${compactUtc(e.startsAt)}/${compactUtc(e.endsAt)}`,
    details: calendarDescription(e, origin),
    location: e.format ?? "Online",
    ctz: EASTERN,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function outlookCalendarUrl(e: PortalEvent, origin?: string): string {
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: e.title,
    startdt: new Date(e.startsAt).toISOString(),
    enddt: new Date(e.endsAt).toISOString(),
    body: calendarDescription(e, origin),
    location: e.format ?? "Online",
  });
  return `https://outlook.live.com/calendar/0/action/compose?${p.toString()}`;
}

/** Apple (and any other calendar app): the .ics file served by the API. */
export function icsUrl(slug: string): string {
  return `/api/member/events/${slug}/ics`;
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export function buildIcs(e: PortalEvent, origin?: string): string {
  const stamp = compactUtc(new Date().toISOString());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dental Member Network//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.slug}@dentalmembernetwork.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${compactUtc(e.startsAt)}`,
    `DTEND:${compactUtc(e.endsAt)}`,
    `SUMMARY:${icsEscape(e.title)}`,
    `DESCRIPTION:${icsEscape(calendarDescription(e, origin))}`,
    `LOCATION:${icsEscape(e.format ?? "Online")}`,
    `URL:${eventPageUrl(e.slug, origin)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
