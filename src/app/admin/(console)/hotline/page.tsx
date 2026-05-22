"use client";
import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

export default function AdminHotlinePage() {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          HOTLINE TRIAGE
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          Expert hotline cases
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          Coming in Phase 1.5. The hotline data model (cases, pillars, expert routing, SLA timers) ships alongside the member dashboard build-out.
        </Typography>
      </Box>

      <Box
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: "20px",
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "common.white",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "rgba(217,168,75,0.14)",
            color: "#A07823",
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <SupportAgentOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h5" sx={{ fontSize: "1.15rem", mb: 1 }}>
          No hotline cases yet
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 480, mx: "auto" }}>
          Once members start submitting cases, the queue will land here with pillar tags, urgency, SLA timers, and expert match controls. For now this is intentionally empty.
        </Typography>
      </Box>
    </Stack>
  );
}
