import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /auth/callback
 *
 * The redirect target for every Supabase magic link in this app. The URL
 * Supabase appends `?code=...` (PKCE flow) which we exchange for a session
 * cookie, then redirect the user to wherever they were trying to go (or a
 * sensible default).
 *
 * Query params:
 *   code   — PKCE code from Supabase (always present on success)
 *   next   — relative path to redirect to after success (defaults to /)
 *   role   — optional 'vendor' | 'admin' | 'member' — used to pick the
 *            right default destination and to log the event
 *
 * Also performs one-time bootstrap work on first sign-in:
 *   - Vendor: if the user has a `vendor_applications` row but no `vendors`
 *     row yet, create one and link auth_user_id.
 *   - Admin: if the user's email exists in `admin_users` but auth_user_id
 *     is null, link it now.
 *
 * Any failure during bootstrap is logged but does NOT block sign-in — the
 * user can still proceed; the admin queue will surface the issue.
 */
// Pick the right login page to bounce back to when the magic-link
// verification fails. Without this every failure used to land on the
// vendor login page even when an admin was trying to sign in.
function loginPathForRole(role: string | null): string {
  if (role === "admin") return "/admin/login";
  if (role === "member") return "/welcome"; // members don't have a separate login surface yet
  return "/vendor/login";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const role = url.searchParams.get("role"); // 'vendor' | 'admin' | 'member' | null

  if (!code) {
    const err = url.searchParams.get("error_description") ?? "Missing code in callback.";
    return NextResponse.redirect(
      new URL(`${loginPathForRole(role)}?error=${encodeURIComponent(err)}`, url.origin),
    );
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) {
    console.error("[auth:callback] code exchange failed:", error);
    return NextResponse.redirect(
      new URL(
        `${loginPathForRole(role)}?error=${encodeURIComponent(error?.message ?? "Sign-in failed.")}`,
        url.origin,
      ),
    );
  }

  const user = data.session.user;

  // ─────────────────────────────────────────────────────────────────────
  // First-signin bootstrap. Uses the service-role admin client so we can
  // write across RLS without needing the user to be approved yet.
  // ─────────────────────────────────────────────────────────────────────
  try {
    const admin = getSupabaseAdmin();

    if (role === "vendor" || !role) {
      // The vendors row is always created at signup time (see
      // /api/vendor/signup) — we just need to link auth_user_id on
      // first sign-in.
      const { data: existingVendor } = await admin
        .from("vendors")
        .select("id, auth_user_id")
        .eq("contact_email", (user.email ?? "").toLowerCase())
        .maybeSingle();

      if (existingVendor && !existingVendor.auth_user_id) {
        await admin
          .from("vendors")
          .update({ auth_user_id: user.id })
          .eq("id", existingVendor.id);
      }
    }

    if (role === "admin" || !role) {
      // Link admin row to auth user if email matches and not yet linked.
      const { data: adminRow } = await admin
        .from("admin_users")
        .select("id, auth_user_id, active")
        .eq("email", (user.email ?? "").toLowerCase())
        .maybeSingle();

      if (adminRow && adminRow.active && !adminRow.auth_user_id) {
        await admin
          .from("admin_users")
          .update({ auth_user_id: user.id, last_active_at: new Date().toISOString() })
          .eq("id", adminRow.id);
      } else if (adminRow && adminRow.active) {
        // Already linked — just bump last_active_at.
        await admin
          .from("admin_users")
          .update({ last_active_at: new Date().toISOString() })
          .eq("id", adminRow.id);
      }
    }

    // Audit log
    await admin.from("auth_audit").insert({
      event: "login_success",
      email: user.email,
      user_id: user.id,
      user_type: (role as "vendor" | "admin" | "member" | null) ?? null,
      metadata: { next },
    });
  } catch (err) {
    console.error("[auth:callback] bootstrap failed:", err);
    // Don't block sign-in. Continue to the redirect.
  }

  // Sanitize `next` — only allow relative paths to prevent open redirects.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
