"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { COLORS } from "@/theme";

type BillingInterval = "monthly" | "annual";
type PlanKey =
  | "founding_monthly"
  | "founding_annual"
  | "early_monthly"
  | "early_annual"
  | "standard_monthly"
  | "standard_annual";

const UNIVERSAL_PERKS = [
  "Expert Hotline — written action plan in 2–3 days",
  "Full video course library",
  "New resources every week",
  "Live webinars, events & roundtables (CE)",
  "Templates & worksheets",
  "Community access",
  "A growing bench of experts",
];

const FOUNDING_PERKS = [
  "Price locked for life",
  "“Founding Member” status",
  "A vote in the content roadmap",
  "Early access to new kits",
];

const EARLY_PERKS = [
  "Price locked for life",
  "“Founding Member” status",
  "Early access to new kits",
];

const STANDARD_PERKS = ["Standard rate", "Open enrollment", "Full core membership"];

type TierStat = { cap: number; taken: number; remaining: number; isOpen: boolean };
type Availability = { founding: TierStat; early: TierStat };

export function SubscribeCard({ firstName }: { firstName: string }) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [busy, setBusy] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avail, setAvail] = useState<Availability | null>(null);

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

  const startCheckout = async (plan: PlanKey) => {
    setBusy(plan);
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
        setError(body.error ?? `Checkout failed (${res.status})`);
        return;
      }
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setBusy(null);
    }
  };

  const foundingPlan: PlanKey = interval === "monthly" ? "founding_monthly" : "founding_annual";
  const earlyPlan: PlanKey = interval === "monthly" ? "early_monthly" : "early_annual";
  const standardPlan: PlanKey = interval === "monthly" ? "standard_monthly" : "standard_annual";
  const foundingOpen = avail?.founding.isOpen ?? true;
  const earlyOpen = avail?.early.isOpen ?? true;

  const columnCount = (foundingOpen ? 1 : 0) + (earlyOpen ? 1 : 0) + 1;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: COLORS.accentDeep,
              mb: 0.5,
            }}
          >
            Activate your membership
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.6rem", md: "2rem" },
              fontWeight: 500,
              color: COLORS.ink,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Welcome, {firstName}. Pick your plan.
          </Typography>
          <Typography sx={{ color: COLORS.muted, mt: 1, maxWidth: 560, fontSize: "0.92rem" }}>
            Your portal unlocks the moment payment is confirmed.
          </Typography>
        </Box>

        <BillingToggle interval={interval} onChange={setInterval} />
      </Stack>

      <UniversalPerksBanner perks={UNIVERSAL_PERKS} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: `repeat(${columnCount}, 1fr)` },
          gap: 2.5,
          mt: 3,
        }}
      >
        {foundingOpen && (
          <PlanCard
            tier="founding"
            title="Founding"
            subtitle="First 100 members"
            ribbon={`★ BEST VALUE — ${avail?.founding.remaining ?? 100} OF 100 LEFT`}
            price={interval === "monthly" ? "$49" : "$490"}
            per={interval === "monthly" ? "mo" : "yr"}
            sub={interval === "monthly" ? "or $490/year" : "$40.83/mo equivalent"}
            save={interval === "annual" ? "Save $98" : undefined}
            sectionTitle="WHAT MAKES IT SPECIAL"
            perks={FOUNDING_PERKS}
            footnote="No trial — 30-day money-back guarantee · Cancel anytime"
            cta={busy === foundingPlan ? "Opening Stripe…" : "Claim founding seat"}
            busy={busy === foundingPlan}
            onClick={() => startCheckout(foundingPlan)}
          />
        )}

        {earlyOpen && (
          <PlanCard
            tier="early"
            title="Early Member"
            subtitle="Members 101–500"
            ribbon={!foundingOpen ? `${avail?.early.remaining ?? 400} OF 400 LEFT` : undefined}
            price={interval === "monthly" ? "$99" : "$990"}
            per={interval === "monthly" ? "mo" : "yr"}
            sub={interval === "monthly" ? "or $990/year" : "$82.50/mo equivalent"}
            save={interval === "annual" ? "Save $198" : undefined}
            sectionTitle="WHAT MAKES IT SPECIAL"
            perks={EARLY_PERKS}
            footnote="30-day money-back guarantee · Cancel anytime"
            cta={busy === earlyPlan ? "Opening Stripe…" : "Join as Early Member"}
            busy={busy === earlyPlan}
            onClick={() => startCheckout(earlyPlan)}
          />
        )}

        <PlanCard
          tier="standard"
          title="Standard"
          subtitle="Regular membership"
          price={interval === "monthly" ? "$199" : "$1,990"}
          per={interval === "monthly" ? "mo" : "yr"}
          sub={interval === "monthly" ? "or $1,990/year" : "$165.83/mo equivalent"}
          save={interval === "annual" ? "Save $398" : undefined}
          sectionTitle="DETAILS"
          perks={STANDARD_PERKS}
          footnote="14-day free trial · Cancel anytime"
          cta={busy === standardPlan ? "Opening Stripe…" : "Start membership"}
          busy={busy === standardPlan}
          onClick={() => startCheckout(standardPlan)}
        />
      </Box>

      <Box
        sx={{
          mt: 3,
          px: { xs: 2, md: 3 },
          py: 1.75,
          borderRadius: 2,
          bgcolor: COLORS.surfaceAlt,
          border: `1px dashed ${COLORS.accent}`,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: "0.85rem", color: COLORS.accentDeep, fontWeight: 600 }}>
          ★ Coming in Phase 2 — Premium: 1-on-1 coaching · practice audit &amp; review · priority Hotline (24–48h) · advanced masterclasses · whole-team seats
        </Typography>
      </Box>

      {error && (
        <Typography sx={{ mt: 2, fontSize: "0.85rem", color: "#8C1D1D", textAlign: "center" }}>
          {error}
        </Typography>
      )}

      <Typography
        sx={{ mt: 2.5, fontSize: "0.78rem", color: COLORS.muted, textAlign: "center" }}
      >
        Cancel anytime · 30-day money-back guarantee on Founding &amp; Early · Secure checkout via Stripe
      </Typography>
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

