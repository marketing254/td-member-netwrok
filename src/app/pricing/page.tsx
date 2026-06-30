"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Header from "@/components/sections/Header";
import { vendorPlans } from "@/lib/vendorData";
import { COLORS } from "@/theme";

const UNIVERSAL_PERKS = [
  "Expert Hotline — written action plan in 2–3 days",
  "Full video course library",
  "New resources every week",
  "Exclusive DMN expert podcasts",
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

export default function PricingPage() {
  const [avail, setAvail] = useState<Availability | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/stripe/availability", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Partial<Availability>) => {
        if (!active) return;
        setAvail({ founding: norm(d.founding, 100), early: norm(d.early, 400) });
      })
      .catch(() => {
        if (active) {
          setAvail({
            founding: { cap: 100, taken: 0, remaining: 100, isOpen: true },
            early: { cap: 400, taken: 0, remaining: 400, isOpen: true },
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const foundingOpen = avail?.founding.isOpen ?? true;
  const earlyOpen = avail?.early.isOpen ?? true;
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");

  // Per-tier billing data so the toggle just swaps numbers without
  // touching the rest of the layout. The intent string is preserved
  // through the CTA so /member/login → /upgrade lands the user on the
  // SubscribeCard with the right interval pre-selected.
  const billing = {
    founding: {
      monthly: { price: "$49", per: "mo", sub: "or $490/year", save: "Save $98" },
      annual: { price: "$490", per: "yr", sub: "$40.83/mo equivalent", save: "Save $98" },
    },
    early: {
      monthly: { price: "$99", per: "mo", sub: "or $990/year", save: "Save $198" },
      annual: { price: "$990", per: "yr", sub: "$82.50/mo equivalent", save: "Save $198" },
    },
    standard: {
      monthly: { price: "$199", per: "mo", sub: "or $1,990/year", save: "Save $398" },
      annual: { price: "$1,990", per: "yr", sub: "$165.83/mo equivalent", save: "Save $398" },
    },
  } as const;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.surface }}>
      <Header />

      {/* MEMBERS — dark navy hero. All text needs explicit light color. */}
      <Box sx={{ bgcolor: COLORS.primary, color: "#FFFFFF", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            sx={{ alignItems: { md: "center" }, justifyContent: "space-between", mb: 4 }}
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: COLORS.accentBright,
                  mb: 0.5,
                }}
              >
                Membership Pricing
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "2rem", md: "2.6rem" },
                  fontWeight: 500,
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                  color: "#FFFFFF",
                }}
              >
                Membership for Dentists
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.78)", mt: 1.25, maxWidth: 560 }}>
                Cancel anytime · 30-day money-back guarantee on Founding &amp; Early.
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentBright,
              }}
            >
              Founded by Thriving Dentist
            </Typography>
          </Stack>

          <UniversalPerks perks={UNIVERSAL_PERKS} />

          {/* Monthly / Annual toggle — swaps the displayed price on all
              three cards. The interval is passed through to /member/login
              so the SubscribeCard on /upgrade lands on the right tab. */}
          <Stack
            direction="row"
            sx={{ justifyContent: "center", mt: 3, mb: 0 }}
          >
            <Box
              sx={{
                display: "inline-flex",
                p: 0.5,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              {(["monthly", "annual"] as const).map((v) => {
                const active = interval === v;
                return (
                  <Box
                    key={v}
                    role="button"
                    tabIndex={0}
                    onClick={() => setInterval(v)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setInterval(v);
                      }
                    }}
                    sx={{
                      cursor: "pointer",
                      px: 2.25,
                      py: 0.85,
                      borderRadius: 999,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "capitalize",
                      bgcolor: active ? "#FFFFFF" : "transparent",
                      color: active ? COLORS.ink : "rgba(255,255,255,0.78)",
                      transition: "background-color 200ms ease, color 200ms ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.85,
                      "&:hover": {
                        color: active ? COLORS.ink : "#FFFFFF",
                      },
                    }}
                  >
                    {v}
                    {v === "annual" && (
                      <Box
                        component="span"
                        sx={{
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          color: active ? "#1F5C40" : COLORS.accentBright,
                          bgcolor: active
                            ? "rgba(34,108,78,0.12)"
                            : "rgba(217,168,75,0.18)",
                          borderRadius: 999,
                          px: 0.85,
                          py: 0.1,
                          textTransform: "uppercase",
                        }}
                      >
                        Save 2 mo
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
              mt: 3,
            }}
          >
            <MemberPlanCard
              tier="founding"
              title="Founding"
              subtitle="First 100 members"
              ribbon={
                foundingOpen
                  ? `★ BEST VALUE — ${avail?.founding.remaining ?? 100} OF 100 LEFT`
                  : "SOLD OUT"
              }
              price={billing.founding[interval].price}
              per={billing.founding[interval].per}
              sub={billing.founding[interval].sub}
              save={interval === "annual" ? billing.founding.annual.save : undefined}
              sectionTitle="WHAT MAKES IT SPECIAL"
              perks={FOUNDING_PERKS}
              footnote="No trial — 30-day money-back guarantee · Cancel anytime"
              ctaLabel={foundingOpen ? "Join as Founding Member" : "Sold out"}
              ctaHref={`/join?intent=founding&interval=${interval}`}
              soldOut={!foundingOpen}
            />
            <MemberPlanCard
              tier="early"
              title="Early Member"
              subtitle="Members 101–500"
              ribbon={
                !earlyOpen
                  ? "SOLD OUT"
                  : !foundingOpen
                    ? `${avail?.early.remaining ?? 400} OF 400 LEFT`
                    : undefined
              }
              price={billing.early[interval].price}
              per={billing.early[interval].per}
              sub={billing.early[interval].sub}
              save={interval === "annual" ? billing.early.annual.save : undefined}
              sectionTitle="WHAT MAKES IT SPECIAL"
              perks={EARLY_PERKS}
              footnote="30-day money-back guarantee · Cancel anytime"
              ctaLabel={earlyOpen ? "Become an Early Member" : "Sold out"}
              ctaHref={`/join?intent=early&interval=${interval}`}
              soldOut={!earlyOpen}
            />
            <MemberPlanCard
              tier="standard"
              title="Standard"
              subtitle="Regular membership"
              price={billing.standard[interval].price}
              per={billing.standard[interval].per}
              sub={billing.standard[interval].sub}
              save={interval === "annual" ? billing.standard.annual.save : undefined}
              sectionTitle="DETAILS"
              perks={STANDARD_PERKS}
              footnote="14-day free trial · Cancel anytime"
              ctaLabel="Start Standard Membership"
              ctaHref={`/join?intent=standard&interval=${interval}`}
            />
          </Box>

          {/* Phase 2 — Premium */}
          <Box
            sx={{
              mt: 3,
              px: { xs: 2, md: 3 },
              py: 1.75,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.06)",
              border: `1px dashed ${COLORS.accent}`,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.88rem", color: COLORS.accentBright, fontWeight: 600 }}>
              ★ Coming in Phase 2 — Premium: 1-on-1 coaching · practice audit &amp; review · priority Hotline (24–48h) · advanced masterclasses · whole-team seats
            </Typography>
          </Box>

          {!foundingOpen && !earlyOpen && (
            <Typography
              sx={{
                mt: 3,
                textAlign: "center",
                color: "rgba(255,255,255,0.78)",
                fontSize: "0.88rem",
              }}
            >
              Founding and Early seats are all claimed. Standard membership is still open with a 14-day free trial.
            </Typography>
          )}
        </Container>
      </Box>

      {/* PARTNERS */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack sx={{ mb: 4, alignItems: { md: "center" }, textAlign: { md: "center" } }} spacing={1}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
              }}
            >
              DMN Partner Pricing
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.7rem", md: "2.2rem" },
                fontWeight: 500,
                lineHeight: 1.15,
                color: COLORS.ink,
                letterSpacing: "-0.01em",
              }}
            >
              Become a vetted DMN Partner
            </Typography>
            <Typography sx={{ color: COLORS.muted, maxWidth: 620 }}>
              Three ways to join the directory: Founding (limited launch program), Featured Partner monthly, or Annual pre-pay.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
            }}
          >
            {vendorPlans.map((p) => (
              <PartnerPlanCard
                key={p.id}
                highlight={p.highlight}
                badge={p.badge}
                name={p.name}
                priceLabel={p.priceLabel}
                cadenceLabel={p.cadenceLabel}
                blurb={p.blurb}
                features={p.features}
                ctaLabel={p.ctaLabel}
              />
            ))}
          </Box>

          <Divider sx={{ my: 5, borderColor: COLORS.line }} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
          >
            <Typography sx={{ color: COLORS.muted, fontSize: "0.92rem", maxWidth: 540 }}>
              Cancel anytime · 30-day money-back guarantee on member Founding &amp; Early plans · Partner onboarding takes 5–7 business days.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" color="primary" component={Link} href="/vendor/signup">
                Apply as a partner
              </Button>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                href="/#waitlist"
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Join the member waitlist
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

