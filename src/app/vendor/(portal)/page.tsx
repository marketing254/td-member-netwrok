"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  fetchCurrentVendor,
  fetchVendorKpis,
  fetchVendorOffers,
  fetchVendorRedemptions,
  type VendorKpis,
  type OfferWithCatalog,
  type RedemptionWithOffer,
} from "@/lib/supabase/vendorQueries";
import type { VendorsRow } from "@/lib/supabase/types";
import { SectionCard, StatusPill, portalText } from "@/components/vendor/PortalUI";
import ReferralCard from "@/components/shared/ReferralCard";

export default function VendorOverview() {
  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorsRow | null>(null);
  const [kpis, setKpis] = useState<VendorKpis | null>(null);
  const [offers, setOffers] = useState<OfferWithCatalog[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionWithOffer[]>([]);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!active) return;
      setSignedInEmail(userData.user?.email ?? null);

      const v = await fetchCurrentVendor(supabase);
      if (!active) return;
      setVendor(v);

      if (v) {
        const [kpiData, offerData, redemptionData] = await Promise.all([
          fetchVendorKpis(supabase, v.id),
          fetchVendorOffers(supabase, v.id),
          fetchVendorRedemptions(supabase, v.id, { limit: 5 }),
        ]);
        if (!active) return;
        setKpis(kpiData);
        setOffers(offerData);
        setRedemptions(redemptionData);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const firstName = useMemo(() => {
    if (!vendor) return "Partner";
    return vendor.contact_name?.split(" ")[0] ?? vendor.display_name ?? "Partner";
  }, [vendor]);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#A07823" }} />
        <Typography sx={{ color: "#5C6770", fontSize: "0.88rem" }}>Loading your dashboard…</Typography>
      </Stack>
    );
  }

  if (!vendor) {
    return (
      <SectionCard padding="default">
        <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center", py: 4 }}>
          <Typography sx={portalText.sectionTitle}>No vendor profile found.</Typography>
          {signedInEmail ? (
            <>
              <Typography sx={{ color: "#5C6770", fontSize: "0.88rem", maxWidth: 540 }}>
                You&apos;re signed in as <Box component="strong" sx={{ color: "#0A1A2F" }}>{signedInEmail}</Box>, but no
                vendor row is linked to that email. If you&apos;re an admin testing the portal, sign out and sign
                back in with the email used on your vendor application.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Box
                  component="a"
                  href="/vendor/login"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 2,
                    py: 0.85,
                    borderRadius: 999,
                    bgcolor: "#0A1A2F",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { bgcolor: "#0F2540" },
                  }}
                >
                  Sign in as a different account
                </Box>
                <Box
                  component="a"
                  href="mailto:partnerships@joindmn.com"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 2,
                    py: 0.85,
                    borderRadius: 999,
                    border: "1px solid rgba(14,42,61,0.18)",
                    color: "#0A1A2F",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { borderColor: "#A07823", color: "#A07823" },
                  }}
                >
                  Email partners team
                </Box>
              </Stack>
            </>
          ) : (
            <Typography sx={{ color: "#5C6770", fontSize: "0.88rem", maxWidth: 540 }}>
              Your session has expired. Head to{" "}
              <Box component="a" href="/vendor/login" sx={{ color: "#A07823", fontWeight: 600 }}>
                /vendor/login
              </Box>{" "}
              and request a fresh magic link.
            </Typography>
          )}
        </Stack>
      </SectionCard>
    );
  }

  const k = kpis ?? {
    redemptionsThisMonth: 0,
    redemptionsLifetime: 0,
    savingsDeliveredMonth: 0,
    savingsDeliveredLifetime: 0,
    leadsThisMonth: 0,
    pendingOffersCount: 0,
    activeOffersCount: 0,
  };

  const monthsLeftInWaiver = Math.max(0, 6 - vendor.months_in_program);
  const waiverProgress = Math.min(100, (vendor.months_in_program / 6) * 100);

  return (
    <Stack spacing={2.5}>
      {/* NAVY HERO */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 2.5,
          color: "#FFFFFF",
          backgroundImage: "linear-gradient(135deg, #061322 0%, #0A1A2F 50%, #0F2540 100%)",
          border: "1px solid rgba(217,168,75,0.18)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(50% 50% at 85% 0%, rgba(240,193,110,0.28) 0%, transparent 55%), radial-gradient(35% 50% at 0% 100%, rgba(42,95,168,0.18) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, mb: { xs: 2.5, md: 3 } }}
          >
            <Box>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                <NavyChip
                  icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 11 }} />}
                  label={vendor.verified ? "VERIFIED PARTNER" : "PENDING REVIEW"}
                  tone={vendor.verified ? "green" : "gold"}
                />
                <NavyChip
                  label={`${vendor.plan_id?.toUpperCase() ?? "FOUNDING"} · MONTH ${vendor.months_in_program}/12`}
                  tone="gold"
                />
              </Stack>
              <Typography
                component="h1"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "1.45rem", md: "1.7rem" },
                  fontWeight: 500,
                  color: "#FFFFFF",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                Welcome, {firstName}.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.86rem", lineHeight: 1.5, maxWidth: 520, mt: 0.5 }}>
                {k.redemptionsThisMonth > 0 ? (
                  <>
                    You delivered{" "}
                    <Box component="strong" sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                      ${k.savingsDeliveredMonth.toLocaleString()}
                    </Box>{" "}
                    in member savings this month across{" "}
                    <Box component="strong" sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                      {k.redemptionsThisMonth}
                    </Box>{" "}
                    redemptions.
                  </>
                ) : vendor.verified ? (
                  "No member redemptions yet this month. Add or refresh an offer to keep your listing fresh."
                ) : (
                  "Your application is under team review. You can set up your catalog and draft offers — they'll go live to members once your profile is approved."
                )}
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/vendor/offers/new"
              variant="contained"
              size="small"
              startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: "#D4A44B",
                color: "#0A1A2F",
                textTransform: "none",
                fontSize: "0.84rem",
                fontWeight: 700,
                px: 1.75,
                py: 0.75,
                boxShadow: "0 4px 14px -4px rgba(212,164,75,0.55)",
                "&:hover": { bgcolor: "#E6B860", boxShadow: "0 6px 18px -4px rgba(212,164,75,0.7)" },
              }}
            >
              Create offer
            </Button>
          </Stack>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <NavyStat
                icon={ReceiptLongOutlinedIcon}
                label="Redemptions, MTD"
                value={String(k.redemptionsThisMonth)}
                footer={`${k.redemptionsLifetime} lifetime`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <NavyStat
                icon={SavingsOutlinedIcon}
                label="Savings delivered, MTD"
                value={`$${k.savingsDeliveredMonth.toLocaleString()}`}
                footer={`$${k.savingsDeliveredLifetime.toLocaleString()} lifetime`}
                accent
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <NavyStat
                icon={GroupsOutlinedIcon}
                label="Inbound leads, MTD"
                value={String(k.leadsThisMonth)}
                footer="Bookings + hotline"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <NavyStat
                icon={LocalOfferOutlinedIcon}
                label="Active offers"
                value={String(k.activeOffersCount)}
                footer={`${k.pendingOffersCount} pending review`}
                accent
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline" }}>
                <Typography
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#F0C16E",
                  }}
                >
                  Founding waiver
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>
                  <Box component="strong" sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                    {monthsLeftInWaiver}
                  </Box>{" "}
                  month{monthsLeftInWaiver === 1 ? "" : "s"} left at $0/mo
                </Typography>
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={waiverProgress}
              sx={{
                height: 5,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.1)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  backgroundImage: "linear-gradient(90deg, #D4A44B 0%, #F0C16E 100%)",
                },
              }}
            />
            <Typography sx={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.55)", mt: 1, lineHeight: 1.5 }}>
              Months 7-12 bill at $49/mo (launch rate locked). Standard $199/mo from month 13.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Referral link — partners can share this on their own marketing */}
      <Box sx={{ mb: 2 }}>
        <ReferralCard endpoint="/api/vendor/referral" accent="#6E3346" />
      </Box>

      {/* Below the hero */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="This week" subtitle="Where to focus" padding="default">
            <Stack spacing={1.25}>
              {!vendor.verified && (
                <ActionRow
                  label="Your application is under review by the team"
                  href="/vendor/agreement"
                  tone="gold"
                />
              )}
              {k.pendingOffersCount > 0 && (
                <ActionRow
                  label={`${k.pendingOffersCount} offer${k.pendingOffersCount === 1 ? "" : "s"} pending team review`}
                  href="/vendor/offers"
                  tone="gold"
                />
              )}
              {vendor.verified && k.leadsThisMonth > 0 && (
                <ActionRow
                  label={`${k.leadsThisMonth} new lead${k.leadsThisMonth === 1 ? "" : "s"} this month`}
                  href="/vendor/redemptions"
                  tone="navy"
                />
              )}
              {vendor.verified && k.pendingOffersCount === 0 && k.leadsThisMonth === 0 && (
                <Typography sx={{ ...portalText.body, fontSize: "0.86rem" }}>
                  Nothing urgent. Consider adding a new offer to keep the listing fresh.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="Recent redemptions"
            subtitle="Latest members using your offers"
            padding="none"
            action={
              <Box
                component={Link}
                href="/vendor/redemptions"
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#A07823",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": { color: "#7A5B17" },
                }}
              >
                See all <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </Box>
            }
          >
            {redemptions.length === 0 ? (
              <Box sx={{ px: 2, py: 3, color: "#9CA3AB", fontSize: "0.84rem" }}>
                No redemptions yet. They&apos;ll appear here once members start using your offers.
              </Box>
            ) : (
              <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
                {redemptions.map((r) => (
                  <Box
                    key={r.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      px: 2,
                      py: 1.25,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#0A1A2F" }} noWrap>
                        {r.member_display ?? "Member"}
                        {r.member_city ? ` · ${r.member_city}` : ""}
                      </Typography>
                      <Typography sx={{ fontSize: "0.74rem", color: "#6A7591" }} noWrap>
                        {r.offers?.headline ?? "—"}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontWeight: 700, color: "#1F5C40", fontSize: "0.84rem" }}>
                        ${Number(r.amount_saved ?? 0).toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#7A8590" }}>
                        {r.redeemed_on}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Your offers"
            subtitle="Status snapshot across all listings"
            padding="none"
            action={
              <Box
                component={Link}
                href="/vendor/offers"
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#A07823",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": { color: "#7A5B17" },
                }}
              >
                Manage offers <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </Box>
            }
          >
            {offers.length === 0 ? (
              <Box sx={{ px: 2, py: 3, color: "#9CA3AB", fontSize: "0.84rem" }}>
                No offers yet.{" "}
                <Box component={Link} href="/vendor/catalog/new" sx={{ color: "#A07823", fontWeight: 600 }}>
                  Add a catalog item first
                </Box>
                , then attach an offer to it.
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: { xs: "none", md: "grid" },
                    gridTemplateColumns: "minmax(0, 2fr) 130px 110px 130px",
                    px: 2,
                    py: 1.25,
                    borderBottom: "1px solid rgba(14,42,61,0.06)",
                    bgcolor: "#FBFAF6",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#7A8590",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  <Box>Offer</Box>
                  <Box>Discount</Box>
                  <Box>Status</Box>
                  <Box>Valid</Box>
                </Box>
                <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
                  {offers.slice(0, 5).map((o) => (
                    <Box
                      key={o.id}
                      sx={{
                        display: { xs: "block", md: "grid" },
                        gridTemplateColumns: "minmax(0, 2fr) 130px 110px 130px",
                        px: 2,
                        py: 1.25,
                      }}
                    >
                      <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#0A1A2F" }} noWrap>
                        {o.headline}
                      </Typography>
                      <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: "0.82rem", fontWeight: 700, color: "#1F5C40" }}>
                        {o.discount_value}
                      </Typography>
                      <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <StatusPill status={o.review_status} size="sm" />
                      </Box>
                      <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: "0.78rem", color: "#5C6770" }}>
                        {o.valid_from} → {o.valid_to}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}

function NavyChip({
  icon,
  label,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  tone: "gold" | "green" | "neutral";
}) {
  const palette =
    tone === "gold"
      ? { bg: "rgba(217,168,75,0.16)", fg: "#F0C16E", border: "rgba(217,168,75,0.36)" }
      : tone === "green"
        ? { bg: "rgba(34,108,78,0.18)", fg: "#A8E6BD", border: "rgba(34,108,78,0.4)" }
        : { bg: "rgba(255,255,255,0.06)", fg: "#FFFFFF", border: "rgba(255,255,255,0.18)" };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        height: 22,
        borderRadius: 0.75,
        bgcolor: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        fontSize: "0.62rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
      }}
    >
      {icon}
      {label}
    </Box>
  );
}

function NavyStat({
  icon: Icon,
  label,
  value,
  footer,
  accent,
}: {
  icon: SvgIconComponent;
  label: string;
  value: string;
  footer?: string;
  accent?: boolean;
}) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 1.75,
        borderRadius: 1.5,
        bgcolor: accent ? "rgba(217,168,75,0.08)" : "rgba(255,255,255,0.04)",
        border: accent ? "1px solid rgba(217,168,75,0.25)" : "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: accent ? "#F0C16E" : "rgba(255,255,255,0.55)",
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: 0.75,
            display: "grid",
            placeItems: "center",
            bgcolor: accent ? "rgba(217,168,75,0.18)" : "rgba(255,255,255,0.06)",
            border: accent ? "1px solid rgba(217,168,75,0.35)" : "1px solid rgba(255,255,255,0.1)",
            color: accent ? "#F0C16E" : "rgba(255,255,255,0.8)",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 14 }} />
        </Box>
      </Stack>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.55rem",
          fontWeight: 600,
          color: "#FFFFFF",
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
        }}
      >
        {value}
      </Typography>
      {footer && (
        <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", mt: 0.5, lineHeight: 1.4 }}>
          {footer}
        </Typography>
      )}
    </Box>
  );
}

function ActionRow({ label, href, tone }: { label: string; href: string; tone: "gold" | "navy" | "green" }) {
  const palette =
    tone === "gold"
      ? { bg: "rgba(217,168,75,0.08)", border: "rgba(217,168,75,0.3)", dot: "#A07823", arrow: "#A07823" }
      : tone === "green"
        ? { bg: "rgba(34,108,78,0.06)", border: "rgba(34,108,78,0.28)", dot: "#1F5C40", arrow: "#1F5C40" }
        : { bg: "rgba(14,42,61,0.04)", border: "rgba(14,42,61,0.12)", dot: "#0E2A3D", arrow: "#0E2A3D" };
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        px: 1.5,
        py: 1,
        borderRadius: 1.25,
        bgcolor: palette.bg,
        border: `1px solid ${palette.border}`,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: palette.dot, flexShrink: 0 }} />
      <Typography sx={{ flex: 1, fontSize: "0.84rem", color: "#0A1A2F", lineHeight: 1.4 }}>{label}</Typography>
      <ArrowForwardIcon sx={{ fontSize: 14, color: palette.arrow }} />
    </Box>
  );
}
