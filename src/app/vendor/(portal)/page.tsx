"use client";

import Link from "next/link";
import {
  Box,
  Button,
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
import {
  vendor,
  vendorKpis,
  vendorOwnOffers,
  vendorRedemptions,
} from "@/lib/vendorData";
import {
  SectionCard,
  StatusPill,
  portalText,
} from "@/components/vendor/PortalUI";

export default function VendorOverview() {
  const monthsLeftInWaiver = Math.max(0, 6 - vendor.monthsInProgram);
  const waiverProgress = Math.min(100, (vendor.monthsInProgram / 6) * 100);
  const firstName = vendor.contactName.split(" ")[0];
  const activeOffers = vendorOwnOffers.filter((o) => o.status === "published").length;

  return (
    <Stack spacing={2.5}>
      {/* NAVY HERO — welcome + KPIs + waiver */}
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
        {/* Layered background */}
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
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at 80% 50%, black 0%, transparent 75%)",
            pointerEvents: "none",
          }}
        />

        <Box sx={{ position: "relative", p: { xs: 2.5, md: 3 } }}>
          {/* Top row: title + actions */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, mb: { xs: 2.5, md: 3 } }}
          >
            <Box>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                <NavyChip
                  icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 11 }} />}
                  label="VERIFIED PARTNER"
                  tone="green"
                />
                <NavyChip
                  label={`FOUNDING · MONTH ${vendor.monthsInProgram}/12`}
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
                Welcome back, {firstName}.
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.86rem",
                  lineHeight: 1.5,
                  maxWidth: 520,
                  mt: 0.5,
                }}
              >
                You delivered{" "}
                <Box component="strong" sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                  ${vendorKpis.savingsDeliveredMonth.toLocaleString()}
                </Box>{" "}
                in member savings this month across{" "}
                <Box component="strong" sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                  {vendorKpis.redemptionsThisMonth}
                </Box>{" "}
                redemptions.
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

          {/* KPI row — dark cards inside the hero */}
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <NavyStat
                icon={ReceiptLongOutlinedIcon}
                label="Redemptions, MTD"
                value={String(vendorKpis.redemptionsThisMonth)}
                footer={`${vendorKpis.redemptionsLifetime} lifetime`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <NavyStat
                icon={SavingsOutlinedIcon}
                label="Savings delivered, MTD"
                value={`$${vendorKpis.savingsDeliveredMonth.toLocaleString()}`}
                footer={`$${vendorKpis.savingsDeliveredLifetime.toLocaleString()} lifetime`}
                accent
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <NavyStat
                icon={GroupsOutlinedIcon}
                label="Inbound leads, MTD"
                value={String(vendorKpis.leadsThisMonth)}
                footer="From directory + hotline"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <NavyStat
                icon={LocalOfferOutlinedIcon}
                label="Active offers"
                value={String(activeOffers)}
                footer={`${vendorKpis.pendingOffersCount} pending review`}
                accent
              />
            </Grid>
          </Grid>

          {/* Founding waiver progress — inline at bottom of hero */}
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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { sm: "center" } }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
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
                <Typography
                  sx={{
                    fontSize: "0.74rem",
                    color: "rgba(255,255,255,0.55)",
                    mt: 1,
                    lineHeight: 1.5,
                  }}
                >
                  Months 7-12 bill at $49/mo (launch rate locked). Standard $199/mo from month 13.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Below the hero — actionable summary */}
      <Grid container spacing={2}>
        {/* This week / nudges */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="This week" subtitle="Where to focus" padding="default">
            <Stack spacing={1.25}>
              <ActionRow
                label={`${vendorKpis.pendingOffersCount} offer${vendorKpis.pendingOffersCount === 1 ? "" : "s"} pending team review`}
                href="/vendor/offers"
                tone="gold"
                visible={vendorKpis.pendingOffersCount > 0}
              />
              <ActionRow
                label={`${vendorKpis.leadsThisMonth} new lead${vendorKpis.leadsThisMonth === 1 ? "" : "s"} this month`}
                href="/vendor/redemptions"
                tone="navy"
                visible={vendorKpis.leadsThisMonth > 0}
              />
              <ActionRow
                label="Profile is verified and live in the directory"
                href="/vendor/profile"
                tone="green"
                visible={vendor.verified}
              />
              {vendorKpis.pendingOffersCount === 0 && vendorKpis.leadsThisMonth === 0 && (
                <Typography sx={{ ...portalText.body, fontSize: "0.86rem" }}>
                  Nothing urgent. Consider adding a new offer to keep the listing fresh.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>

        {/* Recent redemptions snapshot */}
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
            <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
              {vendorRedemptions.slice(0, 4).map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    px: 2,
                    py: 1.25,
                    "&:hover": { bgcolor: "rgba(14,42,61,0.02)" },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#0A1A2F" }} noWrap>
                      {r.memberDisplay} · {r.city}
                    </Typography>
                    <Typography sx={{ fontSize: "0.74rem", color: "#6A7591" }} noWrap>
                      {r.offerTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontWeight: 700, color: "#1F5C40", fontSize: "0.84rem" }}>
                      ${r.amountSaved.toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#7A8590" }}>{r.redeemedOn}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        {/* Offers status */}
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
              <Box>Redemptions</Box>
            </Box>
            <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
              {vendorOwnOffers.slice(0, 5).map((o) => (
                <Box
                  key={o.id}
                  sx={{
                    display: { xs: "block", md: "grid" },
                    gridTemplateColumns: "minmax(0, 2fr) 130px 110px 130px",
                    alignItems: "center",
                    px: 2,
                    py: 1.25,
                    gap: 1,
                    "&:hover": { bgcolor: "rgba(14,42,61,0.02)" },
                  }}
                >
                  <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#0A1A2F" }} noWrap>
                    {o.title}
                  </Typography>
                  <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: "0.82rem", fontWeight: 700, color: "#1F5C40" }}>
                    {o.discountLabel}
                  </Typography>
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <LegacyOfferStatus status={o.status} />
                  </Box>
                  <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: "0.82rem", color: "#5C6770" }}>
                    {o.redemptions} redemption{o.redemptions === 1 ? "" : "s"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ display: { xs: "flex", md: "none" }, mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }}
                  >
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#1F5C40" }}>
                      {o.discountLabel}
                    </Typography>
                    <LegacyOfferStatus status={o.status} />
                    <Typography sx={{ fontSize: "0.78rem", color: "#5C6770" }}>
                      {o.redemptions} redemption{o.redemptions === 1 ? "" : "s"}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}

/**
 * Small chip used inside the navy hero. White outline + translucent bg.
 */
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

/**
 * KPI tile rendered inside the navy hero — translucent dark surface with
 * white text and gold-accent variants for the highlighted ones.
 */
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
        transition: "border-color 200ms ease, background-color 200ms ease",
        "&:hover": {
          bgcolor: accent ? "rgba(217,168,75,0.12)" : "rgba(255,255,255,0.06)",
          borderColor: accent ? "rgba(217,168,75,0.4)" : "rgba(255,255,255,0.16)",
        },
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
        <Typography
          sx={{
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.55)",
            mt: 0.5,
            lineHeight: 1.4,
          }}
        >
          {footer}
        </Typography>
      )}
    </Box>
  );
}

function ActionRow({
  label,
  href,
  tone,
  visible,
}: {
  label: string;
  href: string;
  tone: "gold" | "navy" | "green";
  visible: boolean;
}) {
  if (!visible) return null;
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
        transition: "background-color 160ms ease",
        "&:hover": { bgcolor: palette.bg.replace(/[\d.]+\)$/, "0.14)") },
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: palette.dot, flexShrink: 0 }} />
      <Typography sx={{ flex: 1, fontSize: "0.84rem", color: "#0A1A2F", lineHeight: 1.4 }}>
        {label}
      </Typography>
      <ArrowForwardIcon sx={{ fontSize: 14, color: palette.arrow }} />
    </Box>
  );
}

function LegacyOfferStatus({ status }: { status: string }) {
  type ReviewStatusKey = "draft" | "pending_review" | "approved" | "rejected";
  const map: Record<string, ReviewStatusKey> = {
    published: "approved",
    pending_review: "pending_review",
    draft: "draft",
    paused: "draft",
    rejected: "rejected",
  };
  const mapped = (map[status] ?? "draft") as ReviewStatusKey;
  return <StatusPill status={mapped} size="sm" />;
}
