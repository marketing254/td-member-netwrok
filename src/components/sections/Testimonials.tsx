"use client";
import { Avatar, Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import StarIcon from "@mui/icons-material/Star";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import TiltCard from "@/components/TiltCard";
import { testimonials } from "@/lib/content";

const stats = ["$150K saved", "50% faster HR", "$40K vendor savings"];

export default function Testimonials() {
  return (
    <Section
      id="stories"
      eyebrow="REAL OUTCOMES"
      title="What practice owners actually say."
      subtitle="Outcomes verified in member 1:1 reviews. Names redacted by request in some cases."
      background="alt"
    >
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {testimonials.map((t, i) => (
          <Grid key={t.name} size={{ xs: 12, md: 4 }}>
            <Reveal delay={i * 0.06}>
              <TiltCard intensity={3} style={{ height: "100%" }}>
                <Card
                  sx={{
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    p: 0.5,
                    transition: "border-color 220ms, transform 220ms",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <CardContent sx={{ p: { xs: 3.5, md: 4 }, height: "100%", display: "flex", flexDirection: "column" }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <FormatQuoteIcon
                        sx={{ color: "secondary.main", fontSize: 36, transform: "rotate(180deg)", opacity: 0.9 }}
                      />
                      <Stack direction="row" spacing={0.25}>
                        {[...Array(5)].map((_, k) => (
                          <StarIcon key={k} sx={{ color: "secondary.main", fontSize: 14 }} />
                        ))}
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        display: "inline-block",
                        bgcolor: "rgba(217,168,75,0.14)",
                        color: "secondary.dark",
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 999,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        alignSelf: "flex-start",
                        mb: 2.5,
                      }}
                    >
                      {stats[i]}
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{ color: "text.primary", fontSize: "1.0625rem", lineHeight: 1.6, mb: 4, flex: 1 }}
                    >
                      &ldquo;{t.quote}&rdquo;
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          color: "secondary.main",
                          fontWeight: 600,
                          fontFamily: "var(--font-display)",
                          width: 44,
                          height: 44,
                        }}
                      >
                        {t.initials}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                          {t.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                          {t.practice}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </TiltCard>
            </Reveal>
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}
