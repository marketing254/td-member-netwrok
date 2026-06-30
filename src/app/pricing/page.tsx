"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import Header from "@/components/sections/Header";
import JsonLd from "@/components/seo/JsonLd";
import { COLORS } from "@/theme";

// Product + Offer JSON-LD — exposes all 3 audiences' pricing as
// structured offers so Google Merchant + AI assistants can extract
// pricing without rendering the page. One Product per audience, joined
// by an ItemList wrapper so they coexist cleanly.
const PRICING_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "Dental Member Network — Founding Membership",
      description:
        "Membership for US + Canadian dental practice owners. 24/7 expert hotline returning a written action plan in 2–3 business days, partner-network discounts averaging $6,400/year, and a curated kit library.",
      brand: { "@type": "Brand", name: "Dental Member Network" },
      image: "https://dentalmembernetwork.com/td-logo-horizontal-dark.svg",
      url: "https://dentalmembernetwork.com/pricing",
      offers: [
        {
          "@type": "Offer",
          name: "Founding Member · Monthly",
          price: "49.00",
          priceCurrency: "USD",
          url: "https://dentalmembernetwork.com/join?intent=founding&interval=monthly",
          availability: "https://schema.org/LimitedAvailability",
          eligibleQuantity: { "@type": "QuantitativeValue", maxValue: 100 },
        },
        {
          "@type": "Offer",
          name: "Founding Member · Annual",
          price: "490.00",
          priceCurrency: "USD",
          url: "https://dentalmembernetwork.com/join?intent=founding&interval=annual",
          availability: "https://schema.org/LimitedAvailability",
        },
        {
          "@type": "Offer",
          name: "Standard Member · Monthly",
          price: "199.00",
          priceCurrency: "USD",
          url: "https://dentalmembernetwork.com/join?intent=standard&interval=monthly",
          availability: "https://schema.org/InStock",
        },
      ],
    },
    {
      "@type": "Product",
      name: "Dental Member Network — Expert Bench",
      description:
        "Featured spot on the DMN expert bench for coaches, consultants and educators. We produce your kits, surface them in the member library, route warm leads to your calendar. Sell your own courses with a 90/10 split.",
      brand: { "@type": "Brand", name: "Dental Member Network" },
      url: "https://dentalmembernetwork.com/pricing",
      offers: [
        { "@type": "Offer", name: "Expert Launch — months 1-6", price: "0.00", priceCurrency: "USD", url: "https://dentalmembernetwork.com/experts" },
        { "@type": "Offer", name: "Expert Growth — months 7-12", price: "49.00", priceCurrency: "USD", url: "https://dentalmembernetwork.com/experts" },
        { "@type": "Offer", name: "Expert Standard — month 13+", price: "199.00", priceCurrency: "USD", url: "https://dentalmembernetwork.com/experts" },
      ],
    },
    {
      "@type": "Product",
      name: "Dental Member Network — Vendor Partner",
      description:
        "Featured vendor placement for companies serving dental practices. Same Featured Partner benefits across all phases + refer-and-earn $50 per converted member.",
      brand: { "@type": "Brand", name: "Dental Member Network" },
      url: "https://dentalmembernetwork.com/pricing",
      offers: [
        { "@type": "Offer", name: "Partner Launch — months 1-6", price: "0.00", priceCurrency: "USD", url: "https://dentalmembernetwork.com/partners" },
        { "@type": "Offer", name: "Partner Growth — months 7-12", price: "49.00", priceCurrency: "USD", url: "https://dentalmembernetwork.com/partners" },
        { "@type": "Offer", name: "Partner Standard — month 13+", price: "199.00", priceCurrency: "USD", url: "https://dentalmembernetwork.com/partners" },
      ],
    },
  ],
};

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
      <JsonLd data={PRICING_JSONLD} />
      <Header />

      {/* ROLE ROUTER — "Which are you?" — sits at the very top so the
          visitor self-identifies before they see any prices. Three
          identical $199 numbers across audiences read as one confusing
          number without this. The cards are anchor links to the
          relevant section further down the page. */}
      <Box sx={{ bgcolor: COLORS.surface, pt: { xs: 4, md: 5 }, pb: { xs: 2, md: 3 } }}>
        <Container maxWidth="lg">
          <Stack sx={{ alignItems: "center", textAlign: "center", mb: 2.5 }} spacing={0.5}>
            <Typography
              sx={{
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
              }}
            >
              Start here
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.6rem", md: "2rem" },
                fontWeight: 500,
                color: COLORS.ink,
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
              }}
            >
              Which are you?
            </Typography>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {/* Routing — each role lands on its own pricing card on
                THIS page. Members card scrolls to the navy Members
                hero; Expert + Company cards both scroll into the
                combined Experts & Partners section but anchor to the
                specific role card inside it (the Expert side or the
                Partner side respectively). */}
            <RoleRouterCard
              icon="practice"
              title="A dental practice"
              sub="Dentist · owner · office manager"
              ctaLabel="Become a member"
              href="#members"
            />
            <RoleRouterCard
              icon="expert"
              title="An individual expert"
              sub="Consultant · coach · speaker"
              ctaLabel="Join as an expert"
              href="#expert-pricing"
            />
            <RoleRouterCard
              icon="company"
              title="A company"
              sub="A product or service for practices"
              ctaLabel="Become a partner"
              href="#partner-pricing"
            />
          </Box>
        </Container>
      </Box>

      {/* MEMBERS — dark navy hero. All text needs explicit light color.
          scrollMarginTop offsets the sticky Header height so the anchor
          link from the role router lands the section title in view,
          not behind the header bar. */}
      <Box
        id="members"
        sx={{
          bgcolor: COLORS.primary,
          color: "#FFFFFF",
          py: { xs: 6, md: 8 },
          scrollMarginTop: { xs: "72px", md: "96px" },
        }}
      >
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
                Membership — for dental practices
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
              <Typography sx={{ color: "rgba(255,255,255,0.92)", mt: 1.25, maxWidth: 620, fontSize: "1.02rem", lineHeight: 1.5 }}>
                For dentists, practice owners, and office managers who want to run a better practice.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", mt: 0.75, maxWidth: 560, fontSize: "0.9rem" }}>
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

      {/* EXPERTS & PARTNERS — single combined section. Same $0/$49/$199
          ramp serves both roles; we show it once. Two role cards above
          the ramp explain the two doors (Expert = your knowledge in the
          library; Partner = your company listed with a member offer)
          and each keeps its own CTA into its own signup flow. The
          two-portal architecture is untouched — only the price display
          is de-duplicated. */}
      <Box
        id="experts-partners"
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: COLORS.surfaceAlt,
          borderTop: `1px solid ${COLORS.line}`,
          scrollMarginTop: { xs: "72px", md: "96px" },
        }}
      >
        <Container maxWidth="lg">
          <Stack sx={{ mb: 4, alignItems: { md: "center" }, textAlign: { md: "center" } }} spacing={1}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
              }}
            >
              Experts and partners — for people who serve practices
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.7rem", md: "2.4rem" },
                fontWeight: 500,
                lineHeight: 1.15,
                color: COLORS.ink,
                letterSpacing: "-0.01em",
              }}
            >
              Same pricing — two ways to join.
            </Typography>
            <Typography sx={{ color: COLORS.muted, maxWidth: 720, mt: 0.5, fontSize: "1rem" }}>
              One price ramp, two roles. Pick the path that fits — your knowledge in the library (Expert), or your company listed with a member offer (Partner).
            </Typography>
          </Stack>

          {/* Two role cards — Expert + Partner. Different verbs, same
              ramp below. Each card keeps its own signup CTA into its
              own portal. */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2.5,
              mb: 3,
            }}
          >
            {/* Wrapper Boxes carry the #expert-pricing and #partner-pricing
                anchors so the role router cards above land directly on
                the right card. scrollMarginTop offsets the sticky Header
                so the card top isn't tucked behind it. */}
            <Box
              id="expert-pricing"
              sx={{ scrollMarginTop: { xs: "72px", md: "96px" } }}
            >
              <RoleCard
                accent="green"
                icon="expert"
                title="Join as an Expert"
                who="For consultants, coaches, and speakers who teach dental practices."
                body="Your knowledge becomes content in the library — your profile, your warm leads, your booking link. We do the production."
                callout="★ Sell your own courses — keep 90%"
                ctaLabel="Apply as an Expert"
                ctaHref="/experts#apply"
              />
            </Box>
            <Box
              id="partner-pricing"
              sx={{ scrollMarginTop: { xs: "72px", md: "96px" } }}
            >
              <RoleCard
                accent="gold"
                icon="partner"
                title="Become a Partner"
                who="For companies with a product or service for dental practices."
                body="Your company gets a featured listing with a member-only offer, lead routing, and a Verified Partner badge."
                callout="★ Refer & earn — $50 per converted member"
                ctaLabel="Apply as a Partner"
                ctaHref="/partners#apply"
              />
            </Box>
          </Box>

          {/* Single 3-phase price ramp — shown ONCE for both roles. The
              header band says it explicitly so visitors don't read two
              identical price tables and wonder what's different. */}
          <Box
            sx={{
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              border: `1px solid ${COLORS.line}`,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.25,
                textAlign: "center",
                borderBottom: `1px solid ${COLORS.line}`,
                bgcolor: "rgba(217,168,75,0.06)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 800,
                  color: COLORS.accentDeep,
                }}
              >
                Same price ramp — Expert or Partner
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              }}
            >
              <RampStep cap="Months 1–6" price="$0" sub="Free while you build your library / pipeline." hot />
              <RampStep cap="Months 7–12" price="$49/mo" sub="Locked launch rate." hot />
              <RampStep cap="Month 13+" price="$199/mo" sub="Standard rate · $1,990/yr annual = 2 months free." />
            </Box>
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mt: 4, justifyContent: "space-between", alignItems: { md: "center" } }}
          >
            <Typography sx={{ color: COLORS.muted, fontSize: "0.92rem", maxWidth: 540 }}>
              Cancel anytime · 30 days' written notice · Onboarding takes 5–7 business days.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button variant="outlined" color="primary" component={Link} href="/experts">
                Read expert overview
              </Button>
              <Button variant="outlined" color="primary" component={Link} href="/partners">
                Read partner overview
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

  // Border "shine" — the actual border IS the shimmer. Outer Box is the
  // gradient-filled square; inner Box covers everything except a 2px
  // strip at the edge, leaving just that strip visible AS the border.
  // The conic-gradient has one bright comet on a calm base, and rotating
  // it makes the comet travel cleanly along the perimeter.
  const borderGradient =
    tier === "founding"
      ? `conic-gradient(
          from 0deg at 50% 50%,
          ${COLORS.accentDeep} 0deg,
          ${COLORS.accentDeep} 270deg,
          ${COLORS.accentBright} 305deg,
          #FFFFFF 330deg,
          ${COLORS.accentBright} 355deg,
          ${COLORS.accentDeep} 360deg
        )`
      : tier === "early"
        ? `conic-gradient(
            from 0deg at 50% 50%,
            ${COLORS.primary} 0deg,
            ${COLORS.primary} 270deg,
            ${COLORS.accent} 305deg,
            ${COLORS.accentBright} 330deg,
            ${COLORS.accent} 355deg,
            ${COLORS.primary} 360deg
          )`
        : `linear-gradient(135deg, ${COLORS.line} 0%, ${COLORS.line} 100%)`;
  const hoverGlow =
    tier === "founding"
      ? "0 32px 80px -28px rgba(217,168,75,0.7), 0 0 0 1px rgba(217,168,75,0.4)"
      : tier === "early"
        ? "0 28px 60px -24px rgba(14,42,61,0.55), 0 0 0 1px rgba(14,42,61,0.25)"
        : "0 16px 40px -22px rgba(14,42,61,0.25)";

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2.5,
        // The outer Box is the gradient-filled square; the inner Box
        // covers everything except a 2 px strip at the edge so only that
        // strip shows AS the border. overflow:hidden keeps the rotating
        // conic gradient inside the rounded corners.
        overflow: "hidden",
        background: soldOut ? "transparent" : borderGradient,
        border: soldOut ? `1px solid ${COLORS.line}` : "none",
        // Sold-out tier stays in the layout but dims so the eye points at
        // the available tiers.
        opacity: soldOut ? 0.7 : 1,
        filter: soldOut ? "saturate(0.7)" : "none",
        transition:
          "opacity 220ms ease, filter 220ms ease, transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow:
          soldOut
            ? "0 8px 20px -16px rgba(14,42,61,0.18)"
            : tier === "founding"
              ? "0 24px 60px -30px rgba(217,168,75,0.55)"
              : tier === "early"
                ? "0 18px 44px -28px rgba(14,42,61,0.4)"
                : "0 12px 32px -24px rgba(14,42,61,0.18)",
        // Pseudo-element holds the rotating animation. It IS the gradient
        // (same one set on the outer Box) but rotates around the centre,
        // so the bright comet travels along the visible border strip.
        "&::before": soldOut
          ? undefined
          : {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background: borderGradient,
              animation:
                tier === "founding"
                  ? "tierBorderRun 4s linear infinite"
                  : "tierBorderRun 5s linear infinite",
              pointerEvents: "none",
              zIndex: 0,
            },
        "@keyframes tierBorderRun": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "&::before": { animation: "none" },
        },
        "&:hover": soldOut
          ? undefined
          : {
              transform: "translateY(-4px)",
              boxShadow: hoverGlow,
            },
      }}
    >
      {/* Inner card body — sits above the rotating gradient with a 2 px
          margin so the gradient only peeks through at the edges and reads
          AS the card's border. */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          m: soldOut ? 0 : "2px",
          borderRadius: 2.5,
          bgcolor: "#FFFFFF",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100% - 4px)",
          flex: 1,
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
    </Box>
  );
}


