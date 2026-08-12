import { Suspense } from "react";
import type { Metadata } from "next";
import MemberSignupFlow from "@/components/join/MemberSignupFlow";

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
 */
export default function JoinMemberPage() {
  // Suspense boundary required — the flow reads useSearchParams().
  return (
    <Suspense fallback={null}>
      <MemberSignupFlow />
    </Suspense>
  );
}
