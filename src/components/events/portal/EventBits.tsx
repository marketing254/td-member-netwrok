"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Box, Button, Menu, MenuItem, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { markRegistered, useRegistered } from "./useEventsFeed";
import RegisterDialog from "./RegisterDialog";
import {
  SERIES,
  bannerSrc,
  ceLabel,
  dateLabel,
  dateTile,
  easternTimeLabel,
  eventPhase,
  googleCalendarUrl,
  icsUrl,
  initials,
  localTimeZone,
  outlookCalendarUrl,
  replayHref,
  yourTimeLabel,
  type PortalEvent,
} from "@/lib/events/portalEvents";

/*
 * Small shared pieces for the portal events pages (Lester's pick, 5 Nov
 * 2026): banner with the series gradient fallback, date tile, meta lines,
 * speaker avatars, Register and Add-to-calendar buttons.
 */

export const INK = "#0A1A2F";
export const LINE = "#E6DDCF";
export const MUTED = "#5C6770";
export const GOLD = "#D9A84B";
export const GOLD_DEEP = "#A07823";
export const DISPLAY = "var(--font-display), 'Fraunces', Georgia, serif";

export const cardSx: SxProps<Theme> = { bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: 2.5, overflow: "hidden" };

export const primaryBtn: SxProps<Theme> = {
  bgcolor: INK,
  color: "#fff !important",
  borderRadius: 999,
  px: 2.5,
  py: 1,
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.9rem",
  whiteSpace: "nowrap",
  "&:hover": { bgcolor: "#0E2A3D" },
  "&.Mui-disabled": { bgcolor: "#C9CDD2", color: "#fff !important" },
};

export const outlineBtn: SxProps<Theme> = {
  color: INK,
  borderColor: INK,
  borderRadius: 999,
  px: 2.25,
  py: 0.9,
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.9rem",
  whiteSpace: "nowrap",
  bgcolor: "#fff",
  "&:hover": { borderColor: INK, bgcolor: "#F6F2EA" },
};

/** The member's time zone, known only after mount (server renders ""). */
const noopSubscribe = () => () => {};
export function useLocalTz(): string | null {
  return useSyncExternalStore(noopSubscribe, localTimeZone, () => null);
}

export function SeriesEyebrow({ event, light = false, sx }: { event: PortalEvent; light?: boolean; sx?: SxProps<Theme> }) {
  const s = SERIES[event.series];
  return (
    <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: light ? "rgba(255,255,255,0.85)" : s.color, ...sx }}>
      {s.label}
      {event.format && event.format.toLowerCase().includes("summit") ? " · Annual summit" : ""}
    </Typography>
  );
}

/**
 * Banner. With an image: shown whole at its own shape ("natural"), or
 * cropped to fill a fixed box ("cover", for small thumbnails and card
 * grids). Without an image: the series gradient with the title on it.
 */
/** Page strip under a list or grid. Hidden when everything fits on one page. */
export function Pager({ page, pages, onChange, label }: { page: number; pages: number; onChange: (p: number) => void; label?: string }) {
  if (pages <= 1) return null;
  const btn = (p: number, text: string, disabled = false, active = false) => (
    <Box
      key={text + p}
      component="button"
      type="button"
      disabled={disabled}
      onClick={() => onChange(p)}
      sx={{ minWidth: 34, height: 34, px: 1, borderRadius: 999, border: `1px solid ${active ? INK : LINE}`, bgcolor: active ? INK : "#fff", color: active ? "#fff" : INK, fontWeight: 700, fontSize: "0.82rem", fontFamily: "inherit", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1, "&:hover": { bgcolor: active ? INK : "#F6F2EA" } }}
    >
      {text}
    </Box>
  );
  const nums: number[] = [];
  for (let p = 1; p <= pages; p++) if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
  const items: React.ReactNode[] = [btn(page - 1, "‹", page <= 1)];
  nums.forEach((p, i) => {
    if (i > 0 && p - nums[i - 1] > 1) items.push(<Typography key={`gap${p}`} sx={{ px: 0.5, color: MUTED }}>…</Typography>);
    items.push(btn(p, String(p), false, p === page));
  });
  items.push(btn(page + 1, "›", page >= pages));
  return (
    <Stack direction="row" spacing={0.75} sx={{ mt: 2, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }} aria-label={label ?? "Pages"}>
      {items}
    </Stack>
  );
}

