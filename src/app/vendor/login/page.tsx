"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import Logo from "@/components/brand/Logo";

type Mode = "password" | "magic";

const HIGHLIGHTS: { icon: SvgIconComponent; label: string }[] = [
  { icon: StorefrontOutlinedIcon, label: "Manage your services, products, and courses" },
  { icon: VerifiedUserOutlinedIcon, label: "Submit offers for team review and track approvals" },
  { icon: CalendarMonthOutlinedIcon, label: "Receive warm member intros and bookings" },
];

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/vendor";
  const initialToken = params.get("token");

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(initialToken));

  useEffect(() => {
    if (!initialToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/vendor/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "verify", token: initialToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) {
          router.replace(data?.redirect || "/vendor");
        } else {
          setVerifying(false);
          setErr(data?.error ?? "Magic link could not be verified.");
        }
      } catch {
        if (cancelled) return;
        setVerifying(false);
        setErr("Network error verifying your link.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialToken, router]);

  const onSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "password", email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.replace(redirect);
      } else {
        setErr(data?.error ?? "Could not sign in. Please try again.");
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "magic", email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMagicSent(true);
      } else {
        setErr(data?.error ?? "Could not send sign-in link.");
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (verifying) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
        <CircularProgress size={24} sx={{ color: "#A07823" }} />
        <Typography sx={{ color: "#3B4A55", fontSize: "0.88rem" }}>
          Verifying your sign-in link…
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography
          variant="overline"
          sx={{ color: "#A07823", letterSpacing: "0.18em", fontSize: "0.68rem", fontWeight: 700 }}
        >
          PARTNER PORTAL
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 500,
            color: "#0A1A2F",
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
          }}
        >
          {mode === "password" ? "Welcome back" : "Sign in by email"}
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "0.86rem", lineHeight: 1.5 }}>
          {mode === "password"
            ? "Use your partner credentials to access the portal."
            : "We'll send a one-time link that expires in 30 minutes."}
        </Typography>
      </Stack>

      {err && (
        <Alert severity="error" sx={{ fontSize: "0.82rem", py: 0.5 }} onClose={() => setErr(null)}>
          {err}
        </Alert>
      )}

      {mode === "password" ? (
        <Box component="form" onSubmit={onSubmitPassword} noValidate>
          <Stack spacing={1.75}>
            <TextField
              label="Email or username"
              type="text"
              size="small"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ fontSize: 16, color: "#7A8590" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Password"
              size="small"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: 16, color: "#7A8590" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={busy}
              endIcon={busy ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : <ArrowForwardIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 1.2,
                fontSize: "0.88rem",
                fontWeight: 600,
                bgcolor: "#0A1A2F",
                textTransform: "none",
                "&:hover": { bgcolor: "#0F2540" },
              }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>
      ) : magicSent ? (
        <Box
          sx={{
            px: 2,
            py: 1.75,
            borderRadius: 2,
            border: "1px solid rgba(160,120,35,0.3)",
            bgcolor: "rgba(217,168,75,0.06)",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
            <CheckCircleRoundedIcon sx={{ color: "#A07823", fontSize: 18, mt: "1px", flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontWeight: 600, color: "#0A1A2F", fontSize: "0.88rem", mb: 0.25 }}>
                Check your inbox.
              </Typography>
              <Typography sx={{ color: "#3B4A55", fontSize: "0.8rem", lineHeight: 1.55 }}>
                We sent a link to <strong>{email}</strong>. It expires in 30 minutes.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="text"
            size="small"
            onClick={() => {
              setMagicSent(false);
              setEmail("");
            }}
            sx={{ mt: 1, color: "#A07823", textTransform: "none", fontWeight: 600, fontSize: "0.8rem", px: 0 }}
          >
            Use a different email
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={onSubmitMagic}>
          <Stack spacing={1.75}>
            <TextField
              label="Email"
              type="email"
              size="small"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ fontSize: 16, color: "#7A8590" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={busy}
              endIcon={busy ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : <LinkOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 1.2,
                fontSize: "0.88rem",
                fontWeight: 600,
                bgcolor: "#0A1A2F",
                textTransform: "none",
                "&:hover": { bgcolor: "#0F2540" },
              }}
            >
              {busy ? "Sending…" : "Send sign-in link"}
            </Button>
          </Stack>
        </Box>
      )}

      <Divider sx={{ "&::before, &::after": { borderColor: "rgba(14,42,61,0.08)" } }}>
        <Typography sx={{ color: "#9CA3AB", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          or
        </Typography>
      </Divider>

      <Button
        variant="text"
        size="small"
        startIcon={mode === "password" ? <LinkOutlinedIcon sx={{ fontSize: 16 }} /> : <LockOutlinedIcon sx={{ fontSize: 16 }} />}
        onClick={() => {
          setMode((m) => (m === "password" ? "magic" : "password"));
          setErr(null);
          setMagicSent(false);
        }}
        sx={{
          color: "#0A1A2F",
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.82rem",
          "&:hover": { bgcolor: "rgba(217,168,75,0.06)", color: "#A07823" },
        }}
      >
        {mode === "password" ? "Email me a sign-in link instead" : "Use email and password"}
      </Button>

      <Box
        sx={{
          mt: 0.5,
          px: 1.5,
          py: 1,
          borderRadius: 1.5,
          bgcolor: "rgba(217,168,75,0.08)",
          border: "1px dashed rgba(217,168,75,0.35)",
        }}
      >
        <Typography sx={{ color: "#7A5B17", fontSize: "0.74rem", lineHeight: 1.5 }}>
          <Box component="span" sx={{ fontWeight: 700, letterSpacing: "0.1em", mr: 0.5 }}>
            PREVIEW:
          </Box>
          use <strong>test</strong> / <strong>test</strong> to enter the portal.
        </Typography>
      </Box>

      <Typography sx={{ textAlign: "center", color: "#5C6770", fontSize: "0.8rem", pt: 0.5 }}>
        New partner?{" "}
        <Box
          component={Link}
          href="/vendor/signup"
          sx={{ color: "#A07823", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          Apply for a partner account
        </Box>
      </Typography>
    </Stack>
  );
}

export default function VendorLoginPage() {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#FBF8F1",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top bar — logo at landing-page scale, intentionally oversized so it
          overflows the bar (matches the public Header rhythm). */}
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          borderBottom: "1px solid",
          borderColor: "rgba(14,42,61,0.06)",
          bgcolor: "rgba(251,248,241,0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 2,
          overflow: "visible",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 }, overflow: "visible" }}>
          <Stack
            direction="row"
            sx={{
              minHeight: { xs: 56, md: 64 },
              justifyContent: "space-between",
              alignItems: "center",
              overflow: "visible",
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1, mt: -1.5, mb: -4 }}>
              <Logo
                href="/"
                height={110}
                showSubline={false}
                ariaLabel="Dental Member Network · home"
              />
            </Box>
            <Box
              component={Link}
              href="/"
              sx={{
                fontSize: "0.82rem",
                fontWeight: 500,
                color: "#5C6770",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                "&:hover": { color: "#0A1A2F" },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 14 }} /> Back to home
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Split layout, fills viewport */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
        }}
      >
        {/* LEFT: brand / value panel (hidden on small screens to keep no-scroll) */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            position: "relative",
            bgcolor: "#0A1A2F",
            color: "#FFFFFF",
            overflow: "hidden",
            flexDirection: "column",
            justifyContent: "space-between",
            p: { md: 5, lg: 6 },
          }}
        >
          {/* Layered background: spot glow + soft grid + diagonal sheen */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(75% 65% at 85% 10%, rgba(240,193,110,0.18) 0%, transparent 55%), radial-gradient(50% 50% at 0% 100%, rgba(42,95,168,0.16) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 30%)",
              pointerEvents: "none",
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at 30% 30%, black 0%, transparent 75%)",
              pointerEvents: "none",
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: "-20%",
              right: "-15%",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(240,193,110,0.35) 0%, rgba(217,168,75,0.15) 30%, transparent 65%)",
              filter: "blur(8px)",
              pointerEvents: "none",
            }}
          />

          {/* TOP: brand mark (text only — logo lives in the top bar) */}
          <Box sx={{ position: "relative" }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#F2DD9B",
                fontWeight: 700,
              }}
            >
              Partner Portal
            </Typography>
          </Box>

          {/* MIDDLE: brand statement */}
          <Box sx={{ position: "relative", maxWidth: 460 }}>
            <Box
              aria-hidden
              sx={{
                width: 44,
                height: 3,
                bgcolor: "#D4A44B",
                borderRadius: 2,
                mb: 3,
              }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { md: "2.2rem", lg: "2.6rem" },
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                mb: 2,
              }}
            >
              Sell to the dentists who{" "}
              <Box component="em" sx={{ fontStyle: "italic", color: "#F0C16E", fontWeight: 400 }}>
                actually buy.
              </Box>
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.72)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                maxWidth: 420,
              }}
            >
              A curated network of practice owners, vetted by the team that hosts Thriving
              Dentist. Your catalog, your offers, your bookings, all in one place.
            </Typography>

            {/* Highlight chips */}
            <Stack spacing={1.5} sx={{ mt: 4 }}>
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <Stack
                  key={label}
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    bgcolor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(217,168,75,0.18)",
                      border: "1px solid rgba(217,168,75,0.35)",
                      color: "#F0C16E",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 15 }} />
                  </Box>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.85rem", fontWeight: 500, lineHeight: 1.4 }}
                  >
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* BOTTOM: pull-quote + credit */}
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                pl: 2,
                borderLeft: "2px solid rgba(217,168,75,0.6)",
                mb: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  fontWeight: 400,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.88)",
                  maxWidth: 420,
                }}
              >
                &ldquo;The first network where every lead is a practice owner who already chose
                to be matched with someone like us.&rdquo;
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#F2DD9B",
                  fontWeight: 600,
                  mt: 1.25,
                }}
              >
                Founding Partner · Henry Schein
              </Typography>
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
              © 2026 Dental Member Network · Powered by Thriving Dentist
            </Typography>
          </Box>
        </Box>

        {/* RIGHT: form panel */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, md: 5 },
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 380,
            }}
          >
            <Suspense
              fallback={
                <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
                  <CircularProgress size={24} sx={{ color: "#A07823" }} />
                </Stack>
              }
            >
              <LoginInner />
            </Suspense>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
