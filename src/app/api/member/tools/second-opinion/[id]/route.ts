import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requirePaidMember } from "@/lib/auth/guards";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { notifyInquirySlack } from "@/lib/slack";
import type { SecondOpinionResult } from "@/lib/tools/secondOpinion/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "tool-uploads";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Ownership is checked on every call: the row must belong to the signed-in member. */
async function loadOwnRun(memberId: string, id: string) {
  if (!UUID.test(id)) return null;
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("tool_runs")
    .select("id, member_id, tool, status, file_name, file_path, file_mime, file_size_bytes, result, error, created_at, completed_at")
    .eq("id", id)
    .maybeSingle();
  if (!data || data.member_id !== memberId) return null;
  return data;
}

/** GET: one run, with its result. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePaidMember();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const route = "GET /api/member/tools/second-opinion/[id]";
  try {
    const run = await loadOwnRun(guard.memberId, id);
    if (!run) return apiError.notFound(route);
    return NextResponse.json({
      ok: true,
      run: {
        id: run.id,
        status: run.status,
        fileName: run.file_name,
        fileMime: run.file_mime,
        fileSize: run.file_size_bytes,
        result: run.result,
        error: run.error,
        createdAt: run.created_at,
        completedAt: run.completed_at,
      },
    });
  } catch (err) {
    return serverError(err, { route });
  }
}

/** DELETE: the file and the row. The pool row, if any, is anonymous and stays. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePaidMember();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const route = "DELETE /api/member/tools/second-opinion/[id]";
  try {
    const run = await loadOwnRun(guard.memberId, id);
    if (!run) return apiError.notFound(route);
    const sb = getSupabaseAdmin();
    if (run.file_path && run.file_path !== "pending") await sb.storage.from(BUCKET).remove([run.file_path]);
    const { error } = await sb.from("tool_runs").delete().eq("id", run.id).eq("member_id", guard.memberId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, { route });
  }
}

/**
 * POST: the route out. Sends this result to the hotline as a normal
 * member inquiry, exactly like Beacon's escalation, with the four blocks
 * folded into the question so the team sees what the member saw.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePaidMember();
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const route = "POST /api/member/tools/second-opinion/[id]";
  try {
    const run = await loadOwnRun(guard.memberId, id);
    if (!run || run.status !== "done" || !run.result) return apiError.notFound(route);
    let note = "";
    try {
      const body = (await req.json()) as { note?: string };
      note = (body.note ?? "").trim().slice(0, 1500);
    } catch {
      /* no note is fine */
    }
    const r = run.result as unknown as SecondOpinionResult;
    const question = [
      note ? `Member's note: ${note}` : "Member asked for a person to look at a Second Opinion result.",
      "",
      `Document: ${run.file_name}`,
      `What this is: ${r.what_this_is}`,
      "",
      "What is in it:",
      ...r.whats_in_it.map((x) => `- ${x.label}: ${x.fact}`),
      "",
      r.what_we_notice.length
        ? "What we noticed:\n" + r.what_we_notice.map((x) => `- [${x.kind === "published" ? "published source" : "library"}] ${x.expert} (${x.source}${x.url ? `, ${x.url}` : ""}): ${x.point}`).join("\n")
        : "What we noticed: nothing in the library applied.",
      "",
      `Our recommendation: ${r.recommendation}`,
    ]
      .join("\n")
      .slice(0, 4000);

    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("member_inquiries")
      .insert({ member_id: guard.memberId, email: guard.email, question, status: "pending", source: "second_opinion" })
      .select("id")
      .single();
    if (error) throw error;
    const ts = await notifyInquirySlack({ memberName: guard.firstName, email: guard.email, question }).catch(() => null);
    if (ts) await sb.from("member_inquiries").update({ slack_ts: ts }).eq("id", data.id);
    return NextResponse.json({ ok: true, inquiryId: data.id });
  } catch (err) {
    return serverError(err, { route });
  }
}
