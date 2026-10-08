"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import KeyboardOutlinedIcon from "@mui/icons-material/KeyboardOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import Logo from "@/components/brand/Logo";

/**
 * Shared 2-step OTP login used by every portal (member, expert, partner,
 * admin, seeker). Each role's /login page passes the endpoints + copy; the
 * UX (auto-advance to the code step, auto-submit at 6 digits, resend,
 * change-email) is identical.
 *
 * Layout (Oct 2026 redesign): one card split in two. Left, a navy brand
 * panel with the portal name and three reassurance lines. Right, the
 * form. On phones the brand panel collapses to a compact header strip.
 */

const INK = "#0A1A2F";
const NAVY = "#0E2A3D";
const NAVY_DEEP = "#06182A";
const MUTED = "#5C6770";
const LINE = "#E6DDCF";
const CREAM = "#F7F5F0";

export type OtpLoginConfig = {
  /** Role label shown in the audit row + accessible name. */
  roleLabel: string;
  /** API route that sends the OTP email. POST { email }. */
  sendEndpoint: string;
  /** API route that verifies the OTP + sets the session. POST { email, token }. */
  verifyEndpoint: string;
  /** Title shown on the email-step card. */
  emailStepTitle: string;
  /** Title shown on the code-step card. */
  codeStepTitle: string;
  /** Subtitle under each step's title. */
  emailStepSubtitle: string;
  codeStepSubtitle: string;
  /** Accent colour for links on this portal. */
  accentColor: string;
  /** Tint for hover states. */
  accentTint: string;
  /** Optional sign-up link (members only — experts/partners/admin are admin-added). */
  signupHref?: string;
  signupLabel?: string;
  /**
   * Optional human-friendly error to show when the API returns
   * "user not found" instead of the default copy.
   */
  unknownEmailMessage?: string;
  /**
   * Forward a `?next=` query param to the verify endpoint so a sign-in
   * that started mid-task lands back where it began.
   */
  forwardNextParam?: boolean;
  /** Brand panel: portal name, e.g. "Expert portal". Defaults to the role. */
  portalName?: string;
  /** Brand panel: one line under the portal name. */
  tagline?: string;
  /** Brand panel: up to three short reassurance lines. */
  highlights?: string[];
  /** Optional "New here? Watch the 5-minute tour" link under the form (experts and partners). */
  tourHref?: string;
  tourLabel?: string;
  /**
   * Brand panel look, so each portal reads as its own place. Colours are
   * the panel gradient and the accent used for the rule, kicker and ticks;
   * the pattern is a subtle decoration behind the text.
   */
  panel?: {
    from: string;
    to: string;
    accent: string;
    glow: string;
    pattern?: "circles" | "stripes" | "grid" | "none";
  };
};

const DEFAULT_PANEL = { from: "#0E2A3D", to: "#06182A", accent: "#F0C16E", glow: "rgba(217,168,75,0.22)", pattern: "circles" as const };

function patternCss(pattern: NonNullable<NonNullable<OtpLoginConfig["panel"]>["pattern"]>, accent: string): string {
  switch (pattern) {
    case "stripes":
      return `repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 18px)`;
    case "grid":
      return `radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1.5px)`;
    case "circles":
      return `radial-gradient(circle at 110% 110%, ${accent}22 0 160px, transparent 161px), radial-gradient(circle at 115% 115%, ${accent}14 0 260px, transparent 261px)`;
    default:
      return "none";
  }
}

