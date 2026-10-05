import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/audits: every Found Money audit, newest first. */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const sb = getSupabaseAdmin() as unknown as SupabaseClient;
    const { data, error } = await sb
      .from("found_money_audits")
      .select("id, email, practice_name, status, headline_total, member_id, created_at, unlocked_at, released_at, error, files")
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const rows = (data ?? []).map((r) => ({ ...r, fileCount: Array.isArray(r.files) ? r.files.length : 0, files: undefined }));
    const { count: membersViaAudit } = await sb.from("members").select("id", { count: "exact", head: true }).eq("signup_channel", "audit");
    const counts = {
      membersViaAudit: membersViaAudit ?? 0,
      total: rows.length,
      estimated: rows.filter((r) => r.status === "estimated").length,
      toReview: rows.filter((r) => r.status === "unlocked").length,
      released: rows.filter((r) => r.status === "released").length,
      failed: rows.filter((r) => r.status === "failed").length,
    };
    return NextResponse.json({ rows, counts });
  } catch (err) {
    return serverError(err, { route: "GET /api/admin/audits" });
  }
}
