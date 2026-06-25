import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireExpert } from "@/lib/auth/guards";
import type { ExpertResourceKind } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "expert-resources";
const MAX_FILE_BYTES = 500 * 1024 * 1024;

const VALID_KINDS: ReadonlyArray<ExpertResourceKind> = [
  "sop",
  "template",
  "slide_deck",
  "recording",
  "pdf",
  "checklist",
  "worksheet",
  "other",
];

/**
 * GET /api/expert/resources
 *
 * Returns the signed-in expert's own resources, newest first. Includes a
 * fresh signed download URL for each row so the page can show preview
 * links without exposing storage paths.
 */
export async function GET() {
  const guard = await requireExpert();
  if (!guard.ok) return guard.response;

  try {
    const admin = getSupabaseAdmin();
    const { data: rows, error } = await admin
      .from("expert_resources")
      .select(
        "id, title, description, kind, file_name, file_size, mime_type, status, submitted_at, reviewed_at, review_note, published_at, published_url, storage_path, created_at",
      )
      .eq("expert_id", guard.expertId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    // Generate fresh 1-hour signed URLs for each file so the UI can offer
    // a "Download" link without exposing the storage path or requiring
    // the browser to be authenticated against Supabase Storage.
    const withSigned = await Promise.all(
      (rows ?? []).map(async (r) => {
        let signedUrl: string | null = null;
        if (r.storage_path) {
          const { data: signed } = await admin.storage
            .from(BUCKET)
            .createSignedUrl(r.storage_path, 3600);
          signedUrl = signed?.signedUrl ?? null;
        }
        return { ...r, signed_url: signedUrl };
      }),
    );

    return NextResponse.json({ rows: withSigned });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list resources.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/expert/resources
 *
 * Accepts a multipart/form-data upload:
 *   - file:        the file blob (required)
 *   - title:       string (required)
 *   - description: string (optional)
 *   - kind:        ExpertResourceKind (defaults to 'other')
 *
 * Writes the file to Supabase Storage under "{expert_id}/{resource_id}.ext",
 * then inserts a row in expert_resources with status='pending_review'.
 */
export async function POST(req: Request) {
  const guard = await requireExpert();
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a file." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File is too large. Max 500 MB; this file is ${(file.size / 1024 / 1024).toFixed(1)} MB.` },
      { status: 413 },
    );
  }

  const title = (form.get("title") as string | null)?.trim() ?? "";
  if (title.length < 1 || title.length > 200) {
    return NextResponse.json({ error: "Title is required (1–200 chars)." }, { status: 400 });
  }

  const description = (form.get("description") as string | null)?.trim() || null;
  if (description && description.length > 4000) {
    return NextResponse.json({ error: "Description is too long (max 4000 chars)." }, { status: 400 });
  }

  const kindRaw = ((form.get("kind") as string | null) ?? "other").toLowerCase();
  const kind: ExpertResourceKind = (
    VALID_KINDS.includes(kindRaw as ExpertResourceKind) ? kindRaw : "other"
  ) as ExpertResourceKind;

  try {
    const admin = getSupabaseAdmin();

    // 1. Compute storage path. ext from filename, fallback to mime.
    const resourceId = randomUUID();
    const ext = (() => {
      const fromName = file.name?.match(/\.([a-zA-Z0-9]{1,8})$/)?.[1];
      if (fromName) return fromName.toLowerCase();
      if (file.type === "application/pdf") return "pdf";
      if (file.type === "image/jpeg") return "jpg";
      if (file.type === "image/png") return "png";
      if (file.type.startsWith("video/")) return file.type.split("/")[1] ?? "bin";
      if (file.type.startsWith("audio/")) return file.type.split("/")[1] ?? "bin";
      return "bin";
    })();
    const storagePath = `${guard.expertId}/${resourceId}.${ext}`;

    // 2. Upload to storage via service role (bypasses RLS for the write).
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadErr) throw uploadErr;

    // 3. Insert the row.
    const { data: inserted, error: insertErr } = await admin
      .from("expert_resources")
      .insert({
        id: resourceId,
        expert_id: guard.expertId,
        title,
        description,
        kind,
        storage_bucket: BUCKET,
        storage_path: storagePath,
        file_name: file.name ?? null,
        file_size: file.size,
        mime_type: file.type || null,
        status: "pending_review",
      })
      .select("id, title, status, created_at")
      .single();

    if (insertErr) {
      // Best-effort cleanup of the orphaned file if the row insert failed.
      await admin.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      throw insertErr;
    }

    return NextResponse.json({ ok: true, resource: inserted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/expert/resources?id=<uuid>
 *
 * Removes one of the signed-in expert's resources (file + row).
 * Approved resources cannot be deleted — they live in the member
 * library and need an admin to archive instead.
 */
export async function DELETE(req: Request) {
  const guard = await requireExpert();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: row, error: readErr } = await admin
      .from("expert_resources")
      .select("id, expert_id, status, storage_path")
      .eq("id", id)
      .maybeSingle();
    if (readErr) throw readErr;
    if (!row) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }
    if (row.expert_id !== guard.expertId) {
      return NextResponse.json({ error: "Not your resource." }, { status: 403 });
    }
    if (row.status === "approved") {
      return NextResponse.json(
        { error: "Approved resources are in the member library. Contact the team to archive." },
        { status: 409 },
      );
    }

    await admin.storage.from(BUCKET).remove([row.storage_path]).catch(() => {});
    const { error: delErr } = await admin
      .from("expert_resources")
      .delete()
      .eq("id", row.id);
    if (delErr) throw delErr;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
