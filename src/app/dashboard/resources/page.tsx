"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type ResourceItem = {
  id: string;
  topic_slug: string;
  topic_title: string;
  topic_summary: string | null;
  title: string;
  kind: string;
  progress: { last_viewed_at: string | null; completed_at: string | null } | null;
};

type TopicCard = {
  slug: string;
  title: string;
  summary: string | null;
  resourceCount: number;
  viewedCount: number;
  completedCount: number;
};

export default function ResourceLibraryPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/member/resources", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setResources([]);
          return;
        }
        const body = (await res.json()) as { resources: ResourceItem[] };
        if (!active) return;
        setResources(body.resources ?? []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const topics: TopicCard[] = useMemo(() => {
    const map = new Map<string, TopicCard>();
    for (const r of resources) {
      const existing = map.get(r.topic_slug);
      const viewed = !!r.progress?.last_viewed_at;
      const completed = !!r.progress?.completed_at;
      if (existing) {
        existing.resourceCount += 1;
        if (viewed) existing.viewedCount += 1;
        if (completed) existing.completedCount += 1;
      } else {
        map.set(r.topic_slug, {
          slug: r.topic_slug,
          title: r.topic_title,
          summary: r.topic_summary,
          resourceCount: 1,
          viewedCount: viewed ? 1 : 0,
          completedCount: completed ? 1 : 0,
        });
      }
    }
    return Array.from(map.values());
  }, [resources]);

  const filtered = useMemo(() => {
    if (!q.trim()) return topics;
    const lc = q.toLowerCase();
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(lc) ||
        (t.summary ?? "").toLowerCase().includes(lc),
    );
  }, [topics, q]);

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "#A07823", fontSize: "0.62rem", letterSpacing: "0.18em", fontWeight: 700 }}
        >
          RESOURCE LIBRARY
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.4rem", md: "1.7rem" },
            fontWeight: 500,
            color: "#0A1A2F",
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
            mt: 0.5,
          }}
        >
          Resource Kits
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "0.85rem", mt: 0.5, maxWidth: 620 }}>
          Practical, no-fluff training built for practice owners. Each kit is a complete topic
          pack — video, action guide, worksheets, checklist, and ready-to-use templates.
        </Typography>
      </Box>

      <TextField
        size="small"
        placeholder="Search kits…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ fontSize: 17, color: "#7A8590" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ maxWidth: 360 }}
      />

      {loading ? (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress size={22} sx={{ color: "#A07823" }} />
        </Stack>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "common.white",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
            {q ? `No kits match "${q}".` : "No kits published yet."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {filtered.map((t) => (
            <Grid key={t.slug} size={{ xs: 12, sm: 6, md: 4 }}>
              <KitCard topic={t} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

function KitCard({ topic }: { topic: TopicCard }) {
  const progressPct =
    topic.resourceCount > 0
      ? Math.round((topic.viewedCount / topic.resourceCount) * 100)
      : 0;

  return (
    <Box
      component={Link}
      href={`/dashboard/resources/${topic.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "common.white",
        textDecoration: "none",
        color: "inherit",
        transition: "all 200ms ease",
        "&:hover": {
          borderColor: "#A07823",
          transform: "translateY(-2px)",
          boxShadow: "0 14px 32px -16px rgba(14,42,61,0.22)",
        },
      }}
    >
      <Typography
        variant="overline"
        sx={{
          fontSize: "0.58rem",
          letterSpacing: "0.16em",
          fontWeight: 700,
          color: "#A07823",
          display: "block",
          mb: 0.5,
        }}
      >
        RESOURCE KIT
      </Typography>
      <Typography
        sx={{
          fontSize: "1rem",
          fontWeight: 600,
          color: "#0A1A2F",
          lineHeight: 1.3,
          mb: 0.75,
        }}
      >
        {topic.title}
      </Typography>
      {topic.summary && (
        <Typography
          sx={{
            fontSize: "0.76rem",
            color: "#5C6770",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1.5,
            flex: 1,
          }}
        >
          {topic.summary}
        </Typography>
      )}

      {/* Progress bar */}
      {topic.viewedCount > 0 && (
        <Box sx={{ mb: 1 }}>
          <Box
            sx={{
              height: 3,
              borderRadius: 999,
              bgcolor: "rgba(14,42,61,0.08)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${progressPct}%`,
                bgcolor: "#A07823",
                transition: "width 200ms ease",
              }}
            />
          </Box>
          <Typography sx={{ fontSize: "0.66rem", color: "text.secondary", mt: 0.5 }}>
            {topic.viewedCount} of {topic.resourceCount} viewed
          </Typography>
        </Box>
      )}

      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
        <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
          {topic.resourceCount} {topic.resourceCount === 1 ? "resource" : "resources"}
        </Typography>
        <Box
          sx={{
            fontSize: "0.7rem",
            color: "#A07823",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          Open kit <ArrowForwardIcon sx={{ fontSize: 13 }} />
        </Box>
      </Stack>
    </Box>
  );
}
