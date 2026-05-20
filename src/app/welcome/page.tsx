"use client";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import Logo from "@/components/brand/Logo";
import { brand } from "@/lib/content";
import { member, subscription } from "@/lib/memberData";

const quickstart = [
  {
    icon: PersonOutlineOutlinedIcon,
    title: "Complete your profile",
    detail: "Add your practice details so we can tailor vendor matches and case routing.",
    href: "/dashboard/account",
    cta: "Edit profile",
  },
  {
    icon: SchoolOutlinedIcon,
    title: "Start your first course",
    detail: "Earn CE credits the same week you join. Most members start with PPO Renegotiation.",
    href: "/dashboard/courses/ppo-renegotiation",
    cta: "Open the course",
  },
  {
    icon: RedeemOutlinedIcon,
    title: "Claim a vendor offer",
    detail: "Henry Schein, Weave, Patterson, your codes are live. The average member captures $6K/year.",
    href: "/dashboard/rewards",
    cta: "See offers",
  },
];

export default function WelcomePage() {
  const firstName = member.firstName;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#06182A",
        color: "common.white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(45% 45% at 80% 0%, rgba(217,168,75,0.35) 0%, transparent 60%), radial-gradient(40% 40% at 10% 100%, rgba(34,108,165,0.4) 0%, transparent 60%)",
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
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          pointerEvents: "none",
        }}
      />

      {/* Brand strip */}
      <Container
        maxWidth="lg"
        sx={{ position: "relative", pt: { xs: 4, md: 5 }, pb: 0 }}
      >
        <Logo dark href="/" height={36} />
      </Container>

      <Container
        maxWidth="lg"
        sx={{ position: "relative", pt: { xs: 5, md: 8 }, pb: { xs: 7, md: 10 } }}
      >
        <Stack spacing={5}>
          {/* Hero */}
          <Stack spacing={2.5} sx={{ maxWidth: 760 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <Chip
                icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />}
                label="FOUNDING SEAT SECURED"
                size="small"
                sx={{
                  bgcolor: "rgba(217,168,75,0.16)",
                  color: "secondary.light",
                  border: "1px solid rgba(217,168,75,0.35)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  height: 26,
                  "& .MuiChip-icon": { color: "secondary.light" },
                }}
              />
              <Chip
                icon={<LockOutlinedIcon sx={{ fontSize: 14 }} />}
                label="LIFETIME $49 LOCKED"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.06)",
                  color: "common.white",
                  border: "1px solid rgba(255,255,255,0.18)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  height: 26,
                  "& .MuiChip-icon": { color: "common.white" },
                }}
              />
            </Stack>
            <Typography
              variant="h1"
              sx={{
                color: "common.white",
                fontSize: { xs: "2.5rem", md: "4rem" },
              }}
            >
              You&apos;re in,{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(180deg, #F0C16E 0%, #D9A84B 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Dr. {firstName}.
              </Box>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.88)", fontSize: { xs: "1.05rem", md: "1.18rem" }, maxWidth: 620, lineHeight: 1.55 }}>
              Welcome to the {brand.shortName}. Your founding rate of ${subscription.priceMonthly}/mo is locked
              for life on the current product, your hotline access is live, and your vendor codes
              are ready. Here&apos;s how to start strong.
            </Typography>
          </Stack>

          {/* Confirmation strip */}
          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: "20px",
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(14px)",
            }}
          >
            <Grid container spacing={3}>
              <ConfirmCell label="MEMBERSHIP" value="Founding · $49/mo" sub="Locked for life on this product" />
              <ConfirmCell label="STATUS" value="Active" sub={`Started ${subscription.startedOn}`} />
              <ConfirmCell label="NEXT RENEWAL" value={subscription.renewsOn} sub={`Auto-renews unless canceled`} />
              <ConfirmCell
                label="HOTLINE SLA"
                value="2 hours"
                sub="First response, business hours"
                last
              />
            </Grid>
          </Box>

          {/* Quickstart */}
          <Box>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, gap: 2, mb: 2.5 }}>
              <Box>
                <Typography variant="overline" sx={{ color: "secondary.light", display: "block", fontWeight: 700 }}>
                  GET THE MOST OUT OF DAY ONE
                </Typography>
                <Typography variant="h3" sx={{ color: "common.white", fontSize: { xs: "1.85rem", md: "2.25rem" }, mt: 0.25 }}>
                  Three things, in order
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", maxWidth: 320 }}>
                Most members who do these in week one save more than the membership fee within 30 days.
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              {quickstart.map((q, i) => {
                const Icon = q.icon;
                return (
                  <Grid key={q.title} size={{ xs: 12, md: 4 }}>
                    <Box
                      sx={{
                        height: "100%",
                        p: 3,
                        borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.14)",
                        bgcolor: "rgba(255,255,255,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        transition: "transform 240ms cubic-bezier(.2,.8,.2,1), border-color 240ms ease, background-color 240ms ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          borderColor: "rgba(217,168,75,0.35)",
                          bgcolor: "rgba(255,255,255,0.06)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: "rgba(217,168,75,0.14)",
                            border: "1px solid rgba(217,168,75,0.32)",
                            display: "grid",
                            placeItems: "center",
                            color: "secondary.light",
                          }}
                        >
                          <Icon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "0.7rem",
                            letterSpacing: "0.18em",
                            fontWeight: 700,
                          }}
                        >
                          STEP {i + 1}
                        </Typography>
                      </Stack>
                      <Typography variant="h5" sx={{ color: "common.white", fontSize: "1.15rem" }}>
                        {q.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.78)", fontSize: "0.88rem", lineHeight: 1.55, flex: 1 }}
                      >
                        {q.detail}
                      </Typography>
                      <Button
                        component={Link}
                        href={q.href}
                        variant="text"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          alignSelf: "flex-start",
                          ml: -1,
                          color: "secondary.light",
                          "&:hover": { color: "common.white", bgcolor: "rgba(255,255,255,0.06)" },
                        }}
                      >
                        {q.cta}
                      </Button>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Promise + CTA */}
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "24px",
              border: "1px solid rgba(217,168,75,0.3)",
              backgroundImage: "linear-gradient(135deg, rgba(217,168,75,0.18) 0%, rgba(14,42,61,0.5) 100%)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Grid container spacing={3} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h4" sx={{ color: "common.white", mb: 1 }}>
                  The membership is the product.
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.88)", maxWidth: 600, lineHeight: 1.6 }}>
                  No four-figure upsells. No surprise pitches. Your $49 stays $49 for life on the
                  current product, that&apos;s the deal we made you, and we&apos;ll keep it.
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ mt: 1.75, flexWrap: "wrap", gap: 1, color: "rgba(255,255,255,0.85)" }}
                >
                  {[
                    "30-day full refund, no questions",
                    "Cancel any time from your account",
                    "Founding badge on every interaction",
                  ].map((p) => (
                    <Stack key={p} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                      <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: "secondary.light" }} />
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {p}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Button
                    component={Link}
                    href="/dashboard"
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                  >
                    Enter the workspace
                  </Button>
                  <Button
                    component={Link}
                    href="/dashboard/account"
                    variant="outlined"
                    fullWidth
                    sx={{
                      color: "common.white",
                      borderColor: "rgba(255,255,255,0.25)",
                      bgcolor: "rgba(255,255,255,0.04)",
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.5)",
                        bgcolor: "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    Set up profile first
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

function ConfirmCell({
  label,
  value,
  sub,
  last,
}: {
  label: string;
  value: string;
  sub?: string;
  last?: boolean;
}) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Box
        sx={{
          pr: { md: last ? 0 : 2.5 },
          borderRight: { xs: 0, md: last ? 0 : "1px solid rgba(255,255,255,0.12)" },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            fontWeight: 700,
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ color: "common.white", fontFamily: "var(--font-display)", fontSize: "1.25rem", lineHeight: 1.15 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Grid>
  );
}
