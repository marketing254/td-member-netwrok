"use client";
import { useMemo, useState } from "react";
import { Box, Card, CardContent, Grid, Slider, Stack, Typography } from "@mui/material";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import Section from "@/components/Section";
import { founding } from "@/lib/content";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function SavingsCalculator() {
  const [revenue, setRevenue] = useState(1_200_000);
  const [staff, setStaff] = useState(8);

  const { annualSavings, monthlyCost, paybackDays } = useMemo(() => {
    const supplyBase = revenue * 0.06;
    const supplySavings = supplyBase * 0.18;
    const softwareSavings = staff * 480;
    const insuranceSavings = staff * 220;
    const annualSavings = supplySavings + softwareSavings + insuranceSavings;
    const monthlyCost = founding.priceMonthly * 12;
    const paybackDays = Math.max(1, Math.round((monthlyCost / annualSavings) * 365));
    return { annualSavings, monthlyCost, paybackDays };
  }, [revenue, staff]);

  return (
    <Section
      id="savings"
      eyebrow="DOES THE MATH WORK?"
      title="Your membership pays for itself in days, not months."
      subtitle="Move the sliders to estimate your network savings — based on average member outcomes across supplies, software, and insurance."
    >
      <Card
        sx={{
          maxWidth: 1080,
          mx: "auto",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Grid container>
          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Stack spacing={5}>
                <Box>
                  <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between" }}>
                    <Typography variant="overline" sx={{ color: "text.secondary" }}>
                      Annual practice revenue
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {fmt(revenue)}
                    </Typography>
                  </Stack>
                  <Slider
                    value={revenue}
                    min={250_000}
                    max={5_000_000}
                    step={50_000}
                    onChange={(_, v) => setRevenue(v as number)}
                    sx={{ color: "primary.main" }}
                  />
                  <Stack direction="row" sx={{ mt: 0.5, justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      $250K
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      $5M
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between" }}>
                    <Typography variant="overline" sx={{ color: "text.secondary" }}>
                      Team size
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {staff} {staff === 1 ? "person" : "people"}
                    </Typography>
                  </Stack>
                  <Slider
                    value={staff}
                    min={2}
                    max={25}
                    step={1}
                    onChange={(_, v) => setStaff(v as number)}
                    sx={{ color: "primary.main" }}
                  />
                  <Stack direction="row" sx={{ mt: 0.5, justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      2
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      25
                    </Typography>
                  </Stack>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  divider={<Box sx={{ width: { sm: "1px" }, height: { xs: "1px", sm: 40 }, bgcolor: "divider" }} />}
                >
                  <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Supplies
                    </Typography>
                    <Typography variant="h5" sx={{ color: "text.primary" }}>
                      {fmt(revenue * 0.06 * 0.18)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Software
                    </Typography>
                    <Typography variant="h5" sx={{ color: "text.primary" }}>
                      {fmt(staff * 480)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Insurance
                    </Typography>
                    <Typography variant="h5" sx={{ color: "text.primary" }}>
                      {fmt(staff * 220)}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "common.white",
                p: { xs: 4, md: 6 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(60% 60% at 100% 0%, rgba(201,154,58,0.18) 0%, rgba(201,154,58,0) 60%)",
                }}
              />
              <Stack spacing={1.5} sx={{ position: "relative" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <TrendingUpOutlinedIcon sx={{ color: "secondary.main" }} />
                  <Typography variant="overline" sx={{ color: "secondary.main" }}>
                    ESTIMATED YEAR-1 SAVINGS
                  </Typography>
                </Stack>
                <Typography
                  variant="h2"
                  sx={{
                    color: "common.white",
                    fontFamily: "var(--font-display)",
                    fontSize: { xs: "2.75rem", md: "3.5rem" },
                  }}
                >
                  {fmt(annualSavings)}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  Based on average member outcomes across vendor partnerships.
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={3}
                sx={{ position: "relative", pt: 4, borderTop: "1px solid rgba(255,255,255,0.15)", mt: 4 }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Membership cost
                  </Typography>
                  <Typography variant="h5" sx={{ color: "common.white" }}>
                    {fmt(monthlyCost)}/yr
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Pays for itself in
                  </Typography>
                  <Typography variant="h5" sx={{ color: "secondary.main" }}>
                    {paybackDays} days
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Section>
  );
}
