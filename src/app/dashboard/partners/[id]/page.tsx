"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const GOLD = "#A07823";
const LINE = "#E6DDCF";

type Offer = {
  id: string;
  headline: string;
  discount_value: string | null;
  promo_code: string | null;
  description: string | null;
  terms: string | null;
  valid_to: string | null;
};
type PartnerProfile = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  calendar_link: string | null;
};

/**
 * /dashboard/partners/[id] — full member-facing partner profile + offers.
 */
export default function PartnerProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/member/partners/${id}`, { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const body = (await res.json()) as { partner?: PartnerProfile; offers?: Offer[] };
        if (!body.partner) {
          setNotFound(true);
          return;
        }
        setPartner(body.partner);
        setOffers(body.offers ?? []);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", py: { xs: 3, md: 4 }, px: { xs: 2, md: 0 } }}>
      <Box
        component={Link}
        href="/dashboard/partners"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, textDecoration: "none", color: INK_MUTED, fontSize: "0.85rem", fontWeight: 600, mb: 3, "&:hover": { color: GOLD } }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> All partners
      </Box>

      {loading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress size={22} sx={{ color: GOLD }} />
        </Stack>
      ) : notFound || !partner ? (
        <Box sx={{ textAlign: "center", py: 8, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
          <Typography sx={{ fontSize: "1.05rem", fontWeight: 600, color: INK, mb: 0.5 }}>
            We couldn&apos;t find that partner
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: INK_MUTED }}>
            <Box component={Link} href="/dashboard/partners" sx={{ color: GOLD, fontWeight: 600 }}>
              Browse all partners
            </Box>
          </Typography>
        </Box>
      ) : (
        <Stack spacing={{ xs: 3.5, md: 4.5 }}>
          {/* Header */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2.5, sm: 3 }} sx={{ alignItems: { sm: "center" } }}>
            <Box
              sx={{
                position: "relative",
                width: { xs: 84, sm: 100 },
                height: { xs: 84, sm: 100 },
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#FBF8F1",
                border: `1px solid ${LINE}`,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
              }}
            >
              {partner.logo_url ? (
                <Image src={partner.logo_url} alt={partner.name} fill sizes="100px" unoptimized style={{ objectFit: "contain", padding: 10 }} />
              ) : (
                <StorefrontOutlinedIcon sx={{ color: GOLD, fontSize: 40 }} />
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              {partner.category && (
                <Typography sx={{ fontSize: "0.72rem", color: GOLD, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.75 }}>
                  {partner.category}
                </Typography>
              )}
              <Typography
                component="h1"
                sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.9rem", md: "2.3rem" }, fontWeight: 500, color: INK, lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                {partner.name}
              </Typography>
            </Box>
          </Stack>

          {/* Actions */}
          {(partner.website || partner.calendar_link) && (
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
              {partner.calendar_link && (
                <Button
                  component="a"
                  href={partner.calendar_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  startIcon={<CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />}
                  sx={{ textTransform: "none", borderRadius: 999, bgcolor: INK, "&:hover": { bgcolor: "#13253c" } }}
                >
                  Book / contact
                </Button>
              )}
              {partner.website && (
                <Button
                  component="a"
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<LanguageRoundedIcon sx={{ fontSize: 17 }} />}
                  sx={{ textTransform: "none", borderRadius: 999, borderColor: LINE, color: INK }}
                >
                  Visit website
                </Button>
              )}
            </Stack>
          )}

          {/* About */}
          {partner.description && (
            <Section title="About">
              <Typography sx={{ color: INK_SOFT, fontSize: "1rem", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {partner.description}
              </Typography>
            </Section>
          )}

          {/* Offers */}
          <Section title="Member offers">
            {offers.length === 0 ? (
              <Typography sx={{ color: INK_MUTED, fontSize: "0.92rem" }}>
                No published offers yet — check back soon.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {offers.map((o) => (
                  <OfferCard key={o.id} offer={o} />
                ))}
              </Stack>
            )}
          </Section>
        </Stack>
      )}
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", color: INK_MUTED, textTransform: "uppercase", mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <Box sx={{ border: `1px solid ${LINE}`, borderRadius: 2, bgcolor: "#FFFFFF", p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "rgba(217,168,75,0.14)", display: "grid", placeItems: "center", flexShrink: 0, mt: 0.25 }}>
          <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: GOLD }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.25 }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: INK }}>{offer.headline}</Typography>
            {offer.discount_value && (
              <Chip label={offer.discount_value} size="small" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: "rgba(34,108,78,0.12)", color: "#1F5C40" }} />
            )}
          </Stack>
          {offer.description && (
            <Typography sx={{ fontSize: "0.88rem", color: INK_SOFT, lineHeight: 1.55, mt: 0.5 }}>{offer.description}</Typography>
          )}
          {offer.promo_code && (
            <Typography sx={{ fontSize: "0.82rem", color: INK, mt: 0.75 }}>
              Promo code:{" "}
              <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#FBF8F1", border: `1px solid ${LINE}`, borderRadius: 0.75, px: 0.75, py: 0.25 }}>
                {offer.promo_code}
              </Box>
            </Typography>
          )}
          {offer.terms && (
            <Typography sx={{ fontSize: "0.76rem", color: INK_MUTED, mt: 0.75, lineHeight: 1.5 }}>{offer.terms}</Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
