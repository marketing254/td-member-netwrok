"use client";

import { Box, Stack, Typography } from "@mui/material";
import NetworkFeed from "@/components/network/NetworkFeed";

const EXPERT_GREEN_DARK = "#1F5238";
const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";

export default function ExpertPostsPage() {
  return (
    <Stack spacing={4} sx={{ maxWidth: 720, mx: "auto" }}>
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: EXPERT_GREEN_DARK,
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Network feed
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.9rem", md: "2.4rem" },
            fontWeight: 500,
            color: INK,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            mb: 1,
          }}
        >
          Share what you&apos;re thinking
        </Typography>
        <Typography sx={{ color: INK_SOFT, fontSize: "0.98rem", lineHeight: 1.55 }}>
          Posts appear in every member and partner&apos;s feed across the network. They can react and comment in real time.
        </Typography>
      </Box>

      <NetworkFeed />
    </Stack>
  );
}
