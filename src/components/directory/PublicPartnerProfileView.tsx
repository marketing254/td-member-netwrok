"use client";

import Link from "next/link";
import Image from "next/image";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import { COLORS } from "@/theme";

// Public-safe profile only. Booking/contact schedulers are deliberately NOT
// part of the public page — direct booking is a member benefit, so the
// calendar lives inside the member portal only.
export type PublicPartnerProfile = {
  name: string;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
};

export type PublicPartnerOffer = { id: string; headline: string; discount_value: string | null };

/**
 * Client view for the public partner profile page. The server page fetches
 * + gates the data and passes plain props here (MUI + next/link can't be
 * composed from a server component — `component={Link}` is a function).
 */
export default function PublicPartnerProfileView({
  partner,
  offers,
}: {
  partner: PublicPartnerProfile;
  offers: PublicPartnerOffer[];
}) {
  const name = partner.name;
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.surface, display: "flex", flexDirection: "column" }}>
      <Header />
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 }, flex: 1 }}>
        <Box
          component={Link}
          href="/partners"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            textDecoration: "none",
            color: COLORS.muted,
            fontSize: "0.85rem",
            fontWeight: 600,
            mb: 3.5,
            "&:hover": { color: COLORS.accent },
          }}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> All partners
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2.5, sm: 4 }} sx={{ alignItems: { sm: "center" }, mb: 4 }}>
          <Box
            sx={{
              position: "relative",
              width: { xs: 100, sm: 130 },
              height: { xs: 100, sm: 130 },
              borderRadius: 2.5,
              overflow: "hidden",
              bgcolor: "#FFFFFF",
              border: `1px solid ${COLORS.line}`,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            {partner.logo_url ? (
              <Image src={partner.logo_url} alt={name} fill sizes="130px" unoptimized style={{ objectFit: "contain", padding: 12 }} />
            ) : (
              <StorefrontOutlinedIcon sx={{ color: COLORS.accent, fontSize: 48 }} />
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.accent, mb: 0.75 }}>
              Founding Partner{partner.category ? ` · ${partner.category}` : ""}
            </Typography>
            <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "2rem", md: "2.6rem" }, fontWeight: 500, color: COLORS.ink, lineHeight: 1.08, letterSpacing: "-0.02em" }}>
              {name}
            </Typography>
          </Box>
        </Stack>

        {/* No booking/contact CTA here on purpose — direct booking is a
            member benefit; the scheduler only appears inside the portal. */}
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5, mb: 4 }}>
          {partner.website && (
            <Button
              component="a"
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<LanguageRoundedIcon sx={{ fontSize: 17 }} />}
              sx={{ textTransform: "none", borderRadius: 999, borderColor: COLORS.line, color: COLORS.ink }}
            >
              Visit website
            </Button>
          )}
        </Stack>

        {partner.description && (
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.muted, mb: 1.5 }}>
              About
            </Typography>
            <Typography sx={{ color: COLORS.inkSoft, fontSize: "1.02rem", lineHeight: 1.75, whiteSpace: "pre-line", maxWidth: 680 }}>
              {partner.description}
            </Typography>
          </Box>
        )}

        <Box sx={{ borderRadius: 2.5, border: `1px solid ${COLORS.line}`, bgcolor: "#FFFFFF", p: { xs: 2.5, md: 3 } }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.muted, mb: 1.5 }}>
            Member-exclusive offer
          </Typography>
          {offers.length > 0 ? (
            <Stack spacing={1} sx={{ mb: 2 }}>
              {offers.map((o) => (
                <Stack key={o.id} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <LocalOfferOutlinedIcon sx={{ fontSize: 16, color: COLORS.accent }} />
                  <Typography sx={{ color: COLORS.ink, fontWeight: 600, fontSize: "0.95rem" }}>
                    {o.headline}
                    {o.discount_value ? ` — ${o.discount_value}` : ""}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ color: COLORS.muted, fontSize: "0.92rem", mb: 2 }}>
              {name} gives Dental Member Network members an exclusive offer — see it inside the portal.
            </Typography>
          )}
          <Typography sx={{ color: COLORS.muted, fontSize: "0.88rem", mb: 2 }}>
            Offers are redeemable by Dental Member Network members only.
          </Typography>
          <Button component={Link} href="/pricing" variant="contained" sx={{ textTransform: "none", borderRadius: 999, bgcolor: COLORS.accent, color: "#FFFFFF", "&:hover": { bgcolor: COLORS.accent } }}>
            Become a member
          </Button>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
