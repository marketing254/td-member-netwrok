"use client";
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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import StarsOutlinedIcon from "@mui/icons-material/StarsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import {
  member,
  courses,
  vendorOffers,
  rewardCatalog,
  recentActivity,
  upcomingDeadlines,
  certificates,
} from "@/lib/memberData";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export default function DashboardOverview() {
  const ceProgress = (member.ceCreditsEarnedYtd / member.ceCreditsGoalYtd) * 100;
  const inProgress = courses.filter((c) => c.status === "in-progress");
  const notStarted = courses.filter((c) => c.status === "not-started");
  const continueCourse = inProgress[0] ?? notStarted[0] ?? courses[0];
  const recommended = courses
    .filter((c) => c.slug !== continueCourse.slug && c.status !== "completed")
    .slice(0, 3);

  return (
    <Stack spacing={4}>
      {/* Hero greeting + KPIs */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          p: { xs: 3, md: 4.5 },
          color: "common.white",
          backgroundImage:
            "linear-gradient(135deg, #06182A 0%, #0E2A3D 55%, #1B4258 100%)",
          boxShadow: "0 32px 64px -36px rgba(6,24,42,0.55)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(45% 45% at 80% 0%, rgba(217,168,75,0.35) 0%, transparent 60%), radial-gradient(40% 40% at 10% 100%, rgba(34,108,165,0.4) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <Grid container spacing={4} sx={{ position: "relative", alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <Chip
                label="FOUNDING MEMBER · LIFETIME $49"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "rgba(217,168,75,0.16)",
                  color: "secondary.light",
                  border: "1px solid rgba(217,168,75,0.35)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                }}
              />
              <Typography variant="h2" sx={{ color: "common.white", fontSize: { xs: "2rem", md: "2.75rem" } }}>
                {greeting()}, Dr. {member.firstName}.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.88)", fontSize: { xs: "1rem", md: "1.1rem" }, maxWidth: 540, lineHeight: 1.55 }}>
                You&apos;re {(ceProgress).toFixed(0)}% of the way to your 2026 CE goal, with $
                {member.savingsYtd.toLocaleString()} captured year-to-date and{" "}
                {member.cePointsBalance} CE points ready to redeem.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  component={Link}
                  href={`/dashboard/courses/${continueCourse.slug}`}
                >
                  Continue: {continueCourse.title.split(" ").slice(0, 4).join(" ")}…
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PhoneInTalkOutlinedIcon />}
                  sx={{
                    color: "common.white",
                    borderColor: "rgba(255,255,255,0.25)",
                    bgcolor: "rgba(255,255,255,0.04)",
                    "&:hover": { borderColor: "rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  Open hotline case
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: 2.75,
                borderRadius: "16px",
                bgcolor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(14px)",
              }}
            >
              <Typography variant="overline" sx={{ color: "secondary.light", display: "block", mb: 1 }}>
                THIS QUARTER AT A GLANCE
              </Typography>
              <Stack spacing={1.75}>
                {upcomingDeadlines.map((d) => (
                  <Box key={d.id} sx={{ display: "flex", gap: 1.5 }}>
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: "rgba(217,168,75,0.14)",
                        border: "1px solid rgba(217,168,75,0.3)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: "secondary.light" }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "baseline" }}>
                        <Typography sx={{ color: "common.white", fontWeight: 600, fontSize: "0.95rem" }}>
                          {d.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "secondary.light", fontSize: "0.75rem" }}>
                          {d.date}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.82)", fontSize: "0.82rem", lineHeight: 1.45 }}>
                        {d.detail}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5}>
        <StatCard
          icon={SchoolOutlinedIcon}
          label="CE credits · 2026"
          value={`${member.ceCreditsEarnedYtd}`}
          suffix={` / ${member.ceCreditsGoalYtd}`}
          progress={ceProgress}
          accent="primary"
          footer={`${(member.ceCreditsGoalYtd - member.ceCreditsEarnedYtd).toFixed(1)} credits to state-renewal target`}
        />
        <StatCard
          icon={StarsOutlinedIcon}
          label="CE points balance"
          value={`${member.cePointsBalance}`}
          suffix=" pts"
          accent="secondary"
          footer="Redeemable in the rewards store"
          link={{ href: "/dashboard/rewards", label: "Redeem now" }}
        />
        <StatCard
          icon={SavingsOutlinedIcon}
          label="Savings YTD"
          value={`$${member.savingsYtd.toLocaleString()}`}
          accent="primary"
          footer={`Across ${vendorOffers.filter((v) => v.savedYtd > 0).length} active vendor offers`}
          link={{ href: "/dashboard/rewards", label: "See offers" }}
        />
        <StatCard
          icon={WorkspacePremiumOutlinedIcon}
          label="Certifications"
          value={`${certificates.length}`}
          suffix=" earned"
          accent="secondary"
          footer={`${courses.filter((c) => c.status === "in-progress").length} in progress`}
          link={{ href: "/dashboard/certificates", label: "View wall" }}
        />
      </Grid>

      <Grid container spacing={3}>
        {/* Continue learning */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <SectionHeader
              eyebrow="CONTINUE LEARNING"
              title="Pick up where you left off"
              action={{ href: "/dashboard/courses", label: "All courses" }}
            />
            <ContinueCard course={continueCourse} />

            <SectionHeader eyebrow="RECOMMENDED" title="Pending courses & next videos" />
            <Grid container spacing={2}>
              {recommended.map((c) => (
                <Grid key={c.slug} size={{ xs: 12, sm: 6 }}>
                  <Box
                    component={Link}
                    href={`/dashboard/courses/${c.slug}`}
                    sx={{
                      display: "block",
                      textDecoration: "none",
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "common.white",
                      overflow: "hidden",
                      height: "100%",
                      transition: "transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms ease, border-color 240ms ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        borderColor: "rgba(14,42,61,0.3)",
                        boxShadow: "0 24px 40px -28px rgba(14,42,61,0.4)",
                      },
                    }}
                  >
                    <Box sx={{ height: 100, backgroundImage: c.thumbAccent, position: "relative" }}>
                      <Chip
                        label={c.category}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          bgcolor: "rgba(255,255,255,0.95)",
                          color: "primary.dark",
                          fontSize: "0.68rem",
                          height: 24,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 14,
                          right: 16,
                          color: "rgba(255,255,255,0.96)",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                        }}
                      >
                        <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                        {c.durationMin} min
                      </Box>
                    </Box>
                    <Box sx={{ p: 2.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.35, mb: 1.25, minHeight: 50 }}>
                        {c.title}
                      </Typography>
                      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                        <Chip
                          icon={<SchoolOutlinedIcon sx={{ fontSize: 14 }} />}
                          label={`${c.ceCredits} CE`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(217,168,75,0.14)",
                            color: "#A07823",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            height: 24,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                          {c.status === "in-progress"
                            ? `${Math.round(c.watchProgress * 100)}% watched`
                            : "Not started"}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Grid>

        {/* Right column: Discounts, redemption, activity */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <DiscountsCard />
            <CePointsRedemptionCard />
            <ActivityCard />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  progress,
  footer,
  link,
  accent = "primary",
}: {
  icon: React.ElementType<{ sx?: object }>;
  label: string;
  value: string;
  suffix?: string;
  progress?: number;
  footer?: string;
  link?: { href: string; label: string };
  accent?: "primary" | "secondary";
}) {
  const tint =
    accent === "secondary"
      ? { bg: "rgba(217,168,75,0.12)", border: "rgba(217,168,75,0.32)", color: "#A07823" }
      : { bg: "rgba(14,42,61,0.07)", border: "rgba(14,42,61,0.18)", color: "#0E2A3D" };

  return (
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <Box
        sx={{
          height: "100%",
          p: 2.75,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          "&:hover": { borderColor: "rgba(14,42,61,0.2)", boxShadow: "0 16px 32px -24px rgba(14,42,61,0.25)" },
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary", letterSpacing: "0.04em", fontWeight: 600, textTransform: "uppercase" }}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: tint.bg,
              border: `1px solid ${tint.border}`,
              display: "grid",
              placeItems: "center",
              color: tint.color,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
        </Stack>
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "2.15rem",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "text.primary",
            }}
          >
            {value}
            {suffix && (
              <Box component="span" sx={{ fontSize: "1rem", color: "text.secondary", fontFamily: "var(--font-body)", ml: 0.5 }}>
                {suffix}
              </Box>
            )}
          </Typography>
        </Box>
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 5,
              borderRadius: 999,
              bgcolor: "grey.100",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                backgroundImage: "linear-gradient(90deg, #0E2A3D 0%, #1B4258 100%)",
              },
            }}
          />
        )}
        {footer && (
          <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary", lineHeight: 1.4 }}>
            {footer}
          </Typography>
        )}
        {link && (
          <Box
            component={Link}
            href={link.href}
            sx={{
              mt: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { color: "primary.dark" },
            }}
          >
            {link.label} <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Box>
        )}
      </Box>
    </Grid>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <Stack direction="row" sx={{ alignItems: "flex-end", justifyContent: "space-between", gap: 2 }}>
      <Box>
        <Typography variant="overline" sx={{ display: "block", color: "text.secondary" }}>
          {eyebrow}
        </Typography>
        <Typography variant="h4">{title}</Typography>
      </Box>
      {action && (
        <Box
          component={Link}
          href={action.href}
          sx={{
            color: "primary.main",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": { color: "primary.dark" },
          }}
        >
          {action.label} <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Box>
      )}
    </Stack>
  );
}

