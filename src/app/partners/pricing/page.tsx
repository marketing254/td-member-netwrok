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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import StarsOutlinedIcon from "@mui/icons-material/StarsOutlined";
import Logo from "@/components/brand/Logo";
import { vendorPlans } from "@/lib/vendorData";

const featureMatrix = [
  ["Enhanced directory listing", true, true, true],
  ["Priority placement within category", true, true, true],
  ["Quarterly newsletter mentions", true, true, true],
  ["1 dedicated email to members per year", true, true, true],
  ["Eligible for podcast / webinar features", true, true, true],
  ["Verified Partner badge", true, true, true],
  ["Full lead dashboard", true, true, true],
  ["Founding Partner badge in launch announcement", true, false, false],
  ["Months 1-6 free, months 7-12 at $49/mo", true, false, false],
  ["Annual pre-pay savings (~17%)", false, false, true],
  ["12-month rate lock", true, false, true],
  ["Auto-renews monthly (cancel anytime, 30-day notice)", false, true, false],
  ["Auto-renews annually (cancel anytime, 30-day notice)", false, false, true],
] as const;

const faqs = [
  {
    q: "How do I qualify as a Founding Partner?",
    a: "Founding seats are offered at Thriving Dentist's discretion, limited to a fixed number of vendors per category. Apply early — we approve on a first-come-first-served basis within each category until the cap is hit.",
  },
  {
    q: "What's the cancellation policy?",
    a: "Either party can terminate for convenience with 30 days' written notice. You remain responsible for accrued fees through the effective termination date.",
  },
  {
    q: "Are fees refundable?",
    a: "Annual pre-payment is non-refundable except as expressly provided in the agreement. Monthly fees for the current billing period are non-refundable on cancellation for convenience.",
  },
  {
    q: "How are leads attributed?",
    a: "A sale or engagement is attributed to the Network if the lead originated through a Network-issued contact, code, or link within the prior 12 months — or if the member identifies Thriving Dentist as the source at point of contact and you confirm.",
  },
  {
    q: "Can I change plans mid-term?",
    a: "Yes. You can upgrade Founding → Standard or move to Annual at any time. Downgrades take effect at the next renewal.",
  },
  {
    q: "What's the Member Discount we have to offer?",
    a: "You commit to a meaningful discount that's not generally available to non-members — % off, flat $ off, waived setup, bonus inclusions, or preferred terms. You set the specifics in Schedule B of the agreement.",
  },
];

