import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { PortalEventsRow, PortalEventSpeaker } from "@/lib/supabase/types";
import { normalizeSeries, type EventSpeaker, type PortalEvent } from "./portalEvents";

/**
 * Server helpers for portal events: load rows, turn them into the shape
 * the pages use, and link speakers to DMN expert profiles.
 *
 * Expert matching: a speaker row may carry an expert_id from the sheet.
 * When it does not, the name is matched against the experts table
 * (case-insensitive, after dropping "Dr." and credentials), so the sheet
 * never needs an id for the link to appear.
 */

type ExpertLite = { id: string; full_name: string | null; display_name: string | null; status: string | null; headshot_url: string | null };
export type ExpertIndex = { byName: Map<string, string>; headshots: Map<string, string | null> };

function nameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(dr|mr|mrs|ms|dds|dmd|rdh|mba|cpa|e\.a)\b\.?/g, "")
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function loadExpertIndex(): Promise<ExpertIndex> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.from("experts").select("id, full_name, display_name, status, headshot_url").not("status", "in", "(archived,suspended)");
  const byName = new Map<string, string>();
  const headshots = new Map<string, string | null>();
  for (const e of (data ?? []) as ExpertLite[]) {
    headshots.set(e.id, e.headshot_url);
    for (const n of [e.full_name, e.display_name]) {
      if (n) byName.set(nameKey(n), e.id);
    }
  }
  return { byName, headshots };
}

export function toPortalEvent(row: PortalEventsRow, expertIdx: ExpertIndex): PortalEvent {
  const startsAt = new Date(row.starts_at).toISOString();
  const endsAt = new Date(Date.parse(startsAt) + row.duration_minutes * 60_000).toISOString();
  const speakers: EventSpeaker[] = ((row.speakers ?? []) as PortalEventSpeaker[])
    .filter((s) => s && typeof s.name === "string" && s.name.trim())
    .map((s) => {
      const expertId = s.expert_id || expertIdx.byName.get(nameKey(s.name)) || null;
      return {
        name: s.name.trim(),
        title: s.title?.trim() || null,
        company: s.company?.trim() || null,
        expertId,
        photoUrl: s.photo_url?.trim() || (expertId ? expertIdx.headshots.get(expertId) ?? null : null),
      };
    });
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    series: normalizeSeries(row.series),
    startsAt,
    endsAt,
    durationMinutes: row.duration_minutes,
    format: row.format,
    ceCredits: row.ce_credits === null ? null : Number(row.ce_credits),
    speakers,
    description: row.description,
    bannerUrl: row.banner_url,
    registerUrl: row.register_url,
    replayUrl: row.replay_url,
    replaySlug: row.replay_slug,
    replayRuntime: row.replay_runtime,
    eventKey: row.event_key ?? null,
    registerInPortal: !!row.event_key,
    registrationKind: row.event_key ? "event" : undefined,
  };
}

export async function loadPublishedEvents(): Promise<PortalEvent[]> {
  const sb = getSupabaseAdmin();
  const [{ data, error }, idx] = await Promise.all([
    sb.from("portal_events").select("*").eq("is_published", true).order("starts_at", { ascending: true }),
    loadExpertIndex(),
  ]);
  if (error) throw error;
  return ((data ?? []) as PortalEventsRow[]).map((r) => toPortalEvent(r, idx));
}

export async function loadEventBySlug(slug: string): Promise<PortalEvent | null> {
  const sb = getSupabaseAdmin();
  const [{ data, error }, idx] = await Promise.all([
    sb.from("portal_events").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(),
    loadExpertIndex(),
  ]);
  if (error) throw error;
  return data ? toPortalEvent(data as PortalEventsRow, idx) : null;
}
