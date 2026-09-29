import { NextResponse } from "next/server";
import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/replay/event
 * Public, unauthenticated counter for the replay pages. Accepts one of a
 * fixed set of event kinds for a known replay slug and writes a row to
 * replay_events (0069). Always answers 204 so a counter outage can never
 * surface on the page. Rate limiting is left to the platform; the rows
 * carry no personal data.
 */
const KINDS = new Set(["view", "play", "clip_play", "cta_click", "chapter_jump"]);
const SLUG_RE = /^[a-z0-9-]{3,64}$/;

function hashIp(ip: string): string {
  const salt = process.env.SIGNUP_IP_SALT ?? "dmn-fixed-dev-salt";
  return crypto.createHash("sha256").update(`${salt}::${ip}`).digest("hex").slice(0, 32);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { kind?: string; slug?: string; utm_source?: string; utm_campaign?: string; extra?: Record<string, unknown> }
      | null;
    if (!body || typeof body.kind !== "string" || !KINDS.has(body.kind)) return new NextResponse(null, { status: 204 });
    if (typeof body.slug !== "string" || !SLUG_RE.test(body.slug)) return new NextResponse(null, { status: 204 });

    const fwd = req.headers.get("x-forwarded-for");
    const ip = (fwd ? fwd.split(",")[0]!.trim() : req.headers.get("x-real-ip")?.trim()) ?? "0.0.0.0";
    // replay_events is post-typegen: untyped client, same escape hatch as lib/events/summit.ts.
    const sb = getSupabaseAdmin() as unknown as SupabaseClient;
    await sb.from("replay_events").insert({
      slug: body.slug,
      kind: body.kind,
      utm_source: typeof body.utm_source === "string" ? body.utm_source.slice(0, 80) : null,
      utm_campaign: typeof body.utm_campaign === "string" ? body.utm_campaign.slice(0, 80) : null,
      extra: body.extra && typeof body.extra === "object" ? body.extra : null,
      ip_hash: hashIp(ip),
      user_agent: (req.headers.get("user-agent") ?? "").slice(0, 200),
    });
  } catch {
    /* never surface */
  }
  return new NextResponse(null, { status: 204 });
}
