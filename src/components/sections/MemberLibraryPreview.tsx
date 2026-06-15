"use client";
import {
  Box,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import Image from "next/image";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SentimentSatisfiedAltRoundedIcon from "@mui/icons-material/SentimentSatisfiedAltRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { motion, useReducedMotion } from "framer-motion";
import SectionReveal from "@/components/effects/SectionReveal";
import {
  libraryPresenter,
  libraryPreviewSection,
  libraryTopics,
  portalNavItems,
} from "@/lib/content";

const MotionBox = motion.create(Box);

// Typed as SvgIconComponent so `sx` (including responsive shapes) carries the
// right SvgIconProps signature through TypeScript's strict prod build.
const NAV_ICONS: SvgIconComponent[] = [
  HeadsetMicOutlinedIcon,
  VideoLibraryOutlinedIcon,
  StorefrontOutlinedIcon,
  PeopleAltOutlinedIcon,
  LiveTvOutlinedIcon,
];

// Active nav stays fixed on the Library item — no cycling.
const ACTIVE_NAV_INDEX = 1;

// Map each topic to a still-frame icon — gives every thumbnail a real visual
// subject without resorting to multi-color treatment.
const KIND_ICON: Record<string, SvgIconComponent> = {
  kpi: BarChartRoundedIcon,
  ppo: RequestQuoteRoundedIcon,
  seo: TrendingUpRoundedIcon,
  patient: SentimentSatisfiedAltRoundedIcon,
  book: MenuBookRoundedIcon,
  huddle: Groups2RoundedIcon,
  reviews: StarRoundedIcon,
  photos: PhotoCameraRoundedIcon,
};

// Single brand color set for every thumbnail — calm, professional, on-brand.
const THUMB_BG = "#13263D";
const THUMB_BG_ALT = "#1A3550";
const THUMB_BORDER = "rgba(217,168,75,0.22)";
const THUMB_ACCENT = "#A07823";
const THUMB_TITLE = "#FFFFFF";
const THUMB_MUTED = "rgba(255,255,255,0.7)";

export default function MemberLibraryPreview() {
  const reduced = useReducedMotion();

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        py: { xs: 8, md: 11 },
        bgcolor: "#FBF8F1",
        borderTop: "1px solid",
        borderColor: "rgba(14,42,61,0.06)",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(50% 60% at 100% 0%, rgba(34,108,165,0.06) 0%, transparent 60%), radial-gradient(40% 50% at 0% 100%, rgba(217,168,75,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <SectionReveal variant="fade-up" sx={{ mb: { xs: 4, md: 5 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760, textAlign: { md: "center" }, mx: { md: "auto" } }}>
            <Typography variant="overline" sx={{ color: "#A07823", letterSpacing: "0.18em" }}>
              {libraryPreviewSection.eyebrow}
            </Typography>
            <Typography
              variant="h2"
              sx={{ color: "#0A1A2F", fontSize: { xs: "2rem", md: "2.75rem" }, lineHeight: 1.1 }}
            >
              {libraryPreviewSection.title}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#3B4A55", maxWidth: 640, mx: { md: "auto" } }}>
              {libraryPreviewSection.subtitle}
            </Typography>
          </Stack>
        </SectionReveal>

        {/* ───── COMPACT MINIMAL TOPIC STRIP ABOVE THE PORTAL ───── */}
        <SectionReveal variant="fade-up" delay={0.05} sx={{ mb: { xs: 4, md: 5 } }}>
          <Box sx={{ position: "relative" }}>
            <Typography
              sx={{
                color: "#7A5B17",
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                fontWeight: 700,
                textTransform: "uppercase",
                textAlign: "center",
                mb: 2,
              }}
            >
              A look inside the member library
            </Typography>
            <Grid container spacing={1.25} sx={{ justifyContent: "center", maxWidth: 920, mx: "auto" }}>
              {libraryTopics.slice(0, 5).map((topic, i) => (
                <Grid key={topic.title} size={{ xs: 6, sm: 4, md: "auto" }}>
                  <MotionBox
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(i * 0.06, 0.3),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={
                      reduced
                        ? undefined
                        : { y: -2, borderColor: "rgba(217,168,75,0.6)" }
                    }
                    sx={{
                      width: { md: 170 },
                      px: 1.75,
                      py: 1.5,
                      borderRadius: 1.75,
                      bgcolor: "#FFFFFF",
                      border: "1px solid rgba(14,42,61,0.1)",
                      cursor: "pointer",
                      transition: "all 280ms cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: "0 10px 20px -14px rgba(14,42,61,0.18)",
                      "&:hover": {
                        boxShadow: "0 16px 30px -14px rgba(217,168,75,0.3)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 0.75,
                          bgcolor: "rgba(217,168,75,0.14)",
                          color: "#A07823",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <PlayArrowRoundedIcon sx={{ fontSize: 14 }} />
                      </Box>
                      <Typography
                        sx={{
                          color: "#5C6770",
                          fontSize: "0.56rem",
                          letterSpacing: "0.14em",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {topic.duration}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        color: "#0A1A2F",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        lineHeight: 1.25,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {topic.title}
                    </Typography>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Box>
        </SectionReveal>

        {/* ───── PORTAL MOCK ───── */}
        <SectionReveal variant="scale-in" delay={0.15}>
          <Box
            sx={{
              position: "relative",
              borderRadius: 4,
              bgcolor: "#0F2238",
              border: "1px solid rgba(14,42,61,0.18)",
              overflow: "hidden",
              boxShadow:
                "0 60px 120px -40px rgba(14,42,61,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset",
            }}
          >
            {/* macOS-style window chrome */}
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                alignItems: "center",
                px: 2,
                py: 1.5,
                bgcolor: "rgba(255,255,255,0.05)",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Box sx={{ display: "flex", gap: 0.75 }}>
                <Box sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: "#FF5F57" }} />
                <Box sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: "#FEBC2E" }} />
                <Box sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: "#28C840" }} />
              </Box>
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.5,
                    py: 0.4,
                    borderRadius: 1,
                    bgcolor: "rgba(255,255,255,0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                  }}
                >
                  <LockOutlinedIcon sx={{ fontSize: 11 }} />
                  app.dentalmembernetwork.com / library
                </Box>
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <NotificationsNoneRoundedIcon sx={{ fontSize: 17, color: "#FFFFFF" }} />
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #F0C16E 0%, #A07823 100%)",
                    color: "#0A1A2F",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Dr
                </Box>
              </Stack>
            </Stack>

            <Grid container sx={{ minHeight: { xs: 540, md: 600 } }}>
              {/* LEFT — sidebar with PURE WHITE text */}
              <Grid
                size={{ xs: 12, md: 3 }}
                sx={{
                  bgcolor: "rgba(255,255,255,0.04)",
                  borderRight: { md: "1px solid rgba(255,255,255,0.12)" },
                  p: 2,
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ pb: 1.5, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                    <Typography
                      sx={{
                        color: "#FFFFFF",
                        fontSize: "0.66rem",
                        fontWeight: 800,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        mb: 1.5,
                        opacity: 0.95,
                      }}
                    >
                      Member Portal
                    </Typography>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #F0C16E 0%, #A07823 100%)",
                          color: "#0A1A2F",
                          display: "grid",
                          placeItems: "center",
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                        }}
                      >
                        Dr
                      </Box>
                      <Box>
                        <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.2 }}>
                          You
                        </Typography>
                        <Typography sx={{ color: "#FFFFFF", fontSize: "0.7rem", fontWeight: 500, mt: 0.25, opacity: 0.85 }}>
                          Founding member · #007
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Stack spacing={0.5}>
                    {portalNavItems.map((item, i) => {
                      const Icon = NAV_ICONS[i] ?? VideoLibraryOutlinedIcon;
                      const isActive = i === ACTIVE_NAV_INDEX;
                      return (
                        <Box
                          key={item.label}
                          sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            px: 1.25,
                            py: 1.1,
                            borderRadius: 1.25,
                            color: "#FFFFFF",
                            bgcolor: isActive ? "rgba(217,168,75,0.22)" : "transparent",
                            border: "1px solid",
                            borderColor: isActive ? "rgba(217,168,75,0.4)" : "transparent",
                          }}
                        >
                          {isActive && (
                            <Box
                              sx={{
                                position: "absolute",
                                left: -1,
                                top: 6,
                                bottom: 6,
                                width: 3,
                                borderRadius: "0 2px 2px 0",
                                background: "linear-gradient(180deg, #F0C16E, #A07823)",
                              }}
                            />
                          )}
                          <Icon
                            sx={{
                              fontSize: 17,
                              color: isActive ? "#F0C16E" : "#FFFFFF",
                              opacity: isActive ? 1 : 0.95,
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.9rem",
                              fontWeight: isActive ? 700 : 600,
                              color: "#FFFFFF",
                              opacity: isActive ? 1 : 0.95,
                              flex: 1,
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              height: 19,
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              bgcolor: isActive ? "rgba(217,168,75,0.32)" : "rgba(255,255,255,0.14)",
                              color: isActive ? "#F0C16E" : "#FFFFFF",
                              border: "1px solid",
                              borderColor: isActive ? "rgba(217,168,75,0.55)" : "rgba(255,255,255,0.22)",
                              "& .MuiChip-label": { px: 0.85 },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>

                  {/* Savings ledger card */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(217,168,75,0.16)",
                      border: "1px solid rgba(217,168,75,0.35)",
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                      <BookmarkBorderRoundedIcon sx={{ fontSize: 14, color: "#F0C16E" }} />
                      <Typography
                        sx={{
                          color: "#FFFFFF",
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          opacity: 0.95,
                        }}
                      >
                        Savings ledger
                      </Typography>
                    </Stack>
                    <Typography sx={{ color: "#FFFFFF", fontFamily: "var(--font-display)", fontSize: "1.45rem", lineHeight: 1, mt: 0.75, fontWeight: 600 }}>
                      $4,820
                    </Typography>
                    <Typography sx={{ color: "#FFFFFF", fontSize: "0.74rem", mt: 0.5, opacity: 0.88 }}>
                      via vendor network YTD
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* RIGHT — FIXED GRID of real-looking navy thumbnails */}
              <Grid size={{ xs: 12, md: 9 }} sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
                  <Box>
                    <Typography
                      sx={{
                        color: "#FFFFFF",
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        opacity: 0.85,
                      }}
                    >
                      Resources library
                    </Typography>
                    <Typography sx={{ color: "#FFFFFF", fontSize: "1.2rem", fontWeight: 700, mt: 0.25 }}>
                      Continue watching
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      px: 1.5,
                      py: 0.9,
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      minWidth: 220,
                    }}
                  >
                    <SearchOutlinedIcon sx={{ fontSize: 14, color: "#FFFFFF" }} />
                    <Typography sx={{ color: "#FFFFFF", fontSize: "0.78rem", opacity: 0.85 }}>
                      Search resources…
                    </Typography>
                  </Stack>
                </Stack>

                {/* Fixed 6-card grid — no scrolling, all navy, presenter = Gary */}
                <Grid container spacing={1.75}>
                  {libraryTopics.slice(0, 6).map((topic, i) => (
                    <Grid key={topic.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <ResourceThumbnail
                        topic={topic}
                        index={i}
                        bg={i % 2 === 0 ? THUMB_BG : THUMB_BG_ALT}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: "1px solid rgba(255,255,255,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.8rem", opacity: 0.85 }}>
                    42 resources in your library · New drops every Tuesday
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "#2E8A57",
                        boxShadow: "0 0 8px rgba(46,138,87,0.7)",
                      }}
                    />
                    <Typography sx={{ color: "#7AD49E", fontSize: "0.78rem", fontWeight: 700 }}>
                      Live
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </SectionReveal>

        <SectionReveal variant="fade-up" delay={0.3} sx={{ mt: 3.5 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#5C6770",
              fontSize: "0.86rem",
              textAlign: "center",
              maxWidth: 720,
              mx: "auto",
              fontStyle: "italic",
            }}
          >
            This preview is a static mock. The real portal updates in real time — your helpline cases,
            saved vendor deals, watch history, and savings ledger all stay in sync.
          </Typography>
        </SectionReveal>
      </Container>
    </Box>
  );
}

/**
 * Real-video-feel resource thumbnail. Each card has:
 *  - A topic-specific still-frame icon (large, low opacity) with slow Ken Burns drift
 *  - Gary's actual photo as a small "host bug" in the corner
 *  - Gold play button center
 *  - Track label + title overlaid on the frame
 *  - Duration badge bottom-right
 *  - "NOW PLAYING" gold bar that slides in on hover
 *
 * Single navy color palette across all cards for visual cohesion.
 */
function ResourceThumbnail({
  topic,
  index,
  bg,
}: {
  topic: (typeof libraryTopics)[number];
  index: number;
  bg: string;
}) {
  const reduced = useReducedMotion();
  const KindIcon = KIND_ICON[topic.kind] ?? PlayArrowRoundedIcon;

  return (
    <MotionBox
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduced ? undefined : { y: -3 }}
      sx={{
        bgcolor: "transparent",
        cursor: "pointer",
        transition: "transform 280ms ease",
      }}
    >
      {/* 16:9 thumbnail frame */}
      <Box
        className="thumb-frame"
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: 1.5,
          overflow: "hidden",
          bgcolor: bg,
          border: `1px solid ${THUMB_BORDER}`,
          transition: "border-color 280ms ease, box-shadow 280ms ease",
          "&:hover": {
            borderColor: "rgba(217,168,75,0.55)",
            boxShadow: "0 18px 32px -10px rgba(217,168,75,0.35)",
          },
          // Reveal NOW-PLAYING bar on hover
          "&:hover .now-playing": {
            transform: "translateY(0)",
            opacity: 1,
          },
          "&:hover .ken-burns": {
            transform: "scale(1.12) translate(-2%, 1%)",
          },
        }}
      >
        {/* Ken Burns layer — the topic-specific icon as a still-frame graphic.
            Slow constant drift + scale, plus an extra push on hover. */}
        <Box
          className="ken-burns"
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,0.16)",
            transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
            animation: reduced
              ? "none"
              : `kenBurns${index} 14s ease-in-out infinite alternate`,
            [`@keyframes kenBurns${index}`]: {
              "0%": { transform: `scale(1) translate(0%, 0%)` },
              "100%": {
                transform: `scale(1.08) translate(${index % 2 === 0 ? "-3%" : "3%"}, ${index % 3 === 0 ? "2%" : "-2%"})`,
              },
            },
          }}
        >
          <KindIcon sx={{ fontSize: { xs: 110, md: 150 } }} />
        </Box>

        {/* Subtle radial vignette so the icon recedes behind the title */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 30% 100%, rgba(0,0,0,0.45) 0%, transparent 65%), linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Subtle top sheen */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "45%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Gold accent stripe on top edge — DMN brand thread */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: "8%",
            right: "8%",
            height: 1.5,
            background:
              "linear-gradient(90deg, transparent, rgba(217,168,75,0.6), transparent)",
          }}
        />

        {/* NOW PLAYING bar — slides in from top on hover */}
        <Box
          className="now-playing"
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.6,
            bgcolor: "rgba(217,168,75,0.92)",
            color: "#0A1A2F",
            fontSize: "0.6rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            transform: "translateY(-100%)",
            opacity: 0,
            transition: "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease",
            zIndex: 3,
          }}
        >
          <FiberManualRecordIcon sx={{ fontSize: 8, color: "#8C1D1D" }} />
          Now playing
        </Box>

        {/* Body content — track label top-left, title bottom-left */}
        <Box
          sx={{
            position: "absolute",
            inset: 12,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            zIndex: 2,
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.92)",
              fontSize: "0.58rem",
              letterSpacing: "0.16em",
              fontWeight: 800,
              textTransform: "uppercase",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            {topic.track}
          </Typography>

          <Typography
            sx={{
              color: THUMB_TITLE,
              fontSize: { xs: "0.92rem", md: "1rem" },
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.005em",
              maxWidth: "78%",
              textShadow: "0 1px 8px rgba(0,0,0,0.55)",
            }}
          >
            {topic.title}
          </Typography>
        </Box>

        {/* Center play button — gold ring */}
        <Box
          className="play-btn"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: "rgba(217,168,75,0.22)",
            border: "1.5px solid rgba(217,168,75,0.65)",
            display: "grid",
            placeItems: "center",
            backdropFilter: "blur(4px)",
            transition: "transform 240ms ease, background 240ms ease, border-color 240ms ease",
            zIndex: 2,
            ".thumb-frame:hover &": {
              transform: "translate(-50%, -50%) scale(1.08)",
              bgcolor: "rgba(217,168,75,0.4)",
              borderColor: "#F0C16E",
            },
          }}
        >
          <PlayArrowRoundedIcon sx={{ fontSize: 24, color: "#F0C16E", ml: 0.25 }} />
        </Box>

        {/* Host bug — Gary's actual photo in a small circular frame, bottom-right area */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 50,
            width: 32,
            height: 32,
            borderRadius: "50%",
            overflow: "hidden",
            border: "1.5px solid rgba(217,168,75,0.6)",
            boxShadow: "0 4px 10px -2px rgba(0,0,0,0.6)",
            bgcolor: "#0A1A2F",
            zIndex: 2,
          }}
        >
          <Image
            src="/team/gary-takacs.jpg"
            alt="Gary Takacs"
            fill
            sizes="32px"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        </Box>

        {/* Duration badge bottom-right */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            px: 0.85,
            py: 0.25,
            borderRadius: 0.75,
            bgcolor: "rgba(0,0,0,0.78)",
            color: "#FFFFFF",
            fontSize: "0.64rem",
            fontWeight: 700,
            letterSpacing: "0.02em",
            zIndex: 2,
          }}
        >
          {topic.duration}
        </Box>
      </Box>

      {/* Presenter strip below the thumbnail */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", px: 0.5, pt: 1.25 }}>
        <Box
          sx={{
            position: "relative",
            width: 24,
            height: 24,
            borderRadius: "50%",
            overflow: "hidden",
            border: "1px solid rgba(217,168,75,0.45)",
            flexShrink: 0,
            bgcolor: "#0A1A2F",
          }}
        >
          <Image
            src="/team/gary-takacs.jpg"
            alt="Gary Takacs"
            fill
            sizes="24px"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontSize: "0.78rem",
              fontWeight: 600,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {libraryPresenter.name}
          </Typography>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontSize: "0.66rem",
              opacity: 0.75,
              mt: 0.25,
            }}
          >
            Host, Thriving Dentist
          </Typography>
        </Box>
      </Stack>
    </MotionBox>
  );
}
