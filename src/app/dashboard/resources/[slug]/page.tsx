"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import CloseIcon from "@mui/icons-material/Close";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

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
  progress: Progress | null;
};

type RouteParams = Promise<{ slug: string }>;

const KIND_META: Record<
  string,
  { icon: SvgIconComponent; defaultMeta: string; actionLabel: string; bg: string; fg: string }
> = {
  video_intro: { icon: OndemandVideoOutlinedIcon, defaultMeta: "Short intro video", actionLabel: "Watch", bg: "rgba(220,60,60,0.08)", fg: "#8C1D1D" },
  video_full: { icon: PlayArrowRoundedIcon, defaultMeta: "Full training session", actionLabel: "Watch", bg: "rgba(220,60,60,0.12)", fg: "#8C1D1D" },
  video_explainer: { icon: OndemandVideoOutlinedIcon, defaultMeta: "Explainer video", actionLabel: "Watch", bg: "rgba(220,60,60,0.08)", fg: "#8C1D1D" },
  video_trailer: { icon: OndemandVideoOutlinedIcon, defaultMeta: "Trailer", actionLabel: "Watch", bg: "rgba(220,60,60,0.08)", fg: "#8C1D1D" },
  audio: { icon: HeadphonesOutlinedIcon, defaultMeta: "Audio episode", actionLabel: "Listen", bg: "rgba(14,42,61,0.06)", fg: "#0E2A3D" },
  action_guide: { icon: ListAltOutlinedIcon, defaultMeta: "PDF · the full reference", actionLabel: "Download", bg: "rgba(34,80,160,0.08)", fg: "#2C4FA0" },
  checklist: { icon: ChecklistOutlinedIcon, defaultMeta: "PDF · set up → track → review", actionLabel: "Download", bg: "rgba(34,108,78,0.10)", fg: "#1F5C40" },
  key_takeaways: { icon: StickyNote2OutlinedIcon, defaultMeta: "PDF · the gist in 2 minutes", actionLabel: "Download", bg: "rgba(217,168,75,0.14)", fg: "#A07823" },
  worksheet: { icon: EditNoteOutlinedIcon, defaultMeta: "PDF · fillable", actionLabel: "Download", bg: "rgba(217,168,75,0.10)", fg: "#A07823" },
  slide_deck: { icon: SlideshowOutlinedIcon, defaultMeta: "Slide deck · PowerPoint", actionLabel: "Download", bg: "rgba(160,120,35,0.10)", fg: "#A07823" },
  email_sequence: { icon: EmailOutlinedIcon, defaultMeta: "PDF · ready-to-send email scripts", actionLabel: "Download", bg: "rgba(14,42,61,0.06)", fg: "#0E2A3D" },
  other: { icon: InsertDriveFileOutlinedIcon, defaultMeta: "File", actionLabel: "Open", bg: "rgba(14,42,61,0.06)", fg: "#0E2A3D" },
};

function isVideo(kind: string): boolean {
  return kind.startsWith("video_") || kind === "audio";
}

function formatSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 900) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
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
    /* silent — progress is best-effort */
  }
}

