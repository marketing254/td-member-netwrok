"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import { chapterSeconds, coverSrc, type ChairsideEpisode } from "@/lib/chairside";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const GOLD = "#A07823";
const GOLD_BRIGHT = "#D9A84B";
const LINE = "#E6DDCF";
const CREAM = "#F6F1E7";

const eyebrow = {
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: GOLD,
};

/** YouTube watch/short URL to an embed URL, optionally starting at a second. */
function youtubeEmbed(url: string, startAt = 0): string {
  try {
    const u = new URL(url);
    const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").pop() ?? "";
    // enablejsapi lets the chapter list seek the running player via postMessage.
    return `https://www.youtube.com/embed/${id}?rel=0&autoplay=1&enablejsapi=1${startAt > 0 ? `&start=${startAt}` : ""}`;
  } catch {
    return url;
  }
}

/**
 * Public episode page, design option A ("Classic", light). Cover with a
 * play button that swaps in the YouTube player; listen pills only for the
 * links that exist; about, pull quote, chapters, guest card; right column
 * sells the full hour in the member library.
 */
export default function EpisodeView({ episode }: { episode: ChairsideEpisode }) {
  const [playing, setPlaying] = useState(false);
  // Chapter clicks: once the player is up, seek it in place through the
  // YouTube IFrame messaging API (no reload); the first click starts the
  // player at that second.
  const [startAt, setStartAt] = useState(0);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const canPlay = !!episode.publicVideo.youtubeUrl;
  const jumpTo = (time: string) => {
    if (!canPlay) return;
    const seconds = chapterSeconds(time);
    const win = iframeRef.current?.contentWindow;
    if (playing && win) {
      const send = (func: string, args: unknown[] = []) =>
        win.postMessage(JSON.stringify({ event: "command", func, args }), "https://www.youtube.com");
      send("seekTo", [seconds, true]);
      send("playVideo");
    } else {
      setStartAt(seconds);
      setPlaying(true);
    }
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const cover = coverSrc(episode);
  const listen = [
    { label: "Spotify", href: episode.listen.spotify, dot: "#1DB954" },
    { label: "Apple Podcasts", href: episode.listen.apple, dot: "#B150E2" },
    { label: "YouTube", href: episode.listen.youtube, dot: "#FF0000" },
  ].filter((l): l is { label: string; href: string; dot: string } => !!l.href);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FBF8F1", display: "flex", flexDirection: "column" }}>
      <Header />

      <Container maxWidth="lg" sx={{ flex: 1 }}>
        {/* Breadcrumb pill, same as the blog */}
        <Box sx={{ maxWidth: 1040, mx: "auto", pt: { xs: 2.5, md: 3.5 } }}>
          <Stack
            component="nav"
            aria-label="Breadcrumb"
            direction="row"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              maxWidth: "100%",
              bgcolor: "#FFFFFF",
              border: "1px solid rgba(14,42,61,0.08)",
              borderRadius: 999,
              px: 1,
              py: 0.5,
              boxShadow: "0 4px 20px -8px rgba(14,42,61,0.08)",
            }}
          >
            <Box component={Link} href="/" sx={crumbSx}>
              <HomeRoundedIcon sx={{ fontSize: 14, color: GOLD }} />
              Home
            </Box>
            <ChevronRightRoundedIcon sx={{ fontSize: 15, color: INK_MUTED, opacity: 0.6, flexShrink: 0 }} />
            <Box component={Link} href="/chairside" sx={crumbSx}>
              Chairside
            </Box>
            <ChevronRightRoundedIcon sx={{ fontSize: 15, color: INK_MUTED, opacity: 0.6, flexShrink: 0 }} />
            <Typography aria-current="page" sx={{ px: 1.25, py: 0.5, fontSize: "0.76rem", fontWeight: 700, color: GOLD, maxWidth: { xs: 170, sm: 380 }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Episode {episode.number}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ maxWidth: 1040, mx: "auto", pt: { xs: 3, md: 4.5 }, pb: { xs: 6, md: 8 } }}>
          {/* Title block */}
          <Typography sx={{ ...eyebrow, mb: 1.25 }}>Chairside · Episode {episode.number}</Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              fontWeight: 600,
              color: INK,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              mb: 1.25,
            }}
          >
            {episode.title}
          </Typography>
          <Typography sx={{ fontSize: "1rem", color: INK_SOFT, mb: { xs: 3, md: 4 } }}>
            with {episode.guest.name} · {episode.guest.role}, {episode.guest.location} · {episode.host}
          </Typography>

          {/* Cover / player */}
          <Box
            ref={playerRef}
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: { xs: "14px", md: "18px" },
              overflow: "hidden",
              bgcolor: INK,
              boxShadow: "0 32px 64px -28px rgba(10,26,47,0.45)",
            }}
          >
            {playing && canPlay ? (
              <Box
                component="iframe"
                ref={iframeRef}
                src={youtubeEmbed(episode.publicVideo.youtubeUrl!, startAt)}
                title={`${episode.title}, Chairside episode ${episode.number}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              />
            ) : (
              <>
                <Image src={cover.src} alt={episode.cover.alt} fill priority unoptimized={cover.external} sizes="(max-width: 1100px) 100vw, 1040px" style={{ objectFit: "cover" }} />
                {canPlay && (
                  <>
                    <Box sx={{ position: "absolute", left: 16, top: 14, px: 1.1, py: 0.4, borderRadius: "999px", bgcolor: "rgba(6,16,30,0.72)", color: "#fff", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                      {episode.publicVideo.minutes} min · YouTube
                    </Box>
                    <Box
                      component="button"
                      type="button"
                      aria-label={`Play ${episode.title}, ${episode.publicVideo.minutes} minutes`}
                      onClick={() => setPlaying(true)}
                      sx={{
                        all: "unset",
                        cursor: "pointer",
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:focus-visible": { outline: `3px solid ${GOLD_BRIGHT}`, outlineOffset: -3 },
                        "&:hover .play": { transform: "scale(1.06)" },
                      }}
                    >
                      <Box className="play" sx={{ width: { xs: 64, md: 84 }, height: { xs: 64, md: 84 }, borderRadius: "50%", bgcolor: "rgba(217,168,75,0.95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.35)", transition: "transform 200ms ease" }}>
                        <Box sx={{ width: 0, height: 0, borderLeft: { xs: "20px solid #0A1A2F", md: "26px solid #0A1A2F" }, borderTop: { xs: "12px solid transparent", md: "15px solid transparent" }, borderBottom: { xs: "12px solid transparent", md: "15px solid transparent" }, ml: 0.75 }} />
                      </Box>
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>

          {/* Listen pills: only the links that exist */}
          {listen.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", rowGap: 1 }}>
              {listen.map((l) => (
                <Box
                  key={l.label}
                  component="a"
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.75,
                    py: 0.8,
                    borderRadius: 999,
                    bgcolor: "#FFFFFF",
                    border: `1px solid ${LINE}`,
                    color: INK,
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    "&:hover": { borderColor: GOLD_BRIGHT },
                  }}
                >
                  <Box component="span" sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: l.dot }} />
                  {l.label}
                </Box>
              ))}
            </Stack>
          )}

          {/* Two columns */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" }, gap: { xs: 4, md: 5 }, alignItems: "start", mt: { xs: 4, md: 5 } }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ ...eyebrow, color: INK_MUTED, mb: 1.25 }}>About this episode</Typography>
              <Typography sx={{ fontSize: "1.02rem", color: INK_SOFT, lineHeight: 1.75, mb: 4 }}>{episode.description}</Typography>

              <Typography
                component="blockquote"
                sx={{
                  m: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "1.45rem", md: "1.75rem" },
                  fontWeight: 600,
                  color: INK,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                &ldquo;{episode.pullQuote.text}&rdquo;
              </Typography>
              <Typography sx={{ ...eyebrow, fontSize: "0.72rem", mt: 1.5, mb: 4.5 }}>{episode.pullQuote.cite}</Typography>

              <Typography sx={{ ...eyebrow, color: INK_MUTED, mb: 1.5 }}>In this episode</Typography>
              <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, mb: 4.5 }}>
                {episode.chapters.map((c) => {
                  const row = (
                    <>
                      <Typography component="span" sx={{ fontSize: "0.92rem", fontWeight: 700, color: GOLD, minWidth: 48, fontVariantNumeric: "tabular-nums" }}>{c.time}</Typography>
                      <Typography component="span" sx={{ fontSize: "0.98rem", color: INK_SOFT }}>{c.label}</Typography>
                    </>
                  );
                  return (
                    <Box key={`${c.time}-${c.label}`} component="li" sx={{ borderBottom: `1px solid ${LINE}` }}>
                      {canPlay ? (
                        <Box component="button" type="button" onClick={() => jumpTo(c.time)} aria-label={`Play from ${c.time}, ${c.label}`} sx={{ all: "unset", cursor: "pointer", width: "100%", boxSizing: "border-box", display: "flex", gap: 2, py: 1.25, "&:hover span:last-of-type": { color: INK }, "&:focus-visible": { outline: `2px solid ${GOLD_BRIGHT}`, outlineOffset: 2 } }}>
                          {row}
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", gap: 2, py: 1.25 }}>{row}</Box>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* About the guest */}
              <Box sx={{ display: "flex", gap: 2.5, p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: "#FFFFFF", border: `1px solid ${LINE}`, alignItems: "flex-start" }}>
                <Box sx={{ position: "relative", width: { xs: 64, md: 84 }, height: { xs: 64, md: 84 }, borderRadius: "50%", overflow: "hidden", border: `2px solid ${GOLD_BRIGHT}`, flexShrink: 0 }}>
                  <Image src={episode.guest.headshotUrl} alt={episode.guest.name} fill sizes="84px" style={{ objectFit: "cover", objectPosition: "center top" }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...eyebrow, mb: 0.75 }}>About the guest</Typography>
                  <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, color: INK, mb: 0.75 }}>{episode.guest.name}</Typography>
                  <Typography sx={{ fontSize: "0.95rem", color: INK_SOFT, lineHeight: 1.65, mb: 1.5 }}>{episode.guest.bio}</Typography>
                  <Stack direction="row" spacing={2.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
                    {episode.guest.expertProfileHref && (
                      <Box component={Link} href={episode.guest.expertProfileHref} sx={guestLinkSx}>His DMN expert page →</Box>
                    )}
                    {episode.guest.website && (
                      <Box component="a" href={episode.guest.website} target="_blank" rel="noopener noreferrer" sx={guestLinkSx}>
                        {episode.guest.website.replace(/^https?:\/\//, "")} →
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Box>
            </Box>

            {/* Right column */}
            <Stack spacing={2}>
              <Box sx={{ p: { xs: 3, md: 3.5 }, borderRadius: 4, background: "linear-gradient(160deg, #12325A 0%, #0A1A2F 85%)", color: CREAM }}>
                <Typography sx={{ ...eyebrow, color: GOLD_BRIGHT, mb: 1.25 }}>The full hour is in the member library</Typography>
                <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.35rem", md: "1.5rem" }, fontWeight: 600, color: CREAM, lineHeight: 1.25, mb: 2 }}>
                  Members get the whole episode, and the page to run on Monday
                </Typography>
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mb: 3 }}>
                  {episode.memberLibrary.bullets.map((b) => (
                    <Box key={b} component="li" sx={{ display: "flex", gap: 1.25, mb: 1.25 }}>
                      <Box sx={{ mt: "7px", width: 10, height: 10, borderRadius: "50%", border: `2px solid ${GOLD_BRIGHT}`, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "0.92rem", color: "rgba(246,241,231,0.88)", lineHeight: 1.55 }}>{b}</Typography>
                    </Box>
                  ))}
                </Box>
                <Button
                  component={Link}
                  href="/join/member"
                  disableElevation
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    "&&": { bgcolor: GOLD_BRIGHT, color: INK, fontWeight: 800, fontSize: "0.92rem", textTransform: "none", px: 2.75, py: 1.2, borderRadius: 999 },
                    "&&:hover": { bgcolor: "#E4B95F", color: INK },
                  }}
                >
                  Join the Dental Member Network
                </Button>
              </Box>

              {episode.relatedArticle && (
                <Box component={Link} href={episode.relatedArticle.href} sx={{ display: "block", p: { xs: 2.5, md: 3 }, borderRadius: 4, bgcolor: "#FFFFFF", border: `1px solid ${LINE}`, textDecoration: "none", "&:hover": { borderColor: GOLD_BRIGHT } }}>
                  <Typography sx={{ ...eyebrow, mb: 1 }}>Read the article · {episode.relatedArticle.category}</Typography>
                  <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, color: INK, lineHeight: 1.3 }}>{episode.relatedArticle.title}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}

const crumbSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.6,
  px: 1.25,
  py: 0.5,
  borderRadius: 999,
  fontSize: "0.76rem",
  fontWeight: 600,
  color: INK_SOFT,
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "color 180ms ease, background-color 180ms ease",
  "&:hover": { color: INK, bgcolor: "rgba(217,168,75,0.10)" },
} as const;

const guestLinkSx = {
  fontSize: "0.88rem",
  fontWeight: 700,
  color: GOLD,
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
} as const;
