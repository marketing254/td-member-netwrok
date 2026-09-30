import type { Metadata } from "next";
import { DM_Sans, Libre_Caslon_Display } from "next/font/google";
import SummitLandingView from "@/components/events/SummitLandingView";
import "../../summit/summit.css";

/**
 * /rida/join — the join step (spec v2). Both /rida and the replay page
 * send their buttons here with their tags. Shows the offer summary beside
 * the form, then the $0 Stripe step. Existing members sign in here and
 * book their seat without a checkout.
 */
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--summit-sans", display: "swap" });
const serif = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--summit-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Join now: two months on us and your seat at the RIDA Annual Summit | DMN × RIDA",
  description: "Nothing to pay until Wednesday 6 January 2027. Your seat at the RIDA Annual Summit on 6 November is booked for you, and the Practice Playbook from RIDA Live is on your dashboard today.",
  robots: { index: false, follow: false },
};

export default function RidaJoinPage() {
  return (
    <div className={`summit ${sans.variable} ${serif.variable}`}>
      <SummitLandingView mode="join" />
    </div>
  );
}
