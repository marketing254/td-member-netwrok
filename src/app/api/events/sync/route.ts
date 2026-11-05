import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { serverError } from "@/lib/api/errorResponse";
import { validateEventInput } from "@/lib/events/portalEventsInput";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/events/sync — the n8n hand-off from the DMN events sheet.
 *
 * Auth: `Authorization: Bearer ${EVENTS_SYNC_SECRET}` (a long random
 * string set in Vercel and in the n8n HTTP node). Without the secret the
 * route refuses everything, including locally.
 *
 * Body: { "events": [ { ...one sheet row... }, ... ] }
 *   Column names may be the sheet's own ("Title", "Series", "Date",
 *   "Time", "Length", "Format", "CE", "Speakers", "Description", "Banner",
 *   "Register", "Replay", "Published") or the table's; see
 *   src/lib/events/portalEventsInput.ts for the full list.
 *
 * Upserts by slug (the sheet's Slug column, or title + date when blank).
 * Rows that fail validation are reported in `errors` and skipped; the
 * rest are still saved. Nothing is deleted: to take an event down, set
 * Published to "no" in the sheet.
 *
 * Reply: { saved: n, errors: [ "…" ], slugs: [ … ] }
 */
export async function POST(req: Request) {
  const route = "POST /api/events/sync";
  const secret = process.env.EVENTS_SYNC_SECRET;
  if (!secret) return NextResponse.json({ error: "EVENTS_SYNC_SECRET not configured." }, { status: 503 });
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length || !timingSafeEqual(Buffer.from(header), Buffer.from(expected))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { events?: unknown };
  try {
    body = (await req.json()) as { events?: unknown };
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }
  const rows = Array.isArray(body.events) ? body.events : Array.isArray(body) ? (body as unknown[]) : null;
  if (!rows) return NextResponse.json({ error: 'Body must be { "events": [ ... ] }.' }, { status: 400 });
  if (rows.length > 500) return NextResponse.json({ error: "At most 500 events per call." }, { status: 400 });

  const errors: string[] = [];
  const values = [];
  for (const r of rows) {
    if (!r || typeof r !== "object") {
      errors.push("A row was not an object.");
      continue;
    }
    const v = validateEventInput(r as Record<string, unknown>);
    if (v.ok) values.push({ ...v.value, source: "sheet" });
    else errors.push(v.error);
  }

  try {
    const sb = getSupabaseAdmin();
    const slugs: string[] = [];
    for (const v of values) {
      const { error } = await sb.from("portal_events").upsert(v, { onConflict: "slug" });
      if (error) errors.push(`"${v.title}": ${error.message}`);
      else slugs.push(v.slug);
    }
    return NextResponse.json({ saved: slugs.length, errors, slugs });
  } catch (err) {
    return serverError(err, { route });
  }
}
