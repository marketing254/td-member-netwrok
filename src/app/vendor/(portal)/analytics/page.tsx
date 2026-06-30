"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

const WINE = "#6E3346";
const WINE_DARK = "#4A2030";
const WINE_TINT = "#F4E7EB";
const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const LINE = "#E6DDCF";
const GOLD = "#A07823";

type AnalyticsRow = {
  id: string;
  topic_slug: string;
  topic_title: string;
  title: string;
  views_total: number;
  views_unique_members: number;
  inquiries_open: number;
  inquiries_answered: number;
  inquiries_total: number;
  feedback_count: number;
  feedback_avg: number | null;
};

type Headline = {
  views: number;
  members: number;
  inquiries: number;
  avgRating: number | null;
};

export default function VendorAnalyticsPage() {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [headline, setHeadline] = useState<Headline>({ views: 0, members: 0, inquiries: 0, avgRating: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/vendor/analytics", { cache: "no-store" });
        if (!active || !res.ok) return;
        const body = (await res.json()) as { resources?: AnalyticsRow[]; headline?: Headline };
        if (active) {
          setRows(body.resources ?? []);
          if (body.headline) setHeadline(body.headline);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <Stack spacing={3.5} sx={{ maxWidth: 1100, mx: "auto" }}>
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: WINE_DARK,
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Analytics
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
          How your resources are landing
        </Typography>
        <Typography sx={{ fontSize: "0.96rem", color: INK_SOFT, maxWidth: 640, lineHeight: 1.55 }}>
          Views, unique members reached, member inquiries, and the average rating for each kit attributed to your name. Updated in near real-time.
        </Typography>
      </Box>

      {loading ? (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress size={22} sx={{ color: WINE }} />
        </Stack>
      ) : rows.length === 0 ? (
        <Box
          sx={{
            borderRadius: 3,
            border: `1px solid ${LINE}`,
            bgcolor: "#FFFFFF",
            p: { xs: 4, md: 6 },
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: WINE_TINT,
              color: WINE,
              display: "grid",
              placeItems: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <VisibilityRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 500, color: INK, mb: 0.75 }}>
            Nothing to show yet
          </Typography>
          <Typography sx={{ fontSize: "0.92rem", color: INK_SOFT, maxWidth: 460, mx: "auto" }}>
            When the team publishes a kit tagged with your name, the views, inquiries, and ratings will appear here.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Headline tiles */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            <HeadlineTile icon={<VisibilityRoundedIcon sx={{ fontSize: 18 }} />} label="Total views" value={headline.views.toLocaleString()} />
            <HeadlineTile icon={<PeopleAltRoundedIcon sx={{ fontSize: 18 }} />} label="Members reached" value={headline.members.toLocaleString()} />
            <HeadlineTile icon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18 }} />} label="Inquiries" value={headline.inquiries.toLocaleString()} />
            <HeadlineTile
              icon={<StarRoundedIcon sx={{ fontSize: 18, color: GOLD }} />}
              label="Avg rating"
              value={headline.avgRating === null ? "—" : headline.avgRating.toFixed(1)}
            />
          </Box>

          {/* Per-resource table */}
          <Box sx={{ borderRadius: 3, border: `1px solid ${LINE}`, bgcolor: "#FFFFFF", overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${LINE}` }}>
              <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: INK }}>
                By resource
              </Typography>
            </Box>
            <Stack divider={<Box sx={{ borderTop: "1px solid #EFEAE0" }} />}>
              {rows.map((r) => (
                <Box key={r.id} sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: "0.74rem", color: INK_MUTED, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {r.topic_title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.96rem", fontWeight: 700, color: INK, lineHeight: 1.2, mt: 0.25 }}>
                        {r.title}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2.5} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
                      <Stat label="Views" value={r.views_total} />
                      <Stat label="Members" value={r.views_unique_members} />
                      <Stat
                        label="Inquiries"
                        value={r.inquiries_total}
                        sub={r.inquiries_open > 0 ? `${r.inquiries_open} open` : null}
                      />
                      <Stat
                        label="Rating"
                        value={r.feedback_avg === null ? "—" : r.feedback_avg.toFixed(1)}
                        sub={r.feedback_count > 0 ? `${r.feedback_count} response${r.feedback_count === 1 ? "" : "s"}` : null}
                      />
                      <Box
                        component="a"
                        href={`/dashboard/resources/${r.topic_slug}`}
                        target="_blank"
                        rel="noopener"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: WINE_DARK,
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        View kit <OpenInNewRoundedIcon sx={{ fontSize: 12 }} />
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}

function HeadlineTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ borderRadius: 2, border: `1px solid ${LINE}`, bgcolor: "#FFFFFF", p: 1.75 }}>
      <Stack direction="row" spacing={0.85} sx={{ alignItems: "center", color: INK_MUTED, mb: 0.5 }}>
        {icon}
        <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", fontWeight: 600, color: INK, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string | null }) {
  return (
    <Box sx={{ textAlign: "center", minWidth: 60 }}>
      <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", color: INK_MUTED, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: INK, lineHeight: 1.1, mt: 0.25 }}>
        {value}
      </Typography>
      {sub && <Typography sx={{ fontSize: "0.62rem", color: INK_MUTED, mt: 0.25 }}>{sub}</Typography>}
    </Box>
  );
}
