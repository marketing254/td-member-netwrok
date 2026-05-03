"use client";
import { Box, Card, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import Reveal from "@/components/Reveal";

const tabs = [
  { label: "Library", icon: <MenuBookOutlinedIcon /> },
  { label: "Directory", icon: <GroupsOutlinedIcon /> },
  { label: "Vendors", icon: <HandshakeOutlinedIcon /> },
  { label: "Hotline", icon: <PhoneInTalkOutlinedIcon /> },
];

export default function ProductPreview() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const tilt = useTransform(scrollYProgress, [0, 0.4, 0.8], [10, 0, -6]);
  const tiltSpring = useSpring(tilt, { stiffness: 60, damping: 20 });
  const finalTilt = reduced ? 0 : tiltSpring;

  return (
    <Box
      id="preview"
      component="section"
      ref={ref}
      style={{ position: "relative" }}
      sx={{
        py: { xs: 7, md: 10 },
        overflow: "hidden",
        bgcolor: "grey.50",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(40% 30% at 80% 20%, rgba(217,168,75,0.18) 0%, transparent 70%), radial-gradient(35% 30% at 10% 90%, rgba(14,42,61,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Reveal>
          <Stack spacing={2.5} sx={{ alignItems: "center", textAlign: "center", maxWidth: 760, mx: "auto", mb: { xs: 6, md: 9 } }}>
            <Typography variant="overline" sx={{ color: "secondary.dark" }}>
              INSIDE THE NETWORK
            </Typography>
            <Typography variant="h2" component="h2">
              One workspace. Every operator&apos;s toolkit.
            </Typography>
            <Typography variant="subtitle1">
              Library, directory, vendors, and the hotline — all behind one login. No tab roulette, no integration glue.
            </Typography>
          </Stack>
        </Reveal>

        <motion.div
          style={{
            perspective: 2200,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.div
            style={{
              rotateX: finalTilt,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <BrowserFrame />
          </motion.div>
        </motion.div>

        <Grid container spacing={2} sx={{ mt: { xs: 6, md: 10 } }}>
          {[
            { title: "Single sign-on", body: "One login from thrivingdentist.com to the members area." },
            { title: "Real-time hotline", body: "Submit, track, get a written summary — all in-app." },
            { title: "Vendor admin", body: "See what you saved, redeem in one click, share with the team." },
            { title: "Direct messages", body: "Reach 500+ practice owners by city, specialty, or revenue band." },
          ].map((c, i) => (
            <Grid key={c.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Reveal delay={i * 0.06}>
                <Stack spacing={1.25}>
                  <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: "secondary.main" }} />
                  <Typography variant="h5" sx={{ color: "text.primary" }}>
                    {c.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {c.body}
                  </Typography>
                </Stack>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function BrowserFrame() {
  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        boxShadow:
          "0 50px 100px -40px rgba(14,42,61,0.45), 0 30px 60px -30px rgba(14,42,61,0.25)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          bgcolor: "rgba(14,42,61,0.04)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={0.75}>
          <Box className="dot" sx={{ bgcolor: "#FF5F57" }} />
          <Box className="dot" sx={{ bgcolor: "#FEBC2E" }} />
          <Box className="dot" sx={{ bgcolor: "#28C840" }} />
        </Stack>
        <Box
          sx={{
            ml: 2,
            flex: 1,
            maxWidth: 480,
            mx: "auto",
            bgcolor: "background.default",
            borderRadius: 999,
            px: 2,
            py: 0.5,
            fontSize: "0.8125rem",
            color: "text.secondary",
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          members.thrivingdentist.com
        </Box>
      </Stack>

      {/* Faux app body */}
      <Grid container sx={{ minHeight: { xs: 360, md: 520 } }}>
        {/* Sidebar */}
        <Grid size={{ xs: 0, md: 3 }} sx={{ display: { xs: "none", md: "block" }, bgcolor: "background.paper", borderRight: "1px solid", borderColor: "divider", p: 2.5 }}>
          <Stack spacing={1}>
            <Typography variant="overline" sx={{ color: "text.secondary", pl: 1 }}>
              WORKSPACE
            </Typography>
            {tabs.map((t, i) => (
              <Stack
                key={t.label}
                direction="row"
                spacing={1.5}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  alignItems: "center",
                  bgcolor: i === 3 ? "primary.main" : "transparent",
                  color: i === 3 ? "common.white" : "text.primary",
                  "& svg": { fontSize: 18, color: i === 3 ? "secondary.main" : "primary.main" },
                }}
              >
                {t.icon}
                <Typography sx={{ fontSize: "0.9375rem", fontWeight: i === 3 ? 600 : 500 }}>
                  {t.label}
                </Typography>
                {i === 3 && (
                  <Chip
                    label="2"
                    size="small"
                    sx={{
                      ml: "auto",
                      height: 20,
                      bgcolor: "secondary.main",
                      color: "primary.dark",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        </Grid>

        {/* Main panel */}
        <Grid size={{ xs: 12, md: 9 }} sx={{ p: { xs: 3, md: 4 }, bgcolor: "background.default" }}>
          <Stack spacing={3}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
              <Stack spacing={0.5}>
                <Typography variant="overline" sx={{ color: "text.secondary" }}>
                  HOTLINE
                </Typography>
                <Typography variant="h4">2 active cases</Typography>
              </Stack>
              <Chip
                label="● Live · responds in ~12 min"
                sx={{
                  bgcolor: "rgba(40,200,80,0.12)",
                  color: "#137A36",
                  border: "1px solid rgba(40,200,80,0.25)",
                  fontWeight: 600,
                }}
              />
            </Stack>

            <Stack spacing={1.5}>
              {[
                {
                  title: "PPO renegotiation playbook for Aetna",
                  meta: "Opened 38 min ago · matched to Mark Costes",
                  status: "Awaiting expert call · ETA today 4:00 PM",
                  tone: "amber",
                },
                {
                  title: "Hiring an associate without losing equity",
                  meta: "Opened yesterday · Dr. Chen, San Francisco",
                  status: "Case summary delivered · view in inbox",
                  tone: "ink",
                },
              ].map((c) => (
                <Card key={c.title} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontWeight: 600, color: "text.primary" }}>{c.title}</Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
                        {c.meta}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: c.tone === "amber" ? "secondary.dark" : "text.primary",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                        }}
                      >
                        {c.status}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        bgcolor: c.tone === "amber" ? "rgba(217,168,75,0.18)" : "rgba(14,42,61,0.08)",
                        color: c.tone === "amber" ? "secondary.dark" : "primary.main",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        "& svg": { fontSize: 18 },
                      }}
                    >
                      <PhoneInTalkOutlinedIcon />
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ p: 2.5, borderRadius: 3, bgcolor: "primary.main", color: "common.white", alignItems: "center" }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  bgcolor: "secondary.main",
                  color: "primary.dark",
                  display: "grid",
                  placeItems: "center",
                  "& svg": { fontSize: 22 },
                  flexShrink: 0,
                }}
              >
                <HandshakeOutlinedIcon />
              </Box>
              <Stack spacing={0.25} sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  This week&apos;s vendor deal
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>Schein supplies — 12% above MSRP discount, members only.</Typography>
              </Stack>
              <Chip
                label="Redeem"
                sx={{ bgcolor: "secondary.main", color: "primary.dark", fontWeight: 700 }}
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
}
