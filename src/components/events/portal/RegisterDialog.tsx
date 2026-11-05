"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { EVENT_COUNTRIES, JOB_TITLES, MEMBER_INTEREST, countryOptions, type JobTitle } from "@/lib/events/summitForm";
import { dateLabel, easternTimeLabel, type PortalEvent } from "@/lib/events/portalEvents";
import { DISPLAY, GOLD_DEEP, INK, LINE, MUTED, primaryBtn } from "./EventBits";

/*
 * In-portal registration (Rushdha, 5 Nov 2026). Small, scrollable form.
 * Name, email, phone and practice come from the member row; the member
 * confirms phone and practice, answers the event's questions, and clicks
 * Register. The seat is booked through the registrants sheet and n8n;
 * Zoom emails the join link.
 *
 * Two question sets (each mirrors what the Zoom webinar requires):
 *   rida  — phone, practice website and name, role, country, optional question
 *   event — phone, role, practice name and website, country (incl. Australia),
 *           a question (required), and on DMS webinars the membership question
 */

type Prefill = {
  paid: boolean;
  firstName: string;
  lastName: string;
  email: string;
  accountEmail: string;
  phone: string;
  practiceName: string;
  geoCountry: string;
  registration: { status: string } | null;
};

/* Slim scrollbar for the form (the default one looks heavy on the small
 * dialog). A function, not a module constant: EventBits imports this file
 * and this file imports EventBits, so LINE is not initialised at load time. */
const scrollSx = () => ({
  scrollbarWidth: "thin" as const,
  scrollbarColor: `${LINE} transparent`,
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { background: "transparent", marginTop: 12, marginBottom: 12 },
  "&::-webkit-scrollbar-thumb": { backgroundColor: LINE, borderRadius: 999, "&:hover": { backgroundColor: "#CFC4B2" } },
});

const FIELD = {
  size: "small" as const,
  sx: {
    "& .MuiOutlinedInput-root": { borderRadius: 1.25, bgcolor: "#fff", fontSize: "0.88rem" },
    "& .MuiInputLabel-root": { fontSize: "0.86rem" },
    "& .MuiFormHelperText-root": { fontSize: "0.72rem", mx: 0.5 },
  },
};

