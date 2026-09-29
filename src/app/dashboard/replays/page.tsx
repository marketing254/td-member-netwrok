"use client";

import Link from "next/link";
import Image from "next/image";
import { Box, Button, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { EditorialHeader } from "@/components/member/Editorial";
import { EVENT_REPLAYS, type ReplayEntry } from "@/lib/events/ridaReplay";

/*
 * Event Replays (RIDA brief, 29 Sep 2026): every event we run or take part
 * in, kept here in full, with chapters. One card per event, newest first.
 * Greyed "Coming" cards show what lands here next.
 */

const INK = "#0A1A2F";
const LINE = "#E6DDCF";
const MUTED = "#5C6770";
const GOLD_DEEP = "#A07823";
const DISPLAY = "var(--font-display), 'Fraunces', Georgia, serif";

export default function EventReplaysPage() {
  const entries = [...EVENT_REPLAYS].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <Stack spacing={3.5}>
      <EditorialHeader
        eyebrow="Member portal · Event Replays"
        title="Event Replays"
        standfirst="Every event we run or take part in, kept here in full, with chapters so you can jump to the part you need."
      />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: 2.5 }}>
        {entries.map((e) => (
          <ReplayCard key={e.slug} entry={e} />
        ))}
      </Box>
    </Stack>
  );
}

function ReplayCard({ entry }: { entry: ReplayEntry }) {
  const live = entry.status === "live";
  const body = (
    <Stack
      sx={{
        height: "100%",
        bgcolor: "#fff",
        border: `1px solid ${LINE}`,
        borderRadius: 2.5,
        overflow: "hidden",
        opacity: live ? 1 : 0.78,
        transition: "transform 160ms ease, box-shadow 160ms ease",
        ...(live ? { "&:hover": { transform: "translateY(-2px)", boxShadow: "0 16px 36px rgba(10,26,47,0.14)" } } : {}),
      }}
    >
      <Box sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: "#0E2A3D", backgroundImage: "linear-gradient(160deg, #0E2A3D 0%, #06182A 100%)" }}>
        {entry.banner ? (
          <Image src={entry.banner} alt={entry.title} fill sizes="(max-width: 900px) 100vw, 420px" style={{ objectFit: "cover", filter: live ? "none" : "grayscale(0.4) brightness(0.55)" }} />
        ) : (
          <Typography sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", px: 3, textAlign: "center" }}>
            Chairside episodes land here too
          </Typography>
        )}
        {!live && entry.banner && (
          <Typography sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", fontSize: "0.88rem", fontWeight: 600, px: 3, textAlign: "center", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            {entry.dateLabel} · replay lands here after the event
          </Typography>
        )}
        {live && (
          <>
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 60, height: 60, borderRadius: "50%", bgcolor: "rgba(217,168,75,0.95)", color: INK, display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}>
              <PlayArrowRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            {entry.runtime && (
              <Box sx={{ position: "absolute", right: 10, bottom: 10, px: 1, py: 0.35, borderRadius: 1, bgcolor: "rgba(6,24,42,0.85)", color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>
                {entry.runtime}
              </Box>
            )}
          </>
        )}
      </Box>
      <Stack sx={{ p: 2.25, flex: 1 }} spacing={0.75}>
        <Typography sx={{ fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD_DEEP }}>{entry.eyebrow}</Typography>
        <Typography component="h3" sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.25rem", lineHeight: 1.2, color: INK }}>{entry.title}</Typography>
        <Typography sx={{ fontSize: "0.88rem", color: "#3B4A55", lineHeight: 1.55 }}>
          {entry.blurb}
          {entry.speakers ? ` ${entry.speakers}.` : ""}
        </Typography>
        <Stack direction="row" sx={{ mt: "auto", pt: 1.5, alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "0.78rem", color: MUTED }}>{entry.footnote}</Typography>
          {live ? (
            <Button component="span" size="small" variant="contained" disableElevation sx={{ bgcolor: INK, color: "#fff !important", borderRadius: 999, px: 2, textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#0E2A3D" } }}>
              Watch
            </Button>
          ) : (
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: MUTED }}>Coming</Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
  return live ? (
    <Link href={`/dashboard/replays/${entry.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      {body}
    </Link>
  ) : (
    body
  );
}
