import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import type { ReviewStatus } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/catalog?status=pending_review|approved|rejected|all */
export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "pending_review";
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("catalog_items")
      .select(
        "id, type, name, tagline, description, category, price_label, duration_hours, module_count, ce_credits, highlights, tags, review_status, review_note, reviewed_at, submitted_for_review_at, approved_at, offer_count, redemptions_lifetime, created_at, updated_at, vendor_id, vendors(id, company_name, contact_name, contact_email, contact_phone, website, logo_url, status, verified), catalog_media(id, kind, url, thumbnail_url, caption, mime_type, file_size_bytes, duration_label, position)",
      )
      .order("submitted_for_review_at", { ascending: false, nullsFirst: false })
      .limit(200);
    if (status !== "all") {
      query = query.eq("review_status", status as ReviewStatus);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ rows: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH body { id, action: 'approve'|'reject', note? } */
export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: { id?: string; action?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.id || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "id and a valid action are required." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing, error: readErr } = await supabase
      .from("catalog_items")
      .select("id, name, vendor_id")
      .eq("id", body.id)
      .maybeSingle();
    if (readErr) throw readErr;
    if (!existing) return NextResponse.json({ error: "Catalog item not found." }, { status: 404 });

    const newStatus: ReviewStatus = body.action === "approve" ? "approved" : "rejected";
    const patch: { review_status: ReviewStatus; review_note: string | null; reviewed_at: string; approved_at?: string } = {
      review_status: newStatus,
      review_note: body.note ?? null,
      reviewed_at: new Date().toISOString(),
    };
    if (body.action === "approve") patch.approved_at = new Date().toISOString();

    const { error: upErr } = await supabase.from("catalog_items").update(patch).eq("id", body.id);
    if (upErr) throw upErr;

    await supabase.from("review_actions").insert({
      target_type: "catalog_item",
      target_id: body.id,
      action: body.action,
      note: body.note ?? null,
      admin_id: guard.adminId,
    });

    if (existing.vendor_id) {
      await supabase.from("notifications").insert({
        audience: "vendor",
        vendor_id: existing.vendor_id,
        kind: body.action === "approve" ? "catalog_approved" : "catalog_rejected",
        title:
          body.action === "approve"
            ? `Catalog item approved: ${existing.name}`
            : `Catalog item rejected: ${existing.name}`,
        body: body.note ?? null,
        link: `/vendor/catalog/${body.id}`,
        metadata: { catalog_item_id: body.id },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
