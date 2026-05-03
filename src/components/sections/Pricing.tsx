"use client";
import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import { brand, pricing } from "@/lib/content";

export default function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="MEMBERSHIP"
      title="Four tiers. One promise."
      subtitle="Lifetime founding pricing for the first 1,000 owners. The membership is the product — the pricing is honest."
    >
      <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ alignItems: "stretch" }}>
        {pricing.map((p, i) => {
          const isHighlight = p.highlight;
          return (
            <Grid key={p.tier} size={{ xs: 12, sm: 6, md: 3 }}>
              <Reveal delay={i * 0.06}>
                <TiltCard intensity={isHighlight ? 5 : 3} style={{ height: "100%" }}>
                  <Card
                    sx={{
                      height: "100%",
                      position: "relative",
                      borderColor: isHighlight ? "transparent" : "divider",
                      borderWidth: isHighlight ? 0 : 1,
                      bgcolor: isHighlight ? "primary.main" : "background.paper",
                      backgroundImage: isHighlight
                        ? "linear-gradient(180deg, #1B4258 0%, #06182A 100%)"
                        : undefined,
                      color: isHighlight ? "common.white" : "text.primary",
                      transform: isHighlight ? { md: "translateY(-12px)" } : "none",
                      boxShadow: isHighlight
                        ? "0 50px 80px -40px rgba(14,42,61,0.55), 0 0 0 1px rgba(217,168,75,0.4)"
                        : "none",
                      overflow: "hidden",
                      "&:hover": {
                        borderColor: isHighlight ? "transparent" : "primary.main",
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
                              "radial-gradient(60% 50% at 100% 0%, rgba(217,168,75,0.22) 0%, transparent 60%)",
                            pointerEvents: "none",
                          }}
                        />
                        <Chip
                          label="MOST POPULAR"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            bgcolor: "secondary.main",
                            color: "primary.dark",
                            fontSize: "0.6875rem",
                            letterSpacing: "0.1em",
                            fontWeight: 700,
                          }}
                        />
                      </>
                    )}
                    <CardContent
                      sx={{
                        p: { xs: 3.5, md: 4 },
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}
                    >
                      <Stack spacing={2.5} sx={{ flex: 1 }}>
                        <Box>
                          <Typography
                            variant="overline"
                            sx={{
                              color: isHighlight ? "secondary.light" : "text.secondary",
                              letterSpacing: "0.16em",
                            }}
                          >
                            {p.tier.toUpperCase()}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "baseline" }}>
                            <Typography
                              variant="h2"
                              sx={{
                                fontSize: { xs: "2.75rem", md: "3.25rem" },
                                color: isHighlight ? "common.white" : "text.primary",
                              }}
                            >
                              {p.price}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: isHighlight ? "rgba(255,255,255,0.7)" : "text.secondary" }}
                            >
                              {p.cadence}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1.5,
                              color: isHighlight ? "rgba(255,255,255,0.78)" : "text.secondary",
                            }}
                          >
                            {p.blurb}
                          </Typography>
                        </Box>

                        <Box sx={{ height: "1px", bgcolor: isHighlight ? "rgba(255,255,255,0.12)" : "divider" }} />

                        <Stack spacing={1.5} sx={{ flex: 1 }}>
                          {p.features.map((f) => (
                            <Stack key={f} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 999,
                                  bgcolor: isHighlight ? "secondary.main" : "rgba(14,42,61,0.08)",
                                  color: isHighlight ? "primary.dark" : "primary.main",
                                  display: "grid",
                                  placeItems: "center",
                                  flexShrink: 0,
                                  mt: "2px",
                                  "& svg": { fontSize: 14 },
                                }}
                              >
                                <CheckIcon />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isHighlight ? "rgba(255,255,255,0.92)" : "text.primary",
                                  fontSize: "0.9375rem",
                                }}
                              >
                                {f}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <Button
                          href={brand.joinUrl}
                          variant={isHighlight ? "contained" : "outlined"}
                          color={isHighlight ? "secondary" : "primary"}
                          fullWidth
                          size="large"
                          sx={{ mt: 1 }}
                        >
                          {p.cta}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </TiltCard>
              </Reveal>
            </Grid>
          );
        })}
      </Grid>

      <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center", mt: { xs: 5, md: 7 } }}>
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 540 }}>
          30-day money-back guarantee on every paid tier. Cancel anytime. Founding-member rate is locked for the life of
          the current product.
        </Typography>
      </Stack>
    </Section>
  );
}
