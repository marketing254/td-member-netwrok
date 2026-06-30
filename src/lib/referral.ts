import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Generate a short, human-readable referral code (e.g. "GARY7K3"). Avoids
 * easily-confused characters (0/O/1/I). 6 chars by default.
 */
export function generateReferralCode(prefix: string, length = 4): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < length; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const clean = prefix.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "DMN";
  return `${clean}${suffix}`;
}

/**
 * Ensure (or create) a referral code for an expert. Idempotent — if the
 * expert already has one we return it; otherwise we create + return.
 */
export async function getOrCreateExpertReferral(expertId: string, displayName: string): Promise<{ code: string }> {
  const admin = getSupabaseAdmin();
  const { data: existing } = await admin
    .from("referral_codes")
    .select("code")
    .eq("expert_id", expertId)
    .maybeSingle();
  if (existing) return { code: existing.code };

  // Try a few times in the (rare) collision case.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReferralCode(displayName);
    const { error } = await admin
      .from("referral_codes")
      .insert({ expert_id: expertId, code });
    if (!error) return { code };
  }
  throw new Error("Could not allocate a unique referral code");
}

/**
 * Same as the expert helper, scoped to a vendor (partner).
 */
export async function getOrCreateVendorReferral(vendorId: string, displayName: string): Promise<{ code: string }> {
  const admin = getSupabaseAdmin();
  const { data: existing } = await admin
    .from("referral_codes")
    .select("code")
    .eq("vendor_id", vendorId)
    .maybeSingle();
  if (existing) return { code: existing.code };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReferralCode(displayName);
    const { error } = await admin
      .from("referral_codes")
      .insert({ vendor_id: vendorId, code });
    if (!error) return { code };
  }
  throw new Error("Could not allocate a unique referral code");
}

/**
 * Look up a referral code's row id by string. Returns null when invalid.
 * Used by the member-signup route to stamp the referral on the new row.
 */
export async function resolveReferralCode(code: string | null | undefined): Promise<string | null> {
  if (!code) return null;
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("referral_codes")
    .select("id, active")
    .eq("code", trimmed)
    .maybeSingle();
  if (!data || !data.active) return null;
  return data.id;
}
