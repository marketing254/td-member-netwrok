"use client";
import Link from "next/link";
import Image from "next/image";
import { Box, Container, Stack, Typography } from "@mui/material";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import { CHAIRSIDE_SHOW, CHAIRSIDE_SHOW_COVER, CHAIRSIDE_STANDFIRST, CHAIRSIDE_TAGLINE, coverSrc, youtubeId, type ChairsideEpisode } from "@/lib/chairside";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const GOLD = "#A07823";
const GOLD_BRIGHT = "#D9A84B";
const LINE = "#E6DDCF";

/** The show home: one card per published episode, newest first. */
export default function ChairsideHomeView({ episodes }: { episodes: ChairsideEpisode[] }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FBF8F1", display: "flex", flexDirection: "column" }}>
        <Header />
        <Container maxWidth="lg" sx={{ flex: 1 }}>
          <Box sx={{ maxWidth: 1040, mx: "auto", pt: { xs: 5, md: 8 }, pb: { xs: 6, md: 9 } }}>
            {/* Show cover beside the title on wide screens */}
            <Box sx={{ float: { md: "right" }, width: { xs: 140, md: 220 }, ml: { md: 4 }, mb: 2, borderRadius: 4, overflow: "hidden", boxShadow: "0 24px 48px -24px rgba(10,26,47,0.45)" }}>
              <Image src={CHAIRSIDE_SHOW_COVER} alt="Chairside, the podcast from the Dental Member Network" width={220} height={220} style={{ width: "100%", height: "auto", display: "block" }} />
            </Box>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, mb: 1.5 }}>
              {CHAIRSIDE_TAGLINE}
            </Typography>
            <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "2.2rem", md: "3.2rem" }, fontWeight: 600, color: INK, lineHeight: 1.08, letterSpacing: "-0.02em", mb: 2 }}>
              Chairside
            </Typography>
            <Typography sx={{ fontSize: { xs: "1.02rem", md: "1.12rem" }, color: INK_SOFT, lineHeight: 1.7, maxWidth: 720, mb: 3 }}>
              {CHAIRSIDE_STANDFIRST}
            </Typography>

            {/* Follow the show: only the links that exist */}
            <Stack direction="row" spacing={1.25} sx={{ flexWrap: "wrap", rowGap: 1.25, mb: { xs: 4, md: 5 } }}>
              {[
                { label: "Spotify", href: CHAIRSIDE_SHOW.spotify, dot: "#1DB954" },
                { label: "Apple Podcasts", href: CHAIRSIDE_SHOW.apple, dot: "#B150E2" },
              ]
                .filter((l) => !!l.href)
                .map((l) => (
                  <Box key={l.label} component="a" href={l.href} target="_blank" rel="noopener" sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.9, borderRadius: 999, bgcolor: "#FFFFFF", border: `1px solid ${LINE}`, color: INK, fontWeight: 700, fontSize: "0.86rem", textDecoration: "none", "&:hover": { borderColor: GOLD_BRIGHT } }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: l.dot }} />
                    {l.label}
                  </Box>
                ))}
            </Stack>

            {/* Trailer */}
            {youtubeId(CHAIRSIDE_SHOW.trailerYoutubeUrl) && (
              <Box sx={{ mb: { xs: 5, md: 7 } }}>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, mb: 1.5 }}>The trailer</Typography>
                <Box sx={{ position: "relative", aspectRatio: "16 / 9", maxWidth: 760, borderRadius: 4, overflow: "hidden", bgcolor: INK, boxShadow: "0 24px 48px -24px rgba(10,26,47,0.35)" }}>
                  <Box component="iframe" src={`https://www.youtube.com/embed/${youtubeId(CHAIRSIDE_SHOW.trailerYoutubeUrl)}?rel=0`} title="Chairside trailer" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                </Box>
              </Box>
            )}

            <Box sx={{ clear: "both" }} />
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, mb: 2 }}>Episodes</Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 2.5, md: 3 } }}>
              {episodes.map((ep) => (
                <Box
                  key={ep.slug}
                  component={Link}
                  href={`/chairside/${ep.slug}`}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    borderRadius: 4,
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                    border: `1px solid ${LINE}`,
                    transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
                    "&:hover": { transform: "translateY(-3px)", boxShadow: "0 24px 48px -24px rgba(10,26,47,0.35)", borderColor: GOLD_BRIGHT },
                  }}
                >
                  <Box sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: INK }}>
                    <Image src={coverSrc(ep).src} alt={ep.cover.alt} fill unoptimized={coverSrc(ep).external} sizes="(max-width: 600px) 100vw, 340px" style={{ objectFit: "cover" }} />
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, mb: 0.75 }}>
                      Episode {ep.number} · {ep.publicVideo.minutes} min
                    </Typography>
                    <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, color: INK, lineHeight: 1.25, mb: 0.75 }}>
                      {ep.title}
                    </Typography>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                      <Box sx={{ position: "relative", width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: `2px solid rgba(217,168,75,0.55)`, flexShrink: 0 }}>
                        <Image src={ep.guest.headshotUrl} alt={ep.guest.name} fill sizes="32px" style={{ objectFit: "cover", objectPosition: "center top" }} />
                      </Box>
                      <Typography sx={{ fontSize: "0.86rem", color: INK_SOFT, lineHeight: 1.3 }}>
                        {ep.guest.name} · {ep.guest.role}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
        <Footer />
      </Box>
  );
}
