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
import { visualForTopic } from "@/components/member/topicVisuals";

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
    bg: string;
    fg: string;
    badge: string;
  }
> = {
  video_intro: {
    icon: OndemandVideoOutlinedIcon,
    defaultMeta: "Short intro video",
    actionLabel: "Watch",
    bg: "rgba(220,60,60,0.10)",
    fg: "#8C1D1D",
    badge: "Video",
  },
  video_full: {
    icon: PlayArrowRoundedIcon,
    defaultMeta: "Full training session",
    actionLabel: "Watch",
    bg: "rgba(220,60,60,0.14)",
    fg: "#8C1D1D",
    badge: "Full Training",
  },
  video_explainer: {
    icon: OndemandVideoOutlinedIcon,
    defaultMeta: "Explainer video",
    actionLabel: "Watch",
    bg: "rgba(220,60,60,0.10)",
    fg: "#8C1D1D",
    badge: "Explainer",
  },
  video_trailer: {
    icon: OndemandVideoOutlinedIcon,
    defaultMeta: "Trailer",
    actionLabel: "Watch",
    bg: "rgba(220,60,60,0.08)",
    fg: "#8C1D1D",
    badge: "Trailer",
  },
  audio: {
    icon: HeadphonesOutlinedIcon,
    defaultMeta: "Audio episode",
    actionLabel: "Listen",
    bg: "rgba(14,42,61,0.06)",
    fg: "#0E2A3D",
    badge: "Audio",
  },
  action_guide: {
    icon: ListAltOutlinedIcon,
    defaultMeta: "PDF · the full reference",
    actionLabel: "Download",
    bg: "rgba(34,80,160,0.08)",
    fg: "#2C4FA0",
    badge: "PDF",
  },
  checklist: {
    icon: ChecklistOutlinedIcon,
    defaultMeta: "PDF · set up → track → review",
    actionLabel: "Download",
    bg: "rgba(34,108,78,0.10)",
    fg: "#1F5C40",
    badge: "PDF",
  },
  key_takeaways: {
    icon: StickyNote2OutlinedIcon,
    defaultMeta: "PDF · the gist in 2 minutes",
    actionLabel: "Download",
    bg: "rgba(217,168,75,0.14)",
    fg: "#A07823",
    badge: "PDF",
  },
  worksheet: {
    icon: EditNoteOutlinedIcon,
    defaultMeta: "PDF · fillable",
    actionLabel: "Download",
    bg: "rgba(217,168,75,0.10)",
    fg: "#A07823",
    badge: "PDF",
  },
  slide_deck: {
    icon: SlideshowOutlinedIcon,
    defaultMeta: "Slide deck · PowerPoint",
    actionLabel: "Download",
    bg: "rgba(160,120,35,0.10)",
    fg: "#A07823",
    badge: "Slides",
  },
  email_sequence: {
    icon: EmailOutlinedIcon,
    defaultMeta: "PDF · ready-to-send email scripts",
    actionLabel: "Download",
    bg: "rgba(14,42,61,0.06)",
    fg: "#0E2A3D",
    badge: "PDF",
  },
  other: {
    icon: InsertDriveFileOutlinedIcon,
    defaultMeta: "File",
    actionLabel: "Open",
    bg: "rgba(14,42,61,0.06)",
    fg: "#0E2A3D",
    badge: "File",
  },
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

  const visual = visualForTopic(slug);
  const TopicIcon = visual.icon;

  const heroVideo = useMemo(() => {
    return (
      resources.find((r) => r.kind === "video_full") ??
      resources.find((r) => r.kind === "video_intro") ??
      resources.find((r) => isVideo(r.kind)) ??
      null
    );
  }, [resources]);

  const downloads = useMemo(() => resources.filter((r) => !isVideo(r.kind)), [resources]);
  const videos = useMemo(() => resources.filter((r) => isVideo(r.kind)), [resources]);

  const topicTitle = resources[0]?.topic_title ?? "Resource Kit";
  const topicSummary = resources[0]?.topic_summary ?? null;
  const isFree = resources.length > 0 && resources.every((r) => r.is_free);

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

      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          backgroundImage: visual.gradient,
          color: "#FFFFFF",
          minHeight: { xs: 240, md: 320 },
          display: "flex",
          alignItems: "flex-end",
          p: { xs: 2.5, md: 4 },
        }}
      >
        {/* Background giant icon */}
        <TopicIcon
          sx={{
            position: "absolute",
            right: { xs: -40, md: -20 },
            top: { xs: -30, md: -10 },
            fontSize: { xs: 280, md: 360 },
            color: visual.iconColor,
            opacity: 0.18,
            transform: "rotate(-10deg)",
          }}
        />

        {/* Play overlay if there's a hero video */}
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
              position: "absolute",
              top: "50%",
              right: { xs: "50%", md: 48 },
              transform: { xs: "translate(50%, -50%)", md: "translate(0, -50%)" },
              width: { xs: 72, md: 92 },
              height: { xs: 72, md: 92 },
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.95)",
              display: "grid",
              placeItems: "center",
              color: "#0A1A2F",
              cursor: "pointer",
              boxShadow: "0 24px 48px -16px rgba(0,0,0,0.5)",
              transition: "transform 200ms ease",
              "&:hover": { transform: { xs: "translate(50%, -50%) scale(1.05)", md: "scale(1.05)" } },
              "&:focus-visible": { outline: "2px solid #FFFFFF", outlineOffset: 4 },
              zIndex: 2,
            }}
          >
            <PlayArrowRoundedIcon sx={{ fontSize: { xs: 36, md: 48 } }} />
          </Box>
        )}

        {/* Content */}
        <Stack spacing={1.5} sx={{ position: "relative", maxWidth: 580, zIndex: 1 }}>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                fontWeight: 800,
                color: visual.accent,
                textTransform: "uppercase",
              }}
            >
              Resource Kit
            </Typography>
            {isFree && (
              <Box
                sx={{
                  px: 0.85,
                  py: 0.2,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.92)",
                  color: "#1F5C40",
                  fontSize: "0.56rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Free
              </Box>
            )}
          </Stack>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.5rem", md: "2.1rem" },
              fontWeight: 500,
              color: "#FFFFFF",
              letterSpacing: "-0.015em",
              lineHeight: 1.12,
            }}
          >
            {topicTitle}
          </Typography>
          {topicSummary && (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.85)",
                fontSize: { xs: "0.85rem", md: "0.96rem" },
                lineHeight: 1.6,
                maxWidth: 540,
              }}
            >
              {topicSummary}
            </Typography>
          )}

          {/* Stat strip */}
          <Stack
            direction="row"
            spacing={2.5}
            sx={{ mt: 1, alignItems: "baseline", flexWrap: "wrap", rowGap: 1 }}
          >
            <Stat value={`${resources.length}`} label="resources" accent={visual.accent} />
            <Stat value={`${videos.length}`} label={videos.length === 1 ? "video" : "videos"} accent={visual.accent} />
            <Stat value={`${downloads.length}`} label="downloads" accent={visual.accent} />
          </Stack>
        </Stack>
      </Box>

      {/* Speaker card */}
      <Box
        sx={{
          p: 1.75,
          borderRadius: 2,
          bgcolor: "common.white",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "rgba(217,168,75,0.18)",
            color: "#A07823",
            display: "grid",
            placeItems: "center",
            fontSize: "0.78rem",
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          GT
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0A1A2F", lineHeight: 1.2 }}>
            Gary Takacs
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
            Founder, Thriving Dentist · 2,200+ practices coached
          </Typography>
        </Box>
      </Box>

      {/* What's inside */}
      <Box>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.15rem",
            fontWeight: 500,
            color: "#0A1A2F",
            mb: 0.25,
          }}
        >
          What&apos;s inside this kit
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 2 }}>
          Stream the training, then download the done-for-you tools below.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1.25,
          }}
        >
          {(heroVideo ? [heroVideo, ...resources.filter((r) => r.id !== heroVideo.id)] : resources).map((r) => (
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
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 2,
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
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
              playsInline
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

function Stat({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.25rem",
          fontWeight: 500,
          color: "#FFFFFF",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.58rem",
          letterSpacing: "0.16em",
          fontWeight: 800,
          color: accent,
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
  const completed = !!resource.progress?.completed_at;
  const action = isVideo(resource.kind) ? "Watch" : k.actionLabel;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.75,
        borderRadius: 2,
        border: "1px solid",
        borderColor: completed ? "rgba(34,108,78,0.3)" : viewed ? "rgba(217,168,75,0.3)" : "divider",
        bgcolor: "common.white",
        transition: "all 160ms ease",
        "&:hover": {
          borderColor: "#A07823",
          boxShadow: "0 8px 18px -10px rgba(14,42,61,0.18)",
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1.5,
          bgcolor: k.bg,
          color: k.fg,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
        {completed && (
          <Box
            sx={{
              position: "absolute",
              right: -4,
              top: -4,
              width: 16,
              height: 16,
              borderRadius: "50%",
              bgcolor: "#1F5C40",
              color: "#FFFFFF",
              fontSize: "0.6rem",
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
            }}
          >
            ✓
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.25 }}>
          <Box
            component="span"
            sx={{
              px: 0.7,
              py: 0.05,
              borderRadius: 0.5,
              bgcolor: k.bg,
              color: k.fg,
              fontSize: "0.56rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {k.badge}
          </Box>
        </Stack>
        <Typography
          sx={{
            fontSize: "0.88rem",
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
          startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: "#0A1A2F",
            textTransform: "none",
            fontSize: "0.75rem",
            fontWeight: 600,
            px: 1.5,
            py: 0.55,
            flexShrink: 0,
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
            py: 0.55,
            flexShrink: 0,
            "&:hover": { bgcolor: "#0F2540" },
          }}
        >
          {action}
        </Button>
      )}
    </Box>
  );
}
