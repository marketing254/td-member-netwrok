"use client";

import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

type Row = {
  id: string;
  code: string;
  active: boolean;
  created_at: string;
  owner: { kind: "expert" | "vendor"; id: string; name: string };
  signups: number;
  conversions: number;
};

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const LINE = "#E6DDCF";
const GOLD = "#A07823";

export default function AdminReferralsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/referrals", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { codes: [] }))
      .then((body: { codes?: Row[] }) => {
        if (active) setRows(body.codes ?? []);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const totalSignups = rows.reduce((sum, r) => sum + r.signups, 0);
  const totalConversions = rows.reduce((sum, r) => sum + r.conversions, 0);

  return (
    <Stack spacing={3.5} sx={{ maxWidth: 1100, mx: "auto" }}>
      <Box>
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase", mb: 1 }}>
          Referrals
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
          Who's bringing members in
        </Typography>
        <Typography sx={{ fontSize: "0.95rem", color: INK_SOFT, lineHeight: 1.55, maxWidth: 640 }}>
          Every expert + partner has a referral code. The table below shows signups attributed to each, and how many have converted into paid members.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
        <Tile label="Total signups" value={totalSignups.toLocaleString()} />
        <Tile label="Converted" value={totalConversions.toLocaleString()} />
        <Tile label="Active codes" value={String(rows.filter((r) => r.active).length)} />
      </Box>

      <Box sx={{ borderRadius: 3, border: `1px solid ${LINE}`, bgcolor: "#FFFFFF", overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${LINE}` }}>
          <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: INK }}>
            By code
          </Typography>
        </Box>
        {loading ? (
          <Stack sx={{ alignItems: "center", py: 5 }}>
            <CircularProgress size={20} sx={{ color: GOLD }} />
          </Stack>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "0.92rem", color: INK_MUTED }}>
              No referral codes yet. Codes are generated on first portal login.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderTop: "1px solid #EFEAE0" }} />}>
            {rows.map((r) => (
              <Stack
                key={r.id}
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                sx={{ px: 2.5, py: 2, alignItems: { md: "center" }, justifyContent: "space-between" }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={0.85} sx={{ alignItems: "center", mb: 0.3 }}>
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: INK }}>
                      {r.owner.name}
                    </Typography>
                    <Chip
                      label={r.owner.kind === "expert" ? "Expert" : "Partner"}
                      size="small"
                      sx={{
                        bgcolor: r.owner.kind === "expert" ? "rgba(34,108,78,0.12)" : "rgba(110,51,70,0.12)",
                        color: r.owner.kind === "expert" ? "#1F5C40" : "#6E3346",
                        height: 18,
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    />
                  </Stack>
                  <Typography sx={{ fontFamily: "var(--font-mono, ui-monospace, Menlo, monospace)", fontSize: "0.9rem", fontWeight: 700, color: GOLD, letterSpacing: "0.05em" }}>
                    {r.code}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
                  <Stat label="Signups" value={r.signups} />
                  <Stat label="Converted" value={r.conversions} />
                  {r.active && <VerifiedRoundedIcon sx={{ fontSize: 18, color: "#1F5C40" }} />}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ borderRadius: 2, border: `1px solid ${LINE}`, bgcolor: "#FFFFFF", p: 2 }}>
      <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", color: INK_MUTED, textTransform: "uppercase", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 600, color: INK, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ textAlign: "center", minWidth: 60 }}>
      <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: INK_MUTED, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: INK, lineHeight: 1.1, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}
