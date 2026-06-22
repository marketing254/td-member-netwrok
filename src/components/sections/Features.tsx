"use client";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import {
  PhoneCall,
  Users,
  Handshake,
  Video,
  Ticket,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion.create(Box);

const FEATURES = [
  {
    Icon: PhoneCall,
    title: "Expert Hotline",
    body: "Bring any practice problem — get a written action plan plus the right experts to contact within 2–3 business days.",
  },
  {
    Icon: Handshake,
    title: "Exclusive partner savings",
    body: "Member-only deals on software, supplies and services from vetted DMN Partners.",
  },
  {
    Icon: Video,
    title: "A growing resource library",
    body: "New content every week — videos, action guides, checklists, worksheets and CE-ready kits.",
  },
  {
    Icon: Users,
    title: "A community of owners",
    body: "A searchable network of fellow practice owners who've solved what you're facing.",
  },
  {
    Icon: Ticket,
    title: "Live AMAs & CE events",
    body: "Inside-the-portal sessions with specialists across clinical, financial and marketing.",
  },
  {
    Icon: Wrench,
    title: "Templates & worksheets",
    body: "Proven checklists, SOPs and scripts you can deploy in your practice today.",
  },
];

export default function Features() {
  const reduced = useReducedMotion();

  return (
    <Box
      id="features"
      component="section"
      sx={{
        py: { xs: 7, md: 9 },
        bgcolor: "#FFFFFF",
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
            What is DMN?
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
            The membership is the product.
          </Typography>
          <Typography sx={{ color: "#52525B", fontSize: { xs: "0.95rem", md: "1.02rem" } }}>
            No four-figure upsells. No surprise coaching pitches.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {FEATURES.map((f, i) => {
            const Icon = f.Icon;
            return (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <MotionBox
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(i * 0.05, 0.3),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  sx={{
                    border: "1px solid #E4E4E7",
                    borderRadius: 2,
                    p: 2.5,
                    height: "100%",
                    transition: "border-color 200ms ease, box-shadow 200ms ease",
                    "&:hover": {
                      borderColor: "#9B7B3A",
                      boxShadow: "0 8px 30px rgba(14,42,61,0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 1.5,
                      bgcolor: "#FBF8F1",
                      color: "#7A5F2A",
                      display: "grid",
                      placeItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Icon size={20} strokeWidth={2.2} />
                  </Box>
                  <Typography
                    sx={{
                      color: "#1A1A1A",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      mb: 0.5,
                    }}
                  >
                    {f.title}
                  </Typography>
                  <Typography sx={{ color: "#52525B", fontSize: "0.9rem", lineHeight: 1.55 }}>
                    {f.body}
                  </Typography>
                </MotionBox>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