export function EventBanner({ event, showTitle = true, fit = "natural", sx, children }: { event: PortalEvent; showTitle?: boolean; fit?: "natural" | "cover"; sx?: SxProps<Theme>; children?: React.ReactNode }) {
  const src = bannerSrc(event.bannerUrl);
  const s = SERIES[event.series];
  const [broken, setBroken] = useState(false);
  const hasImage = !!src && !broken;
  if (hasImage && fit === "natural") {
    return (
      <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", lineHeight: 0, bgcolor: "#EEE9DF", ...sx }}>
        {/* Banners come from Drive or the sheet, so a plain img (next/image needs a fixed host list). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" onError={() => setBroken(true)} style={{ display: "block", width: "100%", height: "auto" }} />
        {children}
      </Box>
    );
  }
  return (
    <Box sx={{ position: "relative", aspectRatio: "16 / 9", borderRadius: 2, overflow: "hidden", backgroundImage: s.gradient, ...sx }}>
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" onError={() => setBroken(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {!hasImage && showTitle && (
        <Box sx={{ position: "absolute", inset: 0, p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff" }}>
          <SeriesEyebrow event={event} light />
          <Box>
            <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.35rem", md: "1.9rem" }, lineHeight: 1.1, textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>{event.title}</Typography>
            {event.subtitle && <Typography sx={{ mt: 0.75, fontSize: "0.86rem", opacity: 0.92 }}>{event.subtitle}</Typography>}
          </Box>
        </Box>
      )}
      {children}
    </Box>
  );
}

export function DateTile({ iso, size = "md" }: { iso: string; size?: "sm" | "md" }) {
  const t = dateTile(iso);
  const big = size === "md";
  return (
    <Stack sx={{ alignItems: "center", justifyContent: "center", width: big ? 76 : 60, minWidth: big ? 76 : 60, py: big ? 1 : 0.6, borderRadius: 2, border: `1px solid ${LINE}`, bgcolor: "#FBF8F2" }}>
      <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", color: GOLD_DEEP }}>{t.month}</Typography>
      <Typography sx={{ fontFamily: DISPLAY, fontSize: big ? "1.7rem" : "1.35rem", lineHeight: 1, color: INK, fontWeight: 600, my: 0.25 }}>{t.day}</Typography>
      {big && <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: MUTED }}>{t.weekday}</Typography>}
    </Stack>
  );
}

export function CeChip({ credits, small = false }: { credits: number | null; small?: boolean }) {
  const label = ceLabel(credits);
  if (!label) return null;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: small ? 0.9 : 1.2, py: 0.3, borderRadius: 999, bgcolor: "#F5E9CF", color: "#6B4E12", fontSize: small ? "0.7rem" : "0.76rem", fontWeight: 700, whiteSpace: "nowrap" }}>
      <StarRoundedIcon sx={{ fontSize: small ? 12 : 14 }} /> {small ? label.replace(" credits", " CE").replace(" credit", " CE").replace("CE CE", "CE") : label}
    </Box>
  );
}

/** The three meta lines: date and time (Eastern + the member's own), format, speakers. */
export function EventMeta({ event, tz, compact = false }: { event: PortalEvent; tz: string | null; compact?: boolean }) {
  const yours = yourTimeLabel(event.startsAt, tz);
  const rowSx = { display: "flex", alignItems: "center", gap: 0.9, fontSize: compact ? "0.84rem" : "0.9rem", color: "#3B4A55", lineHeight: 1.5 };
  const iconSx = { fontSize: 17, color: GOLD_DEEP, flexShrink: 0 };
  const experts = event.speakers.filter((s) => s.expertId).length;
  return (
    <Stack spacing={0.6}>
      <Box sx={rowSx}>
        <CalendarMonthOutlinedIcon sx={iconSx} />
        <span>
          {dateLabel(event.startsAt)} · {easternTimeLabel(event.startsAt)}
          {yours && <Box component="span" sx={{ color: MUTED }}> ({yours})</Box>}
        </span>
      </Box>
      {event.format && (
        <Box sx={rowSx}>
          <MicNoneOutlinedIcon sx={iconSx} />
          <span>{event.format}</span>
        </Box>
      )}
      {event.speakers.length > 0 && (
        <Box sx={rowSx}>
          <PeopleOutlineRoundedIcon sx={iconSx} />
          <span>
            {event.speakers.length} speaker{event.speakers.length === 1 ? "" : "s"}
            {experts ? `, ${experts} of them in this network` : ""}
          </span>
        </Box>
      )}
    </Stack>
  );
}

export function SpeakerAvatars({ event, max = 4 }: { event: PortalEvent; max?: number }) {
  if (!event.speakers.length) return null;
  const shown = event.speakers.slice(0, max);
  const rest = event.speakers.length - shown.length;
  const s = SERIES[event.series];
  return (
    <Stack direction="row" sx={{ alignItems: "center" }}>
      {shown.map((sp, i) => (
        <Box key={sp.name + i} title={sp.name} sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: i % 2 ? GOLD_DEEP : s.color, color: "#fff", fontSize: "0.68rem", fontWeight: 800, display: "grid", placeItems: "center", border: "2px solid #fff", ml: i ? -1 : 0, overflow: "hidden" }}>
          {sp.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sp.photoUrl} alt={sp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials(sp.name)
          )}
        </Box>
      ))}
      {rest > 0 && (
        <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#EEE9DF", color: INK, fontSize: "0.68rem", fontWeight: 800, display: "grid", placeItems: "center", border: "2px solid #fff", ml: -1 }}>+{rest}</Box>
      )}
    </Stack>
  );
}

/**
 * Register. In-portal events (a Zoom webinar id on the row, or the summit)
 * open the registration form right here; other events open the link from
 * the sheet in a new tab. While live the button says Join; once ended it
 * becomes "Watch the replay".
 */
export function RegisterButton({ event, now, size = "md", fullWidth = false, label }: { event: PortalEvent; now: number; size?: "sm" | "md"; fullWidth?: boolean; label?: string }) {
  const phase = eventPhase(event, now);
  const [open, setOpen] = useState(false);
  const registered = useRegistered(event);
  const sx = { ...primaryBtn, ...(size === "sm" ? { px: 2, py: 0.6, fontSize: "0.84rem" } : {}), ...(fullWidth ? { width: "100%" } : {}) };

  if (phase === "ended") {
    const href = replayHref(event);
    if (!href) return <Typography sx={{ fontSize: "0.84rem", color: MUTED, fontWeight: 600 }}>Replay on its way</Typography>;
    return (
      <Button component={Link} href={href} variant="contained" disableElevation startIcon={<PlayArrowRoundedIcon />} sx={sx}>
        Watch the replay
      </Button>
    );
  }
  if (registered) {
    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1.6, py: 0.7, borderRadius: 999, bgcolor: "#E8F3EC", color: "#1E6B3A", fontSize: "0.84rem", fontWeight: 700, whiteSpace: "nowrap", ...(fullWidth ? { width: "100%", justifyContent: "center" } : {}) }}>
        <CheckRoundedIcon sx={{ fontSize: 16 }} /> {phase === "live" ? "Registered · check your email for the link" : "You’re registered"}
      </Box>
    );
  }
  const text = label ?? (phase === "live" ? "Join now →" : "Register →");
  if (event.registerInPortal) {
    return (
      <>
        <Button type="button" onClick={() => setOpen(true)} variant="contained" disableElevation sx={sx}>
          {text}
        </Button>
        {open && <RegisterDialog event={event} open={open} onClose={() => setOpen(false)} onRegistered={() => markRegistered(event.slug)} />}
      </>
    );
  }
  if (!event.registerUrl) {
    return <Typography sx={{ fontSize: "0.84rem", color: MUTED, fontWeight: 600 }}>Registration opens soon</Typography>;
  }
  if (event.registerUrl.startsWith("/")) {
    return (
      <Button component={Link} href={event.registerUrl} variant="contained" disableElevation sx={sx}>
        {text}
      </Button>
    );
  }
  return (
    <Button component="a" href={event.registerUrl} target="_blank" rel="noopener noreferrer" variant="contained" disableElevation sx={sx}>
      {text}
    </Button>
  );
}

