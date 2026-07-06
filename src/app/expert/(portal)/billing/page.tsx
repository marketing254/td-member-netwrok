"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { ExpertsRow } from "@/lib/supabase/types";
import { phaseForMonth, priceLabelForPhase } from "@/lib/stripe";
import TrialStartCard from "@/components/shared/TrialStartCard";

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";
const EXPERT_GREEN_TINT = "#E8F2EC";

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

/**
 * Expert billing — mirrors the structure of the member BillingSection
 * but adapted to the expert phase ladder ($0/$49/$199 over months 1-6,
 * 7-12, 13+). Adds a "phase ladder" card showing where the expert is
 * today and what's next.
 */
export default function ExpertBillingPage() {
  const [expert, setExpert] = useState<ExpertsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email?.toLowerCase();
      if (!email) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("experts")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      if (!active) return;
      setExpert(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!expert?.stripe_customer_id) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/expert/billing/invoices", { cache: "no-store" });
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
  }, [expert?.stripe_customer_id]);

  const effectiveInvoices: Invoice[] | null = expert?.stripe_customer_id ? invoices : [];

  const openPortal = async () => {
    setPortalBusy(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/expert/billing/portal", { method: "POST" });
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

  const monthsInProgram = expert?.months_in_program ?? 0;
  const phase = phaseForMonth(monthsInProgram);
  const currentPrice = priceLabelForPhase(phase);
  const monthsLeftInWaiver = Math.max(0, 6 - monthsInProgram);
  const hasSubscription = !!expert?.stripe_subscription_id;

  const planLabel = useMemo(() => {
    const phaseLabel = phase === "launch" ? "Launch" : phase === "growth" ? "Growth" : "Standard";
    return `Featured Expert · ${phaseLabel}`;
  }, [phase]);

  const status = useMemo(() => {
    const s = expert?.subscription_status;
    if (s === "trialing") return { label: "Trialing", tone: "leaf" as const };
    if (s === "active") return { label: "Active", tone: "leaf" as const };
    if (s === "past_due" || s === "unpaid") return { label: "Payment due", tone: "gold" as const };
    if (s === "canceled" || s === "incomplete_expired") return { label: "Canceled", tone: "red" as const };
    if (hasSubscription) return { label: "Active", tone: "leaf" as const };
    return { label: "Not started", tone: "grey" as const };
  }, [expert?.subscription_status, hasSubscription]);

  const renewalLabel = useMemo(() => {
    if (!expert?.current_period_end) return null;
    const d = formatDate(expert.current_period_end);
    return expert.cancel_at_period_end ? `Ends ${d}` : `Renews ${d}`;
  }, [expert?.current_period_end, expert?.cancel_at_period_end]);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 12 }}>
        <CircularProgress size={32} sx={{ color: EXPERT_GREEN }} />
      </Stack>
    );
  }

  if (!expert) {
    return (
      <Box>
        <Typography sx={{ fontSize: "0.92rem", color: "#5C6770" }}>
          No expert profile found for this account.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 880, mx: "auto" }}>
      {/* Page header */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: EXPERT_GREEN_DARK,
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Account &amp; billing
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.6rem", md: "2rem" },
            fontWeight: 500,
            color: "#0A1A2F",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          Plan &amp; billing
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "0.92rem", lineHeight: 1.55, mt: 0.5, maxWidth: 560 }}>
          Manage your subscription, payment method, and invoices. Everything is handled
          securely through Stripe.
        </Typography>
      </Box>

      {/* ---- Trial-start (no subscription yet) ---- */}
      {!hasSubscription && (
        <TrialStartCard
          prepareEndpoint="/api/expert/billing/trial/prepare"
          startEndpoint="/api/expert/billing/trial/start"
          audience="green"
        />
      )}

      {/* ---- Current plan ---- */}
      {hasSubscription && (
        <SectionCard title="Current plan" subtitle="Managed by Stripe. Changes take effect at the next renewal.">
          <Box sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.25,
                    bgcolor: EXPERT_GREEN_TINT,
                    color: EXPERT_GREEN_DARK,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <WorkspacePremiumRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.25rem",
                      fontWeight: 500,
                      color: "#0A1A2F",
                      lineHeight: 1.2,
                    }}
                  >
                    {planLabel}
                  </Typography>
                  <Typography sx={{ fontSize: "0.88rem", color: "#5C6770", mt: 0.25 }}>
                    {currentPrice}
                  </Typography>
                </Box>
              </Stack>
              <Button
                onClick={openPortal}
                disabled={portalBusy}
                variant="contained"
                disableElevation
                startIcon={
                  portalBusy ? (
                    <CircularProgress size={14} sx={{ color: "inherit" }} />
                  ) : (
                    <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  bgcolor: EXPERT_GREEN,
                  backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  borderRadius: 1,
                  px: 2,
                  py: 0.9,
                  flexShrink: 0,
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                  },
                }}
              >
                Manage subscription
              </Button>
            </Stack>

            {/* Meta row — status + renewal, aligned key/value pills */}
            <Stack direction="row" spacing={3} sx={{ mt: 2.5, pt: 2, borderTop: "1px solid rgba(14,42,61,0.06)", flexWrap: "wrap", rowGap: 1.5 }}>
              <MetaItem label="Status">
                <StatusPill label={status.label} tone={status.tone} />
              </MetaItem>
              {renewalLabel && <MetaItem label="Billing">{renewalLabel}</MetaItem>}
              <MetaItem label="Course revenue">You keep 90%</MetaItem>
            </Stack>

            {portalError && (
              <Typography sx={{ fontSize: "0.76rem", color: "#8C1D1D", mt: 1.5 }}>
                {portalError}
              </Typography>
            )}
          </Box>
        </SectionCard>
      )}

      {/* ---- Payment method ---- */}
      {hasSubscription && (
        <SectionCard title="Payment method" subtitle="Update or replace your card in the Stripe portal.">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ p: { xs: 2, md: 2.5 }, alignItems: { sm: "center" }, justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 46,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: "#0A1A2F",
                  color: "#F0C16E",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <CreditCardRoundedIcon sx={{ fontSize: 17 }} />
              </Box>
              {expert.card_brand && expert.card_last4 ? (
                <Box>
                  <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#0A1A2F" }}>
                    {capitalise(expert.card_brand)} ending {expert.card_last4}
                  </Typography>
                  <Typography sx={{ fontSize: "0.76rem", color: "#7A8590" }}>
                    Default for future charges
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontSize: "0.88rem", color: "#5C6770" }}>
                  No card on file yet.
                </Typography>
              )}
            </Stack>
            <Button
              onClick={openPortal}
              disabled={portalBusy}
              variant="outlined"
              size="small"
              sx={{
                borderColor: "rgba(14,42,61,0.18)",
                color: "#0A1A2F",
                textTransform: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                borderRadius: 1,
                px: 1.75,
                flexShrink: 0,
                width: { xs: "100%", sm: "auto" },
                "&:hover": { borderColor: EXPERT_GREEN, bgcolor: EXPERT_GREEN_TINT },
              }}
            >
              Update card
            </Button>
          </Stack>
        </SectionCard>
      )}

      {/* ---- Pricing ladder ---- */}
      <SectionCard
        title="Pricing ladder"
        subtitle={
          monthsLeftInWaiver > 0
            ? `${monthsLeftInWaiver} month${monthsLeftInWaiver === 1 ? "" : "s"} left at $0`
            : "Founding waiver complete"
        }
      >
        <Stack spacing={0.75} sx={{ p: { xs: 1.5, md: 2 } }}>
          <LadderRow period="Months 1–6" price="$0/mo" note="Founding waiver" current={phase === "launch"} />
          <LadderRow period="Months 7–12" price="$49/mo" note="Locked launch rate" current={phase === "growth"} />
          <LadderRow period="Month 13+" price="$199/mo" note="Standard · or $1,990/yr annual" current={phase === "standard"} />
        </Stack>
        <Box sx={{ px: 2.5, py: 1.75, borderTop: "1px solid rgba(14,42,61,0.06)", bgcolor: "#FBFAF6" }}>
          <Typography sx={{ fontSize: "0.8rem", color: "#5C6770", lineHeight: 1.55 }}>
            <Box component="strong" sx={{ color: "#0A1A2F" }}>Course revenue split</Box> — sell paid
            courses through DMN and keep 90% (DMN keeps 10%), paid out monthly via Stripe Connect.
          </Typography>
        </Box>
      </SectionCard>

      {/* ---- Invoices ---- */}
      <SectionCard title="Invoices" subtitle="Receipts for every charge. Download for your records.">
        {effectiveInvoices === null ? (
          <Stack sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress size={18} sx={{ color: EXPERT_GREEN }} />
          </Stack>
        ) : effectiveInvoices.length === 0 ? (
          <Box sx={{ px: 2.5, py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "0.86rem", color: "#7A8590" }}>
              No invoices yet. They&apos;ll appear here after your first charge.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: { xs: "none", sm: "grid" },
                gridTemplateColumns: "1.3fr 2fr 1fr 0.9fr 0.6fr",
                gap: 1,
                px: 2.5,
                py: 1.25,
                bgcolor: "#FBFAF6",
                borderBottom: "1px solid rgba(14,42,61,0.06)",
              }}
            >
              <HeaderCell>Date</HeaderCell>
              <HeaderCell>Description</HeaderCell>
              <HeaderCell align="right">Amount</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell align="right">PDF</HeaderCell>
            </Box>
            {effectiveInvoices.map((inv) => (
              <InvoiceRow key={inv.id} invoice={inv} />
            ))}
          </Box>
        )}
      </SectionCard>
    </Stack>
  );
}

