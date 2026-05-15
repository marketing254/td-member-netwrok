import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Vendor Network Partnership Agreement · Dental Member Network",
  description:
    "Full Vendor Network Partnership Agreement for the Dental Member Network — five commitments, fee schedule, and legal terms.",
};

const PARTNERSHIP_POINTS = [
  {
    icon: LocalOfferOutlinedIcon,
    title: "Featured listing in the vendor directory",
    body: "We create and maintain a dedicated profile page — logo, description, services, contact form, member-exclusive offer, and your calendar link.",
  },
  {
    icon: GroupsOutlinedIcon,
    title: "Access to the member network for warm introductions",
    body: "Inquiries from members are routed directly to you by email and via your partner dashboard. All leads are pre-qualified.",
  },
  {
    icon: VerifiedOutlinedIcon,
    title: "Inclusion in the negotiated deals program",
    body: "You agree to offer a verifiable member-only discount, preferred pricing tier, or other material benefit not generally available to the public.",
  },
  {
    icon: CampaignOutlinedIcon,
    title: "Co-branded content opportunities",
    body: "Priority category placement, quarterly newsletter mentions, one dedicated email to members per year, and eligibility for podcast and webinar features.",
  },
  {
    icon: CardGiftcardOutlinedIcon,
    title: "Priority placement in new vendor deal announcements",
    body: "Founding-cohort vendors get top placement in the first member emails, in-app banners, and the launch deals page.",
  },
  {
    icon: VerifiedOutlinedIcon,
    title: "Verified Partner badge",
    body: "A \"Dental Member Network Verified Partner\" mark you can use on your site, email signature, and sales materials while the Agreement is active.",
  },
];

const COMMITMENTS = [
  {
    icon: LocalOfferOutlinedIcon,
    title: "Offer our members the best deal you have",
    body: "A discount, bonus, or exclusive benefit at least as good as any offer you make available to comparable customers. If your terms get better elsewhere, ours match or improve.",
  },
  {
    icon: GroupsOutlinedIcon,
    title: "Join our private partner hotline",
    body: "Stay responsive during business hours on our private hotline where deals get sorted, leads get triaged, and we share what's working.",
  },
  {
    icon: CalendarMonthOutlinedIcon,
    title: "Provide a calendar link",
    body: "A working booking link (Calendly, HubSpot, Cal.com) where members can book a call directly. Keep it live and respond within one business day.",
  },
  {
    icon: AutorenewOutlinedIcon,
    title: "Accept that we'll evolve the network",
    body: "We may update terms, benefits, fees, and operating rules on at least 30 days' written notice. If a change materially reduces your benefits, you can terminate with no penalty.",
  },
  {
    icon: PaymentsOutlinedIcon,
    title: "Pay the fee — waived for your first six months",
    body: "Standard: $199/mo. Founding partners: $0 for months 1–6, $49 for months 7–12, then $199 from month 13. Cancel with 30 days' notice anytime.",
  },
];

const KEY_TERMS = [
  { label: "Months 1–6", value: "$0", sub: "Waived" },
  { label: "Months 7–12", value: "$49", sub: "per month" },
  { label: "Month 13+", value: "$199", sub: "per month" },
  { label: "Commitment", value: "12 mo", sub: "Initial term" },
  { label: "Cancel", value: "30 d", sub: "Written notice" },
];

const FOUNDING_TERMS = [
  "0% DMN commission on member transactions",
  "$0 partnership fee for the first 6 months",
  "$49/mo locked-in rate for months 7–12",
  "Member discount honored for the duration of your listing",
  "30-day cure window on any quality issue before delisting",
  "Annual pre-pay option: 12 months for the price of 10",
];

const WHAT_WE_NEED_FROM_YOU = [
  "Honor the published member discount to any verified DMN member",
  "Respond to warm introductions within 1 business day",
  "Use member contact info only for the introduced opportunity",
  "Never request or store patient data from any member",
  "Keep your calendar link live with availability open",
  "Provide responsive, professional service at the level you give your best customers",
];

