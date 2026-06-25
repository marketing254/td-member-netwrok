"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import Logo from "@/components/brand/Logo";

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";

const HIGHLIGHTS: { icon: SvgIconComponent; label: string }[] = [
  { icon: UploadFileOutlinedIcon, label: "Upload resources for the team to brand and publish" },
  { icon: InsightsOutlinedIcon, label: "See which members open your work and inquire about you" },
  { icon: SchoolOutlinedIcon, label: "Post updates that appear in the member and partner feeds" },
];

function LoginInner() {
  const params = useSearchParams();
  const initialError = params.get("error");

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(initialError);
  const [magicSent, setMagicSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/expert/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
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

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography
          variant="overline"
          sx={{ color: EXPERT_GREEN_DARK, letterSpacing: "0.18em", fontSize: "0.68rem", fontWeight: 700 }}
        >
          EXPERT PORTAL
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
          Enter the email the team confirmed your expert account on. We&apos;ll send a
          one-time sign-in link that expires in 60 minutes. No password to remember.
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
            border: `1px solid ${EXPERT_GREEN}55`,
            bgcolor: `${EXPERT_GREEN}0F`,
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
            <CheckCircleRoundedIcon
              sx={{ color: EXPERT_GREEN, fontSize: 18, mt: "1px", flexShrink: 0 }}
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
              color: EXPERT_GREEN_DARK,
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
        <Box component="form" onSubmit={onSubmit}>
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
                bgcolor: EXPERT_GREEN,
                color: "#FFFFFF",
                backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                textTransform: "none",
                "&:hover": {
                  bgcolor: EXPERT_GREEN_DARK,
                  backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                },
              }}
            >
              {busy ? "Sending…" : "Send sign-in link"}
            </Button>
          </Stack>
        </Box>
      )}

      <Typography sx={{ textAlign: "center", color: "#5C6770", fontSize: "0.8rem", pt: 0.5 }}>
        Haven&apos;t applied yet?{" "}
        <Box
          component={Link}
          href="/experts"
          sx={{
            color: EXPERT_GREEN_DARK,
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Apply for an expert account
        </Box>
      </Typography>
    </Stack>
  );
}

export default function ExpertLoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FBF8F1",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          flexShrink: 0,
          borderBottom: "1px solid",
          borderColor: "rgba(14,42,61,0.06)",
          bgcolor: "rgba(251,248,241,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            sx={{
              minHeight: { xs: 56, md: 64 },
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ mt: -1.5, mb: -4 }}>
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

      {/* Body — split layout (form on right, value panel on left) */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
        }}
      >
        {/* LEFT: brand / value panel — hidden on small screens */}
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
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(75% 65% at 85% 10%, ${EXPERT_GREEN}30 0%, transparent 55%), radial-gradient(50% 50% at 0% 100%, rgba(42,95,168,0.16) 0%, transparent 60%)`,
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

          <Box sx={{ position: "relative" }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#9DD9B5",
                fontWeight: 700,
              }}
            >
              Expert Portal
            </Typography>
          </Box>

          <Box sx={{ position: "relative", maxWidth: 460 }}>
            <Box
              aria-hidden
              sx={{
                width: 44,
                height: 3,
                bgcolor: EXPERT_GREEN,
                borderRadius: 2,
                mb: 3,
              }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { md: "2.2rem", lg: "2.6rem" },
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                mb: 2,
              }}
            >
              Your work, in front of the dentists who need it.
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.55, mb: 3 }}>
              Upload one resource at a time. We brand it, publish it to the
              member library, and route inquiries straight to you.
            </Typography>
            <Stack spacing={1.25}>
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <Stack key={label} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                  <Icon sx={{ color: "#9DD9B5", fontSize: 18, mt: "2px" }} />
                  <Typography sx={{ fontSize: "0.86rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={{ position: "relative" }}>
            <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
              Powered by Thriving Dentist
            </Typography>
          </Box>
        </Box>

        {/* RIGHT: form */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, md: 5 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Suspense fallback={null}>
              <LoginInner />
            </Suspense>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
