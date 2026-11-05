"use client";

import Link from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import { nextUpLabel, type PortalEvent } from "@/lib/events/portalEvents";
import { AddToCalendar, CeChip, DISPLAY, EventBanner, EventMeta, GOLD_DEEP, INK, MUTED, RegisterButton, SpeakerAvatars, StartsIn, cardSx } from "./EventBits";

/** The next event, big, at the top of /dashboard/events (option A/F/G). */
export default function EventSpotlight({ event, now, tz }: { event: PortalEvent; now: number; tz: string | null }) {
  return (
    <Box sx={{ ...cardSx, p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.15fr) minmax(0, 1fr)" }, gap: { xs: 2, md: 3 }, alignItems: "start" }}>
        <Link href={`/dashboard/events/${event.slug}`} style={{ textDecoration: "none", display: "block" }}>
          <EventBanner event={event} />
        </Link>
        <Stack sx={{ minWidth: 0 }} spacing={1.25}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>{nextUpLabel(event.startsAt, now)}</Typography>
            <CeChip credits={event.ceCredits} />
          </Stack>
          <Typography component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.6rem", md: "2.1rem" }, lineHeight: 1.1, color: INK }}>
            {event.title}
          </Typography>
          {event.subtitle && <Typography sx={{ fontSize: "1rem", color: "#3B4A55", lineHeight: 1.45 }}>{event.subtitle}</Typography>}
          <EventMeta event={event} tz={tz} />
          <Stack direction="row" sx={{ alignItems: "flex-end", justifyContent: "space-between", gap: 2, pt: 0.5 }}>
            <SpeakerAvatars event={event} />
            <StartsIn event={event} now={now} />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ pt: 1, alignItems: { sm: "center" } }}>
            <RegisterButton event={event} now={now} />
            <AddToCalendar event={event} />
            <Box sx={{ flex: 1 }} />
            <Typography component={Link} href={`/dashboard/events/${event.slug}`} sx={{ fontSize: "0.88rem", fontWeight: 600, color: MUTED, textDecoration: "underline", textUnderlineOffset: 3, alignSelf: { xs: "flex-start", sm: "center" } }}>
              Details
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
