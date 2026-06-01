"use client";

import { Box, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { visualForTopic } from "@/components/member/topicVisuals";

/**
 * KitCover — magazine-style cover thumbnail for a resource kit.
 *
 * Reads as a real cover image (not "gradient + icon blob"):
 *   - Topic-gradient backdrop
 *   - Diagonal stripe pattern for tactile feel
 *   - Big display-font title set against the gradient
 *   - Topical icon as small support element bottom-left
 *   - Bottom-right: video count or item count
 *   - Optional play button overlay (centred) for video kits
 *   - Subtle progress bar at bottom when viewed
 *
 * Sizes: pass `size="md"` (default — for grid tiles) or `size="sm"` for
 * sidebar mini-tiles.
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
}) {
  const visual = visualForTopic(slug);
  const Icon = visual.icon;
  const hasVideo = videoCount > 0;
  const showProgress = progressPct > 0;

  // Typography that respects the available space — wraps cleanly, never overflows.
  const titleFontSize = size === "sm"
    ? { xs: "0.92rem" }
    : { xs: "1.05rem", md: "1.2rem" };

  return (
    <Box
      sx={{
        position: "relative",
        aspectRatio: "16 / 10",
        backgroundImage: visual.gradient,
        overflow: "hidden",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        color: "#FFFFFF",
        isolation: "isolate",
      }}
    >
      {/* Subtle diagonal stripe pattern — adds tactile depth */}
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

      {/* Soft top-light gradient — gives the cover dimension */}
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

      {/* Status badges (top-left, properly inset) */}
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

      {/* Centred play button when the kit has video */}
      {hasVideo && (
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

      {/* Title — set in display font, anchored bottom-left, supports up to 2 lines */}
      <Box
        sx={{
          position: "relative",
          mt: "auto",
          px: { xs: 1.5, md: 2 },
          pb: { xs: 1.5, md: 1.75 },
          pt: 2,
          zIndex: 2,
          // Local gradient under the text for readability against any backdrop
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

        {/* Bottom row: icon + counter */}
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

      {/* Progress bar at very bottom */}
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
