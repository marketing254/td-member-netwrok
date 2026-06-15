"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

type MemberRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  credential: string | null;
  email: string;
  phone: string | null;
  practice_name: string | null;
  practice_role: string | null;
  city: string | null;
  status: "waitlist" | "invited" | "active" | "paused" | "churned";
  tier: string | null;
  joined_at: string | null;
  created_at: string;
};

type WaitlistRow = {
  id: string;
  full_name: string;
  email: string;
  practice_name: string | null;
  city_state: string | null;
  phone: string | null;
  status: "new" | "contacted" | "converted" | "declined";
  created_at: string;
};

type TabKey = "members" | "waitlist";

export default function AdminMembersPage() {
  const [tab, setTab] = useState<TabKey>("members");

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            MEMBERS
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
            Members & waitlist
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
            Active members appear here as they convert from the waitlist. Founding rate is locked at signup and never increases.
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as TabKey)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": { backgroundColor: "secondary.main", height: 3, borderRadius: 999 },
          }}
        >
          <Tab value="members" label="Active members" />
          <Tab value="waitlist" label="Waitlist signups" />
        </Tabs>
      </Box>

      {tab === "members" ? <MembersPanel /> : <WaitlistPanel />}
    </Stack>
  );
}

function MembersPanel() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members", { cache: "no-store" });
      const body = (await res.json()) as { rows?: MemberRow[]; error?: string };
      if (!res.ok || body.error) {
        setError(body.error ?? `Failed to load (${res.status})`);
        setRows([]);
        return;
      }
      setRows(body.rows ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const lc = q.toLowerCase();
    return rows.filter(
      (m) =>
        `${m.first_name} ${m.last_name ?? ""}`.toLowerCase().includes(lc) ||
        m.email.toLowerCase().includes(lc) ||
        (m.practice_name ?? "").toLowerCase().includes(lc) ||
        (m.city ?? "").toLowerCase().includes(lc),
    );
  }, [rows, q]);

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <TextField
          placeholder="Search members…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 420, flex: 1 }}
        />
        <Button variant="outlined" color="primary" startIcon={<DownloadOutlinedIcon />} disabled={rows.length === 0}>
          Export CSV
        </Button>
      </Stack>

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
            gridTemplateColumns: "1.8fr 1.4fr 0.8fr 0.8fr 0.9fr",
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
          <Cell head>Status</Cell>
          <Cell head>Joined</Cell>
        </Box>

        {loading ? (
          <Box sx={{ p: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress size={24} sx={{ color: "#A07823" }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary" }}>
              {q
                ? `No members match "${q}".`
                : "No members yet. They'll appear here as soon as the first waitlist signup converts."}
            </Typography>
          </Box>
        ) : (
          filtered.map((m, i) => (
            <Box
              key={m.id}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.8fr 1.4fr 0.8fr 0.8fr 0.9fr" },
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
                  {m.first_name} {m.last_name ?? ""}
                  {m.credential ? `, ${m.credential}` : ""}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                  {m.email}
                </Typography>
              </Box>
              <Cell>
                <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.86rem", fontWeight: 500 }} noWrap>
                    {m.practice_name ?? "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }} noWrap>
                    {m.city ?? ""}
                  </Typography>
                </Box>
              </Cell>
              <Cell>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <TierChip tier={m.tier} />
                </Box>
              </Cell>
              <Cell>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <StatusChip status={m.status} />
                </Box>
              </Cell>
              <Cell>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.85rem", color: "text.secondary" }}>
                  {(m.joined_at ?? m.created_at).slice(0, 10)}
                </Box>
              </Cell>
            </Box>
          ))
        )}
      </Box>
    </Stack>
  );
}

function WaitlistPanel() {
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/waitlist", { cache: "no-store" });
      const body = (await res.json()) as { rows?: WaitlistRow[]; error?: string };
      if (!res.ok || body.error) {
        setError(body.error ?? `Failed to load (${res.status})`);
        setRows([]);
        return;
      }
      setRows((body.rows ?? []).filter((r) => "full_name" in r));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const activate = async (signupId: string, fullName: string) => {
    if (!confirm(`Activate ${fullName}? They'll receive a "portal is ready" email.`)) return;
    setActivatingId(signupId);
    try {
      const res = await fetch("/api/admin/members/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waitlist_signup_id: signupId }),
      });
      const body = (await res.json()) as { ok?: boolean; email_sent?: boolean; error?: string };
      if (!res.ok || body.error) {
        setToast(body.error ?? `Activate failed (${res.status})`);
        return;
      }
      setToast(
        body.email_sent
          ? `Activated. Welcome email sent.`
          : `Activated. Welcome email FAILED to send — check email config.`,
      );
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Activate failed.");
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}
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
            gridTemplateColumns: "1.6fr 1.4fr 0.9fr 0.9fr 1fr",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Cell head>Name</Cell>
          <Cell head>Practice</Cell>
          <Cell head>Status</Cell>
          <Cell head>Signed up</Cell>
          <Box />
        </Box>

        {loading ? (
          <Box sx={{ p: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress size={24} sx={{ color: "#A07823" }} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary" }}>No waitlist signups yet.</Typography>
          </Box>
        ) : (
          rows.map((w, i) => {
            const isActive = w.status === "converted";
            return (
              <Box
                key={w.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.6fr 1.4fr 0.9fr 0.9fr 1fr" },
                  alignItems: { md: "center" },
                  gap: { xs: 1.5, md: 2 },
                  px: { xs: 2.5, md: 3 },
                  py: 2,
                  borderBottom: i === rows.length - 1 ? 0 : "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }} noWrap>
                    {w.full_name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                    {w.email}
                  </Typography>
                  {/* Mobile-only: practice + status + date inline */}
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      display: { xs: "flex", md: "none" },
                      mt: 0.75,
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 0.75,
                    }}
                  >
                    <WaitlistStatusChip status={w.status} />
                    {w.practice_name && (
                      <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                        {w.practice_name}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                      · {w.created_at.slice(0, 10)}
                    </Typography>
                  </Stack>
                </Box>
                <Cell>
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <Typography sx={{ fontSize: "0.86rem" }} noWrap>
                      {w.practice_name ?? "—"}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }} noWrap>
                      {w.city_state ?? ""}
                    </Typography>
                  </Box>
                </Cell>
                <Cell>
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <WaitlistStatusChip status={w.status} />
                  </Box>
                </Cell>
                <Cell>
                  <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.85rem", color: "text.secondary" }}>
                    {w.created_at.slice(0, 10)}
                  </Box>
                </Cell>
                {/* Activate button — visible on every screen size */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: { xs: "flex-start", md: "flex-end" },
                    alignItems: "center",
                  }}
                >
                  {activatingId === w.id ? (
                    <CircularProgress size={18} sx={{ color: "#A07823" }} />
                  ) : isActive ? (
                    <Typography sx={{ fontSize: "0.72rem", color: "#1F5C40", fontWeight: 600 }}>
                      ✓ Activated
                    </Typography>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => activate(w.id, w.full_name)}
                      sx={{
                        bgcolor: "#0A1A2F",
                        textTransform: "none",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        px: 1.75,
                        py: 0.5,
                        "&:hover": { bgcolor: "#0F2540" },
                      }}
                    >
                      Activate member
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        message={toast ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Stack>
  );
}

function Cell({ head, children }: { head?: boolean; children?: React.ReactNode }) {
  return (
    <Box
      sx={{
        fontSize: head ? "0.7rem" : "0.9rem",
        fontWeight: head ? 700 : 500,
        letterSpacing: head ? "0.06em" : 0,
        textTransform: head ? "uppercase" : "none",
        color: head ? "text.secondary" : "text.primary",
      }}
    >
      {children}
    </Box>
  );
}

function TierChip({ tier }: { tier: string | null }) {
  const label = tier ?? "—";
  const map: Record<string, { bg: string; color: string }> = {
    Founding: { bg: "rgba(217,168,75,0.16)", color: "#A07823" },
    Premium: { bg: "rgba(14,42,61,0.92)", color: "#FFFFFF" },
    Pro: { bg: "rgba(14,42,61,0.07)", color: "primary.dark" },
    Free: { bg: "grey.200", color: "text.secondary" },
  };
  const s = map[label] ?? { bg: "grey.100", color: "text.secondary" };
  return <Chip label={label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.7rem", height: 22 }} />;
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Active" },
    invited: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "Invited" },
    waitlist: { bg: "rgba(14,42,61,0.07)", color: "primary.dark", label: "Waitlist" },
    paused: { bg: "grey.200", color: "text.secondary", label: "Paused" },
    churned: { bg: "rgba(220,60,60,0.1)", color: "#8C1D1D", label: "Churned" },
  };
  const s = map[status] ?? map.waitlist;
  return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.66rem", height: 20 }} />;
}

function WaitlistStatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    new: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "New" },
    contacted: { bg: "rgba(14,42,61,0.07)", color: "primary.dark", label: "Contacted" },
    converted: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Converted" },
    declined: { bg: "rgba(220,60,60,0.1)", color: "#8C1D1D", label: "Declined" },
  };
  const s = map[status] ?? map.new;
  return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.66rem", height: 20 }} />;
}
