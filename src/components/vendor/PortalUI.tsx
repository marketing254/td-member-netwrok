"use client";

import { Box, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import {
  statusLabel,
  statusPalette,
  type ReviewStatus,
} from "@/lib/catalogData";

/**
 * Portal UI primitives.
 * Shared typography + cards + status pills + media thumbs so every vendor
 * portal page renders with the same ecommerce-backend look.
 *
 * Font scale (deliberately small — backend, not marketing):
 *   Page title (h1)     1.25rem  / 20px / semibold
 *   Section title       0.9rem   / 14px / semibold
 *   Eyebrow / meta      0.66rem  / 10.5px / uppercase 0.14em letterspace
 *   Body                0.84rem  / 13.5px
 *   Small meta          0.74rem  / 12px
 *   Stat number         1.625rem / 26px / display font
 */

export const portalText = {
  pageTitle: {
    fontSize: { xs: "1.15rem", md: "1.25rem" },
    fontWeight: 600,
    lineHeight: 1.25,
    color: "#0A1A2F",
    letterSpacing: "-0.01em",
  } as SxProps<Theme>,
  pageSubtitle: {
    fontSize: "0.84rem",
    color: "#5C6770",
    lineHeight: 1.55,
    maxWidth: 640,
  } as SxProps<Theme>,
  sectionTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0A1A2F",
    lineHeight: 1.3,
  } as SxProps<Theme>,
  eyebrow: {
    fontSize: "0.66rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#7A8590",
  } as SxProps<Theme>,
  body: {
    fontSize: "0.84rem",
    color: "#3B4A55",
    lineHeight: 1.6,
  } as SxProps<Theme>,
  meta: {
    fontSize: "0.74rem",
    color: "#6A7591",
    lineHeight: 1.5,
  } as SxProps<Theme>,
  statValue: {
    fontFamily: "var(--font-display)",
    fontSize: "1.625rem",
    fontWeight: 600,
    color: "#0A1A2F",
    lineHeight: 1.05,
    letterSpacing: "-0.01em",
  } as SxProps<Theme>,
};

/**
 * Page header used at the top of every portal page.
 * Eyebrow + Title + Subtitle on the left, optional action slot on the right.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {eyebrow && (
          <Typography sx={{ ...portalText.eyebrow, display: "block", mb: 0.5 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography component="h1" sx={portalText.pageTitle}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ ...portalText.pageSubtitle, mt: 0.5 }}>{subtitle}</Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0, flexWrap: "wrap", rowGap: 1 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

/**
 * Reusable white card with an optional title bar and action slot.
 */
export function SectionCard({
  title,
  subtitle,
  action,
  children,
  padding = "default",
  sx,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  padding?: "default" | "compact" | "none";
  sx?: SxProps<Theme>;
}) {
  const padMap = {
    default: { px: { xs: 2, md: 2.5 }, py: { xs: 2, md: 2.25 } },
    compact: { px: 1.75, py: 1.5 },
    none: { p: 0 },
  } as const;
  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        border: "1px solid",
        borderColor: "rgba(14,42,61,0.08)",
        borderRadius: 2,
        boxShadow: "0 1px 0 rgba(14,42,61,0.02)",
        overflow: "hidden",
        ...(sx ?? {}),
      }}
    >
      {(title || action) && (
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 2.5 },
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "rgba(14,42,61,0.06)",
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {title && <Typography sx={portalText.sectionTitle}>{title}</Typography>}
            {subtitle && (
              <Typography sx={{ ...portalText.meta, mt: 0.25 }}>{subtitle}</Typography>
            )}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>
      )}
      <Box sx={padMap[padding]}>{children}</Box>
    </Box>
  );
}

/**
 * KPI tile. Icon + label + value, optional footer/trend line.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  footer,
  accent,
}: {
  icon?: SvgIconComponent;
  label: string;
  value: string;
  footer?: React.ReactNode;
  accent?: "gold" | "navy" | "green" | "red";
}) {
  const tint =
    accent === "gold"
      ? { bg: "rgba(217,168,75,0.12)", border: "rgba(217,168,75,0.3)", color: "#A07823" }
      : accent === "green"
        ? { bg: "rgba(34,108,78,0.1)", border: "rgba(34,108,78,0.28)", color: "#1F5C40" }
        : accent === "red"
          ? { bg: "rgba(220,60,60,0.1)", border: "rgba(220,60,60,0.26)", color: "#8C1D1D" }
          : { bg: "rgba(14,42,61,0.05)", border: "rgba(14,42,61,0.14)", color: "#0E2A3D" };

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        border: "1px solid",
        borderColor: "rgba(14,42,61,0.08)",
        borderRadius: 2,
        px: 2,
        py: 1.75,
        boxShadow: "0 1px 0 rgba(14,42,61,0.02)",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
        <Typography sx={portalText.eyebrow}>{label}</Typography>
        {Icon && (
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: tint.bg,
              border: `1px solid ${tint.border}`,
              color: tint.color,
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 15 }} />
          </Box>
        )}
      </Stack>
      <Typography sx={portalText.statValue}>{value}</Typography>
      {footer && (
        <Box sx={{ mt: 0.5, fontSize: "0.74rem", color: "#6A7591", lineHeight: 1.5 }}>
          {footer}
        </Box>
      )}
    </Box>
  );
}

/**
 * Small status pill. Picks colors from catalogData.statusPalette.
 */