export default function ResourceKitDetailPage({ params }: { params: RouteParams }) {
  const { slug } = use(params);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);

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

  const heroVideo = useMemo(() => {
    return (
      resources.find((r) => r.kind === "video_full") ??
      resources.find((r) => r.kind === "video_intro") ??
      resources.find((r) => isVideo(r.kind)) ??
      null
    );
  }, [resources]);

  const otherResources = useMemo(() => {
    if (!heroVideo) return resources;
    return resources.filter((r) => r.id !== heroVideo.id);
  }, [resources, heroVideo]);

  const topicTitle = resources[0]?.topic_title ?? "Resource Kit";
  const topicSummary = resources[0]?.topic_summary ?? null;

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress size={24} sx={{ color: "#A07823" }} />
      </Stack>
    );
  }

  if (resources.length === 0) {
    return (
      <Stack spacing={2.5}>
        <BackLink />
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
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, mb: 0.5 }}>
            Kit not found
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
            This resource kit isn&apos;t published yet, or the URL is wrong.
          </Typography>
        </Box>
      </Stack>
    );
  }

  const onPlayHero = () => {
    if (!heroVideo) return;
    const url = heroVideo.external_url ?? "";
    if (!url) return;
    setPlayerUrl(url);
    void markProgress(heroVideo.id, "view");
  };

  return (
    <Stack spacing={3}>
      <BackLink />

      {/* HERO — two-column on desktop, stacks on mobile */}
      <Box>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}>
          {/* Left column: kit info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{
                color: "#A07823",
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                fontWeight: 700,
                display: "block",
              }}
            >
              RESOURCE KIT
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.6rem", md: "2rem" },
                fontWeight: 500,
                color: "#0A1A2F",
                letterSpacing: "-0.015em",
                lineHeight: 1.15,
                mt: 0.5,
                mb: 1.25,
              }}
            >
              {topicTitle}
            </Typography>
            {topicSummary && (
              <Typography
                sx={{
                  color: "#3B4A55",
                  fontSize: "0.92rem",
                  lineHeight: 1.65,
                  mb: 2,
                  maxWidth: 520,
                }}
              >
                {topicSummary}
              </Typography>
            )}

            {/* Speaker chip */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.25,
                p: 1.25,
                borderRadius: 2,
                bgcolor: "common.white",
                border: "1px solid",
                borderColor: "divider",
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "rgba(217,168,75,0.18)",
                  color: "#A07823",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                GT
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#0A1A2F", lineHeight: 1.2 }}>
                  Gary Takacs
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                  Founder, Thriving Dentist
                </Typography>
              </Box>
            </Box>

            {/* Stats */}
            <Stack direction="row" spacing={3} sx={{ alignItems: "baseline" }}>
              <Stat value={`${resources.length}`} label="resources" />
              {heroVideo?.duration_label && <Stat value={heroVideo.duration_label} label="training" />}
              <Stat value={`${otherResources.filter((r) => !isVideo(r.kind)).length}`} label="downloads" />
            </Stack>
          </Box>

          {/* Right column: hero video preview */}
          {heroVideo && (
            <Box
              role="button"
              tabIndex={0}
              onClick={onPlayHero}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPlayHero();
                }
              }}
              sx={{
                position: "relative",
                width: { xs: "100%", md: 420 },
                aspectRatio: "16 / 9",
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                flexShrink: 0,
                bgcolor: "#0A1A2F",
                backgroundImage:
                  heroVideo.thumbnail_url
                    ? `url(${heroVideo.thumbnail_url})`
                    : "linear-gradient(135deg, #06182A 0%, #0E2A3D 50%, #1B4258 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid rgba(217,168,75,0.25)",
                transition: "transform 200ms ease",
                "&:hover": { transform: "translateY(-2px)" },
                "&:focus-visible": { outline: "2px solid #A07823", outlineOffset: 2 },
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(10,26,47,0.35)",
                }}
              />
              <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.92)",
                    display: "grid",
                    placeItems: "center",
                    color: "#0A1A2F",
                    boxShadow: "0 18px 32px -16px rgba(0,0,0,0.5)",
                  }}
                >
                  <PlayArrowRoundedIcon sx={{ fontSize: 30 }} />
                </Box>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  px: 2,
                  py: 1.25,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                  color: "#FFFFFF",
                }}
              >
                <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#F0C16E", fontWeight: 700 }}>
                  ▶ Watch the training
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>

      {/* What's inside */}
      <Box>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            fontWeight: 500,
            color: "#0A1A2F",
            mb: 0.5,
          }}
        >
          What&apos;s inside this kit
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 1.5 }}>
          Stream the training, then download the done-for-you tools below.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1.25,
          }}
        >
          {(heroVideo ? [heroVideo, ...otherResources] : resources).map((r) => (
            <ResourceRow
              key={r.id}
              resource={r}
              onPlay={(url) => {
                setPlayerUrl(url);
                void markProgress(r.id, "view");
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Video player dialog */}
      <Dialog
        open={!!playerUrl}
        onClose={() => setPlayerUrl(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#000",
              borderRadius: 2,
              position: "relative",
              overflow: "hidden",
            },
          },
        }}
      >
        <IconButton
          onClick={() => setPlayerUrl(null)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#FFFFFF",
            bgcolor: "rgba(0,0,0,0.4)",
            zIndex: 2,
            "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
          }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        {playerUrl && (
          <Box sx={{ width: "100%", aspectRatio: "16 / 9" }}>
            <video
              src={playerUrl}
              controls
              autoPlay
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </Box>
        )}
      </Dialog>
    </Stack>
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
        fontSize: "0.74rem",
        color: "#5C6770",
        textDecoration: "none",
        "&:hover": { color: "#0A1A2F" },
      }}
    >
      <ArrowBackIcon sx={{ fontSize: 14 }} /> All kits
    </Box>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.15rem",
          fontWeight: 500,
          color: "#0A1A2F",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.58rem",
          letterSpacing: "0.14em",
          fontWeight: 700,
          color: "text.secondary",
          textTransform: "uppercase",
          mt: 0.25,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function ResourceRow({
  resource,
  onPlay,
}: {
  resource: ResourceItem;
  onPlay: (url: string) => void;
}) {
  const k = KIND_META[resource.kind] ?? KIND_META.other;
  const Icon = k.icon;
  const url = resource.external_url ?? "";
  const meta = buildMeta(resource);
  const viewed = !!resource.progress?.last_viewed_at;
  const action = isVideo(resource.kind) ? "Watch" : k.actionLabel;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: viewed ? "rgba(34,108,78,0.25)" : "divider",
        bgcolor: "common.white",
        transition: "border-color 160ms ease",
        "&:hover": { borderColor: "#A07823" },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.25,
          bgcolor: k.bg,
          color: k.fg,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#0A1A2F",
            lineHeight: 1.25,
          }}
          noWrap
        >
          {resource.title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "text.secondary",
            lineHeight: 1.4,
            mt: 0.25,
          }}
          noWrap
        >
          {meta}
        </Typography>
      </Box>
      {isVideo(resource.kind) ? (
        <Button
          size="small"
          variant="contained"
          onClick={() => url && onPlay(url)}
          disabled={!url}
          sx={{
            bgcolor: "#0A1A2F",
            textTransform: "none",
            fontSize: "0.75rem",
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            "&:hover": { bgcolor: "#0F2540" },
          }}
        >
          {action}
        </Button>
      ) : (
        <Button
          size="small"
          variant="contained"
          component="a"
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          download
          onClick={() => void markProgress(resource.id, "view")}
          disabled={!url}
          startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: "#0A1A2F",
            textTransform: "none",
            fontSize: "0.75rem",
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            "&:hover": { bgcolor: "#0F2540" },
          }}
        >
          {action}
        </Button>
      )}
    </Box>
  );
}