function ContinueCard({ course }: { course: (typeof courses)[number] }) {
  const watched = Math.round(course.watchProgress * 100);
  const ceUnlock = Math.round(course.ceUnlockAt * 100);
  const minsLeft = Math.round(course.durationMin * (1 - course.watchProgress));

  return (
    <Box
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "common.white",
      }}
    >
      <Grid container>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              position: "relative",
              minHeight: 240,
              height: "100%",
              backgroundImage: course.thumbAccent,
              display: "grid",
              placeItems: "center",
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
            <Box
              sx={{
                position: "relative",
                width: 84,
                height: 84,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.95)",
                color: "primary.dark",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 24px 40px -16px rgba(0,0,0,0.4)",
              }}
            >
              <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 56 }} />
            </Box>
            <Chip
              label={course.category}
              size="small"
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                bgcolor: "rgba(255,255,255,0.95)",
                color: "primary.dark",
                fontSize: "0.68rem",
                height: 24,
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
              IN PROGRESS · {minsLeft} MIN LEFT
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5, mb: 1 }}>
              {course.title}
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 2.25, fontSize: "0.95rem" }}>
              {course.summary}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2.25, flexWrap: "wrap", gap: 1 }}>
              <Chip
                icon={<SchoolOutlinedIcon sx={{ fontSize: 14 }} />}
                label={`${course.ceCredits} CE credits`}
                size="small"
                sx={{ bgcolor: "rgba(217,168,75,0.14)", color: "#A07823", fontWeight: 700, fontSize: "0.72rem" }}
              />
              <Chip
                icon={<VerifiedOutlinedIcon sx={{ fontSize: 14 }} />}
                label={`Quiz unlocks at ${ceUnlock}% watched`}
                size="small"
                sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 600, fontSize: "0.72rem" }}
              />
              <Chip
                label={`${course.instructor}`}
                size="small"
                sx={{ bgcolor: "grey.100", color: "text.primary", fontWeight: 600, fontSize: "0.72rem" }}
              />
            </Stack>

            <Box sx={{ mb: 2.25 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  {watched}% watched
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                  CE unlock at {ceUnlock}%
                </Typography>
              </Stack>
              <Box sx={{ position: "relative" }}>
                <LinearProgress
                  variant="determinate"
                  value={watched}
                  sx={{
                    height: 8,
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
                    height: 14,
                    bgcolor: "secondary.main",
                    borderRadius: 1,
                    boxShadow: "0 0 0 3px rgba(217,168,75,0.18)",
                  }}
                />
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                href={`/dashboard/courses/${course.slug}`}
                endIcon={<ArrowForwardIcon />}
              >
                Resume video
              </Button>
              <Button
                variant="outlined"
                color="primary"
                component={Link}
                href="/dashboard/courses"
              >
                Browse all
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function DiscountsCard() {
  const top = vendorOffers.slice(0, 4);
  const totalSaved = vendorOffers.reduce((sum, o) => sum + o.savedYtd, 0);

  return (
    <Box
      sx={{
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "common.white",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
              YOUR DISCOUNTS
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25 }}>
              Active vendor offers
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                color: "text.primary",
                lineHeight: 1,
              }}
            >
              ${totalSaved.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
              Saved YTD
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
        {top.map((offer) => (
          <Box key={offer.id} sx={{ p: 2.25, display: "flex", gap: 1.5, alignItems: "center" }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundImage: offer.accent,
                color: "common.white",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "0.95rem",
                fontFamily: "var(--font-display)",
                flexShrink: 0,
              }}
            >
              {offer.vendor
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.2 }}>
                {offer.vendor}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                {offer.headline}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: offer.savedYtd > 0 ? "success.dark" : "text.secondary",
                }}
              >
                {offer.savedYtd > 0 ? `$${offer.savedYtd.toLocaleString()}` : ""}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
                this year
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          component={Link}
          href="/dashboard/rewards"
          endIcon={<ArrowForwardIcon />}
        >
          See all {vendorOffers.length} offers + redeem
        </Button>
      </Box>
    </Box>
  );
}

