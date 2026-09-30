import "server-only";

/**
 * Zoom webinar registration through the Zoom API (spec v2, 29 Sep 2026:
 * "the Zoom registration is created automatically through the Zoom API
 * ... no manual import").
 *
 * Uses a Server-to-Server OAuth app on the account that owns the webinar
 * (Naren's). Three values from that app, plus the webinar id, go in the
 * environment:
 *
 *   ZOOM_ACCOUNT_ID
 *   ZOOM_CLIENT_ID
 *   ZOOM_CLIENT_SECRET
 *   SUMMIT_ZOOM_WEBINAR_ID
 *
 * The app needs the scope `webinar:write:registrant` (admin level:
 * `webinar:write:registrant:admin`). The webinar must have registration
 * switched on. Until all four values exist, `zoomConfigured()` is false
 * and lib/events/summit.ts falls back to the registrants sheet.
 */

export function zoomConfigured(): boolean {
  return !!(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET);
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  const accountId = process.env.ZOOM_ACCOUNT_ID!;
  const basic = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; reason?: string; error?: string };
  if (!res.ok || !body.access_token) {
    throw new Error(`zoom token: ${res.status} ${body.reason ?? body.error ?? ""}`.trim());
  }
  cachedToken = { token: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return cachedToken.token;
}

export type ZoomRegistrant = { registrantId: string; joinUrl: string };

/**
 * Create one webinar registrant. Zoom returns the person's own join link.
 * Registering the same email twice returns the existing registrant, so a
 * replayed webhook cannot create a duplicate seat.
 */
export async function registerWebinarRegistrant(input: {
  webinarId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  org?: string | null;
  customQuestion?: string | null;
}): Promise<ZoomRegistrant> {
  const token = await accessToken();
  const payload: Record<string, unknown> = {
    email: input.email,
    first_name: input.firstName.slice(0, 64),
    last_name: (input.lastName || "-").slice(0, 64),
    ...(input.phone ? { phone: input.phone.slice(0, 20) } : {}),
    ...(input.org ? { org: input.org.slice(0, 128) } : {}),
    ...(input.customQuestion ? { comments: input.customQuestion.slice(0, 500) } : {}),
    auto_approve: true,
  };
  const res = await fetch(`https://api.zoom.us/v2/webinars/${encodeURIComponent(input.webinarId)}/registrants`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => ({}))) as { registrant_id?: string; id?: string; join_url?: string; message?: string; code?: number };
  if (!res.ok || !body.join_url) {
    throw new Error(`zoom registrant: ${res.status} ${body.code ?? ""} ${body.message ?? ""}`.trim());
  }
  return { registrantId: body.registrant_id ?? String(body.id ?? ""), joinUrl: body.join_url };
}
