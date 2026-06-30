"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import type { BillingAccess } from "@/lib/stripe";

/**
 * BillingGate
 *
 * Drops in at the top of a portal layout. If `access.allowed === false`,
 * it renders a full-bleed paywall card explaining why the portal is
 * locked and gives the user the two escape routes:
 *
 *   1. Open the Stripe Customer Portal — update card / reactivate.
 *      Wired per-role: `portalEndpoint` is /api/expert/billing/portal
 *      or /api/vendor/billing/portal.
 *
 *   2. Click through to the in-app billing page so they can re-sync
 *      from Stripe if the webhook missed them.
 *
 * Children render normally when `access.allowed === true`, so this is
 * cheap to wrap every page with.
 *
 * The gate is UI-only — the auth guards on each API route are the real
 * enforcement layer. Even if a client bypasses this wall, every write
 * still 402s on the server.
 */
export default function BillingGate({
  access,
  portalEndpoint,
  billingHref,
  accent,
  children,
}: {
  access: BillingAccess;
  portalEndpoint: string;
  billingHref: string;
  accent: "gold" | "green";
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (access.allowed) return <>{children}</>;

  const openPortal = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(portalEndpoint, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setError(body.error ?? "Could not open the Stripe portal. Try the billing page instead.");
        return;
      }
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the Stripe portal.");
    } finally {
      setBusy(false);
    }
  };

  const accentColor = accent === "gold" ? "#A07823" : "#1F5238";
  const accentTint = accent === "gold" ? "rgba(217,168,75,0.12)" : "rgba(44,122,82,0.10)";
  const accentBorder = accent === "gold" ? "rgba(217,168,75,0.4)" : "rgba(44,122,82,0.32)";

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Box
        sx={{
          borderRadius: 3,
          bgcolor: "#FFFFFF",
          border: `1px solid ${accentBorder}`,
          boxShadow: "0 24px 60px -30px rgba(14,42,61,0.18)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: accentTint,
            borderBottom: `1px solid ${accentBorder}`,
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: accentColor,
              color: "#FFFFFF",
              display: "grid",
              placeItems: "center",
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "0.66rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 800,
                color: accentColor,
              }}
            >
              Portal locked
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                fontWeight: 500,
                color: "#0A1A2F",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              {access.title}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography sx={{ color: "#3B4A55", fontSize: "0.95rem", lineHeight: 1.6, mb: 2 }}>
            {access.message}
          </Typography>
          <Stack spacing={1.25}>
            <Button
              onClick={openPortal}
              disabled={busy}
              fullWidth
              variant="contained"
              startIcon={
                busy ? (
                  <CircularProgress size={14} sx={{ color: "inherit" }} />
                ) : (
                  <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                borderRadius: 999,
                py: 1.25,
                bgcolor: accentColor,
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: accent === "gold" ? "#7A5B17" : "#163E2B",
                },
              }}
            >
              {busy ? "Opening Stripe…" : access.cta}
            </Button>
            <Button
              component={Link}
              href={billingHref}
              fullWidth
              variant="outlined"
              sx={{
                borderRadius: 999,
                py: 1.25,
                borderColor: "rgba(14,42,61,0.2)",
                color: "#0A1A2F",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Go to billing page
            </Button>
          </Stack>
          {error && (
            <Typography sx={{ mt: 1.5, fontSize: "0.82rem", color: "#8C1D1D" }}>
              {error}
            </Typography>
          )}
          <Typography sx={{ mt: 2, fontSize: "0.78rem", color: "#7A8590", lineHeight: 1.55 }}>
            Need help? Email partnerships@joindmn.com — we can re-sync your subscription
            manually if the webhook missed your last payment.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