const LEGAL_SECTIONS = [
  {
    num: "01",
    title: "Member discount details",
    content: "The member discount you commit to is binding for the term of the Agreement. You can improve it any time — you just can't reduce or withdraw it without written consent. Acceptable formats include percentage off, flat-dollar discount, waived setup fees, bonus inclusions, or preferred payment terms.",
  },
  {
    num: "02",
    title: "Confidentiality and member data",
    content: "Both parties agree to use non-public information only for purposes of this Agreement. Member contact information shared in connection with leads may only be used to respond to and service that lead. You will not sell, transfer, or use member data for unrelated marketing. This survives termination.",
  },
  {
    num: "03",
    title: "Changes to terms",
    content: "DMN may modify terms — including pricing, benefits, eligibility, and operating rules — on at least 30 days' prior written notice. If a change materially reduces your benefits or increases fees, you may terminate before it takes effect with no further obligation.",
  },
  {
    num: "04",
    title: "Term, renewal, and termination",
    content: "Initial term of 12 months, auto-renewing for successive 12-month terms unless either party gives 30 days' notice. Either party may terminate for convenience on 30 days' notice, or immediately for material breach not cured within 15 days. At termination: profile removed, badge license ends, unpaid fees become due.",
  },
  {
    num: "05",
    title: "Disclaimers and liability",
    content: "No guarantee of specific leads, conversion rates, or revenue outcomes. The network is provided \"as is.\" Neither party is liable for indirect or consequential damages. Total liability is capped at fees paid in the preceding 12 months. Vendor indemnifies DMN from third-party claims arising from Vendor's products, services, or content.",
  },
  {
    num: "06",
    title: "Miscellaneous",
    content: "The parties are independent contractors. Assignment requires prior written consent. This Agreement is the entire agreement and supersedes prior discussions. Electronic signatures via the online form have the same effect as written signatures.",
  },
];

