import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Vendor Network Partnership Agreement · Dental Member Network",
  description:
    "Full Vendor Network Partnership Agreement for the Dental Member Network, five commitments, fee schedule, and legal terms.",
};

const KEY_TERMS = [
  { label: "Months 1-6", value: "$0", sub: "Waived" },
  { label: "Months 7-12", value: "$49", sub: "per month" },
  { label: "Month 13+", value: "$199", sub: "per month" },
  { label: "Commitment", value: "12 mo", sub: "Initial term" },
  { label: "Cancel", value: "30 d", sub: "Written notice" },
];

const COMMITMENTS = [
  {
    num: "01",
    title: "Offer our members the best deal you have.",
    body: "You agree to give DMN members a discount, bonus, or exclusive benefit that is at least as good as any offer you make available to comparable customers. If your terms get better elsewhere, ours match or improve. We promote this deal, it has to be real.",
  },
  {
    num: "02",
    title: "Join our private partner hotline.",
    body: "We host a private hotline that connects our members with vendors in the network. We keep one team member responsive there during business hours, and use it for fast coordination between members and vendors. It's where deals get sorted, leads get triaged, and we share what's working.",
  },
  {
    num: "03",
    title: "Provide a calendar link.",
    body: "You give us a working calendar booking link (Calendly, HubSpot, Cal.com, anything) where members can book a call with you directly. We feature it on your profile. You agree to keep it live, keep availability open, and respond to bookings within one business day.",
  },
  {
    num: "04",
    title: "Accept that we'll evolve the network.",
    body: "The network is new. Terms, benefits, fees, and operating rules will change as we learn. We commit to giving you advance notice of every change, the full mechanism is in Section 06.",
  },
  {
    num: "05",
    title: "Pay the fee, waived for your first six months.",
    body: "Founding partners pay nothing for the first six months. Reduced rates apply for the second six months before the standard partner fee takes effect. Full schedule in Section 02.",
  },
];

const SCHEDULE = [
  { period: "Months 1-6", price: "$0", note: "Founding partner waiver, applies automatically" },
  { period: "Months 7-12", price: "$49", note: "Locked-in launch rate" },
  { period: "Month 13 onward", price: "$199", note: "Standard partner rate" },
];

const DISCOUNT_FORMATS = [
  "A percentage off your standard pricing (typically 3-20%)",
  "A flat-dollar discount on first purchase or engagement",
  "A waived setup, onboarding, or implementation fee",
  "Bonus inclusions, extra hours, bundled products, extended trials",
  "Preferred payment terms or deferred billing",
];

const STANDARDS = [
  "You operate in compliance with all applicable laws, regulations, and professional standards;",
  "You provide responsive, professional sales and customer support to members, at least at the quality level you give your best customers;",
  "You have the rights to all logos, copy, and content you give us, and you grant us a non-exclusive license to use them to promote you in the network;",
  "You will not engage in conduct that damages the DMN brand, including misleading advertising, harassment of members, or violation of professional codes of conduct.",
];

const sectionTitleSx = {
  fontFamily: "var(--font-display)",
  fontSize: { xs: "1.6rem", md: "1.85rem" },
  fontWeight: 600,
  color: "#0A1A2F",
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
  pb: 2,
  mb: 3,
  borderBottom: "1px solid",
  borderColor: "rgba(14,42,61,0.1)",
};

const numAccentSx = {
  color: "#A07823",
  fontStyle: "italic",
  fontWeight: 400,
  mr: 1.5,
};

const bodyTextSx = {
  color: "#2A3654",
  fontSize: "0.98rem",
  lineHeight: 1.75,
  mb: 2,
};

const subHeadingSx = {
  fontSize: "1.05rem",
  fontWeight: 600,
  color: "#0A1A2F",
  letterSpacing: "-0.005em",
  mt: 3,
  mb: 1.5,
};

