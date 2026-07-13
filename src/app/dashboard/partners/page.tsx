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
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const GOLD = "#A07823";
const LINE = "#E6DDCF";

type Partner = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  offer_count: number;
};

/**
 * /dashboard/partners — Partner directory for members.
 *
 * Lists every live partner company as a card with its logo, category, and
 * member-offer count. Tapping one opens the partner's profile with their
 * full details and offers.
 */
export default function MemberPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/member/partners", { cache: "no-store" });
        if (!active || !res.ok) return;
        const body = (await res.json()) as { partners?: Partner[] };
        if (active) setPartners(body.partners ?? []);
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
    if (!lc) return partners;
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(lc) ||
        (p.category ?? "").toLowerCase().includes(lc) ||
        (p.description ?? "").toLowerCase().includes(lc),
    );
  }, [partners, q]);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: { xs: 3, md: 4 }, px: { xs: 2, md: 0 } }}>
      <Stack spacing={3.5}>
        <Box>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", color: INK_MUTED, textTransform: "uppercase", mb: 1 }}>
            Partners
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
            Member partners &amp; offers
          </Typography>
          <Typography sx={{ color: INK_SOFT, fontSize: "0.98rem", maxWidth: 640, lineHeight: 1.55 }}>
            Vetted companies with exclusive discounts and benefits for DMN members. Tap one to
            see their offers.
          </Typography>
        </Box>

        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search partners by name, category, or what they do"
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
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 999, fontSize: "0.92rem", bgcolor: "#FFFFFF" } }}
        />

        {loading ? (
          <Stack sx={{ alignItems: "center", py: 6 }}>
            <CircularProgress size={22} sx={{ color: GOLD }} />
          </Stack>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: INK, mb: 0.5 }}>
              {partners.length === 0 ? "No partners yet" : "No partners match that search"}
            </Typography>
            <Typography sx={{ fontSize: "0.86rem", color: INK_MUTED }}>
              {partners.length === 0 ? "Check back soon — partners are being added." : "Try a different keyword."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 2.5 }}>
            {filtered.map((p) => (
              <PartnerCard key={p.id} partner={p} />
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <Box
      component={Link}
      href={`/dashboard/partners/${partner.id}`}
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
        "&:focus-visible": { outline: `2px solid ${GOLD}`, outlineOffset: 3 },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1.5 }}>
        <Box
          sx={{
            position: "relative",
            width: 52,
            height: 52,
            borderRadius: 1.5,
            overflow: "hidden",
            bgcolor: "#FBF8F1",
            border: `1px solid ${LINE}`,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          {partner.logo_url ? (
            <Image src={partner.logo_url} alt={partner.name} fill sizes="52px" unoptimized style={{ objectFit: "contain", padding: 6 }} />
          ) : (
            <StorefrontOutlinedIcon sx={{ color: GOLD, fontSize: 24 }} />
          )}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, color: INK, lineHeight: 1.15, letterSpacing: "-0.01em" }} noWrap>
            {partner.name}
          </Typography>
          {partner.category && (
            <Typography sx={{ fontSize: "0.74rem", color: GOLD, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", mt: 0.25 }}>
              {partner.category}
            </Typography>
          )}
        </Box>
      </Stack>
      {partner.description && (
        <Typography sx={{ fontSize: "0.86rem", color: INK_SOFT, lineHeight: 1.55, mb: 1.25, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {partner.description}
        </Typography>
      )}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 1, borderTop: `1px solid ${LINE}` }}>
        <Typography sx={{ fontSize: "0.74rem", color: INK_MUTED, fontWeight: 600 }}>
          {partner.offer_count === 0 ? "Profile" : `${partner.offer_count} offer${partner.offer_count === 1 ? "" : "s"}`}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: GOLD, fontSize: "0.74rem", fontWeight: 700 }}>
          View partner <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
        </Stack>
      </Stack>
    </Box>
  );
}
