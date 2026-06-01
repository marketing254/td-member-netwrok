"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined";
import { useCurrentMember } from "@/lib/hooks/useCurrentMember";
import { visualForTopic } from "@/components/member/topicVisuals";
import {
  EditorialHeader,
  EditorialSection,
  InlineTag,
  MetricStrip,
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
  viewedCount: number;
  completedCount: number;
  isFree: boolean;
  lastViewedAt: string | null;
};

function formatJoined(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
      new Date(iso),
    );
  } catch {
    return iso.slice(0, 10);
  }
}

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
      const completed = !!r.progress?.completed_at;
      const lastViewed = r.progress?.last_viewed_at ?? null;
      if (existing) {
        existing.resourceCount += 1;
        if (isVideo) existing.videoCount += 1;
        if (viewed) existing.viewedCount += 1;
        if (completed) existing.completedCount += 1;
        if (!r.is_free) existing.isFree = false;
        if (lastViewed && (!existing.lastViewedAt || lastViewed > existing.lastViewedAt)) {
          existing.lastViewedAt = lastViewed;
        }
      } else {
        map.set(r.topic_slug, {
          slug: r.topic_slug,
          title: r.topic_title,
          summary: r.topic_summary,
          resourceCount: 1,
          videoCount: isVideo ? 1 : 0,
          viewedCount: viewed ? 1 : 0,
          completedCount: completed ? 1 : 0,
          isFree: r.is_free,
          lastViewedAt: lastViewed,
        });
      }
    }
    return Array.from(map.values());
  }, [resources]);

  const completedKits = topics.filter((t) => t.completedCount === t.resourceCount && t.resourceCount > 0).length;
  const startedKits = topics.filter((t) => t.viewedCount > 0).length;
  const recentlyViewed = topics
    .filter((t) => t.lastViewedAt)
    .sort((a, b) => (a.lastViewedAt! < b.lastViewedAt! ? 1 : -1))
    .slice(0, 4);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress size={22} sx={{ color: "var(--gold)" }} />
      </Stack>
    );
  }

  const firstName = member?.first_name ?? "there";
  const memberSince = formatJoined(member?.joined_at ?? member?.activated_at ?? null);

  return (
    <Box sx={{ color: ink.primary }}>
      <EditorialHeader
        index="01"
        eyebrow={`Member portal · ${member?.tier === "founding" ? "Founding cohort" : "Member"}`}
        title={`Welcome back, ${firstName}.`}
        standfirst={
          viewedCount === 0
            ? "Your founding-member library is open. Pick a kit below and start with the training video — most members finish their first kit in under an hour."
            : startedKits === topics.length
              ? "You have started every kit. Completed kits earn a check mark and stay in your library."
              : `You have opened ${startedKits} of ${topics.length} kits. Keep momentum — pick up where you left off, or start something new.`
        }
        actions={
          <Button
            component={Link}
            href="/dashboard/resources"
            variant="contained"
            size="small"
            disableElevation
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: "var(--ink)",
              color: "var(--paper)",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              borderRadius: 0.75,
              px: 1.75,
              py: 0.75,
              transition: "background-color var(--dur-fast) var(--ease-out)",
              "&:hover": { bgcolor: "color-mix(in oklch, var(--ink) 90%, white)" },
              "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: 2 },
            }}
          >
            Browse library
          </Button>
        }
      />

      {/* Metric strip — replaces 4-card grid */}
      <Box sx={{ mb: 3 }}>
        <MetricStrip
          items={[
            {
              label: "Kits available",
              value: String(topics.length),
              meta: topics.length === 1 ? "in your library" : "available to you",
            },
            {
              label: "Resources viewed",
              value: String(viewedCount),
              meta: `${startedKits}/${topics.length} kits started`,
            },
            {
              label: "Kits completed",
              value: String(completedKits),
              meta: `${Math.max(topics.length - completedKits, 0)} to go`,
            },
            {
              label: "Member since",
              value: memberSince,
              meta: member?.tier === "founding" ? "Founding cohort" : "Member",
            },
          ]}
        />
      </Box>

      {/* Section 02 — Continue / Begin */}
      <EditorialSection
        index="02"
        eyebrow={recentlyViewed.length > 0 ? "Continue" : "Begin"}
        title={
          recentlyViewed.length > 0 ? "Pick up where you left off" : "Recommended starting kits"
        }
        actions={
          <SeeAllLink href="/dashboard/resources" label="All kits" />
        }
      >
        {resourcesLoading ? (
          <Stack sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress size={20} sx={{ color: "var(--gold)" }} />
          </Stack>
        ) : topics.length === 0 ? (
          <EmptyState />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 0,
              borderTop: "1px solid var(--paper-rule)",
            }}
          >
            {(recentlyViewed.length > 0 ? recentlyViewed : topics.slice(0, 4)).map((t, i) => (
              <EditorialKitTile key={t.slug} topic={t} index={i} />
            ))}
          </Box>
        )}
      </EditorialSection>

      {/* Section 03 — Documents */}
      <EditorialSection
        index="03"
        eyebrow="Reference"
        title="Agreements & policies"
        standfirst="What you signed, plus the policies that govern your membership."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            borderTop: "1px solid var(--paper-rule)",
            borderBottom: "1px solid var(--paper-rule)",
          }}
        >
          <DocLink
            href="/agreement/member"
            icon={GavelOutlinedIcon}
            label="Member agreement"
            meta="What you signed at signup"
            index="i"
          />
          <DocLink
            href="/legal/refund"
            icon={RuleFolderOutlinedIcon}
            label="Refund & cancellation"
            meta="30-day money-back guarantee"
            index="ii"
            borderLeft
          />
          <DocLink
            href="/legal/privacy"
            icon={PolicyOutlinedIcon}
            label="Privacy policy"
            meta="What we do with your data"
            index="iii"
            borderLeft
          />
        </Box>
      </EditorialSection>

      {/* Section 04 — Help */}
      <EditorialSection index="04" eyebrow="Support" title="Need a hand?" rule={false}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Typography sx={{ ...editorialText.body, maxWidth: 560 }}>
            Can&apos;t find what you&apos;re looking for, or have feedback on a kit? We read every email — usually back within a business day.
          </Typography>
          <Box
            component="a"
            href="mailto:members@joindmn.com"
            sx={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--gold-deep)",
              textDecoration: "none",
              borderBottom: "1px solid color-mix(in oklch, var(--gold) 40%, transparent)",
              pb: "1px",
              transition: "color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)",
              "&:hover": { color: "var(--ink)", borderBottomColor: "var(--ink)" },
            }}
          >
            members@joindmn.com →
          </Box>
        </Stack>
      </EditorialSection>
    </Box>
  );
}

function SeeAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        fontSize: "0.74rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--gold-deep)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        transition: "color var(--dur-fast) var(--ease-out)",
        "&:hover": { color: "var(--ink)" },
      }}
    >
      {label} <ArrowForwardIcon sx={{ fontSize: 12 }} />
    </Box>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        py: 6,
        textAlign: "center",
        borderTop: "1px solid var(--paper-rule)",
        borderBottom: "1px solid var(--paper-rule)",
      }}
    >
      <Typography sx={{ ...editorialText.heading, mb: 0.5 }}>
        No resource kits published yet
      </Typography>
      <Typography sx={editorialText.meta}>
        Kits will appear here as soon as the content team adds them.
      </Typography>
    </Box>
  );
}

function DocLink({
  href,
  icon: Icon,
  label,
  meta,
  index,
  borderLeft,
}: {
  href: string;
  icon: SvgIconComponent;
  label: string;
  meta: string;
  index: string;
  borderLeft?: boolean;
}) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        px: { xs: 1.5, md: 2.5 },
        py: 2,
        textDecoration: "none",
        color: "inherit",
        borderLeft: { md: borderLeft ? "1px solid var(--paper-rule)" : "none" },
        borderTop: {
          xs: borderLeft ? "1px solid var(--paper-rule)" : "none",
          md: "none",
        },
        transition: "background-color var(--dur-fast) var(--ease-out)",
        "&:hover": { bgcolor: "color-mix(in oklch, var(--gold) 6%, transparent)" },
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: -2 },
      }}
    >
      <Box
        component="span"
        className="hk-numeral"
        sx={{
          fontSize: "0.82rem",
          color: "var(--gold)",
          flexShrink: 0,
          pt: 0.25,
        }}
      >
        {index}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
          <Icon sx={{ fontSize: 15, color: ink.fade }} />
          <Typography sx={{ ...editorialText.eyebrow, color: ink.fade }}>{label}</Typography>
        </Stack>
        <Typography sx={{ ...editorialText.body, color: ink.soft }}>{meta}</Typography>
      </Box>
      <ArrowForwardIcon sx={{ fontSize: 14, color: ink.fade, mt: 0.5, flexShrink: 0 }} />
    </Box>
  );
}

function EditorialKitTile({ topic, index }: { topic: TopicCard; index: number }) {
  const visual = visualForTopic(topic.slug);
  const Icon = visual.icon;
  const progressPct =
    topic.resourceCount > 0
      ? Math.round((topic.viewedCount / topic.resourceCount) * 100)
      : 0;
  const completed = topic.completedCount === topic.resourceCount && topic.resourceCount > 0;

  return (
    <Box
      component={Link}
      href={`/dashboard/resources/${topic.slug}`}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        px: { xs: 1.5, md: 2 },
        py: 2,
        borderRight: { sm: index % 2 === 0 ? "1px solid var(--paper-rule)" : "none", lg: index < 3 ? "1px solid var(--paper-rule)" : "none" },
        borderBottom: { xs: "1px solid var(--paper-rule)", lg: "1px solid var(--paper-rule)" },
        transition: "background-color var(--dur-fast) var(--ease-out)",
        "&:hover": { bgcolor: "color-mix(in oklch, var(--gold) 5%, transparent)" },
        "&:focus-visible": { outline: "2px solid var(--gold)", outlineOffset: -2 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 10",
          backgroundImage: visual.gradient,
          borderRadius: 1,
          overflow: "hidden",
          mb: 1.5,
        }}
      >
        <Icon
          sx={{
            position: "absolute",
            right: -16,
            bottom: -16,
            fontSize: 130,
            color: visual.iconColor,
            opacity: 0.22,
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
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "var(--paper)",
                color: "var(--ink)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>
        )}
        {topic.viewedCount > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              bgcolor: "rgba(255,255,255,0.2)",
            }}
          >
            <Box sx={{ height: "100%", width: `${progressPct}%`, bgcolor: visual.accent }} />
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
        {topic.isFree && <InlineTag label="Free" tone="leaf" />}
        {completed && <InlineTag label="Done" tone="ink" />}
      </Stack>
      <Typography sx={{ ...editorialText.heading, fontSize: "0.95rem", mb: 0.25 }}>
        {topic.title}
      </Typography>
      <Typography sx={{ ...editorialText.meta, mt: "auto" }}>
        {topic.resourceCount} {topic.resourceCount === 1 ? "item" : "items"}
        {topic.videoCount > 0 ? ` · ${topic.videoCount} video${topic.videoCount === 1 ? "" : "s"}` : ""}
      </Typography>
    </Box>
  );
}