/**
 * RoleRouterCard
 *
 * The three "Which are you?" cards at the very top of /pricing. Each
 * anchors down to the right section (`#members` or `#experts-partners`)
 * so the visitor self-identifies before they see prices. Without these,
 * three audiences each priced at $199 read as one confusing number.
 */
function RoleRouterCard({
  icon,
  title,
  sub,
  ctaLabel,
  href,
}: {
  icon: "practice" | "expert" | "company";
  title: string;
  sub: string;
  ctaLabel: string;
  href: string;
}) {
  const Icon =
    icon === "practice"
      ? MedicalServicesOutlinedIcon
      : icon === "expert"
        ? SchoolOutlinedIcon
        : BusinessCenterOutlinedIcon;
  // Hash-only links (#members) get a plain <a> so the browser fires its
  // native scroll-to-anchor behaviour reliably. Next.js Link intercepts
  // same-page hash clicks as client-side route changes and the scroll
  // sometimes doesn't fire under App Router. Cross-page links keep using
  // Link for prefetching.
  const isHashOnly = href.startsWith("#");
  return (
    <Box
      component={isHashOnly ? "a" : Link}
      href={href}
      sx={{
        display: "block",
        p: 2.25,
        borderRadius: 2,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        textDecoration: "none",
        transition: "border-color 220ms ease, transform 220ms ease, box-shadow 220ms ease",
        "&:hover": {
          borderColor: COLORS.accentDeep,
          transform: "translateY(-2px)",
          boxShadow: "0 14px 36px -22px rgba(14,42,61,0.18)",
        },
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 0.75 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: "rgba(217,168,75,0.12)",
            color: COLORS.accentDeep,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 16 }} />
        </Box>
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 500, color: COLORS.ink, letterSpacing: "-0.005em" }}>
          {title}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: "0.86rem", color: COLORS.muted, mb: 1, lineHeight: 1.5 }}>
        {sub}
      </Typography>
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: COLORS.accentDeep }}>
          {ctaLabel}
        </Typography>
        <ArrowForwardIosRoundedIcon sx={{ fontSize: 12, color: COLORS.accentDeep }} />
      </Stack>
    </Box>
  );
}