function norm(v: Partial<TierStat> | undefined, cap: number): TierStat {
  const taken = typeof v?.taken === "number" ? v.taken : 0;
  const capped = typeof v?.cap === "number" ? v.cap : cap;
  const remaining = typeof v?.remaining === "number" ? v.remaining : Math.max(0, capped - taken);
  const isOpen = typeof v?.isOpen === "boolean" ? v.isOpen : remaining > 0;
  return { cap: capped, taken, remaining, isOpen };
}

function UniversalPerks({ perks }: { perks: string[] }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.06)",
        border: `1px solid rgba(255,255,255,0.18)`,
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
          color: COLORS.accentBright,
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
            <CheckRoundedIcon
              sx={{ fontSize: 16, color: COLORS.accentBright, mt: 0.25, flexShrink: 0 }}
            />
            <Typography
              sx={{ fontSize: "0.86rem", color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}
            >
              {p}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}


/**
 * Member plan card. ALL three cards share the same dark-navy header. Tier
 * differentiation comes from:
 *   - Border + shadow: gold (founding), navy (early), line (standard)
 *   - CTA button: gold contained (founding), navy contained (early),
 *                 navy outlined (standard)
 *   - Ribbon: gold "BEST VALUE" badge on founding only
 * This keeps the page on-brand and lets MUI's color="secondary"/"primary"
 * variants do the differentiation rather than handpicked hexes.
 */
