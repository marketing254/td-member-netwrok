"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";

/**
 * Expert "application received" thank-you page. Mirror of
 * /vendor/applied but for the expert bench.
 */

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";

export default function ExpertAppliedPage() {
  const STEPS = [
    {
      icon: MailOutlineRoundedIcon,
      title: "Check your email for your agreement copy",
      body: "We just emailed you a copy of the DMN Founding Agreement you accepted. Save it — you'll want it on file.",
    },
    {
      icon: VerifiedUserOutlinedIcon,
      title: "Our team reviews your application",
      body: "We check topic fit against what the member base is asking for. Within 2 business days you'll get an approval (or a clarification request) by email, along with a magic-link to sign into your expert workspace.",
    },
    {
      icon: CalendarTodayOutlinedIcon,
      title: "Add your card on first login — trial starts",
      body: "Once approved, sign in and add your card in the billing tab. That kicks off your 6 months free (Stripe trial). Nothing is charged until month 7 ($49), rolling to $199 at month 13. Cancel anytime.",
    },
  ];

  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundImage: "linear-gradient(180deg, #FBF8F1 0%, #EEF6F1 50%, #FFFFFF 100%)",
          color: "#0A1A2F",
        }}
      >
        <Container maxWidth="md" sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 8, md: 12 } }}>
          {/* Hero */}
          <Stack spacing={2.5} sx={{ textAlign: "center", mb: { xs: 5, md: 7 }, alignItems: "center" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(44,122,82,0.10)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 36, color: EXPERT_GREEN }} />
            </Box>
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: EXPERT_GREEN_DARK,
              }}
            >
              Application received
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: { xs: "2rem", md: "2.6rem" },
                fontWeight: 500,
                color: "#0A1A2F",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              Thanks for applying — we&apos;ll be in touch.
            </Typography>
            <Typography sx={{ color: "#3B4A55", fontSize: "1.05rem", maxWidth: 560, lineHeight: 1.6 }}>
              A copy of your agreement is on its way to your inbox. Here&apos;s what
              happens next.
            </Typography>
          </Stack>

          {/* Steps */}
          <Stack spacing={3} sx={{ mb: { xs: 5, md: 7 } }}>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Stack
                  key={step.title}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.5, sm: 3 }}
                  sx={{
                    alignItems: { sm: "flex-start" },
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E6DDCF",
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      bgcolor: "rgba(44,122,82,0.10)",
                      color: EXPERT_GREEN_DARK,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.15rem",
                        fontWeight: 500,
                        color: "#0A1A2F",
                        mb: 0.5,
                      }}
                    >
                      {`${i + 1}. ${step.title}`}
                    </Typography>
                    <Typography sx={{ color: "#3B4A55", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      {step.body}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>

          {/* Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ justifyContent: "center" }}
          >
            <Button
              component={Link}
              href="/expert/login"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 999,
                bgcolor: EXPERT_GREEN,
                backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                "&:hover": {
                  backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                },
              }}
            >
              Sign in when approved
            </Button>
            <Button
              component={Link}
              href="/experts"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 999 }}
            >
              Back to experts
            </Button>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
