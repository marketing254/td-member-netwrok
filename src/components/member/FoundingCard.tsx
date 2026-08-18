"use client";

import Link from "next/link";
import { Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import type { SvgIconComponent } from "@mui/icons-material";

/**
 * FoundingCard — the member "$49 card", dark navy/gold design (from the
 * team's mock): navy header band, slashed anchor price, lock-for-life
 * pill, WHAT'S INSIDE feature list, gold CTA, and (on the payment page)
 * the three-state invitation-code module directly under the button:
 *   idle    → a quiet "Have an invitation code?" link (no empty box)
 *   open    → input + Apply (uppercase, Enter submits)
 *   applied → green band "CODE applied — courtesy of {owner}" + Remove,
 *             and the CTA relabels to "Start my 3 months free".
 * Used on /upgrade (button CTA + promo) and /pricing (link CTA, no promo).
 */

const CARD_BG = "#171A1F";
const HEADER_BG = "#12325A";
const CARD_LINE = "rgba(255,255,255,0.09)";
const TXT = "#F4F1EA";
const TXT_SOFT = "rgba(244,241,234,0.72)";
const TXT_MUTED = "rgba(244,241,234,0.5)";
const GOLD = "#D9A84B";
const GOLD_DEEP = "#C8922E";

const WHATS_INSIDE: { icon: SvgIconComponent; title: string; body: string }[] = [
  {
    icon: PeopleAltOutlinedIcon,
    title: "The expert directory",
    body: "Every expert in the network, what they do and how to reach them. Curated, not an algorithm.",
  },
  {
    icon: StorefrontOutlinedIcon,
    title: "The company directory",
    body: "Vetted companies with member-only offers on what you already pay for.",
  },
  {
    icon: LibraryBooksOutlinedIcon,
    title: "Kits and courses",
    body: "A growing library, each kit with an action guide, checklist, worksheet and video. Plus full courses from the experts.",
  },
  {
    icon: SupportAgentOutlinedIcon,
    title: "The expert hotline",
    body: "Bring any practice problem. A written answer and the right people to speak to, within 2 to 3 working days.",
  },
  {
    icon: CalculateOutlinedIcon,
    title: "Calculators and tools",
    body: "Built for practice owners, ready in the portal.",
  },
];

export type PromoModule = {
  state: "idle" | "open";
  input: string;
  busy: boolean;
  error: string | null;
  applied: { code: string; ownerName: string | null; trialDays: number } | null;
  onOpen: () => void;
  onInput: (v: string) => void;
  onApply: () => void;
  onRemove: () => void;
};

type TierKey = "founding" | "early" | "standard";

const TIER_HEAD: Record<TierKey, { title: string; sub: string }> = {
  founding: { title: "Founding", sub: "For the first 100 members" },
  early: { title: "Early Member", sub: "For members 101–500" },
  standard: { title: "Standard", sub: "Full membership" },
};

export default function FoundingCard({
  tier,
  interval,
  remaining,
  ctaLabel,
  ctaBusy,
  onCta,
  ctaHref,
  promo,
}: {
  tier: TierKey;
  interval: "monthly" | "annual";
  /** Seats left in this tier (founding/early) — shown in the header. */
  remaining?: number | null;
  ctaLabel: string;
  ctaBusy?: boolean;
  /** Payment page: click starts checkout. */
  onCta?: () => void;
  /** Marketing pages: CTA is a link instead. */
  ctaHref?: string;
  /** Payment page only — the invitation-code module under the CTA. */
  promo?: PromoModule;
}) {
  const head = TIER_HEAD[tier];
  const monthly = tier === "founding" ? "$49" : tier === "early" ? "$99" : "$199";
  const yearly = tier === "founding" ? "$490" : tier === "early" ? "$990" : "$1,990";
  const anchorMonthly = "$199 /mo";
  const anchorAnnual = "$1,990 /yr";
  const showAnchor = tier !== "standard";
  const lockLine =
    tier === "founding"
      ? "Locked for life at $49, even when it goes to $199"
      : tier === "early"
        ? "Locked for life at $99, even when it goes to $199"
        : null;
  const finalCta = promo?.applied ? "Start my 3 months free" : ctaLabel;

  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: `1.5px solid ${GOLD}`,
        bgcolor: CARD_BG,
        color: TXT,
        overflow: "hidden",
        boxShadow: "0 30px 70px -30px rgba(10,26,47,0.65)",
      }}
    >
      {/* Header band */}
      <Box sx={{ bgcolor: HEADER_BG, px: 3, py: 2 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.15 }}>
              {head.title}
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.72)", mt: 0.25 }}>
              {head.sub}
            </Typography>
          </Box>
          {typeof remaining === "number" && tier !== "standard" && (
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", color: GOLD, whiteSpace: "nowrap", textTransform: "uppercase" }}>
              {remaining} of {tier === "founding" ? 100 : 400} left
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Price block */}
      <Box sx={{ px: 3, pt: 2.75, pb: 2.5, textAlign: "center", borderBottom: `1px solid ${CARD_LINE}` }}>
        {showAnchor && (
          <Typography sx={{ fontSize: "1rem", color: TXT_MUTED, textDecoration: "line-through", textDecorationColor: "rgba(244,241,234,0.45)", mb: 0.25 }}>
            {interval === "monthly" ? anchorMonthly : anchorAnnual}
          </Typography>
        )}
        <Stack direction="row" spacing={0.75} sx={{ justifyContent: "center", alignItems: "baseline" }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.02em" }}>
            {interval === "monthly" ? monthly : yearly}
          </Typography>
          <Typography sx={{ fontSize: "1.05rem", color: TXT_SOFT, fontWeight: 500 }}>
            /{interval === "monthly" ? "mo" : "yr"}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: "0.9rem", color: TXT_SOFT, mt: 0.75 }}>
          {interval === "monthly" ? `or ${yearly} a year` : `or ${monthly} a month`}
        </Typography>
        {lockLine && (
          <Box
            sx={{
              display: "inline-block",
              mt: 1.5,
              px: 2,
              py: 0.7,
              borderRadius: 999,
              bgcolor: "#F7EBD3",
              color: "#0A1A2F",
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            {lockLine}
          </Box>
        )}
      </Box>

      {/* What's inside */}
      <Box sx={{ px: 3, pt: 2.5 }}>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.18em", color: TXT_MUTED, textTransform: "uppercase", mb: 1.75 }}>
          What&apos;s inside
        </Typography>
        <Stack spacing={1.9}>
          {WHATS_INSIDE.map(({ icon: Icon, title, body }) => (
            <Stack key={title} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <Icon sx={{ fontSize: 19, color: GOLD, mt: 0.3, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: TXT, lineHeight: 1.35 }}>
                  {title}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: TXT_SOFT, lineHeight: 1.55, mt: 0.2 }}>
                  {body}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Tier extras */}
      {tier !== "standard" && (
        <Box sx={{ px: 3, pt: 2.75 }}>
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.18em", color: TXT_MUTED, textTransform: "uppercase", mb: 1.5 }}>
            {tier === "founding" ? "Founding members also get" : "Early members also get"}
          </Typography>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <StarRoundedIcon sx={{ fontSize: 18, color: GOLD, mt: 0.25, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.88rem", color: TXT_SOFT, lineHeight: 1.5 }}>
                <Box component="strong" sx={{ color: TXT, fontWeight: 700 }}>Your rate locked for life</Box>, even when it rises for everyone else
              </Typography>
            </Stack>
            {tier === "founding" && (
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                <StarRoundedIcon sx={{ fontSize: 18, color: GOLD, mt: 0.25, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.88rem", color: TXT_SOFT, lineHeight: 1.5 }}>
                  <Box component="strong" sx={{ color: TXT, fontWeight: 700 }}>A say in what we build next.</Box> We ask, and we act on it
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      )}

      {/* CTA + invitation code module */}
      <Box sx={{ px: 3, pt: 3 }}>
        <Button
          fullWidth
          disableElevation
          disabled={ctaBusy}
          {...(ctaHref ? { component: Link, href: ctaHref } : { onClick: onCta })}
          startIcon={ctaBusy ? <CircularProgress size={15} sx={{ color: "#0A1A2F" }} /> : null}
          sx={{
            bgcolor: GOLD_DEEP,
            "&&": { color: "#14181F" },
            fontSize: "1.02rem",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "10px",
            py: 1.4,
            transition: "background-color 200ms ease, transform 200ms ease",
            // Doubled selector out-specifies the theme's MuiButton hover
            // (which otherwise paints the button black on hover).
            "&&:hover": { bgcolor: GOLD, transform: "translateY(-1px)" },
            "&.Mui-disabled": { bgcolor: "rgba(217,168,75,0.45)", color: "#14181F" },
            "&:focus-visible": { outline: `2px solid ${TXT}`, outlineOffset: 2 },
          }}
        >
          {finalCta}
        </Button>

        {promo && (
          <Box sx={{ mt: 1.5 }}>
            {promo.applied ? (
              <Box
                sx={{
                  borderRadius: "10px",
                  bgcolor: "rgba(214,238,225,0.95)",
                  px: 2,
                  py: 1.1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <CheckRoundedIcon sx={{ fontSize: 17, color: "#1F5C40", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, color: "#1F5C40", flex: 1, minWidth: 0 }}>
                  {promo.applied.code} applied — courtesy of {promo.applied.ownerName ?? "the DMN team"}
                </Typography>
                <Box
                  component="button"
                  type="button"
                  onClick={promo.onRemove}
                  sx={{
                    all: "unset",
                    cursor: "pointer",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    color: "rgba(31,92,64,0.75)",
                    textDecoration: "underline",
                    "&:hover": { color: "#1F5C40" },
                  }}
                >
                  Remove
                </Box>
              </Box>
            ) : promo.state === "open" ? (
              <>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    autoFocus
                    fullWidth
                    placeholder="Invitation code"
                    value={promo.input}
                    onChange={(e) => promo.onInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        promo.onApply();
                      }
                    }}
                    slotProps={{
                      input: {
                        sx: {
                          color: TXT,
                          fontSize: "0.94rem",
                          letterSpacing: "0.08em",
                          bgcolor: "rgba(255,255,255,0.05)",
                          "& fieldset": { borderColor: CARD_LINE },
                          "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                          "&.Mui-focused fieldset": { borderColor: GOLD },
                        },
                      },
                    }}
                  />
                  <Button
                    disableElevation
                    disabled={promo.busy || !promo.input.trim()}
                    onClick={promo.onApply}
                    sx={{
                      border: `1px solid ${CARD_LINE}`,
                      "&&": { color: TXT },
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "8px",
                      px: 2.5,
                      flexShrink: 0,
                      "&:hover": { borderColor: GOLD, bgcolor: "rgba(217,168,75,0.1)" },
                      "&.Mui-disabled": { color: TXT_MUTED, borderColor: CARD_LINE },
                    }}
                  >
                    {promo.busy ? "Checking…" : "Apply"}
                  </Button>
                </Stack>
                {promo.error && (
                  <Typography sx={{ mt: 0.75, fontSize: "0.8rem", color: "#E5A9A9", textAlign: "center" }}>
                    {promo.error}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: "center" }}>
                <Box
                  component="button"
                  type="button"
                  onClick={promo.onOpen}
                  sx={{
                    all: "unset",
                    cursor: "pointer",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    color: GOLD,
                    "&:hover": { color: "#E5BA63" },
                    "&:focus-visible": { outline: `2px solid ${GOLD}`, outlineOffset: 3 },
                  }}
                >
                  Have an invitation code?
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Reassurance */}
      <Box sx={{ px: 3, pt: 1.75, pb: 2.5, textAlign: "center" }}>
        <Typography sx={{ fontSize: "0.78rem", color: TXT_MUTED, lineHeight: 1.6 }}>
          {tier === "standard"
            ? "Cancel any time"
            : "30-day money-back guarantee · cancel any time"}
          <br />
          Secure checkout via Stripe
        </Typography>
      </Box>
    </Box>
  );
}
