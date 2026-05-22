import { Box, Typography } from "@mui/material";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import LegalShell, { type LegalSection } from "@/components/sections/LegalShell";

export const metadata = {
  title: "Vendor Network Partnership Agreement · Dental Member Network",
  description:
    "Full Vendor Network Partnership Agreement for the Dental Member Network, five commitments, fee schedule, and legal terms.",
};

const Strong = ({ children }: { children: React.ReactNode }) => (
  <Box component="strong" sx={{ color: "#0F1D3A", fontWeight: 600 }}>
    {children}
  </Box>
);

const SubHead = ({ children }: { children: React.ReactNode }) => (
  <Typography
    component="span"
    sx={{
      display: "block",
      fontSize: "0.78rem",
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "#A07823",
      mt: 2.5,
      mb: 0.75,
    }}
  >
    {children}
  </Typography>
);

// Pricing schedule table, styled to match LegalShell's white-card + gold-accent
// language. Rendered inside section 03's body so the table sits where the
// source HTML put it without breaking the rest of the page's visual rhythm.
const SCHEDULE_ROWS: { period: string; price: string; note: string }[] = [
  { period: "Months 1-6", price: "$0", note: "Founding partner waiver, applies automatically" },
  { period: "Months 7-12", price: "$49", note: "Locked-in launch rate" },
  { period: "Month 13 onward", price: "$199", note: "Standard partner rate" },
];

