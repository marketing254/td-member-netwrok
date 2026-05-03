"use client";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import Section from "@/components/Section";
import { cadence } from "@/lib/content";

export default function Cadence() {
  return (
    <Section
      eyebrow="CONTENT CALENDAR"
      title="What lands in your inbox every month."
      subtitle="A published rhythm. No 'sometimes,' no 'maybe.' We commit to the calendar so you can plan against it."
    >
      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {cadence.map((c) => (
          <Grid key={c.unit} size={{ xs: 6, md: 3 }}>
            <Card sx={{ height: "100%", p: 0.5 }}>
              <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                <Stack spacing={1.25}>
                  <Typography
                    variant="h2"
                    sx={{
                      color: "primary.main",
                      fontSize: { xs: "2.75rem", md: "3.25rem" },
                      lineHeight: 1,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {c.count}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "text.primary", textTransform: "lowercase" }}>
                    {c.unit}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {c.note}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box
        sx={{
          mt: { xs: 4, md: 6 },
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          bgcolor: "grey.50",
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
          maxWidth: 720,
          mx: "auto",
        }}
      >
        <Typography variant="body1" sx={{ color: "text.primary", fontStyle: "italic" }}>
          &ldquo;A promise calendar converts skeptics. Empty calendars promise empty inboxes.&rdquo;
        </Typography>
      </Box>
    </Section>
  );
}
