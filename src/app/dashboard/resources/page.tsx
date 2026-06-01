"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import {
  visualForTopic,
  categoryForSlug,
  CATEGORY_LABELS,
  type TopicCategory,
} from "@/components/member/topicVisuals";

type ResourceItem = {
  id: string;
  topic_slug: string;
  topic_title: string;
  topic_summary: string | null;
  title: string;
  kind: string;
  is_free: boolean;
  progress: { last_viewed_at: string | null; completed_at: string | null } | null;
};

type TopicCard = {
  slug: string;
  title: string;
  summary: string | null;
  resourceCount: number;
  videoCount: number;
  downloadCount: number;
  viewedCount: number;
  completedCount: number;
  isFree: boolean;
};

type FilterKey = "all" | "free" | TopicCategory;

export default function ResourceLibraryPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

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
      const isVideo = r.kind.startsWith("video_") || r.kind === "audio";
      const existing = map.get(r.topic_slug);
      const viewed = !!r.progress?.last_viewed_at;
      const completed = !!r.progress?.completed_at;
      if (existing) {
        existing.resourceCount += 1;
        if (isVideo) existing.videoCount += 1;
        else existing.downloadCount += 1;
        if (viewed) existing.viewedCount += 1;
        if (completed) existing.completedCount += 1;
        if (!r.is_free) existing.isFree = false;
      } else {
        map.set(r.topic_slug, {
          slug: r.topic_slug,
          title: r.topic_title,
          summary: r.topic_summary,
          resourceCount: 1,
          videoCount: isVideo ? 1 : 0,
          downloadCount: isVideo ? 0 : 1,
          viewedCount: viewed ? 1 : 0,
          completedCount: completed ? 1 : 0,
          isFree: r.is_free,
        });
      }
    }
    return Array.from(map.values());
  }, [resources]);

  const filtered = useMemo(() => {
    let out = topics;
    if (filter === "free") {
      out = out.filter((t) => t.isFree);
    } else if (filter !== "all") {
      out = out.filter((t) => categoryForSlug(t.slug) === filter);
    }
    if (q.trim()) {
      const lc = q.toLowerCase();
      out = out.filter(
        (t) =>
          t.title.toLowerCase().includes(lc) ||
          (t.summary ?? "").toLowerCase().includes(lc),
      );
    }
    return out;
  }, [topics, q, filter]);

  // Available filter chips — only show categories that actually have topics.
  const availableCategories = useMemo(() => {
    const set = new Set<TopicCategory>();
    for (const t of topics) set.add(categoryForSlug(t.slug));
    return Array.from(set);
  }, [topics]);

  const freeCount = topics.filter((t) => t.isFree).length;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="overline"
          sx={{
            color: "#A07823",
            fontSize: "0.62rem",
            letterSpacing: "0.18em",
            fontWeight: 700,
          }}
        >
          RESOURCE LIBRARY
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.5rem", md: "1.9rem" },
            fontWeight: 500,
            color: "#0A1A2F",
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
            mt: 0.5,
          }}
        >
          Resource Kits
        </Typography>
        <Typography
          sx={{ color: "#5C6770", fontSize: "0.88rem", mt: 0.75, maxWidth: 640, lineHeight: 1.6 }}
        >
          Practical, no-fluff training built for practice owners. Each kit is a complete topic
          pack — video training, action guide, worksheets, checklist, and ready-to-use templates.
        </Typography>
      </Box>

      {/* Filter + search row */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
      >
        {/* Filter chips */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          <FilterChip
            label="All"
            count={topics.length}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterChip
            label="Free"
            count={freeCount}
            active={filter === "free"}
            onClick={() => setFilter("free")}
            accent
          />
          {availableCategories
            .filter((c) => c !== "all")
            .map((c) => (
              <FilterChip
                key={c}
                label={CATEGORY_LABELS[c]}
                count={topics.filter((t) => categoryForSlug(t.slug) === c).length}
                active={filter === c}
                onClick={() => setFilter(c)}
              />
            ))}
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
                  <SearchOutlinedIcon sx={{ fontSize: 16, color: "#7A8590" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 280, "& .MuiInputBase-input": { fontSize: "0.84rem" } }}
        />
      </Stack>

      {/* Grid */}
      {loading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress size={22} sx={{ color: "#A07823" }} />
        </Stack>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            p: 5,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "common.white",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, mb: 0.5 }}>
            {q ? `No kits match "${q}".` : "No kits available in this filter."}
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
            Try a different filter or clear the search.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {filtered.map((t) => (
            <KitCard key={t.slug} topic={t} />
          ))}
        </Box>
      )}
    </Stack>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  accent,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <Chip
      label={
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {label}
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: "0.62rem",
              fontWeight: 700,
              opacity: 0.7,
            }}
          >
            {count}
          </Box>
        </Box>
      }
      onClick={onClick}
      sx={{
        height: 30,
        borderRadius: 999,
        px: 0.5,
        fontSize: "0.76rem",
        bgcolor: active
          ? accent
            ? "rgba(34,108,78,0.14)"
            : "#0A1A2F"
          : "common.white",
        color: active ? (accent ? "#1F5C40" : "common.white") : "#3B4A55",
        border: "1px solid",
        borderColor: active
          ? accent
            ? "rgba(34,108,78,0.4)"
            : "#0A1A2F"
          : "rgba(14,42,61,0.12)",
        cursor: "pointer",
        transition: "all 160ms ease",
        "&:hover": {
          bgcolor: active
            ? accent
              ? "rgba(34,108,78,0.18)"
              : "#0F2540"
            : "rgba(14,42,61,0.04)",
        },
        "& .MuiChip-label": { px: 1.25 },
      }}
    />
  );
}