export function StatusPill({ status, size = "md" }: { status: ReviewStatus; size?: "sm" | "md" }) {
  const palette = statusPalette(status);
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: size === "sm" ? 0.75 : 1,
        height: size === "sm" ? 18 : 20,
        borderRadius: 0.75,
        bgcolor: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        fontSize: size === "sm" ? "0.6rem" : "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: palette.fg,
          opacity: 0.9,
        }}
      />
      {statusLabel(status)}
    </Box>
  );
}

/**
 * Plain pill (non-status). Used for tags, type indicators, etc.
 */
export function TagPill({
  label,
  tone = "neutral",
  size = "md",
}: {
  label: string;
  tone?: "neutral" | "gold" | "navy";
  size?: "sm" | "md";
}) {
  const palette =
    tone === "gold"
      ? { bg: "rgba(217,168,75,0.1)", fg: "#7A5B17", border: "rgba(217,168,75,0.32)" }
      : tone === "navy"
        ? { bg: "rgba(14,42,61,0.06)", fg: "#0E2A3D", border: "rgba(14,42,61,0.16)" }
        : { bg: "rgba(14,42,61,0.04)", fg: "#3B4A55", border: "rgba(14,42,61,0.1)" };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: size === "sm" ? 0.75 : 1,
        height: size === "sm" ? 18 : 20,
        borderRadius: 0.75,
        bgcolor: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        fontSize: size === "sm" ? "0.6rem" : "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}

/**
 * Image thumb with caption-on-hover.
 */
export function MediaThumb({
  src,
  caption,
  size = 64,
}: {
  src: string;
  caption?: string;
  size?: number;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "rgba(14,42,61,0.08)",
        bgcolor: "#F7F4ED",
        "&:hover .media-caption": { opacity: 1 },
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={caption ?? ""}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {caption && (
        <Box
          className="media-caption"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "stretch",
            backgroundImage: "linear-gradient(180deg, transparent 40%, rgba(10,26,47,0.78) 100%)",
            color: "#FFFFFF",
            fontSize: "0.62rem",
            lineHeight: 1.3,
            p: 0.5,
            opacity: 0,
            transition: "opacity 180ms ease",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
            {caption}
          </span>
        </Box>
      )}
    </Box>
  );
}

/**
 * Video thumb with play overlay + duration ribbon.
 */
export function VideoThumb({
  thumbnail,
  title,
  duration,
  size = 84,
}: {
  thumbnail: string;
  title: string;
  duration?: string;
  size?: number;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: Math.round(size * 0.66),
        flexShrink: 0,
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "rgba(14,42,61,0.08)",
        bgcolor: "#0A1A2F",
      }}
      title={title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnail}
        alt={title}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85, display: "block" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "#FFFFFF",
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}
      >
        <PlayArrowRoundedIcon sx={{ fontSize: 28, opacity: 0.95 }} />
      </Box>
      {duration && (
        <Box
          sx={{
            position: "absolute",
            right: 4,
            bottom: 4,
            px: 0.5,
            py: "1px",
            borderRadius: 0.5,
            bgcolor: "rgba(10,26,47,0.85)",
            color: "#FFFFFF",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {duration}
        </Box>
      )}
    </Box>
  );
}

/**
 * Generic empty state shown when a list has no rows.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon?: SvgIconComponent;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
        px: 3,
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "rgba(14,42,61,0.12)",
        bgcolor: "rgba(14,42,61,0.02)",
      }}
    >
      {Icon && (
        <Box
          sx={{
            mx: "auto",
            width: 48,
            height: 48,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(217,168,75,0.12)",
            color: "#A07823",
            mb: 1.5,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>
      )}
      <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#0A1A2F", mb: 0.5 }}>
        {title}
      </Typography>
      {body && (
        <Typography sx={{ fontSize: "0.82rem", color: "#5C6770", maxWidth: 380, mx: "auto", mb: action ? 2.5 : 0 }}>
          {body}
        </Typography>
      )}
      {action}
    </Box>
  );
}
