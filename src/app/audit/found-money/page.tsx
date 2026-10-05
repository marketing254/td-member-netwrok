import type { Metadata } from "next";
import FoundMoneyLanding from "@/components/audit/FoundMoneyLanding";

const SITE = "https://www.dentalmembernetwork.com";

export const metadata: Metadata = {
  title: { absolute: "Found Money Audit: what is your practice overpaying for? | Dental Member Network" },
  description:
    "Upload three documents and see, in minutes, roughly what your practice is overpaying each year on card fees, supplies and subscriptions. Free. Members unlock every fix and a report checked by a person.",
  alternates: { canonical: `${SITE}/audit/found-money` },
  openGraph: {
    type: "website",
    url: `${SITE}/audit/found-money`,
    title: "Found Money Audit: three documents, one number, free",
    description: "Card fees, supply prices and subscriptions, read from your own documents. See your number in minutes.",
  },
};

export default function FoundMoneyAuditPage() {
  return <FoundMoneyLanding />;
}
