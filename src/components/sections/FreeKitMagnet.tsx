"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  Check,
  FileText,
  CheckSquare,
  BarChart,
  Monitor,
  Video,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion.create(Box);

const KIT_ITEMS = [
  { Icon: Video, label: "12-min training video" },
  { Icon: FileText, label: "Fee-negotiation script" },
  { Icon: CheckSquare, label: "Pre-call checklist" },
  { Icon: BarChart, label: "PPO comparison worksheet" },
  { Icon: Monitor, label: "Slide deck" },
];

export default function FreeKitMagnet() {
  const reduced = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "member",
        email,
        fullName: "Free Kit Lead",
        source: "free-kit-magnet",
      }),
    }).catch(() => {});
    setSubmitted(true);
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: "#FFFFFF",
      }}
    >
      <Container maxWidth="lg">
        <MotionBox
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            background: "linear-gradient(135deg, #9B7B3A 0%, #7A5F2A 100%)",
            color: "#FFFFFF",
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle decorative glow */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
            }}
          />

          <Grid container spacing={{ xs: 3, md: 5 }} sx={{ alignItems: "center", position: "relative" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.85,
                  px: 1.4,
                  py: 0.55,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.18)",
                  color: "#FFFFFF",
                  fontSize: "0.74rem",
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                100% free · no membership needed
              </Box>
              <Typography
                variant="h2"
                sx={{
                  color: "#FFFFFF",
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "1.55rem", md: "1.95rem" },
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  mb: 1.5,
                }}
              >
                Not ready to join? Take a kit for a test drive.
              </Typography>
              <Typography sx={{ color: "#F8F5EE", fontSize: { xs: "0.95rem", md: "1rem" }, mb: 2.5 }}>
                Get our{" "}
                <Box component="strong" sx={{ fontWeight: 700 }}>
                  &ldquo;Negotiating Better PPO Fees&rdquo;
                </Box>{" "}
                kit free — the exact worksheet, script and checklist our members use. See the quality before you commit a cent.
              </Typography>

              {submitted ? (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
                  <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>
                    Check your inbox — and you&rsquo;re now first in line for founding access.
                  </Typography>
                </Stack>
              ) : (
                <Box
                  component="form"
                  onSubmit={onSubmit}
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    type="email"
                    required
                    placeholder="Your best email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{
                      flex: 1,
                      minWidth: 220,
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#FFFFFF",
                        borderRadius: 1.5,
                        height: 46,
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiOutlinedInput-input": {
                        color: "#1A1A1A",
                        fontSize: "0.92rem",
                        py: 1.2,
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    endIcon={<ArrowRight size={16} />}
                    sx={{
                      bgcolor: "#FFFFFF",
                      color: "#7A5F2A",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      textTransform: "none",
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 1.3,
                      "&:hover": { bgcolor: "#F8F5EE" },
                    }}
                  >
                    Send me the free kit
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.13)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 2,
                  p: 2.25,
                }}
              >
                <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.92rem", mb: 1.25 }}>
                  Inside this kit:
                </Typography>
                <Stack>
                  {KIT_ITEMS.map(({ Icon, label }, i) => (
                    <Stack
                      key={label}
                      direction="row"
                      spacing={1.25}
                      sx={{
                        alignItems: "center",
                        py: 1,
                        borderBottom: i < KIT_ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.18)" : "none",
                      }}
                    >
                      <Icon size={16} color="#FFFFFF" strokeWidth={2} />
                      <Typography sx={{ color: "#FFFFFF", fontSize: "0.88rem" }}>
                        {label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
}
