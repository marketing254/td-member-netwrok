"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import { visualForTopic } from "@/components/member/topicVisuals";
import {
  InlineTag,
  editorialText,
  ink,
} from "@/components/member/Editorial";

type Progress = {
  last_viewed_at: string | null;
  completed_at: string | null;
  watch_seconds: number;
};

type ResourceItem = {
  id: string;
  topic_slug: string;
  topic_title: string;
  topic_summary: string | null;
  title: string;
  description: string | null;
  kind: string;
  storage_path: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  duration_label: string | null;
  position: number;
  is_free: boolean;
  progress: Progress | null;
};

type RouteParams = Promise<{ slug: string }>;

const KIND_META: Record<
  string,
  {
    icon: SvgIconComponent;
    defaultMeta: string;
    actionLabel: string;
    badge: string;
  }
> = {
  video_intro: { icon: OndemandVideoOutlinedIcon, defaultMeta: "Short intro video", actionLabel: "Watch", badge: "Video" },
  video_full: { icon: PlayArrowRoundedIcon, defaultMeta: "Full training session", actionLabel: "Watch", badge: "Training" },
  video_explainer: { icon: OndemandVideoOutlinedIcon, defaultMeta: "Explainer video", actionLabel: "Watch", badge: "Explainer" },
  video_trailer: { icon: OndemandVideoOutlinedIcon, defaultMeta: "Trailer", actionLabel: "Watch", badge: "Trailer" },
  audio: { icon: HeadphonesOutlinedIcon, defaultMeta: "Audio episode", actionLabel: "Listen", badge: "Audio" },
  action_guide: { icon: ListAltOutlinedIcon, defaultMeta: "PDF · the full reference", actionLabel: "Download", badge: "PDF" },
  checklist: { icon: ChecklistOutlinedIcon, defaultMeta: "PDF · set up → track → review", actionLabel: "Download", badge: "PDF" },
  key_takeaways: { icon: StickyNote2OutlinedIcon, defaultMeta: "PDF · the gist in 2 minutes", actionLabel: "Download", badge: "PDF" },
  worksheet: { icon: EditNoteOutlinedIcon, defaultMeta: "PDF · fillable", actionLabel: "Download", badge: "PDF" },
  slide_deck: { icon: SlideshowOutlinedIcon, defaultMeta: "Slide deck · PowerPoint", actionLabel: "Download", badge: "Slides" },
  email_sequence: { icon: EmailOutlinedIcon, defaultMeta: "PDF · ready-to-send scripts", actionLabel: "Download", badge: "PDF" },
  other: { icon: InsertDriveFileOutlinedIcon, defaultMeta: "File", actionLabel: "Open", badge: "File" },
};

function isVideo(kind: string): boolean {
  return kind.startsWith("video_") || kind === "audio";
}

function formatSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 900) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function buildMeta(r: ResourceItem): string {
  const k = KIND_META[r.kind] ?? KIND_META.other;
  const parts: string[] = [];
  if (r.duration_label) parts.push(r.duration_label);
  parts.push(k.defaultMeta);
  const size = formatSize(r.file_size_bytes);
  if (size) parts.push(size);
  return parts.join(" · ");
}

