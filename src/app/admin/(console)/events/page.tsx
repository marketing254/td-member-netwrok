"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import type { PortalEventsRow, PortalEventSpeaker } from "@/lib/supabase/types";
import { SERIES, SERIES_KEYS, dateLabel, easternTimeLabel, eventPhase, normalizeSeries } from "@/lib/events/portalEvents";
import { useNow } from "@/components/events/portal/useEventsFeed";

/**
 * /admin/events — the events shown inside the member portal (table
 * portal_events, migration 0080). Add or edit an event by hand here, or
 * let n8n post the sheet rows to /api/events/sync (see EVENTS-SETUP.md).
 * Times are entered in Eastern.
 */

type Form = {
  id: string | null;
  slug: string;
  title: string;
  subtitle: string;
  series: string;
  date: string; // YYYY-MM-DD (Eastern)
  time: string; // HH:MM (24h, Eastern)
  duration_minutes: string;
  format: string;
  ce_credits: string;
  speakers: string; // one per line: Name, Title, Company
  description: string;
  banner_url: string;
  register_url: string;
  zoom_webinar_id: string;
  event_key: string;
  replay_url: string;
  replay_slug: string;
  replay_runtime: string;
  is_published: boolean;
};

const EMPTY: Form = {
  id: null, slug: "", title: "", subtitle: "", series: "rida", date: "", time: "12:00", duration_minutes: "60", format: "Live on Zoom",
  ce_credits: "", speakers: "", description: "", banner_url: "", register_url: "", zoom_webinar_id: "", event_key: "", replay_url: "", replay_slug: "", replay_runtime: "", is_published: true,
};

