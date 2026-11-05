"use client";

import Link from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import { EVENTS_ENABLED, dateLabel, easternTimeLabel, eventPhase } from "@/lib/events/portalEvents";
import { useEventsFeed, useNow } from "./useEventsFeed";
import { CeChip, DateTile, GOLD_DEEP, INK, MUTED, RegisterButton, cardSx } from "./EventBits";

/**
 * "Your next event" on the Overview page (design D, bottom). Renders
 * nothing while loading or when there is no upcoming event, so the page
 * never shows an empty box.
 */
export default function NextEventCard() {
  return EVENTS_ENABLED ? <NextEventCardInner /> : null;
}

function NextEventCardInner() {
  const { feed } = useEventsFeed();
  const now = useNow(30_000);
  const next = feed?.upcoming[0];
  if (!next) return null;
  const live = eventPhase(next, now) === "live";
  return (
    <Box sx={{ ...cardSx, p: { xs: 1.75, md: 2 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flex: 1, minWidth: 0 }}>
          <Link href={`/dashboard/events/${next.slug}`} style={{ textDecoration: "none" }}>
            <DateTile iso={next.startsAt} />
          </Link>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>{live ? "Happening now" : "Your next event"}</Typography>
            <Typography component={Link} href={`/dashboard/events/${next.slug}`} sx={{ display: "block", mt: 0.25, fontSize: "1.08rem", fontWeight: 700, color: INK, textDecoration: "none", lineHeight: 1.3, "&:hover": { textDecoration: "underline", textUnderlineOffset: 3 } }}>
              {next.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.4, alignItems: "center", flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: "0.84rem", color: MUTED }}>
                {dateLabel(next.startsAt)} · {easternTimeLabel(next.startsAt)}
              </Typography>
              <CeChip credits={next.ceCredits} small />
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexShrink: 0 }}>
          <RegisterButton event={next} now={now} size="sm" label="Register" />
          <Typography component={Link} href="/dashboard/events" sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, textDecoration: "none", whiteSpace: "nowrap", "&:hover": { color: GOLD_DEEP } }}>
            All events →
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
