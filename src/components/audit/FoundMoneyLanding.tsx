"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, CircularProgress, Container, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Header from "@/components/sections/Header";
import { AUDIT_COPY, AUDIT_SLOTS, type AuditSlot } from "@/lib/tools/foundMoney/pack";

/*
 * /audit/found-money: the free first step. An email and three documents,
 * no card. Then the estimate page with the headline and the first fix;
 * the rest is locked behind membership. Copy from Lester's walkthrough,
 * steps 2 and 3, and his email of 30 Sep (promise line, privacy line).
 */

const INK = "#0A1A2F";
const NAVY = "#0E2A3D";
const MUTED = "#5C6770";
const BODY = "#3B4A55";
const GOLD = "#D9A84B";
const GOLD_LIGHT = "#F0C16E";
const GOLD_DEEP = "#A07823";
const GREEN = "#2C7A52";
const CREAM = "#F7F5F0";
const LINE = "#E6DDCF";
const DISPLAY = "var(--font-display), 'Fraunces', Georgia, serif";
// Mirrors lib/tools/secondOpinion/extract.ts, which is server-only.
const SO_ACCEPTED_EXT = [".pdf", ".png", ".jpg", ".jpeg", ".webp"] as const;
const SO_MAX_BYTES = 15 * 1024 * 1024;

const WHAT_WE_READ = [
  { icon: CreditCardOutlinedIcon, title: "Card fees", body: "Your real processing rate, and the words to use to get it cut." },
  { icon: Inventory2OutlinedIcon, title: "Supplies", body: "Your prices, item by item, against what other members pay." },
  { icon: ReceiptLongOutlinedIcon, title: "Subscriptions", body: "Software and services you pay for twice, or no longer use." },
];

const STEPS = [
  { n: "1", title: "Upload", body: "Three documents. Free, no card." },
  { n: "2", title: "See your number", body: "An estimate in minutes." },
  { n: "3", title: "Members unlock", body: "Every fix, checked by a person." },
];

/** Shown on the full-screen overlay while the upload is read. Timed, since the API gives no progress. */
const LOADING_STAGES = [
  { at: 0, label: "Uploading your documents" },
  { at: 6, label: "Reading each page" },
  { at: 22, label: "Working out your number" },
  { at: 50, label: "Almost there, checking the maths" },
];

const SLOT_ICON = { card_processing: CreditCardOutlinedIcon, supplies: Inventory2OutlinedIcon, card_statement: ReceiptLongOutlinedIcon } as const;

