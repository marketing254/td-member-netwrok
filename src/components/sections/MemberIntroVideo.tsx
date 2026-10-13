"use client";
import { useState } from "react";
import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";
import { MEMBER_VIDEO } from "@/lib/memberVideo";

/**
 * "One Place for Dental Offices", the three-minute member introduction.
 * Plays on the page, never sends the visitor to YouTube: the thumbnail is
 * the cover, one click swaps in the YouTube player with autoplay.
 *
 * variant "section": heading + player, used near the top of the home page.
 * variant "inline":  player only, used above the sign-up button on /join/member.
 */
export default function MemberIntroVideo({ variant = "section" }: { variant?: "section" | "inline" }) {
  const [playing, setPlaying] = useState(false);

  const player = (
    <Box
      sx={{
        position: "relative",
        borderRadius: variant === "inline" ? "14px" : { xs: 0, sm: "16px" },
        overflow: "hidden",
        aspectRatio: "16 / 9",
        bgcolor: "#0A1A2F",
        boxShadow: variant === "inline" ? "0 12px 32px -14px rgba(14,42,61,0.4)" : "0 24px 60px -18px rgba(14,42,61,0.45)",
        mx: variant === "inline" ? 0 : { xs: -2, sm: 0 },
      }}
    >
      {playing ? (
        <Box
          component="iframe"
          src={`${MEMBER_VIDEO.embedUrl}&autoplay=1`}
          title={MEMBER_VIDEO.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <Box
          component="button"
          type="button"
          aria-label={`Play ${MEMBER_VIDEO.title}, ${MEMBER_VIDEO.minutes} minutes`}
          onClick={() => setPlaying(true)}
          sx={{
            all: "unset",
            cursor: "pointer",
            position: "absolute",
            inset: 0,
            display: "block",
            "&:focus-visible": { outline: "3px solid #D9A84B", outlineOffset: -3 },
            "&:hover .intro-play": { transform: "scale(1.06)" },
          }}
        >
          <Image src={MEMBER_VIDEO.thumbnailPath} alt={`${MEMBER_VIDEO.title} video cover`} fill priority={variant === "section"} sizes="(max-width: 900px) 100vw, 900px" style={{ objectFit: "cover" }} />
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, transparent 55%, rgba(6,16,30,0.45) 100%)" }}>
            <Box
              className="intro-play"
              sx={{ width: { xs: 64, md: 88 }, height: { xs: 64, md: 88 }, borderRadius: "50%", bgcolor: "rgba(217,168,75,0.95)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.35)", transition: "transform 200ms ease" }}
            >
              <Box sx={{ width: 0, height: 0, borderLeft: { xs: "20px solid #0A1A2F", md: "28px solid #0A1A2F" }, borderTop: { xs: "12px solid transparent", md: "17px solid transparent" }, borderBottom: { xs: "12px solid transparent", md: "17px solid transparent" }, ml: 1 }} />
            </Box>
          </Box>
          <Box sx={{ position: "absolute", left: 14, bottom: 12, px: 1.1, py: 0.4, borderRadius: "999px", bgcolor: "rgba(6,16,30,0.7)", color: "#fff", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            {MEMBER_VIDEO.minutes} min
          </Box>
        </Box>
      )}
    </Box>
  );

  if (variant === "inline") return player;

  return (
    <Box id="tour" component="section" sx={{ bgcolor: "#FFFFFF", py: { xs: 5, md: 7 } }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography sx={{ color: "#A07823", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>Three minutes, in plain words</Typography>
        <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.7rem", md: "2.25rem" }, color: "#0A1A2F", fontWeight: 500, letterSpacing: "-0.02em", my: 0.75 }}>
          {MEMBER_VIDEO.title}
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "1rem", lineHeight: 1.6, mb: 3.5 }}>What the Dental Member Network is, and what members get.</Typography>
        {player}
      </Container>
    </Box>
  );
}
