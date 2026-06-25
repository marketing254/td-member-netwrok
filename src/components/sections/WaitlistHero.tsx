"use client";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import HeroFlowingCurves from "@/components/effects/HeroFlowingCurves";

const MotionBox = motion.create(Box);

export default function WaitlistHero() {
  const reduced = useReducedMotion();

  return (
    <Box
      id="top"
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 5, md: 7 },
        pb: { xs: 6, md: 9 },
        bgcolor: "#FBF8F1",
        color: "#1A1A1A",
      }}
    >
      {/* Warm corner blooms — soft champagne glows in the upper-right and
          lower-left only. No center coverage. */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(50% 55% at 90% 0%, rgba(217,168,75,0.22) 0%, transparent 65%), radial-gradient(45% 55% at 10% 100%, rgba(155,123,58,0.16) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Flowing champagne curves — continuously redraw themselves from
          both corners, masked to fade through the center band so the
          headline stays crisp. No blue, no halos, no 3D canvas. */}
      <HeroFlowingCurves />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
        <Stack
          spacing={2.5}
          sx={{
            maxWidth: 760,
            mx: "auto",
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <MotionBox
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            sx={{
              display: "inline-flex",
              alignSelf: "center",
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
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography
              sx={{
                color: "#52525B",
                fontSize: { xs: "1rem", md: "1.08rem" },
                lineHeight: 1.55,
                maxWidth: 620,
                mx: "auto",
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
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.25,
              alignItems: "center",
              justifyContent: "center",
              pt: 0.5,
            }}
          >
            <Button
              component={Link}
              href="/join"
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
              Become a member
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
              justifyContent: "center",
            }}
          >
            {["Cancel anytime", "No spam", "Real human replies"].map((line) => (
              <Stack
                key={line}
                direction="row"
                spacing={0.5}
                sx={{ alignItems: "center" }}
              >
                <Check size={13} color="#9B7B3A" strokeWidth={2.6} />
                <Typography sx={{ color: "#71717A", fontSize: "0.82rem" }}>
                  {line}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {/* "Now live" status chip — centered under the trust line.
              Green dot pulses on a 2s loop to signal active state. */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              alignSelf: "center",
              mt: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(231,226,214,0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 7,
                height: 7,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  bgcolor: "#2C7A52",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  bgcolor: "#2C7A52",
                  animation: "liveStatusPulse 2s ease-out infinite",
                  "@keyframes liveStatusPulse": {
                    "0%": { transform: "scale(1)", opacity: 0.55 },
                    "80%, 100%": { transform: "scale(3.2)", opacity: 0 },
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                  },
                }}
              />
            </Box>
            <Typography
              sx={{ fontSize: "0.76rem", color: "#3B4A55", lineHeight: 1.3 }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
                Now live —
              </Box>{" "}
              500+ practice owners on the network
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
