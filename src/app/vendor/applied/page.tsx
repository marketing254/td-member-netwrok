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
 * Vendor "application received" thank-you page.
 * Reached after submitting the partner WaitlistSection on /partners
 * (which posts to /api/vendor/signup). Tells the partner exactly what
 * happens next + points them at /vendor/login so they can hit the
 * portal as soon as the magic-link email arrives.
 */
export default function VendorAppliedPage() {
  const STEPS = [
    {
      icon: MailOutlineRoundedIcon,
      title: "Check your email for the sign-in link",
      body: "We sent a one-time link to the contact email on your application. It expires in 30 minutes. Click it to open your partner portal.",
    },
    {
      icon: VerifiedUserOutlinedIcon,
      title: "Our team reviews your application",
      body: "We verify the category fit, your member-discount commitment, and your service responsiveness. Within 5 business days you'll get an approval (or a clarification request) by email.",
    },
    {
      icon: CalendarTodayOutlinedIcon,
      title: "Founding pricing locks in",
      body: "Six months free, $49/mo for months 7-12, then $199/mo standard. Your portal lets you set up your catalog and offers right away — they go live to members the day your application is approved.",
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
          backgroundImage: "linear-gradient(180deg, #FBF8F1 0%, #F5F0E4 50%, #FFFFFF 100%)",
          color: "#0A1A2F",
        }}
      >
        <Container maxWidth="md" sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 8, md: 12 } }}>
          {/* Hero */}
          <Stack spacing={2.5} sx={{ textAlign: "center", mb: { xs: 5, md: 7 }, alignItems: "center" }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(34,108,78,0.12)",
                border: "1px solid rgba(34,108,78,0.32)",
                color: "#1F5C40",
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 44 }} />
            </Box>

            <Box>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  fontSize: "0.66rem",
                  letterSpacing: "0.18em",
                  fontWeight: 700,
                  color: "#A07823",
                  bgcolor: "rgba(217,168,75,0.12)",
                  border: "1px solid rgba(217,168,75,0.3)",
                  px: 1,
                  py: 0.5,
                  borderRadius: 0.75,
                  mb: 2,
                }}
              >
                APPLICATION RECEIVED
              </Box>
              <Typography
                component="h1"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "2rem", md: "2.6rem" },
                  fontWeight: 500,
                  color: "#0A1A2F",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  mb: 1.5,
                }}
              >
                Welcome to the partner cohort.
              </Typography>
              <Typography
                sx={{
                  color: "#3B4A55",
                  maxWidth: 540,
                  mx: "auto",
                  fontSize: { xs: "0.98rem", md: "1.05rem" },
                  lineHeight: 1.65,
                }}
              >
                Your application is in. We sent a sign-in link to your email so you can start setting
                up your catalog while our team reviews your details.
              </Typography>
            </Box>
          </Stack>

          {/* Next steps */}
          <Box
            sx={{
              p: { xs: 3, md: 4.5 },
              borderRadius: 4,
              bgcolor: "#FFFFFF",
              border: "1px solid rgba(14,42,61,0.08)",
              boxShadow: "0 20px 60px -30px rgba(14,42,61,0.12)",
              mb: { xs: 5, md: 7 },
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#A07823", letterSpacing: "0.16em", fontSize: "0.72rem" }}
            >
              WHAT HAPPENS NEXT
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: "#0A1A2F",
                fontFamily: "var(--font-display)",
                fontSize: { xs: "1.5rem", md: "1.85rem" },
                fontWeight: 500,
                lineHeight: 1.2,
                mt: 0.5,
                mb: 3.5,
              }}
            >
              Three steps to go live.
            </Typography>
            <Stack spacing={3}>
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Stack
                    key={step.title}
                    direction="row"
                    spacing={2.5}
                    sx={{ alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(217,168,75,0.12)",
                        border: "1px solid rgba(217,168,75,0.3)",
                        color: "#A07823",
                      }}
                    >
                      <Icon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="overline"
                        sx={{ color: "#5C6770", display: "block", fontSize: "0.62rem" }}
                      >
                        STEP {i + 1}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#0A1A2F",
                          fontWeight: 600,
                          fontSize: "1.05rem",
                          mt: 0.25,
                          mb: 0.5,
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        sx={{ color: "#5C6770", fontSize: "0.92rem", lineHeight: 1.65 }}
                      >
                        {step.body}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Box>

          {/* CTAs */}
          <Stack
            spacing={1.5}
            sx={{ alignItems: "center", textAlign: "center" }}
          >
            <Typography
              sx={{
                color: "#5C6770",
                fontSize: "0.92rem",
                lineHeight: 1.6,
                maxWidth: 480,
                mx: "auto",
              }}
            >
              Already got your sign-in link? Open the portal and start adding your catalog.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: "center", mt: 1 }}
            >
              <Button
                component={Link}
                href="/vendor/login"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#0A1A2F",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": { bgcolor: "#0F2540" },
                }}
              >
                Sign in to portal
              </Button>
              <Button
                component={Link}
                href="/"
                variant="text"
                startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: "#5C6770",
                  textTransform: "none",
                  fontSize: "0.88rem",
                  "&:hover": { bgcolor: "rgba(14,42,61,0.04)", color: "#0A1A2F" },
                }}
              >
                Back to landing
              </Button>
            </Stack>
            <Typography sx={{ color: "#9CA3AB", fontSize: "0.78rem", mt: 2.5 }}>
              Questions? Email{" "}
              <Box
                component="a"
                href="mailto:partnerships@joindmn.com"
                sx={{ color: "#A07823", fontWeight: 600, textDecoration: "none" }}
              >
                partnerships@joindmn.com
              </Box>
            </Typography>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  );
}
