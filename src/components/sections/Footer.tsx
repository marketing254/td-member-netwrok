"use client";
import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Logo from "@/components/brand/Logo";
import { brand, footer as footerCopy, footerLinks } from "@/lib/content";

const FOOTER_NAV = [
  { label: "What you get", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Waitlist", href: "/#waitlist" },
  { label: "FAQ", href: "/#faq" },
];

const FOOTER_LEGAL = [
  ...footerLinks.Agreements,
  ...footerLinks.Legal,
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        bgcolor: "#0A1A2F",
        color: "#F6F1E7",
        pt: { xs: 3, md: 3.5 },
        pb: 2,
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(40% 60% at 0% 0%, rgba(217,168,75,0.10) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        {/* Top row: brand + CTA + nav links, all inline on desktop */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2.5, md: 3 }}
          sx={{ alignItems: { md: "center" }, justifyContent: "space-between", flexWrap: "wrap", rowGap: 2 }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Logo dark height={38} />
            <Box sx={{ display: { xs: "none", lg: "block" }, maxWidth: 280 }}>
              <Typography sx={{ color: "rgba(246,241,231,0.65)", fontSize: "0.78rem", lineHeight: 1.5 }}>
                {footerCopy.brandDescription}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={{ xs: 1.5, md: 2.5 }}
            sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
          >
            {FOOTER_NAV.map((l) => (
              <Box
                key={l.href}
                component={Link}
                href={l.href}
                sx={{
                  color: "rgba(246,241,231,0.78)",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  transition: "color 200ms ease",
                  "&:hover": { color: "secondary.light" },
                }}
              >
                {l.label}
              </Box>
            ))}
          </Stack>

          <Button
            component={Link}
            href="/#waitlist"
            variant="contained"
            color="secondary"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{ py: 0.75, px: 2.25, fontSize: "0.82rem", flexShrink: 0 }}
          >
            {footerCopy.primaryCta}
          </Button>
        </Stack>

        {/* Bottom row: contact + copyright + legal, single thin row */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 3 }}
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: "1px solid rgba(246,241,231,0.08)",
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            color: "rgba(246,241,231,0.45)",
            fontSize: "0.74rem",
            flexWrap: "wrap",
            rowGap: 1,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
            <Box
              component="a"
              href={`tel:${brand.phoneTel}`}
              sx={{
                color: "rgba(246,241,231,0.7)",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "secondary.light" },
              }}
            >
              {brand.phoneDisplay}
            </Box>
            <Box component="span">·</Box>
            <Box
              component="a"
              href={`mailto:${brand.email}`}
              sx={{
                color: "rgba(246,241,231,0.7)",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "secondary.light" },
              }}
            >
              {brand.email}
            </Box>
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>·</Box>
            <Typography variant="body2" sx={{ color: "rgba(246,241,231,0.5)", fontSize: "0.74rem", display: { xs: "none", md: "inline" } }}>
              {footerCopy.responseValue}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
            {FOOTER_LEGAL.map((l) => (
              <Box
                key={l.href}
                component={Link}
                href={l.href}
                sx={{
                  color: "rgba(246,241,231,0.55)",
                  textDecoration: "none",
                  fontSize: "0.74rem",
                  fontWeight: 500,
                  transition: "color 200ms ease",
                  "&:hover": { color: "secondary.light" },
                }}
              >
                {l.label}
              </Box>
            ))}
          </Stack>

          <Typography variant="body2" sx={{ color: "rgba(246,241,231,0.5)", fontSize: "0.72rem" }}>
            {footerCopy.copyright}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
