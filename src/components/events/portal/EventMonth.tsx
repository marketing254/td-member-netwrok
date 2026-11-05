"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { EASTERN, SERIES, SERIES_KEYS, dateLabel, easternDateKey, easternTimeLabel, timeLabel, type PortalEvent, type SeriesKey } from "@/lib/events/portalEvents";
import { AddToCalendar, DISPLAY, EventBanner, EventMeta, GOLD_DEEP, INK, LINE, MUTED, RegisterButton, cardSx } from "./EventBits";

/*
 * "Coming up" as a month calendar (option G): each event in its series
 * colour; click a day and its details open on the right, with the next
 * event under "Coming next". Days are placed in Eastern time, like every
 * other time on the page.
 */

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function ymKey(y: number, m: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

function monthTitle(y: number, m: number) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(Date.UTC(y, m, 15)));
}

function todayKey(now: number) {
  return easternDateKey(new Date(now).toISOString());
}

export default function EventMonth({ events, now, tz }: { events: PortalEvent[]; now: number; tz: string | null }) {
  const sorted = useMemo(() => [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt)), [events]);
  const first = sorted[0];
  const startKey = first ? easternDateKey(first.startsAt) : todayKey(now);
  const [cursor, setCursor] = useState<{ y: number; m: number }>(() => ({ y: +startKey.slice(0, 4), m: +startKey.slice(5, 7) - 1 }));
  const [selectedSlug, setSelectedSlug] = useState<string | null>(first?.slug ?? null);

  const byDay = useMemo(() => {
    const map = new Map<string, PortalEvent[]>();
    for (const e of sorted) {
      const k = easternDateKey(e.startsAt);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return map;
  }, [sorted]);

  const selected = sorted.find((e) => e.slug === selectedSlug) ?? null;
  const comingNext = selected ? sorted.find((e) => e.startsAt > selected.startsAt) ?? null : sorted[0] ?? null;

  // Cells: leading days from the previous month, this month, trailing days to fill the last week.
  const cells = useMemo(() => {
    const { y, m } = cursor;
    const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const daysPrev = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const out: { key: string; day: number; inMonth: boolean }[] = [];
    for (let i = firstDow - 1; i >= 0; i--) {
      const d = daysPrev - i;
      const pm = m === 0 ? 11 : m - 1;
      const py = m === 0 ? y - 1 : y;
      out.push({ key: `${ymKey(py, pm)}-${String(d).padStart(2, "0")}`, day: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) out.push({ key: `${ymKey(y, m)}-${String(d).padStart(2, "0")}`, day: d, inMonth: true });
    let nd = 1;
    while (out.length % 7 !== 0) {
      const nm = m === 11 ? 0 : m + 1;
      const ny = m === 11 ? y + 1 : y;
      out.push({ key: `${ymKey(ny, nm)}-${String(nd).padStart(2, "0")}`, day: nd, inMonth: false });
      nd++;
    }
    return out;
  }, [cursor]);

  const move = (delta: number) => {
    setCursor((c) => {
      const m = c.m + delta;
      const next = { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
      // Select the first event of the month we land on, if there is one.
      const firstInMonth = sorted.find((e) => easternDateKey(e.startsAt).startsWith(ymKey(next.y, next.m)));
      if (firstInMonth) setSelectedSlug(firstInMonth.slug);
      return next;
    });
  };

  const today = todayKey(now);
  const usedSeries = SERIES_KEYS.filter((k) => sorted.some((e) => e.series === k));

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" }, gap: 2.5, alignItems: "start" }}>
      <Box>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <IconButton onClick={() => move(-1)} aria-label="Previous month" sx={{ border: `1px solid ${LINE}`, bgcolor: "#fff", width: 38, height: 38 }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 18, color: INK }} />
            </IconButton>
            <Typography sx={{ fontFamily: DISPLAY, fontSize: "1.35rem", fontWeight: 600, color: INK, minWidth: 170, textAlign: "center" }}>{monthTitle(cursor.y, cursor.m)}</Typography>
            <IconButton onClick={() => move(1)} aria-label="Next month" sx={{ border: `1px solid ${LINE}`, bgcolor: "#fff", width: 38, height: 38 }}>
              <ArrowForwardRoundedIcon sx={{ fontSize: 18, color: INK }} />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={1.75} sx={{ flexWrap: "wrap" }}>
            {usedSeries.map((k) => (
              <Legend key={k} k={k} />
            ))}
          </Stack>
        </Stack>

        <Box sx={{ ...cardSx, overflow: "hidden" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderBottom: `1px solid ${LINE}` }}>
            {DOW.map((d) => (
              <Typography key={d} sx={{ py: 1, textAlign: "left", pl: 1.25, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", color: MUTED }}>{d}</Typography>
            ))}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
            {cells.map((c, i) => {
              const dayEvents = byDay.get(c.key) ?? [];
              const isToday = c.key === today;
              const isSelected = !!selected && easternDateKey(selected.startsAt) === c.key;
              return (
                <Box
                  key={c.key}
                  onClick={() => dayEvents[0] && setSelectedSlug(dayEvents[0].slug)}
                  sx={{
                    minHeight: 96,
                    p: 0.75,
                    borderRight: (i + 1) % 7 === 0 ? "none" : `1px solid ${LINE}`,
                    borderBottom: i >= cells.length - 7 ? "none" : `1px solid ${LINE}`,
                    bgcolor: isSelected ? "#FBF3E2" : "transparent",
                    cursor: dayEvents.length ? "pointer" : "default",
                    opacity: c.inMonth ? 1 : 0.45,
                  }}
                >
                  <Box sx={{ display: "inline-grid", placeItems: "center", width: 24, height: 24, borderRadius: "50%", fontSize: "0.8rem", fontWeight: 700, color: isToday ? "#fff" : INK, bgcolor: isToday ? INK : "transparent" }}>{c.day}</Box>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {dayEvents.map((e) => (
                      <Box key={e.slug} onClick={(ev) => { ev.stopPropagation(); setSelectedSlug(e.slug); }} sx={{ bgcolor: SERIES[e.series].color, color: "#fff", borderRadius: 1, px: 0.75, py: 0.5, fontSize: "0.7rem", fontWeight: 700, lineHeight: 1.25, outline: selected?.slug === e.slug ? `2px solid ${GOLD_DEEP}` : "none" }}>
                        {e.title}
                        <Box component="span" sx={{ display: "block", fontWeight: 500, opacity: 0.9 }}>{timeLabel(e.startsAt, EASTERN)} ET</Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box sx={{ ...cardSx, p: 2 }}>
        {selected ? (
          <Stack spacing={1.25}>
            <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>{dateLabel(selected.startsAt)}</Typography>
            <Link href={`/dashboard/events/${selected.slug}`} style={{ textDecoration: "none" }}>
              <EventBanner event={selected} sx={{ borderRadius: 1.75 }} />
            </Link>
            <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: SERIES[selected.series].color }}>{SERIES[selected.series].label}</Typography>
            <Typography component={Link} href={`/dashboard/events/${selected.slug}`} sx={{ fontSize: "1.08rem", fontWeight: 700, color: INK, textDecoration: "none", lineHeight: 1.3, "&:hover": { textDecoration: "underline", textUnderlineOffset: 3 } }}>
              {selected.title}
              {selected.subtitle && <Box component="span" sx={{ fontWeight: 400, color: "#3B4A55" }}> · {selected.subtitle}</Box>}
            </Typography>
            <EventMeta event={selected} tz={tz} compact />
            <Stack spacing={1} sx={{ pt: 0.5 }}>
              <RegisterButton event={selected} now={now} fullWidth />
              <AddToCalendar event={selected} fullWidth />
            </Stack>
          </Stack>
        ) : (
          <Typography sx={{ color: MUTED, fontSize: "0.9rem" }}>No events this month. Use the arrows to look ahead.</Typography>
        )}
        {comingNext && comingNext.slug !== selected?.slug && (
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${LINE}` }}>
            <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED, mb: 1 }}>Coming next</Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", cursor: "pointer" }} onClick={() => { setSelectedSlug(comingNext.slug); const k = easternDateKey(comingNext.startsAt); setCursor({ y: +k.slice(0, 4), m: +k.slice(5, 7) - 1 }); }}>
              <Stack sx={{ alignItems: "center", width: 56, minWidth: 56, py: 0.5, borderRadius: 1.5, border: `1px solid ${LINE}`, bgcolor: "#FBF8F2" }}>
                <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em", color: GOLD_DEEP }}>{dateLabel(comingNext.startsAt).split(" ")[2].toUpperCase()}</Typography>
                <Typography sx={{ fontFamily: DISPLAY, fontSize: "1.3rem", lineHeight: 1, fontWeight: 600, color: INK }}>{dateLabel(comingNext.startsAt).split(" ")[1]}</Typography>
              </Stack>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: INK, lineHeight: 1.3 }}>{comingNext.title}</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: MUTED }}>{dateLabel(comingNext.startsAt).replace(/\s\d{4}$/, "")} · {easternTimeLabel(comingNext.startsAt)}</Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Legend({ k }: { k: SeriesKey }) {
  return (
    <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
      <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: SERIES[k].color }} />
      <Typography sx={{ fontSize: "0.78rem", color: "#3B4A55" }}>{SERIES[k].label}</Typography>
    </Stack>
  );
}
