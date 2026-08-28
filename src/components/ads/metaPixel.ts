"use client";

/**
 * Meta Pixel — browser side of the paid-ads measurement. Loaded ONLY on
 * the /start and /welcome pages (never site-wide), and only when
 * NEXT_PUBLIC_META_PIXEL_ID is configured — everything is a silent no-op
 * until the team provides the Pixel id.
 *
 * The confirmed Purchase is authoritative on the SERVER (Conversions API
 * from the Stripe webhook). The browser may fire the same Purchase with
 * the same eventID purely to improve match quality — Meta de-duplicates
 * on (event_name, event_id), so nothing is ever double-counted.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq & { queue?: unknown[]; loaded?: boolean };
    _fbq?: unknown;
  }
}

let initialized = false;

/** Inject the pixel loader once. Safe to call repeatedly. */
export function initMetaPixel(): void {
  if (!PIXEL_ID || typeof window === "undefined" || initialized) return;
  initialized = true;

  if (!window.fbq) {
    const fbq: Window["fbq"] = function (...args: unknown[]) {
      (fbq!.queue = fbq!.queue || []).push(args);
    } as Window["fbq"];
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  window.fbq!("init", PIXEL_ID);
}

/** Track a standard event. No-op when the pixel isn't configured. */
export function trackMeta(
  event: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase",
  params?: Record<string, unknown>,
  eventId?: string,
): void {
  if (!PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  if (eventId) {
    window.fbq("track", event, params ?? {}, { eventID: eventId });
  } else {
    window.fbq("track", event, params ?? {});
  }
}

export const metaPixelConfigured = !!PIXEL_ID;
