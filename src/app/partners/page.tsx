"use client";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Logo from "@/components/brand/Logo";
import { vendorPlans, vendorCategories } from "@/lib/vendorData";

const benefits = [
  {
    icon: GroupsOutlinedIcon,
    title: "Reach 1,000+ practice owners",
    body: "A curated network of dental practice owners and operators — exactly the audience you sell to. Founding cohort capped at 1,000 to keep the room high-signal.",
  },
  {
    icon: VerifiedUserOutlinedIcon,
    title: "Verified Partner badge",
    body: "Use the Thriving Dentist Verified Partner mark on your site, email signatures, and sales materials. Members trust the badge.",
  },
  {
    icon: TrendingUpOutlinedIcon,
    title: "Lead routing & attribution",
    body: "Inquiries route to your dashboard with 12-month attribution tracking. You see which leads convert, what they spend, and your effective CAC.",
  },
  {
    icon: CampaignOutlinedIcon,
    title: "Promotional placement",
    body: "Quarterly newsletter mentions, eligibility for podcast and webinar features, and one dedicated email to members per year.",
  },
  {
    icon: BarChartOutlinedIcon,
    title: "Full lead dashboard",
    body: "Real-time view of redemptions, savings delivered to members, commission accrued, and lead activity. Export anytime.",
  },
  {
    icon: HandshakeOutlinedIcon,
    title: "Standard partner agreement",
    body: "One agreement, transparent terms, monthly billing. No exclusivity, no hidden fees, no per-conversation charges.",
  },
];

const steps = [
  {
    n: "01",
    title: "Apply online",
    body: "Tell us about your company, your category, and the offer you want to extend to members. Takes about 6 minutes.",
  },
  {
    n: "02",
    title: "Review & agreement",
    body: "Read the Vendor Network Partnership Agreement. Click-to-agree at the end. Reshani approves new partners within 1 business day.",
  },
  {
    n: "03",
    title: "Build your profile",
    body: "Upload logo, write your description, set your member discount. Submit your first offer for review — published within 24 hours.",
  },
  {
    n: "04",
    title: "Go live to members",
    body: "Your offer appears in the member rewards page. Track redemptions in your dashboard. Get paid quarterly.",
  },
];

