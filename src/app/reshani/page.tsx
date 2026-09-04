import { redirect } from "next/navigation";

/**
 * /reshani — Reshani's shareable team link. Referral vanity handles
 * require an expert/partner owner (DB check constraint), so this team
 * link is a static route instead: it hands the visitor to the member
 * signup with her promo code attached, which auto-applies the 3-month
 * offer at checkout. Her signups are visible as RESHANI redemptions in
 * /admin/promo-codes.
 */
export default function ReshaniLinkPage() {
  redirect("/join/member?promo=RESHANI");
}
