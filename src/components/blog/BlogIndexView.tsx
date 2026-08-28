"use client";

import { useMemo, useState } from "react";
import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import { BLOG_ARTICLES, BLOG_INDEX_HEADING, BLOG_INDEX_STANDFIRST } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const GOLD = "#A07823";
const LINE = "#E6DDCF";

/**
 * /blog index — heading + supporting copy per the approved build brief,
 * category filter chips (derived from live articles only, so no empty
 * categories ever render) and the responsive card grid in launch order.
 */
export default function BlogIndexView() {
  const [category, setCategory] = useState<string | null>(null);

  // Categories derive from the registry — a future category appears here
  // automatically the moment its first article ships.
  const categories = useMemo(
    () => [...new Set(BLOG_ARTICLES.map((a) => a.category))],
    [],
  );
  const shown = category ? BLOG_ARTICLES.filter((a) => a.category === category) : BLOG_ARTICLES;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FBF8F1", display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Hero — centered so the wide cream canvas reads balanced instead
          of a left-heavy block with dead space on the right. A short gold
          rule anchors the heading the way the site's other pages do. */}
      <Box sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 3, md: 4.5 }, textAlign: "center" }}>
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{
              color: GOLD,
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              display: "block",
              mb: 1,
            }}
          >
            DMN Blog
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              fontWeight: 600,
              color: INK,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 800,
              mx: "auto",
              mb: 2,
            }}
          >
            {BLOG_INDEX_HEADING}
          </Typography>
          <Typography sx={{ fontSize: "1.02rem", color: INK_SOFT, lineHeight: 1.65, maxWidth: 620, mx: "auto" }}>
            {BLOG_INDEX_STANDFIRST}
          </Typography>
          <Box sx={{ width: 44, height: 3, bgcolor: "#D9A84B", borderRadius: 2, mx: "auto", mt: 3, opacity: 0.7 }} />
        </Container>
      </Box>

      {/* Category filter — centered under the hero on the same axis */}
      {categories.length > 1 && (
        <Container maxWidth="lg" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1, justifyContent: "center" }}>
            {[null, ...categories].map((cat) => {
              const active = category === cat;
              return (
                <Chip
                  key={cat ?? "all"}
                  label={cat ?? "All topics"}
                  clickable
                  onClick={() => setCategory(cat)}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    borderRadius: 999,
                    bgcolor: active ? INK : "#FFFFFF",
                    color: active ? "#F6F1E7" : INK_SOFT,
                    border: `1px solid ${active ? INK : LINE}`,
                    "&:hover": { bgcolor: active ? INK : "rgba(217,168,75,0.1)" },
                  }}
                />
              );
            })}
          </Stack>
        </Container>
      )}

      {/* Article grid — launch order preserved (registry order) */}
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 9 }, flex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gridAutoRows: "1fr",
            gap: 3,
          }}
        >
          {shown.map((article) => (
            <BlogCard key={article.slug} article={article} />
          ))}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