function KitCard({ topic }: { topic: TopicCard }) {
  const visual = visualForTopic(topic.slug);
  const Icon = visual.icon;
  const progressPct =
    topic.resourceCount > 0
      ? Math.round((topic.viewedCount / topic.resourceCount) * 100)
      : 0;
  const inProgress = topic.viewedCount > 0 && topic.viewedCount < topic.resourceCount;
  const isCompleted = topic.completedCount === topic.resourceCount && topic.resourceCount > 0;

  return (
    <Box
      component={Link}
      href={`/dashboard/resources/${topic.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "common.white",
        border: "1px solid",
        borderColor: "divider",
        textDecoration: "none",
        color: "inherit",
        transition: "all 220ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 24px 48px -24px rgba(14,42,61,0.28)",
          borderColor: visual.accent,
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 9",
          backgroundImage: visual.gradient,
          overflow: "hidden",
        }}
      >
        {/* Decorative giant icon */}
        <Icon
          sx={{
            position: "absolute",
            right: -28,
            bottom: -28,
            fontSize: 220,
            color: visual.iconColor,
            opacity: 0.22,
            transform: "rotate(-12deg)",
          }}
        />
        {/* Top-left badges */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 1,
          }}
        >
          {topic.isFree && (
            <Box
              sx={{
                px: 1,
                py: 0.4,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.95)",
                color: "#1F5C40",
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Free
            </Box>
          )}
          {inProgress && (
            <Box
              sx={{
                px: 1,
                py: 0.4,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.95)",
                color: "#A07823",
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              In progress
            </Box>
          )}
          {isCompleted && (
            <Box
              sx={{
                px: 1,
                py: 0.4,
                borderRadius: 999,
                bgcolor: "rgba(34,108,78,0.95)",
                color: "#FFFFFF",
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              ✓ Completed
            </Box>
          )}
        </Stack>

        {/* Bottom-left label */}
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            left: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.6,
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            color: "#FFFFFF",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <PlayArrowRoundedIcon sx={{ fontSize: 14 }} />
          {topic.videoCount > 0 ? `${topic.videoCount} videos` : "Watch + read"}
        </Box>

        {/* Progress bar at bottom */}
        {topic.viewedCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: "rgba(255,255,255,0.18)",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${progressPct}%`,
                bgcolor: visual.accent,
                transition: "width 200ms ease",
              }}
            />
          </Box>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            fontSize: "0.56rem",
            letterSpacing: "0.16em",
            fontWeight: 800,
            color: visual.accent,
            display: "block",
            mb: 0.5,
          }}
        >
          RESOURCE KIT
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.08rem",
            fontWeight: 500,
            color: "#0A1A2F",
            lineHeight: 1.22,
            mb: 0.75,
            letterSpacing: "-0.005em",
          }}
        >
          {topic.title}
        </Typography>
        {topic.summary && (
          <Typography
            sx={{
              fontSize: "0.78rem",
              color: "#5C6770",
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1.5,
              flex: 1,
            }}
          >
            {topic.summary}
          </Typography>
        )}

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mt: "auto",
            pt: 1.25,
            borderTop: "1px solid",
            borderColor: "rgba(14,42,61,0.06)",
          }}
        >
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
            {topic.resourceCount} {topic.resourceCount === 1 ? "resource" : "resources"}
            {topic.viewedCount > 0 ? ` · ${topic.viewedCount} done` : ""}
          </Typography>
          <Box
            sx={{
              fontSize: "0.74rem",
              color: visual.accent,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            Open kit <ArrowForwardIcon sx={{ fontSize: 13 }} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