export default function FoundMoneyLanding() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [practice, setPractice] = useState("");
  const [files, setFiles] = useState<Record<AuditSlot, File[]>>({ card_processing: [], supplies: [], card_statement: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const total = Object.values(files).reduce((n, a) => n + a.length, 0);
  const slotsDone = AUDIT_SLOTS.filter((s) => files[s.slot].length > 0).length;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const started = Date.now();
    const id = window.setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 500);
    return () => {
      window.clearInterval(id);
      setElapsed(0);
    };
  }, [busy]);
  const stageIndex = LOADING_STAGES.reduce((idx, s, i) => (elapsed >= s.at ? i : idx), 0);
  // Eases toward 92% over ~75s; the redirect finishes it.
  const progress = Math.min(92, Math.round(100 * (1 - Math.exp(-elapsed / 30))));

  const pick = (slot: AuditSlot, list: FileList | null, multiple: boolean) => {
    if (!list) return;
    const arr = Array.from(list).slice(0, multiple ? 3 : 1);
    for (const f of arr) {
      const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
      if (!(SO_ACCEPTED_EXT as readonly string[]).includes(ext)) return setError(`${f.name}: use a PDF or a photo (PNG, JPG).`);
      if (f.size > SO_MAX_BYTES) return setError(`${f.name}: files up to 15 MB.`);
    }
    setError(null);
    setFiles((p) => ({ ...p, [slot]: arr }));
  };

  const submit = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Enter the email we should send your number to.");
    if (total === 0) return setError("Upload at least one of the three documents.");
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("email", email.trim());
      fd.set("practice", practice.trim());
      try {
        const sp = new URLSearchParams(window.location.search);
        const utm: Record<string, string> = {};
        for (const k of ["source", "medium", "campaign", "content"]) {
          const v = sp.get(`utm_${k}`);
          if (v) utm[k] = v.slice(0, 120);
        }
        fd.set("utm", JSON.stringify(utm));
      } catch {
        /* no utm */
      }
      for (const s of AUDIT_SLOTS) for (const f of files[s.slot]) fd.append(s.slot, f, f.name);
      const res = await fetch("/api/audit/found-money", { method: "POST", body: fd });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; token?: string; error?: string };
      if (!res.ok || !body.token) {
        setError(body.error ?? "We couldn't read those documents. Please try again.");
        setBusy(false);
        return;
      }
      router.push(`/audit/found-money/${body.token}`);
    } catch {
      setError("Something went wrong on our side. Please try again.");
      setBusy(false);
    }
  };

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const overlay = busy ? (
    <Box role="status" aria-live="polite" sx={{ position: "fixed", inset: 0, zIndex: 1400, bgcolor: "rgba(6,24,42,0.92)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", p: 2 }}>
      <Box sx={{ width: "100%", maxWidth: 440, bgcolor: "#fff", borderRadius: "22px", p: { xs: 3, md: 4 }, textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>
        <Box sx={{ position: "relative", width: 72, height: 72, mx: "auto" }}>
          <CircularProgress size={72} thickness={3} sx={{ color: GOLD }} />
          <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <ReceiptLongOutlinedIcon sx={{ fontSize: 28, color: NAVY }} />
          </Box>
        </Box>
        <Typography sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: "1.35rem", color: INK, mt: 2.5, lineHeight: 1.2 }}>Reading your documents</Typography>
        <Typography sx={{ mt: 0.75, fontSize: "0.92rem", color: BODY }}>Usually about a minute. Please keep this page open.</Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 2.5, height: 8, borderRadius: "999px", bgcolor: "rgba(14,42,61,0.1)", "& .MuiLinearProgress-bar": { bgcolor: GOLD, borderRadius: "999px" } }} />
        <Stack spacing={0.9} sx={{ mt: 2.5, textAlign: "left" }}>
          {LOADING_STAGES.map((s, i) => {
            const done = i < stageIndex;
            const current = i === stageIndex;
            return (
              <Stack key={s.label} direction="row" spacing={1.25} sx={{ alignItems: "center", opacity: done || current ? 1 : 0.45 }}>
                <Box sx={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", bgcolor: done ? GREEN : current ? GOLD : "rgba(14,42,61,0.08)", color: done || current ? "#fff" : NAVY }}>
                  {done ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : current ? <CircularProgress size={12} thickness={5} sx={{ color: INK }} /> : <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(14,42,61,0.35)" }} />}
                </Box>
                <Typography sx={{ fontSize: "0.9rem", color: INK, fontWeight: current ? 700 : 500 }}>{s.label}</Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Box>
  ) : null;

  return (
    <Box sx={{ bgcolor: CREAM, color: INK, minHeight: "100vh" }}>
      {overlay}
      <Header />

      {/* Hero: navy band */}
      <Box component="section" sx={{ bgcolor: INK, color: "#fff", backgroundImage: "radial-gradient(1100px 520px at 8% -20%, rgba(14,42,61,0.95), #06182A 70%)", py: { xs: 5, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.15fr) minmax(0, 0.85fr)" }, gap: { xs: 4, md: 6 }, alignItems: "center" }}>
            <Box>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD_LIGHT }}>Found Money Audit</Typography>
                <Box component="span" sx={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", px: 1, py: 0.35, borderRadius: "999px", bgcolor: "rgba(255,255,255,0.12)" }}>Free · no card</Box>
              </Stack>
              <Typography component="h1" sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: { xs: "1.9rem", md: "2.6rem" }, lineHeight: 1.1, mt: 1.5, letterSpacing: "-0.01em", maxWidth: 560, color: "#fff" }}>
                What is your practice overpaying for?
              </Typography>
              <Typography sx={{ mt: 2, fontSize: { xs: "1rem", md: "1.05rem" }, color: "rgba(255,255,255,0.82)", lineHeight: 1.65, maxWidth: 520 }}>
                Upload three documents and see, in minutes, roughly what you are overpaying each year. Free. Members unlock every fix and a checked report.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3, alignItems: { sm: "center" } }}>
                <Button onClick={scrollToForm} variant="contained" disableElevation endIcon={<ArrowDownwardRoundedIcon sx={{ fontSize: 18 }} />} sx={{ bgcolor: GOLD, color: `${INK} !important`, fontWeight: 800, fontSize: "0.95rem", borderRadius: "999px", px: 3, py: 1.15, textTransform: "none", "&:hover": { bgcolor: GOLD_LIGHT } }}>
                  See my number, free
                </Button>
                <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>Takes about two minutes. Photos from a phone are fine.</Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} sx={{ mt: 3.5, alignItems: "flex-start", maxWidth: 560, bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", p: 1.75 }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 20, color: GOLD_LIGHT, mt: "2px", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.86rem", lineHeight: 1.55, color: "rgba(255,255,255,0.9)" }}>{AUDIT_COPY.promise}</Typography>
              </Stack>
            </Box>

            {/* What we read */}
            <Box sx={{ bgcolor: "#fff", color: INK, borderRadius: "22px", p: { xs: 2.5, md: 3 }, boxShadow: "0 28px 70px rgba(0,0,0,0.3)" }}>
              <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>What we read</Typography>
              <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                {WHAT_WE_READ.map(({ icon: Icon, title, body }) => (
                  <Stack key={title} direction="row" spacing={1.5} sx={{ alignItems: "flex-start", bgcolor: CREAM, border: `1px solid ${LINE}`, borderRadius: "14px", p: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "rgba(217,168,75,0.18)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 21, color: GOLD_DEEP }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.98rem", color: INK, lineHeight: 1.3 }}>{title}</Typography>
                      <Typography sx={{ mt: 0.3, fontSize: "0.86rem", color: BODY, lineHeight: 1.5 }}>{body}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1.75, color: MUTED }}>
                <LockOutlinedIcon sx={{ fontSize: 15 }} />
                <Typography sx={{ fontSize: "0.78rem" }}>{AUDIT_COPY.privacy}</Typography>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* How it works: stepper */}
      <Box component="section" sx={{ bgcolor: "#fff", borderBottom: `1px solid ${LINE}`, py: { xs: 3.5, md: 4.5 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: { xs: 1.5, sm: 3 } }}>
            {STEPS.map((s, i) => (
              <Stack key={s.n} direction="row" spacing={1.5} sx={{ alignItems: "flex-start", position: "relative" }}>
                <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: i === 2 ? NAVY : GOLD, color: i === 2 ? "#fff" : INK, fontWeight: 800, fontSize: "0.9rem", display: "grid", placeItems: "center", flexShrink: 0 }}>{s.n}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.98rem", color: INK }}>{s.title}</Typography>
                  <Typography sx={{ fontSize: "0.86rem", color: BODY, mt: 0.25 }}>{s.body}</Typography>
                </Box>
                {i < 2 && <Box sx={{ display: { xs: "none", sm: "block" }, position: "absolute", top: 17, right: -16, width: 16, height: 1, bgcolor: LINE }} />}
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Upload */}
      <Box component="section" ref={formRef} id="upload" sx={{ py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 0.8fr) minmax(0, 1.2fr)" }, gap: { xs: 3, md: 5 }, alignItems: "start" }}>
            {/* Left: what to have ready */}
            <Box sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD_DEEP }}>Step 1 of 3</Typography>
              <Typography component="h2" sx={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: { xs: "1.5rem", md: "1.9rem" }, lineHeight: 1.15, mt: 1 }}>
                Three documents, and your number in minutes.
              </Typography>
              <Typography sx={{ mt: 1.5, color: BODY, fontSize: "0.95rem", lineHeight: 1.6 }}>Free. No card. One document is enough to start, three gives the fullest number.</Typography>
              <Stack spacing={1} sx={{ mt: 2.5 }}>
                {["Your number is free. We only ask for an email to send it to.", "A person checks every line before members get the full report.", "We never copy patient details or full card numbers."].map((x) => (
                  <Stack key={x} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: "rgba(44,122,82,0.12)", display: "grid", placeItems: "center", flexShrink: 0, mt: "2px" }}>
                      <CheckRoundedIcon sx={{ fontSize: 13, color: GREEN }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.9rem", color: BODY, lineHeight: 1.5 }}>{x}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* Right: the form */}
            <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: "22px", p: { xs: 2.5, md: 3.5 }, boxShadow: "0 18px 50px rgba(24,58,88,0.08)" }}>
              <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>About you</Typography>
              <Stack spacing={1.75} sx={{ mt: 1.5 }}>
                <TextField size="small" label="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required placeholder="you@yourpractice.com" helperText="So we can send your number and follow up." />
                <TextField size="small" label="Practice name (optional)" value={practice} onChange={(e) => setPractice(e.target.value)} fullWidth placeholder="Maple Grove Family Dental" />
              </Stack>

              <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mt: 3, mb: 1.5 }}>
                <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>Your documents</Typography>
                <Typography sx={{ fontSize: "0.78rem", color: slotsDone ? GREEN : MUTED, fontWeight: 600 }}>{slotsDone} of 3 added</Typography>
              </Stack>
              <Stack spacing={1.25}>
                {AUDIT_SLOTS.map((s) => {
                  const chosen = files[s.slot];
                  const done = chosen.length > 0;
                  const Icon = SLOT_ICON[s.slot];
                  return (
                    <Box key={s.slot} component="label" sx={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 1.5, alignItems: "center", p: 1.5, border: `1.5px ${done ? "solid" : "dashed"} ${done ? GREEN : "#C9BFA9"}`, bgcolor: done ? "rgba(44,122,82,0.05)" : CREAM, borderRadius: "14px", cursor: "pointer", transition: "border-color .15s, background .15s", "&:hover": { borderColor: done ? GREEN : NAVY } }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: done ? GREEN : "rgba(14,42,61,0.08)", color: done ? "#fff" : NAVY, display: "grid", placeItems: "center" }}>
                        {done ? <CheckRoundedIcon sx={{ fontSize: 22 }} /> : <Icon sx={{ fontSize: 22 }} />}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, color: INK, fontSize: "0.95rem", lineHeight: 1.3 }}>{s.title}</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: done ? GREEN : MUTED, mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{done ? chosen.map((f) => f.name).join(", ") : s.sub}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 1.5, py: 0.7, borderRadius: "999px", border: `1.5px solid ${done ? GREEN : NAVY}`, color: done ? GREEN : NAVY, fontWeight: 700, fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        <UploadFileOutlinedIcon sx={{ fontSize: 16 }} />
                        <span>{done ? "Change" : "Upload"}</span>
                      </Box>
                      <input type="file" hidden accept={SO_ACCEPTED_EXT.join(",")} multiple={s.multiple} onChange={(e) => pick(s.slot, e.target.files, s.multiple)} />
                    </Box>
                  );
                })}
              </Stack>
              <Typography sx={{ mt: 1, fontSize: "0.76rem", color: MUTED }}>PDF or a photo (PNG, JPG), up to 15 MB each.</Typography>

              {error && <Typography sx={{ mt: 2, p: 1.5, borderRadius: "10px", bgcolor: "#FDECEC", color: "#8A1C1C", fontSize: "0.9rem" }}>{error}</Typography>}

              <Button onClick={() => void submit()} disabled={busy} variant="contained" disableElevation fullWidth sx={{ mt: 2.5, bgcolor: GOLD, color: `${INK} !important`, fontWeight: 800, borderRadius: "999px", py: 1.25, fontSize: "0.98rem", textTransform: "none", "&:hover": { bgcolor: GOLD_LIGHT }, "&.Mui-disabled": { bgcolor: "rgba(217,168,75,0.55)" } }}>
                {busy ? (
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <CircularProgress size={18} sx={{ color: INK }} />
                    <span>Reading your documents, about a minute…</span>
                  </Stack>
                ) : (
                  "Show my number"
                )}
              </Button>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", justifyContent: "center", mt: 1.5, color: MUTED }}>
                <LockOutlinedIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: "0.78rem" }}>{AUDIT_COPY.privacy}</Typography>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, borderTop: `1px solid ${LINE}`, textAlign: "center", fontSize: "0.8rem", color: MUTED }}>
        Powered by Thriving Dentist Inc.
      </Box>
    </Box>
  );
}
