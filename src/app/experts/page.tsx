"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import Header from "@/components/sections/Header";
import PoweredByStrip from "@/components/sections/PoweredByStrip";
import WaitlistSection from "@/components/sections/WaitlistSection";
import { poweredBy } from "@/lib/content";
import { COLORS } from "@/theme";

// Tier accent — green for Experts (per README brand guide). Applied to
// the hero eyebrow + step circles + the primary Apply button only, so
// the page still reads as the same DMN brand (navy hero, gold ribbons,
// cream/white sections) with one identifying accent.
const EXPERT_GREEN = "#2c7a52";
const EXPERT_GREEN_DARK = "#1f5238";

const HOW_IT_WORKS = [
  {
    n: "1",
    title: "You share",
    body: "One recording of you teaching your topic, plus a few details.",
  },
  {
    n: "2",
    title: "We build",
    body: "Your full kit (video, action guide, checklist, worksheet, slide deck, poster) live under your profile.",
  },
  {
    n: "3",
    title: "You get booked",
    body: "Every resource carries a book-a-meeting button, so members reach out directly.",
  },
];

const WHAT_YOU_GET = [
  {
    title: "A done-for-you library",
    body: "Produced for you, in your branding, from one recording.",
  },
  {
    title: "Your featured profile",
    body: "Your resources, bio and brand in front of the member base.",
  },
  { title: "Warm leads", body: "Interested members book straight onto your calendar." },
  {
    title: "Hotline referrals",
    body: "We point members to you when their problem fits your expertise.",
  },
  {
    title: "Sell your own courses",
    body: "List your own paid courses to members — DMN runs the platform.",
  },
  {
    title: "Co-marketing",
    body: "Features across the Thriving Dentist podcast, webinars and social.",
  },
];

// Phase ladder — same shape as the /partners page so both audiences
// read consistently. Headline takeaway: every phase includes the same
// Featured Expert benefits, and the bench keeps 90% of course revenue.
const PRICE_TIERS = [
  { cap: "Months 1–6", price: "$0", per: "", body: "Founding-cohort waiver. Build your library + warm-lead pipeline first.", hot: true },
  { cap: "Months 7–12", price: "$49", per: "/mo", body: "Locked launch rate. Auto-rolls from Phase 1.", hot: true },
  { cap: "Month 13+", price: "$199", per: "/mo", body: "Standard rate · or $1,990/yr annual pre-pay (2 months free).", hot: false },
];

const FIT_YES = [
  "You coach, consult or teach in dentistry",
  "You have content, or can record it",
  "You want exposure and warm leads without doing the production",
];

const FIT_NO = [
  "You want to hard-sell with no real value",
  "You can't be reachable when we send you a member who fits",
];

// Listed alongside any other expert — no "founder of DMN" framing.
// Their roles describe external credentials so members understand the
// expertise, not internal DMN titles.
const EXPERTS = [
  {
    name: "Gary Takacs",
    role: "Practice growth · Host of the Thriving Dentist Show",
    body: "30+ years coaching dental practice owners. Host of the Thriving Dentist Show, downloaded in 192 countries.",
    photo: "/team/gary-takacs.jpg",
  },
  {
    name: "Naren Arulrajah",
    role: "Marketing strategy · Founder & CEO, Ekwa Marketing",
    body: "Founder & CEO of Ekwa Marketing. Co-host of Less Insurance Dependence.",
    photo: "/team/naren-arulrajah.jpg",
  },
];