function FeeScheduleTable() {
  return (
    <Box
      sx={{
        bgcolor: "#FBFAF6",
        border: "1px solid",
        borderColor: "rgba(14,42,61,0.1)",
        borderRadius: 2,
        overflow: "hidden",
        my: 2.5,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1.2fr 1.5fr" },
          bgcolor: "#0F1D3A",
          color: "#FFFFFF",
        }}
      >
        {["Period", "Monthly fee", "Note"].map((heading) => (
          <Box
            key={heading}
            sx={{
              px: 2.25,
              py: 1.5,
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#F0C16E",
            }}
          >
            {heading}
          </Box>
        ))}
      </Box>
      {SCHEDULE_ROWS.map((row, i) => (
        <Box
          key={row.period}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1.2fr 1.5fr" },
            borderTop: i === 0 ? "none" : "1px solid",
            borderColor: "rgba(14,42,61,0.08)",
          }}
        >
          <Box
            sx={{
              px: 2.25,
              py: 2,
              fontWeight: 600,
              color: "#0F1D3A",
              fontSize: "0.92rem",
              borderRight: { sm: "1px solid", xs: "none" },
              borderBottom: { xs: "1px solid", sm: "none" },
              borderColor: "rgba(14,42,61,0.08)",
            }}
          >
            {row.period}
          </Box>
          <Box
            sx={{
              px: 2.25,
              py: 2,
              fontFamily: "var(--font-display)",
              fontSize: "1.35rem",
              color: "#A07823",
              fontWeight: 600,
              borderRight: { sm: "1px solid", xs: "none" },
              borderBottom: { xs: "1px solid", sm: "none" },
              borderColor: "rgba(14,42,61,0.08)",
              lineHeight: 1.1,
            }}
          >
            {row.price}
          </Box>
          <Box sx={{ px: 2.25, py: 2, color: "#5C6770", fontSize: "0.9rem", lineHeight: 1.5 }}>
            {row.note}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

const sections: LegalSection[] = [
  {
    number: "01",
    title: "The Five Commitments",
    body: (
      <span>
        By joining the network, you agree to five commitments, plus the operational and legal
        terms that follow. The structure is intentionally short. We&rsquo;d rather have a clear
        handshake than a 40-page document nobody reads. These are the only things we hold every
        vendor in the network to, everything else is operational detail.
      </span>
    ),
    items: [
      <span key="commit-best-deal">
        <Strong>Offer our members the best deal you have.</Strong> You agree to give DMN members
        a discount, bonus, or exclusive benefit that is at least as good as any offer you make
        available to comparable customers. If your terms get better elsewhere, ours match or
        improve. We promote this deal, it has to be real.
      </span>,
      <span key="commit-hotline">
        <Strong>Join our private partner hotline.</Strong> We host a private hotline that
        connects our members with vendors in the network. We keep one team member responsive
        there during business hours, and use it for fast coordination between members and
        vendors. It&rsquo;s where deals get sorted, leads get triaged, and we share what&rsquo;s
        working.
      </span>,
      <span key="commit-calendar">
        <Strong>Provide a calendar link.</Strong> You give us a working calendar booking link
        (Calendly, HubSpot, Cal.com, anything) where members can book a call with you directly.
        We feature it on your profile. You agree to keep it live, keep availability open, and
        respond to bookings within one business day.
      </span>,
      <span key="commit-evolve">
        <Strong>Accept that we&rsquo;ll evolve the network.</Strong> The network is new. Terms,
        benefits, fees, and operating rules will change as we learn. We commit to giving you
        advance notice of every change, the full mechanism is in Section 07.
      </span>,
      <span key="commit-fees">
        <Strong>Pay the fee, waived for your first six months.</Strong> Founding partners pay
        nothing for the first six months. Reduced rates apply for the second six months before
        the standard partner fee takes effect. Full schedule in Section 03.
      </span>,
    ],
  },
  {
    number: "02",
    title: "What's included",
    body: "",
    items: [
      <span key="incl-profile">
        <Strong>Your profile in the directory.</Strong> We create and maintain a dedicated
        profile page for you in the DMN Vendor Directory, logo, description, services, contact
        form, member-exclusive offer, and your calendar link.
      </span>,
      <span key="incl-promo">
        <Strong>Promotion to members.</Strong> You get priority category placement, quarterly
        newsletter mentions, one dedicated email to members per year, and eligibility for
        podcast and webinar features at our editorial discretion.
      </span>,
      <span key="incl-leads">
        <Strong>Lead routing.</Strong> Inquiries from members are routed directly to you by
        email and via your partner dashboard. All leads are pre-qualified, these are members who
        chose the network specifically to find someone like you.
      </span>,
      <span key="incl-badge">
        <Strong>Verified Partner badge.</Strong> You get a &ldquo;DMN Verified Partner&rdquo;
        mark you can use on your site, email signature, and sales materials while this Agreement
        is active. The license ends when this Agreement ends.
      </span>,
    ],
  },
  {
    number: "03",
    title: "Fees and payment",
    body: (
      <Box component="span" sx={{ display: "block" }}>
        Below is the partner fee schedule. Fees are billed in advance and due Net 15 from
        invoice date. Payments more than 30 days past due may accrue late charges at 1.5% per
        month or the maximum rate permitted by law, whichever is lower. Fees are exclusive of
        applicable taxes.
        <FeeScheduleTable />
      </Box>
    ),
    items: [
      <span key="fees-annual">
        <Strong>Annual pre-pay option.</Strong> If you commit to twelve months at the standard
        rate up front, you get two months free (effectively 10 months for the price of 12).
        Available after the founding partner period or at any time during the term.
      </span>,
      <span key="fees-norefund">
        <Strong>No refunds.</Strong> Except as expressly stated in this Agreement, fees are
        non-refundable.
      </span>,
    ],
  },
  {
    number: "04",
    title: "Member discount details",
    body: (
      <span>
        The member discount you commit to in the sign-up form is binding for the term of this
        Agreement. You can improve it any time, you just can&rsquo;t reduce or withdraw it
        without our written consent. You honor the discount when a member identifies themselves
        as a DMN member, books through your network calendar link, or is referred via the
        network&rsquo;s lead routing. Acceptable discount formats include:
      </span>
    ),
    items: [
      "A percentage off your standard pricing (typically 3-20%)",
      "A flat-dollar discount on first purchase or engagement",
      "A waived setup, onboarding, or implementation fee",
      "Bonus inclusions, extra hours, bundled products, extended trials",
      "Preferred payment terms or deferred billing",
    ],
  },
  {
    number: "05",
    title: "Standards we hold partners to",
    body: "While in the network, you confirm and agree that:",
    items: [
      "You operate in compliance with all applicable laws, regulations, and professional standards.",
      "You provide responsive, professional sales and customer support to members, at least at the quality level you give your best customers.",
      "You have the rights to all logos, copy, and content you give us, and you grant us a non-exclusive license to use them to promote you in the network.",
      "You will not engage in conduct that damages the DMN brand, including misleading advertising, harassment of members, or violation of professional codes of conduct.",
    ],
  },
  {
    number: "06",
    title: "Confidentiality and member data",
    body: (
      <span>
        Both parties may receive non-public information from the other. Each agrees to use it
        only for purposes of this Agreement and protect it with at least reasonable care. Member
        contact information shared with you in connection with leads may only be used to respond
        to and service that lead. You will not sell, transfer, or use member data for unrelated
        marketing, and you will comply with all applicable data protection laws. This survives
        termination of this Agreement.
      </span>
    ),
  },
  {
    number: "07",
    title: "Changes to terms",
    body: (
      <span>
        DMN may modify these terms, including pricing, benefits, eligibility, and operating
        rules, from time to time. We will provide at least <Strong>thirty (30) days&rsquo; prior
        written notice</Strong> via the partner dashboard. If a change materially reduces your
        benefits or increases your fees, you may terminate this Agreement before the change
        takes effect with no further obligation, provided you give us written notice within the
        30-day notice window. Your continued participation after the effective date of a change
        constitutes acceptance of the updated terms.
      </span>
    ),
  },
  {
    number: "08",
    title: "Term, renewal, and termination",
    body: (
      <Box component="span" sx={{ display: "block" }}>
        <SubHead>Initial term and renewal</SubHead>
        This Agreement starts on the date you submit the sign-up form on the Dental Member
        Network home page and continues for an initial term of twelve (12) months. It then
        renews automatically for successive twelve-month terms unless either party gives written
        notice of non-renewal at least 30 days before the end of the current term.
        <SubHead>Termination for convenience</SubHead>
        Either party may terminate this Agreement at any time on 30 days&rsquo; prior written
        notice. You remain responsible for fees accrued through the effective date of
        termination.
        <SubHead>Termination for cause</SubHead>
        Either party may terminate immediately on written notice if the other party materially
        breaches this Agreement and does not cure within 15 days of written notice, becomes
        insolvent, or engages in conduct that, in our reasonable judgment, materially harms the
        network.
        <SubHead>What happens at termination</SubHead>
        Your profile and promotional placements are removed from the network. The Verified
        Partner badge license ends. Any unpaid accrued fees become immediately due. Provisions
        that by their nature survive, confidentiality, member data protection, indemnification,
        and limits of liability, continue to apply.
      </Box>
    ),
  },
  {
    number: "09",
    title: "Disclaimers and liability",
    body: (
      <span>
        We do not guarantee any specific number of leads, conversion rate, or revenue outcome
        from network participation. Results depend on your products, pricing, sales process, and
        responsiveness. Except as expressly stated here, the network is provided &ldquo;as
        is.&rdquo; Neither party is liable for indirect, incidental, special, or consequential
        damages, or for lost profits or revenue. Total cumulative liability of either party is
        capped at the total fees paid by Vendor under this Agreement in the twelve months
        immediately preceding the event giving rise to liability. Vendor will indemnify DMN from
        third-party claims arising out of Vendor&rsquo;s products, services, sales practices,
        breach of this Agreement, or content supplied to the network.
      </span>
    ),
  },
  {
    number: "10",
    title: "Miscellaneous",
    body: (
      <span>
        The parties are independent contractors, this Agreement does not create a partnership,
        joint venture, agency, or employment relationship. You may not assign or transfer this
        Agreement without our prior written consent. This Agreement is the entire agreement
        between the parties on its subject and supersedes prior discussions. Any modification
        must be by written notice as described in Section 07 or by a signed amendment. If any
        provision is unenforceable, the remaining provisions stay in effect. This Agreement is
        governed by the laws of the State of __________, and any disputes will be resolved in
        the state or federal courts located in __________. Electronic signatures and acceptance
        via this online form have the same effect as original written signatures.
      </span>
    ),
  },
];

export default function VendorAgreementPage() {
  return (
    <>
      <Header />
      <LegalShell
        badge="VENDOR PARTNERSHIP AGREEMENT"
        title="Partnership Agreement"
        tagline="Built around five simple commitments."
        intro={
          <>
            We bring you the most engaged practice owners in dentistry. You bring the service
            quality, the best deal in the room, and a calendar link they can book in two clicks.
            This Vendor Network Partnership Agreement (the &ldquo;Agreement&rdquo;) is between
            the Dental Member Network (&ldquo;DMN,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;)
            and the Vendor who signs up (&ldquo;you,&rdquo; &ldquo;Vendor&rdquo;). It takes
            effect on the date of signup.
          </>
        }
        effectiveDate="On vendor signup"
        lastUpdated="Active draft"
        keyTerms={[
          { label: "Months 1-6", value: "$0", sub: "Waived" },
          { label: "Months 7-12", value: "$49", sub: "per month" },
          { label: "Month 13+", value: "$199", sub: "per month" },
          { label: "Commitment", value: "12 mo", sub: "Initial term" },
          { label: "Cancel", value: "30 d", sub: "Written notice" },
        ]}
        sections={sections}
        footnote={
          <>
            Questions before you apply? Email{" "}
            <a href="mailto:partnerships@joindmn.com">
              partnerships@joindmn.com
            </a>
            . Our team reads and responds within one business day.
          </>
        }
      />
      <Footer />
    </>
  );
}
