"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import { PageHeader, SectionCard, StatCard, TagPill, portalText } from "@/components/vendor/PortalUI";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { fetchCurrentVendor } from "@/lib/supabase/vendorQueries";
import type { VendorsRow } from "@/lib/supabase/types";

type InvoiceStatus = "paid" | "open" | "due" | "failed";

// Invoices aren't wired yet (no billing engine connected). Once Stripe or
// similar lands, replace with a real fetch. For now this is an empty list
// so the UI shows the "no invoices yet" state honestly.
const sampleInvoices: { id: string; number: string; date: string; amount: number; status: InvoiceStatus; period: string }[] = [];

const PLAN_LABELS: Record<string, { name: string; cadenceLabel: string }> = {
  founding: { name: "Founding Partner", cadenceLabel: "12-month founding cohort · waived months 1-6" },
  standard: { name: "Standard Partner", cadenceLabel: "$199/month, month-to-month" },
};

export default function VendorAccountPage() {
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorsRow | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();
    (async () => {
      const v = await fetchCurrentVendor(supabase);
      if (!active) return;
      setVendor(v);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#A07823" }} />
        <Typography sx={{ color: "#5C6770", fontSize: "0.88rem" }}>Loading account…</Typography>
      </Stack>
    );
  }

  if (!vendor) {
    return (
      <SectionCard padding="default">
        <Typography sx={portalText.sectionTitle}>No vendor profile found.</Typography>
      </SectionCard>
    );
  }

  const plan = PLAN_LABELS[vendor.plan_id ?? "founding"] ?? PLAN_LABELS.founding;
  const monthsLeftInWaiver = Math.max(0, 6 - vendor.months_in_program);
  const waiverProgress = Math.min(100, (vendor.months_in_program / 6) * 100);
  const nextBill = monthsLeftInWaiver > 0 ? "$0.00" : vendor.months_in_program < 12 ? "$49.00" : "$199.00";

  return (
    <Stack spacing={2.5}>
      <PageHeader
        eyebrow="ACCOUNT & BILLING"
        title="Plan, payment method & invoices"
        subtitle="Your founding rate is locked through month 12. Manage payment method and download past invoices."
      />

      {/* Stat tiles */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Current plan"
            value={plan.name}
            footer={<Box>{plan.cadenceLabel}</Box>}
            accent="gold"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Next billing"
            value={nextBill}
            footer={`On ${monthsLeftInWaiver > 0 ? "1st next month" : "next renewal"}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Months in program"
            value={`${vendor.months_in_program}/12`}
            footer="Founding term"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Lifetime billed"
            value="$0.00"
            footer="Waiver covers months 1-6"
            accent="green"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Subscription detail */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard
            title="Subscription"
            subtitle="The founding cohort schedule applies for your full first year."
            padding="default"
            action={
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                <TagPill label="FOUNDING" tone="gold" size="sm" />
                <TagPill label="MONTH-TO-MONTH" tone="navy" size="sm" />
              </Stack>
            }
          >
            <Stack spacing={2}>
              {/* Waiver progress */}
              <Box>
                <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0A1A2F" }}>
                    Founding waiver
                  </Typography>
                  <Typography sx={portalText.meta}>
                    {monthsLeftInWaiver} month{monthsLeftInWaiver === 1 ? "" : "s"} left at $0
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={waiverProgress}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    bgcolor: "rgba(14,42,61,0.06)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundImage: "linear-gradient(90deg, #A07823 0%, #F0C16E 100%)",
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* Pricing ladder */}
              <Stack spacing={1.25}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0A1A2F" }}>
                  Pricing ladder
                </Typography>
                <LadderRow
                  period="Months 1-6"
                  price="$0/mo"
                  note="Founding waiver, applies automatically"
                  current={vendor.months_in_program <= 6}
                />
                <LadderRow
                  period="Months 7-12"
                  price="$49/mo"
                  note="Locked launch rate"
                  current={vendor.months_in_program > 6 && vendor.months_in_program <= 12}
                />
                <LadderRow
                  period="Month 13+"
                  price="$199/mo"
                  note="Standard partner rate"
                  current={vendor.months_in_program > 12}
                />
              </Stack>

              <Divider />

              {/* Annual pre-pay teaser */}
              <Box
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1.5,
                  bgcolor: "rgba(217,168,75,0.06)",
                  border: "1px dashed rgba(217,168,75,0.32)",
                }}
              >
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#7A5B17", mb: 0.25 }}>
                  Save with annual pre-pay
                </Typography>
                <Typography sx={portalText.body}>
                  Commit to 12 months at the standard rate and get 2 months free (10 for the price of 12).
                  Available after month 6.
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        {/* Payment method */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={2}>
            <SectionCard
              title="Payment method"
              padding="default"
              action={<TagPill label="WAIVED" tone="gold" size="sm" />}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: "rgba(217,168,75,0.12)",
                    border: "1px solid rgba(217,168,75,0.3)",
                    color: "#A07823",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <VolunteerActivismOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0A1A2F", mb: 0.25 }}>
                    No payment method required yet
                  </Typography>
                  <Typography sx={{ ...portalText.body, fontSize: "0.82rem" }}>
                    Your first {monthsLeftInWaiver === 6 ? "6 months" : `${monthsLeftInWaiver} month${monthsLeftInWaiver === 1 ? "" : "s"}`} are <Box component="strong" sx={{ color: "#7A5B17" }}>completely free</Box> as a founding partner. We&apos;ll ask you to add a card a few weeks before month 7 — billing email is {vendor.billing_email ?? vendor.contact_email}.
                  </Typography>
                </Box>
              </Stack>
            </SectionCard>

            <SectionCard title="Cancellation" padding="default">
              <Typography sx={portalText.body}>
                Cancel anytime with <Box component="strong" sx={{ color: "#0A1A2F" }}>30 days&apos; written notice</Box>{" "}
                through this portal. You remain responsible for fees accrued through the effective date of
                termination.
              </Typography>
              <Button
                size="small"
                sx={{
                  mt: 1.5,
                  color: "#8C1D1D",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  px: 0,
                  "&:hover": { bgcolor: "rgba(220,60,60,0.06)" },
                }}
              >
                Start cancellation
              </Button>
            </SectionCard>

            <SectionCard title="Documents" padding="default">
              <Stack spacing={0.75}>
                <DocLink
                  href="/agreement/vendor"
                  label="Partnership agreement"
                  meta="Active draft · signed at signup"
                />
                <DocLink
                  href="/legal/refund"
                  label="Refund & cancellation policy"
                  meta="Public"
                />
                <DocLink
                  href="/legal/privacy"
                  label="Privacy policy"
                  meta="Public"
                />
              </Stack>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      {/* Invoices */}
      <SectionCard
        title="Invoices"
        subtitle="Download for your records."
        padding="none"
        action={
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: "none",
                fontSize: "0.78rem",
                color: "#0A1A2F",
                "&:hover": { bgcolor: "rgba(14,42,61,0.04)" },
              }}
            >
              Export all
            </Button>
          </Stack>
        }
      >
        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "1fr 120px 1.5fr 120px 80px",
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
          <Box>Invoice</Box>
          <Box>Date</Box>
          <Box>Period</Box>
          <Box>Amount</Box>
          <Box>Status</Box>
        </Box>
        {sampleInvoices.length === 0 ? (
          <Box sx={{ px: 2, py: 3, color: "#9CA3AB", fontSize: "0.84rem" }}>
            No invoices yet. Your first invoice ships next month.
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
            {sampleInvoices.map((inv) => (
              <Box
                key={inv.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr auto", md: "1fr 120px 1.5fr 120px 80px" },
                  alignItems: "center",
                  px: 2,
                  py: 1.25,
                  gap: 1,
                  "&:hover": { bgcolor: "rgba(14,42,61,0.02)" },
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 16, color: "#7A8590" }} />
                  <Typography sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.76rem", color: "#0A1A2F" }}>
                    {inv.number}
                  </Typography>
                </Stack>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.82rem", color: "#3B4A55" }}>{inv.date}</Box>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.78rem", color: "#5C6770" }}>{inv.period}</Box>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.86rem", fontWeight: 700, color: "#0A1A2F" }}>
                  ${inv.amount.toFixed(2)}
                </Box>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", justifyContent: { xs: "flex-end", md: "flex-start" } }}>
                  <InvoiceStatusPill status={inv.status} />
                  <Tooltip title="Download PDF">
                    <IconButton size="small" sx={{ color: "#5C6770" }}>
                      <DownloadOutlinedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  );
}

function LadderRow({
  period,
  price,
  note,
  current,
}: {
  period: string;
  price: string;
  note: string;
  current: boolean;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        px: 1.5,
        py: 1,
        borderRadius: 1,
        bgcolor: current ? "rgba(217,168,75,0.06)" : "transparent",
        border: current ? "1px solid rgba(217,168,75,0.3)" : "1px solid transparent",
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: current ? "#A07823" : "rgba(14,42,61,0.18)",
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: "#0A1A2F" }}>{period}</Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#7A8590" }}>· {note}</Typography>
        </Stack>
      </Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.05rem",
          fontWeight: 600,
          color: current ? "#A07823" : "#0A1A2F",
        }}
      >
        {price}
      </Typography>
      {current && <TagPill label="CURRENT" tone="gold" size="sm" />}
    </Stack>
  );
}

function InvoiceStatusPill({ status }: { status: InvoiceStatus }) {
  const map: Record<InvoiceStatus, { label: string; bg: string; fg: string; border: string }> = {
    paid: { label: "Paid", bg: "rgba(34,108,78,0.1)", fg: "#1F5C40", border: "rgba(34,108,78,0.28)" },
    open: { label: "Open", bg: "rgba(217,168,75,0.14)", fg: "#A07823", border: "rgba(217,168,75,0.32)" },
    due: { label: "Due", bg: "rgba(217,168,75,0.14)", fg: "#A07823", border: "rgba(217,168,75,0.32)" },
    failed: { label: "Failed", bg: "rgba(220,60,60,0.1)", fg: "#8C1D1D", border: "rgba(220,60,60,0.26)" },
  };
  const p = map[status];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.85,
        height: 20,
        borderRadius: 0.75,
        bgcolor: p.bg,
        color: p.fg,
        border: `1px solid ${p.border}`,
        fontSize: "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: p.fg }} />
      {p.label}
    </Box>
  );
}

function DocLink({ href, label, meta }: { href: string; label: string; meta?: string }) {
  return (
    <Box
      component={Link}
      href={href}
      target={href.startsWith("/") ? undefined : "_blank"}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 0.75,
        textDecoration: "none",
        color: "#0A1A2F",
        borderRadius: 1,
        px: 1,
        ml: -1,
        "&:hover": { bgcolor: "rgba(14,42,61,0.04)", color: "#A07823" },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.84rem", fontWeight: 600 }} noWrap>
          {label}
        </Typography>
        {meta && <Typography sx={portalText.meta}>{meta}</Typography>}
      </Box>
      <OpenInNewOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AB", flexShrink: 0 }} />
    </Box>
  );
}
