"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { COLORS } from "@/theme";
import FoundingCard, { type PromoModule } from "@/components/member/FoundingCard";

type BillingInterval = "monthly" | "annual";
type PlanKey =
  | "founding_monthly"
  | "founding_annual"
  | "early_monthly"
  | "early_annual"
  | "standard_monthly"
  | "standard_annual";

type TierStat = { cap: number; taken: number; remaining: number; isOpen: boolean };
type Availability = { founding: TierStat; early: TierStat };

type AppliedPromo = { code: string; ownerName: string | null; trialDays: number };

/**
 * /upgrade payment card. ONE card — the tier available right now
 * ($49 founding → $99 early → $199 standard as seats fill) in the dark
 * navy/gold FoundingCard design, with the three-state invitation-code
 * module under the CTA. Arriving via a referral link (?ref= or the
 * dmn_ref cookie) auto-applies the owner's promo code when it's active.
 */
export function SubscribeCard({ firstName }: { firstName: string }) {
  const searchParams = useSearchParams();
  const initialInterval: BillingInterval =
    searchParams?.get("interval") === "annual" ? "annual" : "monthly";
  const refParam = searchParams?.get("ref") ?? null;

  const [interval, setInterval] = useState<BillingInterval>(initialInterval);
  const [busy, setBusy] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avail, setAvail] = useState<Availability | null>(null);

  // Invitation-code module state
  const [promoState, setPromoState] = useState<"idle" | "open">("idle");
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/stripe/availability", { cache: "no-store" });
        const body = (await res.json()) as Partial<Availability>;
        if (!active) return;
        setAvail({
          founding: normalise(body.founding, 100),
          early: normalise(body.early, 400),
        });
      } catch {
        if (active) {
          setAvail({
            founding: { cap: 100, taken: 0, remaining: 100, isOpen: true },
            early: { cap: 400, taken: 0, remaining: 400, isOpen: true },
          });
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Referral auto-apply: came through a partner/expert page (?ref= in the
  // URL, or the dmn_ref cookie from middleware) → their promo code lands
  // pre-applied, nothing to remember or type. Silent when the owner has
  // no active code.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/member/promo-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(refParam ? { ref: refParam } : {}),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          valid?: boolean;
          code?: string;
          trialDays?: number;
          ownerName?: string | null;
        };
        if (active && data.valid && data.code) {
          setPromoApplied({
            code: data.code,
            ownerName: data.ownerName ?? null,
            trialDays: data.trialDays ?? 90,
          });
        }
      } catch {
        /* no auto-apply */
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refParam]);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoBusy(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/member/promo-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        valid?: boolean;
        reason?: string;
        code?: string;
        trialDays?: number;
        ownerName?: string | null;
      };
      if (data.valid && data.code) {
        setPromoApplied({
          code: data.code,
          ownerName: data.ownerName ?? null,
          trialDays: data.trialDays ?? 90,
        });
        setPromoState("idle");
        setPromoInput("");
      } else {
        setPromoError(
          data.reason === "inactive"
            ? "That code is no longer available."
            : "That code isn't valid — check the spelling.",
        );
      }
    } catch {
      setPromoError("Couldn't check the code right now. Please try again.");
    } finally {
      setPromoBusy(false);
    }
  };

  const startCheckout = async (plan: PlanKey) => {
    setBusy(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, ...(promoApplied ? { promoCode: promoApplied.code } : {}) }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        redirectTo?: string;
        tierSoldOut?: "founding" | "early";
      };
      if (!res.ok || !body.url) {
        if (body.redirectTo) {
          const portalRes = await fetch(body.redirectTo, { method: "POST" });
          const portalBody = (await portalRes.json().catch(() => ({}))) as { url?: string };
          if (portalBody.url) {
            window.location.href = portalBody.url;
            return;
          }
        }
        if (body.tierSoldOut === "founding") {
          setAvail((cur) =>
            cur ? { ...cur, founding: { ...cur.founding, isOpen: false, remaining: 0 } } : cur,
          );
        } else if (body.tierSoldOut === "early") {
          setAvail((cur) =>
            cur ? { ...cur, early: { ...cur.early, isOpen: false, remaining: 0 } } : cur,
          );
        }
        // 4xx errors from our checkout API are user-friendly (sold out,
        // already subscribed, invalid promo code); trust them. 5xx +
        // network errors collapse to a generic message.
        const safe =
          body.error && res.status >= 400 && res.status < 500
            ? body.error
            : "Couldn't start checkout right now. Please try again.";
        setError(safe);
        return;
      }
      window.location.href = body.url;
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[checkout] failed:", err);
      setError("Couldn't start checkout right now. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  // The tier is decided by availability, not by the member: everyone pays
  // the CURRENT rate ($49 first 100 → $99 to 500 → $199).
  const activeTier: "founding" | "early" | "standard" =
    (avail?.founding.isOpen ?? true) ? "founding" : (avail?.early.isOpen ?? true) ? "early" : "standard";
  const activePlan: PlanKey = `${activeTier}_${interval}` as PlanKey;

  const remaining =
    activeTier === "founding"
      ? avail?.founding.remaining ?? null
      : activeTier === "early"
        ? avail?.early.remaining ?? null
        : null;

  const ctaLabel =
    activeTier === "founding"
      ? "Claim your founding rate"
      : activeTier === "early"
        ? "Claim your early rate"
        : "Start membership";

  const ladder =
    activeTier === "founding"
      ? "Your rate is locked for life. Once the first 100 seats fill, membership is $199."
      : activeTier === "early"
        ? "The founding 100 have filled. Your rate is locked for life; at member 500 the price becomes $199."
        : null;

  const promo: PromoModule = {
    state: promoState,
    input: promoInput,
    busy: promoBusy,
    error: promoError,
    applied: promoApplied,
    onOpen: () => setPromoState("open"),
    onInput: (v) => {
      setPromoInput(v);
      setPromoError(null);
    },
    onApply: () => void applyPromo(),
    onRemove: () => setPromoApplied(null),
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 2.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.35rem", md: "1.6rem" },
              fontWeight: 500,
              color: COLORS.ink,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Welcome, {firstName}. Lock in your rate.
          </Typography>
          <Typography sx={{ color: COLORS.muted, mt: 0.5, fontSize: "0.85rem" }}>
            Your portal unlocks the moment payment is confirmed.
          </Typography>
        </Box>

        <BillingToggle interval={interval} onChange={setInterval} />
      </Stack>

      <Box sx={{ maxWidth: 470, mx: "auto" }}>
        <FoundingCard
          tier={activeTier}
          interval={interval}
          remaining={remaining}
          ctaLabel={busy === activePlan ? "Opening Stripe…" : ctaLabel}
          ctaBusy={busy === activePlan}
          onCta={() => void startCheckout(activePlan)}
          promo={promo}
          note={ladder}
        />
      </Box>

      <Box
        sx={{
          mt: 2.5,
          px: { xs: 1.5, md: 2 },
          py: 1.1,
          borderRadius: 2,
          bgcolor: COLORS.surfaceAlt,
          border: `1px dashed ${COLORS.accent}`,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: "0.78rem", color: COLORS.accentDeep, fontWeight: 600 }}>
          ★ Coming in Phase 2 — Premium: 1-on-1 coaching · practice audit &amp; review · priority Hotline (24–48h) · advanced masterclasses · whole-team seats
        </Typography>
      </Box>

      {error && (
        <Typography sx={{ mt: 1.5, fontSize: "0.85rem", color: "#8C1D1D", textAlign: "center" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

function normalise(v: Partial<TierStat> | undefined, cap: number): TierStat {
  const taken = typeof v?.taken === "number" ? v.taken : 0;
  const capped = typeof v?.cap === "number" ? v.cap : cap;
  const remaining = typeof v?.remaining === "number" ? v.remaining : Math.max(0, capped - taken);
  const isOpen = typeof v?.isOpen === "boolean" ? v.isOpen : remaining > 0;
  return { cap: capped, taken, remaining, isOpen };
}

function BillingToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (i: BillingInterval) => void;
}) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        p: 0.5,
        borderRadius: 999,
        bgcolor: COLORS.surfaceAlt,
        border: `1px solid ${COLORS.line}`,
      }}
    >
      {(["monthly", "annual"] as BillingInterval[]).map((v) => {
        const active = interval === v;
        return (
          <Box
            key={v}
            role="button"
            tabIndex={0}
            onClick={() => onChange(v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(v);
              }
            }}
            sx={{
              px: 2.25,
              py: 0.85,
              borderRadius: 999,
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: active ? "#FFFFFF" : COLORS.ink,
              bgcolor: active ? COLORS.primary : "transparent",
              cursor: "pointer",
              transition: "background-color 160ms ease, color 160ms ease",
              userSelect: "none",
            }}
          >
            {v === "monthly" ? "Monthly" : "Annual · save 2 mo"}
          </Box>
        );
      })}
    </Box>
  );
}
