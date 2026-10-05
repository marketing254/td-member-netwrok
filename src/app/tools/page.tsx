"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Box, Button, Container, Pagination, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import { MEMBER_TOOLS, TOOL_CATEGORIES } from "@/lib/toolsData";
import ToolCard from "@/components/tools/ToolCard";
import { COLORS } from "@/theme";

/**
 * /tools — PUBLIC directory of the member Tools section.
 *
 * Shows WHAT exists (a real preview image, title, category, expert
 * credit) as a reason to join. Each card opens /tools/[id], a public
 * preview page with a blurred glimpse and a member lock. The tool HTML
 * itself is never publicly reachable — it is served only to signed-in
 * members by /api/member/tools/[id].
 */

const GOLD_DEEP = "#A07823";
const PAGE_SIZE = 9;

export default function PublicToolsPage() {
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);
  const rows = useMemo(
    () => MEMBER_TOOLS.filter((t) => cat === "All" || t.category === cat),
    [cat],
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.surface, display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Hero */}
      <Box sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 4, md: 5 }, borderBottom: `1px solid ${COLORS.line}`, bgcolor: "#fff" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: { xs: 3, md: 5 },
              alignItems: "end",
            }}
          >
            <Stack spacing={1.75} sx={{ alignItems: "center", textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD_DEEP }}>
                Member tools
              </Typography>
              <Typography
                component="h1"
                sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.9rem", md: "2.6rem" }, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1, letterSpacing: "-0.02em", whiteSpace: { md: "nowrap" } }}
              >
                Audits and calculators for your practice
              </Typography>
              <Typography sx={{ color: COLORS.muted, fontSize: "1.05rem", maxWidth: 640, lineHeight: 1.6, mx: "auto" }}>
                Send us a document and we read it for you. Or type in your numbers and see the answer. Built with the DMN expert bench.
              </Typography>
              <Button
                component={Link}
                href="/join/member"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{ mt: 0.5, textTransform: "none", borderRadius: 999, px: 3.5, py: 1.25, fontWeight: 700, bgcolor: COLORS.primary, "&:hover": { bgcolor: COLORS.primaryDark } }}
              >
                Become a member to use them
              </Button>
            </Stack>

          </Box>
        </Container>
      </Box>

      {/* Audits (Lester, 30 Sep 2026): above the calculators, which stay exactly as they are. */}
      <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: "#FBF8F1", borderBottom: `1px solid ${COLORS.line}` }}>
        <Container maxWidth="lg">
          <Stack sx={{ alignItems: { md: "center" }, textAlign: { md: "center" }, mb: { xs: 3, md: 4 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD_DEEP }}>Audits</Typography>
              <Box component="span" sx={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", px: 0.8, py: 0.2, borderRadius: "999px", bgcolor: "rgba(217,168,75,0.22)", color: GOLD_DEEP }}>NEW</Box>
            </Stack>
            <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.6rem", md: "2rem" }, fontWeight: 500, color: COLORS.ink, lineHeight: 1.15, mt: 1 }}>Send a document. Get your number.</Typography>
            <Typography sx={{ color: COLORS.muted, fontSize: "0.98rem", lineHeight: 1.6, mt: 1, maxWidth: 620 }}>An audit reads your own statements, invoices or contracts and tells you, in dollars, what to change. A calculator uses numbers you type in.</Typography>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.35fr) minmax(0, 1fr)" }, gap: { xs: 2, md: 2.5 }, alignItems: "stretch" }}>
            {/* Featured: Found Money */}
            <Box sx={{ position: "relative", overflow: "hidden", borderRadius: "22px", p: { xs: 3, md: 4 }, color: "#fff", bgcolor: "#0A1A2F", backgroundImage: "radial-gradient(700px 320px at 0% -10%, rgba(14,42,61,0.95), #06182A 70%)", boxShadow: "0 24px 60px rgba(10,26,47,0.18)", display: "flex", flexDirection: "column" }}>
              <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: "#D9A84B" }} />
              <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#F0C16E" }}>Found Money Audit</Typography>
                <Box component="span" sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", px: 1, py: 0.35, borderRadius: "999px", bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }}>Free · no card</Box>
              </Stack>
              <Typography component="h3" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.5rem", md: "1.9rem" }, fontWeight: 500, lineHeight: 1.15, mt: 1.25, maxWidth: 520, color: "#fff" }}>Find out what your practice is overpaying for</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: "0.95rem", lineHeight: 1.6, mt: 1.25, maxWidth: 520 }}>Card processing fees, supply prices and subscriptions, read from your own documents. Members unlock every fix, checked by a person.</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.25, mt: 3 }}>
                {[
                  ["1", "Upload three documents"],
                  ["2", "See your number in minutes"],
                  ["3", "Members unlock every fix"],
                ].map(([n, label]) => (
                  <Stack key={n} direction="row" spacing={1.25} sx={{ alignItems: "center", bgcolor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", px: 1.5, py: 1.1 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#D9A84B", color: "#0A1A2F", fontWeight: 800, fontSize: "0.8rem", display: "grid", placeItems: "center", flexShrink: 0 }}>{n}</Box>
                    <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, lineHeight: 1.3, color: "#fff" }}>{label}</Typography>
                  </Stack>
                ))}
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" }, mt: "auto", pt: 3 }}>
                <Button component={Link} href="/audit/found-money" variant="contained" disableElevation endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />} sx={{ textTransform: "none", borderRadius: "999px", px: 3, py: 1.1, fontWeight: 800, fontSize: "0.95rem", bgcolor: "#D9A84B", color: "#0A1A2F !important", "&:hover": { bgcolor: "#F0C16E" } }}>See my number, free</Button>
                <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>Your documents stay private to you.</Typography>
              </Stack>
            </Box>

            {/* Second Opinion */}
            <Box sx={{ borderRadius: "22px", border: `1px solid ${COLORS.line}`, bgcolor: "#fff", p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column" }}>
              <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD_DEEP }}>Second Opinion</Typography>
                <Box component="span" sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", px: 1, py: 0.35, borderRadius: "999px", bgcolor: "rgba(217,168,75,0.18)", color: GOLD_DEEP }}>Members</Box>
              </Stack>
              <Typography component="h3" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.4rem", md: "1.6rem" }, fontWeight: 500, color: COLORS.ink, lineHeight: 1.2, mt: 1.25 }}>Check something before you sign it</Typography>
              <Typography sx={{ color: COLORS.inkSoft, fontSize: "0.95rem", lineHeight: 1.6, mt: 1.25 }}>A quote, a proposal, a contract or a renewal. One file.</Typography>
              <Stack spacing={1} sx={{ mt: 2.5 }}>
                {["What it really costs", "What to watch for", "What our experts would do"].map((x) => (
                  <Stack key={x} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "rgba(217,168,75,0.18)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <CheckRoundedIcon sx={{ fontSize: 14, color: GOLD_DEEP }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.92rem", color: COLORS.ink, fontWeight: 600 }}>{x}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Box sx={{ mt: "auto", pt: 3 }}>
                <Button component={Link} href="/dashboard/tools/second-opinion" variant="outlined" endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />} sx={{ textTransform: "none", borderRadius: "999px", px: 3, py: 1.05, fontWeight: 700, fontSize: "0.95rem", borderColor: COLORS.primary, color: `${COLORS.primary} !important`, borderWidth: 1.5, "&:hover": { borderWidth: 1.5, bgcolor: "rgba(14,42,61,0.06)", borderColor: COLORS.primary } }}>Open Second Opinion</Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Directory */}
      <Box sx={{ py: { xs: 3, md: 4 }, flex: 1 }}>
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, alignItems: "center", mb: 3 }}>
            {["All", ...TOOL_CATEGORIES.map((c) => c.name)].map((c) => {
              const active = c === cat;
              return (
                <Box
                  key={c}
                  component="button"
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setCat(c);
                    // Back to page 1 so a category change never lands on an empty page.
                    setPage(1);
                  }}
                  sx={{
                    font: "inherit",
                    cursor: "pointer",
                    border: `1px solid ${active ? COLORS.primary : COLORS.line}`,
                    bgcolor: active ? COLORS.primary : "#fff",
                    color: active ? "#fff" : COLORS.inkSoft,
                    borderRadius: 999,
                    px: 1.75,
                    py: 0.8,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    "&:hover": { borderColor: COLORS.primary },
                  }}
                >
                  {c}
                </Box>
              );
            })}
            <Typography sx={{ ml: "auto", color: COLORS.muted, fontSize: "0.85rem" }}>
              {rows.length === MEMBER_TOOLS.length
                ? `${MEMBER_TOOLS.length} tools`
                : `${rows.length} of ${MEMBER_TOOLS.length} tools`}
            </Typography>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
            {visible.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </Box>

          {pageCount > 1 ? (
            <Stack sx={{ alignItems: "center", mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: 2 },
                  "& .Mui-selected": { bgcolor: `${COLORS.primary} !important`, color: "#fff" },
                }}
              />
            </Stack>
          ) : null}

          <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center", mt: { xs: 5, md: 7 } }}>
            <Typography sx={{ color: COLORS.muted, fontSize: "0.98rem", maxWidth: 560, lineHeight: 1.6 }}>
              Every tool above, plus the full Practice Playbook library, the expert hotline, and
              member-exclusive partner offers. Founding membership is $49/mo, locked for life.
            </Typography>
            <Button
              component={Link}
              href="/join/member"
              variant="contained"
              size="large"
              sx={{ textTransform: "none", borderRadius: 999, px: 3.5, py: 1.25, fontWeight: 700, bgcolor: COLORS.accent, color: COLORS.ink, "&:hover": { bgcolor: COLORS.accentDeep, color: "#fff" } }}
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

