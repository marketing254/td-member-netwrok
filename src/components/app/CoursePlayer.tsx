"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import FastForwardOutlinedIcon from "@mui/icons-material/FastForwardOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Course } from "@/lib/memberData";

const PASS_THRESHOLD = 70;

type Stage = "video" | "quiz" | "result";

export default function CoursePlayer({ course }: { course: Course }) {
  const totalSeconds = course.durationMin * 60;
  const [progress, setProgress] = useState(course.watchProgress); // 0-1
  const [playing, setPlaying] = useState(false);
  const [stage, setStage] = useState<Stage>(course.status === "completed" ? "result" : "video");
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(course.quiz.map((q) => [q.id, null])),
  );
  const [score, setScore] = useState<number | null>(course.quizScore ?? null);
  const lastTickRef = useRef<number | null>(null);

  // Simulated playback, advance progress while "playing"
  useEffect(() => {
    if (!playing) {
      lastTickRef.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      // Speed up the prototype: 8x real speed so users see the demo in seconds
      setProgress((p) => {
        const next = Math.min(1, p + (dt * 8) / totalSeconds);
        if (next >= 1) setPlaying(false);
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, totalSeconds]);

  const ceUnlocked = progress >= course.ceUnlockAt;
  const watchedPct = Math.round(progress * 100);
  const ceUnlockPct = Math.round(course.ceUnlockAt * 100);
  const elapsedSec = Math.round(progress * totalSeconds);
  const remainSec = Math.max(0, totalSeconds - elapsedSec);

  const submitQuiz = () => {
    const correct = course.quiz.filter((q) => answers[q.id] === q.correctIndex).length;
    const pct = Math.round((correct / course.quiz.length) * 100);
    setScore(pct);
    setStage("result");
  };
  const allAnswered = course.quiz.every((q) => answers[q.id] !== null);

  const passed = (score ?? 0) >= PASS_THRESHOLD;
  const correctCount = useMemo(
    () => course.quiz.filter((q) => answers[q.id] === q.correctIndex).length,
    [answers, course.quiz],
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          href="/dashboard/courses"
          variant="text"
          startIcon={<ArrowBackIcon />}
          sx={{ color: "text.secondary", mb: 1.5, ml: -1 }}
        >
          All courses
        </Button>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "flex-end" }, justifyContent: "space-between" }}>
          <Box sx={{ maxWidth: 760 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip
                label={course.category}
                size="small"
                sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.7rem" }}
              />
              <Chip
                icon={<SchoolOutlinedIcon sx={{ fontSize: 14 }} />}
                label={`${course.ceCredits} CE credits`}
                size="small"
                sx={{ bgcolor: "rgba(217,168,75,0.14)", color: "#A07823", fontWeight: 700, fontSize: "0.7rem" }}
              />
            </Stack>
            <Typography variant="h2" sx={{ fontSize: { xs: "1.85rem", md: "2.5rem" }, mb: 1 }}>
              {course.title}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "1.02rem", maxWidth: 720 }}>
              {course.summary}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary", fontSize: "0.85rem" }}>
              Instructor: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{course.instructor}</Box> · {course.instructorRole}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Left: video / quiz / result */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {stage === "video" && (
            <VideoStage
              course={course}
              progress={progress}
              playing={playing}
              setPlaying={setPlaying}
              setProgress={setProgress}
              ceUnlocked={ceUnlocked}
              watchedPct={watchedPct}
              ceUnlockPct={ceUnlockPct}
              elapsedSec={elapsedSec}
              remainSec={remainSec}
              onTakeQuiz={() => setStage("quiz")}
            />
          )}

          {stage === "quiz" && (
            <QuizStage
              course={course}
              answers={answers}
              setAnswers={setAnswers}
              allAnswered={allAnswered}
              onBack={() => setStage("video")}
              onSubmit={submitQuiz}
            />
          )}

          {stage === "result" && (
            <ResultStage
              course={course}
              score={score ?? 0}
              passed={passed}
              correctCount={correctCount}
              answers={answers}
              onRetake={() => {
                setAnswers(Object.fromEntries(course.quiz.map((q) => [q.id, null])));
                setScore(null);
                setStage("quiz");
              }}
              onRewatch={() => {
                setStage("video");
                setProgress(0);
              }}
            />
          )}
        </Grid>

        {/* Right rail */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            <Box
              sx={{
                p: 2.75,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "common.white",
              }}
            >
              <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                YOUR PROGRESS
              </Typography>
              <Stack spacing={1.5}>
                <ProgressRow
                  label="Video watched"
                  done={watchedPct >= 100}
                  detail={`${watchedPct}%`}
                />
                <ProgressRow
                  label={`CE checkpoint (${ceUnlockPct}%)`}
                  done={ceUnlocked}
                  detail={ceUnlocked ? "Unlocked" : `${ceUnlockPct - watchedPct}% to go`}
                />
                <ProgressRow
                  label="Quiz passed (≥ 70%)"
                  done={passed && score !== null}
                  detail={
                    score !== null
                      ? passed
                        ? `${score}%, passed`
                        : `${score}%, retake`
                      : "Locked until checkpoint"
                  }
                />
                <ProgressRow
                  label="Certification issued"
                  done={passed && score !== null}
                  detail={
                    passed && score !== null
                      ? `${course.ceCredits} CE credits awarded`
                      : "After passing quiz"
                  }
                />
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2.75,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "common.white",
              }}
            >
              <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                LESSONS
              </Typography>
              <Stack spacing={1}>
                {course.lessons.map((l, i) => {
                  const lessonStart = course.lessons.slice(0, i).reduce((s, x) => s + x.durationMin, 0);
                  const lessonEnd = lessonStart + l.durationMin;
                  const lessonStartPct = lessonStart / course.durationMin;
                  const lessonEndPct = lessonEnd / course.durationMin;
                  const watched = progress >= lessonEndPct;
                  const current = progress >= lessonStartPct && progress < lessonEndPct;
                  return (
                    <Stack
                      key={l.id}
                      direction="row"
                      spacing={1.25}
                      sx={{
                        alignItems: "center",
                        p: 1,
                        borderRadius: 2,
                        bgcolor: current ? "rgba(217,168,75,0.1)" : "transparent",
                        border: "1px solid",
                        borderColor: current ? "rgba(217,168,75,0.3)" : "transparent",
                      }}
                    >
                      <Box sx={{ color: watched ? "success.dark" : current ? "secondary.dark" : "text.secondary" }}>
                        {watched ? (
                          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <RadioButtonUncheckedOutlinedIcon sx={{ fontSize: 18 }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: current ? 700 : 500, color: "text.primary" }}>
                          {l.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: "0.72rem", color: "text.secondary", flexShrink: 0 }}>
                        {l.durationMin}m
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function ProgressRow({ label, done, detail }: { label: string; done: boolean; detail: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Box sx={{ color: done ? "success.dark" : "text.secondary" }}>
        {done ? (
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
        ) : (
          <RadioButtonUncheckedOutlinedIcon sx={{ fontSize: 20 }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</Typography>
      </Box>
      <Typography variant="body2" sx={{ fontSize: "0.78rem", color: done ? "success.dark" : "text.secondary", fontWeight: 600 }}>
        {detail}
      </Typography>
    </Stack>
  );
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function VideoStage({
  course,
  progress,
  playing,
  setPlaying,
  setProgress,
  ceUnlocked,
  watchedPct,
  ceUnlockPct,
  elapsedSec,
  remainSec,
  onTakeQuiz,
}: {
  course: Course;
  progress: number;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  setProgress: (v: number) => void;
  ceUnlocked: boolean;
  watchedPct: number;
  ceUnlockPct: number;
  elapsedSec: number;
  remainSec: number;
  onTakeQuiz: () => void;
}) {
  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          aspectRatio: "16 / 9",
          backgroundImage: course.thumbAccent,
          color: "common.white",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(60% 60% at 50% 35%, rgba(255,255,255,0.18) 0%, transparent 70%)",
          }}
        />
        <Stack sx={{ position: "absolute", inset: 0, p: 3, justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                bgcolor: playing ? "rgba(220, 60, 60, 0.85)" : "rgba(0,0,0,0.4)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "common.white" }} />
              {playing ? "PLAYING" : "PAUSED"}
            </Box>
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                bgcolor: "rgba(0,0,0,0.35)",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              {fmtTime(elapsedSec)} / {fmtTime(elapsedSec + remainSec)}
            </Box>
          </Stack>

          <Box sx={{ textAlign: "center" }}>
            <Box
              role="button"
              tabIndex={0}
              onClick={() => setPlaying(!playing)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPlaying(!playing);
                }
              }}
              sx={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.95)",
                color: "primary.dark",
                display: "grid",
                placeItems: "center",
                mx: "auto",
                cursor: "pointer",
                boxShadow: "0 32px 60px -16px rgba(0,0,0,0.45)",
                transition: "transform 200ms ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              {playing ? (
                <PauseCircleOutlineOutlinedIcon sx={{ fontSize: 64 }} />
              ) : (
                <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 64 }} />
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: "rgba(255,255,255,0.95)",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textShadow: "0 1px 6px rgba(0,0,0,0.35)",
              }}
            >
              {playing ? "Click to pause" : "Click to start playback"}
            </Typography>
          </Box>

          <Box>
            <Box sx={{ position: "relative", mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={watchedPct}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.18)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    backgroundImage: "linear-gradient(90deg, #F0C16E 0%, #D9A84B 100%)",
                  },
                }}
              />
              <Box
                aria-hidden
                title={`CE unlock at ${ceUnlockPct}%`}
                sx={{
                  position: "absolute",
                  top: -4,
                  left: `${ceUnlockPct}%`,
                  width: 2,
                  height: 14,
                  bgcolor: "common.white",
                  borderRadius: 1,
                  boxShadow: "0 0 0 3px rgba(255,255,255,0.25)",
                }}
              />
            </Box>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" sx={{ color: "common.white", fontSize: "0.8rem", fontWeight: 700, textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}>
                {watchedPct}% complete
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)", fontSize: "0.78rem", textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}>
                CE checkpoint at {ceUnlockPct}%
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Controls */}
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={playing ? <PauseCircleOutlineOutlinedIcon /> : <PlayCircleOutlineOutlinedIcon />}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? "Pause" : progress > 0 ? "Resume" : "Play"}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ReplayOutlinedIcon />}
          onClick={() => setProgress(0)}
        >
          Restart
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<FastForwardOutlinedIcon />}
          onClick={() => setProgress(Math.min(1, course.ceUnlockAt))}
          sx={{ ml: "auto" }}
        >
          Skip to CE checkpoint
        </Button>
      </Stack>

      {/* Checkpoint banner */}
      <Box
        sx={{
          p: 2.75,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: ceUnlocked ? "rgba(34,108,78,0.4)" : "rgba(217,168,75,0.4)",
          backgroundImage: ceUnlocked
            ? "linear-gradient(135deg, #ECF6EE 0%, #D5EBDB 100%)"
            : "linear-gradient(135deg, #FBF6E8 0%, #F4E8C9 100%)",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              bgcolor: ceUnlocked ? "rgba(34,108,78,0.15)" : "rgba(217,168,75,0.2)",
              border: ceUnlocked
                ? "1px solid rgba(34,108,78,0.4)"
                : "1px solid rgba(217,168,75,0.4)",
              display: "grid",
              placeItems: "center",
              color: ceUnlocked ? "success.dark" : "#A07823",
              flexShrink: 0,
            }}
          >
            {ceUnlocked ? <VerifiedOutlinedIcon /> : <LockOutlinedIcon />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary", mb: 0.25 }}>
              {ceUnlocked
                ? "CE checkpoint reached, quiz unlocked"
                : `Watch to ${ceUnlockPct}% to unlock the CE quiz`}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              {ceUnlocked
                ? `Pass with ${PASS_THRESHOLD}% or higher to earn ${course.ceCredits} CE credits and a downloadable certificate.`
                : `You're at ${watchedPct}%, ${ceUnlockPct - watchedPct}% to go before the quiz becomes available.`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color={ceUnlocked ? "secondary" : "primary"}
            disabled={!ceUnlocked}
            onClick={onTakeQuiz}
            startIcon={ceUnlocked ? <VerifiedOutlinedIcon /> : <LockOutlinedIcon />}
            sx={{ flexShrink: 0 }}
          >
            {ceUnlocked ? "Take the quiz" : "Quiz locked"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}

function QuizStage({
  course,
  answers,
  setAnswers,
  allAnswered,
  onBack,
  onSubmit,
}: {
  course: Course;
  answers: Record<string, number | null>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number | null>>>;
  allAnswered: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "common.white",
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            CERTIFICATION QUIZ
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.25 }}>
            {course.quiz.length} questions · {PASS_THRESHOLD}% to pass
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {answeredCount} of {course.quiz.length} answered
          </Typography>
        </Box>
        <Chip
          icon={<SchoolOutlinedIcon sx={{ fontSize: 14 }} />}
          label={`${course.ceCredits} CE on the line`}
          sx={{ bgcolor: "rgba(217,168,75,0.14)", color: "#A07823", fontWeight: 700 }}
        />
      </Stack>

      <Stack spacing={3.5}>
        {course.quiz.map((q, qi) => (
          <Box key={q.id}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, mb: 1.5, color: "text.primary" }}>
              {qi + 1}. {q.prompt}
            </Typography>
            <Stack spacing={1}>
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                return (
                  <Box
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setAnswers((prev) => ({ ...prev, [q.id]: i }));
                      }
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2.5,
                      border: "1.5px solid",
                      borderColor: selected ? "primary.main" : "divider",
                      bgcolor: selected ? "rgba(14,42,61,0.04)" : "common.white",
                      cursor: "pointer",
                      transition: "all 180ms ease",
                      "&:hover": { borderColor: "primary.main", bgcolor: "rgba(14,42,61,0.03)" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: selected ? "primary.main" : "grey.300",
                        bgcolor: selected ? "primary.main" : "transparent",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        transition: "all 180ms ease",
                      }}
                    >
                      {selected && (
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "common.white" }} />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: "0.92rem", color: "text.primary" }}>{opt}</Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mt: 4, justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="text" color="primary" onClick={onBack} startIcon={<ArrowBackIcon />}>
          Back to video
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          disabled={!allAnswered}
          onClick={onSubmit}
        >
          Submit answers
        </Button>
      </Stack>
    </Box>
  );
}

