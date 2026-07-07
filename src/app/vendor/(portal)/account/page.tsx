"use client";

import { useEffect, useState } from "react";
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
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import { PageHeader, SectionCard, StatCard, TagPill, portalText } from "@/components/vendor/PortalUI";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { fetchCurrentVendor } from "@/lib/supabase/vendorQueries";
import type { VendorsRow } from "@/lib/supabase/types";
import TrialStartCard from "@/components/shared/TrialStartCard";

type Invoice = {
  id: string;
  number: string | null;
  createdAt: string;
  amountPaid: number;
  amountDue: number;
  currency: string;
  status: string | null;
  description: string | null;
  pdfUrl: string | null;
  hostedUrl: string | null;
};

const PLAN_LABELS: Record<string, { name: string; cadenceLabel: string }> = {
  founding: { name: "Founding Partner", cadenceLabel: "12-month founding cohort · waived months 1-6" },
  standard: { name: "Standard Partner", cadenceLabel: "$199/month, month-to-month" },
};

export default function VendorAccountPage() {
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorsRow | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

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

  // Pull invoices from Stripe as soon as we know there's a customer.
  useEffect(() => {
    if (!vendor?.stripe_customer_id) {
      // No Stripe customer yet (waiver phase) — render the empty state.
      setInvoices([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/vendor/billing/invoices", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          if (active) setInvoices([]);
          return;
        }
        const body = (await res.json()) as { invoices: Invoice[] };
        if (active) setInvoices(body.invoices ?? []);
      } catch {
        if (active) setInvoices([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [vendor?.stripe_customer_id]);

  const openPortal = async () => {
    setPortalBusy(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/vendor/billing/portal", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setPortalError(body.error ?? `Could not open portal (${res.status})`);
        return;
      }
      window.location.href = body.url;
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Could not open portal.");
    } finally {
      setPortalBusy(false);
    }
  };

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
              action={
                vendor.card_brand && vendor.card_last4 ? (
                  <TagPill label="ON FILE" tone="navy" size="sm" />
                ) : (
                  <TagPill label="WAIVED" tone="gold" size="sm" />
                )
              }
            >
              {vendor.card_brand && vendor.card_last4 ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: "#0A1A2F",
                        color: "#F0C16E",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0A1A2F" }}>
                        {capitaliseFirst(vendor.card_brand)} ending {vendor.card_last4}
                      </Typography>
                      <Typography sx={{ ...portalText.body, fontSize: "0.78rem" }}>
                        Default for future charges
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    onClick={openPortal}
                    disabled={portalBusy}
                    size="small"
                    variant="outlined"
                    startIcon={
                      portalBusy ? (
                        <CircularProgress size={12} sx={{ color: "inherit" }} />
                      ) : (
                        <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{
                      borderColor: "rgba(14,42,61,0.18)",
                      color: "#0A1A2F",
                      textTransform: "none",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      borderRadius: 0.75,
                    }}
                  >
                    Update
                  </Button>
                </Stack>
              ) : (
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
              )}
              {portalError && (
                <Typography sx={{ fontSize: "0.74rem", color: "#8C1D1D", mt: 1 }}>
                  {portalError}
                </Typography>
              )}
            </SectionCard>

            <SectionCard title="Cancellation" padding="default">
              <Typography sx={portalText.body}>
                Cancel anytime with <Box component="strong" sx={{ color: "#0A1A2F" }}>30 days&apos; written notice</Box>{" "}
                through this portal. You remain responsible for fees accrued through the effective date of
                termination.
              </Typography>
              <Button
                onClick={openPortal}
                disabled={portalBusy || !vendor.stripe_customer_id}
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
                {vendor.stripe_customer_id ? "Open Stripe portal to cancel" : "Available once subscription is active"}
              </Button>
            </SectionCard>

          </Stack>
        </Grid>
      </Grid>

      {/* Trial-start card — shown on first login after approval. Captures
          the card via SetupIntent + <PaymentElement>, then creates a
          Stripe subscription with 180-day trial. Once trialing/active,
          this card hides and normal billing UI takes over. */}
      {!vendor.stripe_subscription_id && (
        <TrialStartCard
          prepareEndpoint="/api/vendor/billing/trial/prepare"
          startEndpoint="/api/vendor/billing/trial/start"
          audience="gold"
        />
      )}

      {/* Invoices — live from Stripe via /api/vendor/billing/invoices */}
      <SectionCard
        title="Invoices"
        subtitle="Pulled live from Stripe. PDF receipts available for every charge."
        padding="none"
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
          <Box>Description</Box>
          <Box>Amount</Box>
          <Box>Status</Box>
        </Box>
        {invoices === null ? (
          <Stack sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress size={18} sx={{ color: "#A07823" }} />
          </Stack>
        ) : invoices.length === 0 ? (
          <Box sx={{ px: 2, py: 3, color: "#9CA3AB", fontSize: "0.84rem" }}>
            No invoices yet. Your first invoice ships once the waiver period ends.
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
            {invoices.map((inv) => (
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
                    {inv.number ?? inv.id.slice(0, 10)}
                  </Typography>
                </Stack>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.82rem", color: "#3B4A55" }}>
                  {formatInvoiceDate(inv.createdAt)}
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.78rem", color: "#5C6770" }}>
                  {inv.description ?? "—"}
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.86rem", fontWeight: 700, color: "#0A1A2F" }}>
                  ${inv.amountPaid.toFixed(2)}
                </Box>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", justifyContent: { xs: "flex-end", md: "flex-start" } }}>
                  <InvoiceStatusPill status={mapStripeStatusToPill(inv.status)} />
                  {inv.pdfUrl || inv.hostedUrl ? (
                    <Tooltip title="Download PDF">
                      <IconButton
                        component="a"
                        href={inv.pdfUrl ?? inv.hostedUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ color: "#5C6770" }}
                      >
                        <DownloadOutlinedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  );
}

type InvoiceStatus = "paid" | "open" | "due" | "failed";

// Map Stripe's invoice statuses to the 4 visual states the pill knows.
// Anything not in the canonical set becomes "open" so we never throw.
function mapStripeStatusToPill(status: string | null): InvoiceStatus {
  if (status === "paid") return "paid";
  if (status === "uncollectible" || status === "void") return "failed";
  if (status === "open") return "open";
  return "open";
}

function formatInvoiceDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function capitaliseFirst(s: string): string {
  return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;
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

