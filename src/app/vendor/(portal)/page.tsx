"use client";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import {
  vendor,
  vendorKpis,
  vendorOwnOffers,
  vendorRedemptions,
  vendorPlans,
} from "@/lib/vendorData";

export default function VendorOverview() {
  const plan = vendorPlans.find((p) => p.id === vendor.planId)!;
  const monthsLeftInWaiver = Math.max(0, 6 - vendor.monthsInProgram);
  const waiverProgress = Math.min(100, (vendor.monthsInProgram / 6) * 100);

  return (
    <Stack spacing={4}>
      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          p: { xs: 3, md: 4.5 },
          color: "common.white",
          backgroundImage: "linear-gradient(135deg, #06182A 0%, #0E2A3D 55%, #1B4258 100%)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(45% 45% at 80% 0%, rgba(217,168,75,0.35) 0%, transparent 60%)",
          }}
        />
        <Grid container spacing={4} sx={{ position: "relative", alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                <Chip
                  icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />}
                  label="VERIFIED PARTNER"
                  size="small"
                  sx={{
                    bgcolor: "rgba(34,108,78,0.18)",
                    color: "#A8E6BD",
                    border: "1px solid rgba(34,108,78,0.4)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    fontWeight: 700,
                    "& .MuiChip-icon": { color: "#A8E6BD" },
                  }}
                />
                <Chip
                  label={`FOUNDING · MONTH ${vendor.monthsInProgram}/12`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(217,168,75,0.16)",
                    color: "secondary.light",
                    border: "1px solid rgba(217,168,75,0.35)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    fontWeight: 700,
                  }}
                />
              </Stack>
              <Typography variant="h2" sx={{ color: "common.white", fontSize: { xs: "2rem", md: "2.75rem" }, mt: 1 }}>
                Welcome back, {vendor.contactName.split(" ")[0]}.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.92)", fontSize: { xs: "1rem", md: "1.08rem" }, lineHeight: 1.55, maxWidth: 540 }}>
                You delivered <strong>${vendorKpis.savingsDeliveredMonth.toLocaleString()}</strong> in
                member savings this month across <strong>{vendorKpis.redemptionsThisMonth}</strong> redemptions.
                {monthsLeftInWaiver > 0
                  ? ` Your founding waiver covers ${monthsLeftInWaiver} more month${monthsLeftInWaiver === 1 ? "" : "s"}.`
                  : ""}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1 }}>
                <Button variant="contained" color="secondary" size="large" component={Link} href="/vendor/offers" startIcon={<AddCircleOutlineOutlinedIcon />}>
                  Create new offer
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/vendor/redemptions"
                  sx={{
                    color: "common.white",
                    borderColor: "rgba(255,255,255,0.25)",
                    bgcolor: "rgba(255,255,255,0.04)",
                    "&:hover": { borderColor: "rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  View redemptions
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: 2.75,
                borderRadius: "16px",
                bgcolor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Typography variant="overline" sx={{ color: "secondary.light", display: "block", mb: 1.25, fontWeight: 700 }}>
                FOUNDING WAIVER
              </Typography>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
                <Typography sx={{ color: "common.white", fontFamily: "var(--font-display)", fontSize: "2.25rem", lineHeight: 1 }}>
                  {monthsLeftInWaiver}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem" }}>
                  months left at $0
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={waiverProgress}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.18)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    backgroundImage: "linear-gradient(90deg, #D9A84B 0%, #F0C16E 100%)",
                  },
                }}
              />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.78rem", mt: 1.5, lineHeight: 1.5 }}>
                Months 7–12 will bill at $49/mo (locked launch rate). Standard $199 from month 13.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* KPI cards */}
      <Grid container spacing={2.5}>
        <Stat
          icon={ReceiptLongOutlinedIcon}
          label="Redemptions · this month"
          value={`${vendorKpis.redemptionsThisMonth}`}
          footer={`${vendorKpis.redemptionsLifetime} lifetime`}
        />
        <Stat
          icon={SavingsOutlinedIcon}
          label="Savings delivered · MTD"
          value={`$${vendorKpis.savingsDeliveredMonth.toLocaleString()}`}
          footer={`$${vendorKpis.savingsDeliveredLifetime.toLocaleString()} lifetime`}
          accent="secondary"
        />
        <Stat
          icon={GroupsOutlinedIcon}
          label="Inbound leads · MTD"
          value={`${vendorKpis.leadsThisMonth}`}
          footer="Section 3 attribution window"
        />
        <Stat
          icon={LocalOfferOutlinedIcon}
          label="Active offers"
          value={`${vendorOwnOffers.filter((o) => o.status === "published").length}`}
          footer={`${vendorKpis.pendingOffersCount} pending review`}
          accent="secondary"
        />
      </Grid>

      <Grid container spacing={3}>
        {/* Recent redemptions */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box
            sx={{
              borderRadius: "20px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "common.white",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.75, borderBottom: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                <Box>
                  <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
                    RECENT REDEMPTIONS
                  </Typography>
                  <Typography variant="h5">Members using your offers</Typography>
                </Box>
                <Box component={Link} href="/vendor/redemptions" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  See all <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Stack>
            </Box>
            <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
              {vendorRedemptions.slice(0, 5).map((r) => (
                <Stack key={r.id} direction="row" sx={{ p: 2, gap: 1.5, alignItems: "center" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }} noWrap>
                      {r.memberDisplay} · {r.city}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                      {r.offerTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 700, color: "success.dark", fontSize: "0.95rem" }}>
                      ${r.amountSaved.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                      {r.redeemedOn}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Offers status */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            sx={{
              borderRadius: "20px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "common.white",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.75, borderBottom: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-end" }}>
                <Box>
                  <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
                    YOUR OFFERS
                  </Typography>
                  <Typography variant="h5">Status</Typography>
                </Box>
                <Box component={Link} href="/vendor/offers" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  Manage <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Stack>
            </Box>
            <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
              {vendorOwnOffers.map((o) => (
                <Box key={o.id} sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 0.5, gap: 1 }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, flex: 1 }} noWrap>
                      {o.title}
                    </Typography>
                    <StatusChip status={o.status} />
                  </Stack>
                  <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                    {o.discountLabel} · {o.redemptions} redemptions
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Plan card */}
          <Box
            sx={{
              mt: 2.5,
              p: 2.75,
              borderRadius: "20px",
              border: "1px solid rgba(217,168,75,0.4)",
              backgroundImage: "linear-gradient(155deg, #FBF6E8 0%, #F4E8C9 100%)",
            }}
          >
            <Typography variant="overline" sx={{ color: "#A07823", display: "block", fontWeight: 700 }}>
              YOUR PLAN
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25, mb: 0.75 }}>
              {plan.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.86rem", mb: 1.5 }}>
              {plan.cadenceLabel}
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="small"
              component={Link}
              href="/vendor/account"
            >
              Manage billing
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  footer,
  accent = "primary",
}: {
  icon: React.ElementType;
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
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: tint.bg,
              border: `1px solid ${tint.border}`,
              display: "grid",
              placeItems: "center",
              color: tint.color,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        </Stack>
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "2.1rem", lineHeight: 1, color: "text.primary" }}>
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

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    published: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Live" },
    pending_review: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "In review" },
    draft: { bg: "grey.200", color: "text.secondary", label: "Draft" },
    paused: { bg: "rgba(14,42,61,0.07)", color: "primary.dark", label: "Paused" },
    rejected: { bg: "rgba(220,60,60,0.12)", color: "#8C1D1D", label: "Rejected" },
  };
  const s = map[status] ?? map.draft;
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.68rem", height: 22 }}
    />
  );
}