function easternParts(iso: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${g("hour") === "24" ? "00" : g("hour")}:${g("minute")}` };
}

function toForm(r: PortalEventsRow): Form {
  const { date, time } = easternParts(r.starts_at);
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle ?? "",
    series: normalizeSeries(r.series),
    date,
    time,
    duration_minutes: String(r.duration_minutes),
    format: r.format ?? "",
    ce_credits: r.ce_credits === null ? "" : String(r.ce_credits),
    speakers: ((r.speakers ?? []) as PortalEventSpeaker[]).map((s) => [s.name, s.title, s.company].filter(Boolean).join(", ")).join("\n"),
    description: r.description ?? "",
    banner_url: r.banner_url ?? "",
    register_url: r.register_url ?? "",
    zoom_webinar_id: r.zoom_webinar_id ?? "",
    event_key: r.event_key ?? "",
    replay_url: r.replay_url ?? "",
    replay_slug: r.replay_slug ?? "",
    replay_runtime: r.replay_runtime ?? "",
    is_published: r.is_published,
  };
}

export default function AdminEventsPage() {
  const [rows, setRows] = useState<PortalEventsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      if (res.ok) setRows(((await res.json()) as { events: PortalEventsRow[] }).events ?? []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    if (!form) return;
    if (!form.title.trim()) { setError("Add a title."); return; }
    if (!form.date) { setError("Pick a date."); return; }
    setSaving(true); setError(null);
    try {
      const [hh, mm] = form.time.split(":").map(Number);
      const ampm = hh >= 12 ? "PM" : "AM";
      const h12 = hh % 12 === 0 ? 12 : hh % 12;
      const payload = {
        id: form.id,
        slug: form.slug.trim() || undefined,
        title: form.title,
        subtitle: form.subtitle,
        series: form.series,
        date: form.date,
        time: `${h12}:${String(mm || 0).padStart(2, "0")} ${ampm}`,
        duration_minutes: form.duration_minutes,
        format: form.format,
        ce_credits: form.ce_credits,
        speakers: form.speakers,
        description: form.description,
        banner_url: form.banner_url,
        register_url: form.register_url,
        zoom_webinar_id: form.zoom_webinar_id,
        event_key: form.event_key,
        replay_url: form.replay_url,
        replay_slug: form.replay_slug,
        replay_runtime: form.replay_runtime,
        is_published: form.is_published,
      };
      const res = await fetch("/api/admin/events", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const b = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setError(b.error ?? "Could not save."); return; }
      setToast(form.id ? "Saved" : "Event added");
      setForm(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r: PortalEventsRow) => {
    if (!confirm(`Delete "${r.title}"? Members will no longer see it.`)) return;
    const res = await fetch("/api/admin/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) });
    if (res.ok) { setToast("Deleted"); await load(); }
  };

  const now = useNow(60_000);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Events</Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mt: 0.5, maxWidth: 640 }}>
            What members see under Events. Times are Eastern. An event moves to Replays on its own after it ends; add the replay link here when it is ready. Rows marked “sheet” were sent by n8n from the DMN events sheet and will be overwritten on the next sync.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => { setLoading(true); void load(); }} startIcon={<RefreshOutlinedIcon />} sx={{ textTransform: "none" }}>Refresh</Button>
          <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={() => { setError(null); setForm({ ...EMPTY }); }} sx={{ textTransform: "none", borderRadius: 999 }}>
            Add event
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Stack sx={{ alignItems: "center", py: 6 }}><CircularProgress size={22} /></Stack>
      ) : rows.length === 0 ? (
        <Alert severity="info">No events yet. Add one, or run the n8n sync.</Alert>
      ) : (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
          {rows.map((r, i) => {
            const phase = eventPhase({ startsAt: r.starts_at, endsAt: new Date(Date.parse(r.starts_at) + r.duration_minutes * 60000).toISOString() }, now);
            const s = SERIES[normalizeSeries(r.series)];
            return (
              <Stack key={r.id} direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ p: 2, borderTop: i ? "1px solid" : 0, borderColor: "divider", alignItems: { md: "center" } }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
                    <Chip size="small" label={s.label} sx={{ bgcolor: s.soft, color: s.color, fontWeight: 700 }} />
                    <Chip size="small" label={phase === "ended" ? (r.replay_url || r.replay_slug ? "Replay" : "Ended, no replay yet") : phase === "live" ? "Live now" : "Upcoming"} color={phase === "live" ? "success" : "default"} variant="outlined" />
                    {!r.is_published && <Chip size="small" label="Hidden" color="warning" variant="outlined" />}
                    <Chip size="small" label={r.source === "sheet" ? "sheet" : "admin"} variant="outlined" />
                  </Stack>
                  <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{r.title}{r.subtitle ? <Box component="span" sx={{ fontWeight: 400, color: "text.secondary" }}> · {r.subtitle}</Box> : null}</Typography>
                  <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
                    {dateLabel(r.starts_at)} · {easternTimeLabel(r.starts_at)} · {r.duration_minutes} min{r.format ? ` · ${r.format}` : ""}{r.ce_credits ? ` · ${r.ce_credits} CE` : ""} · /dashboard/events/{r.slug}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={() => { setError(null); setForm(toForm(r)); }} sx={{ textTransform: "none" }}>Edit</Button>
                  <Button size="small" color="error" onClick={() => void remove(r)} sx={{ textTransform: "none" }}>Delete</Button>
                </Stack>
              </Stack>
            );
          })}
        </Box>
      )}

      <Dialog open={!!form} onClose={() => !saving && setForm(null)} fullWidth maxWidth="md">
        <DialogTitle>{form?.id ? "Edit event" : "Add event"}</DialogTitle>
        {form && (
          <DialogContent dividers>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} fullWidth required />
                <TextField select label="Series" value={form.series} onChange={(e) => set("series", e.target.value)} sx={{ minWidth: 220 }}>
                  {SERIES_KEYS.map((k) => <MenuItem key={k} value={k}>{SERIES[k].label}</MenuItem>)}
                </TextField>
              </Stack>
              <TextField label="Subtitle or topic line" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} fullWidth />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Date (Eastern)" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
                <TextField label="Start time (Eastern)" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
                <TextField label="Length (minutes)" type="number" value={form.duration_minutes} onChange={(e) => set("duration_minutes", e.target.value)} sx={{ width: 160 }} />
                <TextField label="CE credits" value={form.ce_credits} onChange={(e) => set("ce_credits", e.target.value)} placeholder="blank = none" sx={{ width: 150 }} />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Format" value={form.format} onChange={(e) => set("format", e.target.value)} placeholder="Live on Zoom · Live webinar · Virtual summit" fullWidth />
                <TextField label="Address (slug)" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="made from the title when blank" fullWidth />
              </Stack>
              <TextField label="Speakers, one per line: Name, Title, Company" value={form.speakers} onChange={(e) => set("speakers", e.target.value)} multiline minRows={3} fullWidth helperText="Add a photo link at the end of the line for a picture. A DMN expert is matched by name and gets their profile photo and link automatically." />
              <TextField label="Description (two or three short paragraphs)" value={form.description} onChange={(e) => set("description", e.target.value)} multiline minRows={4} fullWidth />
              <TextField label="Banner (Drive link or image URL, 16:9)" value={form.banner_url} onChange={(e) => set("banner_url", e.target.value)} fullWidth helperText="A Drive file must be shared as “Anyone with the link”. Blank shows the series colour with the title." />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Event key (Events Config tab)" value={form.event_key} onChange={(e) => set("event_key", e.target.value)} placeholder="event_2026_11_17" sx={{ minWidth: 240 }} helperText="With a key, members register inside the portal: registrants sheet → n8n → Zoom." />
                <TextField label="Zoom webinar ID" value={form.zoom_webinar_id} onChange={(e) => set("zoom_webinar_id", e.target.value)} sx={{ minWidth: 180 }} helperText="For reference; the Events Config row is what n8n uses." />
                <TextField label="Registration link (only when there is no event key)" value={form.register_url} onChange={(e) => set("register_url", e.target.value)} fullWidth helperText="Fallback: opens in a new tab." />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField label="Replay link (after the event)" value={form.replay_url} onChange={(e) => set("replay_url", e.target.value)} fullWidth helperText="YouTube or Vimeo plays inside the portal; any other link opens in a new tab." />
                <TextField label="In-portal replay slug" value={form.replay_slug} onChange={(e) => set("replay_slug", e.target.value)} placeholder="e.g. rida-live-2026-09-16" sx={{ minWidth: 240 }} />
                <TextField label="Runtime" value={form.replay_runtime} onChange={(e) => set("replay_runtime", e.target.value)} placeholder="2 h 06 m" sx={{ width: 140 }} />
              </Stack>
              <FormControlLabel control={<Switch checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} />} label="Visible to members" />
            </Stack>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setForm(null)} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={() => void save()} disabled={saving} sx={{ textTransform: "none" }}>{saving ? "Saving…" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2500} onClose={() => setToast(null)} message={toast} />
    </Stack>
  );
}
