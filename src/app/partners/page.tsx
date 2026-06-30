"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Header from "@/components/sections/Header";
import WaitlistSection from "@/components/sections/WaitlistSection";
import { poweredBy } from "@/lib/content";
import { COLORS } from "@/theme";

// Tier accent — wine for Partners (per README brand guide). Applied to
// the primary Claim button + step circles only, so the page still reads
// as the same DMN brand (navy hero, gold ribbons, cream/white sections)
// with one identifying accent.
const PARTNER_WINE = "#6e3346";
const PARTNER_WINE_DARK = "#4f2331";

const RECRUITED_CATEGORIES = [
  "Dental supplies & labs",
  "Equipment & build-outs",
  "Practice-management software",
  "Billing, coding & credentialing",
  "HR, payroll & compliance",
  "Patient financing",
  "Phone / call-tracking / AI",
  "Coaching & consulting",
  "Continuing education",
  "Accounting, tax & CFO",
];

const HOW_IT_WORKS = [
  {
    n: "1",
    title: "You apply",
    body: "Tell us your category and the exclusive deal you'll offer members.",
  },
  {
    n: "2",
    title: "We vet and list you",
    body: "A profile, a Verified Partner badge, and searchable placement.",
  },
  {
    n: "3",
    title: "Leads route to you",
    body: "Member inquiries arrive with a dashboard and conversion data.",
  },
];

const WHAT_YOU_GET = [
  { title: "Profile & placement", body: "A dedicated profile and searchable spot in your category." },
  { title: "Lead flow", body: "Member inquiries with a dashboard and conversion data." },
  { title: "Verified Partner badge", body: "Credibility from a vetted shortlist." },
  { title: "Podcast & events", body: "Guest and speaking slots across the network." },
  { title: "Co-marketing", body: "Co-branded case studies and newsletter mentions." },
  { title: "A buying audience", body: "Owners reached across the Thriving Dentist ecosystem." },
];

const WHAT_YOU_OFFER = [
  {
    title: "An exclusive member discount",
    body: "A discount or benefit for DMN members at least as good as any offer you make to comparable customers.",
  },
  {
    title: "Stay reachable",
    body: "A booking link members can use, with a response within one business day.",
  },
  {
    title: "Honor the deal",
    body: "Keep your member benefit live; any change comes with 30 days notice.",
  },
];

const PRICE_TIERS = [
  { cap: "Months 1–6", price: "$0", per: "", body: "Build your pipeline first, pay later.", hot: true },
  { cap: "Months 7–12", price: "$49", per: "/mo", body: "Founding locked rate.", hot: true },
  { cap: "Month 13+", price: "$199", per: "/mo", body: "Featured Partner rate.", hot: false },
];

const FIT_YES = [
  "You sell to dental practices (software, supplies, equipment, services)",
  "You can offer members a genuine deal",
  "You can respond to leads",
];

const FIT_NO = [
  "You can't beat your standard pricing for members",
  "You want a passive ad you never follow up on",
];

// The two companies anchoring the partner roster at launch.
// No logo files yet — rendered as wordmarks; swap to <Image> once we have
// brand-approved assets.
const FOUNDING_PARTNERS = [
  {
    name: "Thriving Dentist Coaching",
    tag: "Coaching · Practice growth",
    body: "Gary Takacs's coaching program — 30+ years guiding practice owners through KPIs, case acceptance, and team operations.",
    logo: "/td-logo.png",
  },
  {
    name: "Ekwa Marketing",
    tag: "Marketing · Patient acquisition",
    body: "Full-service dental marketing — SEO, website, ads, and Google ranking systems trusted by hundreds of US practices.",
    logo: "/ekwa-logo.png",
  },
];

