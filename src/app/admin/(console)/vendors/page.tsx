"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { adminVendors } from "@/lib/vendorData";

type FilterKey = "all" | "pending" | "active" | "suspended";

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

  const filtered = useMemo(() => {
    if (filter === "all") return adminVendors;
    return adminVendors.filter((v) => v.status === filter);
  }, [filter]);

  const counts = {
    all: adminVendors.length,
    pending: adminVendors.filter((v) => v.status === "pending").length,
    active: adminVendors.filter((v) => v.status === "active").length,
    suspended: adminVendors.filter((v) => v.status === "suspended").length,
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          VENDORS
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          All vendor partners
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          Approve new applications, manage active partners, and monitor commission accruals. Reshani is the primary owner.
        </Typography>
      </Box>

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
          {(["all", "pending", "active", "suspended"] as FilterKey[]).map((k) => (
            <Tab
              key={k}
              value={k}
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ textTransform: "capitalize" }}>{k}</Box>
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
            gridTemplateColumns: "1.6fr 1.3fr 0.8fr 0.7fr 0.8fr 0.9fr 1fr",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Cell head>Vendor</Cell>
          <Cell head>Category</Cell>
          <Cell head>Plan</Cell>
          <Cell head>Status</Cell>
          <Cell head>Redemptions</Cell>
          <Cell head>Commission</Cell>
          <Box />
        </Box>

        {filtered.map((v, i) => (
          <Box
            key={v.id}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "1.6fr 1.3fr 0.8fr 0.7fr 0.8fr 0.9fr 1fr" },
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
                {v.companyName}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                {v.contactName} · {v.contactEmail}
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ display: { xs: "flex", md: "none" }, mt: 0.75, flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                <StatusChip status={v.status} />
                <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                  {v.category}
                </Typography>
              </Stack>
            </Box>
            <Cell>
              <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.85rem" }} component="span">
                {v.category}
              </Box>
            </Cell>
            <Cell>
              <Box sx={{ display: { xs: "none", md: "inline-block" } }}>
                <Chip label={v.planId === "founding" ? "Founding" : v.planId === "annual" ? "Annual" : "Standard"} size="small" sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.68rem", height: 22, textTransform: "capitalize" }} />
              </Box>
            </Cell>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <StatusChip status={v.status} />
            </Box>
            <Cell>
              <Box sx={{ display: { xs: "none", md: "block" }, fontWeight: 600 }}>
                {v.redemptionsLifetime}
              </Box>
            </Cell>
            <Cell>
              <Box sx={{ display: { xs: "none", md: "block" }, fontWeight: 600, color: v.commissionAccrued > 0 ? "success.dark" : "text.secondary" }}>
                {v.commissionAccrued > 0 ? `$${v.commissionAccrued.toLocaleString()}` : "—"}
              </Box>
            </Cell>
            <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 0.5, alignItems: "center" }}>
              {v.status === "pending" && (
                <>
                  <Tooltip title="Approve">
                    <IconButton size="small" sx={{ color: "success.dark" }}>
                      <CheckCircleOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton size="small" sx={{ color: "error.main" }}>
                      <CancelOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <Tooltip title="Edit profile">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Open vendor">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <OpenInNewOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ))}

        {filtered.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary" }}>No vendors in this view.</Typography>
          </Box>
        )}
      </Box>

      {filter === "pending" && counts.pending > 0 && (
        <Stack direction="row" spacing={1.5} sx={{ p: 2.5, borderRadius: "14px", bgcolor: "rgba(217,168,75,0.08)", border: "1px solid rgba(217,168,75,0.32)" }}>
          <Typography variant="body2" sx={{ flex: 1, color: "text.primary", fontSize: "0.92rem" }}>
            <strong>{counts.pending} pending application{counts.pending === 1 ? "" : "s"}.</strong> SLA: review within 1 business day. Approving creates the vendor account and unlocks their portal.
          </Typography>
          <Button variant="contained" color="primary" size="small">
            Bulk approve
          </Button>
        </Stack>
      )}
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

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "Pending" },
    active: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Active" },
    suspended: { bg: "rgba(220,60,60,0.12)", color: "#8C1D1D", label: "Suspended" },
  };
  const s = map[status] ?? map.pending;
  return (
    <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.68rem", height: 22 }} />
  );
}
