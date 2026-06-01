"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { useCurrentMember } from "@/lib/hooks/useCurrentMember";
import { visualForTopic } from "@/components/member/topicVisuals";

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
  viewedCount: number;
  isFree: boolean;
};

export default function DashboardHome() {
  const { member, viewedCount, loading } = useCurrentMember();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);

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
        if (active) setResourcesLoading(false);
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
      if (existing) {
        existing.resourceCount += 1;
        if (isVideo) existing.videoCount += 1;
        if (viewed) existing.viewedCount += 1;
        if (!r.is_free) existing.isFree = false;
      } else {
        map.set(r.topic_slug, {
          slug: r.topic_slug,
          title: r.topic_title,
          summary: r.topic_summary,
          resourceCount: 1,
          videoCount: isVideo ? 1 : 0,
          viewedCount: viewed ? 1 : 0,
          isFree: r.is_free,
        });
      }
    }
    return Array.from(map.values());
  }, [resources]);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress size={24} sx={{ color: "#A07823" }} />
      </Stack>
    );
  }

  const firstName = member?.first_name ?? "there";

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "#A07823", fontSize: "0.62rem", letterSpacing: "0.18em", fontWeight: 700 }}
        >
          MEMBER OVERVIEW
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
          Welcome back, {firstName}.
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "0.85rem", mt: 0.5, maxWidth: 600 }}>
          Your full Resource Kit library is below. Each kit is a complete topic pack — video,
          worksheets, checklists, and ready-to-use templates.
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 4 }}>
          <StatCard
            label="Resource kits available"
            value={`${topics.length}`}
            icon={LibraryBooksOutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <StatCard
            label="Resources viewed"
            value={`${viewedCount}`}
            icon={VisibilityOutlinedIcon}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label="Membership"
            value={member?.tier === "founding" ? "Founding" : "Member"}
            icon={CheckCircleOutlineOutlinedIcon}
            accent
          />
        </Grid>
      </Grid>

      <Box>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              fontWeight: 500,
              color: "#0A1A2F",
            }}
          >
            Pick a kit
          </Typography>
          <Box
            component={Link}
            href="/dashboard/resources"
            sx={{
              fontSize: "0.74rem",
              fontWeight: 600,
              color: "#A07823",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              "&:hover": { color: "#7A5B17" },
            }}
          >
            See all <ArrowForwardIcon sx={{ fontSize: 13 }} />
          </Box>
        </Stack>

        {resourcesLoading ? (
          <Stack sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress size={20} sx={{ color: "#A07823" }} />
          </Stack>
        ) : topics.length === 0 ? (
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
              No resources are published yet. They&apos;ll appear here as the team adds them.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {topics.slice(0, 6).map((t) => (
              <Grid key={t.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                <TopicTile topic={t} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Stack>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ElementType<{ sx?: object }>;
  accent?: boolean;
}) {
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: accent ? "rgba(217,168,75,0.06)" : "common.white",
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
        <Typography
          sx={{
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            fontWeight: 700,
            color: "text.secondary",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: accent ? "rgba(217,168,75,0.16)" : "rgba(14,42,61,0.05)",
            color: accent ? "#A07823" : "#0A1A2F",
          }}
        >
          <Icon sx={{ fontSize: 14 }} />
        </Box>
      </Stack>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 500,
          color: accent ? "#A07823" : "#0A1A2F",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function TopicTile({ topic }: { topic: TopicCard }) {
  const visual = visualForTopic(topic.slug);
  const Icon = visual.icon;
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
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 9",
          backgroundImage: visual.gradient,
          overflow: "hidden",
        }}
      >
        <Icon
          sx={{
            position: "absolute",
            right: -24,
            bottom: -24,
            fontSize: 180,
            color: visual.iconColor,
            opacity: 0.22,
            transform: "rotate(-12deg)",
          }}
        />
        {topic.isFree && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              px: 0.85,
              py: 0.3,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.95)",
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
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            left: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.4,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            color: "#FFFFFF",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <PlayArrowRoundedIcon sx={{ fontSize: 12 }} />
          {topic.videoCount > 0 ? `${topic.videoCount} videos` : "Watch + read"}
        </Box>
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
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ p: 1.75, display: "flex", flexDirection: "column", flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            fontSize: "0.54rem",
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
            fontSize: "1rem",
            fontWeight: 500,
            color: "#0A1A2F",
            lineHeight: 1.25,
            mb: 0.5,
            letterSpacing: "-0.005em",
          }}
        >
          {topic.title}
        </Typography>
        {topic.summary && (
          <Typography
            sx={{
              fontSize: "0.74rem",
              color: "#5C6770",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
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
            pt: 0.75,
          }}
        >
          <Typography sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
            {topic.resourceCount} {topic.resourceCount === 1 ? "resource" : "resources"}
          </Typography>
          <Box
            sx={{
              fontSize: "0.7rem",
              color: visual.accent,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.4,
            }}
          >
            Open <ArrowForwardIcon sx={{ fontSize: 12 }} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