function UniversalPerksBanner({ perks }: { perks: string[] }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: COLORS.surfaceAlt,
        border: `1px solid ${COLORS.line}`,
        px: { xs: 2.5, md: 3 },
        py: { xs: 2, md: 2.25 },
      }}
    >
      <Typography
        sx={{
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 800,
          color: COLORS.accentDeep,
          mb: 1.25,
        }}
      >
        Every membership includes
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
          gap: 1,
          rowGap: 1,
        }}
      >
        {perks.map((p) => (
          <Stack key={p} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
            <CheckRoundedIcon sx={{ fontSize: 16, color: COLORS.primary, mt: 0.25, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.86rem", color: COLORS.ink, lineHeight: 1.5 }}>
              {p}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
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

function PlanCard({
  tier,
  title,
  subtitle,
  ribbon,
  price,
  per,
  sub,
  save,
  sectionTitle,
  perks,
  footnote,
  cta,
  busy,
  onClick,
}: {
  tier: "founding" | "early" | "standard";
  title: string;
  subtitle: string;
  ribbon?: string;
  price: string;
  per?: string;
  sub?: string;
  save?: string;
  sectionTitle: string;
  perks: string[];
  footnote: string;
  cta: string;
  busy?: boolean;
  onClick?: () => void;
}) {
  const borderColor =
    tier === "founding" ? COLORS.accent : tier === "early" ? COLORS.primary : COLORS.line;
  const borderWidth = tier === "founding" ? 2 : 1;
  const isStarTier = tier === "founding" || tier === "early";

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2.5,
        border: `${borderWidth}px solid ${borderColor}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          tier === "founding"
            ? "0 24px 60px -30px rgba(217,168,75,0.55)"
            : tier === "early"
              ? "0 18px 44px -28px rgba(14,42,61,0.4)"
              : "0 12px 32px -24px rgba(14,42,61,0.18)",
      }}
    >
      {ribbon && (
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 2,
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: COLORS.accent,
            color: COLORS.primaryDeep,
            fontSize: "0.66rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {ribbon}
        </Box>
      )}
      <Box sx={{ bgcolor: COLORS.primary, color: "#FFFFFF", px: 3, pt: 3, pb: 2.25 }}>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            color: "#FFFFFF",
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.72)", mt: 0.5 }}>
          {subtitle}
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 3, borderBottom: `1px solid ${COLORS.line}`, textAlign: "center", bgcolor: "#FFFFFF" }}>
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "center", alignItems: "baseline" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "2.6rem", md: "3rem" },
              fontWeight: 600,
              color: COLORS.ink,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {price}
          </Typography>
          {per && (
            <Typography sx={{ fontSize: "0.95rem", color: COLORS.muted, fontWeight: 500 }}>
              /{per}
            </Typography>
          )}
        </Stack>
        {sub && (
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.muted, mt: 0.75 }}>
            {sub}
          </Typography>
        )}
        {save && (
          <Chip
            label={save}
            size="small"
            sx={{
              mt: 1.25,
              bgcolor: "rgba(217,168,75,0.18)",
              color: COLORS.accentDeep,
              fontWeight: 700,
              fontSize: "0.72rem",
              height: 24,
            }}
          />
        )}
      </Box>

      <Box sx={{ px: 3, py: 2.5, flex: 1 }}>
        <Typography
          sx={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.muted,
            fontWeight: 800,
            mb: 1.25,
          }}
        >
          {sectionTitle}
        </Typography>
        <Stack spacing={1.1}>
          {perks.map((p) => {
            const Icon = isStarTier ? StarRoundedIcon : CheckRoundedIcon;
            return (
              <Stack key={p} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                <Icon
                  sx={{
                    fontSize: 18,
                    color: isStarTier ? COLORS.accentDeep : COLORS.primary,
                    mt: 0.15,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "0.88rem",
                    color: COLORS.ink,
                    fontWeight: isStarTier ? 700 : 500,
                    lineHeight: 1.45,
                  }}
                >
                  {p}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ px: 3, py: 1.5, textAlign: "center", borderTop: `1px solid ${COLORS.line}`, bgcolor: COLORS.surfaceAlt }}>
        <Typography sx={{ fontSize: "0.78rem", color: COLORS.inkSoft, lineHeight: 1.5 }}>
          {footnote}
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2.5 }}>
        <Button
          fullWidth
          variant={tier === "standard" ? "outlined" : "contained"}
          color={tier === "founding" ? "secondary" : "primary"}
          disabled={busy}
          onClick={onClick}
          startIcon={busy ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : null}
          sx={{ borderRadius: 999, py: 1.15 }}
        >
          {cta}
        </Button>
      </Box>
    </Box>
  );
}
