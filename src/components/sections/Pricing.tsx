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
        py: { xs: 5, md: 7 },
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
        <SectionReveal variant="fade-up" sx={{ mb: { xs: 4, md: 5 } }}>
          <Stack
            spacing={1.25}
            sx={{ maxWidth: 680, mx: { md: "auto" }, textAlign: { md: "center" } }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#A07823", letterSpacing: "0.16em", fontSize: "0.72rem" }}
            >
              {pricingSection.eyebrow}
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
              {pricingSection.title}
            </Typography>
            <Typography
              sx={{
                color: "#3B4A55",
                maxWidth: 560,
                mx: { md: "auto" },
                fontSize: { xs: "0.95rem", md: "1rem" },
                lineHeight: 1.6,
              }}
            >
              {pricingSection.subtitle}
            </Typography>
          </Stack>
        </SectionReveal>

        <Grid container spacing={{ xs: 1.75, md: 2 }} sx={{ alignItems: "stretch" }}>
          {pricing.map((p, i) => {
            const isHighlight = p.highlight;
            return (
              <Grid key={p.tier} size={{ xs: 12, sm: 6, md: 4 }}>
                <MotionBox
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(i * 0.06, 0.25),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={reduced ? undefined : { y: -3 }}
                  sx={{
                    position: "relative",
                    height: "100%",
                    p: { xs: 2, md: 2.25 },
                    borderRadius: 3,
                    bgcolor: isHighlight ? "#0A1A2F" : "#FFFFFF",
                    color: isHighlight ? "#F6F1E7" : "#0A1A2F",
                    border: "1px solid",
                    borderColor: isHighlight
                      ? "rgba(217,168,75,0.4)"
                      : "rgba(14,42,61,0.1)",
                    boxShadow: isHighlight
                      ? "0 30px 60px -30px rgba(14,42,61,0.45), 0 0 0 1px rgba(217,168,75,0.22)"
                      : "0 8px 22px -14px rgba(14,42,61,0.1)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition:
                      "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms ease, border-color 320ms ease",
                    "&:hover": {
                      borderColor: isHighlight
                        ? "rgba(217,168,75,0.6)"
                        : "rgba(160,120,35,0.4)",
                      boxShadow: isHighlight
                        ? "0 36px 70px -30px rgba(217,168,75,0.35)"
                        : "0 22px 44px -22px rgba(14,42,61,0.16)",
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
                            "radial-gradient(60% 80% at 70% 0%, rgba(217,168,75,0.18) 0%, transparent 70%)",
                          pointerEvents: "none",
                        }}
                      />
                      <Box
                        aria-hidden
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: "10%",
                          right: "10%",
                          height: 2,
                          background:
                            "linear-gradient(90deg, transparent, rgba(240,193,110,0.9), transparent)",
                        }}
                      />
                    </>
                  )}

                  <Stack spacing={1.25} sx={{ position: "relative", flex: 1 }}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          component="h3"
                          sx={{
                            color: isHighlight ? "#F6F1E7" : "#0A1A2F",
                            fontFamily: "var(--font-display)",
                            fontSize: "1.15rem",
                            fontWeight: 500,
                            letterSpacing: "-0.01em",
                            lineHeight: 1.2,
                          }}
                        >
                          {p.tier}
                        </Typography>
                        {("audience" in p && p.audience) ? (
                          <Typography
                            sx={{
                              color: isHighlight ? "rgba(246,241,231,0.6)" : "#5C6770",
                              fontSize: "0.74rem",
                              mt: 0.4,
                            }}
                          >
                            {p.audience}
                          </Typography>
                        ) : null}
                      </Box>
                      {isHighlight && (
                        <Chip
                          label="FOUNDING"
                          size="small"
                          sx={{
                            bgcolor: "rgba(217,168,75,0.22)",
                            color: "#F0C16E",
                            border: "1px solid rgba(217,168,75,0.4)",
                            fontWeight: 700,
                            fontSize: "0.58rem",
                            letterSpacing: "0.12em",
                            height: 20,
                          }}
                        />
                      )}
                    </Stack>

                    <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.6 }}>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-display)",
                          fontSize: { xs: "1.6rem", md: "1.75rem" },
                          fontWeight: 500,
                          color: isHighlight ? "#F6F1E7" : "#0A1A2F",
                          lineHeight: 1,
                          letterSpacing: "-0.025em",
                        }}
                      >
                        {p.price}
                      </Typography>
                      {p.cadence && (
                        <Typography
                          sx={{
                            color: isHighlight ? "rgba(246,241,231,0.65)" : "#5C6770",
                            fontSize: "0.78rem",
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
                          color: isHighlight ? "rgba(240,193,110,0.85)" : "#A07823",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          mt: -0.5,
                        }}
                      >
                        {p.regularNote}
                      </Typography>
                    ) : null}

                    <Stack
                      spacing={0.75}
                      sx={{
                        flex: 1,
                        mt: 0.5,
                        pt: 1.5,
                        borderTop: "1px solid",
                        borderColor: isHighlight ? "rgba(246,241,231,0.12)" : "rgba(14,42,61,0.08)",
                      }}
                    >
                      {p.features.map((feat) => (
                        <Stack
                          key={feat}
                          direction="row"
                          spacing={0.75}
                          sx={{ alignItems: "flex-start" }}
                        >
                          <CheckRoundedIcon
                            sx={{
                              fontSize: 14,
                              color: isHighlight ? "#F0C16E" : "#A07823",
                              mt: "2px",
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{
                              color: isHighlight ? "rgba(246,241,231,0.88)" : "#0A1A2F",
                              fontSize: "0.8rem",
                              lineHeight: 1.5,
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
                      size="medium"
                      fullWidth
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        mt: 1.25,
                        py: 1,
                        fontSize: "0.85rem",
                        ...(isHighlight
                          ? {
                              boxShadow:
                                "0 14px 28px -12px rgba(217,168,75,0.5), 0 0 0 1px rgba(217,168,75,0.3) inset",
                            }
                          : {
                              borderColor: "rgba(14,42,61,0.18)",
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

        {pricingSection.bottomNote && (
          <Box sx={{ mt: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography
              sx={{
                color: "#5C6770",
                fontSize: "0.8rem",
                maxWidth: 580,
                mx: "auto",
                lineHeight: 1.5,
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
