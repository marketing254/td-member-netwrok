"use client";

import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import NetworkFeed from "@/components/network/NetworkFeed";
import ExpertChatDialog from "@/components/network/ExpertChatDialog";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";

export default function MemberNetworkPage() {
  const [chat, setChat] = useState<{ id: string; name: string } | null>(null);

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: { xs: 3, md: 5 }, px: { xs: 2, md: 0 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: INK_MUTED,
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Network
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
            What the experts are sharing
          </Typography>
          <Typography sx={{ color: INK_SOFT, fontSize: "0.98rem", lineHeight: 1.55 }}>
            Take a quick read of what the bench is publishing. React, comment, or ping an expert&apos;s AI helper to ask a question directly.
          </Typography>
        </Box>

        <NetworkFeed
          hideComposer
          onAskExpertBot={({ expertId, expertName }) =>
            setChat({ id: expertId, name: expertName })
          }
        />
      </Stack>

      {chat && (
        <ExpertChatDialog
          open
          expertId={chat.id}
          expertName={chat.name}
          onClose={() => setChat(null)}
        />
      )}
    </Box>
  );
}
