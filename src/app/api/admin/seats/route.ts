import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only management of team seats (migration 0079).
 *
 *   GET    /api/admin/seats?vendor_id=…   or   ?expert_id=…
 *   POST   { vendor_id | expert_id, email, name }   adds a seat; creates the
 *          auth user for that email if there is none (the portal login uses
 *          shouldCreateUser:false, so the user must exist to receive a code).
 *   DELETE { id }                                   removes a seat
 *
 * Owners never see or manage seats; only the team does, here.
 */
export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const vendorId = url.searchParams.get("vendor_id");
  const expertId = url.searchParams.get("expert_id");
  if (!vendorId && !expertId) return NextResponse.json({ error: "vendor_id or expert_id required" }, { status: 400 });
  try {
    const sb = getSupabaseAdmin();
    let q = sb.from("portal_seats").select("id, email, name, vendor_id, expert_id, created_at").order("created_at", { ascending: true });
    q = vendorId ? q.eq("vendor_id", vendorId) : q.eq("expert_id", expertId!);
    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json({ seats: data ?? [] });
  } catch (err) {
    return serverError(err, { route: "GET /api/admin/seats" });
  }
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const body = (await req.json().catch(() => ({}))) as { vendor_id?: string; expert_id?: string; email?: string; name?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim() || null;
  const vendorId = body.vendor_id || null;
  const expertId = body.expert_id || null;
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if ((vendorId && expertId) || (!vendorId && !expertId)) return NextResponse.json({ error: "Pick one company or one expert." }, { status: 400 });
  try {
    const sb = getSupabaseAdmin();
    // The owner's own email is already a login; a seat for it would be redundant.
    if (vendorId) {
      const { data: v } = await sb.from("vendors").select("contact_email").eq("id", vendorId).maybeSingle();
      if (!v) return NextResponse.json({ error: "Company not found." }, { status: 404 });
      if ((v.contact_email ?? "").toLowerCase() === email) return NextResponse.json({ error: "That is the owner's own login email." }, { status: 400 });
    } else {
      const { data: e } = await sb.from("experts").select("email").eq("id", expertId!).maybeSingle();
      if (!e) return NextResponse.json({ error: "Expert not found." }, { status: 404 });
      if ((e.email ?? "").toLowerCase() === email) return NextResponse.json({ error: "That is the owner's own login email." }, { status: 400 });
    }

    const { data: seat, error } = await sb
      .from("portal_seats")
      .insert({ email, name, vendor_id: vendorId, expert_id: expertId, added_by: guard.userId })
      .select("id, email, name, vendor_id, expert_id, created_at")
      .single();
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "That email already has a seat here." }, { status: 409 });
      throw error;
    }

    // Make sure the email can receive a sign-in code: create the auth user
    // if it does not exist yet. No email is sent by this.
    let authCreated = false;
    const { error: createErr } = await sb.auth.admin.createUser({ email, email_confirm: true });
    if (!createErr) authCreated = true;
    else if (!/already|exists|registered/i.test(createErr.message)) {
      console.error("[admin:seats] createUser failed", createErr.message);
    }
    return NextResponse.json({ seat, authCreated });
  } catch (err) {
    return serverError(err, { route: "POST /api/admin/seats" });
  }
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const body = (await req.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  try {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("portal_seats").delete().eq("id", body.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, { route: "DELETE /api/admin/seats" });
  }
}
