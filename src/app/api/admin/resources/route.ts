import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Multipart kit submissions can include a 17MB video; bump the default
// route-handler body limit.
export const maxDuration = 300;

/**
 * GET /api/admin/resources
 *
 * Returns all resources grouped by kit (topic_slug) with the per-kit
 * submission state and a summary of file kinds. The admin page uses this
 * to show a unified list with status badges and an Approve button on
 * pending rows.
 */
type AdminKit = {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  portalCardUrl: string | null;
  resourceCardUrl: string | null;
  itemCount: number;
  videoCount: number;
  isFree: boolean;
  isPublished: boolean;
  submissionStatus: "draft" | "pending_review" | "approved" | "rejected";
  submittedBy: string | null;
  submittedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  // Most-recent created_at among the rows in this kit (proxy for "added on")
  createdAt: string;
  // First resource id — used as the target for PATCH calls that operate on
  // the whole kit (we update every row that shares topic_slug).
  representativeId: string;
};

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("resources")
    .select(
      "id, topic_slug, topic_title, topic_summary, category, portal_card_url, resource_card_url, kind, is_free, is_published, submission_status, submitted_by, submitted_at, approved_by, approved_at, rejected_reason, created_at",
    )
    .order("topic_slug", { ascending: true })
    .order("position", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byKit = new Map<string, AdminKit>();
  for (const r of data ?? []) {
    const isVideo = r.kind.startsWith("video_") || r.kind === "audio";
    const existing = byKit.get(r.topic_slug);
    if (existing) {
      existing.itemCount += 1;
      if (isVideo) existing.videoCount += 1;
      if (!r.is_free) existing.isFree = false;
      if (!r.is_published) existing.isPublished = false;
      if (r.created_at > existing.createdAt) existing.createdAt = r.created_at;
    } else {
      byKit.set(r.topic_slug, {
        slug: r.topic_slug,
        title: r.topic_title,
        summary: r.topic_summary,
        category: r.category,
        portalCardUrl: r.portal_card_url,
        resourceCardUrl: r.resource_card_url,
        itemCount: 1,
        videoCount: isVideo ? 1 : 0,
        isFree: r.is_free,
        isPublished: r.is_published,
        submissionStatus: r.submission_status,
        submittedBy: r.submitted_by,
        submittedAt: r.submitted_at,
        approvedBy: r.approved_by,
        approvedAt: r.approved_at,
        rejectedReason: r.rejected_reason,
        createdAt: r.created_at,
        representativeId: r.id,
      });
    }
  }

  // Order: pending review first (admin's queue), then approved (most recent),
  // then drafts/rejected at the bottom.
  const rank = (s: AdminKit["submissionStatus"]) =>
    s === "pending_review" ? 0 : s === "approved" ? 1 : 2;

  const kits = Array.from(byKit.values()).sort((a, b) => {
    const ra = rank(a.submissionStatus);
    const rb = rank(b.submissionStatus);
    if (ra !== rb) return ra - rb;
    return b.createdAt.localeCompare(a.createdAt);
  });

  return NextResponse.json({ kits });
}

/**
 * POST /api/admin/resources
 *
 * Finalize a kit submission. By the time this is called, the browser has
 * already uploaded each file directly to Supabase Storage via signed URLs
 * (see /api/admin/resources/upload-url), so this endpoint only deals with
 * the JSON metadata and the database inserts. That avoids Vercel's 4.5MB
 * body limit which previously broke uploads of the training video (~17MB).
 *
 * Body (JSON):
 *   {
 *     slug, title, category, summary, approveOnSubmit,
 *     portalCardUrl, resourceCardUrl,
 *     files: [
 *       { fieldKey, storagePath, publicUrl, mime, sizeBytes },
 *       ...
 *     ]
 *   }
 */
const FILE_FIELD_MAP: Record<
  string,
  { kind: string; title: string; position: number }
