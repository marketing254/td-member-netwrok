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
 * Submit a new kit via multipart/form-data.
 *
 * Required form fields:
 *   slug            — URL-safe slug (lowercase a-z 0-9 hyphens)
 *   title           — display title
 *   category        — one of Practice Management / Front Desk / Team & Culture / Patient Experience (or custom)
 *   summary         — kit summary
 *   approveOnSubmit — "1" to mark approved immediately (admin role check below);
 *                     otherwise the kit lands as pending_review
 *
 * File fields (any combination, all optional individually but at least one
 * content file required to create rows):
 *   portal_card     — square cover (image/*) for the member portal grid
 *   resource_card   — wide hero (image/*) for landing + kit detail
 *   training_video  — kind=video_full
 *   action_guide    — kind=action_guide
 *   checklist       — kind=checklist
 *   worksheet       — kind=worksheet
 *   key_takeaways   — kind=key_takeaways
 *   slide_deck_pdf  — kind=slide_deck (PDF)
 *   slide_deck_pptx — kind=slide_deck (PPTX, title="Slide Deck (PowerPoint)")
 *   wall_poster     — kind=other (PDF, title="Wall Poster")
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

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form-data body" }, { status: 400 });
  }

  // ---- 1. Validate metadata fields
  const slug = String(form.get("slug") ?? "").trim().toLowerCase();
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "").trim() || null;
  const summary = String(form.get("summary") ?? "").trim() || null;
  const approveOnSubmit = String(form.get("approveOnSubmit") ?? "") === "1";

  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "Slug is required and must be lowercase letters / digits / hyphens." },
      { status: 400 },
    );
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Refuse if a kit with this slug already exists — admins use the existing
  // edit/approve actions instead of re-submitting.
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

  // ---- 2. Upload the two covers (if provided)
  let portalCardUrl: string | null = null;
  let resourceCardUrl: string | null = null;

  async function uploadCover(field: string, storageName: string): Promise<string | null> {
    const file = form.get(field);
    if (!(file instanceof File) || file.size === 0) return null;
    const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
    const path = `${slug}/${storageName}.${ext.replace(/[^a-z0-9]/g, "")}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await sb.storage.from("kit-thumbnails").upload(path, buf, {
      contentType: file.type || "image/png",
      upsert: true,
      cacheControl: "31536000",
    });
    if (error) throw new Error(`Cover "${field}" upload failed: ${error.message}`);
    const { data: pub } = sb.storage.from("kit-thumbnails").getPublicUrl(path);
    return pub.publicUrl;
  }

  try {
    portalCardUrl = await uploadCover("portal_card", "portal-card");
    resourceCardUrl = await uploadCover("resource_card", "resource-card");
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Cover upload failed" }, { status: 500 });
  }

  // ---- 3. Upload content files + collect rows to insert
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

  for (const [field, meta] of Object.entries(FILE_FIELD_MAP)) {
    const file = form.get(field);
    if (!(file instanceof File) || file.size === 0) continue;

    const safeName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const storagePath = `${slug}/${safeName}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await sb.storage.from("member-resources").upload(storagePath, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });
    if (upErr) {
      return NextResponse.json(
        { error: `File "${field}" upload failed: ${upErr.message}` },
        { status: 500 },
      );
    }
    const { data: pub } = sb.storage.from("member-resources").getPublicUrl(storagePath);
    rowsToInsert.push({
      title: meta.title,
      kind: meta.kind,
      storagePath,
      externalUrl: pub.publicUrl,
      mime: file.type || "application/octet-stream",
      sizeBytes: file.size,
      position: meta.position,
    });
  }

  if (rowsToInsert.length === 0) {
    return NextResponse.json(
      { error: "At least one content file is required (training video, action guide, etc.)." },
      { status: 400 },
    );
  }

  // ---- 4. Insert resource rows.
  //         Submitter is always the current admin; status is approved if the
  //         admin ticked "approve on submit", otherwise pending_review.
  const submission_status = approveOnSubmit ? "approved" : "pending_review";
  const now = new Date().toISOString();

  const inserts = rowsToInsert.map((r) => ({
    topic_slug: slug,
    topic_title: title,
    topic_summary: summary,
    category,
    portal_card_url: portalCardUrl,
    resource_card_url: resourceCardUrl,
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
