import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The one agreement version the portals sign and attach. Every agreement
 * is v4 (Lester, 28 Oct 2026); the old static v1 PDFs under /public are
 * no longer referenced by any signing flow.
 */
export const PORTAL_AGREEMENT_VERSION = "v4";

/**
 * True when this expert / vendor already signed the founding agreement
 * on the accept page. The portal's start-trial card then only saves a
 * card and starts the subscription: no second agreement, no second
 * welcome email (Janice Janssen got both, 26 Oct 2026).
 *
 * Two signals, either is enough: an accepted founding invite linked to
 * the row, or the row itself already stamped with a v4 signature.
 */
export async function hasSignedFoundingAgreement(
  sb: SupabaseClient,
  who: { expertId?: string | null; vendorId?: string | null },
  row: { agreement_signed_at?: string | null; agreement_version?: string | null } | null | undefined,
): Promise<boolean> {
  if (row?.agreement_signed_at && row.agreement_version === PORTAL_AGREEMENT_VERSION) return true;
  let q = sb.from("founding_invites").select("id").eq("status", "accepted").limit(1);
  if (who.expertId) q = q.eq("expert_id", who.expertId);
  else if (who.vendorId) q = q.eq("vendor_id", who.vendorId);
  else return false;
  const { data } = await q.maybeSingle();
  return !!data;
}
