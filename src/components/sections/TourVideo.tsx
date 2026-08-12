"use client";
import { useState } from "react";
import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";

const VIDEO_URL =
  "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/site/tour-video.mp4";
const POSTER_URL =
  "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/site/tour-poster.jpg";

/**
 * "See inside the member area." — the 2-minute portal tour.
 *
 * Click-to-play ONLY, on every viewport: the video element isn't even
 * mounted until the poster is clicked, so nothing preloads and nothing
 * can autoplay. The file is a placeholder cut — Lester supplies a
 * story-led replacement of the same length later; same player, same
 * slot, just swap VIDEO_URL.
 */
export default function TourVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <Box id="tour" component="section" sx={{ bgcolor: "#FFFFFF", py: { xs: 6, md: 8 } }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            color: "#A07823",
            fontSize: "0.78rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Two minutes, narrated
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.7rem", md: "2.25rem" },
            color: "#0A1A2F",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            my: 0.75,
          }}
        >
          See inside the member area.
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "1rem", lineHeight: 1.6, mb: 3.5 }}>
          The library, the helpline, the partner offers and the experts, exactly
          as a member sees them.
        </Typography>

        <Box
          sx={{
            position: "relative",
            borderRadius: { xs: 0, sm: 3 },
            overflow: "hidden",
            aspectRatio: "16 / 9",
            bgcolor: "#0A1A2F",
            boxShadow: "0 24px 60px -18px rgba(14,42,61,0.45)",
            // Full-bleed on phones — the container padding is cancelled so
            // the player uses the whole width.
            mx: { xs: -2, sm: 0 },
          }}
        >
          {playing ? (
            <Box
              component="video"
              src={VIDEO_URL}
              poster={POSTER_URL}
              controls
              autoPlay
              playsInline
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            />
          ) : (
            <Box
              component="button"
              type="button"
              aria-label="Play the 2-minute member portal tour"
              onClick={() => setPlaying(true)}
              sx={{
                all: "unset",
                cursor: "pointer",
                position: "absolute",
                inset: 0,
                display: "block",
                "&:focus-visible": { outline: "3px solid #D9A84B", outlineOffset: -3 },
                "&:hover .tour-play": { transform: "scale(1.06)" },
              }}
            >
              <Image
                src={POSTER_URL}
                alt="Preview frame of the member portal tour"
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                style={{ objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(180deg, transparent 55%, rgba(6,16,30,0.45) 100%)",
                }}
              >
                <Box
                  className="tour-play"
                  sx={{
                    width: { xs: 68, md: 92 },
                    height: { xs: 68, md: 92 },
                    borderRadius: "50%",
                    bgcolor: "rgba(217,168,75,0.95)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    transition: "transform 200ms ease",
                  }}
                >
                  <Box
                    sx={{
                      width: 0,
                      height: 0,
                      borderLeft: { xs: "22px solid #0A1A2F", md: "30px solid #0A1A2F" },
                      borderTop: { xs: "13px solid transparent", md: "18px solid transparent" },
                      borderBottom: { xs: "13px solid transparent", md: "18px solid transparent" },
                      ml: 1,
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