/**
 * RoleCard
 *
 * The two role-explainer cards in the combined Experts & Partners
 * section. Each leads with the role (Expert = your content vs Partner
 * = your company) and keeps its own signup CTA. The price ramp sits
 * once below both cards — same number shown once, two doors.
 */
function RoleCard({
  accent,
  icon,
  title,
  who,
  body,
  callout,
  ctaLabel,
  ctaHref,
}: {
  accent: "gold" | "green";
  icon: "expert" | "partner";
  title: string;
  who: string;
  body: string;
  callout: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  const accentColor = accent === "gold" ? COLORS.accentDeep : "#1F5238";
  const accentBright = accent === "gold" ? COLORS.accent : "#2C7A52";
  const accentTint = accent === "gold" ? "rgba(217,168,75,0.06)" : "rgba(44,122,82,0.06)";
  const Icon = icon === "expert" ? SchoolOutlinedIcon : BusinessCenterOutlinedIcon;

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 16px 40px -28px rgba(14,42,61,0.18)",
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 }, pb: 2 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.25,
              bgcolor: accentTint,
              color: accentColor,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.4rem", md: "1.55rem" }, fontWeight: 500, color: COLORS.ink, letterSpacing: "-0.01em" }}>
            {title}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: "0.92rem", color: COLORS.ink, fontWeight: 600, mb: 1.25, lineHeight: 1.5 }}>
          {who}
        </Typography>
        <Typography sx={{ fontSize: "0.92rem", color: COLORS.muted, lineHeight: 1.6, mb: 2 }}>
          {body}
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 1.5,
            bgcolor: accentTint,
            border: `1px solid ${accentBright}55`,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "0.86rem", color: accentColor, fontWeight: 700, lineHeight: 1.45 }}>
            {callout}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ px: { xs: 2.5, md: 3 }, pb: 3, mt: "auto" }}>
        <Button
          fullWidth
          variant="contained"
          component={Link}
          href={ctaHref}
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            borderRadius: 999,
            py: 1.15,
            ...(accent === "green" && {
              bgcolor: accentBright,
              color: "#FFFFFF",
              backgroundImage: `linear-gradient(180deg, ${accentBright} 0%, ${accentColor} 100%)`,
              "&:hover": {
                bgcolor: accentColor,
                backgroundImage: `linear-gradient(180deg, ${accentBright} 0%, ${accentColor} 100%)`,
              },
            }),
            ...(accent === "gold" && {
              bgcolor: accentBright,
              color: COLORS.primaryDeep,
              backgroundImage: `linear-gradient(180deg, ${COLORS.accentBright} 0%, ${accentBright} 100%)`,
              "&:hover": {
                backgroundImage: `linear-gradient(180deg, ${accentBright} 0%, ${accentColor} 100%)`,
              },
            }),
          }}
        >
          {ctaLabel}
        </Button>
      </Box>
    </Box>
  );
}

