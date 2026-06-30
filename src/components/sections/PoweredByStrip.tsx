"use client";

import Image from "next/image";
import { Box, Container, Stack, Typography } from "@mui/material";
import { COLORS } from "@/theme";

type PoweredByItem = {
  name: string;
  // When a logo file exists in /public, render the image.
  // When null, render a typographic wordmark instead.
  logo: string | null;
};

const POWERED_BY: PoweredByItem[] = [
  { name: "Thriving Dentist", logo: "/td-logo.png" },
  { name: "Less Insurance Dependence", logo: "/lid-logo.png" },
  { name: "Insurance Untangled", logo: "/iu-logo.png" },
  { name: "RIDA Academy", logo: "/rida-logo.png" },
  { name: "Dental Marketing Society", logo: "/dms-logo.png" },
];

// We render the list twice back-to-back so the marquee can loop seamlessly
// without a visible "snap" when the first copy slides off the screen.
const MARQUEE_TRACK = [...POWERED_BY, ...POWERED_BY];

export default function PoweredByStrip() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 3.5, md: 4.5 },
        bgcolor: COLORS.surfaceAlt,
        borderTop: `1px solid ${COLORS.line}`,
        borderBottom: `1px solid ${COLORS.line}`,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2.25} sx={{ alignItems: "center" }}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: COLORS.accentDeep,
              textAlign: "center",
            }}
          >
            Proudly powered by
          </Typography>

          {/* Marquee — endless horizontal scroll. We mask the edges so
              logos fade in/out instead of popping at the viewport edge. */}
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              maskImage:
                "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 4, md: 6 },
                width: "max-content",
                animation: "poweredByMarquee 38s linear infinite",
                "@keyframes poweredByMarquee": {
                  from: { transform: "translateX(0)" },
                  // We translate by 50% because the track contains two
                  // copies of the list — so the second copy lines up with
                  // where the first started.
                  to: { transform: "translateX(-50%)" },
                },
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  width: "100%",
                },
              }}
            >
              {MARQUEE_TRACK.map((p, idx) => (
                <PoweredByMark key={`${p.name}-${idx}`} item={p} />
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

function PoweredByMark({ item }: { item: PoweredByItem }) {
  if (item.logo) {
    return (
      <Box
        sx={{
          position: "relative",
          width: { xs: 100, sm: 120, md: 140 },
          height: { xs: 38, sm: 44, md: 50 },
          flexShrink: 0,
          filter: "grayscale(0.25)",
          opacity: 0.85,
          transition: "opacity 220ms ease, filter 220ms ease",
          "&:hover": { opacity: 1, filter: "grayscale(0)" },
        }}
      >
        <Image
          src={item.logo}
          alt={item.name}
          fill
          sizes="140px"
          style={{ objectFit: "contain", objectPosition: "center" }}
        />
      </Box>
    );
  }
  // Wordmark fallback for logos we don't yet have a file for.
  return (
    <Typography
      sx={{
        fontFamily: "var(--font-display)",
        fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
        fontWeight: 500,
        color: COLORS.inkSoft,
        letterSpacing: "-0.005em",
        whiteSpace: "nowrap",
        opacity: 0.85,
        flexShrink: 0,
        transition: "opacity 220ms ease, color 220ms ease",
        "&:hover": { opacity: 1, color: COLORS.ink },
      }}
    >
      {item.name}
    </Typography>
  );
}
