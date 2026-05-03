"use client";
import { Box, Grid, Stack, Typography } from "@mui/material";
import Section from "@/components/Section";
import { sla } from "@/lib/content";

export default function SLA() {
  return (
    <Section
      id="sla"
      eyebrow="HOTLINE SLA"
      title="A promise we publish because we measure it."
      subtitle="Every hotline case has a service level agreement attached. Miss it once, and we will tell you before you have to ask."
      background="ink"
    >
      <Grid container spacing={{ xs: 3, md: 4 }} sx={{ maxWidth: 1080, mx: "auto" }}>
        {sla.map((item) => (
          <Grid key={item.label} size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.02)",
                height: "100%",
              }}
            >
              <Stack spacing={2}>
                <Typography
                  variant="h2"
                  sx={{
                    color: "secondary.main",
                    fontFamily: "var(--font-display)",
                    fontSize: { xs: "3rem", md: "3.75rem" },
                    lineHeight: 1,
                  }}
                >
                  {item.stat}
                </Typography>
                <Typography variant="h5" sx={{ color: "common.white" }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>
                  {item.detail}
                </Typography>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Section>
  );
}
