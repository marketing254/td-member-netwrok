"use client";
import { useState } from "react";
import Image from "next/image";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const MotionBox = motion.create(Box);

const KIT_ITEMS = [
  { Icon: FileText, label: "Fee-negotiation script" },
  { Icon: CheckSquare, label: "Pre-call checklist" },
  { Icon: BarChart, label: "PPO comparison worksheet" },
];

export default function FreeKitMagnet() {
  const reduced = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lead-magnets/ppo-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName: fullName || null }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Couldn't send the kit right now. Try again in a moment.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't send the kit right now. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
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
              pointerEvents: "none",
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
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.05rem" }}>
                      The kit is on its way.
                    </Typography>
                  </Stack>
                  <Typography sx={{ color: "#F8F5EE", fontSize: "0.92rem", lineHeight: 1.55 }}>
                    Check your inbox for an email from{" "}
                    <Box component="strong" sx={{ fontWeight: 700 }}>hello@joindmn.com</Box>{" "}
                    with the PDF attached. If it doesn&rsquo;t arrive in 5 minutes, check spam.
                  </Typography>
                </Stack>
              ) : (
                <Box
                  component="form"
                  onSubmit={onSubmit}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                      type="text"
                      placeholder="Your name (optional)"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={submitting}
                      sx={{
                        flex: 1,
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
                    <TextField
                      type="email"
                      required
                      placeholder="Your best email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      sx={{
                        flex: 1.4,
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
                  </Stack>
                  <Button
                    type="submit"
                    disabled={submitting}
                    endIcon={
                      submitting ? (
                        <CircularProgress size={14} sx={{ color: "#7A5F2A" }} />
                      ) : (
                        <ArrowRight size={16} />
                      )
                    }
                    sx={{
                      bgcolor: "#FFFFFF !important",
                      backgroundImage: "none !important",
                      color: "#7A5F2A !important",
                      fontWeight: 700,
                      fontSize: "0.94rem",
                      textTransform: "none",
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 1.35,
                      alignSelf: { xs: "stretch", sm: "flex-start" },
                      "&:hover": { bgcolor: "#F8F5EE !important", color: "#7A5F2A !important" },
                      "&.Mui-disabled": {
                        bgcolor: "rgba(255,255,255,0.5) !important",
                        color: "rgba(122,95,42,0.7) !important",
                      },
                    }}
                  >
                    {submitting ? "Sending…" : "Send me the free kit"}
                  </Button>
                  {error && (
                    <Alert
                      severity="error"
                      onClose={() => setError(null)}
                      sx={{ mt: 0.5, fontSize: "0.84rem" }}
                    >
                      {error}
                    </Alert>
                  )}
                  <Typography sx={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.75)", mt: 0.5 }}>
                    No spam, no membership pitch — just the PDF. We&rsquo;ll send one follow-up if you don&rsquo;t open it.
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Right column — cover artwork tempts the click + inside-the-kit list */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={1.75}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "8.5 / 11",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow:
                      "0 20px 50px -16px rgba(0,0,0,0.45), 0 6px 18px -6px rgba(0,0,0,0.25)",
                    transform: { md: "rotate(-2.5deg)" },
                    transition: "transform 320ms cubic-bezier(0.16, 1, 0.3, 1)",
                    "&:hover": { transform: { md: "rotate(0deg) scale(1.02)" } },
                    bgcolor: "#0A1A2F",
                  }}
                >
                  <Image
                    src="/free-kit/ppo-fees-cover.png"
                    alt="Negotiating Better PPO Fees — Free Kit cover"
                    fill
                    sizes="(max-width: 900px) 100vw, 420px"
                    priority={false}
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </Box>
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
                          borderBottom:
                            i < KIT_ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.18)" : "none",
                        }}
                      >
                        <Icon size={16} color="#FFFFFF" strokeWidth={2} />
                        <Typography sx={{ color: "#FFFFFF", fontSize: "0.88rem" }}>{label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </MotionBox>
      </Container>
    </Box>
  );
}
