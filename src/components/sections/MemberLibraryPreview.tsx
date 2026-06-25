"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Lock,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  Pause,
  PhoneCall,
  Play,
  Search,
  Star,
  TrendingUp,
  Users,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { libraryPreviewSection, libraryPresenter } from "@/lib/content";

const MotionBox = motion.create(Box);

// Reduced from 8 to 6 cards for a less congested grid layout.
// Each entry maps to a topic-specific icon as the thumbnail "still frame."
type LibraryEntry = {
  title: string;
  track: string;
  duration: string;
  durationSec: number;
  Icon: LucideIcon;
};

const NOW_PLAYING: LibraryEntry = {
  title: "9 KPIs that drive your practice",
  track: "Practice Management",
  duration: "47 min",
  durationSec: 47 * 60,
  Icon: BarChart3,
};

const LIBRARY: LibraryEntry[] = [
  {
    title: "Negotiating better PPO fees",
    track: "Insurance Independence",
    duration: "58 min",
    durationSec: 58 * 60,
    Icon: TrendingUp,
  },
  {
    title: "SEO & Google rankings",
    track: "Marketing & Growth",
    duration: "52 min",
    durationSec: 52 * 60,
    Icon: Search,
  },
  {
    title: "The patient experience",
    track: "Team Training",
    duration: "33 min",
    durationSec: 33 * 60,
    Icon: Users,
  },
  {
    title: "Morning huddle playbook",
    track: "Practice Management",
    duration: "28 min",
    durationSec: 28 * 60,
    Icon: Calendar,
  },
  {
    title: "Reviews & online reputation",
    track: "Marketing & Growth",
    duration: "44 min",
    durationSec: 44 * 60,
    Icon: Star,
  },
  {
    title: "Case acceptance with photos",
    track: "Practice Management",
    duration: "42 min",
    durationSec: 42 * 60,
    Icon: Megaphone,
  },
];

const NAV_ITEMS: { label: string; icon: LucideIcon; badge: string; active?: boolean }[] = [
  { label: "Helpline", icon: PhoneCall, badge: "2hr" },
  { label: "Library", icon: Play, badge: "Live", active: true },
  { label: "Vendors", icon: TrendingUp, badge: "$6.4K" },
  { label: "Directory", icon: Users, badge: "500+" },
];

