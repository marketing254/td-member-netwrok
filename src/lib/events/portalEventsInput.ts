import "server-only";
import { normalizeSeries } from "./portalEvents";
import type { PortalEventSpeaker } from "@/lib/supabase/types";

/**
 * One validator for every way an event reaches the portal_events table:
 * the admin editor (/api/admin/events) and the n8n sheet sync
 * (/api/events/sync). Accepts the sheet's own column names as well as the
 * table's, so an n8n workflow can post the row almost as-is.
 *
 * Accepted keys (either spelling):
 *   slug | Slug                      optional; made from the title + date when missing
 *   title | Title                    required
 *   subtitle | Subtitle | Topic
 *   series | Series                  "RIDA" | "DMS Live" | "Thriving Dentist" | "Insurance Untangled"
 *   starts_at | Start                ISO date-time, e.g. 2026-11-18T12:00:00-05:00
 *     or  date + time (Eastern):     date | Date = "2026-11-18", time | Time = "12:00 PM"
 *   duration_minutes | Length        number of minutes (default 60)
 *   format | Format                  "Live on Zoom" | "Live webinar" | "Virtual summit"
 *   ce_credits | CE                  number, blank for none
 *   speakers | Speakers              array of {name,title,company,expert_id,photo_url} or a text block,
 *                                    one speaker per line: "Name, Title, Company, https://photo"
 *   description | Description
 *   banner_url | Banner              Drive link or image URL
 *   register_url | Register          registration link
 *   zoom_webinar_id | Webinar ID
 *   event_key | Event key           the Events Config key in the registrants sheet (members register in the portal)
 *   replay_url | Replay              added after the event
 *   replay_slug                      in-portal replay (/dashboard/replays/<slug>)
 *   replay_runtime
 *   is_published | Published         default true ("no", "false", "0" hide the event)
 */

export type EventInput = {
  slug: string;
  title: string;
  subtitle: string | null;
  series: string;
  starts_at: string;
  duration_minutes: number;
  format: string | null;
  ce_credits: number | null;
  speakers: PortalEventSpeaker[];
  description: string | null;
  banner_url: string | null;
  register_url: string | null;
  zoom_webinar_id: string | null;
  event_key: string | null;
  replay_url: string | null;
  replay_slug: string | null;
  replay_runtime: string | null;
  is_published: boolean;
};

type Raw = Record<string, unknown>;

function pick(raw: Raw, ...keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] !== undefined && raw[k] !== null && raw[k] !== "") return raw[k];
  }
  return undefined;
}

function str(v: unknown, max = 4000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function num(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function bool(v: unknown, dflt: boolean): boolean {
  if (v === undefined || v === null || v === "") return dflt;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (["no", "false", "0", "hidden", "draft"].includes(s)) return false;
  if (["yes", "true", "1", "published", "live"].includes(s)) return true;
  return dflt;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** "2026-11-18" + "12:00 PM" (Eastern) → ISO. Handles EST/EDT by probing the offset for that date. */
function easternToIso(date: string, time: string): string | null {
  const dm = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dm) return null;
  let hh = 0;
  let mm = 0;
  const tm = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!tm) return null;
  hh = parseInt(tm[1], 10);
  mm = tm[2] ? parseInt(tm[2], 10) : 0;
  const ap = tm[3]?.toLowerCase();
  if (ap === "pm" && hh < 12) hh += 12;
  if (ap === "am" && hh === 12) hh = 0;
  // Find the Eastern offset in force on that date (-5 or -4).
  const probe = new Date(Date.UTC(+dm[1], +dm[2] - 1, +dm[3], 12));
  const tz = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "shortOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  const off = parseInt(tz.replace("GMT", ""), 10) || -5;
  const utcMs = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], hh - off, mm);
  return new Date(utcMs).toISOString();
}

