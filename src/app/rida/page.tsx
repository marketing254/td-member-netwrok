import type { Metadata } from "next";
import { DM_Sans, Libre_Caslon_Display } from "next/font/google";
import SummitLandingView from "@/components/events/SummitLandingView";
import "../summit/summit.css";

/**
 * /rida — the RIDA Annual Summit page (spec v2, 29 Sep 2026). Strangers
 * from the ads land here; the button goes to the same join step as the
 * replay page. Static and CDN-cacheable: campaign parameters are read in
 * the browser, and nothing touches the database until the form is sent.
 * noindex: a paid-traffic conversion page. /summit redirects here.
 */
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--summit-sans", display: "swap" });
const serif = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--summit-serif", display: "swap" });

export const metadata: Metadata = {
  title: "RIDA Annual Summit, 6 November, and two months of DMN on us | DMN × RIDA",
  description:
    "Built to Stay: The Independent Practice Operating System. Friday 6 November 2026, live on Zoom, four CE credits through RIDA. Join the Dental Member Network and your seat is booked for you.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Built to Stay: the RIDA Annual Summit, 6 November. Your seat booked, two months of DMN on us.",
    description: "Nine speakers, six of them in the network. Four CE credits through RIDA. Nothing to pay until 6 January 2027.",
    type: "website",
    images: [{ url: "https://www.dentalmembernetwork.com/replay/rida-annual-2026-11-06-banner.jpg", width: 1600, height: 658 }],
  },
};

export default function RidaSummitPage() {
  return (
    <div className={`summit ${sans.variable} ${serif.variable}`}>
      <SummitLandingView />
    </div>
  );
}
