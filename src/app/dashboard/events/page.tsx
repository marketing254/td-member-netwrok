"use client";

import { useMemo, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography, useMediaQuery } from "@mui/material";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { EditorialHeader } from "@/components/member/Editorial";
import { FORMAT_FILTERS, matchesFilter, type FormatFilter, type PortalEvent } from "@/lib/events/portalEvents";
import { useEventsFeed, useNow } from "@/components/events/portal/useEventsFeed";
import { DISPLAY, INK, LINE, MUTED, useLocalTz } from "@/components/events/portal/EventBits";
import EventSpotlight from "@/components/events/portal/EventSpotlight";
import EventList from "@/components/events/portal/EventList";
import EventMonth from "@/components/events/portal/EventMonth";
import { ReplayGrid } from "@/components/events/portal/ReplayCards";

/*
 * /dashboard/events (Lester's pick, 5 Nov 2026: F and G, one page, two
 * views). Top: the next event as a spotlight with a countdown, Register and
 * Add to calendar. "Coming up": a List | Month switch (List only on
 * phones). Bottom: "Missed one? Watch the replay". The Replays tab lists
 * every replay. Data: /api/member/events (portal_events, migration 0080).
 */

type Tab = "upcoming" | "replays";
type View = "list" | "month";

export default function EventsPage() {
  const { feed, error, loading } = useEventsFeed();
  const now = useNow();
  const tz = useLocalTz();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [filter, setFilter] = useState<FormatFilter>("all");
  const [view, setView] = useState<View>("list");
  const isDesktop = useMediaQuery("(min-width:900px)");

  const upcoming = useMemo(() => (feed?.upcoming ?? []).filter((e) => matchesFilter(e, filter)), [feed, filter]);
  const replays = feed?.replays ?? [];
  const spotlight: PortalEvent | undefined = upcoming[0];
  const rest = upcoming.slice(1);
  const showMonth = view === "month" && isDesktop;

  return (
    <Stack spacing={3}>
      <EditorialHeader
        eyebrow="Member portal · Events"
        title="Events"
        standfirst="Live events from across the Thriving Dentist network. Register in one click, and find the replay here afterwards."
      />

      {/* Upcoming | Replays */}
      <Stack direction="row" spacing={3} sx={{ borderBottom: `1px solid ${LINE}` }}>
        {(["upcoming", "replays"] as Tab[]).map((t) => {
          const count = t === "upcoming" ? feed?.upcoming.length : replays.length;
          const active = tab === t;
          return (
            <Box
              key={t}
              component="button"
              type="button"
              onClick={() => setTab(t)}
              sx={{ background: "none", border: 0, borderBottom: `2px solid ${active ? "#C9962E" : "transparent"}`, mb: "-1px", px: 0.5, pb: 1.25, cursor: "pointer", display: "flex", alignItems: "center", gap: 0.9, color: active ? INK : MUTED, fontWeight: 700, fontSize: "0.98rem", fontFamily: "inherit" }}
            >
              {t === "upcoming" ? "Upcoming" : "Past events"}
              {count !== undefined && (
                <Box component="span" sx={{ fontSize: "0.72rem", fontWeight: 700, px: 0.9, py: 0.15, borderRadius: 999, bgcolor: active ? "#F5E9CF" : "#EEE9DF", color: active ? "#6B4E12" : MUTED }}>{count}</Box>
              )}
            </Box>
          );
        })}
      </Stack>

      {error && (
        <Typography sx={{ color: "#8A2E2E", fontSize: "0.9rem" }}>{error}</Typography>
      )}
      {loading && (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress size={22} sx={{ color: "var(--gold)" }} />
        </Stack>
      )}

      {feed && tab === "upcoming" && (
        <>
          {/* Format filters */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
            {FORMAT_FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <Button key={f.key} onClick={() => setFilter(f.key)} variant={active ? "contained" : "outlined"} disableElevation sx={{ borderRadius: 999, px: 2, py: 0.6, textTransform: "none", fontWeight: 600, fontSize: "0.86rem", bgcolor: active ? INK : "#fff", color: active ? "#fff !important" : INK, borderColor: active ? INK : LINE, "&:hover": { bgcolor: active ? "#0E2A3D" : "#F6F2EA", borderColor: INK } }}>
                  {f.label}
                </Button>
              );
            })}
          </Stack>

          {spotlight ? (
            <EventSpotlight event={spotlight} now={now} tz={tz} />
          ) : (
            <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: 2.5, p: 4, textAlign: "center" }}>
              <Typography sx={{ fontFamily: DISPLAY, fontSize: "1.3rem", color: INK }}>Nothing scheduled{filter !== "all" ? " in this category" : ""} right now.</Typography>
              <Typography sx={{ color: MUTED, mt: 0.75, fontSize: "0.9rem" }}>New events are announced here first. Replays of past events are below.</Typography>
            </Box>
          )}

          {/* Coming up */}
          <Box>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography component="h2" sx={{ fontFamily: DISPLAY, fontSize: { xs: "1.4rem", md: "1.65rem" }, fontWeight: 600, color: INK }}>Coming up</Typography>
              <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
                <ViewToggle active={view === "list"} onClick={() => setView("list")} icon={<ViewListRoundedIcon sx={{ fontSize: 17 }} />} label="List" />
                <ViewToggle active={view === "month"} onClick={() => setView("month")} icon={<CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />} label="Month" />
              </Stack>
            </Stack>
            {showMonth ? <EventMonth events={upcoming} now={now} tz={tz} /> : <EventList key={filter} events={rest} now={now} />}
            <Typography sx={{ mt: 1.25, fontSize: "0.82rem", color: MUTED }}>All times Eastern. Your own time shows on each event.</Typography>
          </Box>

          {/* Replays */}
          <Box>
            <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 1.5 }}>
              <Typography component="h2" sx={{ fontFamily: DISPLAY, fontSize: { xs: "1.4rem", md: "1.65rem" }, fontWeight: 600, color: INK }}>Missed one? Watch the replay</Typography>
              {replays.length > 3 && (
                <Box component="button" type="button" onClick={() => setTab("replays")} sx={{ background: "none", border: 0, cursor: "pointer", fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: INK, fontFamily: "inherit" }}>
                  All past events →
                </Box>
              )}
            </Stack>
            <ReplayGrid events={replays} limit={3} />
          </Box>
        </>
      )}

      {feed && tab === "replays" && <ReplayGrid events={replays} />}
    </Stack>
  );
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <Button onClick={onClick} variant={active ? "contained" : "outlined"} disableElevation startIcon={icon} sx={{ borderRadius: 999, px: 1.8, py: 0.5, textTransform: "none", fontWeight: 700, fontSize: "0.84rem", bgcolor: active ? INK : "#fff", color: active ? "#fff !important" : INK, borderColor: active ? INK : LINE, "&:hover": { bgcolor: active ? "#0E2A3D" : "#F6F2EA", borderColor: INK }, "& .MuiButton-startIcon": { mr: 0.6 } }}>
      {label}
    </Button>
  );
}
