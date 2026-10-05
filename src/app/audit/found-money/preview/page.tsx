import { notFound } from "next/navigation";
import FoundMoneyPreview from "@/components/audit/FoundMoneyPreview";

export const metadata = { title: "Found Money report preview", robots: { index: false, follow: false } };

/** Local-only. Sample data, no reads or writes. 404 in production. */
export default function FoundMoneyPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <FoundMoneyPreview />;
}
