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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  categoryForSlug,
  CATEGORY_LABELS,
  type TopicCategory,
} from "@/components/member/topicVisuals";
import { KitCover } from "@/components/member/KitCover";
import {
  EditorialHeader,
  editorialText,
  ink,
} from "@/components/member/Editorial";

type ResourceItem = {
  id: string;
  topic_slug: string;
  topic_title: string;
  topic_summary: string | null;
  topic_thumbnail_url: string | null;
  title: string;
  kind: string;
  is_free: boolean;
  progress: { last_viewed_at: string | null; completed_at: string | null } | null;
};

type TopicCard = {
  slug: string;
  title: string;
  summary: string | null;
  coverUrl: string | null;
  resourceCount: number;
  videoCount: number;
  downloadCount: number;
  viewedCount: number;
  completedCount: number;
  isFree: boolean;
};

type FilterKey = "all" | "free" | TopicCategory;

const PAGE_SIZE = 9;

export default function ResourceLibraryPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilterState] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

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

  // Wrap filter & query setters so the page resets at the same time the user
  // changes them — avoids a separate effect that would cause a cascading render.
  const setFilter = (k: FilterKey) => {
    setFilterState(k);
    setPage(1);
  };
  const setQuery = (next: string) => {
    setQ(next);
    setPage(1);
  };

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
          coverUrl: r.topic_thumbnail_url,
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const availableCategories = useMemo(() => {
    const set = new Set<TopicCategory>();
    for (const t of topics) set.add(categoryForSlug(t.slug));
    return Array.from(set);
  }, [topics]);

  const freeCount = topics.filter((t) => t.isFree).length;

  return (
    <Box sx={{ color: ink.primary }}>
      <EditorialHeader
        eyebrow="Resource library"
        title="Kits for practice owners"
        standfirst="Each kit is a topic pack — training video, action guide, worksheets, checklist, and ready-to-use templates. Stream the video, download the rest."
      />

      {/* Filter row */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { md: "center" },
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 2.5, rowGap: 1 }}>
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
          onChange={(e) => setQuery(e.target.value)}
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

      {/* Grid */}
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
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: { xs: 3, md: 3.5 },
              rowGap: { xs: 3.5, md: 4 },
            }}
          >
            {pageItems.map((t) => (
              <KitTile key={t.slug} topic={t} />
            ))}
          </Box>

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          )}
        </>
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
        transition:
          "color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
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
        "&:focus-visible": {
          outline: "2px solid var(--gold)",
          outlineOffset: 4,
          borderRadius: "4px",
        },
      }}
    >
      <Box sx={{ mb: 1.5 }}>
        <KitCover
          slug={topic.slug}
          title={topic.title}
          videoCount={topic.videoCount}
          resourceCount={topic.resourceCount}
          isFree={topic.isFree}
          completed={completed}
          inProgress={inProgress}
          progressPct={progressPct}
          coverUrl={topic.coverUrl}
        />
      </Box>

      <Typography sx={{ ...editorialText.eyebrow, color: ink.fade, mb: 0.5 }}>
        {category}
      </Typography>
      {topic.summary && (
        <Typography
          sx={{
            ...editorialText.body,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1.25,
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

function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goPrev = () => {
    if (canPrev) {
      onChange(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const goNext = () => {
    if (canNext) {
      onChange(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Build page numbers (with ellipsis around current page when many pages)
  const pageNumbers: Array<number | "…"> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (page > 3) pageNumbers.push("…");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (page < totalPages - 2) pageNumbers.push("…");
    pageNumbers.push(totalPages);
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{
        mt: 4,
        pt: 2,
        borderTop: "1px solid var(--paper-rule)",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={editorialText.meta}>
        Showing {from}–{to} of {totalItems}
      </Typography>

      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <PageButton onClick={goPrev} disabled={!canPrev} ariaLabel="Previous page">
          <ArrowBackIcon sx={{ fontSize: 13 }} /> Prev
        </PageButton>

        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.25, mx: 1 }}>
          {pageNumbers.map((p, i) =>
            p === "…" ? (
              <Box
                key={`gap-${i}`}
                sx={{ px: 0.75, color: "var(--ink-fade)", fontSize: "0.78rem" }}
              >
                …
              </Box>
            ) : (
              <PageNumber
                key={p}
                page={p}
                active={p === page}
                onClick={() => {
                  onChange(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ),
          )}
        </Box>

        {/* Mobile compact indicator */}
        <Box
          sx={{
            display: { xs: "inline-flex", sm: "none" },
            mx: 1,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          {page} / {totalPages}
        </Box>

        <PageButton onClick={goNext} disabled={!canNext} ariaLabel="Next page">
          Next <ArrowForwardIcon sx={{ fontSize: 13 }} />
        </PageButton>
      </Stack>
    </Stack>
  );
}

function PageButton({
  onClick,
  disabled,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        height: 30,
        px: 1.25,
        bgcolor: "transparent",
        border: "1px solid var(--paper-rule)",
        borderRadius: 0.5,
        color: disabled ? "var(--ink-fade)" : "var(--ink)",
        fontSize: "0.76rem",
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition:
          "background-color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
        "&:hover": disabled
          ? {}
          : {
              borderColor: "var(--ink)",
              bgcolor: "color-mix(in oklch, var(--ink) 4%, transparent)",
            },
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: 2 },
      }}
    >
      {children}
    </Box>
  );
}

function PageNumber({
  page,
  active,
  onClick,
}: {
  page: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={`Page ${page}`}
      aria-current={active ? "page" : undefined}
      sx={{
        minWidth: 30,
        height: 30,
        bgcolor: active ? "var(--ink)" : "transparent",
        color: active ? "var(--paper)" : "var(--ink)",
        border: "1px solid",
        borderColor: active ? "var(--ink)" : "transparent",
        borderRadius: 0.5,
        fontSize: "0.78rem",
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: "pointer",
        transition:
          "background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
        "&:hover": active
          ? {}
          : { bgcolor: "color-mix(in oklch, var(--ink) 6%, transparent)" },
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: 2 },
      }}
    >
      {page}
    </Box>
  );
}
