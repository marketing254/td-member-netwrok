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

// =====================================================================
// EXPERT BENCH — source: DMN_Expert_Pricing_PUBLIC.pdf
// =====================================================================
const EXPERT_INCLUDED = [
  "A done-for-you content library",
  "Your own featured expert profile",
  "Warm leads booked to your calendar",
  "Expert Hotline referrals",
  "Co-marketing across the network",
];

const EXPERT_PHASE1_FEATURES = [
  "Founding-cohort badge in your directory listing",
  "Locked into the launch ladder for life",
  "First in line for podcast + webinar slots",
  "All five Featured Expert benefits included",
];

const EXPERT_PHASE2_FEATURES = [
  "$49/mo locked launch rate through month 12",
  "All Featured Expert benefits continue",
  "Quarterly revenue review with the team",
];

const EXPERT_PHASE3_FEATURES = [
  "Standard Featured Expert rate",
  "Annual pre-pay = 2 months free",
  "Open enrollment from month 13",
  "Sell your own courses — keep 90%",
];

// =====================================================================
// VENDOR PARTNER NETWORK — source: DMN_Partner_Network_Model.pdf
// =====================================================================
const PARTNER_INCLUDED = [
  { title: "Profile & directory placement", body: "Dedicated profile page and searchable placement in your category." },
  { title: "Lead flow", body: "Direct routing of every member inquiry with dashboard + conversion data." },
  { title: "Verified Partner badge", body: "Credibility from listing alongside trusted providers." },
  { title: "Podcast, webinar & event features", body: "Guest eligibility and speaking slots across the network." },
  { title: "Co-marketing", body: "Co-branded case studies and newsletter mentions." },
  { title: "Refer & earn", body: "Refer members to DMN and earn $50 for each one who joins and stays." },
];

const PARTNER_PHASE1_FEATURES = [
  "Founding Partner badge in launch announcement",
  "Priority placement in the directory launch",
  "All Featured Partner benefits included",
  "Refer & earn — $50 per converted member",
  "Limited spots per category",
];

const PARTNER_PHASE2_FEATURES = [
  "$49/mo locked launch rate through month 12",
  "All Featured Partner benefits continue",
  "Refer & earn — $50 per converted member",
];

const PARTNER_PHASE3_FEATURES = [
  "Full Featured Partner tier — all benefits",
  "Annual pre-pay = 2 months free (~17%)",
  "Refer & earn — $50 per converted member",
];

const PARTNER_COMMITMENTS = [
  { number: "1", title: "Best deal for members", body: "Give members a discount or exclusive benefit at least as good as any offer you make to comparable customers." },
  { number: "2", title: "Join the private hotline", body: "Stay reachable during business hours so members get fast coordination with you." },
  { number: "3", title: "Provide a booking link", body: "Share a Calendly / Cal.com link members can book directly — respond within one business day." },
  { number: "4", title: "Evolve with the network", body: "Terms or fees may update with 30 days' notice; if a change materially reduces your benefits, you can exit." },
  { number: "5", title: "Pay the partnership fee", body: "Per the model above — waived for your first 6 months as a Founding Partner." },
];

const PARTNER_BENEFIT_FORMS = [
  "% off standard pricing",
  "Flat first-purchase discount",
  "Waived setup / onboarding fees",
  "Bonus inclusions or extended trials",
  "Preferred payment terms",
];

