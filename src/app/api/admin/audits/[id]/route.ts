import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { sendAuditReleasedEmail } from "@/lib/email/auditEmails";
import type { Findings } from "@/lib/tools/foundMoney/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "tool-uploads";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function db(): SupabaseClient {
  return getSupabaseAdmin() as unknown as SupabaseClient;
}

/** GET: one audit with facts, findings, extractions and signed links to the documents. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const route = "GET /api/admin/audits/[id]";
  if (!UUID.test(id)) return apiError.notFound(route);
  try {
    const sb = db();
    const { data } = await sb.from("found_money_audits").select("*").eq("id", id).maybeSingle();
    if (!data) return apiError.notFound(route);
    const files = (data.files ?? []) as { slot: string; name: string; path: string; mime: string; size: number }[];
    const links = await Promise.all(
      files.map(async (f) => {
        const { data: signed } = await sb.storage.from(BUCKET).createSignedUrl(f.path, 60 * 30);
        return { ...f, url: signed?.signedUrl ?? null };
      }),
    );
    return NextResponse.json({ audit: { ...data, files: links } });
  } catch (err) {
    return serverError(err, { route });
  }
}

/**
 * PATCH: save the reviewer's edited findings, or release the report.
 * Body: { findings?: Findings; action?: "save" | "release" }
 * Release writes released_findings, sets status released, and emails the member.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const route = "PATCH /api/admin/audits/[id]";
  if (!UUID.test(id)) return apiError.notFound(route);
  try {
    const body = (await req.json().catch(() => ({}))) as { findings?: Findings; action?: "save" | "release" };
    const sb = db();
    const { data: row } = await sb.from("found_money_audits").select("id, email, practice_name, status, findings, released_findings, member_id").eq("id", id).maybeSingle();
    if (!row) return apiError.notFound(route);

    const incoming = body.findings && typeof body.findings === "object" ? body.findings : null;
    const findings = (incoming ?? row.released_findings ?? row.findings) as Findings | null;
    if (!findings) return apiError.badRequest("Nothing to release yet.", route);

    // Recompute the headline from the (possibly edited) findings so the two never drift.
    const headline = Math.round(findings.findings.filter((f) => f.confidence !== "low").reduce((s, f) => s + Number(f.annual_saving || 0), 0) * 100) / 100;
    const cleaned: Findings = { ...findings, headline_total: headline };

    if (body.action === "release") {
      if (!row.member_id) return apiError.badRequest("This audit is not attached to a member yet. Release once they have joined.", route);
      await sb
        .from("found_money_audits")
        .update({ released_findings: cleaned, status: "released", released_at: new Date().toISOString(), reviewed_by: guard.adminId, updated_at: new Date().toISOString() })
        .eq("id", id);
      void sendAuditReleasedEmail({ to: row.email, headline, practiceName: row.practice_name });
      return NextResponse.json({ ok: true, status: "released" });
    }

    await sb.from("found_money_audits").update({ released_findings: cleaned, reviewed_by: guard.adminId, updated_at: new Date().toISOString() }).eq("id", id);
    return NextResponse.json({ ok: true, status: row.status });
  } catch (err) {
    return serverError(err, { route });
  }
}
