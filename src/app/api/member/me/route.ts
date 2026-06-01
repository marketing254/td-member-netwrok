import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/member/me — current member row, plus a few aggregates. */
export async function GET() {
  const guard = await requireMember();
  if (!guard.ok) return guard.response;

  const sb = getSupabaseAdmin();
  const { data: member, error } = await sb
    .from("members")
    .select(
      "id, first_name, last_name, credential, email, phone, practice_name, practice_role, city, tier, status, joined_at, activated_at",
    )
    .eq("id", guard.memberId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count of resources viewed (progress rows with last_viewed_at not null)
  const { count: viewedCount } = await sb
    .from("member_resource_progress")
    .select("*", { count: "exact", head: true })
    .eq("member_id", guard.memberId)
    .not("last_viewed_at", "is", null);

  return NextResponse.json({ member, viewedCount: viewedCount ?? 0 });
}

/** PATCH /api/member/me — edit profile fields (safe subset only). */
export async function PATCH(req: Request) {
  const guard = await requireMember();
  if (!guard.ok) return guard.response;

  let body: Partial<{
    first_name: string;
    last_name: string;
    credential: string;
    phone: string;
    practice_name: string;
    practice_role: string;
    city: string;
  }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const patch: {
    first_name?: string;
    last_name?: string | null;
    credential?: string | null;
    phone?: string | null;
    practice_name?: string | null;
    practice_role?: string | null;
    city?: string | null;
  } = {};
  if (typeof body.first_name === "string" && body.first_name.trim()) {
    patch.first_name = body.first_name.trim();
  }
  for (const key of ["last_name", "credential", "phone", "practice_name", "practice_role", "city"] as const) {
    if (typeof body[key] === "string") patch[key] = body[key]!.trim() || null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const { error } = await sb.from("members").update(patch).eq("id", guard.memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
