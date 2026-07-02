"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

/**
 * TrialStartCard — the standard-checkout-style "sign & pay" box shown
 * on first portal login. Modeled on the one-page checkout in the
 * e-sign proposal PDF:
 *
 *   Due today $0.00 · ramp summary · payment element ·
 *   agreement checkbox · "Agree and subscribe"
 *
 * The SetupIntent is prepared on mount so the payment element is
 * usually ready before the user finishes reading — no visible
 * "connecting" state, just a brief skeleton like any standard
 * checkout. The submit button stays disabled until the agreement box
 * is ticked.
 */
const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const AGREEMENT_VERSION = "v1";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripePromise() {
  if (!STRIPE_PK) return null;
  if (!stripePromise) stripePromise = loadStripe(STRIPE_PK);
  return stripePromise;
}

export default function TrialStartCard({
  prepareEndpoint,
  startEndpoint,
  audience,
  onSuccess,
}: {
  prepareEndpoint: string;
  startEndpoint: string;
  audience: "gold" | "green";
  onSuccess?: () => void;
}) {
  const accentColor = audience === "gold" ? "#A07823" : "#2C7A52";
  const accentDeep = audience === "gold" ? "#7A5B17" : "#1F5238";
  const accentTint = audience === "gold" ? "rgba(217,168,75,0.08)" : "rgba(44,122,82,0.08)";
  const agreementLink = audience === "gold" ? "/agreement/vendor" : "/experts";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [prepareError, setPrepareError] = useState<string | null>(null);

  // Prepare the SetupIntent immediately on mount — by the time the user
  // has read the summary and ticked the box, the card fields are ready.
  // NOTE: no once-only ref guard here. React dev StrictMode mounts twice;
  // a ref guard makes the FIRST (discarded) mount own the fetch and the
  // second mount skip it — skeleton forever. Letting each mount fetch is
  // correct: the stale one is discarded via `cancelled`, and an abandoned
  // SetupIntent on Stripe's side is harmless.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(prepareEndpoint, { method: "POST" });
        const body = (await res.json().catch(() => ({}))) as {
          clientSecret?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !body.clientSecret) {
          setPrepareError(body.error ?? "Payment setup is unavailable right now. Refresh to retry.");
          return;
        }
        setClientSecret(body.clientSecret);
      } catch {
        if (!cancelled) {
          setPrepareError("Payment setup is unavailable right now. Refresh to retry.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prepareEndpoint]);

  const stripeInstance = useMemo(() => getStripePromise(), []);

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        bgcolor: "#FFFFFF",
        border: "1px solid rgba(14,42,61,0.10)",
        boxShadow: "0 16px 40px -28px rgba(14,42,61,0.18)",
        overflow: "hidden",
        maxWidth: 560,
        mx: "auto",
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Due today */}
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 2 }}
        >
          <Typography sx={{ fontSize: "0.92rem", color: "#5C6770", fontWeight: 600 }}>
            Due today
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.9rem",
              fontWeight: 600,
              color: "#0A1A2F",
              lineHeight: 1,
            }}
          >
            $0.00
          </Typography>
        </Stack>

        {/* Ramp summary */}
        <Box sx={{ bgcolor: accentTint, borderRadius: 1.5, px: 2, py: 1.5, mb: 2.5 }}>
          <RampLine label="Now to month 6" price="$0/mo" bold />
          <RampLine label="Months 7 to 12" price="$49/mo" />
          <RampLine label="Month 13 onward" price="$199/mo" />
        </Box>

        {/* Payment element — skeleton while it boots, no status text */}
        {prepareError ? (
          <Alert severity="error" sx={{ fontSize: "0.84rem", mb: 2 }}>
            {prepareError}
          </Alert>
        ) : clientSecret ? (
          <Elements
            stripe={stripeInstance}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: accentDeep,
                  fontFamily: "system-ui, sans-serif",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <CheckoutInner
              startEndpoint={startEndpoint}
              accentColor={accentColor}
              accentDeep={accentDeep}
              agreementLink={agreementLink}
              onSuccess={onSuccess}
            />
          </Elements>
        ) : (
          <PaymentSkeleton />
        )}
      </Box>

      {/* Footer strip */}
      <Box
        sx={{
          borderTop: "1px solid rgba(14,42,61,0.06)",
          bgcolor: "#FAFAF7",
          px: 2.5,
          py: 1.25,
        }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", justifyContent: "center" }}>
          <LockRoundedIcon sx={{ fontSize: 13, color: "#7A8590" }} />
          <Typography sx={{ fontSize: "0.74rem", color: "#7A8590", textAlign: "center" }}>
            Card saved securely with Stripe · billing starts month 7 · a copy of your agreement is emailed to you
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

/** Grey placeholder matching the PaymentElement's footprint — standard
 *  checkout skeleton, no "connecting…" copy. */
function PaymentSkeleton() {
  return (
    <Box>
      <Skeleton variant="rounded" height={44} sx={{ mb: 1.25, borderRadius: "8px" }} />
      <Stack direction="row" spacing={1.25} sx={{ mb: 1.25 }}>
        <Skeleton variant="rounded" height={44} sx={{ flex: 1, borderRadius: "8px" }} />
        <Skeleton variant="rounded" height={44} sx={{ flex: 1, borderRadius: "8px" }} />
      </Stack>
      <Skeleton variant="rounded" height={44} sx={{ mb: 2, borderRadius: "8px" }} />
      <Skeleton variant="rounded" height={24} width="70%" sx={{ mb: 2, borderRadius: "6px" }} />
      <Skeleton variant="rounded" height={46} sx={{ borderRadius: "999px" }} />
    </Box>
  );
}

function CheckoutInner({
  startEndpoint,
  accentColor,
  accentDeep,
  agreementLink,
  onSuccess,
}: {
  startEndpoint: string;
  accentColor: string;
  accentDeep: string;
  agreementLink: string;
  onSuccess?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !agreed) return;
    setBusy(true);
    setError(null);

    const { error: confirmErr, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${window.location.pathname}`,
      },
      redirect: "if_required",
    });

    if (confirmErr) {
      setError(confirmErr.message ?? "Your card couldn't be saved. Try again.");
      setBusy(false);
      return;
    }
    if (
      !setupIntent ||
      setupIntent.status !== "succeeded" ||
      typeof setupIntent.payment_method !== "string"
    ) {
      setError("Your card couldn't be saved. Try again.");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(startEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupIntentId: setupIntent.id,
          paymentMethodId: setupIntent.payment_method,
          agreementVersion: AGREEMENT_VERSION,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Something went wrong on our side. Try again.");
        setBusy(false);
        return;
      }
      if (onSuccess) onSuccess();
      window.location.reload();
    } catch {
      setError("Something went wrong on our side. Try again.");
      setBusy(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit}>
      <PaymentElement options={{ layout: "tabs" }} />

      {/* Agreement — one compact line between the card fields and the
          button, like a standard checkout's terms row. */}
      <FormControlLabel
        sx={{ mt: 1.5, mr: 0, alignItems: "flex-start" }}
        control={
          <Checkbox
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            size="small"
            sx={{
              color: accentColor,
              pt: 0.25,
              "&.Mui-checked": { color: accentColor },
            }}
          />
        }
        label={
          <Typography sx={{ fontSize: "0.84rem", color: "#3B4A55", lineHeight: 1.5 }}>
            I agree to the{" "}
            <Box
              component={Link}
              href={agreementLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: accentColor, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2 }}
            >
              DMN Founding Agreement ({AGREEMENT_VERSION})
            </Box>
            .
          </Typography>
        }
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={!stripe || !elements || !agreed || busy}
        sx={{
          mt: 1.5,
          borderRadius: 999,
          py: 1.25,
          fontSize: "0.95rem",
          bgcolor: accentColor,
          color: "#FFFFFF",
          backgroundImage: `linear-gradient(180deg, ${accentColor} 0%, ${accentDeep} 100%)`,
          "&:hover": {
            backgroundImage: `linear-gradient(180deg, ${accentColor} 0%, ${accentDeep} 100%)`,
          },
          "&.Mui-disabled": {
            bgcolor: "rgba(14,42,61,0.08)",
            backgroundImage: "none",
            color: "rgba(14,42,61,0.4)",
          },
        }}
        startIcon={busy ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : null}
      >
        {busy ? "Processing…" : "Agree and subscribe"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 1.5, fontSize: "0.82rem" }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

function RampLine({ label, price, bold }: { label: string; price: string; bold?: boolean }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.35 }}>
      <Typography sx={{ fontSize: "0.85rem", color: bold ? "#0A1A2F" : "#3B4A55", fontWeight: bold ? 700 : 500 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: bold ? "#0A1A2F" : "#3B4A55", fontWeight: bold ? 700 : 500 }}>
        {price}
      </Typography>
    </Stack>
  );
}
