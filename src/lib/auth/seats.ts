import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Team seats (migration 0079): extra people who sign in with their own
 * email and land in a partner's or an expert's portal. Managed only in the
 * admin console. Server-side lookups used by the guards and login routes.
 */
export async function seatVendorIdFor(email: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("portal_seats")
    .select("vendor_id")
    .eq("email", email.toLowerCase())
    .not("vendor_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.vendor_id ?? null;
}

export async function seatExpertIdFor(email: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("portal_seats")
    .select("expert_id")
    .eq("email", email.toLowerCase())
    .not("expert_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.expert_id ?? null;
}
