"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Chip, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VimeoPlayer, { type VimeoPlayerHandle } from "@/components/replay/VimeoPlayer";
import ChapterList from "@/components/replay/ChapterList";
import ClipRail from "@/components/replay/ClipRail";
import { trackReplay } from "@/lib/events/replayTracking";
import {
  EVENT_REPLAYS,
  RIDA_CHAPTERS,
  RIDA_CLIPS,
  RIDA_PLAYBOOK,
  RIDA_REPLAY_SLUG,
  RIDA_RUNTIME_LABEL,
  RIDA_SPEAKERS,
  RIDA_VIMEO_EMBED,
  chapterIndexAt,
  type ReplayClip,
} from "@/lib/events/ridaReplay";

/*
 * One replay opened (RIDA brief, email 2): the same Vimeo player as the
 * public page on the left with the title, speaker chips and the clips
 * under it; on the right the chapter list in a scrolling panel that
 * highlights the current chapter as the video plays, and under it the
 * playbook built from the event. Members never get less than the public page.
 */

const INK = "#0A1A2F";
const LINE = "#E6DDCF";
const MUTED = "#5C6770";
const GOLD_DEEP = "#A07823";
const DISPLAY = "var(--font-display), 'Fraunces', Georgia, serif";

export default function ReplayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const entry = EVENT_REPLAYS.find((e) => e.slug === slug && e.status === "live");
  const player = useRef<VimeoPlayerHandle | null>(null);
  const playerBox = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (entry) trackReplay("view", entry.slug, { surface: "portal" });
  }, [entry]);

  // Keep the highlighted chapter in view inside the scrolling panel.
  useEffect(() => {
    const el = listRef.current?.querySelectorAll("li")[current];
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [current]);

  const onTime = useCallback((s: number) => {
    setCurrent((prev) => {
      const next = chapterIndexAt(s);
      return next === prev ? prev : next;
    });
  }, []);

  const jumpTo = useCallback(
    (seconds: number, index: number, why: string) => {
      player.current?.seekTo(seconds, true);
      setCurrent(index);
      playerBox.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      trackReplay("chapter_jump", RIDA_REPLAY_SLUG, { chapter: index + 1, via: why, surface: "portal" });
    },
    [],
  );
  const openClip = useCallback((clip: ReplayClip) => jumpTo(clip.at, chapterIndexAt(clip.at), "clip"), [jumpTo]);

  if (!entry || entry.slug !== RIDA_REPLAY_SLUG) {
    return (
      <Stack spacing={2}>
        <BackLink />
        <Typography sx={{ color: MUTED }}>That replay is not here yet.</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <BackLink />
      <Typography sx={{ fontSize: "0.78rem", color: MUTED }}>Member portal · Event Replays · RIDA Live, 16 September 2026</Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" }, gap: 3, alignItems: "start" }}>
        {/* Left: player, title, clips */}
        <Stack spacing={2.5}>
          <Box ref={playerBox}>
            <VimeoPlayer ref={player} embedSrc={RIDA_VIMEO_EMBED} title={entry.title} onTime={onTime} onFirstPlay={() => trackReplay("play", entry.slug, { surface: "portal" })} />
          </Box>

          <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: 2.5, p: { xs: 2, md: 2.5 } }}>
            <Typography component="h1" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.4rem", md: "1.7rem" }, lineHeight: 1.2, color: INK }}>
              {entry.title}
            </Typography>
            <Typography sx={{ mt: 0.75, fontSize: "0.86rem", color: MUTED }}>
              RIDA Live, 16 September 2026 · {RIDA_RUNTIME_LABEL} · in partnership with Ekwa Marketing
            </Typography>
            <Stack direction="row" useFlexGap spacing={0.75} sx={{ mt: 1.5, flexWrap: "wrap" }}>
              {RIDA_SPEAKERS.map((s) => (
                <Chip key={s.name} label={s.name} title={s.role} size="small" sx={{ bgcolor: "rgba(14,42,61,0.06)", color: INK, fontWeight: 600 }} />
              ))}
            </Stack>
            <Typography sx={{ mt: 1.5, fontSize: "0.8rem", color: MUTED }}>
              Now playing: chapter {current + 1} of {RIDA_CHAPTERS.length}, {RIDA_CHAPTERS[current]?.title}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP, mb: 1.5 }}>
              Sixty-second moments
            </Typography>
            <ClipRail clips={RIDA_CLIPS} onOpenInReplay={openClip} onPlay={(c) => trackReplay("clip_play", entry.slug, { clip: c.n, surface: "portal" })} />
          </Box>

          {/* Chapters on small screens sit under the clips */}
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            <ChaptersPanel current={current} onPick={(i) => jumpTo(RIDA_CHAPTERS[i]!.start, i, "list")} listRef={listRef} />
          </Box>
        </Stack>

        {/* Right: chapters + playbook */}
        <Stack spacing={2} sx={{ position: { lg: "sticky" }, top: { lg: 16 } }}>
          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <ChaptersPanel current={current} onPick={(i) => jumpTo(RIDA_CHAPTERS[i]!.start, i, "list")} listRef={listRef} />
          </Box>
          <PlaybookCard />
        </Stack>
      </Box>
    </Stack>
  );
}

function ChaptersPanel({ current, onPick, listRef }: { current: number; onPick: (i: number) => void; listRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: 2.5, overflow: "hidden" }}>
      <Typography sx={{ px: 2, py: 1.5, fontWeight: 800, fontSize: "0.9rem", color: INK, borderBottom: `1px solid ${LINE}` }}>Chapters</Typography>
      <Box ref={listRef} sx={{ maxHeight: { xs: 420, lg: "min(60vh, 640px)" }, overflowY: "auto" }}>
        <ChapterList chapters={RIDA_CHAPTERS} current={current} onPick={onPick} dense />
      </Box>
    </Box>
  );
}

function PlaybookCard() {
  return (
    <Box sx={{ bgcolor: "#F7EFDD", border: "1px solid rgba(160,120,35,0.25)", borderRadius: 2.5, p: 2, display: "grid", gridTemplateColumns: "72px 1fr", gap: 1.75, alignItems: "start" }}>
      <Box sx={{ position: "relative", aspectRatio: "3 / 4", borderRadius: 1.25, overflow: "hidden", boxShadow: "0 8px 20px rgba(10,26,47,0.2)" }}>
        <Image src={RIDA_PLAYBOOK.cardSrc} alt={RIDA_PLAYBOOK.title} fill sizes="72px" style={{ objectFit: "cover" }} />
      </Box>
      <Box>
        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1rem", lineHeight: 1.25, color: INK }}>The Practice Playbook from this event</Typography>
        <Typography sx={{ mt: 0.6, fontSize: "0.8rem", color: "#3B4A55", lineHeight: 1.5 }}>
          {RIDA_PLAYBOOK.title}: {RIDA_PLAYBOOK.contents}. Each part credited to its speaker.
        </Typography>
        <Link href={`/dashboard/resources/${RIDA_PLAYBOOK.slug}`} style={{ display: "inline-block", marginTop: 8, fontSize: "0.82rem", fontWeight: 800, color: "#0E2A3D" }}>
          Open the playbook
        </Link>
      </Box>
    </Box>
  );
}

function BackLink() {
  return (
    <Link href="/dashboard/replays" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 700, color: "#0E2A3D", textDecoration: "none" }}>
      <ArrowBackIcon sx={{ fontSize: 16 }} /> All replays
    </Link>
  );
}
