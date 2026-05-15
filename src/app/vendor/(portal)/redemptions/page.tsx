"use client";
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { vendorKpis, vendorRedemptions } from "@/lib/vendorData";

export default function RedemptionsPage() {
  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            REDEMPTIONS
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
            Members using your offers
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
            Member identities are anonymized to first name + city. Use this view to verify
            attribution on your monthly Vendor Report (Section 3.3).
          </Typography>
        </Box>
        <Button variant="outlined" color="primary" startIcon={<DownloadOutlinedIcon />}>
          Export CSV
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        <BigStat
          icon={ReceiptLongOutlinedIcon}
          label="Redemptions · this month"
          value={`${vendorKpis.redemptionsThisMonth}`}
          footer={`${vendorKpis.redemptionsLifetime} lifetime`}
        />
        <BigStat
          icon={SavingsOutlinedIcon}
          label="Savings delivered · MTD"
          value={`$${vendorKpis.savingsDeliveredMonth.toLocaleString()}`}
          footer={`$${vendorKpis.savingsDeliveredLifetime.toLocaleString()} lifetime`}
          accent="secondary"
        />
        <BigStat
          icon={GroupsOutlinedIcon}
          label="Inbound leads · MTD"
          value={`${vendorKpis.leadsThisMonth}`}
          footer="Captured via in-portal forms"
        />
      </Grid>

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
            gridTemplateColumns: "1.5fr 1.4fr 1fr 0.9fr 0.9fr",
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
          <Cell head>Offer</Cell>
          <Cell head>Date</Cell>
          <Cell head>Saved</Cell>
          <Cell head>Commission</Cell>
        </Box>
        {vendorRedemptions.map((r, i) => (
          <Box
            key={r.id}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "1.5fr 1.4fr 1fr 0.9fr 0.9fr" },
              alignItems: "center",
              gap: 2,
              px: { xs: 2.5, md: 3 },
              py: 2,
              borderBottom: i === vendorRedemptions.length - 1 ? 0 : "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }} noWrap>
                {r.memberDisplay}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                {r.city}
              </Typography>
              {/* mobile-only meta */}
              <Stack direction="row" spacing={1.5} sx={{ display: { xs: "flex", md: "none" }, mt: 0.75, alignItems: "center", color: "text.secondary" }}>
                <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>{r.offerTitle}</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>·</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.75rem", fontWeight: 700, color: "success.dark" }}>
                  ${r.amountSaved.toLocaleString()}
                </Typography>
              </Stack>
            </Box>
            <Cell>
              <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                {r.offerTitle}
              </Box>
            </Cell>
            <Cell>
              <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                {r.redeemedOn}
              </Box>
            </Cell>
            <Cell>
              <Box component="span" sx={{ display: { xs: "none", md: "inline" }, fontWeight: 700, color: "success.dark" }}>
                ${r.amountSaved.toLocaleString()}
              </Box>
            </Cell>
            <Cell>
              <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                {r.commissionAccrued > 0 ? (
                  `$${r.commissionAccrued.toLocaleString()}`
                ) : (
                  <Chip label="Founding · $0" size="small" sx={{ bgcolor: "rgba(217,168,75,0.14)", color: "#A07823", fontWeight: 700, fontSize: "0.68rem", height: 20 }} />
                )}
              </Box>
            </Cell>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}

function BigStat({
  icon: Icon,
  label,
  value,
  footer,
  accent = "primary",
}: {
  icon: React.ElementType<{ sx?: object }>;
  label: string;
  value: string;
  footer?: string;
  accent?: "primary" | "secondary";
}) {
  const tint =
    accent === "secondary"
      ? { bg: "rgba(217,168,75,0.12)", border: "rgba(217,168,75,0.32)", color: "#A07823" }
      : { bg: "rgba(14,42,61,0.07)", border: "rgba(14,42,61,0.18)", color: "#0E2A3D" };
  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Box
        sx={{
          height: "100%",
          p: 2.75,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase" }}>
            {label}
          </Typography>
          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: tint.bg, border: `1px solid ${tint.border}`, display: "grid", placeItems: "center", color: tint.color }}>
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        </Stack>
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: 1, color: "text.primary" }}>
          {value}
        </Typography>
        {footer && (
          <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
            {footer}
          </Typography>
        )}
      </Box>
    </Grid>
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
