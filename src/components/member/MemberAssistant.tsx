"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Fade,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  CONCIERGE_NODES,
  CONCIERGE_ROOT,
  type ConciergeOption,
} from "@/lib/conciergeScript";

type Turn =
  | { kind: "bot"; text: string; options: ConciergeOption[] }
  | { kind: "user"; text: string };

/**
 * MemberAssistant — guided Concierge for the member portal.
 *
 * It's a button-driven option tree (no LLM, no backend) defined in
 * lib/conciergeScript.ts. Each turn the bot shows a message + a row of
 * buttons; tapping one either branches to another node OR opens a deep
 * link (kit page, hotline tel:, mailto:, etc.).
 *
 * Float bottom-right on every signed-in page (mounted from AppShell).
 */
export function MemberAssistant() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<Turn[]>([
    { kind: "bot", text: CONCIERGE_ROOT.reply, options: CONCIERGE_ROOT.options },
  ]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Keep the latest turn in view as new ones append.
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const el = scrollerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [history, open]);

  const choose = (opt: ConciergeOption) => {
    // Record the choice as a "user" line so the thread reads naturally.
    setHistory((prev) => [...prev, { kind: "user", text: opt.label }]);
    if (opt.next) {
      const next = CONCIERGE_NODES[opt.next] ?? CONCIERGE_ROOT;
      // Tiny pause so the typing rhythm doesn't feel instant.
      window.setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          { kind: "bot", text: next.reply, options: next.options },
        ]);
      }, 220);
    }
    // For `href` options the Link handles navigation; nothing more to do.
  };

  const reset = () => {
    setHistory([
      { kind: "bot", text: CONCIERGE_ROOT.reply, options: CONCIERGE_ROOT.options },
    ]);
  };

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <Box
          component="button"
          type="button"
          onClick={() => setOpen(true)}
          sx={{
            all: "unset",
            position: "fixed",
            right: { xs: 16, md: 24 },
            bottom: { xs: 16, md: 24 },
            zIndex: 1200,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 1.75,
            py: 1.1,
            borderRadius: 999,
            bgcolor: "#0A1A2F",
            color: "#FFFFFF",
            cursor: "pointer",
            fontSize: "0.86rem",
            fontWeight: 700,
            boxShadow: "0 12px 32px -12px rgba(14,42,61,0.55)",
            transition: "transform 200ms ease, background-color 200ms ease",
            "&:hover": { bgcolor: "#0F2540", transform: "translateY(-2px)" },
            "&:focus-visible": { outline: "2px solid var(--gold, #F0C16E)", outlineOffset: 3 },
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: "#F0C16E" }} />
          Concierge
        </Box>
      )}

      {/* Panel */}
      <Fade in={open} unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            right: { xs: 0, md: 24 },
            bottom: { xs: 0, md: 24 },
            zIndex: 1300,
            width: { xs: "100vw", md: 420 },
            height: { xs: "100dvh", md: 580 },
            display: "flex",
            flexDirection: "column",
            bgcolor: "#FFFFFF",
            borderRadius: { xs: 0, md: 3 },
            border: { md: "1px solid rgba(14,42,61,0.08)" },
            boxShadow: "0 32px 64px -24px rgba(14,42,61,0.4)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1.5,
              bgcolor: "#0A1A2F",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: "rgba(217,168,75,0.18)",
                color: "#F0C16E",
                display: "grid",
                placeItems: "center",
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, lineHeight: 1 }}>
                Concierge
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", mt: 0.25 }}>
                Pick an option — I'll point you there
              </Typography>
            </Box>
            <IconButton
              aria-label="Start over"
              onClick={reset}
              size="small"
              sx={{
                color: "rgba(255,255,255,0.7)",
                "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              <RefreshRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              aria-label="Close"
              onClick={() => setOpen(false)}
              size="small"
              sx={{
                color: "rgba(255,255,255,0.7)",
                "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          {/* Conversation scroller */}
          <Box
            ref={scrollerRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              bgcolor: "#FBF8F1",
              px: 2,
              py: 2,
            }}
          >
            <Stack spacing={1.5}>
              {history.map((turn, i) => (turn.kind === "bot" ? (
                <BotTurn
                  key={i}
                  text={turn.text}
                  options={turn.options}
                  onChoose={choose}
                  isLatest={i === history.length - 1}
                />
              ) : (
                <UserTurn key={i} text={turn.text} />
              )))}
            </Stack>
          </Box>

          {/* Footer hint */}
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderTop: "1px solid rgba(14,42,61,0.06)",
              bgcolor: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: "0.72rem", color: "#7A8590", lineHeight: 1.4 }}>
              Need a human?{" "}
              <Box component="a" href="tel:+18556334707" sx={{ color: "#A07823", fontWeight: 700, textDecoration: "none" }}>
                (855) 633-4707
              </Box>
              {" "}or{" "}
              <Box component="a" href="mailto:hello@joindmn.com" sx={{ color: "#A07823", fontWeight: 700, textDecoration: "none" }}>
                hello@joindmn.com
              </Box>
              .
            </Typography>
          </Box>
        </Box>
      </Fade>
    </>
  );
}

