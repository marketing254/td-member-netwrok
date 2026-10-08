import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireVendor } from "@/lib/auth/guards";

/** POST: the signed-in partner closed the portal tour pop-up. Stamps tour_seen_at (0072). */
export async function POST() {
  const guard = await requireVendor();
  if (!guard.ok) return guard.response;
  const sb = getSupabaseAdmin() as unknown as SupabaseClient;
  const { error } = await sb.from("vendors").update({ tour_seen_at: new Date().toISOString() }).eq("id", guard.vendorId).is("tour_seen_at", null);
  if (error) return NextResponse.json({ ok: false }, { status: 200 }); // best-effort: never block the portal
  return NextResponse.json({ ok: true });
}
