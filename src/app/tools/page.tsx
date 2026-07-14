"use client";

import Link from "next/link";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import { MEMBER_TOOLS, TOOL_CATEGORIES } from "@/lib/toolsData";
import { COLORS } from "@/theme";

/**
 * /tools — PUBLIC teaser for the member Tools section.
 *
 * Shows WHAT exists (titles, categories, expert credits) as a reason to
 * join — the tools themselves stay member-gated per the dev spec (the
 * files are never publicly reachable). Every card funnels to /pricing.
 */
export default function PublicToolsPage() {
  const count = MEMBER_TOOLS.length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.surface, display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Hero */}
      <Box sx={{ py: { xs: 6, md: 9 }, borderBottom: `1px solid ${COLORS.line}` }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: COLORS.accent }}>
              Member tools
            </Typography>
            <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "2rem", md: "2.8rem" }, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 760 }}>
              {count} practice calculators, included with membership
            </Typography>
            <Typography sx={{ color: COLORS.muted, fontSize: "1.02rem", maxWidth: 640, lineHeight: 1.6 }}>
              PPO write-offs, overhead benchmarks, case-acceptance gaps, fee increases, equipment
              ROI and more — built with the DMN expert bench. Everything runs in your browser;
              nothing you type is saved or sent anywhere.
            </Typography>
            <Button
              component={Link}
              href="/pricing"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{ mt: 1.5, textTransform: "none", borderRadius: 999, px: 3.5, py: 1.25, fontWeight: 700, bgcolor: COLORS.ink, "&:hover": { bgcolor: COLORS.inkSoft } }}
            >
              Become a member to use them
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Locked catalog */}
      <Box sx={{ py: { xs: 5, md: 7 }, flex: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5, maxWidth: 1000, mx: "auto" }}>
            {MEMBER_TOOLS.map((t) => {
              const color = TOOL_CATEGORIES.find((c) => c.name === t.category)?.color ?? COLORS.ink;
              return (
                <Box
                  key={t.id}
                  component={Link}
                  href="/pricing"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                    borderRadius: 2.5,
                    border: `1px solid ${COLORS.line}`,
                    borderTop: `3px solid ${color}`,
                    bgcolor: "#FFFFFF",
                    p: 2.5,
                    transition: "transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
                    "&:hover": { transform: "translateY(-2px)", borderColor: COLORS.accent, borderTopColor: color, boxShadow: "0 16px 32px -16px rgba(217,168,75,0.3)" },
                  }}
                >
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start", mb: 1 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.25, bgcolor: `${color}14`, color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <CalculateOutlinedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 600, color: COLORS.ink, lineHeight: 1.25 }}>
                        {t.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", mt: 0.4 }}>
                        {t.category}
                      </Typography>
                    </Box>
                  </Stack>
                  {t.expert && (
                    <Typography sx={{ fontSize: "0.78rem", color: COLORS.muted, mb: 1.25 }}>
                      Built with <Box component="span" sx={{ color: COLORS.accent, fontWeight: 700 }}>{t.expert}</Box>
                    </Typography>
                  )}
                  <Stack direction="row" spacing={0.6} sx={{ alignItems: "center", mt: "auto", pt: 0.75 }}>
                    <LockRoundedIcon sx={{ fontSize: 13, color: COLORS.accent }} />
                    <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: COLORS.accent }}>
                      Members only
                    </Typography>
                  </Stack>
                </Box>
              );
            })}
          </Box>

          <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center", mt: { xs: 5, md: 7 } }}>
            <Chip
              label="Founding membership · $49/mo locked for life"
              sx={{ bgcolor: "rgba(217,168,75,0.14)", color: COLORS.accent, fontWeight: 700 }}
            />
            <Typography sx={{ color: COLORS.muted, fontSize: "0.98rem", maxWidth: 560, lineHeight: 1.6 }}>
              Every tool above — plus the full resource library, the expert hotline, and
              member-exclusive partner offers.
            </Typography>
            <Button
              component={Link}
              href="/pricing"
              variant="contained"
              size="large"
              sx={{ textTransform: "none", borderRadius: 999, px: 3.5, py: 1.25, fontWeight: 700, bgcolor: COLORS.accent, color: "#FFFFFF", "&:hover": { bgcolor: COLORS.accent } }}
            >
              See membership pricing
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
