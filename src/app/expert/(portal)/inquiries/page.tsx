"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";
const EXPERT_GREEN_TINT = "#E8F2EC";
const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const LINE = "#E6DDCF";
const LINE_SOFT = "#EFEAE0";
const GOLD = "#A07823";
const GOLD_SOFT = "rgba(217,168,75,0.16)";

type AuthorKind = "member" | "expert" | "partner" | "admin";

type Inquiry = {
  id: string;
  resource_id: string;
  resource_topic_slug: string | null;
  resource_topic_title: string | null;
  resource_title: string | null;
  author_auth_user_id: string;
  author_display_name: string;
  author_subtitle: string | null;
  body: string;
  reply_count: number;
  status: "open" | "answered" | "closed";
  created_at: string;
  updated_at: string;
};

type Reply = {
  id: string;
  inquiry_id: string;
  author_kind: AuthorKind;
  author_display_name: string;
  author_subtitle: string | null;
  body: string;
  created_at: string;
};

type StatusFilter = "all" | "open" | "answered";

export default function ExpertInquiriesPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/expert/inquiries?status=${filter}&limit=100`,
        { cache: "no-store" },
      );
      const body = (await res.json()) as {
        inquiries?: Inquiry[];
        error?: string;
      };
      if (!res.ok || body.error) {
        setError("Couldn't load inquiries right now. Please try again.");
        setRows([]);
        return;
      }
      setRows(body.inquiries ?? []);
      setError(null);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[expert:inquiries] load failed:", err);
      setError("Couldn't load inquiries right now. Please try again.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime — refresh when an inquiry or reply lands.
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel("expert-inquiries-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resource_inquiries" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resource_inquiry_replies" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const counts = {
    all: rows.length,
    open: rows.filter((r) => r.status === "open").length,
    answered: rows.filter((r) => r.status === "answered").length,
  };

  return (
    <Stack spacing={3.5} sx={{ maxWidth: 920, mx: "auto" }}>
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: EXPERT_GREEN_DARK,
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Inquiries
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.9rem", md: "2.4rem" },
            fontWeight: 500,
            color: INK,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            mb: 1,
          }}
        >
          Member questions on your work
        </Typography>
        <Typography
          sx={{
            color: INK_SOFT,
            fontSize: "0.98rem",
            lineHeight: 1.55,
            maxWidth: 620,
          }}
        >
          Every inquiry a member posts on a resource you authored shows up
          here. Reply directly — the whole thread is visible to every member
          viewing that resource, so a good answer compounds.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: `1px solid ${LINE}` }}>
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v as StatusFilter)}
          sx={{
            minHeight: 38,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              minHeight: 38,
              py: 1,
            },
            "& .Mui-selected": { color: INK },
            "& .MuiTabs-indicator": {
              backgroundColor: EXPERT_GREEN,
              height: 3,
              borderRadius: 999,
            },
          }}
        >
          <Tab
            value="all"
            label={
              <Stack direction="row" spacing={0.85} sx={{ alignItems: "center" }}>
                <Box>All</Box>
                <CountChip count={counts.all} active={filter === "all"} />
              </Stack>
            }
          />
          <Tab
            value="open"
            label={
              <Stack direction="row" spacing={0.85} sx={{ alignItems: "center" }}>
                <Box>Needs reply</Box>
                <CountChip count={counts.open} active={filter === "open"} />
              </Stack>
            }
          />
          <Tab
            value="answered"
            label={
              <Stack direction="row" spacing={0.85} sx={{ alignItems: "center" }}>
                <Box>Answered</Box>
                <CountChip count={counts.answered} active={filter === "answered"} />
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box
        sx={{
          borderRadius: 3,
          border: `1px solid ${LINE}`,
          bgcolor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Stack sx={{ alignItems: "center", py: 6 }}>
            <CircularProgress size={22} sx={{ color: EXPERT_GREEN }} />
          </Stack>
        ) : rows.length === 0 ? (
          <Box sx={{ p: { xs: 4, md: 6 }, textAlign: "center" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: EXPERT_GREEN_TINT,
                color: EXPERT_GREEN,
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 500,
                color: INK,
                mb: 0.75,
              }}
            >
              No {filter === "all" ? "" : filter + " "}inquiries yet
            </Typography>
            <Typography
              sx={{
                fontSize: "0.92rem",
                color: INK_SOFT,
                maxWidth: 460,
                mx: "auto",
              }}
            >
              When a member asks a question on one of your published resources,
              it lands here. You&apos;ll also get a notification.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Box sx={{ borderTop: `1px solid ${LINE_SOFT}` }} />}>
            {rows.map((inq) => (
              <InboxRow
                key={inq.id}
                inquiry={inq}
                expanded={expandedId === inq.id}
                onToggle={() =>
                  setExpandedId((id) => (id === inq.id ? null : inq.id))
                }
                onReplied={() => void load()}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function CountChip({ count, active }: { count: number; active: boolean }) {
  return (
    <Chip
      label={count}
      size="small"
      sx={{
        height: 20,
        fontSize: "0.7rem",
        bgcolor: active ? EXPERT_GREEN_TINT : "grey.100",
        color: active ? EXPERT_GREEN_DARK : INK_MUTED,
        fontWeight: 700,
      }}
    />
  );
}

function InboxRow({
  inquiry,
  expanded,
  onToggle,
  onReplied,
}: {
  inquiry: Inquiry;
  expanded: boolean;
  onToggle: () => void;
  onReplied: () => void;
}) {
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const res = await fetch(
        `/api/resources/${inquiry.resource_id}/inquiries/${inquiry.id}/replies`,
        { cache: "no-store" },
      );
      const body = (await res.json()) as { replies?: Reply[]; error?: string };
      if (!res.ok || body.error) {
        setError("Couldn't load the thread. Please try again.");
        return;
      }
      setReplies(body.replies ?? []);
      setError(null);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[expert:inquiries] replies load failed:", err);
      setError("Couldn't load the thread. Please try again.");
    } finally {
      setLoadingReplies(false);
    }
  }, [inquiry.resource_id, inquiry.id]);

  useEffect(() => {
    if (expanded && replies === null) void loadReplies();
  }, [expanded, replies, loadReplies]);

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/resources/${inquiry.resource_id}/inquiries/${inquiry.id}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text }),
        },
      );
      const body = (await res.json()) as {
        ok?: boolean;
        reply?: Reply;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.reply) {
        const safe =
          body.error && res.status >= 400 && res.status < 500
            ? body.error
            : "Couldn't post that reply right now. Please try again.";
        setError(safe);
        return;
      }
      setReplies((prev) => (prev ? [...prev, body.reply!] : [body.reply!]));
      setDraft("");
      onReplied();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[expert:inquiries] reply failed:", err);
      setError("Couldn't post that reply right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: expanded ? "grey.50" : "transparent" }}>
      <Box
        component="button"
        type="button"
        onClick={onToggle}
        sx={{
          all: "unset",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 1.5,
          alignItems: "flex-start",
          px: { xs: 2, md: 3 },
          py: 2.5,
          cursor: "pointer",
          "&:hover": { bgcolor: "grey.50" },
          "&:focus-visible": {
            outline: `2px solid ${EXPERT_GREEN}`,
            outlineOffset: -2,
          },
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: GOLD_SOFT,
            color: GOLD,
            fontSize: "0.82rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials(inquiry.author_display_name)}
        </Avatar>
        <Box sx={{ minWidth: 0, textAlign: "left" }}>
          <Stack direction="row" spacing={0.85} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.25 }}>
            <Typography
              sx={{
                fontSize: "0.92rem",
                fontWeight: 700,
                color: INK,
                lineHeight: 1.2,
              }}
            >
              {inquiry.author_display_name}
            </Typography>
            <Typography sx={{ fontSize: "0.74rem", color: INK_MUTED }}>
              · {formatRelative(inquiry.created_at)}
            </Typography>
            <StatusChip status={inquiry.status} />
          </Stack>
          <Typography
            sx={{
              fontSize: "0.74rem",
              color: INK_MUTED,
              lineHeight: 1.4,
              mb: 0.85,
            }}
          >
            {inquiry.resource_topic_title}
            {inquiry.resource_title ? ` · ${inquiry.resource_title}` : ""}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.92rem",
              color: INK_SOFT,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              ...(expanded
                ? {}
                : {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }),
            }}
          >
            {inquiry.body}
          </Typography>
          <Typography sx={{ fontSize: "0.74rem", color: INK_MUTED, mt: 0.75 }}>
            {inquiry.reply_count === 0
              ? "No replies yet"
              : `${inquiry.reply_count} repl${inquiry.reply_count === 1 ? "y" : "ies"}`}
          </Typography>
        </Box>
        {inquiry.resource_topic_slug && (
          <Button
            component="a"
            href={`/dashboard/resources/${inquiry.resource_topic_slug}`}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            size="small"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 13 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.74rem",
              color: INK_SOFT,
              minWidth: 0,
              "&:hover": { bgcolor: "rgba(14,42,61,0.04)" },
            }}
          >
            View
          </Button>
        )}
      </Box>

      {expanded && (
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 2.5, pt: 0.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Box
            sx={{
              borderLeft: `2px solid ${LINE}`,
              pl: { xs: 1.5, md: 2 },
              maxHeight: 380,
              overflowY: "auto",
              mb: 1.5,
            }}
          >
            {loadingReplies ? (
              <Stack sx={{ alignItems: "center", py: 2 }}>
                <CircularProgress size={18} sx={{ color: EXPERT_GREEN }} />
              </Stack>
            ) : (replies ?? []).length === 0 ? (
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  color: INK_MUTED,
                  py: 1.5,
                  textAlign: "center",
                }}
              >
                No replies yet. Yours will be the first.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {(replies ?? []).map((r) => (
                  <ReplyView key={r.id} reply={r} />
                ))}
              </Stack>
            )}
          </Box>
          <Stack spacing={1}>
            <TextField
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a reply — members reading this resource will see your answer."
              multiline
              minRows={3}
              fullWidth
              slotProps={{ inputLabel: { shrink: false } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.92rem",
                  bgcolor: "#FFFFFF",
                },
              }}
            />
            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
              <Button
                onClick={submit}
                disabled={submitting || draft.trim().length === 0}
                variant="contained"
                endIcon={
                  submitting ? (
                    <CircularProgress size={14} sx={{ color: "#FFFFFF" }} />
                  ) : (
                    <SendRoundedIcon sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 2.5,
                  bgcolor: EXPERT_GREEN,
                  color: "#FFFFFF",
                  backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                  "&:hover": {
                    bgcolor: EXPERT_GREEN_DARK,
                    backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                  },
                }}
              >
                {submitting ? "Posting…" : "Post reply"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

function ReplyView({ reply }: { reply: Reply }) {
  const isMine = reply.author_kind === "expert";
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
      <Avatar
        sx={{
          width: 30,
          height: 30,
          bgcolor: isMine ? EXPERT_GREEN_TINT : GOLD_SOFT,
          color: isMine ? EXPERT_GREEN : GOLD,
          fontSize: "0.7rem",
          fontWeight: 700,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {initials(reply.author_display_name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.85} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Typography
            sx={{ fontSize: "0.82rem", fontWeight: 700, color: INK, lineHeight: 1.2 }}
          >
            {reply.author_display_name}
          </Typography>
          <Chip
            label={reply.author_kind}
            size="small"
            sx={{
              height: 16,
              bgcolor: isMine ? EXPERT_GREEN_TINT : GOLD_SOFT,
              color: isMine ? EXPERT_GREEN_DARK : GOLD,
              fontSize: "0.58rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              "& .MuiChip-label": { px: 0.7 },
            }}
          />
          <Typography sx={{ fontSize: "0.7rem", color: INK_MUTED }}>
            · {formatRelative(reply.created_at)}
          </Typography>
        </Stack>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: "0.88rem",
            color: INK_SOFT,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {reply.body}
        </Typography>
      </Box>
    </Stack>
  );
}

function StatusChip({ status }: { status: Inquiry["status"] }) {
  const map: Record<Inquiry["status"], { label: string; bg: string; color: string }> = {
    open: { label: "Needs reply", bg: "rgba(217,168,75,0.16)", color: "#A07823" },
    answered: { label: "Answered", bg: EXPERT_GREEN_TINT, color: EXPERT_GREEN_DARK },
    closed: { label: "Closed", bg: "rgba(14,42,61,0.06)", color: INK_MUTED },
  };
  const m = map[status];
  return (
    <Chip
      label={m.label}
      size="small"
      sx={{
        bgcolor: m.bg,
        color: m.color,
        height: 18,
        fontSize: "0.62rem",
        fontWeight: 800,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        "& .MuiChip-label": { px: 0.75 },
      }}
    />
  );
}

function initials(name: string): string {
  const t = (name ?? "").trim();
  if (!t) return "··";
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
