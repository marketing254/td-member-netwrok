"use client";
import { useRef } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { brand, founding } from "@/lib/content";

const MotionBox = motion.create(Box);
const SPRING = { stiffness: 80, damping: 20, mass: 0.6 };

const proofPoints = [
  { value: "2 hrs", label: "Median first response" },
  { value: "$6.4K", label: "Average first-year savings" },
  { value: "500+", label: "Practice owners in the room" },
];

const liveCases = [
  { title: "PPO renegotiation for a two-location office", status: "Matched with vendor specialist" },
  { title: "Associate compensation redesign", status: "Call scheduled for today" },
  { title: "Front-desk turnover plan", status: "Written playbook in progress" },
];

export default function Hero() {
  const claimedPct = (founding.spotsClaimed / founding.totalSpots) * 100;
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const sx = useSpring(mouseX, SPRING);
  const sy = useSpring(mouseY, SPRING);
  const panelX = useTransform(sx, (value) => value * 18);
  const panelY = useTransform(sy, (value) => value * 20);
  const floatUp = useTransform(sy, (value) => value * -14);
  const floatAcross = useTransform(sx, (value) => value * 14);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - bounds.left) / bounds.width - 0.5);
    mouseY.set((e.clientY - bounds.top) / bounds.height - 0.5);
  };

  return (
    <Box
      id="top"
      ref={ref}
      onMouseMove={onMouseMove}
      component="section"
      className="grain"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 10, md: 14 },
        pb: { xs: 10, md: 16 },
        backgroundImage: "linear-gradient(180deg, #06182A 0%, #0A2236 55%, #0E2A3D 100%)",
        color: "common.white",
      }}
    >
      <Box className="aurora" aria-hidden />

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 35%, black 30%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Grid container spacing={{ xs: 7, md: 8 }} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3.5} sx={{ maxWidth: 660 }}>
              <MotionBox
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Chip
                  label={`FOUNDING MEMBERSHIP - FIRST ${founding.totalSpots.toLocaleString("en-US")} ONLY`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(217,168,75,0.14)",
                    color: "secondary.light",
                    border: "1px solid rgba(217,168,75,0.35)",
                    fontSize: "0.6875rem",
                    px: 1.25,
                    backdropFilter: "blur(8px)",
                  }}
                />
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Typography variant="h1" component="h1" sx={{ color: "common.white", maxWidth: 620 }}>
                  The only network with a{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(180deg, #F0C16E 0%, #D9A84B 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    human expert
                  </Box>{" "}
                  on the line for every practice problem.
                </Typography>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    maxWidth: 600,
                    color: "rgba(255,255,255,0.78)",
                    fontSize: { xs: "1.0625rem", md: "1.2rem" },
                    lineHeight: 1.6,
                  }}
                >
                  Built for US dental practice owners who want fast answers, measurable vendor savings, and a peer
                  room full of operators who have already solved the problem in front of you.
                </Typography>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.75}>
                  <Button
                    href={brand.joinUrl}
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Claim founding spot - ${founding.priceMonthly}/mo
                  </Button>
                  <Button
                    href="#preview"
                    variant="outlined"
                    size="large"
                    sx={{
                      color: "common.white",
                      borderColor: "rgba(255,255,255,0.25)",
                      bgcolor: "rgba(255,255,255,0.04)",
                      backdropFilter: "blur(8px)",
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.6)",
                        bgcolor: "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    See the member workspace
                  </Button>
                </Stack>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Grid container spacing={1.5} sx={{ maxWidth: 640 }}>
                  {proofPoints.map((item) => (
                    <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2.25,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "common.white",
                            fontFamily: "var(--font-display)",
                            fontSize: "1.5rem",
                            lineHeight: 1,
                            mb: 0.75,
                          }}
                        >
                          {item.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.62)", fontSize: "0.8125rem" }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                sx={{ maxWidth: 640 }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "common.white", fontWeight: 600 }}>
                      {founding.spotsClaimed.toLocaleString("en-US")} of{" "}
                      {founding.totalSpots.toLocaleString("en-US")} founding spots claimed
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                      {Math.round(claimedPct)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={claimedPct}
                    sx={{
                      height: 6,
                      borderRadius: 999,
                      bgcolor: "rgba(255,255,255,0.08)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        backgroundImage: "linear-gradient(90deg, #D9A84B 0%, #F0C16E 100%)",
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1.5,
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    No four-figure upsells. No surprise coaching pitches. The membership is the product.
                  </Typography>
                </Box>
              </MotionBox>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <MotionBox
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              style={reduced ? undefined : { x: panelX, y: panelY }}
              sx={{ position: "relative", maxWidth: 500, mx: "auto" }}
            >
              <motion.div style={reduced ? undefined : { x: floatAcross, y: floatUp }}>
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    position: "absolute",
                    top: 26,
                    right: -24,
                    zIndex: 2,
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.4,
                    py: 1.1,
                    borderRadius: 999,
                    bgcolor: "rgba(240,193,110,0.96)",
                    color: "primary.dark",
                    border: "1px solid rgba(240,193,110,0.65)",
                    boxShadow: "0 28px 48px -28px rgba(217,168,75,0.7)",
                  }}
                >
                  <PhoneInTalkOutlinedIcon sx={{ fontSize: 18 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.72rem", opacity: 0.78 }}>
                      Typical callback
                    </Typography>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>12 minutes</Typography>
                  </Box>
                </Box>
              </motion.div>

              <motion.div style={reduced ? undefined : { x: floatUp, y: floatAcross }}>
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    position: "absolute",
                    left: -34,
                    bottom: 38,
                    zIndex: 2,
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.4,
                    py: 1.1,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "common.white",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(14px)",
                    boxShadow: "0 28px 48px -32px rgba(0,0,0,0.55)",
                  }}
                >
                  <GroupsOutlinedIcon sx={{ fontSize: 18, color: "secondary.light" }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.62)" }}>
                      Community online
                    </Typography>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.1 }}>68 operators active</Typography>
                  </Box>
                </Box>
              </motion.div>

              <Box
                sx={{
                  p: { xs: 2.25, md: 3 },
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(18px)",
                  boxShadow: "0 50px 90px -40px rgba(0,0,0,0.65)",
                }}
              >
                <Stack spacing={2.25}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="overline" sx={{ color: "secondary.light", display: "block" }}>
                        MEMBER DESK
                      </Typography>
                      <Typography variant="h4" sx={{ color: "common.white", mt: 0.5 }}>
                        Today&apos;s operator queue
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.2,
                        py: 0.65,
                        borderRadius: 999,
                        bgcolor: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.76)", fontWeight: 600 }}>
                        Live
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      p: 2.25,
                      borderRadius: 3.5,
                      bgcolor: "rgba(255,255,255,0.96)",
                      border: "1px solid rgba(224,218,206,0.75)",
                    }}
                  >
                    <Stack spacing={1.25}>
                      {liveCases.map((item, index) => (
                        <Box
                          key={item.title}
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: index === 0 ? "rgba(14,42,61,0.05)" : "grey.50",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.95rem" }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem", mt: 0.5 }}>
                            {item.status}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", mb: 1 }}>
                          <SavingsOutlinedIcon sx={{ color: "secondary.light", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                            Savings this quarter
                          </Typography>
                        </Stack>
                        <Typography sx={{ color: "common.white", fontWeight: 700, fontSize: "1.4rem" }}>
                          $2,140 captured
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <Stack direction="row" spacing={1.2} sx={{ alignItems: "center", mb: 1 }}>
                          <SupportAgentOutlinedIcon sx={{ color: "secondary.light", fontSize: 20 }} />
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.64)" }}>
                            Expert bench
                          </Typography>
                        </Stack>
                        <Typography sx={{ color: "common.white", fontWeight: 700, fontSize: "1.4rem" }}>
                          14 specialists on call
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
