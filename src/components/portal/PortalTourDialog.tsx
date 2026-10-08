"use client";

import { Box, Button, Dialog, IconButton, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { PORTAL_TOUR, TOUR_COPY, type TourPortal } from "@/lib/portalTour";

/**
 * The portal tour pop-up (Lester, 8 Oct 2026). Opens over the dashboard
 * the first time an expert or partner signs in, and again from the
 * "Portal tour" link in the sidebar. The quick guide for that portal is
 * embedded, muted autoplay so it starts on open; the sound button on the
 * player is the one click that turns audio on. Closing it any way, the
 * button, the X, the backdrop or Escape, counts as "seen".
 */
export default function PortalTourDialog({ portal, open, onClose }: { portal: TourPortal; open: boolean; onClose: () => void }) {
  const tour = PORTAL_TOUR[portal];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "20px", overflow: "hidden", bgcolor: "#fff" } } }}
    >
      <Box sx={{ position: "relative", px: { xs: 2.5, md: 4 }, pt: { xs: 3, md: 3.5 }, pb: 1.5 }}>
        <IconButton aria-label="Skip for now" onClick={onClose} size="small" sx={{ position: "absolute", top: 12, right: 12, color: "#5C6770" }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A07823" }}>Portal tour · {tour.quickGuide.minutes} min</Typography>
        <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.45rem", md: "1.75rem" }, fontWeight: 500, color: "#0A1A2F", lineHeight: 1.15, mt: 0.75, pr: 4 }}>
          {tour.heading}
        </Typography>
        <Typography sx={{ color: "#3B4A55", fontSize: "0.95rem", mt: 0.75 }}>{TOUR_COPY.subheading}</Typography>
      </Box>
      <Box sx={{ px: { xs: 2.5, md: 4 } }}>
        <Box sx={{ position: "relative", width: "100%", pt: "56.25%", borderRadius: "14px", overflow: "hidden", bgcolor: "#000" }}>
          {open && (
            <Box
              component="iframe"
              src={`${tour.quickGuide.embedUrl}&autoplay=1&mute=1`}
              title={tour.heading}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          )}
        </Box>
      </Box>
      <Box sx={{ px: { xs: 2.5, md: 4 }, py: 2.5, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 1.5 }}>
        <Typography sx={{ fontSize: "0.8rem", color: "#7A8590" }}>{TOUR_COPY.footer}</Typography>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", borderRadius: "999px", px: 2.5, fontWeight: 700, borderColor: "#0E2A3D", color: "#0E2A3D !important", "&:hover": { bgcolor: "rgba(14,42,61,0.06)", borderColor: "#0E2A3D" } }}>
          {TOUR_COPY.skip}
        </Button>
      </Box>
    </Dialog>
  );
}
