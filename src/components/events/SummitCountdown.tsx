"use client";
import { useSyncExternalStore } from "react";

/**
 * Countdown block for the RIDA summit page (Lester, 2 Nov 2026).
 *
 * Counts to Friday 6 November 2026, 12:00 PM Eastern (EST, so 17:00 UTC):
 * every visitor sees the same clock, it never resets. From 12:00 PM it reads
 * "Live now", and from 4:30 PM Eastern it renders nothing. Safe to place
 * more than once on the page. Nothing to take down afterwards.
 */
const START = Date.parse("2026-11-06T17:00:00Z"); // 12:00 PM EST
const END = Date.parse("2026-11-06T21:30:00Z");   // 4:30 PM EST

function subscribeTick(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export default function SummitCountdown({ registered = "300+" }: { registered?: string }) {
  // Ticks once a second; the server snapshot is null so the first client
  // paint matches the server and the clock appears right after hydration.
  const now = useSyncExternalStore(subscribeTick, () => Math.floor(Date.now() / 1000) * 1000, () => null);
  if (now === null || now >= END) return null;

  const live = now >= START;
  const t = parts(START - now);
  const clock = live
    ? "Live now"
    : t.d > 0
      ? `${t.d} day${t.d === 1 ? "" : "s"} ${t.h}h ${t.m}m ${t.s}s`
      : `${t.h}h ${t.m}m ${t.s}s`;

  return (
    <div className="summit-countdown" role="timer" aria-live="off">
      <span className="summit-countdown__eyebrow">{live ? "The RIDA Annual Summit is" : "The RIDA Annual Summit starts in"}</span>
      <strong className="summit-countdown__clock">{clock}</strong>
      <p className="summit-countdown__note">
        {live
          ? `Friday 6 November, live on Zoom until 4:30 PM Eastern. ${registered} registered. Join now and your seat is booked for you.`
          : `Friday 6 November, 12:00 PM Eastern, live on Zoom. ${registered} already registered. Join before it starts and your seat is booked for you.`}
      </p>
    </div>
  );
}
