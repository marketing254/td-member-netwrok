"use client";
import Image from "next/image";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { Mic, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { asHeardOn } from "@/lib/content";

const MotionBox = motion.create(Box);

const TESTIMONIALS = [
  {
    initials: "DR",
    name: "Dr. Dana R.",
    practice: "Riverside Dental · Austin, TX",
    quote:
      "I sent one helpline question about PPO fees and the answer paid for a year of membership in a single afternoon's worth of negotiation.",
  },
  {
    initials: "MP",
    name: "Dr. Marcus P.",
    practice: "Lakeshore Family Dental · OH",
    quote:
      "The vendor deals alone saved us about $7,400 this year. The fact there's a real person to ask is what made me stay.",
  },
  {
    initials: "SK",
    name: "Dr. Sarah K.",
    practice: "Bright Smile Studio · CO",
    quote:
      "As a solo doc I felt isolated. Now I have 500 owners and an expert a message away. No upsells, no nonsense.",
  },
];

export default function SocialProof() {
  const reduced = useReducedMotion();

  return (
    <Box
      id="proof"
      component="section"
      sx={{
        py: { xs: 7, md: 9 },
        bgcolor: "#F8F5EE",
        borderTop: "1px solid #E4E4E7",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.25} sx={{ textAlign: "center", maxWidth: 680, mx: "auto", mb: { xs: 4, md: 5 } }}>
          <Typography
            sx={{
              color: "#7A5F2A",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Members
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: "#1A1A1A",
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.65rem", md: "2.1rem" },
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Practice owners who got their time back
          </Typography>
          <Typography sx={{ color: "#52525B", fontSize: { xs: "0.95rem", md: "1.02rem" } }}>
            Early founding members from the Thriving Dentist & Less Insurance Dependence communities.
          </Typography>
        </Stack>

        <Grid container spacing={2.5} sx={{ mb: { xs: 4, md: 5 } }}>
          {TESTIMONIALS.map((t, i) => (
            <Grid key={t.name} size={{ xs: 12, md: 4 }}>
              <MotionBox
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                sx={{
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                  borderRadius: 2,
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 200ms ease, transform 200ms ease",
                  "&:hover": {
                    borderColor: "#9B7B3A",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Stack direction="row" spacing={0.4} sx={{ mb: 1.25, color: "#1A1A1A" }}>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} size={14} fill="#1A1A1A" strokeWidth={0} />
                  ))}
                </Stack>
                <Typography
                  sx={{
                    color: "#1A1A1A",
                    fontSize: "0.94rem",
                    lineHeight: 1.55,
                    mb: 2,
                    flex: 1,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </Typography>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #9B7B3A 0%, #1A1A1A 100%)",
                      color: "#FFFFFF",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      flexShrink: 0,
                    }}
                  >
                    {t.initials}
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#1A1A1A", fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.2 }}>
                      {t.name}
                    </Typography>
                    <Typography sx={{ color: "#52525B", fontSize: "0.78rem", mt: 0.2 }}>
                      {t.practice}
                    </Typography>
                  </Box>
                </Stack>
              </MotionBox>
            </Grid>
          ))}
        </Grid>

        {/* AS HEARD ON — infinite marquee with podcast and partner logos */}
        <MotionBox
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Eyebrow */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "center", mb: 2.5 }}>
            <Mic size={13} color="#52525B" strokeWidth={2.2} />
            <Typography
              sx={{
                color: "#52525B",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              As heard on
            </Typography>
          </Stack>

          {/* Marquee — duplicates the logo set 3× so the loop is seamless */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderTop: "1px solid #E7E2D6",
              borderBottom: "1px solid #E7E2D6",
              py: 1,
              // Soft fade masks on the edges
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <motion.div
              animate={reduced ? undefined : { x: ["0%", "-33.333%"] }}
              transition={{
                duration: 32,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                width: "fit-content",
              }}
            >
              {[...asHeardOn, ...asHeardOn, ...asHeardOn].map((podcast, idx) => (
                <Stack
                  key={`${podcast.name}-${idx}`}
                  direction="row"
                  spacing={2.5}
                  sx={{
                    alignItems: "center",
                    flexShrink: 0,
                    px: { xs: 3, sm: 4, md: 5 },
                    py: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 110, md: 145 },
                      height: { xs: 38, md: 48 },
                      filter: "grayscale(0.45) opacity(0.8)",
                      transition: "filter 220ms ease",
                      "&:hover": { filter: "grayscale(0) opacity(1)" },
                    }}
                  >
                    <Image
                      src={podcast.logo}
                      alt={podcast.name}
                      fill
                      sizes="145px"
                      style={{ objectFit: "contain", objectPosition: "center" }}
                    />
                  </Box>
                  {/* Small gold separator dot between logos */}
                  <Box
                    aria-hidden
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor: "rgba(155,123,58,0.35)",
                      display: { xs: "none", sm: "block" },
                    }}
                  />
                </Stack>
              ))}
            </motion.div>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}