export default function VendorAgreementPage() {
  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          position: "relative",
          bgcolor: "#F7F5F0",
          minHeight: "100vh",
          pt: { xs: 4, md: 6 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 320,
            background:
              "radial-gradient(70% 100% at 50% 0%, rgba(217,168,75,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="md" sx={{ position: "relative" }}>
          <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              href="/#waitlist"
              startIcon={<ArrowBackIcon />}
              sx={{ color: "text.secondary", "&:hover": { bgcolor: "rgba(14,42,61,0.04)" } }}
            >
              Back to waitlist
            </Button>
          </Stack>

          <Stack spacing={2.5} sx={{ mb: 5 }}>
            <Chip
              icon={<HandshakeOutlinedIcon sx={{ fontSize: 14, color: "#A07823 !important" }} />}
              label="VENDOR PARTNERSHIP AGREEMENT"
              size="small"
              sx={{
                alignSelf: "flex-start",
                bgcolor: "rgba(217,168,75,0.1)",
                color: "#7A5B17",
                border: "1px solid rgba(217,168,75,0.3)",
                fontSize: "0.66rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
              }}
            />
            <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2.25rem", md: "3.25rem" } }}>
              Partnership Agreement
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                color: "#A07823",
                fontSize: { xs: "1.15rem", md: "1.35rem" },
              }}
            >
              Built around five simple commitments.
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "text.secondary", maxWidth: 640, lineHeight: 1.65 }}>
              We bring you the most engaged practice owners in dentistry. You bring the service
              quality, the best deal in the room, and a calendar link they can book in two clicks.
              Below are the terms — read them through, then apply at the bottom.
            </Typography>
          </Stack>

          {/* Key terms band */}
          <Grid
            container
            sx={{
              mb: 6,
              bgcolor: "#FFFFFF",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 30px 80px -40px rgba(14,42,61,0.18)",
              overflow: "hidden",
            }}
          >
            {KEY_TERMS.map((t) => (
              <Grid key={t.label} size={{ xs: 6, sm: 2.4 }}>
                <Box sx={{ py: 3, px: 2, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "text.disabled", fontWeight: 600 }}>
                    {t.label}
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "text.primary", fontWeight: 600, mt: 1, lineHeight: 1.1 }}>
                    {t.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "text.disabled", mt: 0.5 }}>
                    {t.sub}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Main card */}
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              bgcolor: "#FFFFFF",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 30px 80px -40px rgba(14,42,61,0.18)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: "linear-gradient(90deg, #F0C16E 0%, #D9A84B 50%, #A07823 100%)",
              }}
            />

            {/* ─── The Five Commitments ─── */}
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: "1.75rem", md: "2.15rem" }, mb: 1.5 }}>
              The Five Commitments
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 4 }}>
              These are the only things we hold every vendor in the network to. Everything else is operational detail.
            </Typography>

            <Stack spacing={3}>
              {COMMITMENTS.map(({ icon: Icon, title, body }) => (
                <Stack key={title} direction="row" spacing={2.5} sx={{ alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(217,168,75,0.12)",
                      color: "#A07823",
                      border: "1px solid rgba(217,168,75,0.25)",
                    }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.0625rem", mb: 0.75 }}>
                      {title}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>{body}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 5 }} />

            {/* ─── What's included ─── */}
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: "1.75rem", md: "2.15rem" }, mb: 1.5 }}>
              What you get as a Vendor Partner
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 4 }}>
              Six things included in every partnership.
            </Typography>

            <Stack spacing={3}>
              {PARTNERSHIP_POINTS.map(({ icon: Icon, title, body }) => (
                <Stack key={title} direction="row" spacing={2.5} sx={{ alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(14,42,61,0.05)",
                      color: "#0E2A3D",
                      border: "1px solid rgba(14,42,61,0.1)",
                    }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.0625rem", mb: 0.75 }}>
                      {title}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>{body}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 5 }} />

            {/* ─── Founding-cohort terms ─── */}
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: "1.75rem", md: "2.15rem" }, mb: 1.5 }}>
              Founding-cohort terms
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              The first vendor cohort joins at no cost. We absorb the partnership fee for 6 months so
              the launch directory is full on day one.
            </Typography>

            <Grid container spacing={2}>
              {FOUNDING_TERMS.map((t) => (
                <Grid key={t} size={{ xs: 12, sm: 6 }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: "rgba(46,138,87,0.06)",
                      border: "1px solid rgba(46,138,87,0.18)",
                    }}
                  >
                    <VerifiedOutlinedIcon sx={{ fontSize: 18, color: "#2E8A57", flexShrink: 0 }} />
                    <Typography sx={{ color: "text.primary", fontWeight: 500, fontSize: "0.92rem" }}>
                      {t}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 5 }} />

            {/* ─── What we need from you ─── */}
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: "1.75rem", md: "2.15rem" }, mb: 1.5 }}>
              What we need from you
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              The behavioral commitments built into the partnership. These protect the member relationship.
            </Typography>

            <Stack spacing={1.5}>
              {WHAT_WE_NEED_FROM_YOU.map((t) => (
                <Stack
                  key={t}
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "flex-start",
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: "rgba(14,42,61,0.03)",
                    border: "1px solid rgba(14,42,61,0.08)",
                  }}
                >
                  <ShieldOutlinedIcon sx={{ fontSize: 18, color: "#0E2A3D", flexShrink: 0, mt: "2px" }} />
                  <Typography sx={{ color: "text.primary", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    {t}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 5 }} />

            {/* ─── Legal sections ─── */}
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: "1.75rem", md: "2.15rem" }, mb: 1.5 }}>
              Legal terms
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 4 }}>
              The operational and legal detail behind the five commitments.
            </Typography>

            <Stack spacing={3}>
              {LEGAL_SECTIONS.map((s) => (
                <Box
                  key={s.num}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: "rgba(14,42,61,0.02)",
                    border: "1px solid rgba(14,42,61,0.06)",
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: "1rem", mb: 1, color: "text.primary" }}>
                    <Box component="span" sx={{ color: "#A07823", fontStyle: "italic", mr: 1, fontWeight: 400 }}>
                      {s.num}
                    </Box>
                    {s.title}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.92rem", lineHeight: 1.7 }}>
                    {s.content}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 5 }} />

            {/* ─── CTA ─── */}
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "rgba(217,168,75,0.08)",
                border: "1px dashed rgba(217,168,75,0.45)",
              }}
            >
              <Typography variant="overline" sx={{ color: "#7A5B17", letterSpacing: "0.14em", display: "block", mb: 1 }}>
                NEXT STEP
              </Typography>
              <Typography sx={{ color: "text.primary", fontSize: "1.0625rem", lineHeight: 1.65, mb: 2 }}>
                Submit the vendor waitlist form on the home page. If your category fits the launch
                cohort, our partnerships team replies within one business day with a 15-minute intro call.
              </Typography>
              <Button
                href="/#waitlist"
                variant="contained"
                color="secondary"
                endIcon={<HandshakeOutlinedIcon />}
              >
                Apply as vendor partner
              </Button>
            </Box>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 5, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 2 }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
              Questions? Email{" "}
              <Box
                component="a"
                href="mailto:founding@dentalmembernetwork.com"
                sx={{ color: "#A07823", textDecoration: "underline", fontWeight: 600 }}
              >
                founding@dentalmembernetwork.com
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ color: "text.disabled", fontSize: "0.78rem" }}>
              Electronic signatures via the online form have the same effect as written signatures.
            </Typography>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
