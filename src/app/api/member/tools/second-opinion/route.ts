import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requirePaidMember } from "@/lib/auth/guards";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import { ExtractError, extractText, safeFilename, validateUpload } from "@/lib/tools/secondOpinion/extract";
import { practiceSizeBand, runSecondOpinion, SECOND_OPINION_MODEL } from "@/lib/tools/secondOpinion/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Upload + text extraction + one model call. Well inside a minute; capped anyway.
export const maxDuration = 90;

const BUCKET = "tool-uploads";

/**
 * GET /api/member/tools/second-opinion
 * The member's own runs, newest first, for the history list.
 */
export async function GET() {
  const guard = await requirePaidMember();
  if (!guard.ok) return guard.response;
  const route = "GET /api/member/tools/second-opinion";
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("tool_runs")
      .select("id, tool, status, file_name, result, error, created_at, completed_at")
      .eq("member_id", guard.memberId)
      .eq("tool", "second_opinion")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return NextResponse.json({
      ok: true,
      runs: (data ?? []).map((r) => ({
        id: r.id,
        status: r.status,
        fileName: r.file_name,
        whatThisIs: (r.result as { what_this_is?: string } | null)?.what_this_is ?? null,
        error: r.error,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    return serverError(err, { route });
  }
}

/**
 * POST /api/member/tools/second-opinion  (multipart)
 *   document      the file (PDF, PNG, JPG, WebP; 15MB max)
 *   share_to_pool "1" | "0"   the pool tick box (default on)
 *
 * Order: validate, store the file under the member's own folder, create
 * the run row, extract text, run the prompt, save the result. The row is
 * created before the slow parts so a failure still leaves something the
 * member can see and delete. Anonymous pool row only when the box was on.
 */
export async function POST(req: Request) {
  const guard = await requirePaidMember();
  if (!guard.ok) return guard.response;
  const route = "POST /api/member/tools/second-opinion";

  const rl = checkRateLimit(`second-opinion:${guard.memberId}`);
  if (!rl.allowed) return apiError.rateLimited(route);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return apiError.badRequest("Attach a document first.", route);
  }
  const file = form.get("document");
  if (!(file instanceof File)) return apiError.badRequest("Attach a document first.", route);
  const problem = validateUpload({ name: file.name, size: file.size, type: file.type });
  if (problem) return apiError.validation(problem, route);
  const shareToPool = form.get("share_to_pool") !== "0";

  const sb = getSupabaseAdmin();
  const buf = Buffer.from(await file.arrayBuffer());
  const fileName = safeFilename(file.name);

  // 1. Create the row first so we have an id for the storage path.
  const { data: run, error: insErr } = await sb
    .from("tool_runs")
    .insert({
      member_id: guard.memberId,
      tool: "second_opinion",
      status: "processing",
      file_name: fileName,
      file_path: "pending",
      file_mime: file.type,
      file_size_bytes: file.size,
      share_to_pool: shareToPool,
      model: SECOND_OPINION_MODEL,
    })
    .select("id")
    .single();
  if (insErr || !run) return serverError(insErr, { route, extra: { stage: "insert" } });

  const path = `${guard.memberId}/${run.id}/${fileName}`;
  const fail = async (message: string, status = 200) => {
    await sb.from("tool_runs").update({ status: "failed", error: message, completed_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ ok: false, id: run.id, error: message }, { status });
  };

  try {
    // 2. Store the file in the private bucket, under the member's folder.
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buf, { contentType: file.type, upsert: false });
    if (upErr) return serverError(upErr, { route, extra: { stage: "upload" } });
    await sb.from("tool_runs").update({ file_path: path }).eq("id", run.id);

    // 3. Read it.
    let extracted;
    try {
      extracted = await extractText(buf, file.type);
    } catch (e) {
      if (e instanceof ExtractError) return fail(e.message);
      throw e;
    }

    // 4. Run the prompt.
    const result = await runSecondOpinion(extracted.text, extracted.truncated);

    await sb
      .from("tool_runs")
      .update({
        status: "done",
        extracted_chars: extracted.text.length,
        result: result as unknown as Record<string, unknown>,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    // 5. Anonymous pool row. Never the member; only when the box was on and
    //    the model found a vendor in a real signable document.
    if (shareToPool && result.meta.is_signable_document && result.meta.vendor) {
      const { data: m } = await sb.from("members").select("locations").eq("id", guard.memberId).maybeSingle();
      await sb.from("tool_vendor_pool").insert({
        tool: "second_opinion",
        vendor: result.meta.vendor,
        category: result.meta.category,
        price_band: result.meta.annual_cost_band,
        practice_size_band: practiceSizeBand(m?.locations),
      });
    }

    return NextResponse.json({ ok: true, id: run.id });
  } catch (err) {
    await sb
      .from("tool_runs")
      .update({ status: "failed", error: "Something went wrong reading this document.", completed_at: new Date().toISOString() })
      .eq("id", run.id);
    return serverError(err, { route, extra: { stage: "run", runId: run.id } });
  }
}
