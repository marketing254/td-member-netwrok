import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import LegalShell, { type LegalSection } from "@/components/sections/LegalShell";

export const metadata = {
  title: "Refund & Cancellation Policy · Dental Member Network",
  description:
    "30-day money-back guarantee, monthly and annual cancellation rules, founding-member pricing, and refund eligibility for members, vendors, and expert partners.",
};

const sections: LegalSection[] = [
  {
    number: "01",
    title: "30-Day Money-Back Guarantee",
    body:
      "All new members are eligible for a full refund within their first 30 days. The guarantee applies to first enrollment only, not renewals or re-enrollments. Contact refunds@dentalmembernetwork.com with subject \"30-Day Refund Request.\" Refunds are processed within 5–10 business days.",
  },
  {
    number: "02",
    title: "Cancellation Policy",
    body: "",
    items: [
      "Monthly plans — cancel anytime, effective at the end of the billing period. Access retained until period ends. No partial-month refunds.",
      "Annual plans — cancel anytime. Within 30 days: full refund. After 30 days: cancellation is effective at the end of the annual period. No pro-rated refunds.",
      "How to cancel — through your member portal settings, or contact support. Cancellations are processed within 1–2 business days.",
    ],
  },
  {
    number: "03",
    title: "Founding Member Pricing",
    body:
      "$49/month or $490/year is locked for life while your membership is active. If you cancel and later re-enroll, the founding rate is no longer available — the standard rate of $199/month applies. Contact us about a temporary pause before cancelling.",
  },
  {
    number: "04",
    title: "Payment Failures",
    body: "",
    items: [
      "3 additional retry attempts over 10 days with email notifications.",
      "Account suspended after retries fail (access paused, not cancelled).",
      "30 days to update payment.",
      "After 30 days, the account is auto-cancelled.",
      "Founding members lose founding pricing if cancelled for payment failure.",
    ],
  },
  {
    number: "05",
    title: "Refund Exceptions",
    body: "No refunds are issued for:",
    items: [
      "Termination due to Terms violation.",
      "Members who already received a 30-day refund and re-enrolled.",
      "Requests after the 30-day window for monthly plans.",
      "Partial-period requests outside the guarantee.",
    ],
  },
  {
    number: "06",
    title: "Vendor Partner Cancellation & Refunds",
    body: "Founding cohort (months 1–6 free): vendors may cancel during the free period with no charge. No refund applies because no fees were collected.",
    items: [
      "Months 7–12 ($49/month) — cancel anytime with 30 days written notice. Cancellation takes effect at the end of the current billing period. No partial-month refunds. If cancelled during this period, vendor loses founding cohort pricing if they re-enroll.",
      "Month 13+ ($199/month standard) — cancel anytime with 30 days written notice. Cancellation takes effect at the end of the current billing period. No partial-month refunds.",
      "Initial commitment — the vendor partnership has a 12-month initial commitment term. Early termination within the first 12 months may be subject to the remaining balance for the commitment period unless otherwise agreed in writing.",
      "Upon cancellation — vendor listing removed within 5 business days. Active member deals are honored through their published end date. Vendor loses access to the member network.",
    ],
  },
  {
    number: "07",
    title: "Expert Partner Cancellation & Refunds",
    body:
      "Free period (first 6 months): experts may cancel during the free period with no charge. No refund applies because no fees were collected.",
    items: [
      "Paid period ($99/month) — cancel anytime with 30 days written notice. Cancellation takes effect at the end of the current billing period. No partial-month refunds.",
      "Course revenue — any pending commission payouts for paid courses will be processed within 30 days of cancellation. The 4% platform commission applies to all course fees collected prior to the cancellation effective date.",
      "Upon cancellation — expert profile removed from directory. Free courses are archived but no longer accessible to new members. Paid course access is honored for members who already purchased. Expert is removed from the helpline bench rotation.",
    ],
  },
  {
    number: "08",
    title: "Membership Pause (Coming Soon)",
    body:
      "We are developing a pause feature for up to 60 days without losing your pricing tier. Contact us directly for temporary pause needs in the meantime.",
  },
  {
    number: "09",
    title: "Contact Information",
    body: "",
    items: [
      "Email: refunds@dentalmembernetwork.com",
      "Phone: available on request",
      "Support hours: Monday–Friday, 9:00 AM – 5:00 PM EST",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <LegalShell
        badge="REFUND & CANCELLATION"
        title="Refund & Cancellation Policy"
        tagline="No-friction refunds. No retention calls."
        intro={
          <>
            How refunds work for members, vendor partners, and expert partners. Plain language,
            no surprises — read this before joining so you know exactly what you&apos;re signing
            up for.
          </>
        }
        effectiveDate="On enrollment"
        lastUpdated="Active draft"
        keyTerms={[
          { label: "Money back", value: "30 days", sub: "No questions" },
          { label: "Cancel", value: "Anytime", sub: "From the portal" },
          { label: "Pro-rate", value: "None", sub: "Full period or refund" },
          { label: "Pause", value: "Coming", sub: "Up to 60 days" },
          { label: "Process", value: "5–10 days", sub: "After request" },
        ]}
        sections={sections}
        footnote={
          <>
            Need a refund or have a question? Email{" "}
            <a href="mailto:refunds@dentalmembernetwork.com">refunds@dentalmembernetwork.com</a>{" "}
            with the subject line that matches your request. We respond within one business day.
          </>
        }
      />
      <Footer />
    </>
  );
}