const PARTNER_CATEGORIES = [
  "Dental supplies & labs",
  "Equipment & build-outs",
  "Practice-management software",
  "Billing, coding & credentialing",
  "HR, payroll & compliance",
  "Patient financing",
  "Phone / call-tracking / AI",
  "Coaching & consulting",
  "Continuing education",
  "Accounting, tax & CFO",
];

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

      {/* EXPERTS — full-detail cards with per-card CTAs (matching the
          member-card structure). Headline differentiator: 90/10 course
          revenue split. Source for copy: DMN_Expert_Pricing_PUBLIC.pdf. */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: COLORS.surfaceAlt, borderTop: `1px solid ${COLORS.line}` }}>
        <Container maxWidth="lg">
          <Stack sx={{ mb: 4, alignItems: { md: "center" }, textAlign: { md: "center" } }} spacing={1}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#1F5238",
              }}
            >
              Featured Expert · Pricing
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
              Free to start. Built to grow with you.
            </Typography>
            <Typography sx={{ color: COLORS.muted, maxWidth: 720 }}>
              We do the production and bring the audience — you bring your expertise.
              Your library and your leads start the moment you join. Move to a low
              launch rate as your pipeline builds.
            </Typography>
          </Stack>

          {/* INCLUDED-AT-EVERY-STAGE band (sits above the cards so the
              reader sees what they're buying before they see the price). */}
          <Box
            sx={{
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              border: `1px solid ${COLORS.line}`,
              p: { xs: 2.5, md: 3 },
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 800,
                color: "#1F5238",
                mb: 1.5,
                textAlign: { md: "center" },
              }}
            >
              Included at every stage
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(5, 1fr)" },
                gap: 1.25,
              }}
            >
              {EXPERT_INCLUDED.map((p) => (
                <Stack key={p} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                  <CheckRoundedIcon sx={{ fontSize: 16, color: "#2C7A52", mt: 0.25, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: "0.86rem", color: COLORS.ink, lineHeight: 1.45 }}>{p}</Typography>
                </Stack>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
            }}
          >
            <PhaseCard
              cap="Months 1–6"
              price="$0"
              per=""
              body="Build your library and pipeline first."
              hot
              accent="green"
              ribbon="★ WAIVED"
              sectionTitle="WHAT MAKES IT SPECIAL"
              features={EXPERT_PHASE1_FEATURES}
              footnote="No card required to start · Cancel anytime"
              ctaLabel="Apply to the bench"
              ctaHref="/experts#apply"
            />
            <PhaseCard
              cap="Months 7–12"
              price="$49"
              per="/mo"
              body="Locked launch rate — a fraction of standard."
              hot
              accent="green"
              sectionTitle="WHAT'S DIFFERENT"
              features={EXPERT_PHASE2_FEATURES}
              footnote="Auto-rolls from Phase 1 at month 7"
              ctaLabel="Apply to the bench"
              ctaHref="/experts#apply"
            />
            <PhaseCard
              cap="Month 13+"
              price="$199"
              per="/mo"
              body="Standard rate. By then the channel pays for itself."
              hot={false}
              accent="green"
              sectionTitle="DETAILS"
              features={EXPERT_PHASE3_FEATURES}
              footnote="$1,990/yr annual pre-pay = 2 months free"
              ctaLabel="Apply to the bench"
              ctaHref="/experts#apply"
            />
          </Box>

          {/* 90/10 course revenue split — the headline. */}
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              border: `1px solid ${COLORS.line}`,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.94rem", color: COLORS.inkSoft, lineHeight: 1.55 }}>
              ★{" "}
              <Box component="strong" sx={{ color: COLORS.ink }}>
                Sell your own courses — keep 90%.
              </Box>{" "}
              List on-demand courses to members and keep 90% of net revenue. DMN takes
              10% to run the platform and payments. Annual pre-pay = 2 months free.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3, justifyContent: { sm: "center" } }}>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              href="/experts"
            >
              Read full expert overview
            </Button>
            <Button
              variant="contained"
              component={Link}
              href="/experts#apply"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                bgcolor: "#2C7A52",
                backgroundImage: "linear-gradient(180deg, #2C7A52 0%, #1F5238 100%)",
                "&:hover": {
                  bgcolor: "#1F5238",
                  backgroundImage: "linear-gradient(180deg, #2C7A52 0%, #1F5238 100%)",
                },
              }}
            >
              Become a Featured Expert
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* PARTNERS — full-detail cards with per-card CTAs. Source for
          copy: DMN_Partner_Network_Model.pdf. */}
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
              Partner Network · Partnership Model
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
              Get in front of dentistry's most engaged buyers.
            </Typography>
            <Typography sx={{ color: COLORS.muted, maxWidth: 720 }}>
              A trusted shortlist, not a cold ad. Members get vetted partners with
              exclusive discounts; you get direct access to practice owners in a
              buying mindset — a channel that pays for itself as deals close.
            </Typography>
          </Stack>

          {/* Audience stats — anchor on the channel size before pricing. */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
              mb: 3,
            }}
          >
            <PartnerStat big="10K+" label="Practice owners reached monthly" />
            <PartnerStat big="5" label="Connected communities" />
            <PartnerStat big="100%" label="Intent-driven member traffic" />
          </Box>

          {/* What you get — included-at-every-phase band */}
          <Box
            sx={{
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              border: `1px solid ${COLORS.line}`,
              p: { xs: 2.5, md: 3 },
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 800,
                color: COLORS.accentDeep,
                mb: 1.5,
                textAlign: { md: "center" },
              }}
            >
              Included at every phase
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
                gap: 1.5,
                rowGap: 1.25,
              }}
            >
              {PARTNER_INCLUDED.map((p) => (
                <Stack key={p.title} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                  <CheckRoundedIcon sx={{ fontSize: 18, color: COLORS.accentDeep, mt: 0.25, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontSize: "0.88rem", color: COLORS.ink, fontWeight: 700, lineHeight: 1.4 }}>
                      {p.title}
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: COLORS.muted, lineHeight: 1.5 }}>
                      {p.body}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2.5,
            }}
          >
            <PhaseCard
              cap="Founding · Months 1–6"
              price="$0"
              per=""
              body="Build your pipeline first, pay later. Limited spots per category."
              hot
              accent="gold"
              ribbon="★ WAIVED"
              sectionTitle="FOUNDING PERKS"
              features={PARTNER_PHASE1_FEATURES}
              footnote="Limited per category · 30 days' notice to cancel"
              ctaLabel="Apply for Founding"
              ctaHref="/vendor/signup"
            />
            <PhaseCard
              cap="Founding · Months 7–12"
              price="$49"
              per="/mo"
              body="Locked launch rate — a fraction of standard."
              hot
              accent="gold"
              sectionTitle="WHAT'S DIFFERENT"
              features={PARTNER_PHASE2_FEATURES}
              footnote="Auto-rolls from Phase 1 at month 7"
              ctaLabel="Apply for Founding"
              ctaHref="/vendor/signup"
            />
            <PhaseCard
              cap="Standard · Month 13+"
              price="$199"
              per="/mo"
              body="Featured Partner rate. By then, the channel pays for itself."
              hot={false}
              accent="gold"
              sectionTitle="DETAILS"
              features={PARTNER_PHASE3_FEATURES}
              footnote="$1,990/yr annual pre-pay = 2 months free (~17%)"
              ctaLabel="Become a Partner"
              ctaHref="/vendor/signup"
            />
          </Box>

          {/* Refer-and-earn callout */}
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              border: `1px solid ${COLORS.line}`,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.94rem", color: COLORS.inkSoft, lineHeight: 1.55 }}>
              ★{" "}
              <Box component="strong" sx={{ color: COLORS.ink }}>
                Refer & earn — $50 per member who joins and stays.
              </Box>{" "}
              Every partner gets a referral link in the portal. No cap on referrals.
              Featured Partner = $199/mo with all benefits included. Founding Partners
              get priority placement in the directory launch.
            </Typography>
          </Box>

          {/* What you commit to — the five */}
          <Box sx={{ mt: 4 }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
                mb: 1.5,
                textAlign: { md: "center" },
              }}
            >
              What you commit to — the five
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2,
              }}
            >
              {PARTNER_COMMITMENTS.map((c) => (
                <Box
                  key={c.number}
                  sx={{
                    p: 2.25,
                    borderRadius: 2,
                    border: `1px solid ${COLORS.line}`,
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: COLORS.accent,
                        color: COLORS.primaryDeep,
                        display: "grid",
                        placeItems: "center",
                        fontFamily: "var(--font-display)",
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {c.number}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.92rem", color: COLORS.ink, fontWeight: 700, mb: 0.25, lineHeight: 1.35 }}>
                        {c.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.84rem", color: COLORS.muted, lineHeight: 1.55 }}>
                        {c.body}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Member-benefit forms */}
          <Box sx={{ mt: 4, textAlign: { md: "center" } }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
                mb: 1.5,
              }}
            >
              Your member benefit can take any form
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: { md: "center" },
                gap: 1,
              }}
            >
              {PARTNER_BENEFIT_FORMS.map((b) => (
                <Chip
                  key={b}
                  label={b}
                  sx={{
                    bgcolor: "rgba(217,168,75,0.12)",
                    color: COLORS.accentDeep,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    height: 30,
                    px: 0.5,
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Who we're recruiting */}
          <Box sx={{ mt: 4, textAlign: { md: "center" } }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: COLORS.accentDeep,
                mb: 1.5,
              }}
            >
              Who we're recruiting
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: { md: "center" },
                gap: 1,
              }}
            >
              {PARTNER_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  sx={{
                    bgcolor: "#FFFFFF",
                    color: COLORS.ink,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    height: 30,
                    px: 0.5,
                    border: `1px solid ${COLORS.line}`,
                  }}
                />
              ))}
            </Box>
            <Typography sx={{ fontSize: "0.82rem", color: COLORS.muted, mt: 2 }}>
              Founding Partner spots are limited — first partners per category.
            </Typography>
          </Box>

          <Divider sx={{ my: 5, borderColor: COLORS.line }} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
          >
            <Typography sx={{ color: COLORS.muted, fontSize: "0.92rem", maxWidth: 540 }}>
              Cancel anytime · 30-day money-back guarantee on member Founding &amp; Early plans · Partner + expert onboarding takes 5–7 business days.
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
 * PhaseCard — rich card used by both the Experts and Partners sections.
 * Mirrors the structure of the Member cards (header band → price block
 * → bullet features → footnote → CTA button) but stays visually calmer
 * (no rotating border, no animated comet) so the page reads as:
 * Members hero (animated) → Experts/Partners (structured cards).
 *
 * `accent` swaps the highlight color so the experts row reads green and
 * the partners row reads gold.
 */
function PhaseCard({
  cap,
  price,
  per,
  body,
  hot,
  accent,
  ribbon,
  sectionTitle,
  features,
  footnote,
  ctaLabel,
  ctaHref,
}: {
  cap: string;
  price: string;
  per: string;
  body: string;
  hot: boolean;
  accent: "gold" | "green";
  ribbon?: string;
  sectionTitle?: string;
  features?: string[];
  footnote?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const accentColor = accent === "gold" ? COLORS.accent : "#2C7A52";
  const accentInk = accent === "gold" ? COLORS.primaryDeep : "#FFFFFF";
  const accentDeep = accent === "gold" ? COLORS.accentDeep : "#1F5238";
  const shadow =
    accent === "gold"
      ? "0 20px 50px -28px rgba(217,168,75,0.4)"
      : "0 20px 50px -28px rgba(44,122,82,0.4)";

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2.5,
        border: hot ? `2px solid ${accentColor}` : `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: hot ? shadow : "0 12px 32px -24px rgba(14,42,61,0.18)",
      }}
    >
      {ribbon && (
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 2,
            px: 1.25,
            py: 0.4,
            borderRadius: 999,
            bgcolor: accentColor,
            color: accentInk,
            fontSize: "0.62rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {ribbon}
        </Box>
      )}

      {/* Cap band — navy on standard phase, accent on hot phases */}
      <Box
        sx={{
          bgcolor: hot ? accentColor : COLORS.primary,
          color: hot ? accentInk : "#FFFFFF",
          textAlign: "center",
          py: 1.25,
          fontSize: "0.74rem",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {cap}
      </Box>

      {/* Price block */}
      <Box sx={{ textAlign: "center", py: 3, borderBottom: `1px solid ${COLORS.line}` }}>
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
              {per}
            </Typography>
          )}
        </Stack>
        <Typography sx={{ fontSize: "0.88rem", color: COLORS.muted, mt: 1.25, px: 2.5, lineHeight: 1.55 }}>
          {body}
        </Typography>
      </Box>

      {/* Features list */}
      {features && features.length > 0 && (
        <Box sx={{ px: 3, py: 2.5, flex: 1 }}>
          {sectionTitle && (
            <Typography
              sx={{
                fontSize: "0.7rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: COLORS.muted,
                fontWeight: 800,
                mb: 1.25,
              }}
            >
              {sectionTitle}
            </Typography>
          )}
          <Stack spacing={1.1}>
            {features.map((f) => {
              const Icon = hot ? StarRoundedIcon : CheckRoundedIcon;
              return (
                <Stack key={f} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                  <Icon
                    sx={{
                      fontSize: 18,
                      color: hot ? accentDeep : COLORS.primary,
                      mt: 0.15,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.86rem",
                      color: COLORS.ink,
                      fontWeight: hot ? 600 : 500,
                      lineHeight: 1.45,
                    }}
                  >
                    {f}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Footnote */}
      {footnote && (
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
      )}

      {/* CTA */}
      {ctaLabel && ctaHref && (
        <Box sx={{ px: 3, py: 2.5 }}>
          <Button
            fullWidth
            variant={hot ? "contained" : "outlined"}
            component={Link}
            href={ctaHref}
            sx={{
              borderRadius: 999,
              py: 1.15,
              ...(hot && accent === "green" && {
                bgcolor: accentColor,
                color: "#FFFFFF",
                backgroundImage: `linear-gradient(180deg, ${accentColor} 0%, ${accentDeep} 100%)`,
                "&:hover": {
                  bgcolor: accentDeep,
                  backgroundImage: `linear-gradient(180deg, ${accentColor} 0%, ${accentDeep} 100%)`,
                },
              }),
              ...(hot && accent === "gold" && {
                bgcolor: accentColor,
                color: accentInk,
                backgroundImage: `linear-gradient(180deg, ${COLORS.accentBright} 0%, ${COLORS.accent} 100%)`,
                "&:hover": {
                  backgroundImage: `linear-gradient(180deg, ${COLORS.accent} 0%, ${COLORS.accentDeep} 100%)`,
                },
              }),
            }}
          >
            {ctaLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
}

function PartnerStat({ big, label }: { big: string; label: string }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: "rgba(217,168,75,0.08)",
        border: `1px solid rgba(217,168,75,0.25)`,
        py: 1.75,
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: { xs: "1.6rem", md: "1.9rem" },
          fontWeight: 600,
          color: COLORS.accentDeep,
          lineHeight: 1,
        }}
      >
        {big}
      </Typography>
      <Typography sx={{ fontSize: "0.8rem", color: COLORS.muted, mt: 0.5 }}>
        {label}
      </Typography>
    </Box>
  );
}
