"use client";
import Image from "next/image";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { BadgeCheck, Mic, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion.create(Box);

type Founder = {
  name: string;
  role: string;
  photo: string;
  bio: string;
  badges: string[];
};

const FOUNDERS: Founder[] = [
  {
    name: "Gary Takacs",
    role: "Founder · Thriving Dentist",
    photo: "/team/gary-takacs.jpg",
    bio:
      "30+ years coaching dental practice owners. Host of the Thriving Dentist Show, downloaded in 192 countries. Curates every helpline expert before they answer a single member question.",
    badges: ["2,200+ practices coached", "30+ years", "Podcast host"],
  },
  {
    name: "Naren Arulrajah",
    role: "Founder · Ekwa Marketing",
    photo: "/team/naren-arulrajah.jpg",
    bio:
      "Founder & CEO of Ekwa Marketing. Co-host of Less Insurance Dependence. Built the dental SEO playbook used by hundreds of fee-for-service practices and personally vets every marketing partner in DMN.",
    badges: ["Ekwa Marketing", "Less Insurance Dependence", "SEO specialist"],
  },
];

export default function FoundingTeam() {
  const reduced = useReducedMotion();

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        py: { xs: 7, md: 10 },
        bgcolor: "#FFFFFF",
        borderTop: "1px solid #E7E2D6",
        overflow: "hidden",
      }}
    >
      {/* Soft warm halo top-right */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,168,118,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        {/* Section heading */}
        <MotionBox
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: { xs: 5, md: 6 } }}
        >
          {/* Eyebrow pill */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.85,
              px: 1.4,
              py: 0.55,
              borderRadius: 999,
              bgcolor: "#FBF8F1",
              border: "1px solid rgba(155,123,58,0.25)",
              mb: 2,
            }}
          >
            <Sparkles size={12} color="#9B7B3A" strokeWidth={2.4} />
            <Typography
              sx={{
                color: "#7A5F2A",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Founding team
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              color: "#1A1A1A",
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.7rem", md: "2.1rem" },
              fontWeight: 500,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              mb: 1.5,
            }}
          >
            Curated by the team behind{" "}
            <Box
              component="span"
              sx={{
                fontStyle: "italic",
                backgroundImage:
                  "linear-gradient(120deg, #9B7B3A 0%, #D4B07A 50%, #9B7B3A 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Thriving Dentist
            </Box>
            .
          </Typography>
          <Typography
            sx={{
              color: "#52525B",
              fontSize: { xs: "0.95rem", md: "1.02rem" },
              maxWidth: 580,
              mx: "auto",
              lineHeight: 1.55,
            }}
          >
            Every expert on the helpline, every vendor in the deals, every resource in the library — personally vetted by Gary and Naren. No algorithm. No marketing department.
          </Typography>
        </MotionBox>

        {/* Founder cards */}
        <Grid container spacing={2.5} sx={{ justifyContent: "center" }}>
          {FOUNDERS.map((f, i) => (
            <Grid key={f.name} size={{ xs: 12, md: 6 }}>
              <MotionBox
                initial={reduced ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                sx={{
                  position: "relative",
                  height: "100%",
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  bgcolor: "#FBF8F1",
                  border: "1px solid #E7E2D6",
                  transition:
                    "transform 280ms ease, border-color 280ms ease, box-shadow 280ms ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "#C9A876",
                    boxShadow:
                      "0 1px 2px rgba(20,20,20,0.04), 0 24px 50px -30px rgba(155,123,58,0.32)",
                  },
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ alignItems: { sm: "flex-start" }, height: "100%" }}>
                  {/* Photo with gold ring */}
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      borderRadius: "50%",
                      flexShrink: 0,
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, #C9A876 0%, #9B7B3A 100%)",
                      padding: "3px",
                      boxShadow:
                        "0 1px 2px rgba(20,20,20,0.06), 0 12px 28px -10px rgba(155,123,58,0.35)",
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
                        src={f.photo}
                        alt={f.name}
                        fill
                        sizes="(max-width: 600px) 100px, 120px"
                        style={{
                          objectFit: "cover",
                          objectPosition: "center top",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: "#1A1A1A",
                        fontFamily: "var(--font-display)",
                        fontSize: "1.4rem",
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        mb: 0.4,
                      }}
                    >
                      {f.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#9B7B3A",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        mb: 1.25,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {f.role}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#52525B",
                        fontSize: "0.92rem",
                        lineHeight: 1.6,
                        mb: 1.5,
                      }}
                    >
                      {f.bio}
                    </Typography>

                    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.85 }}>
                      {f.badges.map((badge) => (
                        <Box
                          key={badge}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.35,
                            borderRadius: 999,
                            bgcolor: "#FFFFFF",
                            border: "1px solid #E7E2D6",
                            color: "#52525B",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          {badge}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </MotionBox>
            </Grid>
          ))}
        </Grid>

        {/* Bottom trust strip */}
        <MotionBox
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          sx={{
            mt: { xs: 4, md: 5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 2.5,
            px: 3,
            py: 2,
            borderRadius: 2,
            bgcolor: "#FBF8F1",
            border: "1px solid #E7E2D6",
            maxWidth: 720,
            mx: "auto",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <BadgeCheck size={16} color="#9B7B3A" strokeWidth={2.2} />
            <Typography sx={{ color: "#52525B", fontSize: "0.84rem", fontWeight: 500 }}>
              Every expert vetted personally
            </Typography>
          </Stack>
          <Box sx={{ width: 1, height: 14, bgcolor: "#E7E2D6", display: { xs: "none", sm: "block" } }} />
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Mic size={15} color="#9B7B3A" strokeWidth={2.2} />
            <Typography sx={{ color: "#52525B", fontSize: "0.84rem", fontWeight: 500 }}>
              Hosts of 3 of the largest dental podcasts
            </Typography>
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  );
}
