"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
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
import {
  EditorialHeader,
  InlineTag,
  editorialText,
  ink,
} from "@/components/member/Editorial";

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

  const availableCategories = useMemo(() => {
    const set = new Set<TopicCategory>();
    for (const t of topics) set.add(categoryForSlug(t.slug));
    return Array.from(set);
  }, [topics]);

  const freeCount = topics.filter((t) => t.isFree).length;

  return (
    <Box sx={{ color: ink.primary }}>
      <EditorialHeader
        index="02"
        eyebrow="Resource library"
        title="Kits for practice owners"
        standfirst="Each kit is a topic pack — training video, action guide, worksheets, checklist, and ready-to-use templates. Stream the video, download the rest."
      />

      {/* Filter row — text-link style filters (editorial, no bulky chips) */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { md: "center" },
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 2, rowGap: 1 }}>
          <FilterLink
            label="All"
            count={topics.length}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterLink
            label="Free"
            count={freeCount}
            active={filter === "free"}
            onClick={() => setFilter("free")}
            tone="leaf"
          />
          {availableCategories
            .filter((c) => c !== "all")
            .map((c) => (
              <FilterLink
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
          placeholder="Search kits"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          variant="standard"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ fontSize: 15, color: ink.fade }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            maxWidth: 240,
            "& .MuiInputBase-input": { fontSize: "0.84rem", py: 0.5 },
            "& .MuiInput-underline:before": { borderBottomColor: "var(--paper-rule)" },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottomColor: "var(--ink-rule)",
            },
            "& .MuiInput-underline:after": { borderBottomColor: "var(--gold)" },
          }}
        />
      </Stack>

      {/* Grid — sparser, editorial */}
      {loading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress size={20} sx={{ color: "var(--gold)" }} />
        </Stack>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            borderTop: "1px solid var(--paper-rule)",
            borderBottom: "1px solid var(--paper-rule)",
          }}
        >
          <Typography sx={{ ...editorialText.heading, mb: 0.5 }}>
            {q ? `No kits match "${q}"` : "No kits in this filter"}
          </Typography>
          <Typography sx={editorialText.meta}>
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
            gap: { xs: 2.5, md: 3 },
            rowGap: { xs: 3, md: 4 },
          }}
        >
          {filtered.map((t) => (
            <KitTile key={t.slug} topic={t} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function FilterLink({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "leaf";
}) {
  const activeColor = tone === "leaf" ? "var(--leaf)" : "var(--ink)";
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
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.5,
        py: 0.5,
        cursor: "pointer",
        userSelect: "none",
        color: active ? activeColor : ink.fade,
        borderBottom: active ? `1px solid ${activeColor}` : "1px solid transparent",
        fontSize: "0.82rem",
        fontWeight: active ? 700 : 500,
        letterSpacing: active ? "-0.005em" : "0",
        transition: "color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
        "&:hover": { color: activeColor },
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: 2 },
      }}
    >
      <span>{label}</span>
      <Box component="span" sx={{ fontSize: "0.66rem", opacity: 0.6, fontWeight: 600 }}>
        {count}
      </Box>
    </Box>
  );
}

function KitTile({ topic }: { topic: TopicCard }) {
  const visual = visualForTopic(topic.slug);
  const Icon = visual.icon;
  const progressPct =
    topic.resourceCount > 0
      ? Math.round((topic.viewedCount / topic.resourceCount) * 100)
      : 0;
  const inProgress = topic.viewedCount > 0 && topic.viewedCount < topic.resourceCount;
  const completed = topic.completedCount === topic.resourceCount && topic.resourceCount > 0;
  const category = CATEGORY_LABELS[categoryForSlug(topic.slug)];

  return (
    <Box
      component={Link}
      href={`/dashboard/resources/${topic.slug}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        transition: "transform var(--dur-base) var(--ease-out)",
        "&:hover": { transform: "translateY(-2px)" },
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: 4, borderRadius: "4px" },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 10",
          backgroundImage: visual.gradient,
          overflow: "hidden",
          borderRadius: 1,
          mb: 1.25,
        }}
      >
        <Icon
          sx={{
            position: "absolute",
            right: -18,
            bottom: -18,
            fontSize: 160,
            color: visual.iconColor,
            opacity: 0.2,
            transform: "rotate(-10deg)",
          }}
        />
        {topic.videoCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "var(--paper)",
                color: "var(--ink)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 6px 18px -8px rgba(0,0,0,0.35)",
              }}
            >
              <PlayArrowRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
          </Box>
        )}

        {/* Top-left badges, with safe inset */}
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ position: "absolute", top: 10, left: 10 }}
        >
          {topic.isFree && <InlineTag label="Free" tone="leaf" />}
          {completed && <InlineTag label="Done" tone="ink" />}
          {inProgress && !completed && <InlineTag label="In progress" tone="gold" />}
        </Stack>

        {/* Bottom-right meta */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            px: 0.85,
            py: 0.25,
            borderRadius: 0.5,
            bgcolor: "rgba(20,30,42,0.78)",
            color: "var(--paper)",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {topic.videoCount > 0
            ? `${topic.videoCount} ${topic.videoCount === 1 ? "video" : "videos"}`
            : `${topic.resourceCount} items`}
        </Box>

        {topic.viewedCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              bgcolor: "rgba(255,255,255,0.18)",
            }}
          >
            <Box sx={{ height: "100%", width: `${progressPct}%`, bgcolor: visual.accent }} />
          </Box>
        )}
      </Box>

      {/* Body */}
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "baseline", mb: 0.5 }}>
        <Box
          component="span"
          className="hk-numeral"
          sx={{ fontSize: "0.74rem", color: "var(--gold)", lineHeight: 1 }}
        >
          ¶
        </Box>
        <Typography sx={{ ...editorialText.eyebrow, color: ink.fade }}>{category}</Typography>
      </Stack>
      <Typography
        sx={{
          ...editorialText.heading,
          fontSize: { xs: "1.05rem", md: "1.1rem" },
          mb: 0.5,
        }}
      >
        {topic.title}
      </Typography>
      {topic.summary && (
        <Typography
          sx={{
            ...editorialText.body,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1,
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
          pt: 1,
          borderTop: "1px solid var(--paper-rule)",
        }}
      >
        <Typography sx={editorialText.meta}>
          {topic.resourceCount} {topic.resourceCount === 1 ? "item" : "items"}
          {topic.viewedCount > 0 ? ` · ${topic.viewedCount} done` : ""}
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.4,
            fontSize: "0.73rem",
            fontWeight: 700,
            color: "var(--gold-deep)",
          }}
        >
          Open <ArrowForwardIcon sx={{ fontSize: 12 }} />
        </Box>
      </Stack>
    </Box>
  );
}