/**
 * SectionCard — the single card primitive every billing section uses so
 * they all share the exact same border, radius, header strip, and body
 * padding. This is what makes the page read as one aligned, professional
 * surface instead of a stack of mismatched boxes.
 */
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        bgcolor: "#FFFFFF",
        border: "1px solid rgba(14,42,61,0.09)",
        boxShadow: "0 1px 2px rgba(14,42,61,0.03)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid rgba(14,42,61,0.07)" }}>
        <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#0A1A2F" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: "0.78rem", color: "#7A8590", mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {children}
    </Box>
  );
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: "0.64rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#9CA3AB",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: "0.86rem", fontWeight: 600, color: "#0A1A2F" }}>{children}</Box>
    </Box>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "leaf" | "gold" | "red" | "grey" }) {
  const p =
    tone === "leaf"
      ? { bg: "rgba(34,108,78,0.1)", fg: "#1F5C40" }
      : tone === "gold"
        ? { bg: "rgba(217,168,75,0.16)", fg: "#7A5B17" }
        : tone === "red"
          ? { bg: "rgba(140,29,29,0.08)", fg: "#8C1D1D" }
          : { bg: "rgba(14,42,61,0.05)", fg: "#5C6770" };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 0.9,
        py: 0.35,
        borderRadius: 0.75,
        bgcolor: p.bg,
        color: p.fg,
        fontSize: "0.72rem",
        fontWeight: 700,
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: p.fg }} />
      {label}
    </Box>
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
        py: 1.25,
        borderRadius: 1,
        bgcolor: current ? EXPERT_GREEN_TINT : "transparent",
        border: current ? `1px solid ${EXPERT_GREEN}55` : "1px solid transparent",
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: current ? EXPERT_GREEN : "rgba(14,42,61,0.18)",
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.86rem", fontWeight: 700, color: "#0A1A2F" }}>
            {period}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#7A8590" }}>· {note}</Typography>
        </Stack>
      </Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.05rem",
          fontWeight: 600,
          color: current ? EXPERT_GREEN_DARK : "#0A1A2F",
        }}
      >
        {price}
      </Typography>
      {current && (
        <Box
          component="span"
          sx={{
            ml: 0.5,
            px: 0.85,
            py: 0.2,
            borderRadius: 0.75,
            bgcolor: EXPERT_GREEN,
            color: "#FFFFFF",
            fontSize: "0.62rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Current
        </Box>
      )}
    </Stack>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const amount = `$${invoice.amountPaid.toFixed(2)}`;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1.4fr 2fr 1fr 0.9fr 0.7fr" },
        gap: { xs: 0.5, sm: 1 },
        px: { xs: 2, sm: 2.5 },
        py: 1.5,
        borderBottom: "1px solid rgba(14,42,61,0.04)",
        alignItems: { sm: "center" },
        "&:last-of-type": { borderBottom: "none" },
        "&:hover": { bgcolor: "rgba(14,42,61,0.015)" },
      }}
    >
      <Box>
        <Typography sx={{ fontSize: "0.84rem", color: "#0A1A2F", fontWeight: 500 }}>
          {formatDate(invoice.createdAt)}
        </Typography>
        <Typography sx={{ display: { xs: "block", sm: "none" }, fontSize: "0.74rem", color: "#7A8590" }}>
          {invoice.description ?? "—"}
        </Typography>
      </Box>
      <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.84rem", color: "#3B4A55" }} noWrap>
          {invoice.description ?? "—"}
        </Typography>
      </Box>
      <Box sx={{ textAlign: { sm: "right" }, display: { xs: "flex", sm: "block" }, justifyContent: "space-between" }}>
        <Box component="span" sx={{ display: { xs: "inline", sm: "none" }, fontSize: "0.72rem", color: "#7A8590" }}>
          Amount
        </Box>
        <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, color: "#0A1A2F" }}>
          {amount}
        </Typography>
      </Box>
      <Box sx={{ display: { xs: "flex", sm: "block" }, justifyContent: "space-between" }}>
        <Box component="span" sx={{ display: { xs: "inline", sm: "none" }, fontSize: "0.72rem", color: "#7A8590" }}>
          Status
        </Box>
        <InvoiceStatus status={invoice.status} />
      </Box>
      <Box sx={{ textAlign: { sm: "right" } }}>
        {invoice.pdfUrl || invoice.hostedUrl ? (
          <Button
            component="a"
            href={invoice.pdfUrl ?? invoice.hostedUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<DownloadRoundedIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: "none",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: EXPERT_GREEN_DARK,
              minWidth: "auto",
              p: 0.5,
              "&:hover": { bgcolor: EXPERT_GREEN_TINT },
            }}
          >
            PDF
          </Button>
        ) : (
          <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AB" }}>—</Typography>
        )}
      </Box>
    </Box>
  );
}

