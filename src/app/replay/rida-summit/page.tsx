import { redirect } from "next/navigation";
import { RIDA_REPLAY_SLUG } from "@/lib/events/ridaReplay";

/**
 * /replay/rida-summit
 *
 * Decision 30 Sep 2026 (Rushdha): the RIDA replay is members-only for
 * now. This URL sends everyone to the portal copy, and the middleware
 * asks non-members to sign in. The public page itself
 * (components/replay/ReplayPageView.tsx) is kept intact so it can be
 * switched back on by restoring the previous version of this file.
 */
export const dynamic = "force-dynamic";

export default function ReplayRidaSummitPage() {
  redirect(`/dashboard/replays/${RIDA_REPLAY_SLUG}`);
}
