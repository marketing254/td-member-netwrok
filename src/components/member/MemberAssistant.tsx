"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
  Fade,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
};

const SUGGESTIONS = [
  "Where do I find the free resources?",
  "How do I update my phone number?",
  "How do I book a coaching session?",
  "Where's the refund policy?",
];

/**
 * MemberAssistant — floating bottom-right chat widget for the member
 * portal. Concierge bot that answers portal-usage questions, points
 * members at the right page, and remembers conversations across visits.
 *
 *  - Loads history on first open via GET /api/member/assistant/messages
 *  - Posts new messages to POST /api/member/assistant/messages and
 *    streams the assistant reply token-by-token into the panel.
 *  - Sticks to the bottom-right corner; collapses to a small gold pill
 *    when closed. Full-screen on mobile.
 */
export function MemberAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Load conversation on first open. Subsequent opens use the in-memory
  // state so the panel stays fast.
  useEffect(() => {
    if (!open || historyLoaded) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/member/assistant/messages", { cache: "no-store" });
        if (!res.ok) {
          if (active) setHistoryLoaded(true);
          return;
        }
        const body = (await res.json()) as {
          messages: { id: string; role: "user" | "assistant"; content: string }[];
        };
        if (!active) return;
        setMessages(body.messages.map((m) => ({ id: m.id, role: m.role, content: m.content })));
        setHistoryLoaded(true);
      } catch {
        if (active) setHistoryLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, historyLoaded]);

  // Keep the latest message in view as text streams in.
  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);

    // Optimistic insert
    const userId = `local-user-${Date.now()}`;
    const assistantId = `local-assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: text },
      { id: assistantId, role: "assistant", content: "", pending: true },
    ]);
    setInput("");

    try {
      const res = await fetch("/api/member/assistant/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        const msg = errBody.error ?? `Request failed (${res.status})`;
        setError(msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `Sorry — ${msg}`, pending: false }
              : m,
          ),
        );
        return;
      }

      // Stream chunks into the assistant message
      const reader = res.body?.getReader();
      if (!reader) {
        setError("Streaming not supported.");
        return;
      }
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
        );
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Sorry — ${msg}`, pending: false }
            : m,
        ),
      );
    } finally {
      setSending(false);
    }
  }, [input, sending]);

  const empty = messages.length === 0;

  // Suggestion chips render only when the chat is empty.
  const onSuggestion = useCallback((s: string) => setInput(s), []);

  const panelStyles = useMemo(
    () =>
      isMobile
        ? {
            position: "fixed" as const,
            inset: 0,
            borderRadius: 0,
            width: "100%",
            height: "100%",
          }
        : {
            position: "fixed" as const,
            right: 20,
            bottom: 88,
            width: 380,
            height: "min(620px, 80vh)",
            borderRadius: 2.5,
          },
    [isMobile],
  );

  return (
    <>
      {/* Floating launcher — only show when panel is closed. */}
      <Fade in={!open}>
        <Box
          component="button"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open member assistant"
          sx={{
            position: "fixed",
            right: { xs: 16, md: 20 },
            bottom: { xs: 16, md: 20 },
            zIndex: 1300,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            height: 52,
            pl: 1.5,
            pr: 2.25,
            bgcolor: "#0A1A2F",
            color: "#F0C16E",
            border: "1px solid rgba(217,168,75,0.4)",
            borderRadius: 999,
            fontFamily: "inherit",
            fontSize: "0.86rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 16px 32px -12px rgba(14,42,61,0.45), 0 4px 14px -4px rgba(217,168,75,0.4)",
            transition: "transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease",
            "&:hover": {
              bgcolor: "#0F2540",
              transform: "translateY(-2px)",
              boxShadow:
                "0 20px 40px -12px rgba(14,42,61,0.5), 0 6px 18px -4px rgba(217,168,75,0.5)",
            },
            "&:focus-visible": { outline: "2px solid #F0C16E", outlineOffset: 3 },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: "rgba(217,168,75,0.18)",
              border: "1px solid rgba(217,168,75,0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Box component="span">Ask the concierge</Box>
        </Box>
      </Fade>

      {/* Chat panel */}
      <Fade in={open} unmountOnExit>
        <Box
          role="dialog"
          aria-modal="false"
          aria-label="Member assistant"
          sx={{
            ...panelStyles,
            zIndex: 1300,
            bgcolor: "#FFFFFF",
            border: "1px solid rgba(14,42,61,0.08)",
            boxShadow: "0 32px 64px -24px rgba(14,42,61,0.4)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 2,
              py: 1.5,
              borderBottom: "1px solid rgba(14,42,61,0.08)",
              bgcolor: "#0A1A2F",
              color: "#F6F1E7",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "rgba(217,168,75,0.18)",
                color: "#F0C16E",
                border: "1px solid rgba(217,168,75,0.4)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  color: "rgba(240,193,110,0.85)",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                Concierge
              </Typography>
              <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, mt: 0.25, lineHeight: 1.2 }}>
                Ask me about the portal
              </Typography>
            </Box>
            <IconButton
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              size="small"
              sx={{
                color: "rgba(246,241,231,0.7)",
                "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            ref={scrollerRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: 1.75,
              py: 2,
              bgcolor: "#FBF8F1",
            }}
          >
            {!historyLoaded && (
              <Stack sx={{ alignItems: "center", py: 4 }}>
                <CircularProgress size={18} sx={{ color: "#A07823" }} />
              </Stack>
            )}

            {historyLoaded && empty && (
              <Stack spacing={2} sx={{ pt: 1 }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: "#0A1A2F",
                      lineHeight: 1.3,
                      mb: 0.5,
                    }}
                  >
                    Hi — I&apos;m the concierge.
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#3B4A55", lineHeight: 1.55 }}>
                    I can help you find resources, update your profile, book a coaching session, or
                    explain how anything in the portal works.
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      color: "#7A8590",
                      textTransform: "uppercase",
                      mb: 0.75,
                    }}
                  >
                    Try asking
                  </Typography>
                  <Stack spacing={0.75}>
                    {SUGGESTIONS.map((s) => (
                      <SuggestionChip key={s} label={s} onClick={() => onSuggestion(s)} />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}

            {historyLoaded && !empty && (
              <Stack spacing={1.25}>
                {messages.map((m) => (
                  <Bubble key={m.id} message={m} />
                ))}
              </Stack>
            )}
          </Box>

          {/* Composer */}
          <Box
            sx={{
              p: 1.5,
              borderTop: "1px solid rgba(14,42,61,0.08)",
              bgcolor: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask the concierge…"
                multiline
                maxRows={4}
                fullWidth
                size="small"
                disabled={sending}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.86rem",
                    borderRadius: 1.5,
                    bgcolor: "#FBF8F1",
                  },
                }}
              />
              <IconButton
                onClick={() => void send()}
                disabled={sending || !input.trim()}
                aria-label="Send"
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.25,
                  bgcolor: "#0A1A2F",
                  color: "#F0C16E",
                  "&:hover": { bgcolor: "#0F2540" },
                  "&.Mui-disabled": { bgcolor: "rgba(14,42,61,0.12)", color: "rgba(14,42,61,0.3)" },
                  alignSelf: "flex-end",
                }}
              >
                {sending ? (
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                ) : (
                  <SendRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Stack>
            {error && (
              <Typography sx={{ fontSize: "0.7rem", color: "#8C1D1D", mt: 0.75 }}>
                {error}
              </Typography>
            )}
            <Typography
              sx={{
                fontSize: "0.62rem",
                color: "#7A8590",
                mt: 0.75,
                display: "flex",
                alignItems: "center",
                gap: 0.4,
              }}
            >
              <ChatBubbleRoundedIcon sx={{ fontSize: 10 }} /> Powered by Claude · For account
              issues, email members@joindmn.com
            </Typography>
          </Box>
        </Box>
      </Fade>
    </>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: isUser ? "flex-end" : "flex-start",
        width: "100%",
      }}
    >
      <Box
        sx={{
          maxWidth: "82%",
          px: 1.5,
          py: 1,
          borderRadius: 2,
          bgcolor: isUser ? "#0A1A2F" : "#FFFFFF",
          color: isUser ? "#F6F1E7" : "#0A1A2F",
          border: isUser ? "none" : "1px solid rgba(14,42,61,0.08)",
          fontSize: "0.84rem",
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: isUser ? "none" : "0 1px 0 rgba(14,42,61,0.02)",
        }}
      >
        {message.content || (message.pending && !message.content ? <TypingDots /> : null)}
      </Box>
    </Stack>
  );
}

