"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { motion, useReducedMotion } from "framer-motion";
import Countdown from "@/components/sections/Countdown";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";

const MotionBox = motion.create(Box);

const LAUNCH_DATE = new Date(
  process.env.NEXT_PUBLIC_LAUNCH_AT ?? "2026-05-27T13:00:00.000Z",
);

type Reveal = {
  daysOut: number;
  category: "FEATURE" | "VENDOR" | "MEMBER" | "BEHIND THE SCENES";
  headline: string;
  body: string;
};

const REVEALS: Reveal[] = [
  { daysOut: 14, category: "BEHIND THE SCENES", headline: "Why we built this", body: "After 12 years on the Thriving Dentist podcast, the same questions kept coming back. The hotline is the answer — a real expert, on the phone, in two business hours." },
  { daysOut: 13, category: "FEATURE", headline: "The 2-hour SLA", body: "Every case gets a written response within 2 business hours. Not a chatbot. Not a forum. A specialist who has solved this for another owner already." },
  { daysOut: 12, category: "VENDOR", headline: "Founding vendor: PPO consultancy", body: "Our first founding vendor partner negotiates fee schedules for $0 upfront. Members reported $8K–$22K in first-year savings during the pilot." },
  { daysOut: 11, category: "MEMBER", headline: "Dr. Diana W., Chicago", body: "Used the hotline three times in her first month. Saved $150K on a decision she was about to greenlight. Her quote: \"I would have signed the wrong lease.\"" },
  { daysOut: 10, category: "FEATURE", headline: "The vendor savings ledger", body: "Every dollar a vendor saves you shows up in a private ledger. The membership pays for itself if you average more than $50/mo in negotiated savings." },
  { daysOut: 9, category: "BEHIND THE SCENES", headline: "Why $49 is locked for life", body: "Founding members keep $49/mo on the current product forever. We will charge more later, but the first 1,000 of you are grandfathered. No fine print." },
  { daysOut: 8, category: "VENDOR", headline: "Vendor #4 unlocked", body: "A national supply distributor will offer founding members a flat 18% off the wholesale catalog. The deal goes live the day we open." },
  { daysOut: 7, category: "FEATURE", headline: "The member directory", body: "500+ practice owners, searchable by city, specialty, and growth stage. For referrals, hiring, peer reviews, and the occasional rescue call." },
  { daysOut: 6, category: "MEMBER", headline: "Dr. Marcus C., San Francisco", body: "Hired two associates through the member directory in 90 days. Quote: \"The pool is owner-operators, not floaters.\"" },
  { daysOut: 5, category: "BEHIND THE SCENES", headline: "What we will not do", body: "No four-figure mastermind upsells. No surprise coaching pitches. The membership is the product. Premium tier bundles coaching transparently or not at all." },
  { daysOut: 4, category: "FEATURE", headline: "Weekly content cadence", body: "Four audio episodes, one long-form video, one live AMA per month. All led by people who have actually run the play they're describing." },
  { daysOut: 3, category: "VENDOR", headline: "Final founding vendors", body: "We are closing the founding-vendor cohort at 12 partners. Three slots left. If you applied as a vendor, your status email goes out 48 hours before launch." },
  { daysOut: 2, category: "FEATURE", headline: "Quarterly strategy reviews", body: "Premium-tier members get a 90-minute review every quarter. Real planning around real numbers — not a feel-good coaching call." },
  { daysOut: 1, category: "BEHIND THE SCENES", headline: "Tomorrow, the doors open", body: "Your invitation email goes out at 9am ET tomorrow. Founding spots are first-come; we expect to seat the first cohort within 72 hours." },
  { daysOut: 0, category: "BEHIND THE SCENES", headline: "Today. Welcome in.", body: "The members area is live. Check your inbox for your founding invitation. The hotline is open." },
];

