"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";
const EXPERT_GREEN_TINT = "#E8F2EC";
const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const LINE = "#E6DDCF";

type PublishedResource = {
  id: string;
  topic_slug: string;
  topic_title: string;
  title: string;
  kind: string;
  category: string | null;
  position: number;
  is_published: boolean;
  submission_status: string;
  created_at: string;
  thumbnail_url: string | null;
};

/**
 * Expert resources view (read-only).
 *
 * Experts no longer upload resources directly — the admin/content team
 * publishes resources on their behalf, tagging the originating expert.
 * Anything in the `resources` table with `originating_expert_id = me`
 * shows up here so the expert can see what's live in their voice.
 */
export default function ExpertResourcesPage() {
  const [rows, setRows] = useState<PublishedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/expert/resources", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setError("Couldn't load your resources right now.");
          return;
        }
        const body = (await res.json()) as { resources?: PublishedResource[] };
        if (active) setRows(body.resources ?? []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Realtime — pick up new admin uploads without a refresh.
  useEffect(() => {
    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel("expert-resources-view")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resources" },
        () => {
          fetch("/api/expert/resources", { cache: "no-store" })
            .then((r) => r.json())
            .then((b: { resources?: PublishedResource[] }) => setRows(b.resources ?? []))
            .catch(() => {});
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  // Group by topic for cleaner browsing.
  const byTopic = new Map<string, { topic_title: string; topic_slug: string; items: PublishedResource[] }>();
  for (const r of rows) {
    const cur = byTopic.get(r.topic_slug) ?? {
      topic_title: r.topic_title,
      topic_slug: r.topic_slug,
      items: [],
    };
    cur.items.push(r);
    byTopic.set(r.topic_slug, cur);
  }

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
          Your Library
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
          Resources published in your voice
        </Typography>
        <Typography sx={{ color: INK_SOFT, fontSize: "0.98rem", lineHeight: 1.55, maxWidth: 640 }}>
          The DMN content team produces and publishes your kits — videos, action guides, worksheets — and tags them to your name. Anything live in the member library that originated from you shows up here. To request a new kit, email{" "}
          <Box
            component="a"
            href="mailto:experts@joindmn.com"
            sx={{ color: EXPERT_GREEN_DARK, textDecoration: "none", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}
          >
            experts@joindmn.com
          </Box>
          .
        </Typography>
      </Box>

      {error && (
        <Box sx={{ p: 2, bgcolor: "rgba(140,29,29,0.06)", color: "#8C1D1D", borderRadius: 1, fontSize: "0.86rem" }}>
          {error}
        </Box>
      )}

      {loading ? (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress size={22} sx={{ color: EXPERT_GREEN }} />
        </Stack>
      ) : byTopic.size === 0 ? (
        <Box
          sx={{
            borderRadius: 3,
            border: `1px solid ${LINE}`,
            bgcolor: "#FFFFFF",
            p: { xs: 4, md: 6 },
            textAlign: "center",
          }}
        >
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
            <LibraryBooksOutlinedIcon sx={{ fontSize: 26 }} />
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
            Nothing live yet
          </Typography>
          <Typography sx={{ fontSize: "0.92rem", color: INK_SOFT, maxWidth: 460, mx: "auto" }}>
            When the team publishes a kit tagged with your name, it'll appear here. Member inquiries on those kits will land in your Inquiries inbox.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3.5}>
          {Array.from(byTopic.values()).map((topic) => (
            <Box
              key={topic.topic_slug}
              sx={{
                borderRadius: 3,
                border: `1px solid ${LINE}`,
                bgcolor: "#FFFFFF",
                overflow: "hidden",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: { xs: 2, md: 2.5 },
                  py: 1.75,
                  bgcolor: "#FBF8F1",
                  borderBottom: `1px solid ${LINE}`,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: "0.62rem", color: INK_MUTED, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Kit
                  </Typography>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: INK, lineHeight: 1.2, mt: 0.25 }}>
                    {topic.topic_title}
                  </Typography>
                </Box>
                <Chip
                  label={`${topic.items.length} resource${topic.items.length === 1 ? "" : "s"}`}
                  size="small"
                  sx={{
                    bgcolor: EXPERT_GREEN_TINT,
                    color: EXPERT_GREEN_DARK,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
              </Stack>
              <Stack divider={<Box sx={{ borderTop: `1px solid #EFEAE0` }} />}>
                {topic.items.map((r) => (
                  <Stack
                    key={r.id}
                    direction="row"
                    sx={{ alignItems: "center", justifyContent: "space-between", px: { xs: 2, md: 2.5 }, py: 1.5 }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={0.85} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.25 }}>
                        <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: INK }} noWrap>
                          {r.title}
                        </Typography>
                        <StatusChip status={r.is_published ? "published" : r.submission_status} />
                      </Stack>
                      <Typography sx={{ fontSize: "0.74rem", color: INK_MUTED }}>
                        {r.kind.replaceAll("_", " ")} {r.category ? `· ${r.category}` : ""}
                      </Typography>
                    </Box>
                    {r.is_published && (
                      <Box
                        component="a"
                        href={`/dashboard/resources/${r.topic_slug}`}
                        target="_blank"
                        rel="noopener"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: EXPERT_GREEN_DARK,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        View <OpenInNewRoundedIcon sx={{ fontSize: 12 }} />
                      </Box>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function StatusChip({ status }: { status: string }) {
  const palette =
    status === "published"
      ? { bg: "rgba(34,108,78,0.12)", color: "#1F5C40" }
      : status === "approved"
        ? { bg: "rgba(34,108,78,0.08)", color: "#1F5C40" }
        : status === "draft" || status === "pending_review"
          ? { bg: "rgba(217,168,75,0.16)", color: "#A07823" }
          : { bg: "rgba(14,42,61,0.06)", color: INK_MUTED };
  return (
    <Chip
      label={status.replaceAll("_", " ")}
      size="small"
      sx={{
        bgcolor: palette.bg,
        color: palette.color,
        height: 16,
        fontSize: "0.58rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        "& .MuiChip-label": { px: 0.7 },
      }}
    />
  );
}
