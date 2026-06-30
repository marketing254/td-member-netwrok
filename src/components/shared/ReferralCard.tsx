"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

/**
 * ReferralCard — drop-in block for expert/partner portal dashboards.
 *
 * Fetches the role's referral code from the provided endpoint, shows the
 * short code + a copyable referral URL, and a small "this month / lifetime"
 * stats row so they can see their impact at a glance.
 */
export default function ReferralCard({
  endpoint,
  accent = "#A07823",
}: {
  endpoint: string;
  accent?: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [signupsLifetime, setSignupsLifetime] = useState(0);
  const [signupsLast30, setSignupsLast30] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [justCopied, setJustCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    let active = true;
    fetch(endpoint, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { code?: string; signupsLifetime?: number; signupsLast30?: number; conversions?: number } | null) => {
        if (!active || !body) return;
        setCode(body.code ?? null);
        setSignupsLifetime(body.signupsLifetime ?? 0);
        setSignupsLast30(body.signupsLast30 ?? 0);
        setConversions(body.conversions ?? 0);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);

  const joinUrl = code
    ? typeof window !== "undefined"
      ? `${window.location.origin}/join?ref=${code}`
      : `/join?ref=${code}`
    : "";

  const copy = async (kind: "code" | "link", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setJustCopied(kind);
      setTimeout(() => setJustCopied(null), 1800);
    } catch { /* no-op */ }
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid rgba(14,42,61,0.08)",
        bgcolor: "#FFFFFF",
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            bgcolor: `${accent}20`,
            color: accent,
            display: "grid",
            placeItems: "center",
          }}
        >
          <LinkRoundedIcon sx={{ fontSize: 15 }} />
        </Box>
        <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", color: accent, textTransform: "uppercase" }}>
          Your referral link
        </Typography>
      </Stack>

      {loading ? (
        <Stack sx={{ alignItems: "center", py: 2 }}>
          <CircularProgress size={18} sx={{ color: accent }} />
        </Stack>
      ) : code ? (
        <>
          <Typography sx={{ fontSize: "0.85rem", color: "#3B4A55", lineHeight: 1.55, mb: 1.25 }}>
            Share this link with practice owners. Anyone who joins through it gets attributed to you — visible to the team in admin reports.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { sm: "center" }, mb: 1.5 }}
          >
            <Box
              sx={{
                flex: 1,
                px: 1.25,
                py: 1,
                borderRadius: 1,
                border: "1px solid rgba(14,42,61,0.12)",
                bgcolor: "#FBF8F1",
                fontFamily: "var(--font-mono, ui-monospace, Menlo, monospace)",
                fontSize: "0.84rem",
                color: "#0A1A2F",
                wordBreak: "break-all",
              }}
            >
              {joinUrl}
            </Box>
            <Tooltip title={justCopied === "link" ? "Copied!" : "Copy link"}>
              <Button
                onClick={() => copy("link", joinUrl)}
                variant="outlined"
                size="small"
                startIcon={justCopied === "link" ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  borderColor: "rgba(14,42,61,0.18)",
                  color: "#0A1A2F",
                  "&:hover": { borderColor: accent, bgcolor: `${accent}10` },
                }}
              >
                {justCopied === "link" ? "Copied" : "Copy link"}
              </Button>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
            <Box
              sx={{
                px: 1.25,
                py: 0.65,
                borderRadius: 1,
                bgcolor: `${accent}12`,
                color: accent,
                fontFamily: "var(--font-mono, ui-monospace, Menlo, monospace)",
                fontSize: "0.86rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                cursor: "pointer",
                transition: "background-color 160ms ease",
                "&:hover": { bgcolor: `${accent}1F` },
              }}
              onClick={() => copy("code", code)}
            >
              {justCopied === "code" ? "✓ Copied" : code}
            </Box>
            <Stack direction="row" spacing={2.5} sx={{ alignItems: "center", ml: { sm: "auto" } }}>
              <MiniStat label="Last 30d" value={signupsLast30} />
              <MiniStat label="Lifetime" value={signupsLifetime} />
              <MiniStat label="Paid" value={conversions} />
            </Stack>
          </Stack>
        </>
      ) : (
        <Typography sx={{ fontSize: "0.86rem", color: "#7A8590" }}>
          Couldn&apos;t load your referral code. Refresh to try again.
        </Typography>
      )}
    </Box>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.14em", color: "#7A8590", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0A1A2F", lineHeight: 1.1, mt: 0.2 }}>
        {value}
      </Typography>
    </Box>
  );
}
