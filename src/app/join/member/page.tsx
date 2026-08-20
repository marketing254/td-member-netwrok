import { Suspense } from "react";
import type { Metadata } from "next";
import MemberSignupFlow from "@/components/join/MemberSignupFlow";
import { getReferralContext } from "@/lib/referralContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start your membership — Dental Member Network",
  description:
    "Three short steps to join the Dental Member Network: the expert helpline, partner savings, and the full resource library.",
};

/**
 * /join/member — the streamlined Netflix-style member signup.
 * Same fields and same /api/member/signup call as the /join member form,
 * split into three steps. The homepage hero lands here with ?email=
 * prefilled; ?ref= attribution passes straight through.
 *
 * The referral invitation header (headshot, "recommended by", offer) is
 * resolved SERVER-SIDE so it's part of the first paint — no flash of the
 * organic page for referred visitors.
 */
export default async function JoinMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[] }>;
}) {
  const params = await searchParams;
  const ref = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const refCtx = await getReferralContext(ref);

  return (
    // Suspense boundary required — the flow reads useSearchParams().
    <Suspense fallback={null}>
      <MemberSignupFlow refCtx={refCtx} />
    </Suspense>
  );
}