function InvoiceStatus({ status }: { status: string | null }) {
  const palette =
    status === "paid"
      ? { bg: "rgba(34,108,78,0.1)", fg: "#1F5C40", border: "rgba(34,108,78,0.28)" }
      : status === "open"
        ? { bg: "rgba(217,168,75,0.14)", fg: "#7A5B17", border: "rgba(217,168,75,0.36)" }
        : status === "void" || status === "uncollectible"
          ? { bg: "rgba(140,29,29,0.06)", fg: "#8C1D1D", border: "rgba(140,29,29,0.24)" }
          : { bg: "rgba(14,42,61,0.04)", fg: "#5C6770", border: "rgba(14,42,61,0.12)" };
  const label = status ? capitalise(status) : "—";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        height: 18,
        px: 0.75,
        borderRadius: 0.5,
        bgcolor: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        fontSize: "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: palette.fg, opacity: 0.85 }} />
      {label}
    </Box>
  );
}

function HeaderCell({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <Typography
      sx={{
        fontSize: "0.62rem",
        fontWeight: 700,
        letterSpacing: "0.14em",
        color: "#7A8590",
        textTransform: "uppercase",
        textAlign: align,
      }}
    >
      {children}
    </Typography>
  );
}

function formatDate(iso: string): string {
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

function capitalise(s: string): string {
  return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
