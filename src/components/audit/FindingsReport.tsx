"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Link from "next/link";
import { AUDIT_COPY } from "@/lib/tools/foundMoney/pack";

/**
 * The Found Money report, shared by the free estimate page, the member
 * portal and the admin preview. `locked` findings render a blurred title
 * and amount with the unlock button; everything else renders in full.
 */
export type ReportFinding = {
  title: string;
  why: string | null;
  action: string | null;
  script: string | null;
  annual_saving: number;
  confidence: "high" | "medium" | "low";
  locked: boolean;
};

const INK = "#0A1A2F";
const MUTED = "#5C6770";
const GOLD = "#D9A84B";
const GOLD_DEEP = "#A07823";
const LINE = "#E6DDCF";
const DISPLAY = "var(--font-display), 'Fraunces', Georgia, serif";

export const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function FindingsReport({
  practiceName,
  headline,
  findings,
  alreadyFine,
  limits,
  checked,
  unlockHref,
  lockedTotal,
}: {
  practiceName: string | null;
  headline: number;
  findings: ReportFinding[];
  alreadyFine: string[];
  limits: string[];
  /** true once a person has reviewed and released it */
  checked: boolean;
  unlockHref?: string;
  lockedTotal?: number;
}) {
  const lockedCount = findings.filter((f) => f.locked).length;
  const confLabel = { high: "From your document", medium: "Against a benchmark", low: "Worth checking" } as const;

  return (
    <Stack spacing={3}>
      {/* Headline */}
      <Box sx={{ bgcolor: INK, color: "#fff", borderRadius: "20px", p: { xs: 2.25, md: 3 }, backgroundImage: "radial-gradient(900px 400px at 10% -20%, rgba(14,42,61,0.95), #06182A 70%)" }}>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#F0C16E" }}>
          {checked ? "Your checked report" : "Your instant estimate"}
        </Typography>
        {practiceName && <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.2rem", md: "1.45rem" }, mt: 0.5, color: "#fff" }}>{practiceName}</Typography>}
        <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", mt: 0.25 }}>
          {checked ? "Every line checked by a person on our team" : "Read by our tool just now · not yet checked by a person"}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { sm: "baseline" }, gap: { xs: 0.5, sm: 2 }, mt: 2 }}>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "2.2rem", md: "2.8rem" }, lineHeight: 1, color: "#F0C16E" }}>
            {headline > 0 ? `~${usd(headline)}` : "$0"}
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)" }}>
            {headline > 0 ? "a year you may be overpaying" : "counted so far. See the notes below for what we could and could not read."}
          </Typography>
        </Stack>
      </Box>

      {/* Findings */}
      <Stack spacing={1.5}>
        {findings.map((f, i) => (
          <Box key={i} sx={{ position: "relative", bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: "16px", p: { xs: 2, md: 2.5 }, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "36px 1fr auto" }, gap: 2, alignItems: "start", overflow: "hidden" }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: f.locked ? "rgba(14,42,61,0.08)" : GOLD, color: INK, display: "grid", placeItems: "center", fontWeight: 800 }}>
              {f.locked ? <LockRoundedIcon sx={{ fontSize: 18 }} /> : i + 1}
            </Box>
            <Box sx={{ minWidth: 0, filter: f.locked ? "blur(6px)" : "none", userSelect: f.locked ? "none" : "auto", pointerEvents: f.locked ? "none" : "auto" }}>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.3, color: INK }}>{f.locked ? scramble(f.title) : f.title}</Typography>
              {!f.locked && f.why && <Typography sx={{ mt: 0.75, color: "#3B4A55", lineHeight: 1.55, fontSize: "0.92rem" }}>{f.why}</Typography>}
              {!f.locked && f.action && (
                <Typography sx={{ mt: 1, fontSize: "0.9rem", lineHeight: 1.55, color: INK }}>
                  <strong>What to do:</strong> {f.action}
                </Typography>
              )}
              {!f.locked && f.script && (
                <Box sx={{ mt: 1.25, p: 1.5, bgcolor: "rgba(217,168,75,0.12)", borderRadius: "10px", fontSize: "0.88rem", lineHeight: 1.55, color: INK }}>
                  <strong>What to say:</strong> “{f.script}”
                </Box>
              )}
              <Typography sx={{ mt: 1, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: f.confidence === "low" ? MUTED : GOLD_DEEP }}>
                {confLabel[f.confidence]}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { sm: "right" }, filter: f.locked ? "blur(6px)" : "none", userSelect: f.locked ? "none" : "auto" }}>
              <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "1.2rem", color: INK, lineHeight: 1 }}>{usd(f.annual_saving)}</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: MUTED }}>a year{f.confidence === "low" ? ", not counted" : ""}</Typography>
            </Box>
            {f.locked && (
              <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", bgcolor: "rgba(251,248,241,0.35)" }}>
                <Typography sx={{ px: 1.5, py: 0.6, borderRadius: 999, bgcolor: INK, color: "#fff", fontSize: "0.78rem", fontWeight: 700 }}>Join to unlock</Typography>
              </Box>
            )}
          </Box>
        ))}
        {findings.length === 0 && (
          <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: "16px", p: 2.5, color: "#3B4A55" }}>
            Nothing on these documents produced a finding we would stand behind yet. The notes below say what we read and what we could not.
          </Box>
        )}
      </Stack>

      {/* The lock */}
      {lockedCount > 0 && unlockHref && (
        <Box sx={{ bgcolor: "#FBF3E1", border: `1px solid rgba(160,120,35,0.35)`, borderRadius: "20px", p: { xs: 2.5, md: 3 } }}>
          <Typography sx={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: { xs: "1.1rem", md: "1.25rem" }, color: INK }}>
            {lockedCount === 1 ? "One more fix" : `${lockedCount} more fixes`}
            {lockedTotal && lockedTotal > 0 ? ` worth about ${usd(lockedTotal)} a year` : ""}
          </Typography>
          <Typography sx={{ mt: 0.75, color: "#3B4A55" }}>Join to unlock:</Typography>
          <Stack component="ul" spacing={0.5} sx={{ pl: 2.5, my: 1, color: INK, fontSize: "0.95rem" }}>
            <li>Every fix, with exactly what to do</li>
            <li>A person on our team checking every line</li>
            <li>The call scripts and a 20-minute walkthrough</li>
          </Stack>
          <Button component={Link} href={unlockHref} variant="contained" disableElevation sx={{ mt: 1, bgcolor: GOLD, color: `${INK} !important`, fontWeight: 800, fontSize: "0.95rem", borderRadius: 999, px: 3, py: 1.1, textTransform: "none", "&:hover": { bgcolor: "#F0C16E" } }}>
            {AUDIT_COPY.unlock}
          </Button>
          <Typography sx={{ mt: 1.25, fontSize: "0.8rem", color: MUTED }}>{AUDIT_COPY.unlockSub}</Typography>
          <Typography sx={{ mt: 1, fontSize: "0.82rem", color: INK, fontWeight: 600 }}>{AUDIT_COPY.promise}</Typography>
        </Box>
      )}

      {/* Already fine + limits */}
      {(alreadyFine.length > 0 || limits.length > 0) && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: alreadyFine.length && limits.length ? "1fr 1fr" : "1fr" }, gap: 2 }}>
          {alreadyFine.length > 0 && (
            <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: "16px", p: 2.25 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#2C7A52", mb: 1 }}>Already fine</Typography>
              <Stack spacing={0.75}>
                {alreadyFine.map((x) => (
                  <Stack key={x} direction="row" spacing={1} sx={{ alignItems: "flex-start", fontSize: "0.9rem", color: "#3B4A55" }}>
                    <CheckRoundedIcon sx={{ fontSize: 16, color: "#2C7A52", mt: "3px" }} />
                    <span>{x}</span>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
          {limits.length > 0 && (
            <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: "16px", p: 2.25 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, mb: 1 }}>What we could not read or compare</Typography>
              <Stack component="ul" spacing={0.5} sx={{ pl: 2.25, m: 0, fontSize: "0.88rem", color: "#3B4A55" }}>
                {limits.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      )}

      {!checked && <Typography sx={{ fontSize: "0.82rem", color: MUTED }}>{AUDIT_COPY.estimateNote}</Typography>}
    </Stack>
  );
}

/** Blurred text still leaks length and shape; swap letters so nothing is readable even unblurred. */
function scramble(s: string): string {
  return s.replace(/[A-Za-z]/g, (c) => (c === c.toUpperCase() ? "X" : "x")).replace(/\d/g, "0");
}
