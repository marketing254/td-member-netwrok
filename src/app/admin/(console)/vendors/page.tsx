"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";

type VendorRow = {
  id: string;
  company_name: string;
  display_name: string;
  category: string | null;
  contact_name: string;
  contact_email: string;
  plan_id: string | null;
  status: "pending_review" | "approved" | "rejected" | "suspended" | "churned";
  verified: boolean;
  created_at: string;
};

type FilterKey = "all" | "pending_review" | "approved" | "suspended" | "rejected";
type ActionKey = "approve" | "reject" | "suspend" | "unsuspend";

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const initial = (params.get("filter") as FilterKey) || "all";
  const [filter, setFilter] = useState<FilterKey>(initial);
  const [rows, setRows] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vendors", { cache: "no-store" });
      const body = (await res.json()) as { rows?: VendorRow[]; error?: string };
      if (!res.ok || body.error) {
        setError(body.error ?? `Failed to load (${res.status})`);
        setRows([]);
        return;
      }
      setRows(body.rows ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (vendorId: string, action: ActionKey) => {
    setActingId(vendorId);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: vendorId, action }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || body.error) {
        setToast(body.error ?? `Action failed (${res.status})`);
        return;
      }
      const verb =
        action === "approve"
          ? "approved & verified"
          : action === "reject"
            ? "rejected"
            : action === "suspend"
              ? "suspended"
              : "reinstated";
      setToast(`Partner ${verb}.`);
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActingId(null);
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      pending_review: rows.filter((r) => r.status === "pending_review").length,
      approved: rows.filter((r) => r.status === "approved").length,
      suspended: rows.filter((r) => r.status === "suspended").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
    }),
    [rows],
  );

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          PARTNERS
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          All partners
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          Approve new applications, manage active partners. Approving a
          partner sets their account to verified and sends them a confirmation
          email so they can publish in the directory.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": { backgroundColor: "secondary.main", height: 3, borderRadius: 999 },
          }}
        >
          {(["all", "pending_review", "approved", "suspended", "rejected"] as FilterKey[]).map((k) => (
            <Tab
              key={k}
              value={k}
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ textTransform: "capitalize" }}>{labelForFilter(k)}</Box>
                  <Chip
                    size="small"
                    label={counts[k]}
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      bgcolor: filter === k ? "rgba(217,168,75,0.18)" : "grey.100",
                      color: filter === k ? "#A07823" : "text.secondary",
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>

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
            gridTemplateColumns: "1.8fr 1.2fr 0.9fr 0.9fr 0.8fr 1.2fr",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Cell head>Partner</Cell>
          <Cell head>Category</Cell>
          <Cell head>Plan</Cell>
          <Cell head>Status</Cell>
          <Cell head>Verified</Cell>
          <Box />
        </Box>

        {loading ? (
          <Box sx={{ p: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress size={24} sx={{ color: "#A07823" }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary" }}>No partners in this view.</Typography>
          </Box>
        ) : (
          filtered.map((v, i) => (
            <Box
              key={v.id}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr auto", md: "1.8fr 1.2fr 0.9fr 0.9fr 0.8fr 1.2fr" },
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
                  {v.company_name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                  {v.contact_name} · {v.contact_email}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ display: { xs: "flex", md: "none" }, mt: 0.75, flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                  <StatusChip status={v.status} />
                  <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                    {v.category ?? "—"}
                  </Typography>
                </Stack>
              </Box>
              <Cell>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.85rem" }} component="span">
                  {v.category ?? "—"}
                </Box>
              </Cell>
              <Cell>
                <Box sx={{ display: { xs: "none", md: "inline-block" } }}>
                  <Chip
                    label={planLabel(v.plan_id)}
                    size="small"
                    sx={{
                      bgcolor: "rgba(14,42,61,0.07)",
                      color: "primary.dark",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      height: 22,
                      textTransform: "capitalize",
                    }}
                  />
                </Box>
              </Cell>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <StatusChip status={v.status} />
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Chip
                  label={v.verified ? "Verified" : "—"}
                  size="small"
                  sx={{
                    bgcolor: v.verified ? "rgba(34,108,78,0.12)" : "rgba(14,42,61,0.06)",
                    color: v.verified ? "#1F5C40" : "text.secondary",
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    height: 22,
                  }}
                />
              </Box>
              <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 0.5, alignItems: "center" }}>
                {actingId === v.id ? (
                  <CircularProgress size={18} sx={{ color: "#A07823" }} />
                ) : (
                  <>
                    {v.status === "pending_review" && (
                      <>
                        <Tooltip title="Approve & verify">
                          <IconButton
                            size="small"
                            sx={{ color: "success.dark" }}
                            onClick={() => runAction(v.id, "approve")}
                          >
                            <CheckCircleOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            sx={{ color: "error.main" }}
                            onClick={() => runAction(v.id, "reject")}
                          >
                            <CancelOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {v.status === "approved" && (
                      <Tooltip title="Suspend">
                        <IconButton
                          size="small"
                          sx={{ color: "text.secondary" }}
                          onClick={() => runAction(v.id, "suspend")}
                        >
                          <PauseCircleOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {v.status === "suspended" && (
                      <Tooltip title="Reinstate">
                        <IconButton
                          size="small"
                          sx={{ color: "success.dark" }}
                          onClick={() => runAction(v.id, "unsuspend")}
                        >
                          <PlayCircleOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {v.status === "rejected" && (
                      <Tooltip title="Approve & verify">
                        <IconButton
                          size="small"
                          sx={{ color: "success.dark" }}
                          onClick={() => runAction(v.id, "approve")}
                        >
                          <CheckCircleOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          ))
        )}
      </Box>

      {filter === "pending_review" && counts.pending_review > 0 && (
        <Stack direction="row" spacing={1.5} sx={{ p: 2.5, borderRadius: "14px", bgcolor: "rgba(217,168,75,0.08)", border: "1px solid rgba(217,168,75,0.32)" }}>
          <Typography variant="body2" sx={{ flex: 1, color: "text.primary", fontSize: "0.92rem" }}>
            <strong>{counts.pending_review} pending application{counts.pending_review === 1 ? "" : "s"}.</strong> SLA: review within 1 business day. Approving sends a confirmation email and unlocks publishing in the partner portal.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={!!actingId}
            onClick={async () => {
              const pending = rows.filter((r) => r.status === "pending_review");
              for (const v of pending) {
                // eslint-disable-next-line no-await-in-loop
                await runAction(v.id, "approve");
              }
            }}
          >
            Bulk approve
          </Button>
        </Stack>
      )}

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

function labelForFilter(k: FilterKey): string {
  if (k === "pending_review") return "Pending";
  if (k === "approved") return "Approved";
  if (k === "suspended") return "Suspended";
  if (k === "rejected") return "Rejected";
  return "All";
}

function planLabel(planId: string | null): string {
  if (planId === "founding") return "Founding";
  if (planId === "annual") return "Annual";
  return "Standard";
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

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending_review: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "Pending" },
    approved: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Approved" },
    suspended: { bg: "rgba(220,60,60,0.12)", color: "#8C1D1D", label: "Suspended" },
    rejected: { bg: "rgba(220,60,60,0.08)", color: "#8C1D1D", label: "Rejected" },
    churned: { bg: "rgba(14,42,61,0.06)", color: "text.secondary", label: "Churned" },
  };
  const s = map[status] ?? map.pending_review;
  return (
    <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.68rem", height: 22 }} />
  );
}
