"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Box, Button, Container, Pagination, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
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
            <Stack spacing={1.75} sx={{ alignItems: "flex-start" }}>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD_DEEP }}>
                Member tools
              </Typography>
              <Typography
                component="h1"
                sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "2rem", md: "2.8rem" }, fontWeight: 500, color: COLORS.ink, lineHeight: 1.08, letterSpacing: "-0.02em", maxWidth: 640 }}
              >
                {MEMBER_TOOLS.length} practice calculators, included with membership
              </Typography>
              <Typography sx={{ color: COLORS.muted, fontSize: "1.05rem", maxWidth: 600, lineHeight: 1.6 }}>
                PPO write-offs, overhead benchmarks, case-acceptance gaps, fee increases, equipment
                ROI and more, built with the DMN expert bench. Preview any tool below. Members run
                them with their own numbers and download the results.
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
              Every tool above, plus the full resource library, the expert hotline, and
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