/** "+ Add to calendar" menu: Google, Outlook, Apple (.ics). */
export function AddToCalendar({ event, size = "md", fullWidth = false, label = "+ Add to calendar" }: { event: PortalEvent; size?: "sm" | "md"; fullWidth?: boolean; label?: string }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : undefined;
  const sx = { ...outlineBtn, ...(size === "sm" ? { px: 1.8, py: 0.5, fontSize: "0.84rem" } : {}), ...(fullWidth ? { width: "100%" } : {}) };
  return (
    <>
      <Button variant="outlined" onClick={(e) => setAnchor(e.currentTarget)} sx={sx} aria-haspopup="menu" aria-expanded={!!anchor}>
        {label}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { borderRadius: 2, border: `1px solid ${LINE}`, minWidth: 180 } } }}>
        <MenuItem component="a" href={googleCalendarUrl(event, origin)} target="_blank" rel="noopener noreferrer" onClick={() => setAnchor(null)}>Google Calendar</MenuItem>
        <MenuItem component="a" href={outlookCalendarUrl(event, origin)} target="_blank" rel="noopener noreferrer" onClick={() => setAnchor(null)}>Outlook</MenuItem>
        <MenuItem component="a" href={icsUrl(event.slug)} onClick={() => setAnchor(null)}>Apple Calendar (.ics)</MenuItem>
      </Menu>
    </>
  );
}