function MemberPlanCard({
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
  ctaLabel,
  ctaHref,
  soldOut,
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
  ctaLabel: string;
  ctaHref: string;
  soldOut?: boolean;
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
        // Sold-out tier stays in the layout but dims so the eye points at
        // the available tiers.
        opacity: soldOut ? 0.7 : 1,
        filter: soldOut ? "saturate(0.7)" : "none",
        transition: "opacity 200ms ease, filter 200ms ease",
        boxShadow:
          soldOut
            ? "0 8px 20px -16px rgba(14,42,61,0.18)"
            : tier === "founding"
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
            bgcolor: soldOut ? "rgba(14,42,61,0.10)" : COLORS.accent,
            color: soldOut ? COLORS.inkSoft : COLORS.primaryDeep,
            fontSize: "0.64rem",
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

      <Box
        sx={{
          px: 3,
          py: 3,
          borderBottom: `1px solid ${COLORS.line}`,
          textAlign: "center",
          bgcolor: "#FFFFFF",
        }}
      >
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

      <Box
        sx={{
          px: 3,
          py: 1.5,
          textAlign: "center",
          borderTop: `1px solid ${COLORS.line}`,
          bgcolor: COLORS.surfaceAlt,
        }}
      >
        <Typography sx={{ fontSize: "0.78rem", color: COLORS.inkSoft, lineHeight: 1.5 }}>
          {footnote}
        </Typography>
      </Box>

      <Box sx={{ px: 3, py: 2.5 }}>
        {soldOut ? (
          // Disabled button — sold-out tiers stay visible but can't be
          // clicked through. The server-side cap in /api/stripe/checkout
          // is the source of truth either way; this is the UI mirror.
          <Button
            fullWidth
            variant="contained"
            disabled
            sx={{
              borderRadius: 999,
              py: 1.15,
              "&.Mui-disabled": {
                bgcolor: "rgba(14,42,61,0.10)",
                color: "rgba(14,42,61,0.55)",
                border: "1px solid rgba(14,42,61,0.12)",
              },
            }}
          >
            {ctaLabel}
          </Button>
        ) : (
          <Button
            fullWidth
            variant={tier === "standard" ? "outlined" : "contained"}
            color={tier === "founding" ? "secondary" : "primary"}
            component={Link}
            href={ctaHref}
            sx={{ borderRadius: 999, py: 1.15 }}
          >
            {ctaLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}

function PartnerPlanCard({
  highlight,
  badge,
  name,
  priceLabel,
  cadenceLabel,
  blurb,
  features,
  ctaLabel,
}: {
  highlight: boolean;
  badge?: string;
  name: string;
  priceLabel: string;
  cadenceLabel: string;
  blurb: string;
  features: string[];
  ctaLabel: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2.5,
        border: highlight ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: highlight
          ? "0 20px 50px -28px rgba(217,168,75,0.45)"
          : "0 14px 36px -28px rgba(14,42,61,0.18)",
      }}
    >
      {badge && (
        <Box
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: COLORS.accent,
            color: COLORS.primaryDeep,
            fontSize: "0.62rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {badge}
        </Box>
      )}
      <Box sx={{ px: 3, pt: badge ? 5 : 3, pb: 2 }}>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            fontWeight: 500,
            color: COLORS.ink,
            lineHeight: 1.2,
          }}
        >
          {name}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 1.25, alignItems: "baseline" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 600,
              color: COLORS.ink,
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            {priceLabel}
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: COLORS.muted, fontWeight: 500 }}>
            {cadenceLabel}
          </Typography>
        </Stack>
        <Typography sx={{ mt: 1.5, fontSize: "0.86rem", color: COLORS.inkSoft, lineHeight: 1.55 }}>
          {blurb}
        </Typography>
      </Box>
      <Divider sx={{ borderColor: COLORS.line }} />
      <Stack spacing={1.1} sx={{ px: 3, py: 2.5, flex: 1 }}>
        {features.map((f) => (
          <Stack key={f} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
            <CheckRoundedIcon sx={{ fontSize: 18, color: COLORS.primary, mt: 0.15, flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.86rem", color: COLORS.ink, lineHeight: 1.45 }}>
              {f}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Box sx={{ px: 3, pb: 3 }}>
        <Button
          fullWidth
          variant={highlight ? "contained" : "outlined"}
          color={highlight ? "secondary" : "primary"}
          component={Link}
          href="/vendor/signup"
          sx={{ borderRadius: 999, py: 1.1 }}
        >
          {ctaLabel}
        </Button>
      </Box>
    </Box>
  );
}
