"use client";

import { Box, Stack, Typography } from "@mui/material";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

/**
 * SupportCard — compact help block shown on every portal (member, expert,
 * partner) so signed-in users always have a one-click way to reach the
 * team. Two channels:
 *
 *   - Hotline (clickable tel: link on mobile, prominent number on desktop)
 *   - Email (mailto: link tinted with the portal accent)
 *
 * Layout: single horizontal row on md+, stacked column on mobile. Plays
 * nicely inside both the sidebar drawer and standalone "Need help?"
 * placements on dashboard pages.
 */

export type SupportCardProps = {
  /** Phone number to display + dial. Falsy = hide the hotline row. */
  phone?: string | null;
  /** Email to display + open via mailto. */
  email: string;
  /** Optional eyebrow label above the heading (defaults to "Support"). */
  eyebrow?: string;
  /** Optional accent colour for icons + email link. Defaults to ink-soft. */
  accent?: string;
  /** Tint background colour for the icon tiles. */
  accentTint?: string;
  /** Variant — `compact` collapses everything to a single icon row. */
  variant?: "default" | "compact";
};

export default function SupportCard({
  phone = "1-844-DMN-HELP",
  email,
  eyebrow = "Support",
  accent = "#0A1A2F",
  accentTint = "rgba(14,42,61,0.06)",
  variant = "default",
}: SupportCardProps) {
  const compact = variant === "compact";
  return (
    <Box
      sx={{
        borderRadius: 1.5,
        border: "1px solid rgba(14,42,61,0.08)",
        bgcolor: "#FFFFFF",
        p: compact ? 1.25 : 1.75,
      }}
    >
      {!compact && (
        <Typography
          sx={{
            fontSize: "0.58rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            color: accent,
            textTransform: "uppercase",
            mb: 0.85,
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Stack
        direction={compact ? "row" : { xs: "column", md: "row" }}
        spacing={compact ? 1 : 1.5}
        sx={{ alignItems: { md: "stretch" } }}
      >
        {phone && (
          <Box
            component="a"
            href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
              minWidth: 0,
              borderRadius: 1.25,
              px: 1,
              py: 0.85,
              textDecoration: "none",
              color: "#0A1A2F",
              transition: "background-color 160ms ease",
              "&:hover": { bgcolor: accentTint },
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: accentTint,
                color: accent,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <PhoneRoundedIcon sx={{ fontSize: 14 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#7A8590", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Hotline
              </Typography>
              <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#0A1A2F", lineHeight: 1.2 }}>
                {phone}
              </Typography>
            </Box>
          </Box>
        )}
        <Box
          component="a"
          href={`mailto:${email}`}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            minWidth: 0,
            borderRadius: 1.25,
            px: 1,
            py: 0.85,
            textDecoration: "none",
            color: "#0A1A2F",
            transition: "background-color 160ms ease",
            "&:hover": { bgcolor: accentTint },
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: accentTint,
              color: accent,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <EmailOutlinedIcon sx={{ fontSize: 14 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#7A8590", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Email
            </Typography>
            <Typography
              sx={{
                fontSize: "0.84rem",
                fontWeight: 600,
                color: accent,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
