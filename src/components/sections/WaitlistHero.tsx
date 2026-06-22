"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowRight, Check, Lock, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Countdown, { CountdownProgress } from "@/components/sections/Countdown";
import { founding } from "@/lib/content";

const MotionBox = motion.create(Box);

// 3D scene lazy-loaded so it never blocks first paint and never SSRs
const Hero3DScene = dynamic(() => import("@/components/effects/Hero3DScene"), {
  ssr: false,
  loading: () => null,
});

export default function WaitlistHero() {
  const reduced = useReducedMotion();

  return (
    <Box
      id="top"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 6, md: 8 },
        pb: { xs: 6, md: 8 },
        bgcolor: "#FBF8F1",
        color: "#1A1A1A",
      }}
    >
      {/* Subtle warm gradient mesh */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(60% 70% at 80% 0%, rgba(184,153,104,0.16) 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(155,123,58,0.1) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* 3D constellation spans the full hero — primitives orbit across both
          sides of the layout. Soft elliptical mask keeps the center clear so
          the headline + launch card stay readable. */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 0,
          maskImage:
            "radial-gradient(ellipse 75% 50% at 50% 50%, transparent 0%, transparent 25%, rgba(0,0,0,0.55) 55%, black 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 50% at 50% 50%, transparent 0%, transparent 25%, rgba(0,0,0,0.55) 55%, black 80%)",
        }}
      >
        <Hero3DScene />
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Grid container spacing={{ xs: 4, md: 5 }} sx={{ alignItems: "center" }}>
          {/* LEFT */}
          <Grid size={{ xs: 12, md: 6.5 }}>
            <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
              <MotionBox
                initial={reduced ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  gap: 0.85,
                  px: 1.4,
                  py: 0.55,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(155,123,58,0.25)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles size={12} color="#9B7B3A" strokeWidth={2.4} />
                <Typography
                  sx={{
                    color: "#7A5F2A",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                  }}
                >
                  Curated by the Thriving Dentist team — not an algorithm
                </Typography>
              </MotionBox>

              <MotionBox
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    color: "#1A1A1A",
                    fontFamily: "var(--font-display)",
                    fontSize: { xs: "2rem", sm: "2.4rem", md: "2.9rem" },
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    fontWeight: 500,
                  }}
                >
                  The only network where every practice problem gets a{" "}
                  <Box
                    component="span"
                    sx={{
                      fontStyle: "italic",
                      backgroundImage:
                        "linear-gradient(120deg, #9B7B3A 0%, #C9A876 50%, #9B7B3A 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    written action plan in 2–3 business days.
                  </Box>
                </Typography>
              </MotionBox>

              <MotionBox
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <Typography
                  sx={{
                    color: "#52525B",
                    fontSize: { xs: "1rem", md: "1.08rem" },
                    lineHeight: 1.55,
                    maxWidth: 540,
                  }}
                >
                  Submit any practice problem — a real expert routes you to the exact
                  people and proven playbooks within 3 business days. Plus $6,000+/yr
                  in vendor savings and 500+ peer owners. One membership.
                </Typography>
              </MotionBox>

              <MotionBox
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.25,
                  alignItems: "center",
                  pt: 0.5,
                }}
              >
                <Button
                  component={Link}
                  href="#waitlist"
                  endIcon={<ArrowRight size={16} />}
                  sx={{
                    py: 1.35,
                    px: 2.5,
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    bgcolor: "#1A1A1A",
                    color: "#FFFFFF !important",
                    "&:hover": { bgcolor: "#2A2A2A", transform: "translateY(-1px)" },
                    transition: "transform 150ms ease, background 150ms ease",
                  }}
                >
                  Claim your founding spot
                </Button>
                <Button
                  component={Link}
                  href="#helpline"
                  sx={{
                    py: 1.35,
                    px: 2.25,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    color: "#1A1A1A",
                    border: "1.5px solid #E7E2D6",
                    bgcolor: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(8px)",
                    "&:hover": { borderColor: "#9B7B3A", bgcolor: "rgba(255,255,255,0.85)" },
                  }}
                >
                  See how the helpline works
                </Button>
              </MotionBox>

              <Stack
                direction="row"
                spacing={2}
                sx={{
                  pt: 1,
                  flexWrap: "wrap",
                  rowGap: 1,
                  color: "#71717A",
                  fontSize: "0.82rem",
                }}
              >
                {["No payment today", "Cancel anytime", "No spam"].map(
                  (line) => (
                    <Stack key={line} direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <Check size={13} color="#9B7B3A" strokeWidth={2.6} />
                      <Typography sx={{ color: "#71717A", fontSize: "0.82rem" }}>
                        {line}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Stack>
          </Grid>

          {/* RIGHT — launch card */}
          <Grid size={{ xs: 12, md: 5.5 }}>
            <MotionBox
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              sx={{
                bgcolor: "#FFFFFF",
                color: "#1A1A1A",
                borderRadius: 3,
                p: { xs: 2.5, md: 3 },
                boxShadow:
                  "0 1px 2px rgba(20,20,20,0.04), 0 24px 60px -30px rgba(20,20,20,0.2)",
                border: "1px solid rgba(231,226,214,0.7)",
                maxWidth: 420,
                ml: { md: "auto" },
                mx: { xs: "auto", md: 0 },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#1A1A1A" }}>
                    Founding cohort
                  </Typography>
                  <Typography sx={{ color: "#71717A", fontSize: "0.78rem" }}>
                    100 spots only
                  </Typography>
                </Stack>

                <CountdownProgress />

                <Countdown compact />

                <Box
                  sx={{
                    textAlign: "center",
                    py: 1.25,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: "#FBF8F1",
                    border: "1px solid #E7E2D6",
                  }}
                >
                  <Typography sx={{ fontSize: "0.84rem", color: "#52525B" }}>
                    Founding rate{" "}
                    <Box
                      component="strong"
                      sx={{ color: "#9B7B3A", fontSize: "1.05rem" }}
                    >
                      ${founding.priceMonthly}/mo
                    </Box>{" "}
                    <Box
                      component="span"
                      sx={{
                        textDecoration: "line-through",
                        color: "#A8A29E",
                        fontSize: "0.85rem",
                      }}
                    >
                      ${founding.priceRegular}/mo
                    </Box>{" "}
                    — locked forever
                  </Typography>
                </Box>

                <Button
                  component={Link}
                  href="#waitlist"
                  endIcon={<ArrowRight size={16} />}
                  fullWidth
                  sx={{
                    py: 1.35,
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    bgcolor: "#1A1A1A",
                    color: "#FFFFFF !important",
                    "&:hover": { bgcolor: "#2A2A2A" },
                  }}
                >
                  Reserve my spot free
                </Button>

                <Stack direction="row" spacing={0.65} sx={{ alignItems: "center", justifyContent: "center", color: "#71717A" }}>
                  <Lock size={11} />
                  <Typography sx={{ color: "#71717A", fontSize: "0.72rem" }}>
                    No payment today · billed only on launch day
                  </Typography>
                </Stack>
              </Stack>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
