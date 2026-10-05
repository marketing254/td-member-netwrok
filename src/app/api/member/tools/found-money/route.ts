import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requirePaidMember } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";
import { sendAuditTeamAlert } from "@/lib/email/auditEmails";
import type { Findings } from "@/lib/tools/foundMoney/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function db(): SupabaseClient {
  return getSupabaseAdmin() as unknown as SupabaseClient;
}

/**
 * GET /api/member/tools/found-money
 * The member's audits. Any free audit made with the member's email and not
 * yet attached is attached now ("after they join, move their upload into
 * their account"), marked unlocked, and the team is alerted so they can
 * review and release the full report. Until release the member sees the
 * headline and the first finding; after release, everything.
 */
export async function GET() {
  const guard = await requirePaidMember();
  if (!guard.ok) return guard.response;
  const route = "GET /api/member/tools/found-money";
  try {
    const sb = db();
    const email = guard.email.toLowerCase();

    const { data: loose } = await sb
      .from("found_money_audits")
      .select("id, practice_name, headline_total")
      .is("member_id", null)
      .eq("status", "estimated")
      .ilike("email", email);
    for (const a of loose ?? []) {
      await sb
        .from("found_money_audits")
        .update({ member_id: guard.memberId, status: "unlocked", unlocked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", a.id);
      void sendAuditTeamAlert({ kind: "unlock", auditId: a.id, email, practiceName: a.practice_name, headline: a.headline_total });
    }

    const { data: rows } = await sb
      .from("found_money_audits")
      .select("id, token, status, practice_name, headline_total, findings, released_findings, created_at, released_at, files")
      .eq("member_id", guard.memberId)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(20);

    const audits = (rows ?? []).map((r) => {
      const released = (r.released_findings ?? null) as Findings | null;
      const draft = (r.findings ?? null) as Findings | null;
      const f = r.status === "released" ? released : draft;
      const full = r.status === "released";
      return {
        id: r.id,
        token: r.token,
        status: r.status,
        practiceName: r.practice_name,
        headline: full && released ? released.headline_total : r.headline_total,
        createdAt: r.created_at,
        releasedAt: r.released_at,
        fileCount: Array.isArray(r.files) ? r.files.length : 0,
        findings: (f?.findings ?? []).map((x, i) =>
          full || i === 0
            ? { title: x.title, why: x.why, action: x.action, script: full ? x.script : null, annual_saving: x.annual_saving, confidence: x.confidence, locked: false }
            : { title: x.title, why: null, action: null, script: null, annual_saving: x.annual_saving, confidence: x.confidence, locked: true },
        ),
        alreadyFine: f?.already_fine ?? [],
        limits: f?.limits ?? [],
      };
    });
    return NextResponse.json({ ok: true, audits });
  } catch (err) {
    return serverError(err, { route });
  }
}
