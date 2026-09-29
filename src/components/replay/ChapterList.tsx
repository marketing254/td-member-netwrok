"use client";

import { Box, Stack, Typography } from "@mui/material";
import type { ReplayChapter } from "@/lib/events/ridaReplay";
import { fmtTime } from "@/lib/events/ridaReplay";

/**
 * The chapter list, shared by the public replay page and the portal.
 * Clicking a chapter seeks the player; `current` highlights the chapter
 * that contains the playhead.
 */
export default function ChapterList({
  chapters,
  current,
  onPick,
  limit,
  dense = false,
  tone = "light",
}: {
  chapters: ReplayChapter[];
  current: number;
  onPick: (index: number) => void;
  /** Show only the first N rows (public page, collapsed). */
  limit?: number;
  dense?: boolean;
  tone?: "light" | "dark";
}) {
  const rows = typeof limit === "number" ? chapters.slice(0, limit) : chapters;
  const dark = tone === "dark";
  const ink = dark ? "#FFFFFF" : "#0A1A2F";
  const muted = dark ? "rgba(255,255,255,0.62)" : "#5C6770";
  const line = dark ? "rgba(255,255,255,0.10)" : "#EBE5D8";
  return (
    <Stack component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {rows.map((c, i) => {
        const active = i === current;
        return (
          <Box
            component="li"
            key={c.start}
            onClick={() => onPick(i)}
            sx={{
              display: "grid",
              gridTemplateColumns: "56px 1fr",
              gap: 1.5,
              alignItems: "baseline",
              px: dense ? 1.25 : 1.5,
              py: dense ? 0.9 : 1.15,
              borderTop: i === 0 ? 0 : `1px solid ${line}`,
              cursor: "pointer",
              bgcolor: active ? (dark ? "rgba(217,168,75,0.14)" : "rgba(217,168,75,0.13)") : "transparent",
              borderLeft: active ? "3px solid #D9A84B" : "3px solid transparent",
              transition: "background-color 140ms ease",
              "&:hover": { bgcolor: active ? undefined : dark ? "rgba(255,255,255,0.05)" : "rgba(14,42,61,0.04)" },
            }}
          >
            <Typography component="span" sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: "0.82rem", color: active ? "#A07823" : dark ? "#F0C16E" : "#0E2A3D" }}>
              {fmtTime(c.start)}
            </Typography>
            <Box>
              <Typography component="span" sx={{ display: "block", fontSize: dense ? "0.86rem" : "0.92rem", fontWeight: active ? 700 : 500, color: ink, lineHeight: 1.35 }}>
                {c.title}
              </Typography>
              <Typography component="span" sx={{ display: "block", fontSize: "0.74rem", color: muted, mt: 0.2 }}>
                {c.who}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