export default function ExpertsPage() {
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
              For Experts · Founding Bench
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
              Turn your expertise into a done-for-you library and a pipeline of warm leads.
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: "1.05rem", lineHeight: 1.65, maxWidth: 660 }}>
              Share one recording. We build the full content kit, put it in
              front of thousands of practice owners, and send interested members
              straight to your calendar.
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
                  bgcolor: EXPERT_GREEN,
                  color: "#FFFFFF",
                  backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                  boxShadow: "0 8px 22px -10px rgba(44,122,82,0.55)",
                  "&:hover": {
                    bgcolor: EXPERT_GREEN_DARK,
                    backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                    boxShadow: "0 14px 32px -10px rgba(44,122,82,0.7)",
                  },
                }}
              >
                Apply to be an expert
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
              Curated by the Thriving Dentist team, not an algorithm.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Trusted partners marquee — same logo strip as the homepage */}
      <PoweredByStrip />

      {/* Our Experts — Gary, Naren, etc. sits high on the page so visitors
          see the actual bench before reading any of the marketing sections. */}
      <Box sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1.25} sx={{ alignItems: "center", textAlign: "center", mb: 4 }}>
            <SectionHeading title="Our Experts" />
            <Typography sx={{ color: COLORS.muted, fontSize: "1rem", maxWidth: 620, mt: 1 }}>
              The first names on the bench. New experts join by application.
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
            {EXPERTS.map((f) => (
              <ExpertCard key={f.name} f={f} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Cream band quote */}
      <Box sx={{ bgcolor: COLORS.surfaceAlt, py: { xs: 4, md: 5 }, borderBottom: `1px solid ${COLORS.line}` }}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
            <AutoAwesomeRoundedIcon sx={{ color: COLORS.accent, fontSize: 28, mt: 0.5 }} />
            <Typography sx={{ fontSize: "1.05rem", color: COLORS.inkSoft, lineHeight: 1.55, fontWeight: 500 }}>
              Other networks ask experts to make their own content and chase
              their own audience.{" "}
              <Box component="span" sx={{ color: COLORS.ink, fontWeight: 700 }}>
                We do the production for you, and we bring the audience.
              </Box>
            </Typography>
          </Stack>
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

      {/* How to join */}
      <Box sx={{ py: { xs: 6, md: 9 } }}>
        <Container maxWidth="md">
          <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
            <SectionHeading title="How to join" />
            <Typography sx={{ color: COLORS.muted, mt: 1.5, maxWidth: 640 }}>
              Founding experts are hand-picked and join by invitation. Tell us
              about your work and the topics you'd teach. There's no platform
              to wrestle with: you share your material, we build everything, and
              you approve it before it goes live.
            </Typography>
            <Box sx={{ pt: 2 }}>
              <Button
                variant="contained"
                component={Link}
                href="#apply"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  bgcolor: EXPERT_GREEN,
                  color: "#FFFFFF",
                  backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                  boxShadow: "0 8px 22px -10px rgba(44,122,82,0.55)",
                  "&:hover": {
                    bgcolor: EXPERT_GREEN_DARK,
                    backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                    boxShadow: "0 14px 32px -10px rgba(44,122,82,0.7)",
                  },
                }}
              >
                Apply to be considered
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* What it costs — simple 3-phase ladder. Full details on /pricing. */}
      <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: COLORS.surfaceAlt }}>
        <Container maxWidth="lg">
          <SectionHeading title="What it costs" />
          <Typography sx={{ textAlign: "center", color: COLORS.muted, maxWidth: 620, mx: "auto", mt: 1.5, fontSize: "1rem" }}>
            Same Featured Expert benefits at every phase. Annual pre-pay unlocks at month 7.
          </Typography>
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
            <Typography sx={{ fontSize: "0.94rem", color: COLORS.inkSoft, lineHeight: 1.55 }}>
              ★{" "}
              <Box component="strong" sx={{ color: COLORS.ink }}>
                Course revenue split — keep 90%.
              </Box>{" "}
              Sell your own paid courses through DMN. We run the platform; you keep 90% of net, paid monthly via Stripe Connect.
            </Typography>
          </Box>
          <Stack direction="row" sx={{ justifyContent: "center", mt: 2.5 }}>
            <Button
              variant="outlined"
              component={Link}
              href="/pricing"
              sx={{ borderRadius: 999, px: 3 }}
            >
              See full pricing
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Is this a fit? */}
      <Box sx={{ py: { xs: 6, md: 9 } }}>
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

      {/* Expert application form — same form, fields and submission flow
          as the home page, locked to the expert role. Writes to the
          expert_applications table and triggers the expert confirmation
          email via /api/expert/signup.
          Suspense boundary required because WaitlistSection reads
          useSearchParams() (Next.js needs it to know prerender can defer). */}
      <Suspense fallback={null}>
        <WaitlistSection lockedRole="expert" sectionId="apply" />
      </Suspense>

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
            Join our founding expert bench.
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: "1.02rem", mb: 3, maxWidth: 560, mx: "auto" }}>
            Apply to be considered, send us one recording, and we'll build your
            first resources for your review.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="#apply"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              borderRadius: 999,
              px: 3,
              bgcolor: EXPERT_GREEN,
              color: "#FFFFFF",
              backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
              boxShadow: "0 8px 22px -10px rgba(44,122,82,0.55)",
              "&:hover": {
                bgcolor: EXPERT_GREEN_DARK,
                backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                boxShadow: "0 14px 32px -10px rgba(44,122,82,0.7)",
              },
            }}
          >
            Apply to be an expert
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
          bgcolor: EXPERT_GREEN,
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
  // Green accent for the expert page (vs. gold on /partners), so the
  // pricing band reads as expert-branded without breaking the palette.
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: hot ? `2px solid ${EXPERT_GREEN}` : `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: hot
          ? "0 20px 50px -28px rgba(44,122,82,0.4)"
          : "0 12px 32px -24px rgba(14,42,61,0.18)",
      }}
    >
      <Box
        sx={{
          bgcolor: hot ? EXPERT_GREEN : COLORS.primary,
          color: "#FFFFFF",
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
      <Box sx={{ textAlign: "center", py: 3, flex: 1 }}>
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
        <Typography sx={{ fontSize: "0.88rem", color: COLORS.muted, mt: 1.25, px: 2.5, lineHeight: 1.55 }}>
          {body}
        </Typography>
      </Box>
      <Box sx={{ px: 3, pb: 3 }}>
        <Button
          fullWidth
          variant={hot ? "contained" : "outlined"}
          component={Link}
          href="#apply"
          sx={{
            borderRadius: 999,
            py: 1,
            ...(hot && {
              bgcolor: EXPERT_GREEN,
              color: "#FFFFFF",
              backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
              "&:hover": {
                bgcolor: EXPERT_GREEN_DARK,
                backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
              },
            }),
          }}
        >
          Apply to the bench
        </Button>
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

function ExpertCard({
  f,
}: {
  f: { name: string; role: string; body: string; photo: string };
}) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        boxShadow: "0 16px 40px -28px rgba(14,42,61,0.25)",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", sm: 180 },
          height: { xs: 240, sm: "auto" },
          minHeight: { sm: 220 },
          bgcolor: COLORS.surfaceAlt,
          flexShrink: 0,
        }}
      >
        <Image
          src={f.photo}
          alt={f.name}
          fill
          sizes="(max-width: 600px) 100vw, 180px"
          style={{ objectFit: "cover", objectPosition: "center top" }}
        />
      </Box>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
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
          {f.role}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            color: COLORS.ink,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            mb: 1,
          }}
        >
          {f.name}
        </Typography>
        <Typography sx={{ fontSize: "0.95rem", color: COLORS.inkSoft, lineHeight: 1.6 }}>
          {f.body}
        </Typography>
      </Box>
    </Box>
  );
}

function PoweredByCarousel() {
  const reduced = useReducedMotion();
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: COLORS.surfaceAlt, borderTop: `1px solid ${COLORS.line}` }}>
      <Container maxWidth="lg">
        <Stack
          spacing={1.25}
          sx={{ alignItems: "center", textAlign: "center", mb: 4, maxWidth: 720, mx: "auto" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center" }}>
            <MicRoundedIcon sx={{ color: COLORS.accentDeep, fontSize: 18 }} />
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
              }}
            >
              Powered by
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.4rem", md: "1.8rem" },
              fontWeight: 500,
              color: COLORS.ink,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            The connected communities behind DMN
          </Typography>
          <Typography sx={{ color: COLORS.muted, fontSize: "0.95rem" }}>
            Five communities across the Thriving Dentist ecosystem — practice
            owners come to DMN already engaged, already trusting the team.
          </Typography>
        </Stack>

        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 3,
            py: { xs: 3, md: 4 },
            // Edge fade
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
          }}
        >
          <motion.div
            animate={reduced ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ display: "flex", alignItems: "stretch", width: "fit-content" }}
          >
            {[...poweredBy, ...poweredBy].map((p, idx) => (
              <Box
                key={`${p.name}-${idx}`}
                sx={{
                  flexShrink: 0,
                  // Fixed cell sizing so logos of different aspect ratios
                  // sit on a consistent rhythm — no crowding, no wide gaps.
                  width: { xs: 200, sm: 240, md: 280 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  px: 2,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: 150, md: 200 },
                    height: { xs: 70, md: 90 },
                    filter: "grayscale(0.2)",
                    transition: "filter 220ms ease, transform 220ms ease",
                    "&:hover": { filter: "grayscale(0)", transform: "scale(1.04)" },
                  }}
                >
                  <Image
                    src={p.logo}
                    alt={p.name}
                    fill
                    sizes="200px"
                    style={{ objectFit: "contain", objectPosition: "center" }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: COLORS.muted,
                    letterSpacing: "0.04em",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {p.name}
                </Typography>
              </Box>
            ))}
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

