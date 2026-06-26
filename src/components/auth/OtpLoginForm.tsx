"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyboardOutlinedIcon from "@mui/icons-material/KeyboardOutlined";
import Logo from "@/components/brand/Logo";

/**
 * Shared 2-step OTP login form used by every portal (member, expert,
 * partner, admin). Each role's /login page passes the endpoints + copy
 * + accent colour; the rest of the UX (auto-advance to code step,
 * auto-submit at 6 digits, resend, change-email) is identical.
 *
 * Why one component for all four roles: the only meaningful difference
 * between the role logins is where they POST (their own send + verify
 * endpoints) and where they land after success. Visual chrome stays
 * brand-consistent.
 */

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
  /** Accent colour for the lock icon background tint. */
  accentColor: string;
  /** Tint for the icon background. */
  accentTint: string;
  /** Optional sign-up link (members only — experts/partners/admin are admin-added). */
  signupHref?: string;
  signupLabel?: string;
  /**
   * Optional human-friendly error to show when the API returns
   * "user not found" instead of the default copy. Useful for explaining
   * "ask an admin to invite you" on portals where signup is closed.
   */
  unknownEmailMessage?: string;
};

export default function OtpLoginForm({ config }: { config: OtpLoginConfig }) {
  const router = useRouter();
  const params = useSearchParams();
  const initialError = params?.get("error") ?? null;
  const prefilledEmail = (params?.get("email") ?? "").toLowerCase();

  type Step = "email" | "code";
  const [step, setStep] = useState<Step>(prefilledEmail ? "code" : "email");
  const [email, setEmail] = useState(prefilledEmail);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(initialError);
  const [info, setInfo] = useState<string | null>(
    prefilledEmail ? `We sent a 6-digit code to ${prefilledEmail}.` : null,
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
          ? config.unknownEmailMessage ??
            "We couldn't find an account for that email."
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
      if (process.env.NODE_ENV !== "production")
        console.error("[otp-login] send failed:", err);
      setErr("Couldn't send your code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

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
        }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        next?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.next) {
        setErr(
          body.error ??
            "That code didn't work. Request a new one and try again.",
        );
        return;
      }
      router.push(body.next);
    } catch (err) {
      if (process.env.NODE_ENV !== "production")
        console.error("[otp-login] verify failed:", err);
      setErr("Couldn't verify the code right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#FBF8F1",
        backgroundImage:
          "radial-gradient(60% 70% at 80% 0%, rgba(184,153,104,0.16) 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(155,123,58,0.1) 0%, transparent 60%)",
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: "center", mb: 3.5 }}>
          <Logo height={80} ariaLabel={`Dental Member Network · ${config.roleLabel} sign in`} />
        </Box>

        <Box
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E7E2D6",
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            boxShadow:
              "0 1px 2px rgba(20,20,20,0.04), 0 24px 60px -30px rgba(20,20,20,0.18)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: config.accentTint,
                color: config.accentColor,
                display: "grid",
                placeItems: "center",
              }}
            >
              <LockOutlinedIcon />
            </Box>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "#1A1A1A",
              textAlign: "center",
              letterSpacing: "-0.01em",
              mb: 0.5,
            }}
          >
            {step === "email" ? config.emailStepTitle : config.codeStepTitle}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.92rem",
              color: "#5C6770",
              textAlign: "center",
              mb: 3,
            }}
          >
            {step === "email" ? config.emailStepSubtitle : config.codeStepSubtitle}
          </Typography>

          {info && (
            <Alert
              severity="info"
              icon={<EmailOutlinedIcon fontSize="small" />}
              sx={{ mb: 2, fontSize: "0.85rem" }}
            >
              {info}
            </Alert>
          )}
          {err && (
            <Alert
              severity="error"
              onClose={() => setErr(null)}
              sx={{ mb: 2, fontSize: "0.85rem" }}
            >
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={busy}
                endIcon={
                  busy ? (
                    <CircularProgress size={14} sx={{ color: "inherit" }} />
                  ) : null
                }
                sx={{
                  py: 1.25,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#1A1A1A !important",
                  backgroundImage: "none !important",
                  color: "#FFFFFF !important",
                  "&:hover": {
                    bgcolor: "#2A2A2A !important",
                    backgroundImage: "none !important",
                    color: "#FFFFFF !important",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#3A3A3A !important",
                    backgroundImage: "none !important",
                    color: "rgba(255,255,255,0.55) !important",
                  },
                }}
              >
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
                  htmlInput: {
                    maxLength: 6,
                    pattern: "\\d{6}",
                  },
                }}
                sx={{ mb: 2 }}
                placeholder="••••••"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={busy || code.length !== 6}
                endIcon={
                  busy ? (
                    <CircularProgress size={14} sx={{ color: "inherit" }} />
                  ) : null
                }
                sx={{
                  py: 1.25,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#1A1A1A !important",
                  backgroundImage: "none !important",
                  color: "#FFFFFF !important",
                  "&:hover": {
                    bgcolor: "#2A2A2A !important",
                    backgroundImage: "none !important",
                    color: "#FFFFFF !important",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#3A3A3A !important",
                    backgroundImage: "none !important",
                    color: "rgba(255,255,255,0.55) !important",
                  },
                  mb: 1.5,
                }}
              >
                {busy ? "Verifying…" : "Verify & sign in"}
              </Button>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <Button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setErr(null);
                    setInfo(null);
                  }}
                  startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    color: "#5C6770 !important",
                    fontSize: "0.82rem",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      color: "#0A1A2F !important",
                      bgcolor: "rgba(14,26,36,0.05)",
                    },
                  }}
                >
                  Use a different email
                </Button>
                <Button
                  type="button"
                  onClick={() => sendCode()}
                  disabled={busy}
                  sx={{
                    color: `${config.accentColor} !important`,
                    fontSize: "0.82rem",
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": {
                      color: `${config.accentColor} !important`,
                      bgcolor: config.accentTint,
                    },
                  }}
                >
                  Resend code
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        {config.signupHref && (
          <Typography
            sx={{
              mt: 2.5,
              fontSize: "0.82rem",
              color: "#5C6770",
              textAlign: "center",
            }}
          >
            {config.signupLabel ?? "Not a member yet?"}{" "}
            <Box
              component={Link}
              href={config.signupHref}
              sx={{
                color: config.accentColor,
                fontWeight: 700,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Join the network
            </Box>
          </Typography>
        )}
      </Container>
    </Box>
  );
}
