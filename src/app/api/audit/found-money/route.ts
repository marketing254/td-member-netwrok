import { NextResponse } from "next/server";
import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";
import { validateUpload, safeFilename, ExtractError } from "@/lib/tools/secondOpinion/extract";
import { AUDIT_SLOTS, type AuditSlot, AUDIT_PAUSED_MESSAGE } from "@/lib/tools/foundMoney/pack";
import { AuditError, calculateFacts, explainFacts, findingsFromFacts, readDocument, type Extraction, isModelOutage } from "@/lib/tools/foundMoney/audit";
import { sendAuditEstimateEmail, sendAuditTeamAlert, sendAuditOutageAlert } from "@/lib/email/auditEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const BUCKET = "tool-uploads";
const MAX_FILES = 6;

/** found_money_audits is post-typegen: untyped client (same escape hatch as lib/events/summit.ts). */
function db(): SupabaseClient {
  return getSupabaseAdmin() as unknown as SupabaseClient;
}

function hashIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",")[0]!.trim() : req.headers.get("x-real-ip")?.trim()) ?? "0.0.0.0";
  const salt = process.env.SIGNUP_IP_SALT ?? "dmn-fixed-dev-salt";
  return crypto.createHash("sha256").update(`${salt}::${ip}`).digest("hex").slice(0, 32);
}

/**
 * POST /api/audit/found-money (public, no login, no card)
 * multipart: email, practice (optional), utm (json, optional), and files
 * named by slot: card_processing, supplies (up to 3), card_statement.
 * Stores the files privately, runs stages A, B and C, saves the result,
 * emails the visitor their link and the team an alert, and answers with
 * the public token for /audit/found-money/<token>.
 */
export async function POST(req: Request) {
  const route = "POST /api/audit/found-money";
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return apiError.badRequest("Send the form as multipart/form-data.", route);
  }
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return apiError.badRequest("Enter a valid email address.", route);
  const practice = String(fd.get("practice") ?? "").trim().slice(0, 120) || null;
  let utm: Record<string, string> | null = null;
  try {
    const raw = fd.get("utm");
    if (typeof raw === "string" && raw) utm = JSON.parse(raw) as Record<string, string>;
  } catch {
    utm = null;
  }

  const files: { slot: AuditSlot; file: File }[] = [];
  for (const s of AUDIT_SLOTS) {
    for (const v of fd.getAll(s.slot)) {
      if (v instanceof File && v.size > 0) files.push({ slot: s.slot, file: v });
    }
  }
  if (files.length === 0) return apiError.badRequest("Upload at least one document.", route);
  if (files.length > MAX_FILES) return apiError.badRequest(`Upload at most ${MAX_FILES} files.`, route);
  for (const f of files) {
    const problem = validateUpload({ name: f.file.name, size: f.file.size, type: f.file.type });
    if (problem) return apiError.badRequest(`${f.file.name}: ${problem}`, route);
  }

  // Each run costs model credit, so cap runs per address and per email.
  // In-memory, per instance: enough to stop a script hammering the form.
  const ipKey = `audit:ip:${hashIp(req)}`;
  const emailKey = `audit:email:${email.toLowerCase()}`;
  const limit = [checkRateLimit(ipKey), checkRateLimit(emailKey)].find((r) => !r.allowed);
  if (limit) return apiError.rateLimited(route);

  const sb = db();
  const { data: row, error: insErr } = await sb
    .from("found_money_audits")
    .insert({ email, practice_name: practice, status: "processing", utm, ip_hash: hashIp(req) })
    .select("id, token")
    .single();
  if (insErr || !row) return serverError(insErr ?? new Error("insert failed"), { route });
  const auditId = row.id as string;
  const token = row.token as string;

  const stored: { slot: AuditSlot; name: string; path: string; mime: string; size: number }[] = [];
  const docs: { slot: AuditSlot; name: string; extraction: Extraction }[] = [];
  try {
    for (const [i, f] of files.entries()) {
      const buf = Buffer.from(await f.file.arrayBuffer());
      const path = `audits/${auditId}/${i + 1}-${safeFilename(f.file.name)}`;
      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buf, { contentType: f.file.type, upsert: false });
      if (upErr) throw upErr;
      stored.push({ slot: f.slot, name: f.file.name, path, mime: f.file.type, size: f.file.size });

      let extraction: Extraction;
      try {
        extraction = await readDocument(buf, f.file.type, f.file.name);
      } catch (err) {
        if (err instanceof ExtractError) throw new AuditError(`${f.file.name}: ${err.message}`, "unreadable");
        throw err;
      }
      if (extraction.contains_patient_data) {
        // Stop, delete the file, ask for a version without patient information.
        await sb.storage.from(BUCKET).remove(stored.map((x) => x.path));
        await sb.from("found_money_audits").update({ status: "failed", files: [], error: "patient_data" }).eq("id", auditId);
        return apiError.badRequest(`${f.file.name} appears to contain patient information. Please upload a version without patient names or details.`, route);
      }
      if (extraction.document_type === "other") {
        await sb.storage.from(BUCKET).remove(stored.map((x) => x.path));
        await sb.from("found_money_audits").update({ status: "failed", files: [], error: "wrong_type" }).eq("id", auditId);
        return apiError.badRequest(`${f.file.name} doesn't look like one of the three documents. Please upload a card processing statement, a supply invoice, or a business card statement.`, route);
      }
      docs.push({ slot: f.slot, name: f.file.name, extraction });
    }

    const facts = calculateFacts(docs, practice);
    const written = await explainFacts(facts);
    const findings = written ?? findingsFromFacts(facts);

    await sb
      .from("found_money_audits")
      .update({
        status: "estimated",
        files: stored,
        extractions: docs.map((d) => ({ slot: d.slot, name: d.name, extraction: d.extraction })),
        facts,
        findings,
        headline_total: facts.headline_total,
        error: written ? null : "stage_c_discarded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", auditId);

    void sendAuditEstimateEmail({ to: email, token, headline: facts.headline_total, practiceName: practice });
    void sendAuditTeamAlert({ kind: "upload", auditId, email, practiceName: practice, headline: facts.headline_total });

    return NextResponse.json({ ok: true, token });
  } catch (err) {
    if (isModelOutage(err)) {
      // OpenAI side: credit, key, rate limit or outage. Calm wording for the
      // visitor, the real reason only in the team alert and the server log.
      const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      await sb.from("found_money_audits").update({ status: "failed", files: stored, error: `model_unavailable: ${detail}`.slice(0, 500) }).eq("id", auditId);
      void sendAuditOutageAlert({ auditId, email, practiceName: practice, detail });
      return serverError(err, { route, status: 503, code: "paused", publicMessage: AUDIT_PAUSED_MESSAGE });
    }
    const message = err instanceof AuditError ? err.message : err instanceof Error ? err.message : "The audit could not run.";
    await sb.from("found_money_audits").update({ status: "failed", files: stored, error: message.slice(0, 500) }).eq("id", auditId);
    if (err instanceof AuditError) return apiError.badRequest(message, route);
    return serverError(err, { route });
  }
}