export default function RegisterDialog({ event, open, onClose, onRegistered }: { event: PortalEvent; open: boolean; onClose: () => void; onRegistered: () => void }) {
  const rida = event.registrationKind === "rida";
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [practice, setPractice] = useState("");
  const [jobTitle, setJobTitle] = useState<JobTitle | "">("");
  const [country, setCountry] = useState("US");
  const [question, setQuestion] = useState("");
  const [memberInterest, setMemberInterest] = useState("");
  const dms = !rida && event.series === "dms_live";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"new" | "already" | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    // (the dialog is unmounted on close, so state starts fresh each time)
    fetch(`/api/member/events/${encodeURIComponent(event.slug)}/register`, { credentials: "same-origin", cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error ?? "Could not load your details.");
        return (await r.json()) as Prefill;
      })
      .then((p) => {
        if (!alive) return;
        setPrefill(p);
        setEmail((cur) => cur || p.email || "");
        setPhone((cur) => cur || p.phone || "");
        setPractice((cur) => cur || p.practiceName || "");
        setCountry((cur) => (cur === "US" && p.geoCountry ? p.geoCountry : cur));
        if (p.registration && ["entitled", "zoom_requested", "zoom_registered"].includes(p.registration.status)) setDone("already");
      })
      .catch((e: Error) => alive && setLoadError(e.message));
    return () => {
      alive = false;
    };
  }, [open, event.slug]);

  const submit = async () => {
    setError(null);
    if (!jobTitle) {
      setError("Please tell us which best describes you.");
      return;
    }
    if (!rida && !question.trim()) {
      setError("Please add a question for the panel. It helps them prepare.");
      return;
    }
    if (dms && !memberInterest) {
      setError("Please tell us if you'd like to become a DMS member.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/member/events/${encodeURIComponent(event.slug)}/register`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, practiceWebsiteName: practice, jobTitle, country, speakerQuestion: question, memberInterest: dms ? memberInterest : null }),
      });
      const b = (await res.json().catch(() => ({}))) as { error?: string; status?: string };
      if (!res.ok) {
        setError(b.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(b.status === "zoom_registered" ? "already" : "new");
      onRegistered();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      fullWidth
      maxWidth="xs"
      scroll="paper"
      slotProps={{ paper: { sx: { borderRadius: 1.5, border: `1px solid ${LINE}`, maxHeight: "88vh", width: "100%", maxWidth: 440, overflow: "hidden" } } }}
    >
      <DialogContent sx={{ p: { xs: 2, md: 2.5 }, ...scrollSx() }}>
        <IconButton onClick={onClose} aria-label="Close" size="small" sx={{ position: "absolute", top: 8, right: 8 }} disabled={submitting}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>Register</Typography>
        <Typography sx={{ fontFamily: DISPLAY, fontSize: "1.25rem", fontWeight: 600, color: INK, lineHeight: 1.2, mt: 0.4, pr: 4 }}>{event.title}</Typography>
        <Typography sx={{ fontSize: "0.8rem", color: MUTED, mt: 0.35 }}>
          {dateLabel(event.startsAt)} · {easternTimeLabel(event.startsAt)}
          {event.format ? ` · ${event.format}` : ""}
        </Typography>

        {done ? (
          <Stack spacing={1.25} sx={{ mt: 2.5, alignItems: "flex-start" }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 38, color: "#1E6B3A" }} />
            <Typography sx={{ fontFamily: DISPLAY, fontSize: "1.2rem", fontWeight: 600, color: INK }}>{done === "already" ? "You already have a seat" : "You're registered"}</Typography>
            <Typography sx={{ fontSize: "0.88rem", color: "#2C3A45", lineHeight: 1.55 }}>
              {done === "already"
                ? "Your Zoom link was emailed to you when you registered. Check your inbox, and your spam folder if it is not there."
                : "Zoom is emailing your personal join link now. It usually arrives within a few minutes. Check your spam folder if it is not there."}
            </Typography>
            <Button onClick={onClose} variant="contained" disableElevation size="small" sx={{ ...primaryBtn, mt: 0.5, px: 2.25, py: 0.7, fontSize: "0.84rem" }}>Done</Button>
          </Stack>
        ) : loadError ? (
          <Alert severity="error" sx={{ mt: 2, fontSize: "0.84rem" }}>{loadError}</Alert>
        ) : !prefill ? (
          <Stack sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress size={20} sx={{ color: "var(--gold)" }} />
          </Stack>
        ) : !prefill.paid ? (
          <Alert severity="warning" sx={{ mt: 2, fontSize: "0.84rem" }}>Your membership isn&apos;t active yet. Activate it from your Profile page to register for events.</Alert>
        ) : (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); void submit(); }} sx={{ mt: 2 }}>
            <Stack spacing={1.5}>
              <Box sx={{ px: 1.25, py: 1, borderRadius: 1.25, bgcolor: "#FBF8F2", border: `1px solid ${LINE}` }}>
                <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>Registering as</Typography>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: INK, mt: 0.2 }}>{prefill.firstName} {prefill.lastName}</Typography>
                <Typography sx={{ fontSize: "0.78rem", color: MUTED }}>Member account · {prefill.accountEmail}</Typography>
              </Box>

              <TextField {...FIELD} label="Email for your Zoom link" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required helperText={email.trim().toLowerCase() !== prefill.accountEmail.toLowerCase() ? "Different from your member email. Your seat is still recorded under your membership." : "Change it if you want the link sent somewhere else."} />
              <TextField {...FIELD} label="Mobile phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" required placeholder="+1 555 123 4567" />
              <TextField {...FIELD} label={rida ? "Practice website and name" : "Practice name and website"} value={practice} onChange={(e) => setPractice(e.target.value)} required placeholder="Riverside Family Dental · riversidedental.com" />

                  <Box>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: INK, mb: 0.6 }}>Which best describes you?</Typography>
                    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.6 }}>
                      {JOB_TITLES.map((j) => {
                        const on = jobTitle === j.value;
                        return (
                          <Button key={j.value} type="button" size="small" onClick={() => setJobTitle(j.value)} variant={on ? "contained" : "outlined"} disableElevation sx={{ borderRadius: 999, textTransform: "none", fontWeight: 600, fontSize: "0.76rem", px: 1.4, py: 0.3, minWidth: 0, bgcolor: on ? INK : "#fff", color: on ? "#fff !important" : INK, borderColor: on ? INK : LINE, "&:hover": { bgcolor: on ? "#0E2A3D" : "#F6F2EA", borderColor: INK } }}>
                            {j.label}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>
                  <TextField {...FIELD} select label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
                    {(rida ? countryOptions() : EVENT_COUNTRIES).map((c) => (
                      <MenuItem key={c.code} value={c.code} sx={{ fontSize: "0.88rem" }}>{c.name}</MenuItem>
                    ))}
                  </TextField>

              <TextField {...FIELD} label={rida ? "A question for the speakers (optional)" : "What question would you like the panel to address?"} value={question} onChange={(e) => setQuestion(e.target.value)} multiline minRows={2} required={!rida} slotProps={{ htmlInput: { maxLength: rida ? 1000 : 128 } }} helperText={rida ? undefined : `${question.length}/128`} />

              {dms && (
                <Box>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: INK, mb: 0.6 }}>Would you like to become a DMS member?</Typography>
                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.6 }}>
                    {MEMBER_INTEREST.map((m) => {
                      const on = memberInterest === m.value;
                      return (
                        <Button key={m.value} type="button" size="small" onClick={() => setMemberInterest(m.value)} variant={on ? "contained" : "outlined"} disableElevation sx={{ borderRadius: 999, textTransform: "none", fontWeight: 600, fontSize: "0.76rem", px: 1.4, py: 0.3, minWidth: 0, bgcolor: on ? INK : "#fff", color: on ? "#fff !important" : INK, borderColor: on ? INK : LINE, "&:hover": { bgcolor: on ? "#0E2A3D" : "#F6F2EA", borderColor: INK } }}>
                          {m.label}
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {error && <Alert severity="error" sx={{ fontSize: "0.82rem", py: 0.25 }}>{error}</Alert>}

              <Button type="submit" variant="contained" disableElevation disabled={submitting} sx={{ ...primaryBtn, py: 0.9, fontSize: "0.88rem" }}>
                {submitting ? "Booking your seat…" : "Register →"}
              </Button>
              <Typography sx={{ fontSize: "0.72rem", color: MUTED, lineHeight: 1.45 }}>
                We register you with the event organiser, so your name and email are shared with them. Your Zoom link is emailed to you within a few minutes.
              </Typography>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
