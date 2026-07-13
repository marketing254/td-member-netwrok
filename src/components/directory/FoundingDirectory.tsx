"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  CircularProgress,
  Container,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { COLORS } from "@/theme";

const PAGE_SIZE = 6;

type Row = {
  id: string;
  name: string;
  // experts
  specialty?: string | null;
  company_name?: string | null;
  bio?: string | null;
  headshot_url?: string | null;
  // partners
  category?: string | null;
  description?: string | null;
  logo_url?: string | null;
};

/**
 * FoundingDirectory — public, DB-driven, paginated directory of accepted
 * experts / partners for the marketing site. Renders NOTHING until at
 * least one accepted person exists, so the section never shows empty.
 * Each card links to the public profile page (/experts/[id] or
 * /partners/[id]).
 */
export default function FoundingDirectory({ kind }: { kind: "experts" | "partners" }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/directory/${kind}?page=${page}&pageSize=${PAGE_SIZE}`, {
          cache: "no-store",
        });
        if (!active || !res.ok) return;
        const body = (await res.json()) as { experts?: Row[]; partners?: Row[]; total?: number };
        if (!active) return;
        setRows((kind === "experts" ? body.experts : body.partners) ?? []);
        setTotal(body.total ?? 0);
      } catch {
        /* section simply stays hidden on error */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [kind, page]);

  // Nothing accepted yet → render nothing (no empty section on the live site).
  if (!loading && total === 0) return null;

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isExperts = kind === "experts";

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: COLORS.surfaceAlt, borderTop: `1px solid ${COLORS.line}`, borderBottom: `1px solid ${COLORS.line}` }}>
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center", mb: 4 }}>
          <Typography
            sx={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: COLORS.accent,
            }}
          >
            {isExperts ? "Founding experts" : "Founding partners"}
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.7rem", md: "2.1rem" },
              fontWeight: 500,
              color: COLORS.ink,
              letterSpacing: "-0.01em",
            }}
          >
            {isExperts ? "Accepted onto the bench" : "Accepted into the network"}
          </Typography>
          <Typography sx={{ color: COLORS.muted, fontSize: "0.98rem", maxWidth: 600 }}>
            {isExperts
              ? "Every expert below has signed the founding agreement and is live inside the member portal."
              : "Every company below has signed the founding agreement — members get their exclusive offers inside the portal."}
          </Typography>
        </Stack>

        {loading ? (
          <Stack sx={{ alignItems: "center", py: 5 }}>
            <CircularProgress size={22} sx={{ color: COLORS.accent }} />
          </Stack>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 2.5,
              maxWidth: 1000,
              mx: "auto",
            }}
          >
            {rows.map((r) => (
              <DirectoryCard key={r.id} row={r} kind={kind} />
            ))}
          </Box>
        )}

        {pageCount > 1 && (
          <Stack sx={{ alignItems: "center", mt: 4 }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, v) => setPage(v)}
              sx={{
                "& .MuiPaginationItem-root": { color: COLORS.inkSoft, fontWeight: 600 },
                "& .Mui-selected": { bgcolor: `${COLORS.accent} !important`, color: "#FFFFFF" },
              }}
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
}

function DirectoryCard({ row, kind }: { row: Row; kind: "experts" | "partners" }) {
  const isExperts = kind === "experts";
  const tagline = isExperts ? row.specialty : row.category;
  const blurb = isExperts ? row.bio : row.description;
  const img = isExperts ? row.headshot_url : row.logo_url;

  return (
    <Box
      component={Link}
      href={`/${kind}/${row.id}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 3,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        transition: "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: COLORS.accent,
          boxShadow: "0 22px 44px -20px rgba(217,168,75,0.4)",
        },
        "&:focus-visible": { outline: `2px solid ${COLORS.accent}`, outlineOffset: 3 },
      }}
    >
      {/* Featured image — square headshot for experts, padded logo panel
          for partners. The 1:1 canvas matches the *_sq headshot set. */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: isExperts ? "1 / 1" : "16 / 9",
          bgcolor: COLORS.surfaceAlt,
          borderBottom: `1px solid ${COLORS.line}`,
          display: "grid",
          placeItems: "center",
        }}
      >
        {img ? (
          <Image
            src={img}
            alt={row.name}
            fill
            sizes="(max-width: 600px) 100vw, 320px"
            // Logos can be SVGs, which Next's optimizer refuses — serve
            // partner logos unoptimized so every format renders.
            unoptimized={!isExperts}
            style={
              isExperts
                ? { objectFit: "cover", objectPosition: "center top" }
                : { objectFit: "contain", padding: 26 }
            }
          />
        ) : (
          <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, color: COLORS.accent, fontSize: "2.4rem" }}>
            {initials(row.name)}
          </Typography>
        )}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            px: 1.25,
            py: 0.4,
            borderRadius: 999,
            bgcolor: "rgba(10,26,47,0.85)",
            color: "#F0C16E",
            fontSize: "0.62rem",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {isExperts ? "Founding Expert" : "Founding Partner"}
        </Box>
      </Box>

      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography
          sx={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, color: COLORS.ink, lineHeight: 1.2, letterSpacing: "-0.01em" }}
          noWrap
        >
          {row.name}
        </Typography>
        {tagline && (
          <Typography
            sx={{ fontSize: "0.72rem", color: COLORS.accent, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", mt: 0.5 }}
            noWrap
          >
            {tagline}
          </Typography>
        )}
        {blurb && (
          <Typography
            sx={{
              fontSize: "0.87rem",
              color: COLORS.inkSoft,
              lineHeight: 1.55,
              mt: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {blurb}
          </Typography>
        )}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "center", mt: "auto", pt: 1.75, color: COLORS.accent, fontSize: "0.8rem", fontWeight: 700 }}
        >
          View profile <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
        </Stack>
      </Box>
    </Box>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