export default function PartnersPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.surface }}>
      <Header />

      {/* HERO */}
      <Box sx={{ bgcolor: COLORS.primary, color: "#FFFFFF", py: { xs: 7, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2.5} sx={{ maxWidth: 780 }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentBright,
              }}
            >
              For Partners · Vendor Network
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "2rem", md: "2.9rem" },
                fontWeight: 500,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
              }}
            >
              Get in front of dentistry's most engaged buyers, through a trusted shortlist.
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: "1.05rem", lineHeight: 1.65, maxWidth: 660 }}>
              Reach practice owners who are actively investing in their
              practice. Pay nothing for 6 months. The channel pays for itself
              as deals close.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                component={Link}
                href="#apply"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  bgcolor: PARTNER_WINE,
                  color: "#FFFFFF",
                  backgroundImage: `linear-gradient(180deg, ${PARTNER_WINE} 0%, ${PARTNER_WINE_DARK} 100%)`,
                  boxShadow: "0 8px 22px -10px rgba(110,51,70,0.55)",
                  "&:hover": {
                    bgcolor: PARTNER_WINE_DARK,
                    backgroundImage: `linear-gradient(180deg, ${PARTNER_WINE} 0%, ${PARTNER_WINE_DARK} 100%)`,
                    boxShadow: "0 14px 32px -10px rgba(110,51,70,0.7)",
                  },
                }}
              >
                Sign up as a partner
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="#how"
                sx={{
                  borderRadius: 999,
                  px: 3,
                  borderColor: "rgba(255,255,255,0.45)",
                  color: "#FFFFFF",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "&:hover": {
                    borderColor: "#FFFFFF",
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                See how it works
              </Button>
            </Stack>
            <Typography sx={{ mt: 1.5, fontSize: "0.86rem", color: "rgba(255,255,255,0.7)" }}>
              Any company that sells to dental practices can apply · Founding spots are limited per category.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Cream band quote */}
      <Box sx={{ bgcolor: COLORS.surfaceAlt, py: { xs: 4, md: 5 }, borderBottom: `1px solid ${COLORS.line}` }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
            <AutoAwesomeRoundedIcon sx={{ color: COLORS.accent, fontSize: 28, mt: 0.5 }} />
            <Typography sx={{ fontSize: "1.05rem", color: COLORS.inkSoft, lineHeight: 1.55, fontWeight: 500 }}>
              Members come to you pre-qualified,{" "}
              <Box component="span" sx={{ color: COLORS.ink, fontWeight: 700 }}>
                through a recommendation they trust, not an ad they scrolled past.
              </Box>
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Where members come from — ecosystem logos + stats */}
      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center", mb: 4, maxWidth: 720, mx: "auto" }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
              }}
            >
              Where members come from
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.5rem", md: "1.9rem" },
                fontWeight: 500,
                color: COLORS.ink,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              Five connected communities. One buying audience.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" },
              gap: { xs: 2, md: 3 },
              alignItems: "center",
              justifyItems: "center",
              p: { xs: 2.5, md: 3 },
              border: `1px solid ${COLORS.line}`,
              borderRadius: 3,
              bgcolor: "#FFFFFF",
            }}
          >
            {poweredBy.map((p) => (
              <Stack key={p.name} spacing={0.75} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: 110, md: 140 },
                    height: { xs: 56, md: 72 },
                  }}
                >
                  <Image
                    src={p.logo}
                    alt={p.name}
                    fill
                    sizes="140px"
                    style={{ objectFit: "contain", objectPosition: "center" }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: "0.68rem", md: "0.74rem" },
                    fontWeight: 600,
                    color: COLORS.muted,
                    textAlign: "center",
                    letterSpacing: "0.04em",
                  }}
                >
                  {p.name}
                </Typography>
              </Stack>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
              mt: 3,
            }}
          >
            <StatTile big="10K+" label="practice owners reached monthly" />
            <StatTile big="5" label="connected communities" />
            <StatTile big="100%" label="intent-driven member traffic" />
          </Box>
        </Container>
      </Box>

      {/* Our Founding Partners */}
      <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: COLORS.surfaceAlt }}>
        <Container maxWidth="lg">
          <Stack spacing={1.25} sx={{ alignItems: "center", textAlign: "center", mb: 4 }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
              }}
            >
              Founding Partners
            </Typography>
            <SectionHeading title="Our Founding Partners" />
            <Typography sx={{ color: COLORS.muted, maxWidth: 620, mt: 1, fontSize: "1rem" }}>
              The first two companies anchoring the DMN partner roster. More
              founding partners join by application.
            </Typography>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              maxWidth: 900,
              mx: "auto",
            }}
          >
            {FOUNDING_PARTNERS.map((p) => (
              <FoundingPartnerCard key={p.name} p={p} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* How it works */}
      <Box id="how" sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <SectionHeading title="How it works" />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
              mt: 4,
            }}
          >
            {HOW_IT_WORKS.map((s) => (
              <StepCard key={s.n} n={s.n} title={s.title} body={s.body} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* What you get */}
      <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: COLORS.surfaceAlt }}>
        <Container maxWidth="lg">
          <SectionHeading title="What you get" />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
              mt: 4,
            }}
          >
            {WHAT_YOU_GET.map((c) => (
              <PerkCard key={c.title} title={c.title} body={c.body} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* What you offer members */}
      <Box sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <SectionHeading title="What you offer members" />
          <Typography
            sx={{
              textAlign: "center",
              color: COLORS.muted,
              maxWidth: 600,
              mx: "auto",
              mt: 1.5,
              fontSize: "1rem",
            }}
          >
            The heart of the deal: every partner gives DMN members an exclusive
            discount or benefit, better than your standard pricing.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
              mt: 4,
            }}
          >
            {WHAT_YOU_OFFER.map((c) => (
              <PerkCard key={c.title} title={c.title} body={c.body} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* What it costs */}
      <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: COLORS.surfaceAlt }}>
        <Container maxWidth="lg">
          <SectionHeading title="What it costs" />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
              mt: 4,
            }}
          >
            {PRICE_TIERS.map((p) => (
              <PriceCard key={p.cap} {...p} />
            ))}
          </Box>
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              border: `1px solid ${COLORS.line}`,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.94rem", color: COLORS.inkSoft }}>
              <Box component="strong" sx={{ color: COLORS.ink }}>
                Annual prepay
              </Box>{" "}
              = 2 months free.{" "}
              <Box component="strong" sx={{ color: COLORS.ink }}>
                Founding partners
              </Box>{" "}
              get priority placement in the directory launch.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Who we're recruiting */}
      <Box sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <SectionHeading title="Who we're recruiting" />
          <Typography sx={{ textAlign: "center", color: COLORS.muted, maxWidth: 580, mx: "auto", mt: 1.5 }}>
            Founding partner spots are limited per category. If your category is
            on this list, apply early.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1.25,
              mt: 4,
              maxWidth: 880,
              mx: "auto",
            }}
          >
            {RECRUITED_CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                sx={{
                  bgcolor: "#FFFFFF",
                  color: COLORS.ink,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  border: `1px solid ${COLORS.line}`,
                  height: 34,
                  px: 0.5,
                  borderRadius: 999,
                  transition: "border-color 200ms ease, background-color 200ms ease",
                  "&:hover": {
                    borderColor: COLORS.accent,
                    bgcolor: COLORS.surfaceAlt,
                  },
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Is this a fit? */}
      <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: COLORS.surfaceAlt }}>
        <Container maxWidth="lg">
          <SectionHeading title="Is this a fit?" />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2.5,
              mt: 4,
            }}
          >
            <FitColumn variant="yes" title="For you if" items={FIT_YES} />
            <FitColumn variant="no" title="Not for you if" items={FIT_NO} />
          </Box>
        </Container>
      </Box>

      {/* Partner application form — same form, fields and submission flow
          as the home page, locked to the partner role. Writes to the
          vendor_applications table via /api/vendor/signup.
          Suspense boundary required because WaitlistSection reads
          useSearchParams() (Next.js needs it to know prerender can defer). */}
      <Suspense fallback={null}>
        <WaitlistSection lockedRole="vendor" sectionId="apply" />
      </Suspense>

      {/* Already vetted → full onboarding link */}
      <Box sx={{ py: { xs: 3, md: 4 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography sx={{ fontSize: "0.95rem", color: COLORS.muted }}>
            Already spoken to us?{" "}
            <Box
              component={Link}
              href="/vendor/signup"
              sx={{
                color: COLORS.accentDeep,
                fontWeight: 700,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Complete partner onboarding
            </Box>{" "}
            (plan, agreement, member offer).
          </Typography>
        </Container>
      </Box>

      {/* Meet the experts link */}
      <Box sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="md">
          <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
            <Typography
              sx={{
                fontSize: "0.96rem",
                color: COLORS.muted,
                maxWidth: 580,
              }}
            >
              Curious who's on the expert bench?{" "}
              <Box
                component={Link}
                href="/experts"
                sx={{
                  color: COLORS.accentDeep,
                  fontWeight: 700,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                See our experts
              </Box>
              .
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Closing CTA band */}
      <Box sx={{ bgcolor: COLORS.primary, color: "#FFFFFF", py: { xs: 6, md: 8 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.8rem", md: "2.3rem" },
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              mb: 1.5,
            }}
          >
            Founding Partner spots are limited per category.
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: "1.02rem", mb: 3, maxWidth: 560, mx: "auto" }}>
            Apply now to lock the founding ramp and priority placement in the
            directory launch.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            href="#apply"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ borderRadius: 999, px: 3 }}
          >
            Claim your founding partner spot
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <Typography
      sx={{
        fontFamily: "var(--font-display)",
        fontSize: { xs: "1.7rem", md: "2.1rem" },
        fontWeight: 500,
        color: COLORS.ink,
        textAlign: "center",
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </Typography>
  );
}

function StepCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        p: 3,
        boxShadow: "0 10px 28px -22px rgba(14,42,61,0.18)",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: PARTNER_WINE,
          color: "#FFFFFF",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 600,
          mb: 1.5,
        }}
      >
        {n}
      </Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.15rem",
          color: COLORS.ink,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: COLORS.muted, fontSize: "0.92rem", lineHeight: 1.55 }}>
        {body}
      </Typography>
    </Box>
  );
}

