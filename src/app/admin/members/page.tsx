"use client";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { adminMembers } from "@/lib/vendorData";

export default function AdminMembersPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return adminMembers;
    const lc = q.toLowerCase();
    return adminMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(lc) ||
        m.email.toLowerCase().includes(lc) ||
        m.practice.toLowerCase().includes(lc) ||
        m.city.toLowerCase().includes(lc),
    );
  }, [q]);

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            MEMBERS
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
            All members
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
            {adminMembers.length} total · {adminMembers.filter((m) => m.founding).length} founding · search by name, practice, or email.
          </Typography>
        </Box>
        <Button variant="outlined" color="primary" startIcon={<DownloadOutlinedIcon />}>
          Export CSV
        </Button>
      </Stack>

      <TextField
        placeholder="Search members…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: 520 }}
      />

      <Box
        sx={{
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "1.6fr 1.4fr 1fr 0.8fr 0.6fr 0.6fr 0.7fr",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Cell head>Member</Cell>
          <Cell head>Practice</Cell>
          <Cell head>Tier</Cell>
          <Cell head>Joined</Cell>
          <Cell head>Cases</Cell>
          <Cell head>CE</Cell>
          <Box />
        </Box>

        {filtered.map((m, i) => (
          <Box
            key={m.id}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "1.6fr 1.4fr 1fr 0.8fr 0.6fr 0.6fr 0.7fr" },
              alignItems: "center",
              gap: 2,
              px: { xs: 2.5, md: 3 },
              py: 2,
              borderBottom: i === filtered.length - 1 ? 0 : "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }} noWrap>
                {m.name}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                {m.email}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ display: { xs: "flex", md: "none" }, mt: 0.75, flexWrap: "wrap", gap: 0.5 }}>
                <TierChip tier={m.tier} founding={m.founding} />
                <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                  {m.practice} · {m.city}
                </Typography>
              </Stack>
            </Box>
            <Cell>
              <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 500 }} noWrap>
                  {m.practice}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }} noWrap>
                  {m.city}
                </Typography>
              </Box>
            </Cell>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <TierChip tier={m.tier} founding={m.founding} />
            </Box>
            <Cell>
              <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.85rem" }}>
                {m.joinedOn}
              </Box>
            </Cell>
            <Cell>
              <Box sx={{ display: { xs: "none", md: "block" }, fontWeight: 600 }}>
                {m.hotlineCases}
              </Box>
            </Cell>
            <Cell>
              <Box sx={{ display: { xs: "none", md: "block" }, fontWeight: 600 }}>
                {m.ceCredits}
              </Box>
            </Cell>
            <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 0.5 }}>
              <Tooltip title="Email member">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <EmailOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ))}

        {filtered.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary" }}>No members match &quot;{q}&quot;.</Typography>
          </Box>
        )}
      </Box>
    </Stack>
  );
}

function Cell({ head, children }: { head?: boolean; children?: React.ReactNode }) {
  return (
    <Typography
      variant={head ? "body2" : "body1"}
      sx={{
        fontSize: head ? "0.7rem" : "0.9rem",
        fontWeight: head ? 700 : 500,
        letterSpacing: head ? "0.06em" : 0,
        textTransform: head ? "uppercase" : "none",
        color: head ? "text.secondary" : "text.primary",
      }}
    >
      {children}
    </Typography>
  );
}

function TierChip({ tier, founding }: { tier: string; founding: boolean }) {
  if (founding) {
    return (
      <Chip
        label="Founding"
        size="small"
        sx={{ bgcolor: "rgba(217,168,75,0.16)", color: "#A07823", fontWeight: 700, fontSize: "0.7rem", height: 22 }}
      />
    );
  }
  const map: Record<string, { bg: string; color: string }> = {
    Premium: { bg: "rgba(14,42,61,0.92)", color: "common.white" },
    Pro: { bg: "rgba(14,42,61,0.07)", color: "primary.dark" },
    Free: { bg: "grey.200", color: "text.secondary" },
  };
  const s = map[tier] ?? map.Free;
  return (
    <Chip label={tier} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
  );
}