function ResultStage({
  course,
  score,
  passed,
  correctCount,
  answers,
  onRetake,
  onRewatch,
}: {
  course: Course;
  score: number;
  passed: boolean;
  correctCount: number;
  answers: Record<string, number | null>;
  onRetake: () => void;
  onRewatch: () => void;
}) {
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "24px",
          color: "common.white",
          backgroundImage: passed
            ? "linear-gradient(135deg, #1F5C40 0%, #0F3525 100%)"
            : "linear-gradient(135deg, #6B2D2D 0%, #3F1414 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(50% 50% at 80% 0%, rgba(217,168,75,0.3) 0%, transparent 60%)",
          }}
        />
        <Grid container spacing={3} sx={{ position: "relative", alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
              {passed ? (
                <EmojiEventsOutlinedIcon sx={{ color: "secondary.light", fontSize: 36 }} />
              ) : (
                <CancelOutlinedIcon sx={{ color: "rgba(255,255,255,0.95)", fontSize: 36 }} />
              )}
              <Typography variant="overline" sx={{ color: passed ? "secondary.light" : "rgba(255,255,255,0.95)", fontWeight: 700 }}>
                {passed ? "CERTIFIED" : "DID NOT PASS"}
              </Typography>
            </Stack>
            <Typography variant="h2" sx={{ color: "common.white", fontSize: { xs: "2rem", md: "2.5rem" }, mb: 1 }}>
              {passed ? "You earned it." : "Close, but not quite there."}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.92)", fontSize: "1.02rem", maxWidth: 520, lineHeight: 1.55 }}>
              {passed
                ? `You scored ${score}% (${correctCount} of ${course.quiz.length}). ${course.ceCredits} CE credits have been added to your 2026 transcript and your certificate is ready to download.`
                : `You scored ${score}% (${correctCount} of ${course.quiz.length}). You need ${PASS_THRESHOLD}% to certify. Re-watch the relevant lessons or retake the quiz, there's no limit on attempts.`}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.18)",
                bgcolor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                textAlign: "center",
              }}
            >
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.85)", display: "block", fontWeight: 700 }}>
                YOUR SCORE
              </Typography>
              <Typography
                sx={{
                  color: "common.white",
                  fontFamily: "var(--font-display)",
                  fontSize: "4rem",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  mb: 0.5,
                }}
              >
                {score}%
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)" }}>
                {correctCount} of {course.quiz.length} correct · {PASS_THRESHOLD}% to pass
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={score}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.18)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundImage: passed
                        ? "linear-gradient(90deg, #D9A84B 0%, #F0C16E 100%)"
                        : "linear-gradient(90deg, #F0C16E 0%, #D9A84B 100%)",
                    },
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        {passed ? (
          <>
            <Button variant="contained" color="secondary" size="large" startIcon={<DownloadOutlinedIcon />}>
              Download certificate
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={Link}
              href="/dashboard/certificates"
            >
              View certifications wall
            </Button>
            <Button
              variant="text"
              color="primary"
              size="large"
              component={Link}
              href="/dashboard/courses"
              sx={{ ml: { sm: "auto" } }}
            >
              Browse next course
            </Button>
          </>
        ) : (
          <>
            <Button variant="contained" color="primary" size="large" onClick={onRetake} startIcon={<RestartAltOutlinedIcon />}>
              Retake quiz
            </Button>
            <Button variant="outlined" color="primary" size="large" onClick={onRewatch} startIcon={<ReplayOutlinedIcon />}>
              Re-watch video
            </Button>
          </>
        )}
      </Stack>

      {/* Per-question review */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
        }}
      >
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
          QUESTION REVIEW
        </Typography>
        <Typography variant="h4" sx={{ mb: 2.5 }}>
          See where you landed
        </Typography>
        <Stack spacing={2.5}>
          {course.quiz.map((q, qi) => {
            const userAns = answers[q.id];
            const correct = userAns === q.correctIndex;
            return (
              <Box
                key={q.id}
                sx={{
                  p: 2.25,
                  borderRadius: "14px",
                  border: "1px solid",
                  borderColor: correct ? "rgba(34,108,78,0.3)" : "rgba(217,168,75,0.4)",
                  bgcolor: correct ? "rgba(34,108,78,0.04)" : "rgba(217,168,75,0.06)",
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", mb: 1 }}>
                  <Box sx={{ color: correct ? "success.dark" : "#A07823", mt: 0.25 }}>
                    {correct ? <CheckCircleOutlineOutlinedIcon /> : <CancelOutlinedIcon />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.25 }}>
                      {qi + 1}. {q.prompt}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                      Your answer:{" "}
                      <Box component="span" sx={{ color: correct ? "success.dark" : "error.main", fontWeight: 600 }}>
                        {userAns !== null ? q.options[userAns] : ""}
                      </Box>
                    </Typography>
                    {!correct && (
                      <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "success.dark", mt: 0.25 }}>
                        Correct answer: <Box component="span" sx={{ fontWeight: 600 }}>{q.options[q.correctIndex]}</Box>
                      </Typography>
                    )}
                    {q.explanation && (
                      <Typography variant="body2" sx={{ mt: 0.75, fontSize: "0.82rem", color: "text.secondary", fontStyle: "italic" }}>
                        {q.explanation}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