export default function PartnersPage() {
  return (
    <Box sx={{ bgcolor: "background.default" }}>
      {/* Top brand strip */}
      <Container maxWidth="lg" sx={{ pt: 4, pb: 0 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Logo href="/" height={32} showSubline={false} />
          <Box
            component={Link}
            href="/"
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              "&:hover": { color: "text.primary" },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 14 }} /> Back to member site
          </Box>
        </Stack>
      </Container>

      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 7, md: 10 },
          pb: { xs: 8, md: 11 },
          backgroundImage: "linear-gradient(180deg, #06182A 0%, #0A2236 55%, #0E2A3D 100%)",
          color: "common.white",
          mt: 4,
          borderRadius: { xs: 0, md: "32px 32px 0 0" },
          mx: { md: 3 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(45% 45% at 100% 0%, rgba(217,168,75,0.32) 0%, transparent 60%), radial-gradient(40% 40% at 0% 100%, rgba(34,108,165,0.4) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Grid container spacing={6} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3} sx={{ maxWidth: 640 }}>
                <Chip
                  label="VENDOR PARTNERSHIP · APPLICATIONS OPEN"
                  size="small"
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: "rgba(217,168,75,0.16)",
                    color: "secondary.light",
                    border: "1px solid rgba(217,168,75,0.35)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    fontWeight: 700,
                  }}
                />
                <Typography variant="h1" sx={{ color: "common.white", fontSize: { xs: "2.25rem", md: "3.5rem" } }}>
                  Partner with the network practice owners actually trust.
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.92)", fontSize: { xs: "1rem", md: "1.15rem" }, lineHeight: 1.6, maxWidth: 560 }}>
                  Get in front of 1,000+ dental practice owners with a Featured Partner profile,
                  lead-routing dashboard, and Verified badge. Founding partners join free for the
                  first 6 months.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    component={Link}
                    href="/vendor/signup"
                  >
                    Apply for Founding · $0 for 6 months
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    href="/partners/pricing"
                    sx={{
                      color: "common.white",
                      borderColor: "rgba(255,255,255,0.25)",
                      bgcolor: "rgba(255,255,255,0.04)",
                      "&:hover": { borderColor: "rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.08)" },
                    }}
                  >
                    See partner pricing
                  </Button>
                </Stack>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>
                  Already a partner? <Box component={Link} href="/vendor" sx={{ color: "secondary.light", fontWeight: 600, textDecoration: "underline" }}>Sign in to your dashboard</Box>
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  bgcolor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <Typography variant="overline" sx={{ color: "secondary.light", display: "block", mb: 1.5, fontWeight: 700 }}>
                  WHO'S ALREADY IN
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    "Henry Schein Dental — Supplies",
                    "Weave — Patient communications",
                    "Patterson Dental — Equipment",
                    "Ekwa Marketing — Digital marketing",
                  ].map((row) => (
                    <Stack key={row} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                      <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: "secondary.light" }} />
                      <Typography sx={{ color: "rgba(255,255,255,0.92)", fontSize: "0.92rem" }}>
                        {row}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Box
                  sx={{
                    mt: 2.5,
                    pt: 2.5,
                    borderTop: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>
                    {vendorCategories.length} categories · founding seats limited per category
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* WHY PARTNER */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Stack spacing={1.5} sx={{ mb: 5, maxWidth: 760 }}>
          <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.18em" }}>
            WHY PARTNER
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.75rem" } }}>
            What you get as a Featured Partner.
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "1.05rem", maxWidth: 620, lineHeight: 1.6 }}>
            One agreement. Transparent monthly billing. Same benefits for founding and standard tiers — only the price differs.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <Grid key={b.title} size={{ xs: 12, md: 6, lg: 4 }}>
                <Box
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "common.white",
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      bgcolor: "rgba(217,168,75,0.12)",
                      border: "1px solid rgba(217,168,75,0.32)",
                      color: "#A07823",
                      display: "grid",
                      placeItems: "center",
                      mb: 2,
                    }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontSize: "1.1rem", mb: 1 }}>
                    {b.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    {b.body}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* HOW IT WORKS */}
      <Box sx={{ bgcolor: "grey.50", borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} sx={{ mb: 5, maxWidth: 760 }}>
            <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.18em" }}>
              HOW IT WORKS
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.75rem" } }}>
              Four steps from application to live.
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {steps.map((s) => (
              <Grid key={s.n} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Box
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "common.white",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-display)",
                      fontSize: "2rem",
                      color: "#A07823",
                      lineHeight: 1,
                      mb: 1.5,
                    }}
                  >
                    {s.n}
                  </Typography>
                  <Typography variant="h5" sx={{ fontSize: "1.05rem", mb: 1 }}>
                    {s.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.92rem", lineHeight: 1.55 }}>
                    {s.body}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* PRICING TEASER */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box
          sx={{
            p: { xs: 3.5, md: 5 },
            borderRadius: "24px",
            border: "1px solid",
            borderColor: "rgba(217,168,75,0.4)",
            backgroundImage: "linear-gradient(155deg, #FBF6E8 0%, #F4E8C9 100%)",
          }}
        >
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" sx={{ color: "#A07823", fontWeight: 700, letterSpacing: "0.18em" }}>
                FOUNDING PARTNER PROGRAM
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, mt: 1, mb: 2 }}>
                $0 for 6 months. $49 for the next 6. Then $199 standard.
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "1.02rem", lineHeight: 1.6, mb: 3 }}>
                Founding seats are limited per category and offered at our discretion.
                Get in early, build attribution data, and lock 12 months of below-standard pricing.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button variant="contained" color="primary" size="large" component={Link} href="/vendor/signup" endIcon={<ArrowForwardIcon />}>
                  Apply now
                </Button>
                <Button variant="outlined" color="primary" size="large" component={Link} href="/partners/pricing">
                  Compare all plans
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={1.5}>
                {vendorPlans[0].features.map((f) => (
                  <Stack key={f} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                    <CheckCircleOutlinedIcon sx={{ color: "#A07823", fontSize: 18, mt: 0.25 }} />
                    <Typography sx={{ fontSize: "0.95rem", color: "text.primary" }}>
                      {f}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* FOOTER */}
      <Box sx={{ py: 4, borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
              © {new Date().getFullYear()} Thriving Dentist Member Network · Vendor Network is a curated B2B program.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Box component={Link} href="/" sx={{ fontSize: "0.85rem", color: "text.secondary", textDecoration: "none", "&:hover": { color: "text.primary" } }}>
                Member site
              </Box>
              <Box component={Link} href="/vendor/signup" sx={{ fontSize: "0.85rem", color: "text.secondary", textDecoration: "none", "&:hover": { color: "text.primary" } }}>
                Apply
              </Box>
              <Box component={Link} href="/vendor" sx={{ fontSize: "0.85rem", color: "text.secondary", textDecoration: "none", "&:hover": { color: "text.primary" } }}>
                Partner sign in
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
