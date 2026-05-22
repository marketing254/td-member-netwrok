"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Logo from "@/components/brand/Logo";
import { createBrowserSupabase } from "@/lib/supabase/browser";

function AdminLoginInner() {
  const params = useSearchParams();
  const initialError = params.get("error");
  const redirect = params.get("redirect") ?? "/admin";

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(initialError);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErr("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setErr(null);

    const supabase = createBrowserSupabase();
    const origin = window.location.origin;
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
      redirect,
    )}&role=admin`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo,
        // CRITICAL: admins must be pre-created in Supabase Authentication
        // → Users (and have a matching admin_users row). No auto-create.
        shouldCreateUser: false,
      },
    });

    if (error) {
      const msg = error.message ?? "";
      const isUserNotFound =
        /not allowed|not found|invalid/i.test(msg) || error.status === 422 || error.status === 400;
      if (isUserNotFound) {
        setErr(
          "That email isn't on the admin allow-list. Ask an owner-role admin to add you, then try again.",
        );
      } else {
        setErr(msg || "Could not send sign-in link. Please try again.");
      }
    } else {
      setSent(true);
    }
    setBusy(false);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={0.75} sx={{ alignItems: "center", textAlign: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(217,168,75,0.14)",
            border: "1px solid rgba(217,168,75,0.32)",
            color: "#A07823",
            mb: 1,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Typography
          variant="overline"
          sx={{ color: "#A07823", letterSpacing: "0.18em", fontSize: "0.66rem", fontWeight: 700 }}
        >
          ADMIN CONSOLE
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.55rem", md: "1.8rem" },
            fontWeight: 500,
            color: "#0A1A2F",
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
          }}
        >
          Internal team sign-in
        </Typography>
        <Typography
          sx={{ color: "#5C6770", fontSize: "0.88rem", lineHeight: 1.55, maxWidth: 360 }}
        >
          Sign in with a magic link. Only emails on the admin allow-list can access the console.
        </Typography>
      </Stack>

      {err && (
        <Alert severity="error" sx={{ fontSize: "0.82rem" }} onClose={() => setErr(null)}>
          {err}
        </Alert>
      )}

      {sent ? (
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderRadius: 2,
            border: "1px solid rgba(34,108,78,0.3)",
            bgcolor: "rgba(34,108,78,0.06)",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
            <CheckCircleRoundedIcon
              sx={{ color: "#1F5C40", fontSize: 22, mt: "1px", flexShrink: 0 }}
            />
            <Box>
              <Typography sx={{ fontWeight: 600, color: "#0A1A2F", fontSize: "0.92rem", mb: 0.5 }}>
                Check your inbox.
              </Typography>
              <Typography sx={{ color: "#3B4A55", fontSize: "0.84rem", lineHeight: 1.6 }}>
                We sent a sign-in link to <strong>{email}</strong>. The link is single-use and
                expires in 60 minutes. If the email isn&rsquo;t in the admin allow-list, the link
                won&rsquo;t grant access — talk to an owner-role admin to add you.
              </Typography>
            </Box>
          </Stack>
          <Button
            size="small"
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            sx={{
              mt: 1.5,
              color: "#A07823",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.82rem",
              px: 0,
            }}
          >
            Use a different email
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Admin email"
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
                      <EmailOutlinedIcon sx={{ fontSize: 18, color: "#7A8590" }} />
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
                  <LinkOutlinedIcon sx={{ fontSize: 18 }} />
                )
              }
              sx={{
                py: 1.25,
                fontSize: "0.9rem",
                fontWeight: 600,
                bgcolor: "#0A1A2F",
                textTransform: "none",
                "&:hover": { bgcolor: "#0F2540" },
              }}
            >
              {busy ? "Sending…" : "Send me a sign-in link"}
            </Button>
          </Stack>
        </Box>
      )}

      <Typography sx={{ color: "#9CA3AB", fontSize: "0.78rem", textAlign: "center" }}>
        Not an admin?{" "}
        <Box
          component={Link}
          href="/"
          sx={{ color: "#5C6770", textDecoration: "underline", "&:hover": { color: "#0A1A2F" } }}
        >
          Go back to the homepage
        </Box>
      </Typography>
    </Stack>
  );
}

export default function AdminLoginPage() {
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
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          borderBottom: "1px solid",
          borderColor: "rgba(14,42,61,0.06)",
          bgcolor: "rgba(251,248,241,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            sx={{ minHeight: { xs: 56, md: 64 }, alignItems: "center", justifyContent: "space-between", overflow: "visible" }}
          >
            <Box sx={{ position: "relative", mt: -1.5, mb: -4 }}>
              <Logo href="/" height={100} showSubline={false} />
            </Box>
            <Box
              component={Link}
              href="/"
              sx={{
                fontSize: "0.82rem",
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
        </Container>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: { xs: 4, md: 6 },
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            border: "1px solid rgba(14,42,61,0.08)",
            boxShadow:
              "0 40px 80px -32px rgba(14,42,61,0.25), 0 12px 28px -18px rgba(14,42,61,0.12)",
            p: { xs: 3, md: 4 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: 0,
              left: "8%",
              right: "8%",
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(217,168,75,0.7), transparent)",
            }}
          />
          <Suspense
            fallback={
              <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ color: "#A07823" }} />
              </Stack>
            }
          >
            <AdminLoginInner />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
