"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useCurrentMember } from "@/lib/hooks/useCurrentMember";

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
      const existing = map.get(r.topic_slug);
      const viewed = !!r.progress?.last_viewed_at;
      if (existing) {
        existing.resourceCount += 1;
        if (viewed) existing.viewedCount += 1;
      } else {
        map.set(r.topic_slug, {
          slug: r.topic_slug,
          title: r.topic_title,
          summary: r.topic_summary,
          resourceCount: 1,
          viewedCount: viewed ? 1 : 0,
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
  return (
    <Box
      component={Link}
      href={`/dashboard/resources/${topic.slug}`}
      sx={{
        display: "block",
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "common.white",
        textDecoration: "none",
        color: "inherit",
        transition: "all 200ms ease",
        height: "100%",
        "&:hover": {
          borderColor: "#A07823",
          transform: "translateY(-1px)",
          boxShadow: "0 12px 28px -16px rgba(14,42,61,0.2)",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: "0.96rem",
          fontWeight: 600,
          color: "#0A1A2F",
          lineHeight: 1.3,
          mb: 0.5,
        }}
      >
        {topic.title}
      </Typography>
      {topic.summary && (
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.76rem",
            color: "#5C6770",
            lineHeight: 1.5,
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
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
          {topic.resourceCount} {topic.resourceCount === 1 ? "resource" : "resources"}
          {topic.viewedCount > 0 ? ` · ${topic.viewedCount} viewed` : ""}
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
          sx={{
            fontSize: "0.7rem",
            color: "#A07823",
            textTransform: "none",
            fontWeight: 600,
            minWidth: 0,
            px: 0.5,
            "&:hover": { bgcolor: "transparent", color: "#7A5B17" },
          }}
        >
          Open
        </Button>
      </Stack>
    </Box>
  );
}
