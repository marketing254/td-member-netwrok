"use client";

import { use } from "react";
import Link from "next/link";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { SERIES, ceLabel, easternTimeLabel, eventPhase, initials, longDateLabel, replayHref, yourTimeLabel } from "@/lib/events/portalEvents";
import { useEvent, useNow } from "@/components/events/portal/useEventsFeed";
import { CalendarButtons, DISPLAY, EventBanner, GOLD_DEEP, INK, MUTED, RegisterButton, SeriesEyebrow, StartsIn, cardSx, primaryBtn, useLocalTz } from "@/components/events/portal/EventBits";

/*
 * One event (design D): banner, about, speakers (DMN experts link to their
 * profile), and on the right the countdown, date and time in Eastern plus
 * the member's own, format, CE, Register and the three calendar buttons.
 * After the event this page turns into the replay: the video from the
 * sheet's replay link, or a button to the in-portal replay page.
 */

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { event, error, loading } = useEvent(slug);
  const now = useNow();
  const tz = useLocalTz();

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress size={22} sx={{ color: "var(--gold)" }} />
      </Stack>
    );
  }
  if (error || !event) {
    return (
      <Stack spacing={2} sx={{ py: 4 }}>
        <Typography sx={{ fontFamily: DISPLAY, fontSize: "1.4rem", color: INK }}>{error ?? "We could not find that event."}</Typography>
        <Button component={Link} href="/dashboard/events" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start", textTransform: "none", color: INK, fontWeight: 700 }}>
          Back to Events
        </Button>
      </Stack>
    );
  }

  const phase = eventPhase(event, now);
  const ended = phase === "ended";
  const embed = ended ? embedUrl(event.replayUrl) : null;
  const yours = yourTimeLabel(event.startsAt, tz);
  const s = SERIES[event.series];

  return (
    <Stack spacing={2.5}>
      <Typography sx={{ fontSize: "0.9rem", color: MUTED }}>
        <Box component={Link} href="/dashboard/events" sx={{ color: MUTED, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>Events</Box>
        {" › "}
        <Box component="span" sx={{ color: INK }}>{event.title}</Box>
      </Typography>

      {/* The banner artwork carries its own title, date and format; nothing is drawn over it. */}
      {embed ? (
        <Box sx={{ position: "relative", aspectRatio: "16 / 9", borderRadius: 2.5, overflow: "hidden", bgcolor: "#000" }}>
          <iframe src={embed} title={event.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
        </Box>
      ) : (
        <EventBanner event={event} sx={{ borderRadius: 2.5 }} />
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" }, gap: 3, alignItems: "start" }}>
        <Stack spacing={2.5}>
          <Box>
            <SeriesEyebrow event={event} />
            <Typography component="h1" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.8rem", md: "2.4rem" }, lineHeight: 1.1, color: INK, mt: 0.75 }}>{event.title}</Typography>
            {event.subtitle && <Typography sx={{ mt: 1, fontSize: "1.05rem", color: "#3B4A55", lineHeight: 1.45 }}>{event.subtitle}</Typography>}
          </Box>

          {event.description && (
            <Box>
              <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, mb: 1 }}>About this event</Typography>
              {event.description.split(/\n\s*\n|\r?\n/).filter((p) => p.trim()).map((p, i) => (
                <Typography key={i} sx={{ fontSize: "1rem", color: "#2C3A45", lineHeight: 1.7, mb: 1.25 }}>{p.trim()}</Typography>
              ))}
            </Box>
          )}

          {event.speakers.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, mb: 1.25 }}>Speakers</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
                {event.speakers.map((sp, i) => {
                  const inner = (
                    <Stack direction="row" spacing={1.5} sx={{ ...cardSx, p: 1.75, alignItems: "flex-start", height: "100%", ...(sp.expertId ? { "&:hover": { borderColor: GOLD_DEEP } } : {}) }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: i % 2 ? GOLD_DEEP : s.color, color: "#fff", fontSize: "0.8rem", fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden" }}>
                        {sp.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sp.photoUrl} alt={sp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          initials(sp.name)
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.98rem", fontWeight: 700, color: INK, lineHeight: 1.3 }}>{sp.name}</Typography>
                        {(sp.title || sp.company) && <Typography sx={{ fontSize: "0.84rem", color: MUTED, lineHeight: 1.4 }}>{[sp.title, sp.company].filter(Boolean).join(", ")}</Typography>}
                        {sp.expertId && <Typography sx={{ mt: 0.5, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD_DEEP }}>DMN expert →</Typography>}
                      </Box>
                    </Stack>
                  );
                  return sp.expertId ? (
                    <Link key={sp.name + i} href={`/dashboard/experts/${sp.expertId}`} style={{ textDecoration: "none" }}>{inner}</Link>
                  ) : (
                    <Box key={sp.name + i}>{inner}</Box>
                  );
                })}
              </Box>
              {event.speakers.some((sp) => sp.expertId) && (
                <Typography sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: 1.5, border: `1px dashed ${GOLD_DEEP}`, bgcolor: "#FBF6EA", fontSize: "0.84rem", color: "#6B4E12" }}>
                  Speakers who are DMN experts link to their profile and playbooks. Everyone else shows name and title only.
                </Typography>
              )}
            </Box>
          )}
        </Stack>

        {/* Right card */}
        <Box sx={{ ...cardSx, p: 2.5, position: { lg: "sticky" }, top: { lg: 24 } }}>
          <Stack spacing={1.75}>
            {ended ? (
              <Box>
                <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>This event has ended</Typography>
                <Typography sx={{ fontFamily: DISPLAY, fontSize: "1.5rem", fontWeight: 600, color: INK, mt: 0.25 }}>{replayHref(event) ? "Watch the replay" : "Replay on its way"}</Typography>
              </Box>
            ) : (
              <StartsIn event={event} now={now} align="left" />
            )}

            <Stack spacing={0.8} sx={{ fontSize: "0.92rem", color: "#2C3A45" }}>
              <Row icon={<CalendarMonthOutlinedIcon sx={iconSx} />}><b>{longDateLabel(event.startsAt)}</b></Row>
              <Row icon={<ScheduleOutlinedIcon sx={iconSx} />}>
                {easternTimeLabel(event.startsAt)}
                {yours && <Box component="span" sx={{ color: MUTED }}> ({yours})</Box>}
              </Row>
              {event.format && <Row icon={<MicNoneOutlinedIcon sx={iconSx} />}>{event.format}</Row>}
              {ceLabel(event.ceCredits) && <Row icon={<StarRoundedIcon sx={iconSx} />}>{ceLabel(event.ceCredits)}</Row>}
            </Stack>

            {ended ? (
              event.replaySlug ? (
                <Button component={Link} href={`/dashboard/replays/${event.replaySlug}`} variant="contained" disableElevation startIcon={<PlayArrowRoundedIcon />} sx={{ ...primaryBtn, width: "100%" }}>
                  Open the replay
                </Button>
              ) : event.replayUrl && !embed ? (
                <Button component="a" href={event.replayUrl} target="_blank" rel="noopener noreferrer" variant="contained" disableElevation startIcon={<PlayArrowRoundedIcon />} sx={{ ...primaryBtn, width: "100%" }}>
                  Watch the replay
                </Button>
              ) : !event.replayUrl ? (
                <Typography sx={{ fontSize: "0.86rem", color: MUTED }}>The replay is being prepared and will appear here.</Typography>
              ) : null
            ) : (
              <>
                <RegisterButton event={event} now={now} fullWidth />
                <CalendarButtons event={event} />
                <Typography sx={{ fontSize: "0.82rem", color: MUTED, lineHeight: 1.5 }}>After the event, this page turns into the replay.</Typography>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}

const iconSx = { fontSize: 18, color: GOLD_DEEP, flexShrink: 0 };

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {icon}
      <span>{children}</span>
    </Box>
  );
}

/** YouTube and Vimeo links become an embed; anything else opens in a new tab. */
function embedUrl(url: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([\w]+))?/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}${vm[2] ? `?h=${vm[2]}` : ""}`;
  return null;
}

