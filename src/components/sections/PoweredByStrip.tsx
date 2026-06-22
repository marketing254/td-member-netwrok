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
  { name: "RIDA Academy", logo: null },
  { name: "Dental Marketing Society", logo: "/dms-logo.png" },
];

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
        <Stack
          spacing={{ xs: 2.5, md: 0 }}
          direction={{ xs: "column", md: "row" }}
          sx={{
            alignItems: "center",
            justifyContent: { md: "space-between" },
          }}
        >
          <Typography
            sx={{
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: COLORS.accentDeep,
              flexShrink: 0,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Proudly powered by
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 2.5, sm: 4, md: 5 },
              flex: { md: 1 },
              ml: { md: 4 },
            }}
          >
            {POWERED_BY.map((p) => (
              <PoweredByMark key={p.name} item={p} />
            ))}
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
        transition: "opacity 220ms ease, color 220ms ease",
        "&:hover": { opacity: 1, color: COLORS.ink },
      }}
    >
      {item.name}
    </Typography>
  );
}
