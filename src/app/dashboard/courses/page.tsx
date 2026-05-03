"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { courses, type Course, type CourseStatus } from "@/lib/memberData";

const FILTERS: { key: CourseStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in-progress", label: "In progress" },
  { key: "not-started", label: "Not started" },
  { key: "completed", label: "Completed" },
];

export default function CoursesPage() {
  const [filter, setFilter] = useState<CourseStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? courses : courses.filter((c) => c.status === filter)),
    [filter],
  );

  const counts = useMemo(
    () => ({
      total: courses.length,
      inProgress: courses.filter((c) => c.status === "in-progress").length,
      completed: courses.filter((c) => c.status === "completed").length,
      ceAvailable: courses
        .filter((c) => c.status !== "completed")
        .reduce((sum, c) => sum + c.ceCredits, 0),
    }),
    [],
  );

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          LEARNING ACADEMY
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1 }}>
          Your courses
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 720 }}>
          Watch a video to its CE checkpoint, then pass the quiz with 70% or higher to earn CE
          credits and a certification you can download.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <SmallStat label="Total courses" value={`${counts.total}`} />
        <SmallStat label="In progress" value={`${counts.inProgress}`} accent="secondary" />
        <SmallStat label="Completed" value={`${counts.completed}`} />
        <SmallStat
          label="CE credits available"
          value={`${counts.ceAvailable}`}
          accent="secondary"
        />
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": { backgroundColor: "secondary.main", height: 3, borderRadius: 999 },
          }}
        >
          {FILTERS.map((f) => (
            <Tab
              key={f.key}
              value={f.key}
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box>{f.label}</Box>
                  <Chip
                    size="small"
                    label={
                      f.key === "all"
                        ? courses.length
                        : courses.filter((c) => c.status === f.key).length
                    }
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      bgcolor: filter === f.key ? "rgba(217,168,75,0.18)" : "grey.100",
                      color: filter === f.key ? "#A07823" : "text.secondary",
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filtered.map((c) => (
          <Grid key={c.slug} size={{ xs: 12, md: 6, xl: 4 }}>
            <CourseCard course={c} />
          </Grid>
        ))}
      </Grid>

      {filtered.length === 0 && (
        <Box sx={{ p: 6, textAlign: "center", bgcolor: "common.white", borderRadius: "20px", border: "1px dashed", borderColor: "divider" }}>
          <Typography sx={{ color: "text.secondary" }}>
            No courses in this view. Try a different filter.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

function SmallStat({
  label,
  value,
  accent = "primary",
}: {
  label: string;
  value: string;
  accent?: "primary" | "secondary";
}) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Box
        sx={{
          height: "100%",
          p: 2.5,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
        }}
      >
        <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase", mb: 0.75 }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.85rem",
            lineHeight: 1,
            color: accent === "secondary" ? "#A07823" : "text.primary",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Grid>
  );
}

function CourseCard({ course }: { course: Course }) {
  const watched = Math.round(course.watchProgress * 100);
  const ceUnlock = Math.round(course.ceUnlockAt * 100);
  const statusChip = (() => {
    if (course.status === "completed")
      return (
        <Chip
          size="small"
          icon={<CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />}
          label={`Certified · ${course.quizScore}%`}
          sx={{
            bgcolor: "#0E2A3D",
            color: "common.white",
            fontWeight: 700,
            fontSize: "0.68rem",
            height: 24,
            "& .MuiChip-icon": { color: "secondary.light" },
          }}
        />
      );
    if (course.status === "in-progress")
      return (
        <Chip
          size="small"
          label={`${watched}% watched`}
          sx={{
            bgcolor: "rgba(255,255,255,0.95)",
            color: "#A07823",
            fontWeight: 700,
            fontSize: "0.68rem",
            height: 24,
          }}
        />
      );
    return (
      <Chip
        size="small"
        label="Not started"
        sx={{ bgcolor: "rgba(255,255,255,0.85)", color: "text.secondary", fontWeight: 600, fontSize: "0.68rem", height: 24 }}
      />
    );
  })();

  return (
    <Box
      component={Link}
      href={`/dashboard/courses/${course.slug}`}
      sx={{
        display: "block",
        textDecoration: "none",
        height: "100%",
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "common.white",
        transition: "transform 280ms cubic-bezier(.2,.8,.2,1), box-shadow 280ms ease, border-color 280ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "rgba(14,42,61,0.3)",
          boxShadow: "0 32px 48px -28px rgba(14,42,61,0.4)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 168,
          backgroundImage: course.thumbAccent,
          color: "common.white",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(60% 60% at 50% 30%, rgba(255,255,255,0.16) 0%, transparent 70%)",
          }}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: "absolute", top: 18, left: 18, right: 18, justifyContent: "space-between", alignItems: "center" }}
        >
          <Chip
            label={course.category}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.95)",
              color: "primary.dark",
              fontSize: "0.68rem",
              height: 24,
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          />
          {statusChip}
        </Stack>
        <Box
          sx={{
            position: "absolute",
            bottom: 18,
            right: 18,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "rgba(255,255,255,0.96)",
            fontSize: "0.78rem",
            fontWeight: 700,
            textShadow: "0 1px 6px rgba(0,0,0,0.35)",
          }}
        >
          <AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />
          {course.durationMin} min
        </Box>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.95)",
              color: "primary.dark",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 24px 40px -16px rgba(0,0,0,0.4)",
            }}
          >
            <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 38 }} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Typography variant="h5" sx={{ fontSize: "1.05rem", lineHeight: 1.3, mb: 1.25, color: "text.primary" }}>
          {course.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 1.75, minHeight: 40 }}>
          {course.summary}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 1.75, flexWrap: "wrap", gap: 0.75 }}>
          <Chip
            icon={<SchoolOutlinedIcon sx={{ fontSize: 14 }} />}
            label={`${course.ceCredits} CE`}
            size="small"
            sx={{
              bgcolor: "rgba(217,168,75,0.14)",
              color: "#A07823",
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 24,
            }}
          />
          <Chip
            icon={<VerifiedOutlinedIcon sx={{ fontSize: 14 }} />}
            label="70% to certify"
            size="small"
            sx={{
              bgcolor: "rgba(14,42,61,0.07)",
              color: "primary.dark",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 24,
            }}
          />
        </Stack>

        {course.status !== "completed" && (
          <Box sx={{ position: "relative", mb: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={watched}
              sx={{
                height: 6,
                borderRadius: 999,
                bgcolor: "grey.100",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  backgroundImage: "linear-gradient(90deg, #0E2A3D 0%, #1B4258 100%)",
                },
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: -3,
                left: `${ceUnlock}%`,
                width: 2,
                height: 12,
                bgcolor: "secondary.main",
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            {course.instructor}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "primary.main",
            }}
          >
            {course.status === "completed"
              ? "Review"
              : course.status === "in-progress"
                ? "Resume"
                : "Start"}{" "}
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
