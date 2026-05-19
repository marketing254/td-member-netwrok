"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Countdown from "@/components/sections/Countdown";
import AnimatedCounter from "@/components/effects/AnimatedCounter";
import KineticText from "@/components/effects/KineticText";
import { founding, hero } from "@/lib/content";

const NetworkScene = dynamic(() => import("@/components/effects/NetworkScene"), {
  ssr: false,
  loading: () => null,
});

const MotionBox = motion.create(Box);

type Counts = { total: number; members: number; vendors: number; last_24h: number };

export default function WaitlistHero() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.7, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.85, 0.3]);

  const [counts, setCounts] = useState<Counts>({
    total: 0,
    members: 0,
    vendors: 0,
    last_24h: 0,
  });

  useEffect(() => {
    let alive = true;
    const fetchCounts = () => {
      fetch("/api/waitlist", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (alive && d && typeof d.total === "number") setCounts(d as Counts);
        })
        .catch(() => {});
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const claimedPct = (counts.total / founding.totalSpots) * 100;
  const waitlistProof = hero.proofPoints[0] ?? {
    value: "247+",
    label: "Practice owners in the waitlist",
  };

  return (
    <Box
      ref={heroRef}
      id="top"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 6, sm: 7, md: 10 },
        pb: { xs: 5, md: 8 },
        backgroundImage:
          "linear-gradient(180deg, #FBF8F1 0%, #F5F0E4 60%, #EFE9DA 100%)",
        color: "#0A1A2F",
      }}
    >
      {/* NetworkScene pinned to the RIGHT half only */}
      <Box
        component={motion.div}
        aria-hidden
        style={reduced ? undefined : { y: sceneY, opacity: sceneOpacity, scale: sceneScale }}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: "100%", md: "55%" },
          pointerEvents: "none",
          zIndex: 0,
          maskImage:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.8) 90%, transparent 100%)",
          transformOrigin: "center center",
          display: { xs: "none", md: "block" },
        }}
      >
        <NetworkScene />
      </Box>

      {/* Soft warm wash at top */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          background:
            "radial-gradient(60% 100% at 30% 0%, rgba(217,168,75,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Faint grid texture */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(14,42,61,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,42,61,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 20% 30%, black 10%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Grid container spacing={{ xs: 5, md: 4 }} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <MotionBox style={reduced ? undefined : { y: heroTextY, opacity: heroTextOpacity }}>
            <Stack spacing={3.5} sx={{ maxWidth: 660 }}>
              <MotionBox
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
                  <Chip
                    icon={<BoltOutlinedIcon sx={{ fontSize: 13, color: "#A07823 !important" }} />}
                    label={hero.topChip}
                    size="small"
                    sx={{
                      bgcolor: "rgba(217,168,75,0.14)",
                      color: "#7A5B17",
                      border: "1px solid rgba(217,168,75,0.4)",
                      fontSize: "0.66rem",
                      px: 1,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                    }}
                  />
                  {counts.total > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: "rgba(14,42,61,0.04)",
                        border: "1px solid rgba(14,42,61,0.1)",
                        fontSize: "0.74rem",
                        color: "#3B4A55",
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "#2E8A57",
                          boxShadow: "0 0 12px rgba(46,138,87,0.6)",
                        }}
                      />
                      <Box component="span" sx={{ fontWeight: 700, color: "#0A1A2F" }}>
                        <AnimatedCounter value={counts.total} />
                      </Box>{" "}
                      on the list
                    </Box>
                  )}
                </Stack>
              </MotionBox>

              <Box>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    color: "#0A1A2F",
                    maxWidth: 640,
                    fontWeight: 500,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.02,
                  }}
                >
                  <KineticText text="The only network with a" delay={0.05} />{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "#A07823",
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <KineticText text="human expert" delay={0.32} />
                  </Box>{" "}
                  <KineticText text="on the line for every practice problem." delay={0.5} />
                </Typography>
              </Box>

              <MotionBox
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    maxWidth: 580,
                    color: "#3B4A55",
                    fontSize: { xs: "1.05rem", md: "1.15rem" },
                    lineHeight: 1.65,
                  }}
                >
                  {hero.subtitle}
                </Typography>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <Countdown variant="light" />
              </MotionBox>

              {/* Countdown CTA */}
              <MotionBox
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.15 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  sx={{
                    maxWidth: 560,
                    alignItems: { xs: "stretch", sm: "center" },
                  }}
                >
                  <Button
                    href="#waitlist"
                    onClick={(e) => {
                      const el = document.getElementById("waitlist");
                      if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 17 }} />}
                    sx={{
                      minHeight: 56,
                      px: 3,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      boxShadow:
                        "0 18px 38px -14px rgba(217,168,75,0.55), 0 0 0 1px rgba(217,168,75,0.3) inset",
                    }}
                  >
                    Join the waitlist
                  </Button>

                  <Box
                    sx={{
                      minHeight: 56,
                      px: { xs: 2, sm: 2.25 },
                      py: 1.1,
                      borderRadius: 999,
                      bgcolor: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(14,42,61,0.08)",
                      backdropFilter: "blur(10px)",
                      boxShadow: "0 14px 32px -24px rgba(14,42,61,0.32)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: { xs: "center", sm: "flex-start" },
                      gap: 1,
                      textAlign: "left",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#A07823",
                        fontFamily: "var(--font-display)",
                        fontSize: { xs: "1.35rem", sm: "1.45rem" },
                        fontWeight: 650,
                        lineHeight: 1,
                        letterSpacing: 0,
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                      }}
                    >
                      {waitlistProof.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#5C6770",
                        fontSize: { xs: "0.78rem", sm: "0.82rem" },
                        lineHeight: 1.25,
                        fontWeight: 700,
                        maxWidth: 170,
                      }}
                    >
                      {waitlistProof.label}
                    </Typography>
                  </Box>
                </Stack>
              </MotionBox>

              {/* Progress bar */}
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                sx={{ maxWidth: 560 }}
              >
                <Stack
                  direction="row"
                  sx={{ mb: 1, justifyContent: "space-between", alignItems: "baseline", gap: 2 }}
                >
                  <Typography variant="body2" sx={{ color: "#0A1A2F", fontWeight: 600 }}>
                    {counts.total.toLocaleString("en-US")} of{" "}
                    {founding.totalSpots.toLocaleString("en-US")} {hero.progressLabel}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#5C6770", fontWeight: 600 }}>
                    {Math.round(claimedPct)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={claimedPct}
                  sx={{
                    height: 5,
                    borderRadius: 999,
                    bgcolor: "rgba(14,42,61,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundImage: "linear-gradient(90deg, #D9A84B 0%, #F0C16E 100%)",
                    },
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1.5, color: "#5C6770", fontSize: "0.82rem", maxWidth: 520 }}>
                  {hero.bottomNote}
                </Typography>
              </MotionBox>
            </Stack>
            </MotionBox>
          </Grid>

          {/* Right column, NetworkScene is the background, this is empty spacer on mobile */}
          <Grid size={{ xs: 0, md: 5 }} sx={{ display: { xs: "none", md: "block" } }} />
        </Grid>
      </Container>
    </Box>
  );
}
