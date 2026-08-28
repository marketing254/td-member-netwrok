"use client";

import Link from "next/link";
import Image from "next/image";
import { Box, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import type { BlogArticle } from "@/lib/blog";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const GOLD = "#A07823";
const LINE = "#E6DDCF";

/**
 * One blog-index card: featured image, category, title, excerpt, expert
 * row and a "Read article" affordance. Shared by the /blog grid and the
 * related-articles rail on article pages.
 */
export function BlogCard({ article, href }: { article: BlogArticle; href?: string }) {
  return (
    <Box
      component={Link}
      href={href ?? `/blog/${article.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${LINE}`,
        bgcolor: "#FFFFFF",
        transition:
          "transform 260ms cubic-bezier(0.16,1,0.3,1), border-color 260ms ease, box-shadow 260ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "#D9A84B",
          boxShadow: "0 24px 48px -22px rgba(10,26,47,0.3)",
        },
        "&:focus-visible": { outline: `2px solid ${GOLD}`, outlineOffset: 3 },
      }}
    >
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
        <Image
          src={article.hero.src}
          alt={article.hero.alt}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </Box>

      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: GOLD,
            mb: 1,
          }}
        >
          {article.category}
        </Typography>
        <Typography
          component="h3"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.18rem",
            fontWeight: 600,
            color: INK,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            mb: 1.25,
          }}
        >
          {article.title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.88rem",
            color: INK_SOFT,
            lineHeight: 1.6,
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </Typography>

        <Stack
          direction="row"
          sx={{
            mt: "auto",
            pt: 1.75,
            borderTop: `1px solid ${LINE}`,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
            <Box
              sx={{
                position: "relative",
                width: 30,
                height: 30,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid rgba(217,168,75,0.5)",
                flexShrink: 0,
              }}
            >
              <Image
                src={article.expert.headshotUrl}
                alt={article.expert.name}
                fill
                sizes="30px"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </Box>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: INK }} noWrap>
              {article.expert.name}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", color: GOLD, fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Read article <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
