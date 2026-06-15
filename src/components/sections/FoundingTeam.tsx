"use client";
import Image from "next/image";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import { motion, useReducedMotion } from "framer-motion";
import SectionReveal from "@/components/effects/SectionReveal";
import { asHeardOn, foundingTeam, foundingTeamSection } from "@/lib/content";

const MotionBox = motion.create(Box);

export default function FoundingTeam() {
  const reduced = useReducedMotion();
  const looped = [...asHeardOn, ...asHeardOn, ...asHeardOn];

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        py: { xs: 6, md: 8.5 },
        bgcolor: "#FFFFFF",
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
            "radial-gradient(40% 50% at 50% 0%, rgba(217,168,75,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        {/* Section title */}
        <SectionReveal variant="fade-up" sx={{ mb: { xs: 3.5, md: 4.5 } }}>
          <Stack spacing={1.25} sx={{ textAlign: "center", maxWidth: 760, mx: "auto" }}>
            <Typography variant="overline" sx={{ color: "#A07823", letterSpacing: "0.18em" }}>
              {foundingTeamSection.eyebrow}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                color: "#0A1A2F",
                fontSize: { xs: "1.8rem", md: "2.35rem" },
                lineHeight: 1.15,
              }}
            >
              {foundingTeamSection.title}
            </Typography>
          </Stack>
        </SectionReveal>

        {/* Founder cards */}
        <Grid container spacing={2.5} sx={{ mb: { xs: 3, md: 4 }, justifyContent: "center" }}>
          {foundingTeam.map((person, i) => (
            <Grid key={person.name} size={{ xs: 12, sm: 6, md: 5 }}>
              <MotionBox
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.55,
                  delay: Math.min(i * 0.08, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={reduced ? undefined : { y: -3 }}
                sx={{
                  position: "relative",
                  height: "100%",
                  p: 2.75,
                  borderRadius: 3,
                  bgcolor: "#FBF8F1",
                  border: "1px solid",
                  borderColor: "rgba(14,42,61,0.08)",
                  transition: "border-color 280ms ease, box-shadow 280ms ease",
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: "rgba(160,120,35,0.4)",
                    boxShadow: "0 24px 50px -28px rgba(14,42,61,0.18)",
                  },
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 3,
                    background: `linear-gradient(180deg, ${person.color} 0%, ${person.color}80 100%)`,
                  }}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ alignItems: { sm: "center" }, position: "relative" }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 84, sm: 88 },
                      height: { xs: 84, sm: 88 },
                      borderRadius: "50%",
                      flexShrink: 0,
                      overflow: "hidden",
                      background: `linear-gradient(135deg, ${person.color} 0%, ${person.color}c0 100%)`,
                      padding: "3px",
                      boxShadow: `0 12px 28px -10px ${person.color}80, 0 0 0 1px ${person.color}30`,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        overflow: "hidden",
                        bgcolor: "#FBF8F1",
                      }}
                    >
                      <Image
                        src={person.photo}
                        alt={person.name}
                        fill
                        sizes="88px"
                        style={{
                          objectFit: "cover",
                          objectPosition: "center top",
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ color: "#0A1A2F", fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.2 }}>
                      {person.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#A07823", fontSize: "0.8rem", fontWeight: 600, mt: 0.3 }}
                    >
                      {person.role}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#3B4A55", fontSize: "0.84rem", lineHeight: 1.55, mt: 0.75 }}
                    >
                      {person.blurb}
                    </Typography>
                  </Box>
                </Stack>
              </MotionBox>
            </Grid>
          ))}
        </Grid>

        {/* Vetted-by line — clean alignment using flex on a single row, icon centered with text */}
        <SectionReveal variant="fade-up" delay={0.2} sx={{ mb: { xs: 4, md: 5 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.25,
              maxWidth: 760,
              mx: "auto",
              px: { xs: 2, md: 3 },
              py: 1.5,
              borderRadius: 2.5,
              bgcolor: "rgba(217,168,75,0.06)",
              border: "1px solid rgba(217,168,75,0.18)",
            }}
          >
            <VerifiedRoundedIcon
              sx={{
                fontSize: 18,
                color: "#A07823",
                flexShrink: 0,
                mt: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "#3B4A55",
                fontSize: { xs: "0.82rem", md: "0.88rem" },
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              {foundingTeamSection.subtitle}
            </Typography>
          </Box>
        </SectionReveal>

        {/* As-heard-on row — compact marquee in the same section, professional vibe */}
        <SectionReveal variant="fade-up" delay={0.3}>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "center", justifyContent: "center", mb: 1.5 }}
          >
            <MicNoneOutlinedIcon sx={{ fontSize: 13, color: "#A07823" }} />
            <Typography
              sx={{
                color: "#7A5B17",
                letterSpacing: "0.22em",
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              As heard on
            </Typography>
          </Stack>

          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderTop: "1px solid rgba(14,42,61,0.06)",
              borderBottom: "1px solid rgba(14,42,61,0.06)",
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <motion.div
              animate={reduced ? undefined : { x: ["0%", "-33.333%"] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                display: "flex",
                alignItems: "center",
                width: "fit-content",
              }}
            >
              {looped.map((item, idx) => (
                <Stack
                  key={`${item.name}-${idx}`}
                  direction="row"
                  spacing={2.5}
                  sx={{
                    alignItems: "center",
                    flexShrink: 0,
                    px: { xs: 3, md: 4.5 },
                    py: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 100, md: 140 },
                      height: { xs: 36, md: 46 },
                      transition: "filter 280ms ease",
                      filter: "saturate(0.8) opacity(0.85)",
                      "&:hover": { filter: "saturate(1) opacity(1)" },
                    }}
                  >
                    <Image
                      src={item.logo}
                      alt={item.name}
                      fill
                      sizes="140px"
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                    />
                  </Box>
                  <Box
                    aria-hidden
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      bgcolor: "rgba(160,120,35,0.35)",
                    }}
                  />
                </Stack>
              ))}
            </motion.div>
          </Box>
        </SectionReveal>
      </Container>
    </Box>
  );
}
