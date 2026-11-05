"use client";

import Link from "next/link";
import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { SERIES, dateLabel, durationLabel, easternTimeLabel, speakersSummary, type PortalEvent } from "@/lib/events/portalEvents";
import { AddToCalendar, CeChip, DateTile, EventBanner, INK, LINE, MUTED, Pager, RegisterButton, cardSx } from "./EventBits";

const PAGE = 6;
/** Banners are 1600x658 (RIDA and the TD/DMS set), so the thumbnail keeps that shape and never crops. */
export const BANNER_RATIO = "1600 / 658";

/** "Coming up" as a simple list (option F; the only view on phones). Six per page. */
export default function EventList({ events, now }: { events: PortalEvent[]; now: number }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(events.length / PAGE));
  const current = Math.min(page, pages);
  const slice = events.slice((current - 1) * PAGE, current * PAGE);
  if (!events.length) {
    return (
      <Box sx={{ ...cardSx, p: 3, textAlign: "center" }}>
        <Typography sx={{ color: MUTED, fontSize: "0.92rem" }}>Nothing else on the calendar yet. New events land here as soon as they are announced.</Typography>
      </Box>
    );
  }
  return (
    <>
      <Box sx={cardSx}>
        {slice.map((e, i) => (
          <EventRow key={e.slug} event={e} now={now} last={i === slice.length - 1} />
        ))}
      </Box>
      <Pager page={current} pages={pages} onChange={setPage} label="Upcoming events pages" />
    </>
  );
}

function EventRow({ event, now, last }: { event: PortalEvent; now: number; last: boolean }) {
  const s = SERIES[event.series];
  const who = speakersSummary(event.speakers);
  const parts = [dateLabel(event.startsAt), easternTimeLabel(event.startsAt), event.format, durationLabel(event.durationMinutes), who].filter(Boolean);
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "auto 1fr", md: "auto 190px 1fr auto" }, gap: { xs: 1.5, md: 2 }, alignItems: "center", p: { xs: 1.75, md: 2 }, borderBottom: last ? "none" : `1px solid ${LINE}` }}>
      <Link href={`/dashboard/events/${event.slug}`} style={{ textDecoration: "none" }}>
        <DateTile iso={event.startsAt} />
      </Link>
      <Box component={Link} href={`/dashboard/events/${event.slug}`} sx={{ display: { xs: "none", md: "block" }, textDecoration: "none" }}>
        <EventBanner event={event} showTitle={false} fit="cover" sx={{ width: 190, aspectRatio: BANNER_RATIO, borderRadius: 1.5 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: s.color }}>{s.label}</Typography>
        <Typography component={Link} href={`/dashboard/events/${event.slug}`} sx={{ display: "block", mt: 0.25, fontSize: { xs: "1rem", md: "1.08rem" }, fontWeight: 700, color: INK, textDecoration: "none", lineHeight: 1.3, "&:hover": { textDecoration: "underline", textUnderlineOffset: 3 } }}>
          {event.title}
          {event.subtitle && <Box component="span" sx={{ fontWeight: 400, color: "#3B4A55" }}> · {event.subtitle}</Box>}
        </Typography>
        <Typography sx={{ mt: 0.4, fontSize: "0.84rem", color: MUTED, lineHeight: 1.5, display: { xs: "none", md: "block" } }}>{parts.join(" · ")}</Typography>
        <Typography sx={{ mt: 0.3, fontSize: "0.82rem", color: MUTED, display: { xs: "block", md: "none" } }}>
          {easternTimeLabel(event.startsAt)}
          {event.format ? ` · ${event.format}` : ""}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center", display: { xs: "flex", md: "none" } }}>
          <RegisterButton event={event} now={now} size="sm" label="Register" />
          <CeChip credits={event.ceCredits} small />
        </Stack>
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", display: { xs: "none", md: "flex" } }}>
        <CeChip credits={event.ceCredits} />
        <AddToCalendar event={event} size="sm" label="+ Calendar" />
        <RegisterButton event={event} now={now} size="sm" label="Register" />
      </Stack>
    </Box>
  );
}