function parseSpeakers(v: unknown): PortalEventSpeaker[] {
  if (Array.isArray(v)) {
    return v
      .map((s) => {
        if (typeof s === "string") return parseSpeakerLine(s);
        if (s && typeof s === "object") {
          const o = s as Raw;
          const name = str(pick(o, "name", "Name"), 120);
          if (!name) return null;
          return {
            name,
            title: str(pick(o, "title", "Title", "role", "Role"), 160),
            company: str(pick(o, "company", "Company"), 160),
            expert_id: str(pick(o, "expert_id", "expertId"), 64),
            photo_url: str(pick(o, "photo_url", "photoUrl", "photo", "Photo"), 1000),
          };
        }
        return null;
      })
      .filter((s): s is PortalEventSpeaker => !!s)
      .slice(0, 40);
  }
  if (typeof v === "string") {
    return v
      .split(/\r?\n|;/)
      .map(parseSpeakerLine)
      .filter((s): s is PortalEventSpeaker => !!s)
      .slice(0, 40);
  }
  return [];
}

function parseSpeakerLine(line: string): PortalEventSpeaker | null {
  const parts = line.split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  // A trailing http(s) link is the photo.
  let photo: string | null = null;
  if (parts.length > 1 && /^https?:\/\//i.test(parts[parts.length - 1])) photo = parts.pop()!.slice(0, 1000);
  const [name, title, ...rest] = parts;
  return { name: name.slice(0, 120), title: title ? title.slice(0, 160) : null, company: rest.length ? rest.join(", ").slice(0, 160) : null, expert_id: null, photo_url: photo };
}

export type ValidationResult = { ok: true; value: EventInput } | { ok: false; error: string };

export function validateEventInput(raw: Raw): ValidationResult {
  const title = str(pick(raw, "title", "Title"), 200);
  if (!title) return { ok: false, error: "Title is required." };

  let startsAt: string | null = null;
  const direct = pick(raw, "starts_at", "startsAt", "Start", "start");
  if (direct !== undefined) {
    const d = new Date(String(direct));
    if (!Number.isNaN(d.getTime())) startsAt = d.toISOString();
  }
  if (!startsAt) {
    const date = str(pick(raw, "date", "Date"), 20);
    const time = str(pick(raw, "time", "Time", "start_time"), 20) ?? "12:00 PM";
    if (date) startsAt = easternToIso(date, time);
  }
  if (!startsAt) return { ok: false, error: `"${title}": needs a start (starts_at ISO, or date + time in Eastern).` };

  const duration = num(pick(raw, "duration_minutes", "durationMinutes", "Length", "length", "Duration", "duration")) ?? 60;
  const slugIn = str(pick(raw, "slug", "Slug"), 80);
  const slug = slugify(slugIn ?? `${title}-${startsAt.slice(0, 10)}`);
  if (!slug) return { ok: false, error: `"${title}": could not make a slug.` };

  return {
    ok: true,
    value: {
      slug,
      title,
      subtitle: str(pick(raw, "subtitle", "Subtitle", "topic", "Topic"), 300),
      series: normalizeSeries(str(pick(raw, "series", "Series"), 60)),
      starts_at: startsAt,
      duration_minutes: Math.max(5, Math.min(24 * 60, Math.round(duration))),
      format: str(pick(raw, "format", "Format"), 80),
      ce_credits: num(pick(raw, "ce_credits", "ceCredits", "CE", "ce", "CE credits")),
      speakers: parseSpeakers(pick(raw, "speakers", "Speakers")),
      description: str(pick(raw, "description", "Description"), 6000),
      banner_url: str(pick(raw, "banner_url", "bannerUrl", "Banner", "banner"), 1000),
      register_url: str(pick(raw, "register_url", "registerUrl", "Register", "register", "Registration link"), 1000),
      zoom_webinar_id: str(pick(raw, "zoom_webinar_id", "zoomWebinarId", "Webinar ID", "webinar_id"), 40),
      event_key: str(pick(raw, "event_key", "eventKey", "Event key", "Event Key"), 80),
      replay_url: str(pick(raw, "replay_url", "replayUrl", "Replay", "replay", "Replay link"), 1000),
      replay_slug: str(pick(raw, "replay_slug", "replaySlug"), 120),
      replay_runtime: str(pick(raw, "replay_runtime", "replayRuntime", "Runtime"), 40),
      is_published: bool(pick(raw, "is_published", "isPublished", "Published", "published"), true),
    },
  };
}
