"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
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
    const intervalLabel = expert?.subscription_interval === "year" ? "Annual" : "Monthly";
    const phaseLabel = phase === "launch" ? "Launch (months 1-6)" : phase === "growth" ? "Growth (months 7-12)" : "Standard";
    return `Expert · ${phaseLabel} · ${intervalLabel}`;
  }, [expert?.subscription_interval, phase]);

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
    <Stack spacing={2.5} sx={{ maxWidth: 960, mx: "auto" }}>
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: EXPERT_GREEN_DARK,
            textTransform: "uppercase",
            mb: 1.25,
          }}
        >
          Account & billing
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.7rem", md: "2.2rem" },
            fontWeight: 500,
            color: "#0A1A2F",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            mb: 1,
          }}
        >
          Plan, payment method & invoices
        </Typography>
        <Typography sx={{ color: "#3B4A55", fontSize: "0.95rem", lineHeight: 1.55, maxWidth: 620 }}>
          Your founding rate ladder is locked through month 12. Manage your card and download
          past invoices from the Stripe portal.
        </Typography>
      </Box>

      {/* ---- Current plan card ---- */}
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: "#FBF8F1",
          border: "1px solid rgba(14,42,61,0.08)",
          boxShadow: "0 1px 0 rgba(14,42,61,0.02)",
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid rgba(14,42,61,0.06)" }}>
          <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#0A1A2F" }}>
            Current plan
          </Typography>
          <Typography sx={{ fontSize: "0.76rem", color: "#5C6770", mt: 0.25 }}>
            Managed by Stripe. Changes take effect at the next renewal.
          </Typography>
        </Box>
        <Box sx={{ px: 2.5, py: 2.25 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 3 }}
            sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 0.75,
                    bgcolor: EXPERT_GREEN_TINT,
                    color: EXPERT_GREEN_DARK,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <WorkspacePremiumRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: { xs: "1.2rem", md: "1.35rem" },
                    fontWeight: 500,
                    color: "#0A1A2F",
                  }}
                >
                  {planLabel}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "0.92rem", color: "#3B4A55", ml: 4.75 }}>
                {currentPrice}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "center" } }}>
              {hasSubscription ? (
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
                    borderRadius: 0.75,
                    px: 2,
                    py: 1,
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      bgcolor: EXPERT_GREEN_DARK,
                      backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                    },
                  }}
                >
                  Manage subscription
                </Button>
              ) : (
                <Typography sx={{ fontSize: "0.82rem", color: "#7A8590" }}>
                  Founding waiver — no card needed yet
                </Typography>
              )}
            </Box>
          </Stack>
          {portalError && (
            <Typography sx={{ fontSize: "0.74rem", color: "#8C1D1D", mt: 1 }}>
              {portalError}
            </Typography>
          )}

        </Box>
      </Box>

      {/* ---- Phase ladder ---- */}
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          border: "1px solid rgba(14,42,61,0.08)",
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid rgba(14,42,61,0.06)" }}>
          <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#0A1A2F" }}>
            Pricing ladder
          </Typography>
          <Typography sx={{ fontSize: "0.76rem", color: "#5C6770", mt: 0.25 }}>
            {monthsLeftInWaiver > 0
              ? `${monthsLeftInWaiver} month${monthsLeftInWaiver === 1 ? "" : "s"} left at $0`
              : "Founding waiver complete"}
          </Typography>
        </Box>
        <Stack spacing={0} sx={{ px: 2, py: 2 }}>
          <LadderRow
            period="Months 1-6"
            price="$0/mo"
            note="Founding waiver"
            current={phase === "launch"}
          />
          <LadderRow
            period="Months 7-12"
            price="$49/mo"
            note="Locked launch rate"
            current={phase === "growth"}
          />
          <LadderRow
            period="Month 13+"
            price="$199/mo"
            note="Standard rate · or annual pre-pay $1,990"
            current={phase === "standard"}
          />
        </Stack>
        <Divider />
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: "0.78rem", color: "#5C6770", lineHeight: 1.55 }}>
            ★ <strong>Course revenue split</strong> — when you sell paid courses through DMN,
            you keep 90% (DMN keeps 10%). Paid out monthly to your Stripe Connect account.
          </Typography>
        </Box>
      </Box>

      {/* ---- Add card to start trial ----
          On first login after the team approves, the expert has no
          subscription yet. TrialStartCard collects the card inline
          (Stripe PaymentElement + SetupIntent) and the backend spins
          up a subscription with trial_period_days: 180. Once trialing
          or active, this card hides and the normal plan/card/invoice
          UI takes over. */}
      {!hasSubscription && (
        <TrialStartCard
          prepareEndpoint="/api/expert/billing/trial/prepare"
          startEndpoint="/api/expert/billing/trial/start"
          audience="green"
        />
      )}

      {/* ---- Payment method ---- */}
      {hasSubscription && (
        <Box
          sx={{
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            border: "1px solid rgba(14,42,61,0.08)",
          }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid rgba(14,42,61,0.06)" }}>
            <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#0A1A2F" }}>
              Payment method
            </Typography>
            <Typography sx={{ fontSize: "0.76rem", color: "#5C6770", mt: 0.25 }}>
              Update or replace your card in the Stripe portal.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ px: 2.5, py: 2, alignItems: { sm: "center" }, justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 42,
                  height: 30,
                  borderRadius: 0.75,
                  bgcolor: "#0A1A2F",
                  color: "#F0C16E",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CreditCardRoundedIcon sx={{ fontSize: 16 }} />
              </Box>
              {expert.card_brand && expert.card_last4 ? (
                <Box>
                  <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#0A1A2F" }}>
                    {capitalise(expert.card_brand)} ending {expert.card_last4}
                  </Typography>
                  <Typography sx={{ fontSize: "0.74rem", color: "#7A8590" }}>
                    Default for future charges
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontSize: "0.86rem", color: "#5C6770" }}>
                  No card details available yet.
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
                fontSize: "0.78rem",
                fontWeight: 600,
                borderRadius: 0.75,
              }}
            >
              Update card
            </Button>
          </Stack>
        </Box>
      )}

      {/* ---- Invoices ---- */}
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          border: "1px solid rgba(14,42,61,0.08)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid rgba(14,42,61,0.06)" }}>
          <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#0A1A2F" }}>
            Invoices
          </Typography>
          <Typography sx={{ fontSize: "0.76rem", color: "#5C6770", mt: 0.25 }}>
            Receipts for every charge. Download for your records.
          </Typography>
        </Box>
        {effectiveInvoices === null ? (
          <Stack sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress size={18} sx={{ color: EXPERT_GREEN }} />
          </Stack>
        ) : effectiveInvoices.length === 0 ? (
          <Box sx={{ px: 2.5, py: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: "0.86rem", color: "#5C6770" }}>
              No invoices yet. They&apos;ll appear here after your first charge.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: { xs: "none", sm: "grid" },
                gridTemplateColumns: "1.4fr 2fr 1fr 0.9fr 0.7fr",
                gap: 1,
                px: 2.5,
                py: 1,
                bgcolor: "rgba(14,42,61,0.02)",
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
      </Box>
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
