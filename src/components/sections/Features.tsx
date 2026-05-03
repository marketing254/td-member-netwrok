"use client";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import Section from "@/components/Section";
import TiltCard from "@/components/TiltCard";
import Reveal from "@/components/Reveal";

const cards = [
  {
    title: "24/7 Expert Hotline",
    summary:
      "Direct line to business coaches and practice advisors. Every case gets a written summary and a follow-up plan within 3 days.",
    icon: <PhoneInTalkOutlinedIcon />,
    span: { xs: 12, md: 8 },
    feature: true,
  },
  {
    title: "Member Directory",
    summary: "500+ practice owners, searchable by city, specialty, revenue.",
    icon: <GroupsOutlinedIcon />,
    span: { xs: 12, md: 4 },
  },
  {
    title: "Vendor Network",
    summary: "Negotiated savings averaging $6,000+ per year.",
    icon: <HandshakeOutlinedIcon />,
    span: { xs: 12, md: 4 },
  },
  {
    title: "Proven Systems",
    summary:
      "Battle-tested templates, checklists, and SOPs. From HR onboarding to expansion playbooks — the work, already done.",
    icon: <BusinessCenterOutlinedIcon />,
    span: { xs: 12, md: 4 },
  },
  {
    title: "Learning Academy",
    summary:
      "Weekly audio, monthly video, live AMAs. Led by practice owners who have actually built what you are trying to build.",
    icon: <MenuBookOutlinedIcon />,
    span: { xs: 12, md: 4 },
    accent: true,
  },
  {
    title: "Quarterly Strategy",
    summary: "Premium tier members get a 90-minute review every quarter.",
    icon: <TrackChangesOutlinedIcon />,
    span: { xs: 12, md: 8 },
  },
];

export default function Features() {
  return (
    <Section
      id="features"
      eyebrow="WHAT YOU GET"
      title="Six things you would otherwise hire a consultant, a buyer, and an HR firm to do."
      subtitle="Bundled into one membership. Built for the operator side of running a practice."
      background="alt"
    >
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {cards.map((c, i) => (
          <Grid key={c.title} size={c.span}>
            <Reveal delay={i * 0.04}>
              <TiltCard intensity={c.feature ? 4 : 3} style={{ height: "100%" }}>
                <Card
                  sx={{
                    height: "100%",
                    minHeight: c.feature ? { xs: 240, md: 320 } : 200,
                    position: "relative",
                    overflow: "hidden",
                    borderColor: c.accent ? "primary.main" : "divider",
                    borderWidth: c.accent ? 1.5 : 1,
                    backgroundImage: c.feature
                      ? "linear-gradient(180deg, #FFFFFF 0%, #F7F5F0 100%)"
                      : c.accent
                      ? "linear-gradient(180deg, #06182A 0%, #0E2A3D 100%)"
                      : undefined,
                    color: c.accent ? "common.white" : "text.primary",
                    "&:hover": {
                      borderColor: c.accent ? "secondary.main" : "primary.main",
                      boxShadow: c.feature
                        ? "0 30px 60px -28px rgba(14,42,61,0.35)"
                        : "0 20px 40px -28px rgba(14,42,61,0.3)",
                    },
                  }}
                >
                  {c.feature && (
                    <Box
                      aria-hidden
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                          "radial-gradient(50% 60% at 90% 10%, rgba(217,168,75,0.18) 0%, transparent 60%)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <CardContent
                    sx={{
                      p: { xs: 3.5, md: c.feature ? 5 : 4 },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}
                  >
                    <Stack
                      spacing={c.feature ? 4 : 2}
                      sx={{ flex: 1, justifyContent: c.feature ? "space-between" : "flex-start" }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: c.accent
                            ? "rgba(217,168,75,0.18)"
                            : c.feature
                            ? "primary.main"
                            : "rgba(14,42,61,0.06)",
                          color: c.accent
                            ? "secondary.light"
                            : c.feature
                            ? "secondary.main"
                            : "primary.main",
                          "& svg": { fontSize: 24 },
                        }}
                      >
                        {c.icon}
                      </Box>

                      <Stack spacing={1.25}>
                        <Typography
                          variant={c.feature ? "h3" : "h5"}
                          sx={{
                            color: c.accent ? "common.white" : "text.primary",
                            fontFamily: c.feature ? "var(--font-display)" : undefined,
                          }}
                        >
                          {c.title}
                        </Typography>
                        <Typography
                          variant={c.feature ? "subtitle1" : "body2"}
                          sx={{
                            color: c.accent ? "rgba(255,255,255,0.72)" : "text.secondary",
                            fontSize: c.feature ? { xs: "1rem", md: "1.0625rem" } : "0.9375rem",
                          }}
                        >
                          {c.summary}
                        </Typography>
                      </Stack>
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
