import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const { sessionClaims, userId } = await auth();
  if (!userId) return { ok: false as const, status: 401, message: "Sign in required." };

  // Role enforcement is OFF in dev (NEXT_PUBLIC_ENFORCE_ROLES unset) per STATUS_REPORT.md
  // When it flips on, only role:'admin' may pass.
  const enforce = process.env.NEXT_PUBLIC_ENFORCE_ROLES === "true";
  const role = (sessionClaims as { metadata?: { role?: string } } | null)?.metadata?.role;
  if (enforce && role !== "admin") {
    return { ok: false as const, status: 403, message: "Admin only." };
  }
  return { ok: true as const };
}

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("waitlist_signups")
      .select(
        "id, role, email, full_name, practice_name, phone, city_state, message, source, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return NextResponse.json({ rows: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  let body: { id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const allowed = ["new", "contacted", "converted", "declined"] as const;
  if (!body.id || !body.status || !allowed.includes(body.status as (typeof allowed)[number])) {
    return NextResponse.json({ error: "id and a valid status are required." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const update: { status: string; contacted_at?: string } = { status: body.status };
    if (body.status === "contacted") update.contacted_at = new Date().toISOString();

    const { error } = await supabase
      .from("waitlist_signups")
      .update(update)
      .eq("id", body.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
