import { getSupabaseAdmin } from "@/lib/supabase/server";
import InviteLandingView from "@/components/join/InviteLandingView";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /invite/[code] — personalized STANDARD (non-founding) invite link for an
 * expert or partner prospect. Created in /admin/invites and pasted into a
 * manually written email. Greets the person by name and pre-fills the
 * standard application form (standard v1 agreement, no Stripe at signup).
 * The unguessable code is the only credential — no login.
 */
export default async function InviteLandingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const sb = getSupabaseAdmin();

  const { data: invite } = await sb
    .from("invite_links")
    .select("id, code, kind, full_name, email, company_name, status, expires_at, expert_id, vendor_id")
    .eq("code", code)
    .maybeSingle();

  const expired = invite ? new Date(invite.expires_at).getTime() < Date.now() : false;
  const valid = !!invite && invite.status !== "revoked" && invite.status !== "accepted" && !expired;

  if (invite && invite.status === "active") {
    // Best-effort viewed stamp; ignore failures.
    await sb
      .from("invite_links")
      .update({ status: "viewed", viewed_at: new Date().toISOString() })
      .eq("id", invite.id)
      .eq("status", "active");
  }

  if (!valid) {
    return (
      <InviteLandingView
        state={invite?.status === "accepted" ? "accepted" : "invalid"}
        kind={invite?.kind ?? "partner"}
        fullName={invite?.full_name ?? ""}
        email={null}
        companyName={null}
        code={code}
      />
    );
  }

  // Profile invites (created from the admin dropdown / auto-created with
  // the profile) accept the standard agreement directly; prospect invites
  // go through the application form.
  const isProfileInvite = !!(invite.kind === "expert" ? invite.expert_id : invite.vendor_id);

  return (
    <InviteLandingView
      state="valid"
      kind={invite.kind}
      fullName={invite.full_name}
      email={invite.email}
      companyName={invite.company_name}
      code={invite.code}
      profileInvite={isProfileInvite}
    />
  );
}
