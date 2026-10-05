import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { apiError, serverError } from "@/lib/api/errorResponse";
import type { Findings } from "@/lib/tools/foundMoney/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "tool-uploads";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function db(): SupabaseClient {
  return getSupabaseAdmin() as unknown as SupabaseClient;
}

/**
 * The FREE view of an audit, by its unguessable token. Headline total and
 * the first finding in full; every other finding only as a blurred title
 * and amount. Scripts are never sent to the browser here. Members see the
 * full report in the portal, after the team has released it.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const route = "GET /api/audit/found-money/[token]";
  if (!UUID.test(token)) return apiError.notFound(route);
  try {
    const { data } = await db()
      .from("found_money_audits")
      .select("id, status, practice_name, headline_total, findings, created_at, files")
      .eq("token", token)
      .maybeSingle();
    if (!data || data.status === "deleted") return apiError.notFound(route);
    const f = (data.findings ?? null) as Findings | null;
    const first = f?.findings?.[0] ?? null;
    return NextResponse.json({
      ok: true,
      status: data.status,
      practiceName: data.practice_name,
      headline: data.headline_total,
      createdAt: data.created_at,
      fileCount: Array.isArray(data.files) ? data.files.length : 0,
      first: first ? { title: first.title, why: first.why, action: first.action, annual_saving: first.annual_saving, confidence: first.confidence } : null,
      locked: (f?.findings ?? []).slice(1).map((x) => ({ title: x.title, annual_saving: x.annual_saving, confidence: x.confidence })),
      lockedTotal: (f?.findings ?? []).slice(1).reduce((s, x) => s + (x.confidence === "low" ? 0 : x.annual_saving), 0),
      alreadyFine: f?.already_fine ?? [],
      limits: f?.limits ?? [],
    });
  } catch (err) {
    return serverError(err, { route });
  }
}

/** "Delete my documents": removes the files and the audit, by token. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const route = "DELETE /api/audit/found-money/[token]";
  if (!UUID.test(token)) return apiError.notFound(route);
  try {
    const sb = db();
    const { data } = await sb.from("found_money_audits").select("id, files").eq("token", token).maybeSingle();
    if (!data) return apiError.notFound(route);
    const paths = ((data.files ?? []) as { path: string }[]).map((x) => x.path);
    if (paths.length) await sb.storage.from(BUCKET).remove(paths);
    await sb
      .from("found_money_audits")
      .update({ status: "deleted", files: [], extractions: null, facts: null, findings: null, released_findings: null, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, { route });
  }
}