export default function VendorPricingPage() {
  return (
    <Box sx={{ bgcolor: "background.default" }}>
      {/* Top nav */}
      <Container maxWidth="lg" sx={{ pt: 4, pb: 0 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Logo href="/" height={32} showSubline={false} />
          <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
            <Box component={Link} href="/partners" sx={{ fontSize: "0.85rem", color: "text.secondary", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0.5, "&:hover": { color: "text.primary" } }}>
              <ArrowBackIcon sx={{ fontSize: 14 }} /> Partners
            </Box>
            <Button component={Link} href="/vendor/signup" variant="contained" color="secondary" size="small" sx={{ py: 1, px: 2.5 }}>
              Apply now
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* HEADER */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 9 }, pb: 5, textAlign: "center" }}>
        <Chip
          icon={<StarsOutlinedIcon sx={{ fontSize: 14 }} />}
          label="VENDOR PARTNERSHIP PRICING"
          size="small"
          sx={{
            bgcolor: "rgba(217,168,75,0.14)",
            color: "#A07823",
            fontWeight: 700,
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            "& .MuiChip-icon": { color: "#A07823" },
          }}
        />
        <Typography variant="h1" sx={{ fontSize: { xs: "2.25rem", md: "3.5rem" }, mt: 2.5, mb: 1.5 }}>
          Three ways to partner.
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: "1.08rem", maxWidth: 660, mx: "auto", lineHeight: 1.55 }}>
          Same Featured Partner benefits across all three plans. Pick monthly, save with annual,
          or apply for the founding launch program.
        </Typography>
      </Container>

      {/* PLANS */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 10 } }}>
        <Grid container spacing={3}>
          {vendorPlans.map((p) => (
            <Grid key={p.id} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  height: "100%",
                  position: "relative",
                  p: { xs: 3, md: 3.5 },
                  borderRadius: "24px",
                  border: "1.5px solid",
                  borderColor: p.highlight ? "rgba(217,168,75,0.5)" : "divider",
                  bgcolor: p.highlight ? "rgba(255,247,228,0.55)" : "common.white",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: p.highlight ? "0 32px 64px -36px rgba(217,168,75,0.5)" : "none",
                }}
              >
                {p.badge && (
                  <Chip
                    label={p.badge}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -14,
                      left: 24,
                      bgcolor: "#0E2A3D",
                      color: "secondary.light",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      height: 26,
                    }}
                  />
                )}
                <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.14em" }}>
                  {p.name.toUpperCase()}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "baseline", mt: 1, mb: 1 }}>
                  <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "2.6rem", color: "text.primary", lineHeight: 1 }}>
                    {p.priceLabel}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.86rem", mb: 2 }}>
                  {p.cadenceLabel}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.92rem", lineHeight: 1.55, mb: 2.5, minHeight: 80 }}>
                  {p.blurb}
                </Typography>
                <Stack spacing={1} sx={{ flex: 1, mb: 2.5 }}>
                  {p.features.map((f) => (
                    <Stack key={f} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                      <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: p.highlight ? "#A07823" : "primary.main", mt: 0.25, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ fontSize: "0.88rem", lineHeight: 1.55 }}>
                        {f}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  component={Link}
                  href={`/vendor/signup?plan=${p.id}`}
                  fullWidth
                  size="large"
                  variant={p.highlight ? "contained" : "outlined"}
                  color={p.highlight ? "secondary" : "primary"}
                  endIcon={<ArrowForwardIcon />}
                >
                  {p.ctaLabel}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FEATURE MATRIX */}
      <Box sx={{ bgcolor: "grey.50", borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.18em", display: "block", textAlign: "center" }}>
            COMPARE
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.85rem", md: "2.5rem" }, textAlign: "center", mt: 1.5, mb: 5 }}>
            Side-by-side feature comparison
          </Typography>

          <Box
            sx={{
              borderRadius: "20px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "common.white",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
                bgcolor: "rgba(14,42,61,0.04)",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ p: 2.25 }} />
              {vendorPlans.map((p) => (
                <Box key={p.id} sx={{ p: 2.25, textAlign: "center", borderLeft: "1px solid", borderColor: "divider" }}>
                  <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.7rem" }}>
                    {p.name.toUpperCase()}
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", mt: 0.25 }}>
                    {p.priceLabel}
                  </Typography>
                </Box>
              ))}
            </Box>
            {featureMatrix.map(([label, founding, standard, annual], i) => (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
                  borderBottom: i === featureMatrix.length - 1 ? 0 : "1px solid",
                  borderColor: "divider",
                  alignItems: "center",
                  "&:hover": { bgcolor: "rgba(14,42,61,0.02)" },
                }}
              >
                <Box sx={{ p: 1.75, fontSize: "0.92rem", fontWeight: 500 }}>
                  {label}
                </Box>
                {[founding, standard, annual].map((v, j) => (
                  <Box key={j} sx={{ p: 1.75, textAlign: "center", borderLeft: "1px solid", borderColor: "divider" }}>
                    {v ? (
                      <CheckCircleOutlinedIcon sx={{ color: "#1F5C40", fontSize: 20 }} />
                    ) : (
                      <Box component="span" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>—</Box>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
        <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: "0.18em", display: "block", textAlign: "center" }}>
          FREQUENTLY ASKED
        </Typography>
        <Typography variant="h2" sx={{ fontSize: { xs: "1.85rem", md: "2.5rem" }, textAlign: "center", mt: 1.5, mb: 5 }}>
          Vendor partnership FAQ
        </Typography>
        <Stack spacing={2}>
          {faqs.map((f) => (
            <Box
              key={f.q}
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "common.white",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.75 }}>{f.q}</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>{f.a}</Typography>
            </Box>
          ))}
        </Stack>
      </Container>

      {/* CTA */}
      <Box sx={{ py: { xs: 7, md: 9 }, bgcolor: "primary.main", color: "common.white", textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ color: "common.white", fontSize: { xs: "1.85rem", md: "2.5rem" }, mb: 2 }}>
            Ready to apply?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", maxWidth: 540, mx: "auto", mb: 3.5, lineHeight: 1.55 }}>
            Founding seats fill on a first-come-first-served basis within each of the {vendorPlans.length === 3 ? "12" : ""} categories.
          </Typography>
          <Button component={Link} href="/vendor/signup" variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />}>
            Start your application
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
