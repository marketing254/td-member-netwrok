"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { PortalEvent } from "@/lib/events/portalEvents";

/*
 * Seats booked in this browser session. The moment the form succeeds, every
 * Register button for that event (spotlight, list, month panel, Overview
 * card, event page) flips to "You're registered" without a reload. The API
 * reports the same on the next load, so this only bridges the gap.
 */
const KEY = "dmn.events.registered";
let registeredSlugs: ReadonlySet<string> = new Set<string>();
let loaded = false; // session storage read once; the snapshot must keep a stable reference
const listeners = new Set<() => void>();
function readStored(): Set<string> {
  try {
    return new Set<string>(JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}
export function markRegistered(slug: string) {
  const next = new Set(snapshot());
  next.add(slug);
  registeredSlugs = next;
  loaded = true;
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* private mode: in-memory only */
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function snapshot() {
  if (!loaded && typeof sessionStorage !== "undefined") {
    registeredSlugs = readStored();
    loaded = true;
  }
  return registeredSlugs;
}
const EMPTY: ReadonlySet<string> = new Set<string>();
/** True once the member has booked this event in this session (or the API says so). */
export function useRegistered(event: Pick<PortalEvent, "slug" | "registered">): boolean {
  const set = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  return !!event.registered || set.has(event.slug);
}

export type EventsFeed = { upcoming: PortalEvent[]; replays: PortalEvent[] };

/** Loads /api/member/events once; `error` is a plain sentence for the page. */
export function useEventsFeed() {
  const [feed, setFeed] = useState<EventsFeed | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/member/events", { credentials: "same-origin", cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error ?? "Could not load events.");
        return (await r.json()) as EventsFeed;
      })
      .then((d) => alive && setFeed(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);
  return { feed, error, loading: !feed && !error };
}

export function useEvent(slug: string) {
  const [event, setEvent] = useState<PortalEvent | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/api/member/events?slug=${encodeURIComponent(slug)}`, { credentials: "same-origin", cache: "no-store" })
      .then(async (r) => {
        if (r.status === 404) return { event: null };
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error ?? "Could not load this event.");
        return (await r.json()) as { event: PortalEvent };
      })
      .then((d) => alive && setEvent(d.event))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [slug]);
  return { event, error, loading: event === undefined && !error };
}

/** Re-renders once a second (for countdowns) and returns the current time. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
