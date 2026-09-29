"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import Header from "@/components/sections/Header";
import VimeoPlayer, { type VimeoPlayerHandle } from "@/components/replay/VimeoPlayer";
import ChapterList from "@/components/replay/ChapterList";
import ClipRail from "@/components/replay/ClipRail";
import { trackReplay } from "@/lib/events/replayTracking";
import {
  RIDA_CHAPTERS,
  RIDA_CLIPS,
  RIDA_FOUNDING_CLOSES_LABEL,
  RIDA_JOIN_HREF,
  RIDA_JOIN_HREF_AFTER_EVENT,
  RIDA_PLAYBOOK,
  RIDA_REPLAY_SLUG,
  RIDA_RUNTIME_LABEL,
  RIDA_SPEAKERS,
  RIDA_TRIAL_END_LABEL,
  RIDA_VIMEO_EMBED,
  chapterIndexAt,
  type ReplayClip,
} from "@/lib/events/ridaReplay";

/*
 * The public RIDA replay page, /replay/rida-summit. Order follows Lester's
 * mock v2 (29 Sep 2026): offer beside the video above the fold, five
 * clips, chapters collapsed, the playbook block, who is already in, a
 * closing block that repeats the offer. Every join button carries
 * utm_source=replay&utm_campaign=rida. Copy rules in lib/events/ridaReplay.ts.
 */

export type DirectoryFace = { id: string; name: string; img: string; kind: "expert" | "partner" };

const INK = "#0A1A2F";
const NAVY = "#0E2A3D";
const NAVY_DEEP = "#06182A";
const GOLD = "#D9A84B";
const GOLD_DEEP = "#A07823";
const GOLD_BRIGHT = "#F0C16E";
const CREAM = "#F7F5F0";
const PAPER = "#FBF8F1";
const LINE = "#E6DDCF";
const MUTED = "#5C6770";

const DISPLAY = "var(--font-display), 'Fraunces', Georgia, serif";
const PREVIEW_CHAPTERS = 8;

const PLAYBOOK_CARDS = [
  { src: "/join/playbooks/gary-9-kpis.jpg", alt: "Gary Takacs playbook, The 9 KPIs That Drive Your Practice" },
  { src: "/join/playbooks/laura-finger-pointing.jpg", alt: "Laura Webber playbook, Where the Finger Pointing Stops" },
  { src: "/join/playbooks/danielle-insurance-secondary.jpg", alt: "Danielle Kramer playbook, Make Insurance Secondary" },
  { src: "/join/playbooks/devon-process-comes-first.jpg", alt: "DeVon Banks playbook, The Process Comes First" },
];

