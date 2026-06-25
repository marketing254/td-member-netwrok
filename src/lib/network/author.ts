import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { NetworkAuthorKind } from "@/lib/supabase/types";

export type NetworkAuthor = {
  authUserId: string;
  kind: NetworkAuthorKind;
  displayName: string;
  subtitle: string | null;
  // The role-specific row id (expert_id / member_id / vendor_id / admin_id)
  // when we need to scope writes (e.g. expert posting from THEIR experts row).
  roleId: string | null;
};

/**
 * Look up a signed-in auth user's network identity. Priority:
 *   1. expert  (their workspace persona)
 *   2. partner (vendor)
 *   3. member  (active member)
 *   4. admin
 *
 * Returns null if the user isn't a recognized participant in the network
 * (e.g. session exists but they're not in any role table).
 *
 * Used by every network API that records or reads identity-stamped data
 * (posts, reactions, comments, chatbot conversations).
 */
export async function resolveNetworkAuthor(
  authUserId: string,
  email: string | null,
): Promise<NetworkAuthor | null> {
  const admin = getSupabaseAdmin();
  const lowerEmail = (email ?? "").toLowerCase();

  // 1. Expert? — primary identity for anyone in the experts table.
  {
    const { data } = await admin
      .from("experts")
      .select("id, display_name, full_name, specialty, status")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (data && data.status !== "archived" && data.status !== "suspended") {
      return {
        authUserId,
        kind: "expert",
        displayName: data.display_name || data.full_name,
        subtitle: data.specialty,
        roleId: data.id,
      };
    }
  }

  // 2. Partner (vendor)?
  if (lowerEmail) {
    const { data } = await admin
      .from("vendors")
      .select("id, display_name, company_name, category, status")
      .eq("contact_email", lowerEmail)
      .maybeSingle();
    if (
      data &&
      data.status !== "rejected" &&
      data.status !== "suspended" &&
      data.status !== "churned"
    ) {
      return {
        authUserId,
        kind: "partner",
        displayName: data.display_name || data.company_name,
        subtitle: data.category,
        roleId: data.id,
      };
    }
  }

  // 3. Active member?
  {
    const { data } = await admin
      .from("members")
      .select("id, first_name, last_name, practice_name, city, state, status")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (data && data.status === "active") {
      const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ").trim();
      const subtitle = data.practice_name
        ? data.practice_name
        : [data.city, data.state].filter(Boolean).join(", ") || null;
      return {
        authUserId,
        kind: "member",
        displayName: fullName || "Member",
        subtitle,
        roleId: data.id,
      };
    }
  }

  // 4. Admin?
  if (lowerEmail) {
    const { data } = await admin
      .from("admin_users")
      .select("id, full_name, role, active")
      .eq("email", lowerEmail)
      .maybeSingle();
    if (data?.active) {
      return {
        authUserId,
        kind: "admin",
        displayName: data.full_name || "Admin",
        subtitle: data.role,
        roleId: data.id,
      };
    }
  }

  return null;
}
