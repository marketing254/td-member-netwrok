"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * Replay page counters, for the brief's "a play count and the number of
 * clicks on the button, visible in the admin console". Each event goes to
 * GA4 and to our own replay_events table (0069), so the admin dashboard
 * can show the two numbers without a GA login.
 */
export type ReplayEventKind = "view" | "play" | "clip_play" | "cta_click" | "chapter_jump";

export function trackReplay(kind: ReplayEventKind, slug: string, extra?: Record<string, string | number>) {
  trackEvent(`replay_${kind}`, { replay: slug, ...(extra ?? {}) });
  try {
    const params = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      kind,
      slug,
      utm_source: params.get("utm_source") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
      extra: extra ?? undefined,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/replay/event", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/replay/event", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {
    /* counters are best-effort */
  }
}