function daysUntilLaunch(): number {
  const now = new Date();
  const a = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const b = Date.UTC(LAUNCH_DATE.getUTCFullYear(), LAUNCH_DATE.getUTCMonth(), LAUNCH_DATE.getUTCDate());
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

const CATEGORY_COLORS: Record<string, string> = {
  FEATURE: "#2AA7B8",
  VENDOR: "#A07823",
  MEMBER: "#2E8A57",
  "BEHIND THE SCENES": "#6B4FA0",
};

export default function ThanksClient() {
  const params = useSearchParams();
  const role = params.get("role") === "vendor" ? "vendor" : params.get("role") === "expert" ? "expert" : "member";
  const again = params.get("again") === "1";
  const reduced = useReducedMotion();
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const today = useMemo(() => (mounted ? daysUntilLaunch() : 14), [mounted]);
  const orderedReveals = useMemo(() => [...REVEALS].sort((a, b) => b.daysOut - a.daysOut), []);

  const referralUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://dentalmembernetwork.com";
    return `${window.location.origin}/?ref=${role[0]}${Math.floor(Math.random() * 99999)
      .toString(36)
      .padStart(4, "0")}`;
  }, [role]);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
    } catch {
      // ignore
    }
  };

  const roleLabel = role === "vendor" ? "Vendor Partner" : role === "expert" ? "Expert" : "Founding Member";

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundImage: "linear-gradient(180deg, #FBF8F1 0%, #F5F0E4 50%, #FFFFFF 100%)",
          color: "#0A1A2F",
        }}
      >
        {/* Warm radial wash */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 500,
            background: "radial-gradient(60% 100% at 50% 0%, rgba(217,168,75,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, py: { xs: 4, md: 6 } }}>
          {/* Top bar */}
          <Stack direction="row" sx={{ mb: 5, justifyContent: "space-between", alignItems: "center" }}>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBackIcon />}
              sx={{ color: "#3B4A55", "&:hover": { bgcolor: "rgba(14,42,61,0.04)" } }}
            >
              Back home
            </Button>
            <Chip
              label={`${roleLabel.toUpperCase()} · ON THE LIST`}
              size="small"
              icon={<CheckCircleIcon sx={{ fontSize: 14, color: "#2E8A57 !important" }} />}
              sx={{
                bgcolor: "rgba(46,138,87,0.1)",
                color: "#1B6B3A",
                border: "1px solid rgba(46,138,87,0.3)",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
              }}
            />
          </Stack>

          {/* Hero */}
          <Stack spacing={3.5} sx={{ textAlign: "center", mb: { xs: 6, md: 8 }, alignItems: "center" }}>
            <MotionBox
              initial={reduced ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }}
            >
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(46,138,87,0.1)",
                  border: "2px solid rgba(46,138,87,0.25)",
                  mx: "auto",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40, color: "#2E8A57" }} />
              </Box>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Typography variant="h1" sx={{ color: "#0A1A2F", maxWidth: 700, mx: "auto" }}>
                {again ? (
                  <>You&apos;re already in. <Box component="span" sx={{ color: "#A07823" }}>Welcome back.</Box></>
                ) : (
                  <>You&apos;re in. <Box component="span" sx={{ color: "#A07823" }}>The doors open soon.</Box></>
                )}
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: "#3B4A55", maxWidth: 580, mx: "auto", fontSize: { xs: "1.05rem", md: "1.15rem" }, lineHeight: 1.65 }}
              >
                We&apos;ll email you the moment the network goes live. Until then, we&apos;re unlocking one piece of what we&apos;ve been building — every day.
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Countdown variant="light" />
            </MotionBox>
          </Stack>

          {/* THE VAULT */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 1 }}>
              <Box>
                <Typography variant="overline" sx={{ color: "#A07823", letterSpacing: "0.16em" }}>
                  THE VAULT
                </Typography>
                <Typography variant="h3" sx={{ color: "#0A1A2F", mt: 0.5 }}>
                  14 doors. One opens every day.
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#5C6770", maxWidth: 360 }}>
                Today&apos;s door is unlocked. Tomorrow&apos;s appears at midnight. Bookmark this page.
              </Typography>
            </Stack>
          </Stack>

          <Grid container spacing={1.5} sx={{ mb: { xs: 6, md: 8 } }}>
            {orderedReveals.map((reveal, idx) => {
              const isUnlocked = reveal.daysOut >= today;
              const isToday = reveal.daysOut === today;
              const cardNumber = orderedReveals.length - idx;
              return (
                <Grid key={reveal.daysOut} size={{ xs: 6, sm: 4, md: 3, lg: 12 / 7 }}>
                  <VaultCard
                    number={cardNumber}
                    reveal={reveal}
                    unlocked={isUnlocked}
                    isToday={isToday}
                    open={openCard === reveal.daysOut}
                    onToggle={() =>
                      setOpenCard((current) => (current === reveal.daysOut ? null : reveal.daysOut))
                    }
                    index={idx}
                  />
                </Grid>
              );
            })}
          </Grid>

          {/* WHAT TO EXPECT + REFERRAL */}
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 6, md: 8 } }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  bgcolor: "#FFFFFF",
                  border: "1px solid rgba(14,42,61,0.08)",
                  boxShadow: "0 20px 60px -30px rgba(14,42,61,0.12)",
                  height: "100%",
                }}
              >
                <Typography variant="overline" sx={{ color: "#A07823", letterSpacing: "0.16em" }}>
                  WHAT HAPPENS NEXT
                </Typography>
                <Typography variant="h3" sx={{ color: "#0A1A2F", mt: 0.5, mb: 3 }}>
                  Three emails. That&apos;s it.
                </Typography>
                <Stack spacing={2.5}>
                  {[
                    { when: "This week", title: "A short note from Lester", body: "Two paragraphs about what we're solving and what we're not. No pitch." },
                    { when: "48 hours before launch", title: "Your founding invitation link", body: "Sent to the email on your signup. The link is single-use and tied to your $49/mo lifetime rate." },
                    { when: "Launch day", title: "The doors open", body: "Sign in, claim your founding spot, and the hotline is yours." },
                  ].map((step, i) => (
                    <Stack key={step.title} direction="row" spacing={2.5} sx={{ alignItems: "flex-start" }}>
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(217,168,75,0.12)",
                          border: "1px solid rgba(217,168,75,0.3)",
                          color: "#A07823",
                          fontWeight: 700,
                          fontFamily: "var(--font-display)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" sx={{ color: "#5C6770", display: "block", fontSize: "0.62rem" }}>
                          {step.when}
                        </Typography>
                        <Typography sx={{ color: "#0A1A2F", fontWeight: 600, fontSize: "1.05rem", mt: 0.25 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#5C6770", mt: 0.5 }}>
                          {step.body}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  bgcolor: "#0A1A2F",
                  color: "#F6F1E7",
                  height: "100%",
                  boxShadow: "0 30px 60px -30px rgba(14,42,61,0.4)",
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: "linear-gradient(90deg, #D9A84B, #F0C16E, #D9A84B)",
                  }}
                />
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(240,193,110,0.25) 0%, transparent 60%)",
                    filter: "blur(20px)",
                  }}
                />
                <Typography variant="overline" sx={{ color: "#F0C16E", letterSpacing: "0.16em" }}>
                  SKIP THE LINE
                </Typography>
                <Typography variant="h3" sx={{ color: "#F6F1E7", mt: 0.5, mb: 1.5 }}>
                  Move up 3 spots per referral.
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(246,241,231,0.7)", mb: 2.5 }}>
                  Share your link with a peer who runs a practice. Every signup pushes you closer to the front of the founding cohort.
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "stretch",
                    p: 1,
                    borderRadius: 2.5,
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      color: "rgba(246,241,231,0.75)",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: "0.78rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      px: 1,
                      py: 1.25,
                    }}
                  >
                    {referralUrl}
                  </Typography>
                  <IconButton
                    onClick={copyRef}
                    aria-label="Copy referral link"
                    sx={{
                      color: "#F0C16E",
                      bgcolor: "rgba(217,168,75,0.16)",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "rgba(217,168,75,0.24)" },
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(246,241,231,0.4)",
                    fontSize: "0.74rem",
                    mt: 1.5,
                    textAlign: "center",
                  }}
                >
                  Referrals tracked from launch day.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: "center", pt: 2, pb: 2 }}>
            <Typography variant="body2" sx={{ color: "#5C6770", fontSize: "0.82rem" }}>
              Save this page. Come back tomorrow. The next door opens at midnight ET.
            </Typography>
          </Box>
        </Container>
      </Box>
      <Footer />

      <Snackbar
        open={copied}
        autoHideDuration={2200}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message="Referral link copied"
      />
    </>
  );
}

