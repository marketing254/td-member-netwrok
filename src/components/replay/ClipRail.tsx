"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Dialog, IconButton, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import type { ReplayClip } from "@/lib/events/ridaReplay";
import { fmtTime, ridaClipSrc } from "@/lib/events/ridaReplay";

/**
 * The sixty-second moments. A card opens the clip in a large pop-up
 * player; from there one button jumps to that moment in the full replay.
 * The small caption link under each card does the same jump directly.
 */
export default function ClipRail({
  clips,
  onOpenInReplay,
  tone = "light",
  onPlay,
}: {
  clips: ReplayClip[];
  onOpenInReplay: (clip: ReplayClip) => void;
  tone?: "light" | "dark";
  onPlay?: (clip: ReplayClip) => void;
}) {
  const [open, setOpen] = useState<ReplayClip | null>(null);
  const dark = tone === "dark";

  const openClip = (clip: ReplayClip) => {
    setOpen(clip);
    onPlay?.(clip);
  };

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {clips.map((clip) => (
          <Stack
            key={clip.n}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: dark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
              border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : "#E6DDCF"}`,
              transition: "transform 160ms ease, box-shadow 160ms ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 14px 30px rgba(10,26,47,0.14)" },
            }}
          >
            <Box
              onClick={() => openClip(clip)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openClip(clip);
              }}
              aria-label={`Play clip: ${clip.speaker}, ${clip.title}`}
              sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: "#06182A", cursor: "pointer", backgroundImage: `url(${clip.poster})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,24,42,0) 40%, rgba(6,24,42,0.75) 100%)" }} />
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.92)",
                  display: "grid",
                  placeItems: "center",
                  color: "#0A1A2F",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}
              >
                <PlayArrowRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ position: "absolute", left: 10, bottom: 8, color: "#FFFFFF", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                {clip.seconds}s
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, pt: 1.25 }}>
              <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A07823" }}>
                {clip.speaker}
              </Typography>
              <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, lineHeight: 1.35, color: dark ? "#FFFFFF" : "#0A1A2F", mt: 0.4 }}>
                {clip.title}
              </Typography>
              <Typography
                component="button"
                type="button"
                onClick={() => onOpenInReplay(clip)}
                sx={{
                  mt: 0.9,
                  p: 0,
                  border: 0,
                  bgcolor: "transparent",
                  cursor: "pointer",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  color: dark ? "#F0C16E" : "#0E2A3D",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(217,168,75,0.6)",
                  textUnderlineOffset: 3,
                  fontFamily: "inherit",
                }}
              >
                Chapter {clip.chapter} · {fmtTime(clip.at)} in the replay
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>

      <ClipDialog
        clip={open}
        onClose={() => setOpen(null)}
        onOpenInReplay={(clip) => {
          setOpen(null);
          onOpenInReplay(clip);
        }}
      />
    </>
  );
}

function ClipDialog({ clip, onClose, onOpenInReplay }: { clip: ReplayClip | null; onClose: () => void; onOpenInReplay: (clip: ReplayClip) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Autoplay once the dialog has mounted the video element.
  useEffect(() => {
    if (!clip) return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => undefined);
  }, [clip]);

  return (
    <Dialog
      open={!!clip}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: "#06182A", color: "#fff", borderRadius: { xs: 2, sm: 3 }, overflow: "hidden", m: { xs: 1.5, sm: 3 } } } }}
    >
      {clip && (
        <Box>
          <Box sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: "#000" }}>
            <video
              key={clip.n}
              ref={videoRef}
              src={ridaClipSrc(clip.n)}
              poster={clip.poster}
              controls
              playsInline
              preload="auto"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", background: "#000" }}
            />
            <IconButton
              onClick={onClose}
              aria-label="Close"
              sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(0,0,0,0.55)", color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.75)" } }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ p: { xs: 2, sm: 2.5 }, alignItems: { sm: "center" }, justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0C16E" }}>
                {clip.speaker} · {clip.seconds} seconds
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-display), 'Fraunces', Georgia, serif", fontWeight: 600, fontSize: { xs: "1.05rem", sm: "1.25rem" }, lineHeight: 1.25, mt: 0.4, color: "#fff" }}>
                {clip.title}
              </Typography>
            </Box>
            <Button
              onClick={() => onOpenInReplay(clip)}
              variant="contained"
              disableElevation
              endIcon={<ArrowOutwardRoundedIcon />}
              sx={{ flexShrink: 0, bgcolor: "#D9A84B", color: "#0A1A2F !important", fontWeight: 800, borderRadius: 999, px: 2.5, textTransform: "none", whiteSpace: "nowrap", "&:hover": { bgcolor: "#F0C16E" } }}
            >
              Watch from {fmtTime(clip.at)} in the replay
            </Button>
          </Stack>
        </Box>
      )}
    </Dialog>
  );
}