function BotTurn({
  text,
  options,
  onChoose,
  isLatest,
}: {
  text: string;
  options: ConciergeOption[];
  onChoose: (o: ConciergeOption) => void;
  isLatest: boolean;
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "rgba(217,168,75,0.18)",
          color: "#A07823",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        <AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid rgba(14,42,61,0.08)",
            borderRadius: 2,
            px: 1.5,
            py: 1.25,
            boxShadow: "0 1px 0 rgba(14,42,61,0.02)",
          }}
        >
          <Typography sx={{ fontSize: "0.88rem", color: "#0A1A2F", lineHeight: 1.55 }}>
            {text}
          </Typography>
        </Box>
        {isLatest && options.length > 0 && (
          <Stack direction="column" spacing={0.75} sx={{ mt: 1.25 }}>
            {options.map((opt, idx) => (
              <OptionButton key={`${opt.label}-${idx}`} option={opt} onChoose={onChoose} />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function UserTurn({ text }: { text: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
      <Box
        sx={{
          bgcolor: "#0A1A2F",
          color: "#FFFFFF",
          borderRadius: 2,
          px: 1.5,
          py: 1,
          maxWidth: "78%",
        }}
      >
        <Typography sx={{ fontSize: "0.85rem", lineHeight: 1.4 }}>{text}</Typography>
      </Box>
    </Stack>
  );
}

function OptionButton({
  option,
  onChoose,
}: {
  option: ConciergeOption;
  onChoose: (o: ConciergeOption) => void;
}) {
  const primary = option.tone === "primary";
  const isExternal =
    !!option.href && (option.href.startsWith("http") || option.href.startsWith("tel:") || option.href.startsWith("mailto:"));

  const inner = (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: primary ? "#0A1A2F" : "#FFFFFF",
        color: primary ? "#FFFFFF" : "#0A1A2F",
        border: `1px solid ${primary ? "#0A1A2F" : "rgba(14,42,61,0.14)"}`,
        borderRadius: 1.5,
        px: 1.5,
        py: 1,
        cursor: "pointer",
        transition: "background-color 160ms ease, border-color 160ms ease, transform 160ms ease",
        "&:hover": {
          bgcolor: primary ? "#0F2540" : "rgba(217,168,75,0.08)",
          borderColor: primary ? "#0F2540" : "#A07823",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, color: "inherit" }}>
        {option.label}
      </Typography>
      <ArrowForwardRoundedIcon sx={{ fontSize: 14, color: primary ? "#F0C16E" : "#A07823" }} />
    </Stack>
  );

  if (option.href) {
    if (isExternal) {
      return (
        <Box
          component="a"
          href={option.href}
          onClick={() => onChoose(option)}
          sx={{ textDecoration: "none" }}
        >
          {inner}
        </Box>
      );
    }
    return (
      <Box
        component={Link}
        href={option.href}
        onClick={() => onChoose(option)}
        sx={{ textDecoration: "none" }}
      >
        {inner}
      </Box>
    );
  }
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onChoose(option)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChoose(option);
        }
      }}
    >
      {inner}
    </Box>
  );
}

// Keep the empty-state launcher icon import alive even if we ever drop the
// launcher floating button — also used by other portals.
export { ChatBubbleRoundedIcon as ConciergeIcon };