/**
 * RampStep
 *
 * One column in the single 3-phase price ramp. Calm, plain — the
 * narrative is in the role cards above. Border only on the right edge
 * (and bottom on mobile) so the three steps read as one continuous
 * ramp inside the wrapper card.
 */
function RampStep({
  cap,
  price,
  sub,
  hot,
}: {
  cap: string;
  price: string;
  sub: string;
  hot?: boolean;
}) {
  return (
    <Box
      sx={{
        py: { xs: 2.5, md: 3 },
        px: 2.5,
        textAlign: "center",
        borderRight: { md: `1px solid ${COLORS.line}` },
        borderBottom: { xs: `1px solid ${COLORS.line}`, md: "none" },
        "&:last-of-type": { borderRight: "none", borderBottom: "none" },
        bgcolor: hot ? "rgba(217,168,75,0.04)" : "transparent",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.66rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 800,
          color: COLORS.muted,
          mb: 0.75,
        }}
      >
        {cap}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: { xs: "1.9rem", md: "2.15rem" },
          fontWeight: 600,
          color: COLORS.ink,
          lineHeight: 1,
          letterSpacing: "-0.015em",
          mb: 0.5,
        }}
      >
        {price}
      </Typography>
      <Typography sx={{ fontSize: "0.82rem", color: COLORS.muted, lineHeight: 1.45 }}>
        {sub}
      </Typography>
    </Box>
  );
}
