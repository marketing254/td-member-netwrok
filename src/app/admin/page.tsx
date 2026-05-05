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
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import {
  adminKpis,
  adminPendingOffers,
  adminVendors,
  adminHotlineCases,
} from "@/lib/vendorData";

export default function AdminOverviewPage() {
  const foundingProgress = (adminKpis.membersTotal / adminKpis.membersFoundingCap) * 100;
  const pendingVendors = adminVendors.filter((v) => v.status === "pending");
  const criticalCases = adminHotlineCases.filter((c) => c.urgency === "critical" || c.status === "received");

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          ADMIN OVERVIEW
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          Operations dashboard
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 720 }}>
          State of the network at a glance. Action queues are highlighted at the top — clear them first.
        </Typography>
      </Box>

      {/* Action queues */}
      <Box>
        <Typography variant="overline" sx={{ color: "#A07823", display: "block", fontWeight: 700, letterSpacing: "0.18em", mb: 1.5 }}>
          NEEDS YOUR ATTENTION
        </Typography>
        <Grid container spacing={2.5}>
          <ActionQueue
            icon={SupportAgentOutlinedIcon}
            label="Hotline cases"
            count={criticalCases.length}
            detail="open or critical"
            href="/admin/hotline"
            urgency="critical"
          />
          <ActionQueue
            icon={StoreOutlinedIcon}
            label="Vendor approvals"
            count={pendingVendors.length}
            detail="pending review"
            href="/admin/vendors?filter=pending"
            urgency="high"
          />
          <ActionQueue
            icon={LocalOfferOutlinedIcon}
            label="Offer reviews"
            count={adminPendingOffers.length}
            detail="awaiting Reshani"
            href="/admin/offers"
            urgency="high"
          />
          <ActionQueue
            icon={PeopleAltOutlinedIcon}
            label="New members · 7d"
            count={adminKpis.membersThisWeek}
            detail="welcome flow ready"
            href="/admin/members?filter=recent"
          />
        </Grid>
      </Box>

      {/* KPI cards */}
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", fontWeight: 700, letterSpacing: "0.18em", mb: 1.5 }}>
          KEY METRICS
        </Typography>
        <Grid container spacing={2.5}>
          <Stat
            icon={PeopleAltOutlinedIcon}
            label="Total members"
            value={`${adminKpis.membersTotal}`}
            footer={`${(foundingProgress).toFixed(1)}% of founding cap (${adminKpis.membersFoundingCap})`}
          />
          <Stat
            icon={StoreOutlinedIcon}
            label="Active vendors"
            value={`${adminKpis.vendorsActive}`}
            footer={`${adminKpis.vendorsPending} pending · ${adminKpis.vendorsTotal} total`}
            accent="secondary"
          />
          <Stat
            icon={TrendingUpOutlinedIcon}
            label="Member MRR"
            value={`$${adminKpis.mrr.toLocaleString()}`}
            footer={`$${adminKpis.arr.toLocaleString()} ARR · ${(adminKpis.hotlineSlaCompliance * 100).toFixed(0)}% SLA`}
          />
          <Stat
            icon={SavingsOutlinedIcon}
            label="Vendor savings · YTD"
            value={`$${adminKpis.savingsDeliveredYtd.toLocaleString()}`}
            footer={`${adminKpis.redemptionsThisMonth} redemptions this month`}
            accent="secondary"
          />
        </Grid>
      </Box>

      {/* Founding progress */}
      <Box
        sx={{
          p: { xs: 2.75, md: 3.5 },
          borderRadius: "20px",
          backgroundImage: "linear-gradient(135deg, #06182A 0%, #0E2A3D 50%, #1B4258 100%)",
          color: "common.white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(40% 40% at 80% 0%, rgba(217,168,75,0.4) 0%, transparent 60%)",
          }}
        />
        <Grid container spacing={3} sx={{ position: "relative", alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="overline" sx={{ color: "secondary.light", display: "block", fontWeight: 700 }}>
              FOUNDING COHORT
            </Typography>
            <Typography variant="h3" sx={{ color: "common.white", fontSize: { xs: "1.85rem", md: "2.5rem" }, mt: 0.5, mb: 1 }}>
              {adminKpis.membersTotal} of {adminKpis.membersFoundingCap.toLocaleString()} seats claimed
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", maxWidth: 540 }}>
              Once 1,000 founding seats fill, members signing up after pay $199/mo. Lifetime-locked rate is final.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ p: 2.75, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}>
              <Typography sx={{ fontFamily: "var(--font-display)", color: "secondary.light", fontSize: "2.5rem", lineHeight: 1, mb: 1 }}>
                {foundingProgress.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={foundingProgress}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.18)",
                  mb: 1.25,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    backgroundImage: "linear-gradient(90deg, #D9A84B 0%, #F0C16E 100%)",
                  },
                }}
              />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", fontSize: "0.82rem" }}>
                {adminKpis.membersFoundingCap - adminKpis.membersTotal} seats remaining
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Recent activity */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
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
                    HOTLINE TRIAGE
                  </Typography>
                  <Typography variant="h5">Open cases</Typography>
                </Box>
                <Box component={Link} href="/admin/hotline" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  Open queue <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Stack>
            </Box>
            <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
              {adminHotlineCases.slice(0, 4).map((c) => (
                <Box key={c.id} sx={{ p: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={0.75} sx={{ mb: 0.5, flexWrap: "wrap" }}>
                        <Chip label={c.pillar} size="small" sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                        <UrgencyChip urgency={c.urgency} />
                        <CaseStatusChip status={c.status} />
                      </Stack>
                      <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }}>
                        {c.summary}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.25 }}>
                        {c.member} · opened {c.openedAt}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "#A07823", fontWeight: 700, flexShrink: 0, textAlign: "right" }}>
                      {c.slaDueIn}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
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
                    OFFER REVIEW
                  </Typography>
                  <Typography variant="h5">Pending vendor offers</Typography>
                </Box>
                <Box component={Link} href="/admin/offers" sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  Review <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Stack>
            </Box>
            <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
              {adminPendingOffers.map((o) => (
                <Stack key={o.id} direction="row" sx={{ p: 2, alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }}>
                      {o.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                      {o.vendor} · {o.discountLabel}
                    </Typography>
                  </Box>
                  <Button variant="outlined" color="primary" size="small">
                    Review
                  </Button>
                </Stack>
              ))}
              {adminPendingOffers.length === 0 && (
                <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                  <Typography variant="body2">No pending offers — queue is clear.</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}

function ActionQueue({
  icon: Icon,
  label,
  count,
  detail,
  href,
  urgency,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  detail: string;
  href: string;
  urgency?: "critical" | "high";
}) {
  const tint = urgency === "critical"
    ? { bg: "rgba(220,60,60,0.12)", border: "rgba(220,60,60,0.32)", color: "#8C1D1D" }
    : urgency === "high"
      ? { bg: "rgba(217,168,75,0.16)", border: "rgba(217,168,75,0.4)", color: "#A07823" }
      : { bg: "rgba(14,42,61,0.07)", border: "rgba(14,42,61,0.18)", color: "#0E2A3D" };

  return (
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <Box
        component={Link}
        href={href}
        sx={{
          display: "block",
          textDecoration: "none",
          height: "100%",
          p: 2.5,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: tint.border,
          bgcolor: tint.bg,
          transition: "transform 200ms ease, box-shadow 200ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 16px 32px -20px rgba(14,42,61,0.3)",
          },
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.7)", display: "grid", placeItems: "center", color: tint.color }}>
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          <ArrowForwardIcon sx={{ fontSize: 18, color: tint.color }} />
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "baseline" }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "2.1rem", color: tint.color, lineHeight: 1 }}>
            {count}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.78rem", color: tint.color, fontWeight: 600 }}>
            {detail}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: tint.color, mt: 0.5 }}>
          {label}
        </Typography>
      </Box>
    </Grid>
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
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase" }}>
            {label}
          </Typography>
          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: tint.bg, border: `1px solid ${tint.border}`, display: "grid", placeItems: "center", color: tint.color }}>
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

function UrgencyChip({ urgency }: { urgency: "critical" | "high" | "normal" }) {
  const map = {
    critical: { bg: "rgba(220,60,60,0.12)", color: "#8C1D1D", label: "Critical" },
    high: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "High" },
    normal: { bg: "grey.100", color: "text.secondary", label: "Normal" },
  } as const;
  const s = map[urgency];
  return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.62rem", height: 20 }} />;
}

function CaseStatusChip({ status }: { status: string }) {
  const labels: Record<string, string> = {
    received: "New",
    triaged: "Triaged",
    matched: "With expert",
    replied: "Replied",
    resolved: "Resolved",
  };
  return <Chip label={labels[status] ?? status} size="small" sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.62rem", height: 20 }} />;
}
