"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { vendorKpis, vendorRedemptions } from "@/lib/vendorData";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  portalText,
} from "@/components/vendor/PortalUI";

export default function RedemptionsPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return vendorRedemptions;
    return vendorRedemptions.filter(
      (r) =>
        r.memberDisplay.toLowerCase().includes(ql) ||
        r.offerTitle.toLowerCase().includes(ql) ||
        r.city.toLowerCase().includes(ql),
    );
  }, [q]);

  return (
    <Stack spacing={2.5}>
      <PageHeader
        eyebrow="REDEMPTIONS"
        title="Members using your offers"
        subtitle="Member identities are anonymized to first name + city. Use this view to verify attribution on your monthly Vendor Report (Section 3.3)."
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: "rgba(14,42,61,0.18)",
              color: "#0A1A2F",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.06)" },
            }}
          >
            Export CSV
          </Button>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={ReceiptLongOutlinedIcon}
            label="Redemptions, MTD"
            value={String(vendorKpis.redemptionsThisMonth)}
            footer={`${vendorKpis.redemptionsLifetime} lifetime`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={SavingsOutlinedIcon}
            label="Savings delivered, MTD"
            value={`$${vendorKpis.savingsDeliveredMonth.toLocaleString()}`}
            footer={`$${vendorKpis.savingsDeliveredLifetime.toLocaleString()} lifetime`}
            accent="gold"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={GroupsOutlinedIcon}
            label="Inbound leads, MTD"
            value={String(vendorKpis.leadsThisMonth)}
            footer="Captured via in-portal forms"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Avg savings / redemption"
            value={
              vendorKpis.redemptionsLifetime > 0
                ? `$${Math.round(vendorKpis.savingsDeliveredLifetime / vendorKpis.redemptionsLifetime).toLocaleString()}`
                : "—"
            }
            footer="Lifetime average"
            accent="green"
          />
        </Grid>
      </Grid>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}>
        <Typography sx={portalText.sectionTitle}>
          Recent activity · {filtered.length} {filtered.length === 1 ? "row" : "rows"}
        </Typography>
        <TextField
          size="small"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search member, offer, city"
          sx={{
            minWidth: { md: 320 },
            "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", fontSize: "0.84rem", borderRadius: 2 },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ fontSize: 16, color: "#7A8590" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ReceiptLongOutlinedIcon}
          title="No matches"
          body="Adjust the search to see redemptions."
        />
      ) : (
        <SectionCard padding="none">
          {/* Header */}
          <Box
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 2fr) 120px 120px 60px",
              px: 2,
              py: 1.25,
              borderBottom: "1px solid rgba(14,42,61,0.06)",
              bgcolor: "#FBFAF6",
              fontSize: "0.66rem",
              fontWeight: 700,
              color: "#7A8590",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <Box>Member</Box>
            <Box>Offer</Box>
            <Box>Date</Box>
            <Box sx={{ textAlign: "right" }}>Saved</Box>
            <Box />
          </Box>
          <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
            {filtered.map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: { xs: "block", md: "grid" },
                  gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 2fr) 120px 120px 60px",
                  alignItems: "center",
                  px: 2,
                  py: 1.25,
                  gap: 1,
                  "&:hover": { bgcolor: "rgba(14,42,61,0.02)" },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#0A1A2F" }} noWrap>
                    {r.memberDisplay}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#7A8590" }} noWrap>
                    {r.city}
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.82rem", color: "#0A1A2F" }} noWrap>
                    {r.offerTitle}
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.78rem", color: "#5C6770" }}>
                  {r.redeemedOn}
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
                  <Typography sx={{ fontSize: "0.86rem", fontWeight: 700, color: "#1F5C40" }}>
                    ${r.amountSaved.toLocaleString()}
                  </Typography>
                  <Typography sx={portalText.meta}>
                    +${r.commissionAccrued.toLocaleString()} commission
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end" }}>
                  <Tooltip title="Open redemption">
                    <IconButton size="small" sx={{ color: "#5C6770" }}>
                      <OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Mobile-only meta */}
                <Stack direction="row" spacing={1.5} sx={{ display: { xs: "flex", md: "none" }, mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }}>
                  <Typography sx={{ fontSize: "0.78rem", color: "#0A1A2F" }} noWrap>
                    {r.offerTitle}
                  </Typography>
                  <Typography sx={{ fontSize: "0.74rem", color: "#5C6770" }}>{r.redeemedOn}</Typography>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1F5C40" }}>
                    ${r.amountSaved.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </SectionCard>
      )}

      <Typography sx={portalText.meta}>
        Attribution windows follow Section 3.3 of the partnership agreement. Disputes are resolved within 5 business days of submitting a note in the partner hotline.
      </Typography>
    </Stack>
  );
}
