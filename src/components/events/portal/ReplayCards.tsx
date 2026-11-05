"use client";

import Link from "next/link";
import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { SERIES, dateLabel, hasReplay, replayHref, type PortalEvent } from "@/lib/events/portalEvents";
import { EventBanner, INK, MUTED, Pager, cardSx } from "./EventBits";

const PAGE = 9;
const BANNER_RATIO = "1600 / 658";

/** Past-event cards: banner with a play button when the replay exists, series and date, title, runtime. */
export function ReplayCard({ event }: { event: PortalEvent }) {
  const ready = hasReplay(event);
  const href = replayHref(event) ?? `/dashboard/events/${event.slug}`;
  const s = SERIES[event.series];
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <Stack sx={{ ...cardSx, height: "100%", p: 1.5, transition: "transform 160ms ease, box-shadow 160ms ease", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 16px 36px rgba(10,26,47,0.14)" } }}>
        <EventBanner event={event} showTitle={false} fit="cover" sx={{ borderRadius: 1.75, aspectRatio: BANNER_RATIO }}>
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,24,42,0.1) 0%, rgba(6,24,42,0.55) 100%)" }} />
          <Typography sx={{ position: "absolute", top: 12, left: 14, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#fff" }}>
            {s.label} · {dateLabel(event.startsAt).replace(/^\w+\s/, "")}
          </Typography>
          {ready ? (
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 54, height: 54, borderRadius: "50%", bgcolor: "rgba(217,168,75,0.95)", color: INK, display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
              <PlayArrowRoundedIcon sx={{ fontSize: 32 }} />
            </Box>
          ) : (
            <Typography sx={{ position: "absolute", bottom: 12, left: 14, fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff", bgcolor: "rgba(6,24,42,0.55)", px: 1, py: 0.35, borderRadius: 999 }}>
              Replay coming soon
            </Typography>
          )}
        </EventBanner>
        <Box sx={{ pt: 1.5, px: 0.5 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: INK, lineHeight: 1.3 }}>{event.title}</Typography>
          <Typography sx={{ mt: 0.4, fontSize: "0.82rem", color: MUTED }}>{ready ? (event.replayRuntime ? `${event.replayRuntime} · replay` : "Replay") : "Held " + dateLabel(event.startsAt) + " · replay on its way"}</Typography>
        </Box>
      </Stack>
    </Link>
  );
}

/** With `limit`: a fixed preview (the "Missed one?" strip). Without: nine per page. */
export function ReplayGrid({ events, limit }: { events: PortalEvent[]; limit?: number }) {
  const [page, setPage] = useState(1);
  const pages = limit ? 1 : Math.max(1, Math.ceil(events.length / PAGE));
  const current = Math.min(page, pages);
  const list = limit ? events.slice(0, limit) : events.slice((current - 1) * PAGE, current * PAGE);
  if (!list.length) {
    return (
      <Box sx={{ ...cardSx, p: 3, textAlign: "center" }}>
        <Typography sx={{ color: MUTED, fontSize: "0.92rem" }}>Past events and their replays appear here after each event.</Typography>
      </Box>
    );
  }
  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
        {list.map((e) => (
          <ReplayCard key={e.slug} event={e} />
        ))}
      </Box>
      {!limit && <Pager page={current} pages={pages} onChange={setPage} label="Past events pages" />}
    </>
  );
}
