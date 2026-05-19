import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import LegalShell, { type LegalSection } from "@/components/sections/LegalShell";

export const metadata = {
  title: "Expert Partner Agreement · Dental Member Network",
  description:
    "The Dental Member Network Expert Partner Agreement covering partnership pricing, course listings, helpline participation, revenue share, and termination.",
};

const sections: LegalSection[] = [
  {
    number: "01",
    title: "Expert Partnership Overview",
    body:
      "DMN operates a membership network for dental practice owners. Expert partners are featured professionals who provide coaching, consulting, and educational services through the platform. Experts may be included on the helpline bench, listed in the expert directory, and may host courses and AMAs.",
  },
  {
    number: "02",
    title: "Expert Membership Pricing",
    body: "",
    items: [
      "Introductory period: first 6 months free from the partnership activation date.",
      "Standard pricing: $99 per month after the introductory period. Annual pricing may be available.",
      "Billing begins automatically at the start of month 7 unless the expert cancels before that date.",
    ],
  },
  {
    number: "03",
    title: "Course Listings",
    body:
      "Free courses: experts may list unlimited free courses on the platform at no additional cost. Free courses are accessible to all DMN members.",
    items: [
      "Paid courses, experts may list paid courses with pricing set by the expert.",
      "DMN charges a 4% commission on all paid course fees.",
      "Commission is deducted before payout to the expert.",
      "Payouts are processed monthly, net 30 days.",
      "Minimum payout threshold: $50.",
      "Course content must be approved by DMN before publication. DMN reserves the right to remove courses that do not meet quality standards.",
    ],
  },
  {
    number: "04",
    title: "Direct Bookings",
    body:
      "Members may book 1:1 calls directly with experts through the platform. DMN does not charge a platform fee for direct bookings. Experts set their own rates for 1:1 sessions. Experts are responsible for their own scheduling, delivery, and client management for booked sessions. DMN provides the booking interface but is not a party to the session agreement.",
  },
  {
    number: "05",
    title: "Helpline Expert Bench",
    body:
      "Experts may be included on the DMN expert helpline bench. Helpline participation is optional and by invitation. Helpline cases are assigned based on expertise, availability, and member needs. Compensation for helpline participation is negotiated separately. Helpline interactions are confidential.",
  },
  {
    number: "06",
    title: "Expert Directory",
    body:
      "Experts receive a profile in the expert directory visible to all members. Profiles include: name, credentials, specialties, bio, available services, and booking link. Experts must keep profile information current and accurate.",
  },
  {
    number: "07",
    title: "Live AMA Hosting",
    body:
      "Experts may host monthly live AMA sessions for DMN members. AMA sessions are recorded and added to the content library. Experts grant DMN a perpetual, non-exclusive license to host and distribute AMA recordings to members.",
  },
  {
    number: "08",
    title: "Content Ownership and Licensing",
    body:
      "Experts retain ownership of their course content and materials. By listing on DMN, experts grant DMN a non-exclusive license to:",
    items: [
      "Host and distribute course content to members.",
      "Use course titles, descriptions, and previews in marketing.",
      "Feature expert name and likeness in platform promotions.",
      "DMN retains ownership of platform content, member data, and all materials created by DMN (including AMA recordings, helpline summaries, and marketing materials).",
      "If an expert removes their courses, DMN's license to previously distributed content continues for existing enrolled members for 12 months.",
    ],
  },
  {
    number: "09",
    title: "Expert Conduct",
    body: "Experts agree to:",
    items: [
      "Provide accurate and professional guidance.",
      "Maintain relevant credentials and certifications.",
      "Respond to member inquiries in a timely manner.",
      "Comply with DMN's Code of Conduct.",
      "Experts may not provide legal, financial, tax, or clinical advice unless appropriately licensed.",
      "Experts may not make guarantees about specific business outcomes.",
      "Experts may not solicit members for services outside the DMN platform during the first 12 months.",
      "Experts may not disparage DMN, other experts, or members.",
    ],
  },
  {
    number: "10",
    title: "Revenue Share and Payments",
    body: "",
    items: [
      "Paid course revenue, expert receives 96%, DMN receives 4%.",
      "Direct booking revenue, expert receives 100%.",
      "Helpline compensation, negotiated separately per expert.",
      "Payouts processed monthly via designated payment method.",
      "Expert is responsible for their own taxes.",
      "DMN provides annual earnings statements and reports payments over $600/year via 1099 forms for US experts.",
    ],
  },
  {
    number: "11",
    title: "Term and Termination",
    body:
      "Introductory term: 6 months free. Ongoing term: month-to-month at $99/month after the introductory period. Expert may cancel with 30 days written notice. DMN may terminate for material breach with 30 days notice. Upon termination:",
    items: [
      "Expert profile removed within 5 business days.",
      "Active course enrollments honored for 90 days.",
      "Expert retains their course content.",
      "DMN retains AMA recordings and helpline materials.",
    ],
  },
  {
    number: "12",
    title: "Limitation of Liability",
    body:
      "DMN does not guarantee volume of course enrollments, bookings, or helpline assignments. Experts are independent contractors, not employees. Total liability shall not exceed fees paid or received in the preceding 12 months.",
  },
  {
    number: "13",
    title: "Confidentiality",
    body:
      "Both parties keep non-public business information confidential, including member data, pricing structures, and partnership terms. Survives termination for 2 years.",
  },
  {
    number: "14",
    title: "Indemnification",
    body:
      "Expert indemnifies DMN against claims arising from expert advice or services, breach of agreement, violation of laws, and misrepresentation of credentials.",
  },
  {
    number: "15",
    title: "Contact Information",
    body: "",
    items: [
      "Expert partnerships: experts@dentalmembernetwork.com",
      "Legal: legal@dentalmembernetwork.com",
      "Phone: available on request",
    ],
  },
];

export default function ExpertAgreementPage() {
  return (
    <>
      <Header />
      <LegalShell
        badge="EXPERT PARTNER AGREEMENT"
        title="Expert Partner Agreement"
        tagline="Six months free. 96% revenue share. Member trust at the center."
        intro={
          <>
            This Expert Partner Agreement is between Dental Member Network (DMN) and the expert
            partner (&quot;Expert,&quot; &quot;you&quot;). It covers helpline participation, course
            listings, revenue share, and the conduct standards we hold every featured expert to.
          </>
        }
        effectiveDate="On partnership activation"
        lastUpdated="Active draft"
        keyTerms={[
          { label: "Intro period", value: "6 months", sub: "Free, no commission" },
          { label: "Ongoing rate", value: "$99/mo", sub: "After month 6" },
          { label: "Course share", value: "96 / 4", sub: "Expert keeps 96%" },
          { label: "Direct bookings", value: "100%", sub: "Zero platform fee" },
          { label: "Cancel", value: "30 days", sub: "Written notice" },
        ]}
        sections={sections}
        footnote={
          <>
            Questions about partnership? Email{" "}
            <a href="mailto:experts@dentalmembernetwork.com">experts@dentalmembernetwork.com</a>.
            Legal questions go to{" "}
            <a href="mailto:legal@dentalmembernetwork.com">legal@dentalmembernetwork.com</a>.
          </>
        }
      />
      <Footer />
    </>
  );
}
