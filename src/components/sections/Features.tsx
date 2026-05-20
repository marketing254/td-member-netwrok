"use client";
import { Box, Container, Stack, Typography } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { features, featuresSection } from "@/lib/content";
import SectionReveal from "@/components/effects/SectionReveal";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import GpsFixedRoundedIcon from "@mui/icons-material/GpsFixedRounded";
import AllInclusiveRoundedIcon from "@mui/icons-material/AllInclusiveRounded";

const MotionBox = motion.create(Box);

const ICON_MAP = {
  star: StarRoundedIcon,
  check: VerifiedRoundedIcon,
  target: GpsFixedRoundedIcon,
  infinity: AllInclusiveRoundedIcon,
} as const;

type IconKey = keyof typeof ICON_MAP;

function splitTitle(title: string, emphasis?: string) {
  if (!emphasis) return { head: title, tail: "" };
  const idx = title.indexOf(emphasis);
  if (idx === -1) return { head: title, tail: "" };
  return { head: title.slice(0, idx).trim(), tail: emphasis };
}

export default function Features() {
  const reduced = useReducedMotion();
  const { head, tail } = splitTitle(
    featuresSection.title,
    "titleEmphasis" in featuresSection ? featuresSection.titleEmphasis : undefined,
  );

  return (
    <Box
      id="features"
      component="section"
      sx={{
        position: "relative",
        py: { xs: 6, md: 9 },
        bgcolor: "#FBF8F1",
        borderTop: "1px solid",
        borderColor: "rgba(14,42,61,0.06)",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(45% 55% at 10% 0%, rgba(217,168,75,0.07) 0%, transparent 60%), radial-gradient(40% 50% at 90% 100%, rgba(14,42,61,0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <SectionReveal variant="fade-up" sx={{ mb: { xs: 5, md: 6 } }}>
          <Stack
            spacing={1.5}
            sx={{ maxWidth: 760, mx: { md: "auto" }, textAlign: { md: "center" } }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#A07823", letterSpacing: "0.18em", fontSize: "0.74rem" }}
            >
              {featuresSection.eyebrow}
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: "#0A1A2F",
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.75rem", sm: "2.05rem", md: "2.4rem" },
                lineHeight: 1.15,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              {head}{" "}
              {tail && (
                <Box
                  component="em"
                  sx={{
                    color: "#A07823",
                    fontStyle: "italic",
                    fontWeight: 500,
                  }}
                >
                  {tail}
                </Box>
              )}
            </Typography>
            <Typography
              sx={{
                color: "#3B4A55",
                maxWidth: 620,
                mx: { md: "auto" },
                fontSize: { xs: "0.98rem", md: "1.05rem" },
                lineHeight: 1.65,
              }}
            >
              {featuresSection.subtitle}
            </Typography>
          </Stack>
        </SectionReveal>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 2, md: 2.5 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            maxWidth: 1080,
            mx: "auto",
          }}
        >
          {features.map((f, i) => {
            const Icon = ICON_MAP[(f.icon as IconKey) ?? "star"] ?? StarRoundedIcon;
            return (
              <MotionBox
                key={f.title}
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.55,
                  delay: Math.min(i * 0.08, 0.32),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={reduced ? undefined : { y: -4 }}
                sx={{
                  position: "relative",
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  bgcolor: "#FFFFFF",
                  border: "1px solid rgba(14,42,61,0.08)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms ease, border-color 320ms ease",
                  "&:hover": {
                    borderColor: "rgba(160,120,35,0.4)",
                    boxShadow: "0 24px 48px -28px rgba(14,42,61,0.2)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "12%",
                    right: "12%",
                    height: 2,
                    borderRadius: 2,
                    background:
                      "linear-gradient(90deg, transparent, rgba(217,168,75,0.55), transparent)",
                    opacity: 0,
                    transition: "opacity 320ms ease",
                  },
                  "&:hover::before": { opacity: 1 },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(217,168,75,0.12)",
                    color: "#A07823",
                    border: "1px solid rgba(217,168,75,0.25)",
                    mb: 2,
                  }}
                >
                  <Icon sx={{ fontSize: 26 }} />
                </Box>
                <Typography
                  component="h3"
                  sx={{
                    color: "#0A1A2F",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.15rem",
                    fontWeight: 500,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                    mb: 1,
                  }}
                >
                  {f.title}
                </Typography>
                <Typography
                  sx={{
                    color: "#3B4A55",
                    fontSize: "0.92rem",
                    lineHeight: 1.6,
                  }}
                >
                  {f.summary}
                </Typography>
              </MotionBox>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
