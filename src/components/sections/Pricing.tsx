"use client";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion.create(Box);

const VALUE_STACK = [
  { label: "24/7 expert helpline", value: "$2,400/yr" },
  { label: "Vendor savings access", value: "$6,000+/yr" },
  { label: "Content & kit library", value: "$1,200/yr" },
  { label: "Monthly live AMAs", value: "$1,800/yr" },
  { label: "Systems, SOPs & templates", value: "$900/yr" },
];

const PLAN_BULLETS = [
  "Everything in the value stack",
  "Price locked forever — never increases",
  "Annual option: $490/yr (2 months free)",
  "Founding-member badge in the directory",
];

export default function Pricing() {
  const reduced = useReducedMotion();

  return (
    <Box
      id="pricing"
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
            Founding offer
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
            Everything, for less than a lab case a month.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Value stack */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MotionBox
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: 2,
                p: { xs: 2.5, md: 3 },
                height: "100%",
              }}
            >
              <Typography
                sx={{
                  color: "#1A1A1A",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  mb: 0.5,
                }}
              >
                What you&apos;re actually getting
              </Typography>
              <Typography sx={{ color: "#52525B", fontSize: "0.85rem", mb: 2 }}>
                Priced separately, this is what it would cost:
              </Typography>

              <Stack>
                {VALUE_STACK.map((item, i) => (
                  <Stack
                    key={item.label}
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      py: 1.25,
                      borderBottom: i < VALUE_STACK.length - 1 ? "1px dashed #E4E4E7" : "none",
                      fontSize: "0.92rem",
                    }}
                  >
                    <Typography sx={{ color: "#1A1A1A", fontSize: "0.92rem" }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: "#1A1A1A", fontWeight: 700, fontSize: "0.92rem" }}>
                      {item.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  mt: 2,
                  pt: 1.75,
                  borderTop: "2px solid #1A1A1A",
                  fontWeight: 800,
                }}
              >
                <Typography sx={{ color: "#1A1A1A", fontWeight: 800, fontSize: "1rem" }}>
                  Total value
                </Typography>
                <Typography sx={{ color: "#1A1A1A", fontWeight: 800, fontSize: "1rem" }}>
                  $12,300/yr
                </Typography>
              </Stack>
            </MotionBox>
          </Grid>

          {/* Plan card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MotionBox
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              sx={{
                position: "relative",
                bgcolor: "#1A1A1A",
                color: "#FFFFFF !important",
                borderRadius: 2,
                p: { xs: 3, md: 3.5 },
                height: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: "#1A1A1A",
                  color: "#FFFFFF !important",
                  px: 1.75,
                  py: 0.65,
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  whiteSpace: "nowrap",
                }}
              >
                First 100 only · locked for life
              </Box>

              <Typography
                sx={{
                  color: "#A8A29E",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontSize: "0.76rem",
                  mb: 0.65,
                  mt: 1,
                }}
              >
                Founding member
              </Typography>

              <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.65 }}>
                <Typography
                  sx={{
                    color: "#FFFFFF",
                    fontFamily: "var(--font-display)",
                    fontSize: "3.2rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  $49
                </Typography>
                <Typography sx={{ color: "#A8A29E", fontSize: "1.05rem", fontWeight: 600 }}>
                  /mo
                </Typography>
              </Stack>

              <Typography sx={{ color: "#A8A29E", mt: 0.65, fontSize: "0.92rem" }}>
                <Box
                  component="span"
                  sx={{
                    textDecoration: "line-through",
                    mr: 0.5,
                  }}
                >
                  $199/mo
                </Box>
                after the first 100 spots fill
              </Typography>

              <Stack spacing={1} sx={{ my: 2.5 }}>
                {PLAN_BULLETS.map((b) => (
                  <Stack key={b} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                    <Box
                      component="span"
                      sx={{
                        color: "#C9A876",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </Box>
                    <Typography sx={{ color: "#E7E2D6", fontSize: "0.95rem", lineHeight: 1.5 }}>
                      {b}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Button
                component={Link}
                href="#waitlist"
                fullWidth
                endIcon={<ArrowRight size={16} />}
                sx={{
                  py: 1.35,
                  fontSize: "0.94rem",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#1A1A1A",
                  color: "#FFFFFF !important",
                  "&:hover": { bgcolor: "#2A2A2A" },
                }}
              >
                Claim my founding spot
              </Button>

              <Typography
                sx={{
                  color: "#A8A29E",
                  fontSize: "0.78rem",
                  textAlign: "center",
                  mt: 1.5,
                }}
              >
                No payment today · billed only on launch day · cancel anytime
              </Typography>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
