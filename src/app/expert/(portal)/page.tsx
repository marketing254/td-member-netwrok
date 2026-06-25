"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { ExpertsRow } from "@/lib/supabase/types";

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";
const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const LINE = "#E6DDCF";

export default function ExpertDashboardPage() {
  const [expert, setExpert] = useState<ExpertsRow | null>(null);
  const [resourceCount, setResourceCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createBrowserSupabase();
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email?.toLowerCase();
      if (!email) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("experts")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      if (!active) return;
      setExpert(data);

      if (data?.id) {
        const { count } = await supabase
          .from("expert_resources")
          .select("id", { count: "exact", head: true })
          .eq("expert_id", data.id);
        if (active) setResourceCount(count ?? 0);
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 12 }}>
        <CircularProgress size={32} sx={{ color: EXPERT_GREEN }} />
      </Stack>
    );
  }

  const firstName = (expert?.display_name ?? expert?.full_name ?? "there")
    .trim()
    .split(/\s+/)[0];
  const activated = expert?.activated_at ? new Date(expert.activated_at) : null;
  const daysSinceJoin = activated
    ? Math.max(0, Math.floor((Date.now() - activated.getTime()) / 86_400_000))
    : null;

  return (
    <Stack spacing={5} sx={{ maxWidth: 960, mx: "auto" }}>
      {/* Hero */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: EXPERT_GREEN_DARK,
            textTransform: "uppercase",
            mb: 1.25,
          }}
        >
          Your workspace
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "2.2rem", md: "3rem" },
            fontWeight: 500,
            color: INK,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            mb: 1.5,
          }}
        >
          Welcome back, {firstName}.
        </Typography>
        <Typography sx={{ color: INK_SOFT, fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.6, maxWidth: 660 }}>
          {daysSinceJoin === null
            ? "Your portal is live. Upload your first resource, set up your public profile, and start engaging with members."
            : daysSinceJoin === 0
              ? "Your portal is live today. Take a look around — upload your first resource or finish your profile to get started."
              : `Day ${daysSinceJoin} on the bench. Keep uploading work and sharing updates; members are starting to engage.`}
        </Typography>
      </Box>

      {/* Quick stats row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <StatTile
          label="Resources uploaded"
          value={resourceCount?.toString() ?? "—"}
          hint={
            resourceCount === 0
              ? "Add your first one"
              : resourceCount === 1
                ? "One in the library"
                : `${resourceCount} in the library`
          }
        />
        <StatTile label="Member views" value="—" hint="Tracking starts soon" muted />
        <StatTile label="Inquiries" value="—" hint="None yet" muted />
        <StatTile
          label="Status"
          value={expert?.status === "active" ? "Active" : "—"}
          hint={
            activated
              ? `Since ${activated.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : ""
          }
        />
      </Box>

      {/* Primary CTA — onboarding scheduling */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: `1px solid ${EXPERT_GREEN}33`,
          bgcolor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 24px 60px -36px rgba(44,122,82,0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 80% at 100% 0%, rgba(44,122,82,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ alignItems: { md: "center" }, justifyContent: "space-between", position: "relative" }}
        >
          <Stack direction="row" spacing={2.5} sx={{ alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: `${EXPERT_GREEN}14`,
                color: EXPERT_GREEN,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <CalendarMonthOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", color: EXPERT_GREEN_DARK, textTransform: "uppercase", mb: 0.5 }}>
                Recommended
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "1.4rem", md: "1.6rem" },
                  fontWeight: 500,
                  color: INK,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  mb: 0.5,
                }}
              >
                Set up your public profile
              </Typography>
              <Typography sx={{ color: INK_SOFT, fontSize: "0.95rem", lineHeight: 1.55, maxWidth: 460 }}>
                Members see your bio, photo, and booking link before they reach out. A complete profile gets ~3× the inquiries.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            component={Link}
            href="/expert/profile"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              borderRadius: 999,
              px: 3,
              bgcolor: EXPERT_GREEN,
              color: "#FFFFFF",
              backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
              boxShadow: `0 8px 22px -10px ${EXPERT_GREEN}88`,
              flexShrink: 0,
              alignSelf: { xs: "flex-start", md: "center" },
              "&:hover": {
                bgcolor: EXPERT_GREEN_DARK,
                backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
              },
            }}
          >
            Complete profile
          </Button>
        </Stack>
      </Box>

      {/* Section cards — direct links to the main areas */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: INK_MUTED,
            textTransform: "uppercase",
            mb: 2,
          }}
        >
          Get started
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          <SectionCard
            icon={UploadFileOutlinedIcon}
            title="Upload resources"
            body="SOPs, templates, slide decks, recordings, PDFs. We brand them in the DMN style and publish to the member library."
            href="/expert/resources"
            cta="Add a resource"
          />
          <SectionCard
            icon={InsightsOutlinedIcon}
            title="Track inquiries"
            body="See which members opened your resources and who's inquired about working with you. Coming soon."
            href="/expert/inquiries"
            cta="See inquiries"
            comingSoon
          />
          <SectionCard
            icon={ChatBubbleOutlineOutlinedIcon}
            title="Post updates"
            body="Write short status updates that appear in member and partner feeds. Members can comment and react. Coming soon."
            href="/expert/posts"
            cta="Write a post"
            comingSoon
          />
          <SectionCard
            icon={ManageAccountsOutlinedIcon}
            title="Public profile"
            body="Your bio, photo, booking link, and topics — the way members and partners see you in the directory."
            href="/expert/profile"
            cta="Edit profile"
          />
        </Box>
      </Box>

      {/* From your application snapshot */}
      {expert && (
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: 4,
            border: `1px solid ${LINE}`,
            bgcolor: "rgba(255,255,255,0.6)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: INK_MUTED,
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            From your application
          </Typography>
          <Stack spacing={2}>
            <Field label="Your topic" value={expert.specialty} />
            {expert.topics && <Field label="Topics you proposed" value={expert.topics} />}
            {expert.website && <Field label="Website" value={expert.website} />}
            {expert.booking_link && <Field label="Booking link" value={expert.booking_link} />}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function StatTile({
  label,
  value,
  hint,
  muted,
}: {
  label: string;
  value: string;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${LINE}`,
        bgcolor: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(4px)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.16em",
          color: INK_MUTED,
          textTransform: "uppercase",
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.7rem",
          fontWeight: 500,
          color: muted ? INK_MUTED : INK,
          lineHeight: 1,
          letterSpacing: "-0.01em",
          mb: 0.5,
        }}
      >
        {value}
      </Typography>
      {hint && (
        <Typography sx={{ fontSize: "0.78rem", color: INK_MUTED, lineHeight: 1.4 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

function SectionCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
  comingSoon,
}: {
  icon: React.ElementType<{ sx?: object }>;
  title: string;
  body: string;
  href: string;
  cta: string;
  comingSoon?: boolean;
}) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "block",
        p: 3,
        borderRadius: 3,
        border: `1px solid ${LINE}`,
        bgcolor: "#FFFFFF",
        textDecoration: "none",
        transition: "border-color 220ms ease, transform 220ms ease, box-shadow 220ms ease",
        "&:hover": {
          borderColor: `${EXPERT_GREEN}66`,
          transform: "translateY(-2px)",
          boxShadow: `0 16px 40px -28px ${EXPERT_GREEN}55`,
        },
      }}
    >
      <Stack direction="row" spacing={2.5} sx={{ alignItems: "flex-start", mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            bgcolor: `${EXPERT_GREEN}14`,
            color: EXPERT_GREEN,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                fontWeight: 500,
                color: INK,
                letterSpacing: "-0.005em",
              }}
            >
              {title}
            </Typography>
            {comingSoon && (
              <Chip
                label="Soon"
                size="small"
                sx={{
                  bgcolor: "rgba(14,42,61,0.06)",
                  color: INK_MUTED,
                  fontSize: "0.62rem",
                  height: 18,
                  fontWeight: 700,
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            )}
          </Stack>
          <Typography sx={{ color: INK_SOFT, fontSize: "0.92rem", lineHeight: 1.55 }}>
            {body}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: EXPERT_GREEN_DARK }}>
          {cta}
        </Typography>
        <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: EXPERT_GREEN_DARK }} />
      </Stack>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <Box>
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: INK_MUTED, textTransform: "uppercase", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ color: INK, fontSize: "0.95rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
        {value}
      </Typography>
    </Box>
  );
}
