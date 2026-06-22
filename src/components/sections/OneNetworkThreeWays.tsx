"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { COLORS } from "@/theme";

/**
 * "One network. Three ways in." — three-card section that introduces the
 * Members / Experts / Partners audiences just before the waitlist form.
 * Each card's CTA scrolls to #waitlist and sets ?role=member|expert|partner
 * so WaitlistSection opens on the right tab.
 *
 * Visibility rule: do NOT show the public-facing "Free for life · founding 20"
 * expert price here — per network-overview.md that pricing stays on PDFs,
 * not on the website.
 */
type CardRole = "member" | "expert" | "partner";

const CARDS: Array<{
  eyebrow: string;
  title: string;
  body: string;
  perks: string[];
  cta: string;
  role: CardRole;
}> = [
  {
    eyebrow: "Members",
    title: "For dental practice owners & teams",
    body: "Bring any practice problem to the Hotline and get a written action plan plus the right experts to call — within 2–3 business days.",
    perks: [
      "Expert Hotline with written action plans",
      "Growing resource library — new content weekly",
      "Exclusive partner discounts on software, supplies & services",
      "Live AMAs and CE events",
      "A community of practice owners",
    ],
    cta: "Join the network",
    role: "member",
  },
  {
    eyebrow: "Experts",
    title: "For coaches, consultants & specialists",
    body: "Share one recording. We build your full content kit, put it in front of thousands of practice owners, and send warm leads to your calendar.",
    perks: [
      "A done-for-you content library — built for you",
      "Your featured expert profile",
      "Warm leads booked onto your calendar",
      "Hotline referrals when a member fits your expertise",
      "Sell your own paid courses",
    ],
    cta: "Apply as an expert",
    role: "expert",
  },
  {
    eyebrow: "Partners",
    title: "For companies serving dental practices",
    body: "Reach practice owners who are actively investing in their practice. Pay nothing for 6 months. The channel pays for itself as deals close.",
    perks: [
      "Qualified member leads with a dashboard",
      "Profile and searchable directory placement",
      "Verified Partner badge",
      "Podcast, webinar & event features",
      "Co-marketing across the network",
    ],
    cta: "Apply as a partner",
    role: "partner",
  },
];

export default function OneNetworkThreeWays() {
  const router = useRouter();
  const pathname = usePathname();

  // Clicking a card's CTA: ensure the waitlist form is on screen, then
  // smoothly scroll to it and update the URL so WaitlistSection's
  // useSearchParams effect flips to the right tab. Works whether the
  // user is already on `/` or on a sub-page that links here.
  const onCtaClick = (role: CardRole) => {
    const goHomeAndScroll = (immediate: boolean) => {
      const tick = () => {
        const el = document.getElementById("waitlist");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      if (immediate) tick();
      else requestAnimationFrame(() => requestAnimationFrame(tick));
    };

    if (pathname === "/") {
      router.replace(`/?role=${role}`, { scroll: false });
      goHomeAndScroll(true);
    } else {
      router.push(`/?role=${role}`);
      // Wait for nav, then scroll. Two RAFs to clear the route transition.
      setTimeout(() => goHomeAndScroll(true), 60);
    }
  };

  return (
    <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: COLORS.surface }}>
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: COLORS.accentDeep,
            }}
          >
            Dental Member Network · Founded by Thriving Dentist
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "2rem", md: "2.6rem" },
              fontWeight: 500,
              color: COLORS.ink,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            One network. Three ways in.
          </Typography>
          <Typography
            sx={{
              color: COLORS.muted,
              fontSize: { xs: "0.98rem", md: "1.05rem" },
              maxWidth: 720,
              mx: "auto",
              mt: 1,
            }}
          >
            Connecting dental practice owners with the experts and companies that
            help them grow. Curated by the team behind the Thriving Dentist show,
            not an algorithm.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              mt: 2.5,
              justifyContent: "center",
              alignItems: "center",
              color: COLORS.inkSoft,
              fontSize: "0.86rem",
              fontWeight: 600,
            }}
            divider={
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  bgcolor: COLORS.accent,
                  display: { xs: "none", sm: "block" },
                }}
              />
            }
          >
            <Box>Members bring the questions</Box>
            <Box>Experts bring the knowledge</Box>
            <Box>Partners bring the deals</Box>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {CARDS.map((c, i) => (
            <NetworkCard
              key={c.eyebrow}
              card={c}
              highlight={i === 0}
              onClick={() => onCtaClick(c.role)}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function NetworkCard({
  card,
  highlight,
  onClick,
}: {
  card: (typeof CARDS)[number];
  highlight: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: highlight ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.line}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: highlight
          ? "0 24px 60px -30px rgba(217,168,75,0.4)"
          : "0 14px 38px -28px rgba(14,42,61,0.18)",
        transition: "transform 280ms cubic-bezier(.2,.8,.2,1), box-shadow 280ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: highlight
            ? "0 32px 70px -28px rgba(217,168,75,0.5)"
            : "0 24px 56px -28px rgba(14,42,61,0.28)",
        },
      }}
    >
      <Box sx={{ bgcolor: COLORS.primary, color: "#FFFFFF", px: 3, pt: 3, pb: 2.5 }}>
        <Chip
          label={card.eyebrow}
          size="small"
          sx={{
            bgcolor: highlight ? COLORS.accent : "rgba(255,255,255,0.12)",
            color: highlight ? COLORS.primaryDeep : "#FFFFFF",
            border: highlight ? "none" : "1px solid rgba(255,255,255,0.22)",
            fontWeight: 800,
            letterSpacing: "0.08em",
            fontSize: "0.68rem",
            textTransform: "uppercase",
            height: 24,
            mb: 1.5,
          }}
        />
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 500,
            lineHeight: 1.25,
            color: "#FFFFFF",
            letterSpacing: "-0.005em",
          }}
        >
          {card.title}
        </Typography>
      </Box>

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={{ fontSize: "0.95rem", color: COLORS.inkSoft, lineHeight: 1.6 }}>
          {card.body}
        </Typography>

        <Stack spacing={1} sx={{ mt: 1 }}>
          {card.perks.map((p) => (
            <Stack key={p} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
              <CheckRoundedIcon
                sx={{ fontSize: 18, color: COLORS.primary, mt: 0.15, flexShrink: 0 }}
              />
              <Typography sx={{ fontSize: "0.88rem", color: COLORS.ink, lineHeight: 1.5 }}>
                {p}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Box sx={{ mt: "auto", pt: 1.5 }}>
          <Button
            fullWidth
            onClick={onClick}
            variant={highlight ? "contained" : "outlined"}
            color={highlight ? "secondary" : "primary"}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ borderRadius: 999, py: 1.15 }}
          >
            {card.cta}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
