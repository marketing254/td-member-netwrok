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
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined";
import { useCurrentMember } from "@/lib/hooks/useCurrentMember";
import { KitCover } from "@/components/member/KitCover";
import { SubscribeCard } from "@/components/member/SubscribeCard";
import {
  EditorialHeader,
  EditorialSection,
  MetricStrip,
  editorialText,
  ink,
} from "@/components/member/Editorial";

type ResourceItem = {
  id: string;
  topic_slug: string;
  topic_title: string;
  topic_summary: string | null;
  category: string | null;
  portal_card_url: string | null;
  resource_card_url: string | null;
  title: string;
  kind: string;
  is_free: boolean;
  progress: { last_viewed_at: string | null; completed_at: string | null } | null;
};

type TopicCard = {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  portalCardUrl: string | null;
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
          category: r.category,
          portalCardUrl: r.portal_card_url,
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
  const subscribed =
    member?.subscription_status === "active" || member?.subscription_status === "trialing";

  return (
    <Box sx={{ color: ink.primary }}>
      {/* Subscription gate — show paywall card until a paid sub is active. */}
      {!subscribed && member && (
        <Box sx={{ mb: 3 }}>
          <SubscribeCard firstName={firstName} />
        </Box>
      )}

      <EditorialHeader
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

      {/* Continue / Begin */}
      <EditorialSection
        eyebrow={recentlyViewed.length > 0 ? "Continue" : "Begin"}
        title={
          recentlyViewed.length > 0 ? "Pick up where you left off" : "Recommended starting kits"
        }
        actions={<SeeAllLink href="/dashboard/resources" label="All kits" />}
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
              gap: { xs: 2.5, md: 3 },
            }}
          >
            {(recentlyViewed.length > 0 ? recentlyViewed : topics.slice(0, 4)).map((t) => (
              <DashboardKitTile key={t.slug} topic={t} />
            ))}
          </Box>
        )}
      </EditorialSection>

      {/* Documents */}
      <EditorialSection
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
          />
          <DocLink
            href="/legal/refund"
            icon={RuleFolderOutlinedIcon}
            label="Refund & cancellation"
            meta="30-day money-back guarantee"
            borderLeft
          />
          <DocLink
            href="/legal/privacy"
            icon={PolicyOutlinedIcon}
            label="Privacy policy"
            meta="What we do with your data"
            borderLeft
          />
        </Box>
      </EditorialSection>

      {/* Help */}
      <EditorialSection eyebrow="Support" title="Need a hand?" rule={false}>
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
  borderLeft,
}: {
  href: string;
  icon: SvgIconComponent;
  label: string;
  meta: string;
  borderLeft?: boolean;
}) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        px: { xs: 1.5, md: 2.25 },
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
        sx={{
          width: 30,
          height: 30,
          borderRadius: 0.75,
          bgcolor: "color-mix(in oklch, var(--gold) 12%, transparent)",
          color: "var(--gold-deep)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{ fontSize: "0.84rem", fontWeight: 600, color: ink.primary, lineHeight: 1.3, mb: 0.25 }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: ink.fade, lineHeight: 1.4 }}>
          {meta}
        </Typography>
      </Box>
      <ArrowForwardIcon sx={{ fontSize: 13, color: ink.fade, mt: 0.5, flexShrink: 0 }} />
    </Box>
  );
}

function DashboardKitTile({ topic }: { topic: TopicCard }) {
  const progressPct =
    topic.resourceCount > 0
      ? Math.round((topic.viewedCount / topic.resourceCount) * 100)
      : 0;
  const completed = topic.completedCount === topic.resourceCount && topic.resourceCount > 0;
  const inProgress = topic.viewedCount > 0 && topic.viewedCount < topic.resourceCount;

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
      <Box sx={{ mb: 1.25 }}>
        <KitCover
          slug={topic.slug}
          title={topic.title}
          videoCount={topic.videoCount}
          resourceCount={topic.resourceCount}
          isFree={topic.isFree}
          completed={completed}
          inProgress={inProgress}
          progressPct={progressPct}
          portalCardUrl={topic.portalCardUrl}
        />
      </Box>
      <Typography sx={{ ...editorialText.meta, mt: "auto" }}>
        {topic.resourceCount} {topic.resourceCount === 1 ? "item" : "items"}
        {topic.viewedCount > 0
          ? ` · ${topic.viewedCount} done`
          : topic.videoCount > 0
            ? ` · ${topic.videoCount} video${topic.videoCount === 1 ? "" : "s"}`
            : ""}
      </Typography>
    </Box>
  );
}