async function markProgress(resourceId: string, action: "view" | "complete") {
  try {
    await fetch(`/api/member/resources/${resourceId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  } catch {
    /* silent */
  }
}

function romanize(n: number): string {
  // i ii iii iv v vi vii viii ix x — falls back to digit beyond 10
  const lookup = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
  return lookup[n - 1] ?? String(n);
}

export default function ResourceKitDetailPage({ params }: { params: RouteParams }) {
  const { slug } = use(params);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/member/resources?topic_slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
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
  }, [slug]);

  const visual = visualForTopic(slug);
  const TopicIcon = visual.icon;

  const orderedResources = useMemo(() => {
    const order = [
      "video_intro",
      "video_full",
      "video_explainer",
      "video_trailer",
      "audio",
      "action_guide",
      "checklist",
      "key_takeaways",
      "worksheet",
      "slide_deck",
      "email_sequence",
      "other",
    ];
    return [...resources].sort((a, b) => {
      const ai = order.indexOf(a.kind);
      const bi = order.indexOf(b.kind);
      if (ai !== bi) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      return a.position - b.position;
    });
  }, [resources]);

  const videos = useMemo(() => orderedResources.filter((r) => isVideo(r.kind)), [orderedResources]);
  const downloads = useMemo(() => orderedResources.filter((r) => !isVideo(r.kind)), [orderedResources]);

  useEffect(() => {
    if (activeId) return;
    const firstVideo = videos.find((v) => v.external_url) ?? videos[0];
    if (firstVideo) setActiveId(firstVideo.id);
  }, [videos, activeId]);

  const activeResource = useMemo(
    () => orderedResources.find((r) => r.id === activeId) ?? null,
    [orderedResources, activeId],
  );

  const topicTitle = resources[0]?.topic_title ?? "Resource Kit";
  const topicSummary = resources[0]?.topic_summary ?? null;
  const isFree = resources.length > 0 && resources.every((r) => r.is_free);
  const viewedCount = resources.filter((r) => r.progress?.last_viewed_at).length;
  const progressPct = resources.length > 0 ? Math.round((viewedCount / resources.length) * 100) : 0;

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress size={22} sx={{ color: "var(--gold)" }} />
      </Stack>
    );
  }

  if (resources.length === 0) {
    return (
      <Stack spacing={2.5}>
        <BackLink />
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            borderTop: "1px solid var(--paper-rule)",
            borderBottom: "1px solid var(--paper-rule)",
          }}
        >
          <Typography sx={{ ...editorialText.heading, mb: 0.5 }}>Kit not found</Typography>
          <Typography sx={editorialText.meta}>
            This resource kit isn&apos;t published yet, or the URL is wrong.
          </Typography>
        </Box>
      </Stack>
    );
  }

  const playLesson = (r: ResourceItem) => {
    setActiveId(r.id);
    void markProgress(r.id, "view");
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.load();
        void videoRef.current.play().catch(() => {});
      }
    });
  };

  return (
    <Box sx={{ color: ink.primary }}>
      <BackLink />

      {/* Editorial header (numbered, no nav-card) */}
      <Box sx={{ pb: 2.5, mb: 2.5, borderBottom: "1px solid var(--ink-rule)" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" } }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "baseline", mb: 1 }}>
              <Box
                component="span"
                className="hk-numeral"
                sx={{ fontSize: "1.05rem", color: "var(--gold)" }}
              >
                Kit
              </Box>
              <Typography sx={editorialText.eyebrow}>{topicTitle ? "Resource pack" : "—"}</Typography>
              {isFree && <InlineTag label="Free" tone="leaf" />}
            </Stack>
            <Typography component="h1" sx={editorialText.display}>
              {topicTitle}
            </Typography>
            {topicSummary && (
              <Typography sx={{ ...editorialText.body, mt: 1, maxWidth: 620 }}>
                {topicSummary}
              </Typography>
            )}
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ ...editorialText.eyebrow, mb: 0.75 }}>Your progress</Typography>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 140,
                  height: 3,
                  bgcolor: "var(--paper-rule)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${progressPct}%`,
                    bgcolor: "var(--leaf)",
                    transition: "width var(--dur-slow) var(--ease-out)",
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: ink.primary }}>
                {viewedCount}/{resources.length}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* PLAYER COLUMN */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
            <Box>
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  bgcolor: "var(--ink)",
                  backgroundImage: activeResource && isVideo(activeResource.kind) ? "none" : visual.gradient,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  borderRadius: 1,
                }}
              >
                {activeResource && isVideo(activeResource.kind) && activeResource.external_url ? (
                  <video
                    ref={videoRef}
                    src={activeResource.external_url}
                    controls
                    playsInline
                    onPlay={() => void markProgress(activeResource.id, "view")}
                    onEnded={() => void markProgress(activeResource.id, "complete")}
                    style={{ width: "100%", height: "100%", display: "block", background: "#000" }}
                  />
                ) : (
                  <Stack spacing={1.5} sx={{ alignItems: "center", color: "var(--paper)", textAlign: "center", px: 3 }}>
                    <TopicIcon sx={{ fontSize: 56, color: visual.iconColor, opacity: 0.95 }} />
                    <Typography
                      sx={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.05rem",
                        color: "var(--paper)",
                        lineHeight: 1.2,
                      }}
                    >
                      {activeResource ? activeResource.title : "Pick a lesson to begin"}
                    </Typography>
                    {activeResource && !isVideo(activeResource.kind) && (
                      <Button
                        component="a"
                        href={activeResource.external_url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        onClick={() => void markProgress(activeResource.id, "view")}
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          bgcolor: "var(--paper)",
                          color: "var(--ink)",
                          textTransform: "none",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          borderRadius: 0.5,
                          px: 1.75,
                          "&:hover": { bgcolor: "color-mix(in oklch, var(--paper) 90%, var(--gold))" },
                        }}
                      >
                        Download {KIND_META[activeResource.kind]?.badge ?? "file"}
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>

              {/* Active lesson meta */}
              {activeResource && (
                <Box sx={{ pt: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                    <InlineTag label={KIND_META[activeResource.kind]?.badge ?? "Item"} tone="ink" />
                    {activeResource.duration_label && (
                      <Typography sx={editorialText.meta}>{activeResource.duration_label}</Typography>
                    )}
                    {activeResource.progress?.completed_at && (
                      <Stack direction="row" spacing={0.4} sx={{ alignItems: "center" }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 14, color: "var(--leaf)" }} />
                        <Typography sx={{ fontSize: "0.7rem", color: "var(--leaf)", fontWeight: 700 }}>
                          Completed
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                  <Typography sx={{ ...editorialText.heading, mb: 0.5 }}>
                    {activeResource.title}
                  </Typography>
                  {activeResource.description && (
                    <Typography sx={editorialText.body}>{activeResource.description}</Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Downloads */}
            {downloads.length > 0 && (
              <Box>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline", mb: 1.5 }}>
                  <Box
                    component="span"
                    className="hk-numeral"
                    sx={{ fontSize: "0.92rem", color: "var(--gold)" }}
                  >
                    ii
                  </Box>
                  <Box aria-hidden sx={{ width: 18, height: "1px", bgcolor: "var(--ink-rule)" }} />
                  <Typography sx={editorialText.eyebrow}>Kit downloads</Typography>
                </Stack>
                <Typography sx={{ ...editorialText.heading, mb: 1.5 }}>
                  Done-for-you PDFs, worksheets, and templates
                </Typography>
                <Stack>
                  {downloads.map((r, i) => (
                    <DownloadRow key={r.id} resource={r} numeral={romanize(i + 1)} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* CURRICULUM COLUMN */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline", mb: 1.5 }}>
              <Box
                component="span"
                className="hk-numeral"
                sx={{ fontSize: "0.92rem", color: "var(--gold)" }}
              >
                i
              </Box>
              <Box aria-hidden sx={{ width: 18, height: "1px", bgcolor: "var(--ink-rule)" }} />
              <Typography sx={editorialText.eyebrow}>Curriculum</Typography>
            </Stack>
            <Typography sx={{ ...editorialText.heading, mb: 0.25 }}>
              {orderedResources.length} {orderedResources.length === 1 ? "item" : "items"} in this kit
            </Typography>
            <Typography sx={{ ...editorialText.meta, mb: 1.5 }}>
              Stream the videos. Download the rest.
            </Typography>

            <Box sx={{ borderTop: "1px solid var(--ink-rule)" }}>
              {orderedResources.map((r, idx) => (
                <CurriculumRow
                  key={r.id}
                  index={idx + 1}
                  resource={r}
                  active={r.id === activeId}
                  onSelect={() => {
                    if (isVideo(r.kind) && r.external_url) {
                      playLesson(r);
                    } else if (r.external_url) {
                      setActiveId(r.id);
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function BackLink() {
  return (
    <Box
      component={Link}
      href="/dashboard/resources"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        mb: 2,
        fontSize: "0.74rem",
        letterSpacing: "0.06em",
        color: ink.fade,
        textDecoration: "none",
        transition: "color var(--dur-fast) var(--ease-out)",
        "&:hover": { color: ink.primary },
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: 2 },
      }}
    >
      <ArrowBackIcon sx={{ fontSize: 13 }} /> All kits
    </Box>
  );
}

function CurriculumRow({
  index,
  resource,
  active,
  onSelect,
}: {
  index: number;
  resource: ResourceItem;
  active: boolean;
  onSelect: () => void;
}) {
  const k = KIND_META[resource.kind] ?? KIND_META.other;
  const Icon = k.icon;
  const isVid = isVideo(resource.kind);
  const completed = !!resource.progress?.completed_at;
  const viewed = !!resource.progress?.last_viewed_at;
  const hasUrl = !!resource.external_url;

  return (
    <Box
      role="button"
      tabIndex={hasUrl ? 0 : -1}
      onClick={hasUrl ? onSelect : undefined}
      onKeyDown={(e) => {
        if (hasUrl && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        py: 1.25,
        px: active ? 1.25 : 0.5,
        cursor: hasUrl ? "pointer" : "default",
        bgcolor: active ? "color-mix(in oklch, var(--gold) 8%, transparent)" : "transparent",
        borderBottom: "1px solid var(--paper-rule)",
        transition: "background-color var(--dur-fast) var(--ease-out)",
        "&:hover": hasUrl ? { bgcolor: active ? "color-mix(in oklch, var(--gold) 12%, transparent)" : "color-mix(in oklch, var(--ink) 4%, transparent)" } : {},
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: -2 },
      }}
    >
      <Box
        component="span"
        className="hk-numeral"
        sx={{
          minWidth: 22,
          fontSize: "0.85rem",
          color: completed ? "var(--leaf)" : active ? "var(--gold-deep)" : ink.fade,
          pt: 0.2,
          textAlign: "right",
        }}
      >
        {completed ? "✓" : romanize(index)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.25 }}>
          <Icon sx={{ fontSize: 11, color: ink.fade }} />
          <Typography
            sx={{
              fontSize: "0.58rem",
              fontWeight: 700,
              color: ink.fade,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {k.badge}
          </Typography>
          {resource.duration_label && (
            <Typography sx={{ fontSize: "0.66rem", color: ink.fade }}>
              · {resource.duration_label}
            </Typography>
          )}
        </Stack>
        <Typography
          sx={{
            fontSize: "0.84rem",
            fontWeight: active ? 700 : 500,
            color: ink.primary,
            lineHeight: 1.3,
          }}
        >
          {resource.title}
        </Typography>
      </Box>
      {isVid ? (
        <PlayArrowRoundedIcon sx={{ fontSize: 16, color: active ? "var(--gold-deep)" : ink.fade, mt: 0.25 }} />
      ) : (
        <DownloadOutlinedIcon sx={{ fontSize: 13, color: viewed ? "var(--leaf)" : ink.fade, mt: 0.4 }} />
      )}
    </Box>
  );
}

function DownloadRow({ resource, numeral }: { resource: ResourceItem; numeral: string }) {
  const k = KIND_META[resource.kind] ?? KIND_META.other;
  const Icon = k.icon;
  const url = resource.external_url ?? "";
  const meta = buildMeta(resource);
  const completed = !!resource.progress?.completed_at;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        borderTop: "1px solid var(--paper-rule)",
        "&:last-of-type": { borderBottom: "1px solid var(--paper-rule)" },
      }}
    >
      <Box
        component="span"
        className="hk-numeral"
        sx={{
          minWidth: 22,
          fontSize: "0.85rem",
          color: completed ? "var(--leaf)" : ink.fade,
          textAlign: "right",
        }}
      >
        {completed ? "✓" : numeral}
      </Box>
      <Icon sx={{ fontSize: 18, color: ink.soft, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.15 }}>
          <InlineTag label={k.badge} tone="neutral" />
        </Stack>
        <Typography
          sx={{ fontSize: "0.86rem", fontWeight: 600, color: ink.primary, lineHeight: 1.3 }}
          noWrap
        >
          {resource.title}
        </Typography>
        <Typography sx={{ ...editorialText.meta, mt: 0.15 }} noWrap>
          {meta}
        </Typography>
      </Box>
      <Button
        component="a"
        href={url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        download
        onClick={() => void markProgress(resource.id, "view")}
        disabled={!url}
        variant="text"
        size="small"
        endIcon={<DownloadOutlinedIcon sx={{ fontSize: 13 }} />}
        sx={{
          color: "var(--gold-deep)",
          fontSize: "0.74rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          flexShrink: 0,
          transition: "color var(--dur-fast) var(--ease-out)",
          "&:hover": { bgcolor: "transparent", color: "var(--ink)" },
          "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: 2 },
        }}
      >
        Download
      </Button>
    </Box>
  );
}
