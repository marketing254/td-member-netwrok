"use client";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion, useReducedMotion } from "framer-motion";
import SectionReveal from "@/components/effects/SectionReveal";
import { pricing, pricingSection } from "@/lib/content";

const MotionBox = motion.create(Box);

export default function Pricing() {
  const reduced = useReducedMotion();

  return (
    <Box
      id="pricing"
      component="section"
      sx={{
        position: "relative",
        py: { xs: 6, md: 9 },
        bgcolor: "#FFFFFF",
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
            "radial-gradient(45% 55% at 50% 0%, rgba(217,168,75,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <SectionReveal variant="fade-up" sx={{ mb: { xs: 5, md: 6 } }}>
          <Stack
            spacing={1.5}
            sx={{ maxWidth: 720, mx: { md: "auto" }, textAlign: { md: "center" } }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#A07823", letterSpacing: "0.18em", fontSize: "0.74rem" }}
            >
              {pricingSection.eyebrow}
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
              {pricingSection.title}
            </Typography>
            <Typography
              sx={{
                color: "#3B4A55",
                maxWidth: 580,
                mx: { md: "auto" },
                fontSize: { xs: "0.98rem", md: "1.05rem" },
                lineHeight: 1.65,
              }}
            >
              {pricingSection.subtitle}
            </Typography>
          </Stack>
        </SectionReveal>

        <Box sx={{ maxWidth: 980, mx: "auto", position: "relative" }}>
          <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ alignItems: "stretch" }}>
            {pricing.map((p, i) => {
              const isHighlight = p.highlight;
              return (
                <Grid key={p.tier} size={{ xs: 12, md: 6 }}>
                  <MotionBox
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 0.6,
                      delay: Math.min(i * 0.08, 0.18),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={reduced ? undefined : { y: -4 }}
                    sx={{
                      position: "relative",
                      height: "100%",
                      p: { xs: 3, md: 4 },
                      borderRadius: 4,
                      bgcolor: isHighlight ? "#0A1A2F" : "#FFFFFF",
                      color: isHighlight ? "#F6F1E7" : "#0A1A2F",
                      border: "1px solid",
                      borderColor: isHighlight
                        ? "rgba(217,168,75,0.45)"
                        : "rgba(14,42,61,0.1)",
                      boxShadow: isHighlight
                        ? "0 40px 80px -32px rgba(14,42,61,0.5), 0 0 0 1px rgba(217,168,75,0.25)"
                        : "0 12px 30px -18px rgba(14,42,61,0.12)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      transition:
                        "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 360ms ease, border-color 360ms ease",
                      "&:hover": {
                        borderColor: isHighlight
                          ? "rgba(217,168,75,0.7)"
                          : "rgba(160,120,35,0.45)",
                        boxShadow: isHighlight
                          ? "0 46px 90px -34px rgba(217,168,75,0.4)"
                          : "0 28px 56px -24px rgba(14,42,61,0.18)",
                      },
                    }}
                  >
                    {isHighlight && (
                      <>
                        <Box
                          aria-hidden
                          sx={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage:
                              "radial-gradient(65% 80% at 75% 0%, rgba(217,168,75,0.22) 0%, transparent 70%)",
                            pointerEvents: "none",
                          }}
                        />
                        <Box
                          aria-hidden
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: "8%",
                            right: "8%",
                            height: 2,
                            background:
                              "linear-gradient(90deg, transparent, rgba(240,193,110,0.95), transparent)",
                          }}
                        />
                      </>
                    )}

                    <Stack spacing={2} sx={{ position: "relative", flex: 1 }}>
                      <Stack
                        direction="row"
                        sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            component="h3"
                            sx={{
                              color: isHighlight ? "#F6F1E7" : "#0A1A2F",
                              fontFamily: "var(--font-display)",
                              fontSize: { xs: "1.35rem", md: "1.5rem" },
                              fontWeight: 500,
                              letterSpacing: "-0.015em",
                              lineHeight: 1.2,
                            }}
                          >
                            {p.tier}
                          </Typography>
                          {("audience" in p && p.audience) ? (
                            <Typography
                              sx={{
                                color: isHighlight ? "rgba(246,241,231,0.62)" : "#5C6770",
                                fontSize: "0.82rem",
                                mt: 0.5,
                              }}
                            >
                              {p.audience}
                            </Typography>
                          ) : null}
                        </Box>
                        {isHighlight ? (
                          <Chip
                            label="FOUNDING"
                            size="small"
                            sx={{
                              bgcolor: "rgba(217,168,75,0.22)",
                              color: "#F0C16E",
                              border: "1px solid rgba(217,168,75,0.42)",
                              fontWeight: 700,
                              fontSize: "0.62rem",
                              letterSpacing: "0.14em",
                              height: 22,
                            }}
                          />
                        ) : (
                          <Chip
                            label="PARTNER"
                            size="small"
                            sx={{
                              bgcolor: "rgba(14,42,61,0.06)",
                              color: "#3B4A55",
                              border: "1px solid rgba(14,42,61,0.1)",
                              fontWeight: 700,
                              fontSize: "0.62rem",
                              letterSpacing: "0.14em",
                              height: 22,
                            }}
                          />
                        )}
                      </Stack>

                      <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.8 }}>
                        <Typography
                          sx={{
                            fontFamily: "var(--font-display)",
                            fontSize: { xs: "2.4rem", md: "2.8rem" },
                            fontWeight: 500,
                            color: isHighlight ? "#F6F1E7" : "#0A1A2F",
                            lineHeight: 1,
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {p.price}
                        </Typography>
                        {p.cadence && (
                          <Typography
                            sx={{
                              color: isHighlight ? "rgba(246,241,231,0.68)" : "#5C6770",
                              fontSize: "0.88rem",
                              fontWeight: 500,
                            }}
                          >
                            {p.cadence}
                          </Typography>
                        )}
                      </Stack>

                      {("regularNote" in p && p.regularNote) ? (
                        <Typography
                          sx={{
                            color: isHighlight ? "rgba(240,193,110,0.88)" : "#A07823",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            mt: -1,
                          }}
                        >
                          {p.regularNote}
                        </Typography>
                      ) : null}

                      {p.blurb && (
                        <Typography
                          sx={{
                            color: isHighlight ? "rgba(246,241,231,0.78)" : "#3B4A55",
                            fontSize: "0.92rem",
                            lineHeight: 1.6,
                          }}
                        >
                          {p.blurb}
                        </Typography>
                      )}

                      <Stack
                        spacing={1.15}
                        sx={{
                          flex: 1,
                          mt: 1,
                          pt: 2,
                          borderTop: "1px solid",
                          borderColor: isHighlight ? "rgba(246,241,231,0.14)" : "rgba(14,42,61,0.08)",
                        }}
                      >
                        {p.features.map((feat) => (
                          <Stack
                            key={feat}
                            direction="row"
                            spacing={1.1}
                            sx={{ alignItems: "flex-start" }}
                          >
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                mt: "1px",
                                bgcolor: isHighlight ? "rgba(240,193,110,0.18)" : "rgba(217,168,75,0.12)",
                              }}
                            >
                              <CheckRoundedIcon
                                sx={{
                                  fontSize: 12,
                                  color: isHighlight ? "#F0C16E" : "#A07823",
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                color: isHighlight ? "rgba(246,241,231,0.92)" : "#0A1A2F",
                                fontSize: "0.88rem",
                                lineHeight: 1.55,
                              }}
                            >
                              {feat}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>

                      <Button
                        component={Link}
                        href={"ctaHref" in p && p.ctaHref ? p.ctaHref : "/#waitlist"}
                        variant={isHighlight ? "contained" : "outlined"}
                        color={isHighlight ? "secondary" : "primary"}
                        size="large"
                        fullWidth
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          mt: 2,
                          py: 1.4,
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          ...(isHighlight
                            ? {
                                boxShadow:
                                  "0 16px 32px -12px rgba(217,168,75,0.55), 0 0 0 1px rgba(217,168,75,0.3) inset",
                              }
                            : {
                                borderColor: "rgba(14,42,61,0.2)",
                                color: "#0A1A2F",
                                "&:hover": {
                                  borderColor: "#A07823",
                                  bgcolor: "rgba(217,168,75,0.06)",
                                },
                              }),
                        }}
                      >
                        {p.cta}
                      </Button>
                    </Stack>
                  </MotionBox>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {pricingSection.bottomNote && (
          <Box sx={{ mt: { xs: 4, md: 5 }, textAlign: "center" }}>
            <Typography
              sx={{
                color: "#5C6770",
                fontSize: "0.85rem",
                maxWidth: 620,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              {pricingSection.bottomNote}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
