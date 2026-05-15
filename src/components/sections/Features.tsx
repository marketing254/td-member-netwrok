"use client";
import { Box, Container, Stack, Typography } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { features, featuresSection } from "@/lib/content";
import SectionReveal from "@/components/effects/SectionReveal";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

const MotionBox = motion.create(Box);

const FEATURE_ICONS = [
  PhoneInTalkOutlinedIcon,
  PeopleAltOutlinedIcon,
  HandshakeOutlinedIcon,
  RuleFolderOutlinedIcon,
  SchoolOutlinedIcon,
  EventNoteOutlinedIcon,
];

/**
 * Compact uniform 3x2 grid of feature rows.
 *
 * No more "big card / small card" mixed sizes. Every feature is the same
 * compact icon-and-text block, so the section reads as a tight overview
 * instead of huge billboards.
 */
export default function Features() {
  const reduced = useReducedMotion();

  return (
    <Box
      id="features"
      component="section"
      sx={{
        position: "relative",
        py: { xs: 5, md: 7 },
        bgcolor: "#FBF8F1",
        borderTop: "1px solid",
        borderColor: "rgba(14,42,61,0.06)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(40% 50% at 90% 0%, rgba(217,168,75,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <SectionReveal variant="fade-up" sx={{ mb: { xs: 4, md: 5 } }}>
          <Stack spacing={1.25} sx={{ maxWidth: 680 }}>
            <Typography
              variant="overline"
              sx={{ color: "#A07823", letterSpacing: "0.16em", fontSize: "0.72rem" }}
            >
              {featuresSection.eyebrow}
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: "#0A1A2F",
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.55rem", sm: "1.85rem", md: "2.15rem" },
                lineHeight: 1.15,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              {featuresSection.title}
            </Typography>
            <Typography
              sx={{
                color: "#3B4A55",
                maxWidth: 560,
                fontSize: { xs: "0.95rem", md: "1rem" },
                lineHeight: 1.6,
              }}
            >
              {featuresSection.subtitle}
            </Typography>
          </Stack>
        </SectionReveal>

        {/* Uniform 3x2 grid — CSS grid for predictable equal sizing on every breakpoint */}
        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.5, md: 1.75 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
          }}
        >
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? PhoneInTalkOutlinedIcon;
            return (
              <MotionBox
                key={f.title}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(i * 0.05, 0.25),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={reduced ? undefined : { y: -2 }}
                sx={{
                  position: "relative",
                  p: { xs: 2, md: 2.25 },
                  borderRadius: 2.5,
                  bgcolor: "#FFFFFF",
                  border: "1px solid rgba(14,42,61,0.08)",
                  transition:
                    "transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms ease, border-color 280ms ease",
                  "&:hover": {
                    borderColor: "rgba(160,120,35,0.4)",
                    boxShadow: "0 18px 36px -22px rgba(14,42,61,0.16)",
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 34,
                      height: 34,
                      borderRadius: 1.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(217,168,75,0.12)",
                      color: "#A07823",
                      border: "1px solid rgba(217,168,75,0.22)",
                    }}
                  >
                    <Icon sx={{ fontSize: 17 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      component="h3"
                      sx={{
                        color: "#0A1A2F",
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        fontWeight: 500,
                        lineHeight: 1.25,
                        letterSpacing: "-0.01em",
                        mb: 0.5,
                      }}
                    >
                      {f.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#3B4A55",
                        fontSize: "0.85rem",
                        lineHeight: 1.55,
                      }}
                    >
                      {f.summary}
                    </Typography>
                  </Box>
                </Stack>
              </MotionBox>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