function PerkCard({ title, body }: { title: string; body: string }) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        p: 3,
      }}
    >
      <CheckRoundedIcon sx={{ color: COLORS.accentDeep, fontSize: 22 }} />
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.05rem",
          color: COLORS.ink,
          fontWeight: 500,
          mt: 1,
          mb: 0.5,
          letterSpacing: "-0.005em",
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: COLORS.muted, fontSize: "0.9rem", lineHeight: 1.55 }}>
        {body}
      </Typography>
    </Box>
  );
}

function PriceCard({
  cap,
  price,
  per,
  body,
  hot,
}: {
  cap: string;
  price: string;
  per: string;
  body: string;
  hot: boolean;
}) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: hot ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        boxShadow: hot
          ? "0 20px 50px -28px rgba(217,168,75,0.4)"
          : "0 12px 32px -24px rgba(14,42,61,0.18)",
      }}
    >
      <Box
        sx={{
          bgcolor: hot ? COLORS.accent : COLORS.primary,
          color: hot ? COLORS.primaryDeep : "#FFFFFF",
          textAlign: "center",
          py: 1.25,
          fontSize: "0.74rem",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {cap}
      </Box>
      <Box sx={{ textAlign: "center", py: 3 }}>
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "center", alignItems: "baseline" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "2.6rem", md: "3rem" },
              fontWeight: 600,
              color: COLORS.ink,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {price}
          </Typography>
          {per && (
            <Typography sx={{ fontSize: "0.95rem", color: COLORS.muted, fontWeight: 500 }}>
              {per}
            </Typography>
          )}
        </Stack>
        <Typography sx={{ fontSize: "0.88rem", color: COLORS.muted, mt: 1.25, px: 2 }}>
          {body}
        </Typography>
      </Box>
    </Box>
  );
}

