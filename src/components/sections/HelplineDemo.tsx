"use client";
import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion.create(Box);

const STEPS = [
  {
    n: 1,
    title: "You describe the problem",
    body: "In plain English, any time. Clinical, financial, team, marketing — anything.",
  },
  {
    n: 2,
    title: "A real expert reviews it",
    body: "Not a bot. A member of the Thriving Dentist team reads it within 3 business days.",
  },
  {
    n: 3,
    title: "You get matched",
    body: "The right specialist, the right vendor, and the exact playbook — delivered in writing.",
  },
];

export default function HelplineDemo() {
  const reduced = useReducedMotion();

  return (
    <Box
      id="helpline"
      component="section"
      sx={{
        py: { xs: 7, md: 9 },
        bgcolor: "#FFFFFF",
        borderTop: "1px solid #E4E4E7",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.25} sx={{ textAlign: "center", maxWidth: 680, mx: "auto", mb: { xs: 4, md: 5 } }}>
          <Typography
            sx={{
              color: "#7A5F2A",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            The feature no one else has
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: "#1A1A1A",
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.65rem", md: "2.1rem" },
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Stuck? Put a human on it.
          </Typography>
          <Typography sx={{ color: "#52525B", fontSize: { xs: "0.98rem", md: "1.05rem" }, lineHeight: 1.55 }}>
            Every other &ldquo;network&rdquo; hands you a search bar and a forum. We hand you a person who reads your problem and routes you to the answer.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 3, md: 5 }} sx={{ alignItems: "center" }}>
          {/* Steps */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              {STEPS.map((s, i) => (
                <MotionBox
                  key={s.n}
                  initial={reduced ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}
                >
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: "#FBF8F1",
                      color: "#7A5F2A",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                    }}
                  >
                    {s.n}
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#1A1A1A", fontWeight: 700, fontSize: "1.05rem", mb: 0.5 }}>
                      {s.title}
                    </Typography>
                    <Typography sx={{ color: "#52525B", fontSize: "0.92rem", lineHeight: 1.55 }}>
                      {s.body}
                    </Typography>
                  </Box>
                </MotionBox>
              ))}
            </Stack>
          </Grid>

          {/* Chat mock */}
          <Grid size={{ xs: 12, md: 6 }}>
            <MotionBox
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              sx={{
                bgcolor: "#F8F5EE",
                border: "1px solid #E4E4E7",
                borderRadius: 2,
                p: 2.25,
              }}
            >
              {/* User bubble */}
              <Box
                sx={{
                  ml: "auto",
                  maxWidth: "88%",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E4E4E7",
                  borderRadius: "13px 13px 3px 13px",
                  px: 1.75,
                  py: 1.4,
                  mb: 1.25,
                }}
              >
                <Typography
                  sx={{
                    color: "#52525B",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    mb: 0.4,
                  }}
                >
                  You
                </Typography>
                <Typography sx={{ color: "#1A1A1A", fontSize: "0.93rem", lineHeight: 1.5 }}>
                  My hygiene production has been flat for 6 months and I can&apos;t figure out why.
                </Typography>
              </Box>

              {/* DMN bubble */}
              <Box
                sx={{
                  maxWidth: "88%",
                  bgcolor: "#1A1A1A",
                  color: "#eaf6f4",
                  borderRadius: "13px 13px 13px 3px",
                  px: 1.75,
                  py: 1.4,
                }}
              >
                <Typography
                  sx={{
                    color: "#C9A876",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    mb: 0.4,
                  }}
                >
                  DMN Helpline
                </Typography>
                <Typography sx={{ color: "#eaf6f4", fontSize: "0.93rem", lineHeight: 1.5 }}>
                  Got it. This is usually a re-care + scheduling gap. We&apos;re connecting you with a hygiene-systems coach, plus two members who fixed the same thing this year. Here&apos;s your kit:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 1 }}>
                  {["Hygiene re-care SOP", "KPI worksheet", "2 vetted experts"].map((tag) => (
                    <Box
                      key={tag}
                      sx={{
                        px: 1.1,
                        py: 0.4,
                        borderRadius: 1,
                        bgcolor: "rgba(20,168,154,0.18)",
                        color: "#F8F5EE",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
