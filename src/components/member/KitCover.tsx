"use client";

import { Box, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { visualForTopic } from "@/components/member/topicVisuals";

/**
 * KitCover — thumbnail for a resource kit.
 *
 * Two modes:
 *
 * 1. coverUrl present (real cover image with title baked in):
 *    - Image fills the card. No title overlay, no stripe pattern, no light wash,
 *      no bottom text. Just the photo + functional UI.
 *    - Top-left: status badges (small, clear of any image content)
 *    - Bottom-right: small play button when the kit has video
 *    - Bottom: progress bar when viewed
 *
 * 2. coverUrl absent (painted gradient fallback):
 *    - Magazine-style composition with diagonal stripes, the title set in
 *      display font, count line, centered play button.
 *
 * Sizes: pass `size="md"` (default) or `size="sm"` for sidebar mini-tiles.
 */
export function KitCover({
  slug,
  title,
  videoCount,
  resourceCount,
  isFree,
  completed,
  inProgress,
  progressPct = 0,
  size = "md",
  coverUrl,
}: {
  slug: string;
  title: string;
  videoCount: number;
  resourceCount: number;
  isFree?: boolean;
  completed?: boolean;
  inProgress?: boolean;
  progressPct?: number;
  size?: "sm" | "md";
  /**
   * Optional URL to a real cover image (from Supabase Storage / kit-thumbnails).
   * When provided, the cover is treated as authoritative — we don't paint our
   * own title or text on top of it.
   */
  coverUrl?: string | null;
}) {
  const visual = visualForTopic(slug);
  const Icon = visual.icon;
  const hasVideo = videoCount > 0;
  const showProgress = progressPct > 0;
  const hasCover = !!coverUrl;

  // Typography for the painted-gradient fallback
  const titleFontSize = size === "sm"
    ? { xs: "0.92rem" }
    : { xs: "1.05rem", md: "1.2rem" };

  return (
    <Box
      sx={{
        position: "relative",
        // Real cover images are 16:9 (1280x720). Match that exactly so the
        // images render edge-to-edge with zero cropping. The painted fallback
        // also works fine at 16:9.
        aspectRatio: "16 / 9",
        backgroundImage: hasCover ? `url("${coverUrl}")` : visual.gradient,
        backgroundSize: "cover",
        backgroundPosition: "center",
        bgcolor: "var(--ink, #0A1A2F)",
        overflow: "hidden",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        color: "#FFFFFF",
        isolation: "isolate",
      }}
    >
      {/* Decorative overlays — only on painted fallback. With a real cover
          image we let the artwork speak for itself. */}
      {!hasCover && (
        <>
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.08,
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 14px)",
              pointerEvents: "none",
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 35%, rgba(0,0,0,0.18) 100%)",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {/* Status badges — always at top-left, kept small so they don't crowd
          a baked-in image title. */}
      {(isFree || completed || inProgress) && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}
        >
          {isFree && <CoverBadge label="Free" tone="leaf" />}
          {completed && <CoverBadge label="Done" tone="paper" />}
          {inProgress && !completed && <CoverBadge label="In progress" tone="gold" />}
        </Stack>
      )}

      {/* Play button.
          - With a real cover: tucked into the bottom-right, small, so it never
            covers the title baked into the artwork.
          - Without a cover: centered, larger, the focal action. */}
      {hasVideo && hasCover && (
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: size === "sm" ? 30 : 36,
              height: size === "sm" ? 30 : 36,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.94)",
              color: "var(--ink, #0A1A2F)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 6px 16px -6px rgba(0,0,0,0.45)",
            }}
          >
            <PlayArrowRoundedIcon sx={{ fontSize: size === "sm" ? 16 : 20 }} />
          </Box>
        </Box>
      )}
      {hasVideo && !hasCover && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: size === "sm" ? 36 : 48,
              height: size === "sm" ? 36 : 48,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.94)",
              color: "var(--ink, #0A1A2F)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 22px -8px rgba(0,0,0,0.5)",
            }}
          >
            <PlayArrowRoundedIcon sx={{ fontSize: size === "sm" ? 20 : 26 }} />
          </Box>
        </Box>
      )}

      {/* Title + count row — ONLY on painted fallback. With a real cover the
          image already has its own title; we don't double it up. */}
      {!hasCover && (
        <Box
          sx={{
            position: "relative",
            mt: "auto",
            px: { xs: 1.5, md: 2 },
            pb: { xs: 1.5, md: 1.75 },
            pt: 2,
            zIndex: 2,
            backgroundImage:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: titleFontSize,
              lineHeight: 1.18,
              letterSpacing: "-0.01em",
              fontWeight: 600,
              color: "#FFFFFF",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 1px 2px rgba(0,0,0,0.18)",
            }}
          >
            {title}
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              mt: 1,
              alignItems: "center",
              justifyContent: "space-between",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
              <Icon sx={{ fontSize: size === "sm" ? 13 : 15 }} />
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {hasVideo
                  ? `${videoCount} ${videoCount === 1 ? "video" : "videos"}`
                  : `${resourceCount} ${resourceCount === 1 ? "item" : "items"}`}
              </Typography>
            </Stack>
            {!hasVideo && resourceCount > 0 && (
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                Kit
              </Typography>
            )}
          </Stack>
        </Box>
      )}

      {/* Progress bar at very bottom — both modes */}
      {showProgress && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            bgcolor: "rgba(255,255,255,0.2)",
            zIndex: 3,
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${progressPct}%`,
              bgcolor: visual.accent,
              transition: "width var(--dur-base, 200ms) var(--ease-out, ease-out)",
            }}
          />
        </Box>
      )}
    </Box>
  );
}

function CoverBadge({
  label,
  tone,
}: {
  label: string;
  tone: "leaf" | "gold" | "paper";
}) {
  const palette =
    tone === "leaf"
      ? { bg: "rgba(255,255,255,0.94)", fg: "#1F5C40" }
      : tone === "gold"
        ? { bg: "rgba(255,255,255,0.94)", fg: "#7A5B17" }
        : { bg: "rgba(255,255,255,0.94)", fg: "#0A1A2F" };
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        px: 0.75,
        borderRadius: 0.5,
        bgcolor: palette.bg,
        color: palette.fg,
        fontSize: "0.6rem",
        fontWeight: 800,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Box>
  );
}
