import type { Metadata } from "next";
import FoundMoneyEstimate from "@/components/audit/FoundMoneyEstimate";

export const metadata: Metadata = {
  title: "Your Found Money estimate | Dental Member Network",
  robots: { index: false, follow: false },
};

export default async function FoundMoneyEstimatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <FoundMoneyEstimate token={token} />;
}