/** The three calendar buttons side by side (event page). */
export function CalendarButtons({ event }: { event: PortalEvent }) {
  const origin = typeof window !== "undefined" ? window.location.origin : undefined;
  const sx = { ...outlineBtn, px: 1, py: 0.7, fontSize: "0.84rem", flex: 1, minWidth: 0 };
  return (
    <Stack direction="row" spacing={1}>
      <Button component="a" href={googleCalendarUrl(event, origin)} target="_blank" rel="noopener noreferrer" variant="outlined" sx={sx}>Google</Button>
      <Button component="a" href={outlookCalendarUrl(event, origin)} target="_blank" rel="noopener noreferrer" variant="outlined" sx={sx}>Outlook</Button>
      <Button component="a" href={icsUrl(event.slug)} variant="outlined" sx={sx}>Apple</Button>
    </Stack>
  );
}

export function StartsIn({ event, now, align = "right" }: { event: PortalEvent; now: number; align?: "left" | "right" }) {
  const phase = eventPhase(event, now);
  const label = phase === "live" ? "Live now" : phase === "ended" ? "Ended" : null;
  const t = Math.max(0, Math.floor((Date.parse(event.startsAt) - now) / 1000));
  const d = Math.floor(t / 86400);
  const h = Math.floor((t % 86400) / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const clock = d > 0 ? `${d} d ${h} h ${m} m` : h > 0 ? `${h} h ${m} m ${s} s` : `${m} m ${s} s`;
  return (
    <Box sx={{ textAlign: align }}>
      <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP, display: "flex", alignItems: "center", gap: 0.5, justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        {phase === "upcoming" && <ScheduleOutlinedIcon sx={{ fontSize: 13 }} />} {phase === "upcoming" ? "Starts in" : "Status"}
      </Typography>
      <Typography suppressHydrationWarning sx={{ fontFamily: DISPLAY, fontSize: { xs: "1.5rem", md: "1.8rem" }, fontWeight: 600, color: INK, lineHeight: 1.1, mt: 0.25, fontVariantNumeric: "tabular-nums" }}>
        {label ?? clock}
      </Typography>
    </Box>
  );
}
