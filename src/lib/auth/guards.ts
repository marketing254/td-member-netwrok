import "server-only";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Auth guards for Route Handlers. Each returns either { ok, ...context }
 * or a NextResponse you should immediately return from the route.
 *
 * Why this lives server-only: it imports cookie + service-role clients.
 *
 * Defense in depth:
 *   - Middleware blocks page navigation for unauthenticated users
 *   - These guards block direct API hits (curl, scripts, malicious clients)
 *   - RLS in the database is the third layer
 */

export type AdminContext = {
  ok: true;
  userId: string;
  email: string;
  adminId: string;
  role: "owner" | "admin" | "reviewer" | "support";
};

export type VendorContext = {
  ok: true;
  userId: string;
  email: string;
  vendorId: string;
  status: "pending_review" | "approved" | "rejected" | "suspended" | "churned";
  verified: boolean;
};

export type MemberContext = {
  ok: true;
  userId: string;
  email: string;
  memberId: string;
  firstName: string;
  status: "waitlist" | "invited" | "active" | "paused" | "churned";
};

type Failure = { ok: false; response: NextResponse };

const ADMIN_ROLES = ["owner", "admin", "reviewer", "support"] as const;

/**
 * requireAdmin
 *
 * Use at the top of every /api/admin/* route. Returns the admin row +
 * normalized claims if the request belongs to an active admin; otherwise
 * returns a 401 / 403 response the caller must return immediately.
 *
 * Usage:
 *   const guard = await requireAdmin();
 *   if (!guard.ok) return guard.response;
 *   // guard.adminId, guard.email, guard.role are now safe to use
 */
export async function requireAdmin(): Promise<AdminContext | Failure> {
  const cookieClient = await createServerSupabase();
  const { data: userData, error: userErr } = await cookieClient.auth.getUser();
  if (userErr || !userData?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  const email = userData.user.email?.toLowerCase();
  if (!email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Account is missing an email." }, { status: 403 }),
    };
  }

  // Lookup via service role so we don't depend on the admin_users RLS policy
  // matching the calling user. We trust the cookie-validated user id above.
  const admin = getSupabaseAdmin();
  const { data: row } = await admin
    .from("admin_users")
    .select("id, role, active, auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (!row || !row.active) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authorized." }, { status: 403 }),
    };
  }

  // Best-effort: ensure auth_user_id stays linked & bump last_active_at.
  if (row.auth_user_id !== userData.user.id) {
    await admin
      .from("admin_users")
      .update({ auth_user_id: userData.user.id, last_active_at: new Date().toISOString() })
      .eq("id", row.id);
  } else {
    await admin
      .from("admin_users")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", row.id);
  }

  if (!ADMIN_ROLES.includes(row.role as (typeof ADMIN_ROLES)[number])) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid admin role." }, { status: 403 }),
    };
  }

  return {
    ok: true,
    userId: userData.user.id,
    email,
    adminId: row.id,
    role: row.role as AdminContext["role"],
  };
}

/**
 * requireOwner
 *
 * Stricter variant: only the `owner` role. Use on routes that mutate the
 * admin team or do irreversible operations.
 */
export async function requireOwner(): Promise<AdminContext | Failure> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;
  if (guard.role !== "owner") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Owner-only action." },
        { status: 403 },
      ),
    };
  }
  return guard;
}

/**
 * requireVendor
 *
 * Returns the vendor row that matches the signed-in user's email, or a
 * 401/403 response. Used by vendor-self APIs (the portal already uses RLS
 * for browser writes, this is only for server endpoints we add later).
 */
export async function requireVendor(): Promise<VendorContext | Failure> {
  const cookieClient = await createServerSupabase();
  const { data: userData, error: userErr } = await cookieClient.auth.getUser();
  if (userErr || !userData?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  const email = userData.user.email?.toLowerCase();
  if (!email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Account is missing an email." }, { status: 403 }),
    };
  }

  const admin = getSupabaseAdmin();
  const { data: row } = await admin
    .from("vendors")
    .select("id, status, verified, auth_user_id")
    .eq("contact_email", email)
    .maybeSingle();

  if (!row) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No vendor profile linked to this account." }, { status: 403 }),
    };
  }

  if (row.status === "suspended" || row.status === "churned") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Vendor account is inactive." }, { status: 403 }),
    };
  }

  return {
    ok: true,
    userId: userData.user.id,
    email,
    vendorId: row.id,
    status: row.status as VendorContext["status"],
    verified: !!row.verified,
  };
}

/**
 * requireVerifiedVendor
 *
 * Strictest variant: only approved + verified vendors. Use on any endpoint
 * that publishes content visible to members (offer/catalog inserts, etc).
 */
export async function requireVerifiedVendor(): Promise<VendorContext | Failure> {
  const guard = await requireVendor();
  if (!guard.ok) return guard;
  if (guard.status !== "approved" || !guard.verified) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Your vendor account is not approved & verified yet." },
        { status: 403 },
      ),
    };
  }
  return guard;
}

/**
 * requireMember
 *
 * Returns the active member row for the signed-in user, or 401/403.
 * Used by /api/member/* endpoints.
 */
export async function requireMember(): Promise<MemberContext | Failure> {
  const cookieClient = await createServerSupabase();
  const { data: userData, error: userErr } = await cookieClient.auth.getUser();
  if (userErr || !userData?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not signed in." }, { status: 401 }),
    };
  }

  const email = userData.user.email?.toLowerCase();
  if (!email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Account is missing an email." }, { status: 403 }),
    };
  }

  const admin = getSupabaseAdmin();
  const { data: row } = await admin
    .from("members")
    .select("id, status, first_name, auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (!row) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No member profile linked to this account." }, { status: 403 }),
    };
  }

  if (row.status !== "active") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Your member portal isn't active yet." },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true,
    userId: userData.user.id,
    email,
    memberId: row.id,
    firstName: row.first_name,
    status: row.status as MemberContext["status"],
  };
}