export default function OtpLoginForm({ config }: { config: OtpLoginConfig }) {
  const router = useRouter();
  const params = useSearchParams();
  const initialError = params?.get("error") ?? null;
  const prefilledEmail = (params?.get("email") ?? "").toLowerCase();
  const prefillOnlyEmail = (params?.get("prefill") ?? "").toLowerCase();
  const isWelcome = params?.get("welcome") === "1";

  type Step = "email" | "code";
  const [step, setStep] = useState<Step>(prefilledEmail ? "code" : "email");
  const [email, setEmail] = useState(prefilledEmail || prefillOnlyEmail);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(initialError);
  const [info, setInfo] = useState<string | null>(
    prefilledEmail
      ? `Sending a 6-digit code to ${prefilledEmail}…`
      : isWelcome
        ? "Payment confirmed. Check your inbox for your confirmation email, then enter your email below and we'll send you a 6-digit sign-in code."
        : null,
  );

  const codeInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (step === "code") codeInputRef.current?.focus();
  }, [step]);

  const sendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErr("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      const res = await fetch(config.sendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        const isNotFound = res.status === 404;
        const safe = isNotFound
          ? config.unknownEmailMessage ?? "We couldn't find an account for that email."
          : body.error && res.status >= 400 && res.status < 500
            ? body.error
            : "Couldn't send your code. Please try again.";
        setErr(safe);
        return;
      }
      setStep("code");
      setInfo(`We sent a 6-digit code to ${email}. It expires in 5 minutes.`);
      setCode("");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[otp-login] send failed:", err);
      setErr("Couldn't send your code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Auto-send when arriving with ?email= (the pay-first flow sends members
  // here after checkout). The ref guards against React's double-invoke.
  const autoSentRef = useRef(false);
  useEffect(() => {
    if (prefilledEmail && !autoSentRef.current) {
      autoSentRef.current = true;
      void sendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledEmail]);

  const verifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = code.replace(/\D/g, "");
    if (cleaned.length !== 6) {
      setErr("Enter the 6-digit code we emailed you.");
      return;
    }
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      const res = await fetch(config.verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token: cleaned,
          ...(config.forwardNextParam && params?.get("next") ? { next: params.get("next") } : {}),
        }),
      });
      const body = (await res.json()) as { ok?: boolean; next?: string; error?: string };
      if (!res.ok || !body.ok || !body.next) {
        setErr(body.error ?? "That code didn't work. Request a new one and try again.");
        return;
      }
      router.push(body.next);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[otp-login] verify failed:", err);
      setErr("Couldn't verify the code right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const portalName = config.portalName ?? `${config.roleLabel.charAt(0).toUpperCase()}${config.roleLabel.slice(1)} portal`;
  const highlights = config.highlights ?? [];
  const panel = { ...DEFAULT_PANEL, ...(config.panel ?? {}) };
  const pattern = patternCss(panel.pattern, panel.accent);

  const primaryButtonSx = {
    py: 1.3,
    fontWeight: 700,
    fontSize: "0.95rem",
    textTransform: "none",
    borderRadius: "999px",
    bgcolor: `${NAVY} !important`,
    backgroundImage: "none !important",
    color: "#FFFFFF !important",
    boxShadow: "none",
    "&:hover": { bgcolor: `${NAVY_DEEP} !important`, backgroundImage: "none !important", color: "#FFFFFF !important" },
    "&.Mui-disabled": { bgcolor: "rgba(14,42,61,0.45) !important", backgroundImage: "none !important", color: "rgba(255,255,255,0.7) !important" },
  } as const;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: CREAM,
        backgroundImage:
          "radial-gradient(55% 60% at 85% 0%, rgba(217,168,75,0.14) 0%, transparent 60%), radial-gradient(45% 55% at 0% 100%, rgba(14,42,61,0.08) 0%, transparent 60%)",
        px: 2,
        py: { xs: 3, md: 6 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 980,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 5fr) minmax(0, 6fr)" },
          borderRadius: "24px",
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 1px 2px rgba(10,26,47,0.05), 0 30px 80px -30px rgba(10,26,47,0.35)",
        }}
      >
        {/* Brand panel */}
        <Box
          sx={{
            position: "relative",
            color: "#fff",
            bgcolor: panel.to,
            backgroundImage: `${pattern === "none" ? "" : pattern + ", "}radial-gradient(90% 70% at 10% 0%, ${panel.from} 0%, ${panel.to} 70%), radial-gradient(60% 50% at 100% 100%, ${panel.glow} 0%, transparent 60%)`,
            backgroundSize: panel.pattern === "grid" ? "18px 18px, auto, auto" : "auto",
            p: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: { md: 520 },
          }}
        >
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, bgcolor: panel.accent }} />
          <Box sx={{ position: "relative" }}>
            <Logo dark height={88} ariaLabel={`Dental Member Network · ${config.roleLabel} sign in`} />
            <Typography sx={{ mt: { xs: 2, md: 4 }, fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: panel.accent }}>
              Dental Member Network
            </Typography>
            <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.6rem", md: "2.1rem" }, fontWeight: 500, lineHeight: 1.1, mt: 0.75, color: "#fff" }}>
              {portalName}
            </Typography>
            {config.tagline && (
              <Typography sx={{ mt: 1.25, fontSize: "0.95rem", lineHeight: 1.6, color: "rgba(255,255,255,0.78)", maxWidth: 360 }}>{config.tagline}</Typography>
            )}
            {highlights.length > 0 && (
              <Stack spacing={1.1} sx={{ mt: 3, display: { xs: "none", md: "flex" } }}>
                {highlights.map((h) => (
                  <Stack key={h} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: `${panel.accent}33`, display: "grid", placeItems: "center", flexShrink: 0, mt: "2px" }}>
                      <CheckRoundedIcon sx={{ fontSize: 13, color: panel.accent }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.5, color: "rgba(255,255,255,0.88)" }}>{h}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
          <Typography sx={{ mt: 3, display: { xs: "none", md: "block" }, fontSize: "0.82rem", lineHeight: 1.6, color: "rgba(255,255,255,0.6)" }}>
            Sign in with a one-time code sent to your email. No password to remember.
          </Typography>
        </Box>

        {/* Form panel */}
        <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.5rem", md: "1.8rem" }, fontWeight: 500, color: INK, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            {step === "email" ? config.emailStepTitle : config.codeStepTitle}
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", color: MUTED, mt: 0.75, mb: 3, lineHeight: 1.55 }}>
            {step === "email" ? config.emailStepSubtitle : config.codeStepSubtitle}
          </Typography>

          {info && (
            <Alert severity="info" icon={<EmailOutlinedIcon fontSize="small" />} sx={{ mb: 2, fontSize: "0.85rem", borderRadius: "12px" }}>
              {info}
            </Alert>
          )}
          {err && (
            <Alert severity="error" onClose={() => setErr(null)} sx={{ mb: 2, fontSize: "0.85rem", borderRadius: "12px" }}>
              {err}
            </Alert>
          )}

          {step === "email" ? (
            <Box component="form" onSubmit={sendCode}>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                autoComplete="email"
                placeholder="you@yourpractice.com"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ fontSize: 18, color: "#7A8590" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />
              <Button type="submit" fullWidth variant="contained" disableElevation disabled={busy} endIcon={busy ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : null} sx={primaryButtonSx}>
                {busy ? "Sending code…" : "Send 6-digit code"}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={verifyCode}>
              <TextField
                inputRef={codeInputRef}
                label="6-digit code"
                fullWidth
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                  if (v.length === 6 && !busy) {
                    setTimeout(() => {
                      const form = (e.target as HTMLInputElement).form;
                      form?.requestSubmit();
                    }, 100);
                  }
                }}
                disabled={busy}
                inputMode="numeric"
                autoComplete="one-time-code"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyboardOutlinedIcon sx={{ fontSize: 18, color: "#7A8590" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      fontFamily: "var(--font-mono, ui-monospace, Menlo, monospace)",
                      fontSize: "1.25rem",
                      letterSpacing: "0.6em",
                      fontWeight: 600,
                      textAlign: "center",
                    },
                  },
                  htmlInput: { maxLength: 6, pattern: "\\d{6}" },
                }}
                sx={{ mb: 2 }}
                placeholder="••••••"
              />
              <Button type="submit" fullWidth variant="contained" disableElevation disabled={busy || code.length !== 6} endIcon={busy ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : null} sx={{ ...primaryButtonSx, mb: 1.5 }}>
                {busy ? "Verifying…" : "Verify & sign in"}
              </Button>
              <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setErr(null);
                    setInfo(null);
                  }}
                  startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
                  sx={{ color: `${MUTED} !important`, fontSize: "0.82rem", textTransform: "none", fontWeight: 600, "&:hover": { color: `${INK} !important`, bgcolor: "rgba(14,26,36,0.05)" } }}
                >
                  Use a different email
                </Button>
                <Button
                  type="button"
                  onClick={() => sendCode()}
                  disabled={busy}
                  sx={{ color: `${config.accentColor} !important`, fontSize: "0.82rem", textTransform: "none", fontWeight: 700, "&:hover": { color: `${config.accentColor} !important`, bgcolor: config.accentTint } }}
                >
                  Resend code
                </Button>
              </Stack>
            </Box>
          )}

          {(config.tourHref || config.signupHref) && (
            <Stack spacing={1} sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${LINE}` }}>
              {config.tourHref && (
                <Box
                  component="a"
                  href={config.tourHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: "0.86rem", fontWeight: 700, color: config.accentColor, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                >
                  <PlayCircleOutlinedIcon sx={{ fontSize: 18 }} />
                  {config.tourLabel ?? "New here? Watch the 5-minute tour"}
                </Box>
              )}
              {config.signupHref && (
                <Typography sx={{ fontSize: "0.86rem", color: MUTED }}>
                  {config.signupLabel ?? "Not a member yet?"}{" "}
                  <Box component={Link} href={config.signupHref} sx={{ color: config.accentColor, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                    Join the network
                  </Box>
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      <Typography sx={{ mt: 3, fontSize: "0.78rem", color: MUTED, textAlign: "center" }}>
        © {new Date().getFullYear()} Dental Member Network · Powered by Thriving Dentist Inc.
      </Typography>
    </Box>
  );
}
