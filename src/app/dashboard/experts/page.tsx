"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const GOLD = "#A07823";
const LINE = "#E6DDCF";

type Expert = {
  id: string;
  name: string;
  specialty: string | null;
  headshot_url: string | null;
  bio: string | null;
  kit_count: number;
};

/**
 * /dashboard/experts — Experts directory for members.
 *
 * Lists every active expert as a card with their photo, specialty, kit
 * count, and a "View kits" button that deep-links into the resource
 * library filtered by that expert.
 *
 * Members use this as the entry point when they want to find resources
 * by who taught them rather than by topic.
 */
export default function MemberExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/member/experts", { cache: "no-store" });
        if (!active || !res.ok) return;
        const body = (await res.json()) as { experts?: Expert[] };
        if (active) setExperts(body.experts ?? []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const lc = q.trim().toLowerCase();
    if (!lc) return experts;
    return experts.filter(
      (e) =>
        e.name.toLowerCase().includes(lc) ||
        (e.specialty ?? "").toLowerCase().includes(lc) ||
        (e.bio ?? "").toLowerCase().includes(lc),
    );
  }, [experts, q]);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: { xs: 3, md: 4 }, px: { xs: 2, md: 0 } }}>
      <Stack spacing={3.5}>
        <Box>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: INK_MUTED,
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Experts
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.9rem", md: "2.4rem" },
              fontWeight: 500,
              color: INK,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              mb: 1,
            }}
          >
            Find resources by expert
          </Typography>
          <Typography sx={{ color: INK_SOFT, fontSize: "0.98rem", maxWidth: 640, lineHeight: 1.55 }}>
            Every expert on the DMN bench. Tap one to see their full profile and kits.
          </Typography>
        </Box>

        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search experts by name, specialty, or topic"
          fullWidth
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18, color: INK_MUTED }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              fontSize: "0.92rem",
              bgcolor: "#FFFFFF",
            },
          }}
        />

        {loading ? (
          <Stack sx={{ alignItems: "center", py: 6 }}>
            <CircularProgress size={22} sx={{ color: GOLD }} />
          </Stack>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: INK, mb: 0.5 }}>
              No experts match that search
            </Typography>
            <Typography sx={{ fontSize: "0.86rem", color: INK_MUTED }}>
              Try a different keyword.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {filtered.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <Box
      component={Link}
      href={`/dashboard/experts/${expert.id}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        borderRadius: 2,
        border: `1px solid ${LINE}`,
        bgcolor: "#FFFFFF",
        p: 2.25,
        transition: "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: GOLD,
          boxShadow: "0 16px 32px -16px rgba(217,168,75,0.3)",
        },
        "&:focus-visible": {
          outline: `2px solid ${GOLD}`,
          outlineOffset: 3,
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1.5 }}>
        <Box
          sx={{
            position: "relative",
            width: 56,
            height: 56,
            borderRadius: "50%",
            overflow: "hidden",
            bgcolor: "#FBF8F1",
            border: `1px solid ${LINE}`,
            flexShrink: 0,
          }}
        >
          {expert.headshot_url ? (
            <Image
              src={expert.headshot_url}
              alt={expert.name}
              fill
              sizes="56px"
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: GOLD,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              {initials(expert.name)}
            </Box>
          )}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              fontWeight: 600,
              color: INK,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
            noWrap
          >
            {expert.name}
          </Typography>
          {expert.specialty && (
            <Typography sx={{ fontSize: "0.74rem", color: GOLD, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mt: 0.25 }}>
              {expert.specialty}
            </Typography>
          )}
        </Box>
      </Stack>
      {expert.bio && (
        <Typography
          sx={{
            fontSize: "0.86rem",
            color: INK_SOFT,
            lineHeight: 1.55,
            mb: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {expert.bio}
        </Typography>
      )}
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 1, borderTop: `1px solid ${LINE}` }}
      >
        <Typography sx={{ fontSize: "0.74rem", color: INK_MUTED, fontWeight: 600 }}>
          {expert.kit_count === 0
            ? "No kits yet"
            : `${expert.kit_count} kit${expert.kit_count === 1 ? "" : "s"}`}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: GOLD, fontSize: "0.74rem", fontWeight: 700 }}>
          View profile <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
        </Stack>
      </Stack>
    </Box>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
