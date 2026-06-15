"use client";

import { useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

type PlanKey = "founding_monthly" | "founding_annual" | "standard_monthly";

const FOUNDING_PERKS = [
  "Full library access — every kit, every download",
  "1-on-1 coaching with Gary Takacs",
  "Founding rate locked for the lifetime of the product",
];

/**
 * SubscribeCard — the paywall-style call-to-action shown on the member
 * dashboard when a member doesn't have an active subscription yet.
 *
 * Posts to /api/stripe/checkout to start a Checkout Session, then
 * redirects the browser to Stripe's hosted page.
 */
export function SubscribeCard({ firstName }: { firstName: string }) {
  const [plan, setPlan] = useState<PlanKey>("founding_monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok || !body.url) {
        if (body.redirectTo) {
          // Already subscribed — go straight to portal
          const portalRes = await fetch(body.redirectTo, { method: "POST" });
          const portalBody = (await portalRes.json()) as { url?: string };
          if (portalBody.url) {
            window.location.href = portalBody.url;
            return;
          }
        }
        setError(body.error ?? `Checkout failed (${res.status})`);
        return;
      }
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        bgcolor: "#0A1A2F",
        backgroundImage:
          "radial-gradient(50% 60% at 100% 0%, rgba(217,168,75,0.18) 0%, transparent 60%), linear-gradient(135deg, #061322 0%, #0A1A2F 60%, #0F2540 100%)",
        border: "1px solid rgba(217,168,75,0.28)",
        color: "#F6F1E7",
        p: { xs: 2.5, md: 3 },
        boxShadow: "0 16px 40px -24px rgba(14,42,61,0.55)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ alignItems: { md: "flex-start" }, justifyContent: "space-between" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.66rem",
              fontWeight: 800,
              letterSpacing: "0.18em",
              color: "#F0C16E",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Founding membership
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.5rem", md: "1.85rem" },
              fontWeight: 500,
              color: "#FFFFFF",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              mb: 1,
            }}
          >
            Lock in $49/mo, {firstName}.
          </Typography>
          <Typography
            sx={{
              fontSize: "0.92rem",
              color: "rgba(246,241,231,0.75)",
              lineHeight: 1.6,
              maxWidth: 520,
              mb: 2,
            }}
          >
            First 1,000 members get the founding rate, locked for the lifetime of the current product. Cancel any time inside the Stripe customer portal.
          </Typography>
          <Stack spacing={0.75} sx={{ mb: 2.5 }}>
            {FOUNDING_PERKS.map((p) => (
              <Stack key={p} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                <CheckRoundedIcon sx={{ fontSize: 16, color: "#F0C16E", mt: 0.25, flexShrink: 0 }} />
                <Typography
                  sx={{ fontSize: "0.84rem", color: "rgba(246,241,231,0.85)", lineHeight: 1.55 }}
                >
                  {p}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={{ flexShrink: 0, width: { xs: "100%", md: 280 } }}>
          <Stack spacing={1.25}>
            <PlanPicker plan={plan} onChange={setPlan} />
            <Button
              onClick={startCheckout}
              disabled={busy}
              variant="contained"
              size="large"
              disableElevation
              startIcon={
                busy ? (
                  <CircularProgress size={14} sx={{ color: "inherit" }} />
                ) : (
                  <LockOpenRoundedIcon sx={{ fontSize: 18 }} />
                )
              }
              sx={{
                bgcolor: "#F0C16E",
                color: "#0A1A2F",
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 700,
                borderRadius: 1,
                py: 1.25,
                "&:hover": { bgcolor: "#E6B860" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(240,193,110,0.4)",
                  color: "rgba(10,26,47,0.5)",
                },
              }}
            >
              {busy ? "Opening Stripe…" : "Start membership"}
            </Button>
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "rgba(246,241,231,0.55)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Secure checkout via Stripe. No card data touches our servers.
            </Typography>
            {error && (
              <Typography sx={{ fontSize: "0.78rem", color: "#FFB6B6", textAlign: "center" }}>
                {error}
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function PlanPicker({ plan, onChange }: { plan: PlanKey; onChange: (p: PlanKey) => void }) {
  const options: Array<{ value: PlanKey; label: string; price: string; meta: string }> = [
    { value: "founding_monthly", label: "Monthly", price: "$49", meta: "/mo · founding" },
    { value: "founding_annual", label: "Annual", price: "$490", meta: "/yr · save $98" },
  ];
  return (
    <Stack spacing={0.75}>
      {options.map((o) => {
        const active = plan === o.value;
        return (
          <Box
            key={o.value}
            role="button"
            tabIndex={0}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(o.value);
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1.25,
              borderRadius: 1,
              bgcolor: active ? "rgba(240,193,110,0.16)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? "rgba(240,193,110,0.5)" : "rgba(255,255,255,0.08)"}`,
              cursor: "pointer",
              transition:
                "background-color 160ms ease, border-color 160ms ease, transform 160ms ease",
              "&:hover": { bgcolor: active ? "rgba(240,193,110,0.2)" : "rgba(255,255,255,0.07)" },
              "&:focus-visible": { outline: "2px solid #F0C16E", outlineOffset: 2 },
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: active ? "#F0C16E" : "rgba(255,255,255,0.4)",
                bgcolor: active ? "#F0C16E" : "transparent",
                flexShrink: 0,
                transition: "background-color 160ms ease, border-color 160ms ease",
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: active ? "#FFFFFF" : "rgba(246,241,231,0.85)",
                  lineHeight: 1.2,
                }}
              >
                {o.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: "rgba(246,241,231,0.6)",
                  mt: 0.15,
                }}
              >
                {o.price}
                <Box component="span" sx={{ ml: 0.4, opacity: 0.7 }}>
                  {o.meta}
                </Box>
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
