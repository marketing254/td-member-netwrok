import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { validateEventInput } from "@/lib/events/portalEventsInput";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin CRUD for portal events (migration 0080).
 *
 *   GET     /api/admin/events            every event, soonest first
 *   POST    { ...event }                 create (slug made from title + date when blank)
 *   PUT     { id, ...event }             update
 *   DELETE  { id }                       remove
 */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  try {
    const { data, error } = await getSupabaseAdmin().from("portal_events").select("*").order("starts_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ events: data ?? [] });
  } catch (err) {
    return serverError(err, { route: "GET /api/admin/events" });
  }
}

export async function POST(req: Request) {
  const route = "POST /api/admin/events";
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return apiError.badRequest();
  }
  const v = validateEventInput(body);
  if (!v.ok) return apiError.validation(v.error, route);
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("portal_events")
      .insert({ ...v.value, source: "admin" })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") return apiError.validation(`An event with the address "${v.value.slug}" already exists.`, route);
      throw error;
    }
    return NextResponse.json({ event: data });
  } catch (err) {
    return serverError(err, { route });
  }
}

export async function PUT(req: Request) {
  const route = "PUT /api/admin/events";
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return apiError.badRequest();
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return apiError.validation("id is required.", route);
  const v = validateEventInput(body);
  if (!v.ok) return apiError.validation(v.error, route);
  try {
    const { data, error } = await getSupabaseAdmin().from("portal_events").update(v.value).eq("id", id).select("*").single();
    if (error) {
      if (error.code === "23505") return apiError.validation(`An event with the address "${v.value.slug}" already exists.`, route);
      throw error;
    }
    return NextResponse.json({ event: data });
  } catch (err) {
    return serverError(err, { route });
  }
}

export async function DELETE(req: Request) {
  const route = "DELETE /api/admin/events";
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return apiError.badRequest();
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return apiError.validation("id is required.", route);
  try {
    const { error } = await getSupabaseAdmin().from("portal_events").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, { route });
  }
}