export default function VendorAgreementPage() {
  return (
    <>
      <Header />

      {/* HERO */}
      <Box
        component="header"
        sx={{
          position: "relative",
          bgcolor: "#060D1F",
          color: "#FFFFFF",
          pt: { xs: 6, md: 10 },
          pb: { xs: 12, md: 16 },
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(42,95,168,0.22), transparent 50%), radial-gradient(circle at 20% 80%, rgba(212,164,75,0.08), transparent 50%)",
            pointerEvents: "none",
          }}
        />
        <Container maxWidth="md" sx={{ position: "relative" }}>
          <Stack direction="row" sx={{ mb: 4, alignItems: "center" }}>
            <Button
              href="/#waitlist"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "rgba(246,241,231,0.7)",
                "&:hover": { color: "#F0C16E", bgcolor: "rgba(255,255,255,0.04)" },
              }}
            >
              Back to waitlist
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 5, alignItems: "center" }}
          >
            <Box
              aria-hidden
              sx={{
                width: 36,
                height: 2,
                bgcolor: "#D4A44B",
              }}
            />
            <Typography
              sx={{
                fontSize: "0.78rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#F2DD9B",
                fontWeight: 600,
              }}
            >
              Dental Member Network · Vendor Partnership
            </Typography>
          </Stack>

          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              color: "#FFFFFF",
              fontSize: { xs: "2.5rem", sm: "3.25rem", md: "4.5rem" },
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              mb: 1,
            }}
          >
            Partnership Agreement
            <Box
              component="em"
              sx={{
                display: "block",
                fontStyle: "italic",
                color: "#D4A44B",
                fontWeight: 400,
              }}
            >
              Built around five simple commitments.
            </Box>
          </Typography>

          <Typography
            sx={{
              color: "#C9D4EB",
              fontSize: { xs: "1rem", md: "1.125rem" },
              lineHeight: 1.65,
              maxWidth: 640,
              mt: 4,
            }}
          >
            We bring you the most engaged practice owners in dentistry. You bring the service
            quality, the best deal in the room, and a calendar link they can book in two clicks.
            Below are the terms, read them through, then head to the sign-up form on the home page.
          </Typography>

          <Stack
            direction="row"
            spacing={3}
            sx={{
              mt: 7,
              flexWrap: "wrap",
              rowGap: 2,
              color: "#C9D4EB",
              fontSize: "0.85rem",
            }}
          >
            <Box>
              <Box component="strong" sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                Single tier
              </Box>{" "}
              · Featured Partner
            </Box>
            <Box>
              <Box component="strong" sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                $199
              </Box>
              /month standard rate
            </Box>
            <Box>
              <Box component="strong" sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                6 months free
              </Box>{" "}
              · Founding partner offer
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* KEY TERMS BAND (overlapping hero bottom) */}
      <Container maxWidth="md" sx={{ position: "relative", mt: { xs: -8, md: -10 }, mb: { xs: 6, md: 8 }, zIndex: 2 }}>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "rgba(14,42,61,0.08)",
            boxShadow: "0 30px 60px -20px rgba(15,29,58,0.18), 0 8px 20px -10px rgba(15,29,58,0.12)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" },
          }}
        >
          {KEY_TERMS.map((t, i) => (
            <Box
              key={t.label}
              sx={{
                py: 3.5,
                px: 2.5,
                textAlign: "center",
                borderRight: { sm: i < KEY_TERMS.length - 1 ? "1px solid" : "none", xs: "none" },
                borderBottom: { xs: "1px solid", sm: "none" },
                borderColor: "rgba(14,42,61,0.06)",
                "&:last-of-type": { borderBottom: "none" },
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#6A7591",
                  fontWeight: 600,
                }}
              >
                {t.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.85rem",
                  color: "#0F1D3A",
                  fontWeight: 600,
                  mt: 1,
                  lineHeight: 1.1,
                }}
              >
                {t.value}
              </Typography>
              <Typography sx={{ fontSize: "0.74rem", color: "#6A7591", mt: 0.5 }}>
                {t.sub}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>

      <Box
        component="main"
        sx={{
          bgcolor: "#F7F4ED",
          pb: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          {/* INTRO */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              border: "1px solid",
              borderColor: "rgba(14,42,61,0.08)",
              borderLeft: "4px solid #D4A44B",
              p: { xs: 3, md: 4 },
              borderRadius: "0 8px 8px 0",
              mb: { xs: 6, md: 8 },
            }}
          >
            <Typography sx={{ ...bodyTextSx, fontSize: "1.05rem", mb: 2 }}>
              This Vendor Network Partnership Agreement (the{" "}
              <Box component="strong" sx={{ color: "#0F1D3A", fontWeight: 600 }}>
                &ldquo;Agreement&rdquo;
              </Box>
              ) is between the{" "}
              <Box component="strong" sx={{ color: "#0F1D3A", fontWeight: 600 }}>
                Dental Member Network
              </Box>{" "}
              (&ldquo;DMN,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) and the{" "}
              <Box component="strong" sx={{ color: "#0F1D3A", fontWeight: 600 }}>
                Vendor
              </Box>{" "}
              who signs up below (&ldquo;you,&rdquo; &ldquo;Vendor&rdquo;). It takes effect on the date of signup.
            </Typography>
            <Typography sx={{ ...bodyTextSx, fontSize: "1.05rem", mb: 0 }}>
              By joining the network, you agree to five commitments, outlined right below, plus the
              operational and legal terms that follow. The structure is intentionally short. We&rsquo;d
              rather have a clear handshake than a 40-page document nobody reads.
            </Typography>
          </Box>

          {/* THE FIVE COMMITMENTS */}
          <Box sx={{ mb: { xs: 8, md: 10 } }}>
            <Stack spacing={1.5} sx={{ mb: 5, textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#A07823",
                  fontWeight: 600,
                }}
              >
                The Five Commitments
              </Typography>
              <Typography
                component="h2"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "2rem", md: "2.4rem" },
                  color: "#0F1D3A",
                  fontWeight: 600,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                What you agree to as a partner.
              </Typography>
              <Typography
                sx={{
                  color: "#6A7591",
                  fontSize: "1rem",
                  maxWidth: 520,
                  mx: "auto",
                  lineHeight: 1.65,
                }}
              >
                These are the only things we hold every vendor in the network to. Everything else is operational detail.
              </Typography>
            </Stack>

            <Stack spacing={2.5}>
              {COMMITMENTS.map((c) => (
                <Box
                  key={c.num}
                  sx={{
                    bgcolor: "#FFFFFF",
                    border: "1px solid",
                    borderColor: "rgba(14,42,61,0.08)",
                    borderRadius: 2,
                    p: { xs: 3, md: 4 },
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "64px 1fr" },
                    gap: { xs: 1.75, sm: 3 },
                    alignItems: "flex-start",
                    transition: "transform 300ms ease, box-shadow 300ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 24px -12px rgba(10,37,64,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: "#0F1D3A",
                      color: "#D4A44B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.4rem",
                      fontWeight: 600,
                    }}
                  >
                    {c.num}
                  </Box>
                  <Box>
                    <Typography
                      component="h3"
                      sx={{
                        fontFamily: "var(--font-display)",
                        fontSize: { xs: "1.25rem", md: "1.4rem" },
                        color: "#0F1D3A",
                        fontWeight: 600,
                        lineHeight: 1.25,
                        letterSpacing: "-0.005em",
                        mb: 1.25,
                      }}
                    >
                      {c.title}
                    </Typography>
                    <Typography sx={{ color: "#2A3654", fontSize: "0.95rem", lineHeight: 1.7, m: 0 }}>
                      {c.body}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* SECTION 01 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>01</Box>
              What&rsquo;s included
            </Typography>

            <Typography sx={subHeadingSx}>Your profile in the directory</Typography>
            <Typography sx={bodyTextSx}>
              We create and maintain a dedicated profile page for you in the DMN Vendor Directory,
              logo, description, services, contact form, member-exclusive offer, and your calendar link.
            </Typography>

            <Typography sx={subHeadingSx}>Promotion to members</Typography>
            <Typography sx={bodyTextSx}>
              You get priority category placement, quarterly newsletter mentions, one dedicated email
              to members per year, and eligibility for podcast and webinar features at our editorial
              discretion.
            </Typography>

            <Typography sx={subHeadingSx}>Lead routing</Typography>
            <Typography sx={bodyTextSx}>
              Inquiries from members are routed directly to you by email and via your partner
              dashboard. All leads are pre-qualified, these are members who chose the network
              specifically to find someone like you.
            </Typography>

            <Typography sx={subHeadingSx}>Verified Partner badge</Typography>
            <Typography sx={bodyTextSx}>
              You get a &ldquo;DMN Verified Partner&rdquo; mark you can use on your site, email
              signature, and sales materials while this Agreement is active. The license ends when
              this Agreement ends.
            </Typography>
          </Box>

          {/* SECTION 02 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>02</Box>
              Fees and payment
            </Typography>

            {/* Schedule table */}
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid",
                borderColor: "rgba(14,42,61,0.1)",
                borderRadius: 2,
                overflow: "hidden",
                mb: 3,
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
                {["Period", "Monthly Fee", "Note"].map((h) => (
                  <Box
                    key={h}
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      fontSize: "0.72rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      borderBottom: { xs: "1px solid rgba(255,255,255,0.08)", sm: "none" },
                      "&:last-of-type": { borderBottom: "none" },
                    }}
                  >
                    {h}
                  </Box>
                ))}
              </Box>
              {SCHEDULE.map((row, i) => (
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
                      px: 2.5,
                      py: 2.25,
                      fontWeight: 600,
                      color: "#0F1D3A",
                      fontSize: "0.95rem",
                      borderRight: { sm: "1px solid", xs: "none" },
                      borderColor: "rgba(14,42,61,0.08)",
                    }}
                  >
                    {row.period}
                  </Box>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2.25,
                      fontFamily: "var(--font-display)",
                      fontSize: "1.45rem",
                      color: "#0F1D3A",
                      fontWeight: 600,
                      borderRight: { sm: "1px solid", xs: "none" },
                      borderColor: "rgba(14,42,61,0.08)",
                    }}
                  >
                    {row.price}
                  </Box>
                  <Box sx={{ px: 2.5, py: 2.25, color: "#6A7591", fontSize: "0.92rem" }}>
                    {row.note}
                  </Box>
                </Box>
              ))}
            </Box>

            <Typography sx={bodyTextSx}>
              Fees are billed in advance and due Net 15 from invoice date. Payments more than 30
              days past due may accrue late charges at 1.5% per month or the maximum rate permitted
              by law, whichever is lower. Fees are exclusive of applicable taxes.
            </Typography>

            <Box
              sx={{
                bgcolor: "#F3F6FB",
                borderLeft: "3px solid #D4A44B",
                p: 2.5,
                borderRadius: "0 4px 4px 0",
                my: 3,
              }}
            >
              <Typography sx={{ color: "#2A3654", fontSize: "0.95rem", lineHeight: 1.65, m: 0 }}>
                <Box component="strong" sx={{ color: "#0F1D3A", fontWeight: 600 }}>
                  Annual pre-pay option:
                </Box>{" "}
                If you commit to twelve months at the standard rate up front, you get two months
                free (effectively 10 months for the price of 12). Available after the founding
                partner period or at any time during the term.
              </Typography>
            </Box>

            <Typography sx={subHeadingSx}>No refunds</Typography>
            <Typography sx={bodyTextSx}>
              Except as expressly stated in this Agreement, fees are non-refundable.
            </Typography>
          </Box>

          {/* SECTION 03 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>03</Box>
              Member discount details
            </Typography>

            <Typography sx={bodyTextSx}>
              The member discount you commit to in the sign-up form is binding for the term of this
              Agreement. You can improve it any time, you just can&rsquo;t reduce or withdraw it
              without our written consent.
            </Typography>

            <Typography sx={bodyTextSx}>Acceptable discount formats include:</Typography>

            <Stack component="ul" spacing={1} sx={{ pl: 3, m: 0, mb: 2.5 }}>
              {DISCOUNT_FORMATS.map((d) => (
                <Box
                  key={d}
                  component="li"
                  sx={{ color: "#2A3654", fontSize: "0.96rem", lineHeight: 1.65 }}
                >
                  {d}
                </Box>
              ))}
            </Stack>

            <Typography sx={bodyTextSx}>
              You honor the discount when a member identifies themselves as a DMN member, books
              through your network calendar link, or is referred via the network&rsquo;s lead routing.
            </Typography>
          </Box>

          {/* SECTION 04 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>04</Box>
              Standards we hold partners to
            </Typography>

            <Typography sx={bodyTextSx}>While in the network, you confirm and agree that:</Typography>

            <Stack component="ul" spacing={1} sx={{ pl: 3, m: 0 }}>
              {STANDARDS.map((s) => (
                <Box
                  key={s}
                  component="li"
                  sx={{ color: "#2A3654", fontSize: "0.96rem", lineHeight: 1.65 }}
                >
                  {s}
                </Box>
              ))}
            </Stack>
          </Box>

          {/* SECTION 05 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>05</Box>
              Confidentiality and member data
            </Typography>

            <Typography sx={bodyTextSx}>
              Both parties may receive non-public information from the other. Each agrees to use it
              only for purposes of this Agreement and protect it with at least reasonable care.
            </Typography>

            <Typography sx={bodyTextSx}>
              Member contact information shared with you in connection with leads may only be used
              to respond to and service that lead. You will not sell, transfer, or use member data
              for unrelated marketing, and you will comply with all applicable data protection laws.
              This survives termination of this Agreement.
            </Typography>
          </Box>

          {/* SECTION 06 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>06</Box>
              Changes to terms
            </Typography>

            <Typography sx={bodyTextSx}>
              DMN may modify these terms, including pricing, benefits, eligibility, and operating
              rules, from time to time. We will provide at least{" "}
              <Box component="strong" sx={{ color: "#0F1D3A", fontWeight: 600 }}>
                thirty (30) days&rsquo; prior written notice
              </Box>{" "}
              via the partner dashboard.
            </Typography>

            <Typography sx={bodyTextSx}>
              If a change materially reduces your benefits or increases your fees, you may terminate
              this Agreement before the change takes effect with no further obligation, provided you
              give us written notice within the 30-day notice window.
            </Typography>

            <Typography sx={bodyTextSx}>
              Your continued participation after the effective date of a change constitutes
              acceptance of the updated terms.
            </Typography>
          </Box>

          {/* SECTION 07 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>07</Box>
              Term, renewal, and termination
            </Typography>

            <Typography sx={subHeadingSx}>Initial term and renewal</Typography>
            <Typography sx={bodyTextSx}>
              This Agreement starts on the date you submit the sign-up form on the Dental Member
              Network home page and continues for an initial term of twelve (12) months. It then
              renews automatically for successive twelve-month terms unless either party gives
              written notice of non-renewal at least 30 days before the end of the current term.
            </Typography>

            <Typography sx={subHeadingSx}>Termination for convenience</Typography>
            <Typography sx={bodyTextSx}>
              Either party may terminate this Agreement at any time on 30 days&rsquo; prior written
              notice. You remain responsible for fees accrued through the effective date of
              termination.
            </Typography>

            <Typography sx={subHeadingSx}>Termination for cause</Typography>
            <Typography sx={bodyTextSx}>
              Either party may terminate immediately on written notice if the other party materially
              breaches this Agreement and does not cure within 15 days of written notice, becomes
              insolvent, or engages in conduct that, in our reasonable judgment, materially harms
              the network.
            </Typography>

            <Typography sx={subHeadingSx}>What happens at termination</Typography>
            <Typography sx={bodyTextSx}>
              Your profile and promotional placements are removed from the network. The Verified
              Partner badge license ends. Any unpaid accrued fees become immediately due.
              Provisions that by their nature survive, confidentiality, member data protection,
              indemnification, and limits of liability, continue to apply.
            </Typography>
          </Box>

          {/* SECTION 08 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>08</Box>
              Disclaimers and liability
            </Typography>

            <Typography sx={bodyTextSx}>
              We do not guarantee any specific number of leads, conversion rate, or revenue outcome
              from network participation. Results depend on your products, pricing, sales process,
              and responsiveness.
            </Typography>

            <Typography sx={bodyTextSx}>
              Except as expressly stated here, the network is provided &ldquo;as is.&rdquo; Neither
              party is liable for indirect, incidental, special, or consequential damages, or for
              lost profits or revenue. Total cumulative liability of either party is capped at the
              total fees paid by Vendor under this Agreement in the twelve months immediately
              preceding the event giving rise to liability.
            </Typography>

            <Typography sx={bodyTextSx}>
              Vendor will indemnify DMN from third-party claims arising out of Vendor&rsquo;s
              products, services, sales practices, breach of this Agreement, or content supplied
              to the network.
            </Typography>
          </Box>

          {/* SECTION 09 */}
          <Box component="section" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography component="h2" sx={sectionTitleSx}>
              <Box component="span" sx={numAccentSx}>09</Box>
              Miscellaneous
            </Typography>

            <Typography sx={bodyTextSx}>
              The parties are independent contractors, this Agreement does not create a partnership,
              joint venture, agency, or employment relationship. You may not assign or transfer this
              Agreement without our prior written consent.
            </Typography>

            <Typography sx={bodyTextSx}>
              This Agreement is the entire agreement between the parties on its subject and
              supersedes prior discussions. Any modification must be by written notice as described
              in Section 6 or by a signed amendment. If any provision is unenforceable, the
              remaining provisions stay in effect.
            </Typography>

            <Typography sx={bodyTextSx}>
              This Agreement is governed by the laws of the State of{" "}
              <Box component="em" sx={{ fontStyle: "italic", color: "#6A7591" }}>__________</Box>,
              and any disputes will be resolved in the state or federal courts located in{" "}
              <Box component="em" sx={{ fontStyle: "italic", color: "#6A7591" }}>__________</Box>.
              Electronic signatures and acceptance via this online form have the same effect as
              original written signatures.
            </Typography>
          </Box>
        </Container>

        {/* CTA TO HOME SIGNUP */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #060D1F 0%, #0F1D3A 100%)",
            py: { xs: 8, md: 10 },
            px: { xs: 3, md: 4 },
            textAlign: "center",
            mt: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="sm">
            <Typography
              sx={{
                color: "#D4A44B",
                fontSize: "0.78rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 600,
                mb: 2.5,
              }}
            >
              Ready to Apply
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontFamily: "var(--font-display)",
                color: "#FFFFFF",
                fontSize: { xs: "2rem", md: "2.6rem" },
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                mb: 2.5,
              }}
            >
              Become a Founding Partner.
            </Typography>
            <Typography
              sx={{
                color: "#C9D4EB",
                fontSize: "1rem",
                lineHeight: 1.7,
                mb: 4.5,
                maxWidth: 540,
                mx: "auto",
              }}
            >
              Now that you&rsquo;ve read the agreement, head to the sign-up form to lock in
              founding partner pricing. We review applications within five business days.
            </Typography>
            <Button
              href="/#waitlist"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: "#D4A44B",
                color: "#0F1D3A",
                fontFamily: "var(--font-display)",
                fontSize: "1.05rem",
                fontWeight: 600,
                py: 1.75,
                px: 4.5,
                borderRadius: "30px",
                boxShadow: "0 14px 28px -12px rgba(212,164,75,0.55)",
                "&:hover": { bgcolor: "#E6B860" },
              }}
            >
              Continue to Sign-Up Form
            </Button>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  );
}
