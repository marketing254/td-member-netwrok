import type { Metadata } from "next";
import { DM_Sans, Libre_Caslon_Display } from "next/font/google";
import SummitLandingView from "@/components/events/SummitLandingView";
import "./summit.css";

/**
 * /summit — the DMN × RIDA September 16 summit landing page (paid-ads).
 *
 * Static and CDN-cacheable like /start: campaign parameters are read in
 * the browser, and nothing touches the database until a visitor submits
 * the form. noindex: a paid-traffic conversion page, per the brief.
 */
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--summit-sans", display: "swap" });
const serif = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--summit-serif", display: "swap" });

export const metadata: Metadata = {
  title: "September 16 Summit and DMN Membership Trial | DMN × RIDA",
  description:
    "September 16 live dental practice summit. Seven speakers, two panels, 2 CE credits and a 30-day DMN trial.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Stop losing revenue you already earned — live summit, September 16",
    description: "Two panels, seven practice experts, 2 CE credits. Included with a 30-day DMN membership trial.",
    type: "website",
  },
};

export default function SummitPage() {
  return (
    <div className={`summit ${sans.variable} ${serif.variable}`}>
      <SummitLandingView />
    </div>
  );
}