export default function MemberLibraryPreview() {
  const reduced = useReducedMotion();
  // 12-second trailer: progress fills 0 → 100, then we flip to LOCKED state
  // so visitors hit the membership wall. No login during playback.
  const TRAILER_DURATION_SEC = 12;
  const TRAILER_DURATION_MS = TRAILER_DURATION_SEC * 1000;
  const TRAILER_STEP_MS = 100;
  const STEP_PCT = 100 / (TRAILER_DURATION_MS / TRAILER_STEP_MS);

  const [progress, setProgress] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (reduced) {
      // Reduced motion: show the locked state immediately.
      setProgress(100);
      setLocked(true);
      return;
    }
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + STEP_PCT;
        if (next >= 100) {
          setLocked(true);
          return 100;
        }
        return next;
      });
    }, TRAILER_STEP_MS);
    return () => clearInterval(id);
  }, [reduced, STEP_PCT, TRAILER_DURATION_MS]);

  // Trailer time display (0:00 → 0:12). Total stays as the real lesson length.
  const trailerCurrentSec = Math.floor((TRAILER_DURATION_SEC * progress) / 100);
  const totalSec = NOW_PLAYING.durationSec;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 7, md: 10 },
        bgcolor: "#F8F5EE",
        borderTop: "1px solid #E7E2D6",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.25} sx={{ textAlign: "center", maxWidth: 680, mx: "auto", mb: { xs: 5, md: 6 } }}>
          <Typography
            sx={{
              color: "#9B7B3A",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {libraryPreviewSection.eyebrow}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: "#1A1A1A",
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.7rem", md: "2.1rem" },
              fontWeight: 500,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            {libraryPreviewSection.title}
          </Typography>
          <Typography sx={{ color: "#52525B", fontSize: { xs: "0.95rem", md: "1.02rem" } }}>
            {libraryPreviewSection.subtitle}
          </Typography>
        </Stack>

        {/* PORTAL MOCK — bigger, less congested */}
        <MotionBox
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            border: "1px solid #E7E2D6",
            overflow: "hidden",
            boxShadow:
              "0 1px 2px rgba(20,20,20,0.04), 0 30px 80px -40px rgba(20,20,20,0.2)",
          }}
        >
          {/* Window chrome */}
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              bgcolor: "#FBF8F1",
              borderBottom: "1px solid #E7E2D6",
            }}
          >
            <Box sx={{ display: "flex", gap: 0.75 }}>
              <Box sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: "#E07A5F" }} />
              <Box sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: "#C9A876" }} />
              <Box sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: "#81B29A" }} />
            </Box>
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography sx={{ color: "#71717A", fontSize: "0.78rem", fontWeight: 500 }}>
                app.dentalmembernetwork.com / library
              </Typography>
            </Box>
            <Box sx={{ width: 80 }} />
          </Stack>

          {/* Body — sidebar + main content */}
          <Grid container sx={{ minHeight: { xs: 540, md: 640 } }}>
            {/* SIDEBAR — slim, clean */}
            <Grid
              size={{ xs: 12, md: 2.5 }}
              sx={{
                bgcolor: "#FBF8F1",
                borderRight: { md: "1px solid #E7E2D6" },
                p: 2,
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #C9A876 0%, #9B7B3A 100%)",
                      color: "#FFFFFF",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.74rem",
                    }}
                  >
                    Dr
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#1A1A1A", fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.2 }}>
                      You
                    </Typography>
                    <Typography sx={{ color: "#71717A", fontSize: "0.66rem" }}>
                      Founding · #007
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={0.4}>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.active;
                    return (
                      <Box
                        key={item.label}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          px: 1,
                          py: 0.85,
                          borderRadius: 1.25,
                          bgcolor: isActive ? "#FFFFFF" : "transparent",
                          border: isActive ? "1px solid #E7E2D6" : "1px solid transparent",
                          color: isActive ? "#1A1A1A" : "#52525B",
                          fontWeight: isActive ? 600 : 500,
                          boxShadow: isActive ? "0 1px 2px rgba(20,20,20,0.05)" : "none",
                        }}
                      >
                        <Icon size={14} color={isActive ? "#9B7B3A" : "#71717A"} />
                        <Typography sx={{ fontSize: "0.82rem", flex: 1, color: "inherit", fontWeight: "inherit" }}>
                          {item.label}
                        </Typography>
                        <Box
                          sx={{
                            px: 0.65,
                            py: 0.1,
                            borderRadius: 0.85,
                            bgcolor: isActive ? "#FBF8F1" : "transparent",
                            color: isActive ? "#9B7B3A" : "#A8A29E",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            border: isActive ? "1px solid #E7E2D6" : "none",
                          }}
                        >
                          {item.badge}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>

                <Box sx={{ pt: 1.5, borderTop: "1px solid #E7E2D6" }}>
                  <Typography
                    sx={{
                      color: "#9B7B3A",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      mb: 0.65,
                    }}
                  >
                    Savings ledger
                  </Typography>
                  <Typography sx={{ color: "#1A1A1A", fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 600, lineHeight: 1 }}>
                    $4,820
                  </Typography>
                  <Typography sx={{ color: "#71717A", fontSize: "0.7rem", mt: 0.4 }}>
                    via vendor network YTD
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* MAIN — featured player + library grid */}
            <Grid size={{ xs: 12, md: 9.5 }} sx={{ p: { xs: 2.5, md: 3.5 } }}>
              {/* TRAILER — plays 12s then locks. No login during playback. */}
              <FeaturedCard
                entry={NOW_PLAYING}
                progress={progress}
                locked={locked}
                currentTime={formatTime(trailerCurrentSec)}
                totalTime={formatTime(totalSec)}
                trailerLength={TRAILER_DURATION_SEC}
              />

              {/* Library section header */}
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  mt: 3.5,
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "#1A1A1A",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Next in your library
                </Typography>
                <Typography sx={{ color: "#71717A", fontSize: "0.78rem" }}>
                  6 of 42 resources
                </Typography>
              </Stack>

              {/* Library grid — 3 columns, 2 rows = 6 cards. Breathable. */}
              <Grid container spacing={2}>
                {LIBRARY.map((entry, i) => (
                  <Grid key={entry.title} size={{ xs: 12, sm: 6, md: 4 }}>
                    <ThumbnailCard entry={entry} index={i} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </MotionBox>

        <Typography
          variant="body2"
          sx={{
            color: "#71717A",
            fontSize: "0.82rem",
            textAlign: "center",
            mt: 3,
            fontStyle: "italic",
          }}
        >
          A preview of the member portal. Resources update in real time when admins publish.
        </Typography>
      </Container>
    </Box>
  );
}

/**
 * Featured trailer card. Plays a 12-second trailer (no login wall),
 * then flips to a locked state with a membership CTA.
 */
function FeaturedCard({
  entry,
  progress,
  locked,
  currentTime,
  totalTime,
  trailerLength,
}: {
  entry: LibraryEntry;
  progress: number;
  locked: boolean;
  currentTime: string;
  totalTime: string;
  trailerLength: number;
}) {
  const { Icon } = entry;
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2.5,
        bgcolor: "#1A1A1A",
        overflow: "hidden",
        // Soft pulsing ring around the whole card to indicate live playback
        boxShadow:
          "0 0 0 1px rgba(201,168,118,0.45), 0 20px 40px -16px rgba(201,168,118,0.35)",
        animation: "featuredPulse 3s ease-in-out infinite",
        "@keyframes featuredPulse": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 1px rgba(201,168,118,0.4), 0 20px 40px -16px rgba(201,168,118,0.25)",
          },
          "50%": {
            boxShadow:
              "0 0 0 1px rgba(201,168,118,0.7), 0 24px 48px -16px rgba(201,168,118,0.5)",
          },
        },
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      }}
    >
      {/* Top: visual still + play state */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 6.5",
          background:
            "linear-gradient(135deg, #1F1F22 0%, #131316 100%)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "auto 1fr auto" },
          alignItems: "center",
          gap: { xs: 2, sm: 3 },
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 2.5, md: 3 },
        }}
      >
        {/* Soft gold glow blob */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,118,0.28) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        {/* Large icon as visual still */}
        <Box
          sx={{
            width: { xs: 56, sm: 72 },
            height: { xs: 56, sm: 72 },
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(201,168,118,0.18)",
            border: "1px solid rgba(201,168,118,0.35)",
            color: "#C9A876",
            flexShrink: 0,
          }}
        >
          <Icon size={32} strokeWidth={1.8} />
        </Box>

        {/* Text + status */}
        <Box sx={{ position: "relative", minWidth: 0 }}>
          <Stack direction="row" spacing={0.85} sx={{ alignItems: "center", mb: 0.85 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#E07A5F",
                boxShadow: "0 0 8px rgba(224,122,95,0.7)",
                animation: "liveDot 1.4s ease-in-out infinite",
                "@keyframes liveDot": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.3 },
                },
              }}
            />
            <Typography
              sx={{
                color: "#E07A5F",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {locked ? "Trailer complete" : `Free trailer · ${trailerLength}s`}
            </Typography>
            <Typography
              sx={{
                color: "#C9A876",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                ml: 1,
              }}
            >
              · {entry.track}
            </Typography>
          </Stack>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.05rem", sm: "1.25rem" },
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {entry.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1, color: "#A8A29E" }}>
            {/* Gary host bug */}
            <Box
              sx={{
                position: "relative",
                width: 18,
                height: 18,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1px solid rgba(201,168,118,0.45)",
              }}
            >
              <Image
                src="/team/gary-takacs.jpg"
                alt={libraryPresenter.name}
                fill
                sizes="18px"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </Box>
            <Typography sx={{ color: "#A8A29E", fontSize: "0.75rem", fontWeight: 500 }}>
              {libraryPresenter.name}
            </Typography>
            <Box sx={{ width: 2, height: 2, borderRadius: "50%", bgcolor: "#52525B" }} />
            <Typography sx={{ color: "#A8A29E", fontSize: "0.75rem" }}>
              {entry.duration}
            </Typography>
          </Stack>
        </Box>

        {/* Play/Pause/Lock control */}
        <Box
          sx={{
            display: { xs: "none", sm: "grid" },
            placeItems: "center",
            width: 50,
            height: 50,
            borderRadius: "50%",
            bgcolor: locked ? "rgba(201,168,118,0.2)" : "#C9A876",
            color: locked ? "#C9A876" : "#1A1A1A",
            border: locked ? "1px solid rgba(201,168,118,0.5)" : "none",
            cursor: locked ? "default" : "pointer",
            transition: "transform 200ms ease, background 200ms ease",
            "&:hover": locked
              ? undefined
              : { transform: "scale(1.05)", bgcolor: "#D4B07A" },
          }}
        >
          {locked ? (
            <Lock size={18} strokeWidth={2.4} />
          ) : (
            <Pause size={20} strokeWidth={2.5} fill="#1A1A1A" />
          )}
        </Box>
      </Box>

      {/* LOCKED OVERLAY — appears after the trailer completes */}
      {locked && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(19,19,22,0.55) 0%, rgba(19,19,22,0.88) 60%, rgba(19,19,22,0.95) 100%)",
            backdropFilter: "blur(2px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.25,
            px: { xs: 2.5, md: 4 },
            py: { xs: 3, md: 4 },
            zIndex: 5,
            animation: "lockFade 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
            "@keyframes lockFade": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(201,168,118,0.18)",
              border: "1px solid rgba(201,168,118,0.5)",
              color: "#C9A876",
              boxShadow: "0 0 30px rgba(201,168,118,0.35)",
              mb: 0.5,
            }}
          >
            <Lock size={18} strokeWidth={2.4} />
          </Box>
          <Typography
            sx={{
              color: "#C9A876",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Members only beyond this point
          </Typography>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.05rem", sm: "1.25rem" },
              fontWeight: 600,
              letterSpacing: "-0.015em",
              lineHeight: 1.2,
              textAlign: "center",
              maxWidth: 460,
            }}
          >
            Unlock the full 47-minute lesson + the entire library
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.86rem",
              lineHeight: 1.5,
              textAlign: "center",
              maxWidth: 480,
              mb: 1,
            }}
          >
            42 resources, the 24/7 expert helpline, vendor savings, and 500+ practice owners — all in one founding membership at $49/mo.
          </Typography>
          <Button
            component={Link}
            href="/join"
            endIcon={<ArrowRight size={15} />}
            sx={{
              py: 1.1,
              px: 2.5,
              fontSize: "0.88rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "#C9A876",
              color: "#1A1A1A !important",
              "&:hover": { bgcolor: "#D4B07A" },
            }}
          >
            Claim founding spot
          </Button>
        </Box>
      )}

      {/* Progress bar with time stamps */}
      <Box sx={{ position: "relative", px: { xs: 2.5, md: 3.5 }, pb: 2 }}>
        <Box
          sx={{
            position: "relative",
            height: 4,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.1)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #C9A876 0%, #D4B07A 50%, #E8D5A8 100%)",
              borderRadius: 999,
              boxShadow: "0 0 6px rgba(201,168,118,0.6)",
              transition: "width 0.1s linear",
            }}
          />
          {/* Playhead dot */}
          <Box
            sx={{
              position: "absolute",
              left: `${progress}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 11,
              height: 11,
              borderRadius: "50%",
              bgcolor: "#FFFFFF",
              border: "2px solid #C9A876",
              boxShadow: "0 0 8px rgba(201,168,118,0.7)",
              transition: "left 0.1s linear",
            }}
          />
        </Box>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1.25,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Typography sx={{ color: "#C9A876", fontSize: "0.75rem", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {currentTime}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>
              / {totalTime}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", color: "rgba(255,255,255,0.55)" }}>
            <Volume2 size={14} />
            <MessageSquare size={14} />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

/**
 * Standard library thumbnail card — clean rectangle with topic icon and meta.
 * Hover lifts slightly with gold border.
 */
function ThumbnailCard({ entry, index }: { entry: LibraryEntry; index: number }) {
  const reduced = useReducedMotion();
  const { Icon } = entry;

  return (
    <MotionBox
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      sx={{
        position: "relative",
        cursor: "pointer",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid #E7E2D6",
        bgcolor: "#FFFFFF",
        transition: "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "#C9A876",
          boxShadow: "0 16px 32px -16px rgba(201,168,118,0.35)",
        },
      }}
    >
      {/* 16:9 thumbnail */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 9",
          background:
            "linear-gradient(135deg, #1F1F22 0%, #131316 100%)",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Soft gold glow */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,118,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Big topic icon */}
        <Box
          sx={{
            position: "relative",
            width: 56,
            height: 56,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(201,168,118,0.18)",
            border: "1px solid rgba(201,168,118,0.32)",
            color: "#C9A876",
          }}
        >
          <Icon size={26} strokeWidth={1.8} />
        </Box>

        {/* Track label top-left */}
        <Typography
          sx={{
            position: "absolute",
            top: 10,
            left: 12,
            color: "#C9A876",
            fontSize: "0.58rem",
            letterSpacing: "0.16em",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {entry.track}
        </Typography>

        {/* Duration badge bottom-right */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            px: 0.85,
            py: 0.25,
            borderRadius: 0.85,
            bgcolor: "rgba(0,0,0,0.7)",
            color: "#FFFFFF",
            fontSize: "0.62rem",
            fontWeight: 700,
          }}
        >
          {entry.duration}
        </Box>

        {/* Play indicator on hover */}
        <Box
          className="play-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(0,0,0,0.3)",
            opacity: 0,
            transition: "opacity 200ms ease",
            ".MuiBox-root:hover > &": { opacity: 1 },
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "#C9A876",
              color: "#1A1A1A",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Play size={16} strokeWidth={2.5} fill="#1A1A1A" />
          </Box>
        </Box>
      </Box>

      {/* Card body */}
      <Box sx={{ p: 1.75 }}>
        <Typography
          sx={{
            color: "#1A1A1A",
            fontSize: "0.88rem",
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: "-0.005em",
            mb: 0.85,
          }}
        >
          {entry.title}
        </Typography>
        <Stack direction="row" spacing={0.85} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              position: "relative",
              width: 18,
              height: 18,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Image
              src="/team/gary-takacs.jpg"
              alt={libraryPresenter.name}
              fill
              sizes="18px"
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          </Box>
          <Typography sx={{ color: "#52525B", fontSize: "0.74rem", fontWeight: 500 }}>
            {libraryPresenter.name}
          </Typography>
        </Stack>
      </Box>
    </MotionBox>
  );
}
