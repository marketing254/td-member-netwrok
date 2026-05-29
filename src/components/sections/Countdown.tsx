"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import { alpha } from "@mui/material/styles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  /** ISO 8601 string. Defaults to NEXT_PUBLIC_LAUNCH_AT or 2026-06-18T13:00:00Z. */
  target?: string;
  /** "dark" = light text on dark bg. "light" = dark text on light bg. */
  variant?: "dark" | "light";
  compact?: boolean;
};

type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  finished: boolean;
};

const DEFAULT_TARGET = "2026-06-18T13:00:00.000Z";
const LAUNCH_WINDOW_SECONDS = 14 * 86_400;

function diff(toMs: number): Parts {
  const now = Date.now();
  let delta = Math.max(0, Math.floor((toMs - now) / 1000));
  const totalSeconds = delta;
  const days = Math.floor(delta / 86_400);
  delta -= days * 86_400;
  const hours = Math.floor(delta / 3_600);
  delta -= hours * 3_600;
  const minutes = Math.floor(delta / 60);
  const seconds = delta - minutes * 60;
  return { days, hours, minutes, seconds, totalSeconds, finished: toMs - now <= 0 };
}

export default function Countdown({ target, variant = "light", compact = false }: Props) {
  const targetMs = useMemo(() => {
    const iso = target ?? process.env.NEXT_PUBLIC_LAUNCH_AT ?? DEFAULT_TARGET;
    const t = Date.parse(iso);
    return Number.isFinite(t) ? t : Date.parse(DEFAULT_TARGET);
  }, [target]);

  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState<Parts>(() => diff(targetMs));
  const reduced = useReducedMotion();
  const isDark = variant === "dark";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      setParts(diff(targetMs));
    });
    const id = setInterval(() => setParts(diff(targetMs)), 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      clearInterval(id);
    };
  }, [targetMs]);

  const launchLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
        timeZoneName: "short",
      }).format(new Date(targetMs));
    } catch {
      return "soon";
    }
  }, [targetMs]);

  // Same hydration trick for the progress bar: server and client see
  // different `parts.totalSeconds`, so we lock the initial render to 6%
  // and let the client update post-mount.
  const progress = !mounted
    ? 6
    : parts.finished
    ? 100
    : Math.max(
        6,
        Math.round(
          (1 - Math.min(parts.totalSeconds, LAUNCH_WINDOW_SECONDS) / LAUNCH_WINDOW_SECONDS) * 100,
        ),
      );

  const palette = {
    panel:
      isDark
        ? "linear-gradient(145deg, rgba(10,26,47,0.96) 0%, rgba(6,24,42,0.9) 100%)"
        : "linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(247,245,240,0.94) 100%)",
    shellShadow: isDark
      ? "0 24px 70px -30px rgba(0,0,0,0.75), 0 1px 0 rgba(255,255,255,0.08) inset"
      : "0 24px 70px -34px rgba(14,42,61,0.38), 0 1px 0 rgba(255,255,255,0.88) inset",
    text: isDark ? "#F7F5F0" : "#0A1A2F",
    muted: isDark ? "rgba(247,245,240,0.68)" : "#5C6770",
    border: isDark ? "rgba(255,255,255,0.14)" : "rgba(14,42,61,0.1)",
    cell: isDark
      ? "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)"
      : "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.7) 100%)",
    value: isDark ? "#FFFFFF" : "#0A1A2F",
    track: isDark ? "rgba(255,255,255,0.1)" : "rgba(14,42,61,0.08)",
  };

  const cells = [
    { label: "Days", value: parts.days, accent: "#2AA7B8" },
    { label: "Hours", value: parts.hours, accent: "#D9A84B" },
    { label: "Minutes", value: parts.minutes, accent: "#2E8A57" },
    { label: "Seconds", value: parts.seconds, accent: "#C75C4A" },
  ];

  // IMPORTANT: only switch to the dynamic timer label after client mount.
  // Otherwise the server renders one Date.now() and the client hydrates with
  // a different one (a few seconds later), and React throws a hydration
  // mismatch error on the aria-label string.
  const timerLabel = mounted
    ? `Time until launch: ${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds`
    : "Time until launch";

  if (parts.finished) {
    return (
      <Box
        role="status"
        sx={{
          position: "relative",
          width: { xs: "100%", sm: "fit-content" },
          maxWidth: 560,
          p: "1px",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: palette.shellShadow,
          background: "linear-gradient(120deg, #2AA7B8, #F0C16E, #2E8A57)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            p: compact ? 2 : { xs: 2.25, sm: 3 },
            borderRadius: "9px",
            background: "linear-gradient(140deg, #0E2A3D 0%, #06182A 100%)",
            color: "#F7F5F0",
            overflow: "hidden",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "center" }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "8px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #F0C16E, #D9A84B)",
                color: "#06182A",
                boxShadow: "0 14px 30px -18px rgba(240,193,110,0.8)",
              }}
            >
              <RocketLaunchOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#F0C16E", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 0 }}>
                LIVE NOW
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#F7F5F0", mt: 0.25, fontWeight: 600, letterSpacing: 0 }}
              >
                The doors are open.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      aria-label={timerLabel}
      role="timer"
      sx={{
        position: "relative",
        width: { xs: "100%", sm: "fit-content" },
        maxWidth: compact ? 430 : 580,
        p: "1px",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: palette.shellShadow,
        isolation: "isolate",
      }}
    >
      <motion.div
        aria-hidden
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: "-45%",
          zIndex: -2,
          background:
            "conic-gradient(from 90deg, rgba(42,167,184,0.05), rgba(42,167,184,0.8), rgba(240,193,110,0.95), rgba(46,138,87,0.72), rgba(199,92,74,0.7), rgba(42,167,184,0.05))",
        }}
      />

      <Box
        sx={{
          position: "relative",
          p: compact ? 1.25 : { xs: 1.5, sm: 2 },
          borderRadius: "9px",
          background: palette.panel,
          border: `1px solid ${palette.border}`,
          overflow: "hidden",
          backdropFilter: "blur(18px)",
        }}
      >
        {!reduced && (
          <motion.div
            aria-hidden
            animate={{ x: ["-140%", "170%"] }}
            transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "42%",
              transform: "skewX(-18deg)",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.26) 48%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        )}

        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            position: "relative",
            zIndex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            mb: compact ? 1 : 1.5,
            gap: 1.25,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
            <Box
              sx={{
                flexShrink: 0,
                width: compact ? 34 : 40,
                height: compact ? 34 : 40,
                borderRadius: "8px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #F0C16E 0%, #D9A84B 100%)",
                color: "#06182A",
                boxShadow: "0 14px 30px -18px rgba(217,168,75,0.9)",
              }}
            >
              <RocketLaunchOutlinedIcon sx={{ fontSize: compact ? 18 : 21 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: palette.text,
                  fontWeight: 800,
                  fontSize: compact ? "0.86rem" : { xs: "0.9rem", sm: "1rem" },
                  lineHeight: 1.1,
                  letterSpacing: 0,
                }}
              >
                Launch countdown
              </Typography>
              {!compact && (
                <Typography
                  sx={{
                    color: palette.muted,
                    fontSize: { xs: "0.74rem", sm: "0.8rem" },
                    mt: 0.25,
                    letterSpacing: 0,
                    whiteSpace: { xs: "normal", sm: "nowrap" },
                  }}
                >
                  Founding access opens {launchLabel}
                </Typography>
              )}
            </Box>
          </Stack>

          <Box
            sx={{
              display: { xs: "none", sm: compact ? "none" : "inline-flex" },
              alignItems: "center",
              px: 1,
              py: 0.5,
              borderRadius: "8px",
              color: isDark ? "#F0C16E" : "#A07823",
              bgcolor: isDark ? "rgba(240,193,110,0.12)" : "rgba(217,168,75,0.12)",
              border: `1px solid ${isDark ? "rgba(240,193,110,0.22)" : "rgba(217,168,75,0.24)"}`,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: 0,
            }}
          >
            First cohort
          </Box>
        </Stack>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: compact
              ? "repeat(4, minmax(0, 1fr))"
              : { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(76px, 1fr))" },
            gap: compact ? 0.75 : { xs: 0.9, sm: 1 },
          }}
        >
          {cells.map((cell) => (
            <Box
              key={cell.label}
              sx={{
                position: "relative",
                minWidth: 0,
                minHeight: compact ? 72 : { xs: 86, sm: 104 },
                px: compact ? 0.75 : { xs: 1, sm: 1.35 },
                py: compact ? 1 : { xs: 1.25, sm: 1.5 },
                borderRadius: "8px",
                background: palette.cell,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(14,42,61,0.08)"}`,
                boxShadow: isDark
                  ? "0 14px 34px -26px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.08) inset"
                  : "0 14px 34px -26px rgba(14,42,61,0.36), 0 1px 0 rgba(255,255,255,0.9) inset",
                overflow: "hidden",
                textAlign: "center",
                transition: "transform 260ms ease, border-color 260ms ease, box-shadow 260ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: alpha(cell.accent, 0.45),
                  boxShadow: isDark
                    ? `0 20px 44px -28px ${alpha(cell.accent, 0.55)}, 0 1px 0 rgba(255,255,255,0.1) inset`
                    : `0 20px 44px -30px ${alpha(cell.accent, 0.48)}, 0 1px 0 rgba(255,255,255,0.95) inset`,
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${cell.accent}, ${alpha(cell.accent, 0.35)})`,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(160deg, ${alpha(cell.accent, isDark ? 0.12 : 0.1)} 0%, transparent 52%)`,
                  pointerEvents: "none",
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  minHeight: compact ? 30 : { xs: 38, sm: 48 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: palette.value,
                  fontFamily: "var(--font-display), Fraunces, Georgia, serif",
                  fontSize: compact ? "1.55rem" : { xs: "2.05rem", sm: "2.75rem" },
                  fontWeight: 650,
                  lineHeight: 1,
                  letterSpacing: 0,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: isDark ? `0 0 20px ${alpha(cell.accent, 0.38)}` : "0 1px 0 rgba(255,255,255,0.85)",
                }}
                aria-live="off"
              >
                {!mounted ? (
                  <span>--</span>
                ) : (
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={cell.value}
                      initial={reduced ? false : { y: -16, opacity: 0, rotateX: -50 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={reduced ? { opacity: 0 } : { y: 16, opacity: 0, rotateX: 50 }}
                      transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
                      style={{ display: "inline-block" }}
                    >
                      {String(cell.value).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                )}
              </Box>
              <Typography
                sx={{
                  position: "relative",
                  zIndex: 1,
                  mt: compact ? 0.45 : 0.75,
                  color: isDark ? alpha("#F7F5F0", 0.7) : "#5C6770",
                  fontSize: compact ? "0.62rem" : "0.7rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0,
                }}
              >
                {cell.label}
              </Typography>
              <Box
                aria-hidden
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: 22,
                  height: 2,
                  mx: "auto",
                  mt: compact ? 0.55 : 0.8,
                  borderRadius: 999,
                  bgcolor: cell.accent,
                  opacity: isDark ? 0.85 : 0.72,
                }}
              />
            </Box>
          ))}
        </Box>

        <Box
          aria-hidden
          sx={{
            position: "relative",
            zIndex: 1,
            mt: compact ? 1 : 1.4,
            height: 6,
            borderRadius: 999,
            bgcolor: palette.track,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={reduced ? undefined : { width: `${progress}%` }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #2AA7B8 0%, #D9A84B 48%, #2E8A57 100%)",
              boxShadow: "0 0 16px rgba(217,168,75,0.45)",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
