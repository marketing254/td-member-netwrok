"use client";

import { Suspense, useState } from "react";
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
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import Logo from "@/components/brand/Logo";

const HIGHLIGHTS: { icon: SvgIconComponent; label: string }[] = [
  { icon: StorefrontOutlinedIcon, label: "Manage your services, products, and courses" },
  { icon: VerifiedUserOutlinedIcon, label: "Submit offers for team review and track approvals" },
  { icon: CalendarMonthOutlinedIcon, label: "Receive warm member intros and bookings" },
];

// Render the dev test/test escape hatch only when explicitly enabled via env.
// In production NEXT_PUBLIC_SHOW_DEV_LOGIN is unset → no UI for it.
const SHOW_DEV_LOGIN = process.env.NEXT_PUBLIC_SHOW_DEV_LOGIN === "true";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/vendor";
  const initialError = params.get("error");

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(initialError);
  const [magicSent, setMagicSent] = useState(false);

  // Dev-only password shortcut state (only mounted when SHOW_DEV_LOGIN is true)
  const [devUsername, setDevUsername] = useState("");
  const [devPassword, setDevPassword] = useState("");

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

  const onSubmitDevPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/vendor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "password", email: devUsername.trim(), password: devPassword }),
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
          Sign in with a magic link
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "0.86rem", lineHeight: 1.5 }}>
          Enter the email you applied with. We&apos;ll send a one-time sign-in link that expires
          in 60 minutes. No password to remember, no password to leak.
        </Typography>
      </Stack>

      {err && (
        <Alert severity="error" sx={{ fontSize: "0.82rem", py: 0.5 }} onClose={() => setErr(null)}>
          {err}
        </Alert>
      )}

      {magicSent ? (
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
            <CheckCircleRoundedIcon
              sx={{ color: "#A07823", fontSize: 18, mt: "1px", flexShrink: 0 }}
            />
            <Box>
              <Typography sx={{ fontWeight: 600, color: "#0A1A2F", fontSize: "0.88rem", mb: 0.25 }}>
                Check your inbox.
              </Typography>
              <Typography sx={{ color: "#3B4A55", fontSize: "0.8rem", lineHeight: 1.55 }}>
                We sent a sign-in link to <strong>{email}</strong>. Click it within 60 minutes
                to access the portal.
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
            sx={{
              mt: 1,
              color: "#A07823",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              px: 0,
            }}
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
              endIcon={
                busy ? (
                  <CircularProgress size={14} sx={{ color: "inherit" }} />
                ) : (
                  <LinkOutlinedIcon sx={{ fontSize: 16 }} />
                )
              }
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

      <Typography sx={{ textAlign: "center", color: "#5C6770", fontSize: "0.8rem", pt: 0.5 }}>
        New partner?{" "}
        <Box
          component={Link}
          href="/vendor/signup"
          sx={{
            color: "#A07823",
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Apply for a partner account
        </Box>
      </Typography>

      {SHOW_DEV_LOGIN && (
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            borderRadius: 1.5,
            border: "1px dashed rgba(217,168,75,0.4)",
            bgcolor: "rgba(217,168,75,0.04)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "#7A5B17",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Dev preview · skip the email
          </Typography>
          <Box component="form" onSubmit={onSubmitDevPassword}>
            <Stack spacing={1}>
              <TextField
                label="Username"
                size="small"
                value={devUsername}
                onChange={(e) => setDevUsername(e.target.value)}
                placeholder="test"
                fullWidth
              />
              <TextField
                label="Password"
                size="small"
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                placeholder="test"
                fullWidth
              />
              <Button
                type="submit"
                variant="outlined"
                size="small"
                disabled={busy}
                sx={{
                  textTransform: "none",
                  borderColor: "rgba(160,120,35,0.4)",
                  color: "#7A5B17",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.08)" },
                }}
              >
                Sign in with preview credentials
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
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

          {/* BOTTOM: credit */}
          <Box sx={{ position: "relative" }}>
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