function TypingDots() {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        gap: 0.5,
        alignItems: "center",
        "& > span": {
          width: 5,
          height: 5,
          borderRadius: "50%",
          bgcolor: "#A07823",
          animation: "dotPulse 1.2s ease-in-out infinite",
        },
        "& > span:nth-of-type(2)": { animationDelay: "0.15s" },
        "& > span:nth-of-type(3)": { animationDelay: "0.3s" },
        "@keyframes dotPulse": {
          "0%, 80%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
          "40%": { opacity: 1, transform: "scale(1)" },
        },
      }}
    >
      <span />
      <span />
      <span />
    </Box>
  );
}

function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: "block",
        width: "100%",
        textAlign: "left",
        px: 1.25,
        py: 1,
        borderRadius: 1.25,
        bgcolor: "#FFFFFF",
        border: "1px solid rgba(14,42,61,0.08)",
        color: "#3B4A55",
        fontSize: "0.82rem",
        cursor: "pointer",
        transition: "border-color 160ms ease, background-color 160ms ease, color 160ms ease",
        "&:hover": {
          borderColor: "#A07823",
          bgcolor: "rgba(217,168,75,0.06)",
          color: "#0A1A2F",
        },
        "&:focus-visible": { outline: "2px solid #A07823", outlineOffset: 2 },
      }}
    >
      {label}
    </Box>
  );
}
