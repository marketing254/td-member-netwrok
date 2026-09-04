import { Suspense } from "react";
import type { Metadata } from "next";
import MemberSignupFlow, { type SignupPrefill } from "@/components/join/MemberSignupFlow";
import { getPromoContext, getReferralContext, type RefContext } from "@/lib/referralContext";
import { resolveResumeToken } from "@/lib/abandoned";

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
 *
 * ?resume=TOKEN — the follow-up email's welcome-back path for a pending
 * (incomplete) registration: their saved details prefill, and while their
 * personal month-free code is active the header shows the 1-month offer
 * (the code itself never reaches the browser — it's applied server-side
 * at checkout via the token).
 */
export default async function JoinMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[]; promo?: string | string[]; resume?: string | string[] }>;
}) {
  const params = await searchParams;
  const ref = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const promo = Array.isArray(params.promo) ? params.promo[0] : params.promo;
  const resume = Array.isArray(params.resume) ? params.resume[0] : params.resume;

  // Referral links win; team promo codes (DIRECT, RESHANI, …) get the
  // same header rendered as a gift from the DMN team.
  let refCtx: RefContext | null =
    (await getReferralContext(ref)) ?? (await getPromoContext(promo));
  let prefill: SignupPrefill | null = null;

  if (resume) {
    const rc = await resolveResumeToken(resume).catch(() => null);
    if (rc) {
      prefill = {
        firstName: rc.firstName,
        lastName: rc.lastName,
        email: rc.email,
        practiceName: rc.practiceName,
      };
      if (!refCtx && rc.codeState === "active") {
        refCtx = {
          name: "Dental Member Network",
          kind: "team",
          tagline: "Welcome back — we saved your spot",
          imageUrl: "/faviconicon.png",
          pairedName: null,
          offerActive: true,
          offerMonths: 1,
        };
      }
      // Expired/no code → the normal page, with their details prefilled
      // and no false promise (per the SPEC).
    }
  }

  return (
    // Suspense boundary required — the flow reads useSearchParams().
    <Suspense fallback={null}>
      <MemberSignupFlow refCtx={refCtx} prefill={prefill} />
    </Suspense>
  );
}
