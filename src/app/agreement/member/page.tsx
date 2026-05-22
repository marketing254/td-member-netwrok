import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import LegalShell, { type LegalSection } from "@/components/sections/LegalShell";

export const metadata = {
  title: "Member Agreement · Dental Member Network",
  description:
    "The Dental Member Network Member Agreement covering membership benefits, account access, helpline usage, content rights, and termination.",
};

const sections: LegalSection[] = [
  {
    number: "01",
    title: "Membership Benefits",
    body: "As a member you receive:",
    items: [
      "24/7 expert helpline with business coaches and practice advisors.",
      "Exclusive partner discounts with negotiated vendor savings.",
      "Exclusive content library with recorded expert panels and training resources.",
      "Member directory with 500+ practice owners searchable by city, specialty, and revenue.",
      "Proven systems with templates, checklists, and SOPs.",
      "Monthly live AMAs with specialists.",
      "Content and features may be modified at our discretion with reasonable notice.",
    ],
  },
  {
    number: "02",
    title: "Account Access and Sharing",
    body:
      "Your membership is registered to you and your practice. You may share credentials with staff within your registered practice. Credentials may not be shared outside your practice. We may monitor usage patterns and contact you about inappropriate sharing.",
  },
  {
    number: "03",
    title: "Auto-Renewal",
    body:
      "All memberships auto-renew unless cancelled before renewal. Founding member pricing ($49/month or $490/year) never increases while your membership remains continuously active. If your membership lapses, founding pricing is no longer available. A reminder is sent before annual renewals.",
  },
  {
    number: "04",
    title: "Helpline Usage",
    body:
      "The helpline provides business guidance, not legal, financial, or clinical advice. Each case receives a written summary and follow-up plan within 3 business days. Helpline interactions are confidential between you and the assigned advisor. You may not record helpline calls without consent.",
  },
  {
    number: "05",
    title: "Content Usage Rights",
    body: "You may:",
    items: [
      "Stream content for professional development.",
      "Download and use templates within your practice.",
      "Share insights with your team.",
      "You may not record or screen-capture content.",
      "You may not redistribute or resell content.",
      "You may not use content to create competing products.",
      "You may not upload content to other platforms.",
    ],
  },
  {
    number: "06",
    title: "Vendor Deals and Savings",
    body:
      "Vendor deals are negotiated on behalf of the member network. Savings estimates are averages and individual results may vary. Vendor relationships and terms may change. DMN is not a party to transactions between members and vendors.",
  },
  {
    number: "07",
    title: "Member Conduct",
    body:
      "Use the platform professionally. Violations may result in termination without refund. Do not:",
    items: [
      "Engage in harassment.",
      "Post misleading content.",
      "Use the platform for unrelated purposes.",
      "Attempt to circumvent security.",
    ],
  },
  {
    number: "08",
    title: "Disclaimer",
    body:
      "DMN provides business education and services. Content does not constitute legal, financial, tax, clinical, or insurance advice. You are responsible for how you apply the information. Results are not guaranteed.",
  },
  {
    number: "09",
    title: "Termination",
    body: "We may terminate membership for:",
    items: [
      "Violations of these terms.",
      "Unauthorized content sharing.",
      "Payment failure.",
      "No refund is issued for violation terminations. Access is restored upon payment resolution.",
    ],
  },
  {
    number: "10",
    title: "Contact Information",
    body: "",
    items: [
      "Email: members@dentalmembernetwork.com",
      "Phone: available on request",
    ],
  },
];

export default function MemberAgreementPage() {
  return (
    <>
      <Header />
      <LegalShell
        badge="MEMBER AGREEMENT"
        title="Member Agreement"
        tagline="The terms that protect you, your practice, and the network."
        intro={
          <>
            This Member Agreement is entered into between Dental Member Network (DMN) and you
            (&quot;Member&quot;) upon registration. Read it before joining; everything below is
            what we hold ourselves to and what we ask of you.
          </>
        }
        effectiveDate="On member registration"
        lastUpdated="Active draft"
        keyTerms={[
          { label: "Founding rate", value: "$49/mo", sub: "Never increases while active" },
          { label: "Guarantee", value: "30 days", sub: "Full money-back" },
          { label: "Helpline SLA", value: "3 days", sub: "Written follow-up plan" },
          { label: "Cancel", value: "Anytime", sub: "From your portal" },
          { label: "Patient data", value: "Never", sub: "We don't store PHI" },
        ]}
        sections={sections}
        footnote={
          <>
            Questions before you join? Email{" "}
            <a href="mailto:members@dentalmembernetwork.com">members@dentalmembernetwork.com</a>{" "}
           , we read and respond to every message within one business day.
          </>
        }
      />
      <Footer />
    </>
  );
}
