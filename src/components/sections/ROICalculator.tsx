"use client";
import { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion.create(Box);

function money(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export default function ROICalculator() {
  const reduced = useReducedMotion();
  const [categories, setCategories] = useState(4);
  const [spend, setSpend] = useState(8000);

  // Savings model from HTML reference
  const annualSpend = spend * 12;
  const savings = annualSpend * 0.06 * (categories / 8) + categories * 350;
  const net = savings - 588;
  const roi = savings / 588;

  return (
    <Box
      id="calc"
      component="section"
      sx={{
        py: { xs: 7, md: 9 },
        bgcolor: "#1A1A1A",
        color: "#FFFFFF",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1.5}>
              <Typography
                sx={{
                  color: "#C9A876",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Do the math
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: "#FFFFFF",
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "1.65rem", md: "2.1rem" },
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                It pays for itself with one vendor deal.
              </Typography>
              <Typography sx={{ color: "#D4CDB8", fontSize: { xs: "0.95rem", md: "1.02rem" } }}>
                At $49/mo ($588/yr), most members recoup the cost in the first quarter. Move the sliders to see your number.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MotionBox
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              sx={{
                bgcolor: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: 3,
                p: { xs: 2.5, md: 3 },
              }}
            >
              <Stack spacing={2.5}>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ color: "#D4CDB8", fontSize: "0.84rem" }}>
                      Vendor categories you buy from
                    </Typography>
                    <Typography sx={{ color: "#C9A876", fontWeight: 700, fontSize: "0.9rem" }}>
                      {categories}
                    </Typography>
                  </Stack>
                  <Slider
                    value={categories}
                    onChange={(_, v) => setCategories(v as number)}
                    min={1}
                    max={8}
                    step={1}
                    sx={{
                      color: "#9B7B3A",
                      "& .MuiSlider-thumb": {
                        bgcolor: "#FFFFFF",
                        border: "2px solid #9B7B3A",
                        width: 18,
                        height: 18,
                      },
                      "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.15)" },
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ color: "#D4CDB8", fontSize: "0.84rem" }}>
                      Monthly supply &amp; lab spend
                    </Typography>
                    <Typography sx={{ color: "#C9A876", fontWeight: 700, fontSize: "0.9rem" }}>
                      {money(spend)}
                    </Typography>
                  </Stack>
                  <Slider
                    value={spend}
                    onChange={(_, v) => setSpend(v as number)}
                    min={2000}
                    max={25000}
                    step={500}
                    sx={{
                      color: "#9B7B3A",
                      "& .MuiSlider-thumb": {
                        bgcolor: "#FFFFFF",
                        border: "2px solid #9B7B3A",
                        width: 18,
                        height: 18,
                      },
                      "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.15)" },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    bgcolor: "#0A0A0A",
                    borderRadius: 2,
                    p: 2.25,
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ color: "#A8A29E", fontSize: "0.78rem", mb: 0.5 }}>
                    Estimated first-year net benefit
                  </Typography>
                  <Typography
                    sx={{
                      color: "#C9A876",
                      fontFamily: "var(--font-display)",
                      fontSize: { xs: "2rem", md: "2.4rem" },
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {money(net)}
                  </Typography>
                  <Typography sx={{ color: "#A8A29E", fontSize: "0.78rem", mt: 0.75 }}>
                    That&rsquo;s a {roi.toFixed(1)}× return on your $588 membership.
                  </Typography>
                </Box>
              </Stack>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
