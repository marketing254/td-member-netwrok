"use client";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import {
  certificates,
  courses,
  member,
  getCourseBySlug,
} from "@/lib/memberData";

export default function CertificatesPage() {
  const totalCe = certificates.reduce((s, c) => s + c.ceCredits, 0);
  const inProgress = courses.filter((c) => c.status === "in-progress").length;
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          CERTIFICATIONS
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1 }}>
          Your certification wall
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 720 }}>
          Every certificate is signed by the instructor and includes a unique verification number
          state boards can look up.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <SmallStat label="Certificates earned" value={`${certificates.length}`} />
        <SmallStat label="CE credits earned" value={`${totalCe}`} accent="secondary" />
        <SmallStat label="In progress" value={`${inProgress}`} />
        <SmallStat label="2026 goal" value={`${member.ceCreditsGoalYtd}`} accent="secondary" />
      </Grid>

      <Grid container spacing={3}>
        {certificates.map((cert) => {
          const course = getCourseBySlug(cert.courseSlug);
          return (
            <Grid key={cert.id} size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "common.white",
                  transition: "transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms ease, border-color 240ms ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "rgba(14,42,61,0.3)",
                    boxShadow: "0 32px 48px -28px rgba(14,42,61,0.4)",
                  },
                }}
              >
                {/* Visual cert plate */}
                <Box
                  sx={{
                    position: "relative",
                    p: { xs: 3, md: 4 },
                    color: "common.white",
                    backgroundImage:
                      "linear-gradient(135deg, #06182A 0%, #0E2A3D 50%, #1B4258 100%)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage:
                        "radial-gradient(35% 35% at 100% 0%, rgba(217,168,75,0.4) 0%, transparent 60%), radial-gradient(35% 35% at 0% 100%, rgba(217,168,75,0.2) 0%, transparent 60%)",
                    }}
                  />
                  <Box
                    aria-hidden
                    sx={{
                      position: "absolute",
                      inset: 16,
                      border: "1px solid rgba(217,168,75,0.35)",
                      borderRadius: "12px",
                      pointerEvents: "none",
                    }}
                  />
                  <Stack spacing={2} sx={{ position: "relative", textAlign: "center", py: 2 }}>
                    <EmojiEventsOutlinedIcon sx={{ color: "secondary.light", fontSize: 36, alignSelf: "center" }} />
                    <Typography
                      variant="overline"
                      sx={{ color: "secondary.light", letterSpacing: "0.22em", display: "block" }}
                    >
                      CERTIFICATE OF COMPLETION
                    </Typography>
                    <Box>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem" }}>
                        Awarded to
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-display)",
                          color: "common.white",
                          fontSize: "1.6rem",
                          mt: 0.5,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Dr. {member.firstName} {member.lastName}, {member.credential}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem" }}>
                        For successful completion of
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-display)",
                          color: "common.white",
                          fontSize: "1.15rem",
                          mt: 0.5,
                          fontWeight: 500,
                          maxWidth: 360,
                          mx: "auto",
                          lineHeight: 1.3,
                        }}
                      >
                        {cert.title}
                      </Typography>
                    </Box>
                    <Stack
                      direction="row"
                      spacing={4}
                      sx={{ justifyContent: "center", color: "rgba(255,255,255,0.85)", mt: 1.5 }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.14em", fontWeight: 700 }}>
                          DATE
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          {cert.earnedOn}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.14em", fontWeight: 700 }}>
                          CE CREDITS
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "secondary.light" }}>
                          {cert.ceCredits.toFixed(1)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.14em", fontWeight: 700 }}>
                          SCORE
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          {cert.score}%
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        fontSize: "0.72rem",
                        color: "rgba(255,255,255,0.72)",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        letterSpacing: "0.1em",
                        fontWeight: 600,
                      }}
                    >
                      VERIFY · {cert.certNumber}
                    </Typography>
                  </Stack>
                </Box>

                {/* Actions */}
                <Box sx={{ p: 2.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
                    <Chip
                      label={course?.category ?? "Course"}
                      size="small"
                      sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.72rem", height: 24 }}
                    />
                    <Chip
                      label={`Issued ${cert.earnedOn}`}
                      size="small"
                      sx={{ bgcolor: "grey.100", color: "text.secondary", fontWeight: 600, fontSize: "0.72rem", height: 24 }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1.25}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadOutlinedIcon />}
                      sx={{ flex: 1 }}
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<ShareOutlinedIcon />}
                    >
                      Share
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          );
        })}

        {/* Empty slot CTA */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              height: "100%",
              minHeight: 360,
              borderRadius: "20px",
              border: "1.5px dashed",
              borderColor: "rgba(14,42,61,0.2)",
              bgcolor: "rgba(255,255,255,0.55)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              p: 4,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                bgcolor: "rgba(217,168,75,0.14)",
                border: "1px solid rgba(217,168,75,0.4)",
                display: "grid",
                placeItems: "center",
                color: "#A07823",
                mb: 0.5,
              }}
            >
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h4" sx={{ fontSize: "1.35rem" }}>
              Earn your next certificate
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 360 }}>
              {inProgress > 0
                ? `${inProgress} course${inProgress > 1 ? "s" : ""} in progress, finish a video and pass the quiz to add a new badge.`
                : "Pick a course, watch to the CE checkpoint, pass the quiz with 70% or more."}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              endIcon={<ArrowForwardIcon />}
              component={Link}
              href="/dashboard/courses"
              sx={{ mt: 1 }}
            >
              Browse courses
            </Button>
          </Box>
        </Grid>
      </Grid>
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
