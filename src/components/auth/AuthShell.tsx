"use client";
import Link from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import Logo from "@/components/brand/Logo";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { brand, founding } from "@/lib/content";

const trustPoints = [
  { value: "500+", label: "Practice owners in the network" },
  { value: "2 hrs", label: "Median first hotline response" },
  { value: "$6.4K", label: "Average year-one savings" },
];

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
        bgcolor: "#F7F5F0",
      }}
    >
      {/* LEFT — dark branded panel */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          color: "common.white",
          backgroundImage:
            "linear-gradient(165deg, #06182A 0%, #0E2A3D 55%, #1B4258 100%)",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 5, lg: 7 },
          minHeight: "100vh",
        }}
      >
        {/* Ambient lights */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(45% 45% at 100% 0%, rgba(217,168,75,0.32) 0%, transparent 60%), radial-gradient(40% 40% at 0% 100%, rgba(34,108,165,0.4) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        {/* Soft grid texture */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at 30% 30%, black 30%, transparent 75%)",
            pointerEvents: "none",
          }}
        />

        {/* Top — brand + back to site */}
        <Stack
          direction="row"
          sx={{ position: "relative", justifyContent: "space-between", alignItems: "center" }}
        >
          <Logo dark href="/" height={36} ariaLabel={`${brand.name} · home`} />

          <Box
            component={Link}
            href="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.78)",
              textDecoration: "none",
              transition: "color 200ms ease",
              "&:hover": { color: "common.white" },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Back to site
          </Box>
        </Stack>

        {/* Middle — eyebrow + title + subtitle + testimonial */}
        <Stack spacing={4} sx={{ position: "relative", maxWidth: 540 }}>
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "secondary.light",
                display: "block",
                mb: 1.5,
                fontWeight: 700,
                letterSpacing: "0.18em",
              }}
            >
              {eyebrow}
            </Typography>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                color: "common.white",
                fontSize: { md: "2.75rem", lg: "3.25rem" },
                lineHeight: 1.05,
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                mt: 2.25,
                color: "rgba(255,255,255,0.85)",
                fontSize: { md: "1.02rem", lg: "1.08rem" },
                lineHeight: 1.55,
                maxWidth: 460,
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          {/* Testimonial */}
          <Box
            sx={{
              position: "relative",
              p: 3,
              borderRadius: "20px",
              bgcolor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(12px)",
            }}
          >
            <FormatQuoteRoundedIcon
              sx={{
                position: "absolute",
                top: -10,
                left: 22,
                fontSize: 32,
                color: "secondary.light",
                bgcolor: "#0E2A3D",
                borderRadius: "50%",
                p: 0.5,
              }}
            />
            <Typography
              sx={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "0.98rem",
                lineHeight: 1.6,
                fontStyle: "italic",
                mb: 1.75,
              }}
            >
              The hotline alone has saved us over $150K in bad decisions. The team&apos;s guidance
              was invaluable when we were planning our expansion.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "rgba(217,168,75,0.18)",
                  border: "1px solid rgba(217,168,75,0.4)",
                  color: "secondary.light",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                DW
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "common.white", lineHeight: 1.2 }}>
                  Dr. Diana Walsh
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)" }}
                >
                  Practice Owner · Chicago, IL
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>

        {/* Bottom — trust row + secure note */}
        <Stack spacing={2.5} sx={{ position: "relative" }}>
          <Stack
            direction="row"
            divider={
              <Box sx={{ width: "1px", bgcolor: "rgba(255,255,255,0.14)", mx: 2.5 }} />
            }
            sx={{ alignItems: "center" }}
          >
            {trustPoints.map((p) => (
              <Box key={p.label} sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.5rem",
                    color: "common.white",
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  {p.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}
                >
                  {p.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: "secondary.light" }} />
            <Typography
              variant="body2"
              sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}
            >
              Secure authentication · Founding rate ${founding.priceMonthly}/mo locked for life
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* RIGHT — form panel */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 3, sm: 5, md: 5, lg: 7 },
          minHeight: "100vh",
        }}
      >
        {/* Mobile-only brand strip */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Logo href="/" height={28} showSubline={false} />
          <Box
            component={Link}
            href="/"
            sx={{
              fontSize: "0.8rem",
              color: "text.secondary",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 14 }} /> Back
          </Box>
        </Box>

        {/* Form card */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 460,
            mt: { xs: 8, md: 0 },
          }}
        >
          {/* Mobile-only inline header (because dark panel is hidden) */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 3, textAlign: "center" }}>
            <Typography
              variant="overline"
              sx={{ color: "secondary.dark", fontWeight: 700, letterSpacing: "0.18em", display: "block", mb: 1 }}
            >
              {eyebrow}
            </Typography>
            <Typography variant="h3" component="h1" sx={{ fontSize: "1.85rem", mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {subtitle}
            </Typography>
          </Box>

          {children}

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "center", mt: 3 }}
          >
            <LockOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              Protected by Clerk · Your data is encrypted at rest and in transit
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