function FitColumn({
  variant,
  title,
  items,
}: {
  variant: "yes" | "no";
  title: string;
  items: string[];
}) {
  const accent = variant === "yes" ? COLORS.accentDeep : COLORS.muted;
  const Icon = variant === "yes" ? CheckRoundedIcon : CloseRoundedIcon;
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        p: 3,
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.15rem",
          fontWeight: 500,
          color: accent,
          mb: 1.5,
          letterSpacing: "-0.005em",
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1.25}>
        {items.map((it) => (
          <Stack key={it} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
            <Icon sx={{ color: accent, fontSize: 18, mt: 0.25, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.92rem", color: COLORS.ink, lineHeight: 1.55 }}>
              {it}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function FoundingPartnerCard({
  p,
}: {
  p: { name: string; tag: string; body: string; logo?: string };
}) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        p: { xs: 3, md: 4 },
        boxShadow: "0 16px 40px -28px rgba(14,42,61,0.25)",
        position: "relative",
      }}
    >
      <Chip
        label="Founding Partner"
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          bgcolor: COLORS.accent,
          color: COLORS.primaryDeep,
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          height: 26,
          px: 0.5,
        }}
      />
      {p.logo && (
        <Box
          sx={{
            position: "relative",
            width: { xs: 110, md: 130 },
            height: { xs: 42, md: 50 },
            mb: 2.25,
          }}
        >
          <Image
            src={p.logo}
            alt={`${p.name} logo`}
            fill
            sizes="130px"
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
        </Box>
      )}
      <Typography
        sx={{
          fontSize: "0.7rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: COLORS.accentDeep,
          mb: 0.5,
        }}
      >
        {p.tag}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: { xs: "1.5rem", md: "1.7rem" },
          fontWeight: 500,
          color: COLORS.ink,
          letterSpacing: "-0.01em",
          mb: 1,
        }}
      >
        {p.name}
      </Typography>
      <Typography sx={{ fontSize: "0.95rem", color: COLORS.inkSoft, lineHeight: 1.6 }}>
        {p.body}
      </Typography>
    </Box>
  );
}

function StatTile({ big, label }: { big: string; label: string }) {
  return (
    <Box
      sx={{
        textAlign: "center",
        p: 2.5,
        borderRadius: 2,
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.7rem",
          fontWeight: 600,
          color: COLORS.accentDeep,
          lineHeight: 1,
          letterSpacing: "-0.01em",
        }}
      >
        {big}
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: COLORS.muted, mt: 0.75 }}>
        {label}
      </Typography>
    </Box>
  );
}