function VaultCard({
  number,
  reveal,
  unlocked,
  isToday,
  open,
  onToggle,
  index,
}: {
  number: number;
  reveal: Reveal;
  unlocked: boolean;
  isToday: boolean;
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const reduced = useReducedMotion();
  const catColor = CATEGORY_COLORS[reveal.category] ?? "#A07823";

  return (
    <MotionBox
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.04, 0.6), ease: [0.16, 1, 0.3, 1] }}
      onClick={unlocked ? onToggle : undefined}
      role="button"
      aria-disabled={!unlocked}
      aria-expanded={open}
      sx={{
        cursor: unlocked ? "pointer" : "not-allowed",
        position: "relative",
        aspectRatio: "1 / 1.18",
        perspective: "1000px",
      }}
    >
      <motion.div
        animate={{ rotateY: open ? 180 : 0 }}
        transition={{ duration: reduced ? 0 : 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
        }}
      >
        {/* FRONT */}
        <Box
          className="backface-hidden"
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: 3,
            p: 1.75,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            bgcolor: unlocked ? "#FFFFFF" : "rgba(14,42,61,0.03)",
            border: "1px solid",
            borderColor: isToday
              ? "rgba(217,168,75,0.6)"
              : unlocked
              ? "rgba(14,42,61,0.1)"
              : "rgba(14,42,61,0.05)",
            boxShadow: isToday
              ? "0 16px 40px -16px rgba(217,168,75,0.35), 0 0 0 1px rgba(217,168,75,0.2)"
              : unlocked
              ? "0 8px 24px -14px rgba(14,42,61,0.1)"
              : "none",
            transition: "border-color 280ms ease, box-shadow 280ms ease, background-color 280ms ease",
            overflow: "hidden",
            transformStyle: "preserve-3d",
            "&:hover": unlocked
              ? {
                  borderColor: "rgba(217,168,75,0.5)",
                  boxShadow: "0 16px 40px -16px rgba(217,168,75,0.25)",
                }
              : undefined,
          }}
        >
          {isToday && (
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: 2,
                background: "linear-gradient(90deg, transparent, #F0C16E, #D9A84B, #F0C16E, transparent)",
              }}
            />
          )}

          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                color: unlocked ? "#0A1A2F" : "rgba(14,42,61,0.2)",
                fontSize: "1.85rem",
                lineHeight: 1,
                letterSpacing: "-0.025em",
                fontWeight: 500,
              }}
            >
              {String(number).padStart(2, "0")}
            </Typography>
            {unlocked ? (
              isToday ? (
                <Box
                  sx={{
                    px: 0.9,
                    py: 0.35,
                    borderRadius: 999,
                    bgcolor: "rgba(217,168,75,0.14)",
                    color: "#A07823",
                    fontWeight: 700,
                    fontSize: "0.55rem",
                    letterSpacing: "0.16em",
                    border: "1px solid rgba(217,168,75,0.4)",
                  }}
                >
                  TODAY
                </Box>
              ) : (
                <LockOpenIcon sx={{ fontSize: 13, color: "rgba(14,42,61,0.25)" }} />
              )
            ) : (
              <LockOutlinedIcon sx={{ fontSize: 13, color: "rgba(14,42,61,0.15)" }} />
            )}
          </Stack>

          <Box sx={{ flex: 1, mt: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: unlocked ? "#3B4A55" : "rgba(14,42,61,0.2)",
                fontSize: "0.72rem",
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              {unlocked
                ? isToday
                  ? "Today's door is open. Tap to peek inside."
                  : "Already opened. Tap to read again."
                : `Unlocks in ${reveal.daysOut} day${reveal.daysOut === 1 ? "" : "s"}`}
            </Typography>
          </Box>

          <Stack direction="row" sx={{ alignItems: "center", gap: 0.75, mt: 1 }}>
            <VisibilityOutlinedIcon
              sx={{ fontSize: 11, color: unlocked ? "rgba(14,42,61,0.25)" : "rgba(14,42,61,0.12)" }}
            />
            <Typography
              variant="body2"
              sx={{
                color: unlocked ? "rgba(14,42,61,0.25)" : "rgba(14,42,61,0.12)",
                fontSize: "0.6rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {reveal.daysOut === 0 ? "Launch day" : `T-${reveal.daysOut}`}
            </Typography>
          </Stack>
        </Box>

        {/* BACK */}
        <Box
          className="backface-hidden"
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: 3,
            p: 1.75,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            bgcolor: "#0A1A2F",
            border: "1px solid rgba(217,168,75,0.35)",
            transform: "rotateY(180deg)",
            transformStyle: "preserve-3d",
            overflow: "hidden",
            boxShadow: "0 20px 50px -20px rgba(14,42,61,0.4)",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(80% 70% at 0% 0%, rgba(217,168,75,0.12) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <Stack spacing={0.75} sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              sx={{
                color: catColor,
                fontSize: "0.55rem",
                letterSpacing: "0.16em",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {reveal.category}
            </Typography>
            <Typography
              sx={{
                color: "#F6F1E7",
                fontFamily: "var(--font-display)",
                fontSize: "0.92rem",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              {reveal.headline}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(246,241,231,0.7)",
              fontSize: "0.66rem",
              lineHeight: 1.45,
              position: "relative",
              zIndex: 1,
            }}
          >
            {reveal.body}
          </Typography>

          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                color: "rgba(246,241,231,0.3)",
                fontSize: "1rem",
                lineHeight: 1,
              }}
            >
              {String(number).padStart(2, "0")}
            </Typography>
            <Typography
              sx={{
                color: "rgba(246,241,231,0.3)",
                fontSize: "0.58rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              tap to close
            </Typography>
          </Stack>
        </Box>
      </motion.div>
    </MotionBox>
  );
}
