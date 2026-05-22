"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
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
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  fetchCurrentVendor,
  fetchVendorKpis,
  fetchVendorRedemptions,
  type RedemptionWithOffer,
  type VendorKpis,
} from "@/lib/supabase/vendorQueries";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  portalText,
} from "@/components/vendor/PortalUI";

export default function RedemptionsPage() {
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState<RedemptionWithOffer[]>([]);
  const [kpis, setKpis] = useState<VendorKpis | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();
    (async () => {
      const v = await fetchCurrentVendor(supabase);
      if (!active) return;
      if (!v) {
        setLoading(false);
        return;
      }
      const [k, r] = await Promise.all([
        fetchVendorKpis(supabase, v.id),
        fetchVendorRedemptions(supabase, v.id),
      ]);
      if (!active) return;
      setKpis(k);
      setRedemptions(r);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return redemptions;
    return redemptions.filter(
      (r) =>
        (r.member_display ?? "").toLowerCase().includes(ql) ||
        (r.member_city ?? "").toLowerCase().includes(ql) ||
        (r.offers?.headline ?? "").toLowerCase().includes(ql),
    );
  }, [redemptions, q]);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#A07823" }} />
        <Typography sx={{ color: "#5C6770", fontSize: "0.88rem" }}>Loading redemptions…</Typography>
      </Stack>
    );
  }

  const k = kpis ?? {
    redemptionsThisMonth: 0,
    redemptionsLifetime: 0,
    savingsDeliveredMonth: 0,
    savingsDeliveredLifetime: 0,
    leadsThisMonth: 0,
    pendingOffersCount: 0,
    activeOffersCount: 0,
  };

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
            value={String(k.redemptionsThisMonth)}
            footer={`${k.redemptionsLifetime} lifetime`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={SavingsOutlinedIcon}
            label="Savings delivered, MTD"
            value={`$${k.savingsDeliveredMonth.toLocaleString()}`}
            footer={`$${k.savingsDeliveredLifetime.toLocaleString()} lifetime`}
            accent="gold"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={GroupsOutlinedIcon}
            label="Inbound leads, MTD"
            value={String(k.leadsThisMonth)}
            footer="Bookings + hotline"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Avg savings / redemption"
            value={
              k.redemptionsLifetime > 0
                ? `$${Math.round(k.savingsDeliveredLifetime / k.redemptionsLifetime).toLocaleString()}`
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
          title={redemptions.length === 0 ? "No redemptions yet" : "No matches"}
          body={
            redemptions.length === 0
              ? "Redemptions will appear here once members start using your offers."
              : "Adjust the search to see redemptions."
          }
        />
      ) : (
        <SectionCard padding="none">
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
                    {r.member_display ?? "Member"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", color: "#7A8590" }} noWrap>
                    {r.member_city ?? "—"}
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.82rem", color: "#0A1A2F" }} noWrap>
                    {r.offers?.headline ?? "—"}
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.78rem", color: "#5C6770" }}>
                  {r.redeemed_on}
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
                  <Typography sx={{ fontSize: "0.86rem", fontWeight: 700, color: "#1F5C40" }}>
                    ${Number(r.amount_saved ?? 0).toLocaleString()}
                  </Typography>
                  <Typography sx={portalText.meta}>
                    +${Number(r.commission_accrued ?? 0).toLocaleString()} commission
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end" }}>
                  <Tooltip title="Open redemption">
                    <IconButton size="small" sx={{ color: "#5C6770" }}>
                      <OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ display: { xs: "flex", md: "none" }, mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }}>
                  <Typography sx={{ fontSize: "0.78rem", color: "#0A1A2F" }} noWrap>
                    {r.offers?.headline ?? "—"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.74rem", color: "#5C6770" }}>{r.redeemed_on}</Typography>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1F5C40" }}>
                    ${Number(r.amount_saved ?? 0).toLocaleString()}
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
