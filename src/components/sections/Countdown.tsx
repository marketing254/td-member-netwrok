"use client";
import { useEffect, useState, useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  /** ISO 8601 string. Defaults to NEXT_PUBLIC_LAUNCH_AT or 2026-06-02T13:00:00Z. */
  target?: string;
  /** "dark" = light text on dark bg. "light" = dark text on light bg. */
  variant?: "dark" | "light";
  compact?: boolean;
};

type Parts = { days: number; hours: number; minutes: number; seconds: number; finished: boolean };

const DEFAULT_TARGET = "2026-06-02T13:00:00.000Z";

function diff(toMs: number): Parts {
  const now = Date.now();
  let delta = Math.max(0, Math.floor((toMs - now) / 1000));
  const days = Math.floor(delta / 86_400);
  delta -= days * 86_400;
  const hours = Math.floor(delta / 3_600);
  delta -= hours * 3_600;
  const minutes = Math.floor(delta / 60);
  const seconds = delta - minutes * 60;
  return { days, hours, minutes, seconds, finished: toMs - now <= 0 };
}

export default function Countdown({ target, variant = "light", compact = false }: Props) {
  const targetMs = useMemo(() => {
    const iso =
      target ??
      process.env.NEXT_PUBLIC_LAUNCH_AT ??
      DEFAULT_TARGET;
    const t = Date.parse(iso);
    return Number.isFinite(t) ? t : Date.parse(DEFAULT_TARGET);
  }, [target]);

  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState<Parts>(() => diff(targetMs));
  const reduced = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    setParts(diff(targetMs));
    const id = setInterval(() => setParts(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const cells = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Minutes", value: parts.minutes },
    { label: "Seconds", value: parts.seconds },
  ];

  if (parts.finished) {
    return (
      <Box
        sx={{
          p: compact ? 2 : 3,
          borderRadius: 3,
          background: "linear-gradient(160deg, #0E2A3D 0%, #06182A 100%)",
          color: "#F6F1E7",
          textAlign: "center",
          boxShadow: "0 20px 50px -20px rgba(14,42,61,0.55)",
        }}
      >
        <Typography variant="overline" sx={{ color: "#F0C16E", letterSpacing: "0.18em" }}>
          LIVE NOW
        </Typography>
        <Typography variant="h4" sx={{ color: "#F6F1E7", mt: 0.5 }}>
          The doors are open.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={compact ? 1 : 1.5}
      sx={{
        justifyContent: { xs: "center", sm: "flex-start" },
        flexWrap: "wrap",
        rowGap: 1.5,
      }}
      aria-label="Time until launch"
      role="timer"
    >
      {cells.map((cell, i) => (
        <Box
          key={cell.label}
          sx={{
            position: "relative",
            minWidth: compact ? 64 : { xs: 74, sm: 100 },
            px: compact ? 1 : { xs: 1.5, sm: 2.5 },
            py: compact ? 1.25 : { xs: 1.5, sm: 2 },
            borderRadius: 3,
            // Gold glassy gradient
            background:
              "linear-gradient(160deg, rgba(240,193,110,0.22) 0%, rgba(217,168,75,0.12) 50%, rgba(240,193,110,0.18) 100%)",
            border: "1px solid rgba(217,168,75,0.35)",
            textAlign: "center",
            backdropFilter: "blur(12px)",
            boxShadow:
              "0 20px 50px -20px rgba(217,168,75,0.35), 0 0 0 1px rgba(255,255,255,0.5) inset, 0 1px 0 rgba(255,255,255,0.7) inset",
            overflow: "hidden",
            transition: "transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                "0 28px 60px -24px rgba(217,168,75,0.45), 0 0 0 1px rgba(255,255,255,0.6) inset, 0 1px 0 rgba(255,255,255,0.8) inset",
            },
            // Shiny gold rim at top
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(240,193,110,0.9), rgba(217,168,75,1), rgba(240,193,110,0.9), transparent)",
              borderRadius: 1,
            },
            // Soft golden glow blob
            "&::after": {
              content: '""',
              position: "absolute",
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(240,193,110,0.4) 0%, transparent 65%)",
              pointerEvents: "none",
              filter: "blur(6px)",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              fontFamily: "var(--font-display), 'Fraunces', Georgia, serif",
              fontSize: compact ? "1.5rem" : { xs: "1.85rem", sm: "2.65rem" },
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: "-0.025em",
              minHeight: compact ? 24 : { xs: 30, sm: 44 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontVariantNumeric: "tabular-nums",
              // Gold gradient text
              background: "linear-gradient(180deg, #8B6914 0%, #A07823 40%, #7A5B17 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 1px 0 rgba(217,168,75,0.3))",
            }}
            aria-live={i === 3 ? "off" : "polite"}
          >
            {!mounted ? (
              <span>—</span>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={cell.value}
                  initial={reduced ? false : { y: -14, opacity: 0, rotateX: -45 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={reduced ? { opacity: 0 } : { y: 14, opacity: 0, rotateX: 45 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
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
              mt: 0.85,
              fontSize: compact ? "0.6rem" : "0.66rem",
              letterSpacing: "0.22em",
              fontWeight: 700,
              color: "#A07823",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            {cell.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
