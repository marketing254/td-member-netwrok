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
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
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
import { InlineTag, editorialText, ink } from "@/components/member/Editorial";
import { BookCoachingCard } from "@/components/member/BookCoachingCard";

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
  category: string | null;
  portal_card_url: string | null;
  resource_card_url: string | null;
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

/**
 * Kinds that always render as PDF in the inline iframe (regardless of
 * mime_type), kept for resources that the upload pipeline classifies into
 * one of these even when the file extension is missing or weird.
 */
const PDF_KINDS = new Set([
  "action_guide",
  "checklist",
  "key_takeaways",
  "worksheet",
  "email_sequence",
]);

/**
 * Any application/pdf file previews inline, regardless of its kind.
 * (Wall Poster.pdf is kind='other' but is still a PDF; we want it to render.)
 */
function isPdf(r: { kind: string; mime_type: string | null }): boolean {
  return PDF_KINDS.has(r.kind) || r.mime_type === "application/pdf";
}

/**
 * PowerPoint slide decks — browsers can't render .pptx natively, but
 * Microsoft Office Online has a free public embed viewer that does.
 * Only the .pptx file itself gets the Office viewer; the matching .pdf
 * version (also classified as slide_deck) is handled by the PDF path.
 */
function isOffice(r: { kind: string; mime_type: string | null }): boolean {
  return (
    r.kind === "slide_deck" &&
    r.mime_type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
}

/**
 * Anything we can show inline in the player canvas (with the right iframe).
 */
function isPreviewable(r: { kind: string; mime_type: string | null }): boolean {
  return isPdf(r) || isOffice(r);
}

/**
 * Build the iframe src for a previewable file:
 *   - PDFs: Supabase URL directly with native PDF reader hash params
 *   - .pptx slide decks: Microsoft Office Online embed viewer wrapping the URL
 */
function previewSrc(r: { kind: string; mime_type: string | null }, url: string): string {
  if (isOffice(r)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }
  return `${url}#view=FitH&toolbar=1`;
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

  // Derive the active resource. When the user hasn't picked anything explicitly
  // (activeId === null), fall back to the first playable video so the player
  // has something to show as soon as the kit loads.
  const fallbackActiveId = useMemo(() => {
    const firstVideo = videos.find((v) => v.external_url) ?? videos[0];
    return firstVideo?.id ?? null;
  }, [videos]);
  const effectiveActiveId = activeId ?? fallbackActiveId;
  const activeResource = useMemo(
    () => orderedResources.find((r) => r.id === effectiveActiveId) ?? null,
    [orderedResources, effectiveActiveId],
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

      {/* Header — title + tags + progress meter (one balanced row) */}
      <Box sx={{ pb: 2.5, mb: 3, borderBottom: "1px solid var(--ink-rule)" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" } }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 1 }}>
              <Typography sx={editorialText.eyebrow}>Resource kit</Typography>
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
          <Box sx={{ flexShrink: 0, minWidth: 160 }}>
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

      {/* PLAYER + CURRICULUM — Udemy-style balanced split */}
      <Grid container spacing={{ xs: 3, lg: 4 }}>
        {/* Player column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box>
            <Box
              sx={{
                position: "relative",
                ...(activeResource &&
                isPreviewable(activeResource) &&
                activeResource.external_url
                  ? { height: { xs: 520, md: 720 } }
                  : { aspectRatio: "16 / 9" }),
                bgcolor: "var(--ink)",
                backgroundImage:
                  activeResource &&
                  (isVideo(activeResource.kind) || isPreviewable(activeResource))
                    ? "none"
                    : visual.gradient,
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
              ) : activeResource &&
                isPreviewable(activeResource) &&
                activeResource.external_url ? (
                <Box
                  component="iframe"
                  // key forces a remount when switching between previewable lessons,
                  // so the iframe loads the new URL even if React would otherwise reuse it.
                  key={activeResource.id}
                  src={previewSrc(activeResource, activeResource.external_url)}
                  title={activeResource.title}
                  onLoad={() => void markProgress(activeResource.id, "view")}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: 0,
                    bgcolor: "#FFFFFF",
                  }}
                />
              ) : (
                <Stack
                  spacing={1.5}
                  sx={{ alignItems: "center", color: "var(--paper)", textAlign: "center", px: 3 }}
                >
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
                  {activeResource &&
                    !isVideo(activeResource.kind) &&
                    !isPreviewable(activeResource) && (
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.7)",
                          maxWidth: 320,
                        }}
                      >
                        This file format can&apos;t be previewed inline. Use the Download
                        button below to grab it.
                      </Typography>
                    )}
                </Stack>
              )}
            </Box>

            {/* Active lesson meta + actions */}
            {activeResource && (
              <Box sx={{ pt: 2 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                  <InlineTag
                    label={KIND_META[activeResource.kind]?.badge ?? "Item"}
                    tone="ink"
                  />
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
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.25, sm: 2 }}
                  sx={{ alignItems: { sm: "flex-start" }, justifyContent: "space-between" }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ ...editorialText.heading, mb: 0.5 }}>
                      {activeResource.title}
                    </Typography>
                    {activeResource.description && (
                      <Typography sx={editorialText.body}>{activeResource.description}</Typography>
                    )}
                  </Box>
                  {/* Action buttons — for any non-video item that has a URL */}
                  {!isVideo(activeResource.kind) && activeResource.external_url && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexShrink: 0, flexWrap: "wrap", rowGap: 1 }}
                    >
                      {isPreviewable(activeResource) && (
                        <Button
                          component="a"
                          href={activeResource.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                          size="small"
                          disableElevation
                          startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            borderColor: "var(--paper-rule)",
                            color: "var(--ink)",
                            textTransform: "none",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            borderRadius: 0.5,
                            px: 1.5,
                            py: 0.6,
                            "&:hover": {
                              borderColor: "var(--gold)",
                              bgcolor: "color-mix(in oklch, var(--gold) 6%, transparent)",
                            },
                            "&:focus-visible": {
                              outline: "2px solid var(--gold)",
                              outlineOffset: 2,
                            },
                          }}
                        >
                          Open in new tab
                        </Button>
                      )}
                      <Button
                        component="a"
                        href={activeResource.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        onClick={() => void markProgress(activeResource.id, "view")}
                        variant="contained"
                        size="small"
                        disableElevation
                        startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          bgcolor: "var(--ink)",
                          color: "var(--paper)",
                          textTransform: "none",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          borderRadius: 0.5,
                          px: 1.5,
                          py: 0.6,
                          "&:hover": {
                            bgcolor: "color-mix(in oklch, var(--ink) 90%, white)",
                          },
                          "&:focus-visible": {
                            outline: "2px solid var(--gold)",
                            outlineOffset: 2,
                          },
                        }}
                      >
                        Download
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Curriculum column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", mb: 0.5 }}>
              <Typography sx={editorialText.eyebrow}>Curriculum</Typography>
              <Box
                aria-hidden
                sx={{ flex: 1, height: "1px", bgcolor: "var(--paper-rule)" }}
              />
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}
            >
              <Typography sx={editorialText.heading}>
                {orderedResources.length} {orderedResources.length === 1 ? "item" : "items"}
              </Typography>
              <Typography sx={editorialText.meta}>
                {videos.length} video{videos.length === 1 ? "" : "s"} · {downloads.length} file
                {downloads.length === 1 ? "" : "s"}
              </Typography>
            </Stack>

            <Box>
              {orderedResources.map((r, idx) => (
                <CurriculumRow
                  key={r.id}
                  index={idx + 1}
                  resource={r}
                  active={r.id === effectiveActiveId}
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

      {/* 1-on-1 coaching booking — every kit page surfaces this so members
          can take what they just learned into a focused call with Gary. */}
      <Box sx={{ mt: { xs: 4, lg: 5 } }}>
        <BookCoachingCard topicTitle={topicTitle} />
      </Box>
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
        px: active ? 1.25 : 0.25,
        cursor: hasUrl ? "pointer" : "default",
        bgcolor: active ? "color-mix(in oklch, var(--gold) 8%, transparent)" : "transparent",
        borderBottom: "1px solid var(--paper-rule)",
        borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
        transition:
          "background-color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
        "&:hover": hasUrl
          ? {
              bgcolor: active
                ? "color-mix(in oklch, var(--gold) 12%, transparent)"
                : "color-mix(in oklch, var(--ink) 4%, transparent)",
            }
          : {},
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: -2 },
      }}
    >
      <Box
        sx={{
          minWidth: 22,
          height: 22,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          bgcolor: completed
            ? "var(--leaf)"
            : active
              ? "var(--ink)"
              : "color-mix(in oklch, var(--ink) 8%, transparent)",
          color: completed || active ? "var(--paper)" : ink.fade,
          fontSize: "0.66rem",
          fontWeight: 700,
        }}
      >
        {completed ? <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> : index}
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
        <PlayArrowRoundedIcon
          sx={{ fontSize: 16, color: active ? "var(--gold-deep)" : ink.fade, mt: 0.25 }}
        />
      ) : (
        <DownloadOutlinedIcon
          sx={{ fontSize: 13, color: viewed ? "var(--leaf)" : ink.fade, mt: 0.4 }}
        />
      )}
    </Box>
  );
}

