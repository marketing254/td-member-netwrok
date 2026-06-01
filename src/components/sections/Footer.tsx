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

        {/* Bottom row: contact + copyright + legal.
            DESKTOP: single thin row (contact left, legal center, copyright right).
            MOBILE:  vertically stacked groups with healthy spacing, so links
            don't run together and tap targets stay comfortable. */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.75, md: 3 }}
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: "1px solid rgba(246,241,231,0.08)",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            color: "rgba(246,241,231,0.45)",
            fontSize: "0.74rem",
          }}
        >
          {/* Contact */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 0.5, sm: 1.5 }}
            sx={{
              alignItems: { xs: "flex-start", sm: "center" },
              fontSize: "0.78rem",
            }}
          >
            <Box
              component="a"
              href={`tel:${brand.phoneTel}`}
              sx={{
                color: "rgba(246,241,231,0.78)",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "secondary.light" },
              }}
            >
              {brand.phoneDisplay}
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" }, color: "rgba(246,241,231,0.3)" }}
            >
              ·
            </Box>
            <Box
              component="a"
              href={`mailto:${brand.email}`}
              sx={{
                color: "rgba(246,241,231,0.78)",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { color: "secondary.light" },
                wordBreak: "break-word",
              }}
            >
              {brand.email}
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "none", md: "inline" }, color: "rgba(246,241,231,0.3)" }}
            >
              ·
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(246,241,231,0.5)",
                fontSize: "0.74rem",
                display: { xs: "none", md: "inline" },
              }}
            >
              {footerCopy.responseValue}
            </Typography>
          </Stack>

          {/* Legal links — wrap onto multiple lines on mobile with comfortable gap */}
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              flexWrap: "wrap",
              gap: { xs: 1.25, md: 2 },
              rowGap: { xs: 0.75, md: 0.5 },
            }}
          >
            {FOOTER_LEGAL.map((l) => (
              <Box
                key={l.href}
                component={Link}
                href={l.href}
                sx={{
                  color: "rgba(246,241,231,0.6)",
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

          {/* Copyright */}
          <Typography
            variant="body2"
            sx={{
              color: "rgba(246,241,231,0.45)",
              fontSize: "0.72rem",
              lineHeight: 1.55,
            }}
          >
            {footerCopy.copyright}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