> = {
  training_video: { kind: "video_full", title: "Training Video", position: 10 },
  action_guide: { kind: "action_guide", title: "Action Guide", position: 20 },
  checklist: { kind: "checklist", title: "Checklist", position: 30 },
  worksheet: { kind: "worksheet", title: "Worksheet", position: 40 },
  key_takeaways: { kind: "key_takeaways", title: "Key Takeaways", position: 50 },
  slide_deck_pdf: { kind: "slide_deck", title: "Slide Deck", position: 60 },
  slide_deck_pptx: { kind: "slide_deck", title: "Slide Deck (PowerPoint)", position: 65 },
  wall_poster: { kind: "other", title: "Wall Poster", position: 70 },
};

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

type FileSubmission = {
  fieldKey: string;
  storagePath: string;
  publicUrl: string;
  mime: string;
  sizeBytes: number;
};

type SubmissionBody = {
  slug?: string;
  title?: string;
  category?: string | null;
  summary?: string | null;
  approveOnSubmit?: boolean;
  portalCardUrl?: string | null;
  resourceCardUrl?: string | null;
  files?: FileSubmission[];
};

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as SubmissionBody;

  // ---- 1. Validate metadata
  const slug = String(body.slug ?? "").trim().toLowerCase();
  const title = String(body.title ?? "").trim();
  const category = body.category?.toString().trim() || null;
  const summary = body.summary?.toString().trim() || null;
  const approveOnSubmit = !!body.approveOnSubmit;
  const files = Array.isArray(body.files) ? body.files : [];

  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "Slug is required and must be lowercase letters / digits / hyphens." },
      { status: 400 },
    );
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (files.length === 0) {
    return NextResponse.json(
      { error: "At least one content file is required." },
      { status: 400 },
    );
  }

  const sb = getSupabaseAdmin();

  const { data: existing } = await sb
    .from("resources")
    .select("id")
    .eq("topic_slug", slug)
    .limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: `A kit with slug "${slug}" already exists. Pick a different slug.` },
      { status: 409 },
    );
  }

  // ---- 2. Validate each file reference + map to its kind metadata
  type RowInput = {
    title: string;
    kind: string;
    storagePath: string;
    externalUrl: string;
    mime: string;
    sizeBytes: number;
    position: number;
  };

  const rowsToInsert: RowInput[] = [];
  for (const f of files) {
    const meta = FILE_FIELD_MAP[f.fieldKey];
    if (!meta) {
      return NextResponse.json(
        { error: `Unknown file field "${f.fieldKey}".` },
        { status: 400 },
      );
    }
    if (!f.storagePath || !f.publicUrl) {
      return NextResponse.json(
        { error: `Missing storagePath/publicUrl on "${f.fieldKey}".` },
        { status: 400 },
      );
    }
    rowsToInsert.push({
      title: meta.title,
      kind: meta.kind,
      storagePath: f.storagePath,
      externalUrl: f.publicUrl,
      mime: f.mime || "application/octet-stream",
      sizeBytes: f.sizeBytes || 0,
      position: meta.position,
    });
  }

  // ---- 3. Insert resource rows
  const submission_status = approveOnSubmit ? "approved" : "pending_review";
  const now = new Date().toISOString();

  const inserts = rowsToInsert.map((r) => ({
    topic_slug: slug,
    topic_title: title,
    topic_summary: summary,
    category,
    portal_card_url: body.portalCardUrl ?? null,
    resource_card_url: body.resourceCardUrl ?? null,
    title: r.title,
    description: null,
    kind: r.kind,
    storage_path: r.storagePath,
    external_url: r.externalUrl,
    mime_type: r.mime,
    file_size_bytes: r.sizeBytes,
    position: r.position,
    is_free: true,
    is_published: true,
    submission_status,
    submitted_by: guard.adminId,
    submitted_at: now,
    approved_by: approveOnSubmit ? guard.adminId : null,
    // approved_at stamped by trigger when status transitions
  }));

  const { error: insErr } = await sb.from("resources").insert(inserts);
  if (insErr) {
    return NextResponse.json({ error: `DB insert failed: ${insErr.message}` }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    slug,
    rowsInserted: inserts.length,
    submissionStatus: submission_status,
  });
}
