"use client";
import Link from "next/link";
import { Box, Typography } from "@mui/material";

type LogoVariant = "lockup" | "sigil";

type Props = {
  /** True when rendering on a dark background. Picks the cream sigil + cream text. */
  dark?: boolean;
  /** Full lockup (sigil + wordmark + subline) or just the icon. */
  variant?: LogoVariant;
  /** Show the MEMBER NETWORK subline below the wordmark. Default: true for lockup. */
  showSubline?: boolean;
  /** Show the thin vertical divider between sigil and wordmark. Default: true for lockup. */
  showDivider?: boolean;
  /** Total visual height in pixels. Sigil and text scale to this. */
  height?: number;
  /** Wrap in next/link with this href. Omit for no link. */
  href?: string;
  /** Override the wordmark colour (used by the landing header during scroll transitions). */
  textColor?: string;
  /** Override the subline colour. */
  sublineColor?: string;
  /** Aria label on the link wrapper. */
  ariaLabel?: string;
};

const SIGIL_LIGHT = "/td-sigil-mark.svg";
const SIGIL_DARK = "/td-sigil-mark-dark.svg";

export default function Logo({
  dark = false,
  variant = "lockup",
  showSubline = true,
  showDivider = true,
  height = 36,
  href,
  textColor,
  sublineColor,
  ariaLabel = "Thriving Dentist Member Network · home",
}: Props) {
  const sigilSrc = dark ? SIGIL_DARK : SIGIL_LIGHT;
  const inkColor = dark ? "#F6F1E7" : "#1A1F24";
  const subDefault = dark ? "rgba(246,241,231,0.7)" : "rgba(26,31,36,0.6)";
  const dividerColor = dark ? "rgba(246,241,231,0.22)" : "rgba(26,31,36,0.18)";

  const wordmarkSize = Math.max(15, Math.round(height * 0.52));
  const sublineSize = Math.max(9, Math.round(height * 0.24));

  const content = (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        lineHeight: 1,
      }}
    >
      <Box
        component="img"
        src={sigilSrc}
        alt=""
        aria-hidden
        sx={{
          height,
          width: height,
          display: "block",
          flexShrink: 0,
          userSelect: "none",
        }}
      />

      {variant === "lockup" && (
        <>
          {showDivider && (
            <Box
              aria-hidden
              sx={{
                width: "1px",
                height: Math.round(height * 0.62),
                bgcolor: dividerColor,
                flexShrink: 0,
                transition: "background-color 250ms ease",
              }}
            />
          )}
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: `${wordmarkSize}px`,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                color: textColor ?? inkColor,
                transition: "color 250ms ease",
                whiteSpace: "nowrap",
              }}
            >
              Thriving Dentist
            </Typography>
            {showSubline && (
              <Typography
                component="span"
                sx={{
                  mt: 0.4,
                  fontWeight: 700,
                  fontSize: `${sublineSize}px`,
                  letterSpacing: "0.22em",
                  color: sublineColor ?? subDefault,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  transition: "color 250ms ease",
                }}
              >
                Member Network
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );

  if (href) {
    return (
      <Box
        component={Link}
        href={href}
        aria-label={ariaLabel}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
          "&:focus-visible": {
            outline: "2px solid currentColor",
            outlineOffset: 4,
            borderRadius: 4,
          },
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}
