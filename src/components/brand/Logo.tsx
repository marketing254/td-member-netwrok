"use client";
import Link from "next/link";
import Image from "next/image";
import { Box } from "@mui/material";

type Props = {
  /** True when rendering on a dark background (used by the footer). */
  dark?: boolean;
  /** Display mode. Lockup = full DMN wordmark. Sigil = compact stacked. */
  variant?: "lockup" | "sigil";
  /** Show the FOUNDED BY THRIVING DENTIST subline. Default true for lockup. */
  showSubline?: boolean;
  /** Total visual height in pixels. The logo scales to this. */
  height?: number;
  /** Wrap in next/link with this href. Omit for no link. */
  href?: string;
  /** Aria label on the link wrapper. */
  ariaLabel?: string;
};

export default function Logo({
  dark = false,
  variant = "lockup",
  height = 56,
  href,
  ariaLabel = "Dental Member Network · home",
}: Props) {
  // DGN-logo.png is square (1:1). Use a slight horizontal extension so the
  // "FOUNDED BY THRIVING DENTIST" caption isn't visually cropped at small heights.
  const aspect = 1;
  const width = Math.round(height * aspect);

  const content = (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        height,
        width,
        // On dark surfaces, invert lightness so the navy/gold logo flips to cream/gold-ish.
        // Done with a subtle filter that preserves the gold accent.
        filter: dark
          ? "brightness(0) invert(1) drop-shadow(0 0 0.5px rgba(255,255,255,0.5))"
          : "none",
        transition: "filter 250ms ease",
      }}
    >
      <Image
        src="/DGN-logo.png"
        alt="Dental Member Network"
        fill
        priority
        sizes={`${width}px`}
        style={{
          objectFit: "contain",
          objectPosition: "left center",
        }}
      />
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

// Re-export variant constant so existing callers using "sigil" prop don't break.
export type { Props as LogoProps };