export default function ReplayPageView({
  experts,
  partners,
  foundingOpen,
}: {
  experts: DirectoryFace[];
  partners: DirectoryFace[];
  foundingOpen: boolean;
}) {
  const player = useRef<VimeoPlayerHandle | null>(null);
  const playerBox = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [allChapters, setAllChapters] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const joinHref = foundingOpen ? RIDA_JOIN_HREF : RIDA_JOIN_HREF_AFTER_EVENT;

  useEffect(() => {
    trackReplay("view", RIDA_REPLAY_SLUG);
    // ?t=SECONDS deep links (the chapter URLs in the page's structured data).
    const t = Number(new URLSearchParams(window.location.search).get("t"));
    if (Number.isFinite(t) && t > 0) {
      const timer = window.setTimeout(() => player.current?.seekTo(t, false), 1500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  const onTime = useCallback((s: number) => {
    setCurrent((prev) => {
      const next = chapterIndexAt(s);
      return next === prev ? prev : next;
    });
  }, []);

  const jumpTo = useCallback((seconds: number, index: number, why: string) => {
    player.current?.seekTo(seconds, true);
    setCurrent(index);
    playerBox.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    trackReplay("chapter_jump", RIDA_REPLAY_SLUG, { chapter: index + 1, via: why });
  }, []);

  const openClipInReplay = useCallback(
    (clip: ReplayClip) => jumpTo(clip.at, chapterIndexAt(clip.at), "clip"),
    [jumpTo],
  );

  const cta = (where: string) => () => trackReplay("cta_click", RIDA_REPLAY_SLUG, { where });

  const offerBullets = foundingOpen
    ? [
        `The event playbook, ${RIDA_PLAYBOOK.title}: ${RIDA_PLAYBOOK.contents}`,
        "A growing library of Practice Playbooks, one topic each",
        "The Expert Hotline: a person, not a search box",
        "Your seat at the RIDA Annual Summit on 6 November, booked for you. Six of its nine speakers are in the network.",
      ]
    : [
        `The event playbook, ${RIDA_PLAYBOOK.title}: ${RIDA_PLAYBOOK.contents}`,
        "A growing library of Practice Playbooks, one topic each",
        "The Expert Hotline: a person, not a search box",
        "The replay of the RIDA Annual Summit, with chapters, inside the portal",
      ];

  return (
    <Box sx={{ bgcolor: CREAM, color: INK, minHeight: "100vh" }}>
      <Header />

      {/* ─── Hero: video + offer ─────────────────────────────────────────── */}
      <Box component="section" sx={{ bgcolor: NAVY_DEEP, backgroundImage: `radial-gradient(1200px 600px at 20% -10%, rgba(14,42,61,0.9), ${NAVY_DEEP} 70%)`, color: "#fff", pt: { xs: 3, md: 5 }, pb: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, mb: { xs: 2.5, md: 3.5 } }}>
            <Box sx={{ width: { xs: 120, sm: 132 }, flexShrink: 0, borderRadius: 1.5, overflow: "hidden", border: "1px solid rgba(255,255,255,0.14)", aspectRatio: "1600 / 927", position: "relative" }}>
              <Image src="/replay/rida-live-2026-09-16-banner.jpg" alt="RIDA Live, 16 September 2026" fill sizes="132px" style={{ objectFit: "cover" }} priority />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_BRIGHT }}>
                Your replay, from the Dental Member Network
              </Typography>
              <Typography component="h1" sx={{ color: "#fff", fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.7rem", sm: "2rem", md: "2.35rem" }, lineHeight: 1.12, mt: 0.6, letterSpacing: "-0.01em" }}>
                {RIDA_PLAYBOOK.title}: the full RIDA Live replay
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.55fr) minmax(300px, 0.85fr)" }, gap: { xs: 3, md: 3.5 }, alignItems: "start" }}>
            <Box ref={playerBox}>
              <VimeoPlayer
                ref={player}
                embedSrc={RIDA_VIMEO_EMBED}
                title="RIDA Live, 16 September 2026: Stop Losing Revenue You Already Earned"
                onTime={onTime}
                onFirstPlay={() => trackReplay("play", RIDA_REPLAY_SLUG)}
              />
              <Typography sx={{ mt: 1.75, fontSize: "0.95rem", color: "rgba(255,255,255,0.88)", lineHeight: 1.6 }}>
                <Box component="strong" sx={{ color: "#fff" }}>Free, and it stays up.</Box> Two hours six minutes, in chapters. Share it with your team.
              </Typography>
              <Typography sx={{ mt: 0.6, fontSize: "0.86rem", color: "rgba(255,255,255,0.62)" }}>
                {RIDA_SPEAKERS.map((s) => s.name).join(", ")}
              </Typography>
              <Typography sx={{ mt: 1.25, fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>
                Now playing: chapter {current + 1} of {RIDA_CHAPTERS.length}, {RIDA_CHAPTERS[current]?.title}
              </Typography>
            </Box>

            {/* Offer card */}
            <Box sx={{ bgcolor: "#fff", color: INK, borderRadius: 3, p: { xs: 2.5, md: 3 }, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", position: "relative" }}>
              <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>
                A gift from the Dental Member Network
              </Typography>
              <Typography component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.35rem", md: "1.5rem" }, lineHeight: 1.2, mt: 0.75 }}>
                Two months on us, and the Practice Playbook from this event on your dashboard today.
              </Typography>
              {foundingOpen && (
                <Box sx={{ mt: 1.75, px: 1.5, py: 1.1, borderRadius: 1.5, bgcolor: "rgba(217,168,75,0.14)", border: "1px solid rgba(217,168,75,0.45)", fontSize: "0.84rem", lineHeight: 1.5 }}>
                  <strong>Founding rate closes {RIDA_FOUNDING_CLOSES_LABEL}.</strong> Join before then and $49 a month is yours for life.
                </Box>
              )}
              <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0, mt: 2 }}>
                {offerBullets.map((b) => (
                  <Stack component="li" direction="row" spacing={1.25} key={b} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ mt: "3px", width: 18, height: 18, borderRadius: "50%", bgcolor: "rgba(44,122,82,0.12)", color: "#2C7A52", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <CheckRoundedIcon sx={{ fontSize: 13 }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.5, color: "#3B4A55" }}>{b}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Button
                component={Link}
                href={joinHref}
                onClick={cta("hero")}
                fullWidth
                size="large"
                endIcon={<ArrowOutwardRoundedIcon />}
                variant="contained"
                disableElevation
                sx={{ mt: 2.5, bgcolor: GOLD, color: `${INK} !important`, fontWeight: 800, fontSize: "1rem", py: 1.4, borderRadius: 999, textTransform: "none", boxShadow: "0 10px 24px rgba(217,168,75,0.35)", "&:hover": { bgcolor: GOLD_BRIGHT } }}
              >
                Start my two months
              </Button>
              <Typography sx={{ mt: 1.5, fontSize: "0.78rem", color: MUTED, lineHeight: 1.55, textAlign: "center" }}>
                Nothing to pay until {RIDA_TRIAL_END_LABEL}{foundingOpen ? ", two months after the summit" : ""}. Cancel any time. Thirty-day money-back guarantee.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── Sixty-second moments ───────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <SectionHead title="Start with sixty seconds" sub="The moments people are sharing. Each one opens at its place in the replay." />
          <ClipRail clips={RIDA_CLIPS} onOpenInReplay={openClipInReplay} onPlay={(c) => trackReplay("clip_play", RIDA_REPLAY_SLUG, { clip: c.n })} />

          {/* Chapters, collapsed */}
          <Box sx={{ mt: { xs: 3, md: 4 }, bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: 2.5, overflow: "hidden" }}>
            <Stack
              direction="row"
              onClick={() => setChaptersOpen((o) => !o)}
              sx={{ px: { xs: 2, md: 2.5 }, py: 1.75, alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
              role="button"
              aria-expanded={chaptersOpen}
            >
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.15rem" }}>Jump to a chapter</Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: MUTED, fontSize: "0.82rem" }}>
                <span>{RIDA_CHAPTERS.length} chapters · {RIDA_RUNTIME_LABEL}</span>
                <ExpandMoreRoundedIcon sx={{ transition: "transform 160ms", transform: chaptersOpen ? "rotate(180deg)" : "none" }} />
              </Stack>
            </Stack>
            {chaptersOpen && (
              <Box sx={{ borderTop: `1px solid ${LINE}` }}>
                <ChapterList
                  chapters={RIDA_CHAPTERS}
                  current={current}
                  onPick={(i) => jumpTo(RIDA_CHAPTERS[i]!.start, i, "list")}
                  limit={allChapters ? undefined : PREVIEW_CHAPTERS}
                />
                {!allChapters && (
                  <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${LINE}`, textAlign: "center" }}>
                    <Button onClick={() => setAllChapters(true)} sx={{ textTransform: "none", fontWeight: 700, color: `${NAVY} !important` }}>
                      Show all {RIDA_CHAPTERS.length} chapters
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* ─── The playbook ───────────────────────────────────────────────── */}
      <Box component="section" sx={{ bgcolor: PAPER, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr" }, gap: { xs: 3, md: 5 }, alignItems: "center" }}>
            <Box sx={{ maxWidth: { xs: 220, md: "none" }, mx: { xs: "auto", md: 0 }, borderRadius: 2.5, overflow: "hidden", boxShadow: "0 20px 44px rgba(10,26,47,0.22)", aspectRatio: "3 / 4", position: "relative" }}>
              <Image src={RIDA_PLAYBOOK.cardSrc} alt={`${RIDA_PLAYBOOK.title}, the Practice Playbook from this event`} fill sizes="(max-width: 900px) 220px, 260px" style={{ objectFit: "cover" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>Inside the membership</Typography>
              <Typography component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.5rem", md: "1.9rem" }, lineHeight: 1.18, mt: 0.75 }}>
                The replay tells you what to do. The playbook is what you hand your team on Monday.
              </Typography>
              <Typography sx={{ mt: 1.5, color: "#3B4A55", lineHeight: 1.6 }}>
                Everything the panel said, turned into the set members use every week, each part credited to the speaker who said it:
              </Typography>
              <Box component="ol" sx={{ mt: 2, mb: 0, pl: 2.5, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, columnGap: 3, rowGap: 0.6, color: INK, fontSize: "0.92rem", lineHeight: 1.5 }}>
                {RIDA_PLAYBOOK.sections.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </Box>
              <Button
                component={Link}
                href={joinHref}
                onClick={cta("playbook")}
                endIcon={<ArrowOutwardRoundedIcon />}
                variant="contained"
                disableElevation
                sx={{ mt: 3, bgcolor: NAVY, color: "#fff !important", fontWeight: 700, px: 3, py: 1.2, borderRadius: 999, textTransform: "none", "&:hover": { bgcolor: INK } }}
              >
                Start my two months, get the playbook
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── More inside the membership ─────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <SectionHead title="There is more inside the membership" sub="One login. All of it included." />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2 }}>
            <Tile kicker="Learn" title="Practice Playbooks">
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.75, mb: 1.25 }}>
                {PLAYBOOK_CARDS.map((c) => (
                  <Box key={c.src} sx={{ position: "relative", aspectRatio: "3 / 4", borderRadius: 1, overflow: "hidden" }}>
                    <Image src={c.src} alt={c.alt} fill sizes="80px" style={{ objectFit: "cover" }} />
                  </Box>
                ))}
              </Box>
              <TileText>Built from our experts&apos; own sessions. One topic each: an action guide, a checklist, a worksheet, the video.</TileText>
            </Tile>
            <Tile kicker="Ask" title="Expert Hotline">
              <Box sx={{ bgcolor: "rgba(217,168,75,0.13)", borderRadius: 1.5, p: 1.5, fontSize: "0.82rem", lineHeight: 1.5, mb: 1.25 }}>
                <Box sx={{ mb: 0.75 }}><strong>You:</strong> Our hygiene schedule has been flat for six months.</Box>
                <Box><strong>Beacon:</strong> Three playbooks cover this. Start with Heidi Mount&apos;s Every Unit of Time Matters. Want a person to look at your numbers?</Box>
              </Box>
              <TileText>Any practice problem. An answer right away, built on our experts&apos; own sessions. Need more? Our team comes back in writing, with the experts worth calling.</TileText>
            </Tile>
            <Tile kicker="Hire" title="Job board">
              <Box sx={{ border: `1px solid ${LINE}`, borderRadius: 1.5, p: 1.5, mb: 1.25 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }}>Dental hygienist, full time</Typography>
                <Typography sx={{ fontSize: "0.78rem", color: MUTED }}>Practice name, City, State</Typography>
                <Typography sx={{ fontSize: "0.78rem", color: GOLD_DEEP, fontWeight: 700, mt: 0.4 }}>Pay range per hour</Typography>
              </Box>
              <TileText>Post your vacancy, included in membership. Every listing shows pay, and each post gets its own page Google can list.</TileText>
            </Tile>
            <Tile kicker="Listen" title="Chairside, the podcast" chip="Episode one: DeVon Banks">
              <TileText>Our members-only podcast with the experts in the network. A short piece of each episode is public; the full episode is yours.</TileText>
            </Tile>
          </Box>
        </Container>
      </Box>

      {/* ─── Who is already in ──────────────────────────────────────────── */}
      {(experts.length > 0 || partners.length > 0) && (
        <Box component="section" sx={{ bgcolor: "#fff", borderTop: `1px solid ${LINE}`, py: { xs: 5, md: 6 } }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 0.9fr) minmax(0, 1.1fr)" }, gap: { xs: 3, md: 5 }, alignItems: "center" }}>
              <Box>
                <Typography component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.5rem", md: "1.8rem" }, lineHeight: 1.2 }}>Who is already in</Typography>
                <Typography sx={{ mt: 1.25, color: "#3B4A55", lineHeight: 1.6 }}>
                  {countLine(experts.length, partners.length)} See them at{" "}
                  <Link href="/experts" style={{ color: NAVY, fontWeight: 700 }}>dentalmembernetwork.com/experts</Link>.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                {[...experts, ...partners].map((f) => (
                  <Box
                    key={`${f.kind}-${f.id}`}
                    title={f.name}
                    sx={{ width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 }, borderRadius: "50%", overflow: "hidden", border: `2px solid ${f.kind === "expert" ? GOLD : LINE}`, bgcolor: "#fff", position: "relative", flexShrink: 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.img} alt={f.name} style={{ width: "100%", height: "100%", objectFit: f.kind === "expert" ? "cover" : "contain", objectPosition: "center top", padding: f.kind === "expert" ? 0 : 6, display: "block" }} loading="lazy" />
                  </Box>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* ─── Closing block ──────────────────────────────────────────────── */}
      <Box component="section" sx={{ bgcolor: NAVY, color: "#fff", py: { xs: 6, md: 8 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography component="h2" sx={{ color: "#fff", fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.6rem", md: "2.1rem" }, lineHeight: 1.15 }}>
            {foundingOpen ? "Two months on us. The playbook today. Your seat on 6 November." : "Two months on us. The playbook today."}
          </Typography>
          <Typography sx={{ mt: 1.75, color: "rgba(255,255,255,0.78)", lineHeight: 1.6, fontSize: "1rem" }}>
            Nothing to pay until {RIDA_TRIAL_END_LABEL}, cancel any time, thirty-day money-back guarantee.{foundingOpen ? ` Founding rate closes ${RIDA_FOUNDING_CLOSES_LABEL}.` : ""}
          </Typography>
          <Button
            component={Link}
            href={joinHref}
            onClick={cta("closing")}
            size="large"
            endIcon={<ArrowOutwardRoundedIcon />}
            variant="contained"
            disableElevation
            sx={{ mt: 3.5, bgcolor: GOLD, color: `${INK} !important`, fontWeight: 800, fontSize: "1rem", px: 4, py: 1.4, borderRadius: 999, textTransform: "none", "&:hover": { bgcolor: GOLD_BRIGHT } }}
          >
            Start my two months
          </Button>
        </Container>
      </Box>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <Box component="footer" sx={{ py: 3, borderTop: `1px solid ${LINE}` }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, fontSize: "0.8rem", color: MUTED }}>
            <span>Powered by Thriving Dentist Inc.</span>
            <Stack direction="row" spacing={2}>
              <Link href="/legal/privacy" style={{ color: MUTED }}>Privacy</Link>
              <Link href="/legal/refund" style={{ color: MUTED }}>Cancellation</Link>
              <Link href="/" style={{ color: MUTED }}>dentalmembernetwork.com</Link>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ─── Sticky mobile CTA ──────────────────────────────────────────── */}
      <Box sx={{ display: { xs: "flex", md: "none" }, position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, px: 2, py: 1.25, bgcolor: "rgba(10,26,47,0.96)", backdropFilter: "blur(8px)", alignItems: "center", gap: 1.5, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <Typography sx={{ color: "#fff", fontSize: "0.82rem", lineHeight: 1.3, flex: 1 }}>Two months on us, and the playbook today</Typography>
        <Button component={Link} href={joinHref} onClick={cta("sticky")} variant="contained" disableElevation sx={{ bgcolor: GOLD, color: `${INK} !important`, fontWeight: 800, borderRadius: 999, textTransform: "none", px: 2.25, whiteSpace: "nowrap", "&:hover": { bgcolor: GOLD_BRIGHT } }}>
          Start
        </Button>
      </Box>
      <Box sx={{ display: { xs: "block", md: "none" }, height: 64 }} />
    </Box>
  );
}

function countLine(experts: number, partners: number): string {
  const words = (n: number) => ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"][n] ?? String(n);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (experts && partners) return `${cap(words(experts))} experts and ${words(partners)} partner companies are live in the directory.`;
  if (experts) return `${cap(words(experts))} experts are live in the directory.`;
  return `${cap(words(partners))} partner companies are live in the directory.`;
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
      <Typography component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.5rem", md: "1.8rem" }, lineHeight: 1.2 }}>{title}</Typography>
      <Typography sx={{ mt: 0.75, color: MUTED }}>{sub}</Typography>
    </Box>
  );
}

function Tile({ kicker, title, chip, children }: { kicker: string; title: string; chip?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: 2, p: 2.25, display: "flex", flexDirection: "column" }}>
      <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>{kicker}</Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.4, mb: 1.25, flexWrap: "wrap" }}>
        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.15rem" }}>{title}</Typography>
        {chip && (
          <Box sx={{ px: 1, py: 0.25, borderRadius: 999, bgcolor: "rgba(217,168,75,0.16)", color: GOLD_DEEP, fontSize: "0.68rem", fontWeight: 800 }}>{chip}</Box>
        )}
      </Stack>
      {children}
    </Box>
  );
}

function TileText({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontSize: "0.86rem", color: "#3B4A55", lineHeight: 1.55 }}>{children}</Typography>;
}
