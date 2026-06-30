"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Logo from "@/components/brand/Logo";
import { SubscribeCard } from "@/components/member/SubscribeCard";
import { useCurrentMember } from "@/lib/hooks/useCurrentMember";
import { useSignOut } from "@/lib/auth/identity";

/**
 * /upgrade — the post-login paywall for members who haven't paid yet.
 *
 * Flow:
 *   1. Member finishes magic-link login → middleware sees no active sub →
 *      redirects /dashboard → /upgrade.
 *   2. Member picks a plan → /api/stripe/checkout returns a Stripe URL →
 *      browser redirects to Stripe Checkout.
 *   3. Stripe success → redirects back to /upgrade?subscribed=1.
 *      We poll /api/member/me; once webhook marks status='active',
 *      we forward to /dashboard.
 *   4. Stripe cancel → /upgrade?subscribed=0 → show a friendly note.
 */
export default function UpgradePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UpgradeInner />
    </Suspense>
  );
}

function UpgradeInner() {
  const { member, loading } = useCurrentMember();
  const params = useSearchParams();
  const router = useRouter();
  const signOut = useSignOut();
  const justSubscribed = params.get("subscribed") === "1";
  const checkoutCanceled = params.get("subscribed") === "0";
  const [pollExhausted, setPollExhausted] = useState(false);

  const isActive = member?.subscription_status === "active";

  // If the member already has an active sub, they don't belong here —
  // bounce them straight to the dashboard.
  useEffect(() => {
    if (!loading && isActive && !justSubscribed) {
      router.replace("/dashboard");
    }
  }, [loading, isActive, justSubscribed, router]);

  // Post-payment: poll /api/member/me for up to ~30s, then either redirect
  // to /dashboard (once webhook lands) or surface a manual refresh.
  useEffect(() => {
    if (!justSubscribed) return;
    let attempts = 0;
    let cancelled = false;
    const tick = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch("/api/member/me", { cache: "no-store" });
        if (res.ok) {
          const body = (await res.json()) as {
            member?: { subscription_status?: string | null };
          };
          if (body.member?.subscription_status === "active") {
            clearInterval(tick);
            if (!cancelled) router.replace("/dashboard");
            return;
          }
        }
      } catch {
        /* try again next tick */
      }
      if (attempts >= 15) {
        clearInterval(tick);
        if (!cancelled) setPollExhausted(true);
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [justSubscribed, router]);

  if (loading) return <PageSkeleton />;

  if (!member) {
    return (
      <PageShell signOut={() => router.push("/member/login")}>
        <Alert severity="error" sx={{ mt: 4 }}>
          Your session expired.{" "}
          <Link href="/member/login" style={{ color: "inherit", fontWeight: 700 }}>
            Sign in again
          </Link>{" "}
          to continue.
        </Alert>
      </PageShell>
    );
  }

  return (
    <PageShell signOut={signOut}>
      {justSubscribed && (
        <Box sx={{ mb: 3 }}>
          <ProcessingBanner variant={pollExhausted ? "stuck" : "pending"} />
        </Box>
      )}
      {checkoutCanceled && (
        <Box sx={{ mb: 3 }}>
          <CheckoutCanceledNote />
        </Box>
      )}
      <SubscribeCard firstName={member.first_name} />
    </PageShell>
  );
}

function PageShell({
  children,
  signOut,
}: {
  children: React.ReactNode;
  signOut: () => void;
}) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F7F5F0" }}>
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "rgba(14,42,61,0.08)",
          bgcolor: "rgba(255,255,255,0.7)",
          backdropFilter: "saturate(140%) blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between", py: 1.5 }}
          >
            <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <Logo height={32} />
            </Link>
            <Button
              variant="text"
              startIcon={<LogoutOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={signOut}
              sx={{
                color: "#0A1A2F",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.86rem",
              }}
            >
              Sign out
            </Button>
          </Stack>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {children}
      </Container>
    </Box>
  );
}

function PageSkeleton() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#F7F5F0",
      }}
    >
      <CircularProgress sx={{ color: "#A07823" }} />
    </Box>
  );
}

function ProcessingBanner({ variant }: { variant: "pending" | "stuck" }) {
  const isStuck = variant === "stuck";
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: isStuck ? "rgba(160,120,35,0.35)" : "rgba(31,92,64,0.25)",
        bgcolor: isStuck ? "rgba(217,168,75,0.08)" : "rgba(34,108,78,0.06)",
        p: 2.5,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
        {isStuck ? (
          <CircularProgress size={22} sx={{ color: "#A07823" }} />
        ) : (
          <CircularProgress size={22} sx={{ color: "#1F5C40" }} />
        )}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0A1A2F" }}>
            {isStuck
              ? "Payment received — still confirming"
              : "Payment received — activating your portal…"}
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mt: 0.5 }}>
            {isStuck
              ? "Stripe is taking a little longer than usual to confirm. Refresh in a moment — if it doesn't clear within 5 minutes, email hello@joindmn.com."
              : "Stripe just confirmed your payment. We're flipping the switch on your portal. You'll be redirected automatically."}
          </Typography>
          {isStuck && (
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1.25, textTransform: "none", fontWeight: 600 }}
              onClick={() => window.location.reload()}
            >
              Refresh now
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

function CheckoutCanceledNote() {
  return (
    <Alert
      severity="info"
      icon={<CheckCircleRoundedIcon sx={{ color: "#0A1A2F" }} />}
      sx={{
        borderRadius: 2,
        bgcolor: "rgba(14,42,61,0.06)",
        color: "#0A1A2F",
        border: "1px solid rgba(14,42,61,0.12)",
        "& .MuiAlert-icon": { color: "#0A1A2F" },
      }}
    >
      No payment was taken. Whenever you're ready, pick a plan below.
    </Alert>
  );
}
