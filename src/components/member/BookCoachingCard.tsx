"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

/**
 * BookCoachingCard — coaching CTA shown at the bottom of every kit detail
 * page in the member portal.
 *
 * Pattern: compact intro card + Book button → MUI Dialog with the YCBM
 * booking page rendered inline as an iframe. Lazy-loaded so the calendar
 * widget only fetches when a member actually wants to book.
 */
const YCBM_BOOKING_URL = "https://thriving-practice-strategy-meeting.youcanbook.me/";

export function BookCoachingCard({ topicTitle }: { topicTitle?: string }) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Box
        sx={{
          borderRadius: 2,
          border: "1px solid rgba(14,42,61,0.08)",
          bgcolor: "var(--paper, #FBF8F1)",
          overflow: "hidden",
          boxShadow: "0 1px 0 rgba(14,42,61,0.02)",
          backgroundImage:
            "linear-gradient(135deg, rgba(217,168,75,0.06) 0%, transparent 55%)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2, md: 3 }}
          sx={{
            alignItems: { md: "center" },
            justifyContent: "space-between",
            px: { xs: 2, md: 3 },
            py: { xs: 2.25, md: 2.5 },
          }}
        >
          {/* Left — presenter intro */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ alignItems: { sm: "center" }, flex: 1, minWidth: 0 }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "var(--ink, #0A1A2F)",
                color: "var(--gold, #F0C16E)",
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 600,
                border: "1px solid rgba(217,168,75,0.4)",
                flexShrink: 0,
              }}
            >
              GT
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.4 }}>
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    color: "var(--gold-deep, #A07823)",
                    textTransform: "uppercase",
                  }}
                >
                  1-on-1 coaching
                </Typography>
                <VerifiedRoundedIcon
                  sx={{ fontSize: 13, color: "var(--gold, #F0C16E)" }}
                  aria-hidden
                />
              </Stack>
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "1.05rem", md: "1.15rem" },
                  fontWeight: 500,
                  color: "var(--ink, #0A1A2F)",
                  lineHeight: 1.25,
                  mb: 0.4,
                }}
              >
                Go deeper with Gary Takacs
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.84rem",
                  color: "var(--ink-soft, #3B4A55)",
                  lineHeight: 1.55,
                  maxWidth: 540,
                }}
              >
                {topicTitle
                  ? `Bring your questions about ${topicTitle} — or anything else running your practice — to a focused 30-minute strategy call.`
                  : "Bring your hardest practice question to a focused 30-minute strategy call."}{" "}
                Free with founding membership.
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 1, flexWrap: "wrap", rowGap: 0.5 }}
              >
                <MiniMeta label="Founder" value="Thriving Dentist" />
                <MiniMeta label="Coached" value="2,200+ practices" />
                <MiniMeta label="Format" value="30 min · Zoom" />
              </Stack>
            </Box>
          </Stack>

          {/* Right — CTA */}
          <Box sx={{ flexShrink: 0, width: { xs: "100%", md: "auto" } }}>
            <Button
              onClick={() => setOpen(true)}
              variant="contained"
              size="large"
              disableElevation
              startIcon={<CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: "var(--ink, #0A1A2F)",
                color: "#FFFFFF",
                textTransform: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                borderRadius: 1,
                px: 2.5,
                py: 1.25,
                width: { xs: "100%", md: "auto" },
                boxShadow: "0 8px 22px -10px rgba(14,42,61,0.4)",
                "&:hover": {
                  bgcolor: "var(--gold-deep, #A07823)",
                  boxShadow: "0 10px 26px -10px rgba(217,168,75,0.55)",
                },
                "&:focus-visible": {
                  outline: "2px solid var(--gold, #F0C16E)",
                  outlineOffset: 3,
                },
              }}
            >
              Book a 30-min session
            </Button>
          </Box>
        </Stack>
      </Box>

      <BookingDialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
      />
    </>
  );
}

function BookingDialog({
  open,
  onClose,
  fullScreen,
}: {
  open: boolean;
  onClose: () => void;
  fullScreen: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : 2,
            overflow: "hidden",
            bgcolor: "#FFFFFF",
            border: fullScreen ? "none" : "1px solid rgba(14,42,61,0.08)",
            boxShadow: "0 32px 64px -32px rgba(14,42,61,0.4)",
            // Cap height so the calendar stays scrollable inside the modal
            // and the page underneath doesn't jump around.
            height: fullScreen ? "100%" : "min(820px, 92vh)",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Header strip */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 2, md: 2.5 },
          py: 1.5,
          borderBottom: "1px solid rgba(14,42,61,0.08)",
          flexShrink: 0,
          bgcolor: "#FBF8F1",
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 0.75,
            bgcolor: "rgba(217,168,75,0.16)",
            color: "var(--gold-deep, #A07823)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: "var(--gold-deep, #A07823)",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Coaching
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.92rem", md: "1rem" },
              fontWeight: 600,
              color: "var(--ink, #0A1A2F)",
              lineHeight: 1.2,
              mt: 0.25,
            }}
          >
            Book a 30-min session with Gary Takacs
          </Typography>
        </Box>
        <IconButton
          component="a"
          href={YCBM_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in new tab"
          size="small"
          sx={{
            color: "var(--ink-fade, #7A8590)",
            "&:hover": { color: "var(--ink, #0A1A2F)", bgcolor: "rgba(14,42,61,0.04)" },
          }}
        >
          <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          onClick={onClose}
          aria-label="Close"
          size="small"
          sx={{
            color: "var(--ink-fade, #7A8590)",
            "&:hover": { color: "var(--ink, #0A1A2F)", bgcolor: "rgba(14,42,61,0.04)" },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Iframe — only mounted when the dialog is open, so the calendar
          script doesn't load on every kit page. */}
      <Box sx={{ flex: 1, minHeight: 0, bgcolor: "#FFFFFF", position: "relative" }}>
        {open && (
          <Box
            component="iframe"
            src={YCBM_BOOKING_URL}
            title="Book a coaching session with Gary Takacs"
            sx={{
              border: 0,
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        )}
      </Box>
    </Dialog>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline" }}>
      <Typography
        sx={{
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--ink-fade, #7A8590)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--ink, #0A1A2F)" }}>
        {value}
      </Typography>
    </Stack>
  );
}