function CePointsRedemptionCard() {
  const featured = rewardCatalog.slice(0, 3);
  return (
    <Box
      sx={{
        borderRadius: "20px",
        p: 0,
        overflow: "hidden",
        border: "1px solid rgba(217,168,75,0.4)",
        backgroundImage:
          "linear-gradient(165deg, #FBF6E8 0%, #F4E8C9 100%)",
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "#A07823", display: "block" }}>
              CE POINTS · REDEEM
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25 }}>
              Spend your {member.cePointsBalance} pts
            </Typography>
          </Box>
          <RedeemOutlinedIcon sx={{ color: "#A07823", fontSize: 26 }} />
        </Stack>
        <Stack spacing={1.25}>
          {featured.map((r) => {
            const affordable = member.cePointsBalance >= r.pointsCost;
            return (
              <Box
                key={r.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(217,168,75,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }}>
                    {r.title}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                    {r.category}
                  </Typography>
                </Box>
                <Chip
                  label={`${r.pointsCost} pts`}
                  size="small"
                  sx={{
                    bgcolor: affordable ? "#0E2A3D" : "rgba(14,42,61,0.1)",
                    color: affordable ? "common.white" : "text.secondary",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </Box>
      <Box sx={{ p: 2, borderTop: "1px solid rgba(217,168,75,0.3)" }}>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          component={Link}
          href="/dashboard/rewards"
          endIcon={<ArrowForwardIcon />}
        >
          Open rewards store
        </Button>
      </Box>
    </Box>
  );
}

function ActivityCard() {
  const iconFor = (kind: string) => {
    switch (kind) {
      case "ce":
        return SchoolOutlinedIcon;
      case "savings":
        return TrendingUpOutlinedIcon;
      case "course":
        return PlayCircleOutlineOutlinedIcon;
      case "hotline":
        return PhoneInTalkOutlinedIcon;
      case "reward":
        return RedeemOutlinedIcon;
      default:
        return SchoolOutlinedIcon;
    }
  };

  return (
    <Box
      sx={{
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "common.white",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          ACTIVITY
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.25 }}>
          Recent on your account
        </Typography>
      </Box>
      <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
        {recentActivity.map((a) => {
          const Icon = iconFor(a.kind);
          return (
            <Box key={a.id} sx={{ p: 2, display: "flex", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: "rgba(14,42,61,0.06)",
                  border: "1px solid rgba(14,42,61,0.12)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  color: "primary.main",
                }}
              >
                <Icon sx={{ fontSize: 16 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.3 }}>
                  {a.title}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.76rem", color: "text.secondary" }}>
                  {a.detail}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontSize: "0.72rem", color: "text.secondary", flexShrink: 0 }}>
                {a.when}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
