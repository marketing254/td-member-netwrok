"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  challengeOptions,
  locationOptions,
  memberRoles,
  waitlist as waitlistCopy,
  waitlistByRole,
} from "@/lib/content";

const MotionBox = motion.create(Box);
const OTHER = "Other";

const member = waitlistByRole.member;

/**
 * Animated reveal-input that appears when a parent dropdown's value === "Other".
 */
function OtherReveal({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="other-reveal"
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 14 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: "hidden", width: "100%" }}
        >
          <Box sx={{ pt: "10px", pb: "2px" }}>{children}</Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function WaitlistSection() {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [memberRoleValue, setMemberRoleValue] = useState("");
  const [memberChallengeValue, setMemberChallengeValue] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    const payload = {
      role: "member" as const,
      fullName,
      email: fd.get("email"),
      practiceName: fd.get("practiceName"),
      phone: fd.get("phone"),
      source: "landing-waitlist",
      utm: {
        role_label: fd.get("roleLabel"),
        role_label_other: fd.get("roleLabelOther") ?? "",
        locations: fd.get("locations"),
        biggest_challenge: fd.get("challenge"),
        biggest_challenge_other: fd.get("challengeOther") ?? "",
        phone: fd.get("phone"),
      },
    };

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/waitlist/thanks?role=member${data.duplicate ? "&again=1" : ""}`);
    } catch {
      setError("Network error. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <Box
      id="waitlist"
      component="section"
      sx={{
        position: "relative",
        py: { xs: 8, md: 12 },
        bgcolor: "#FFFFFF",
        borderTop: "1px solid",
        borderColor: "rgba(14,42,61,0.06)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(45% 50% at 0% 50%, rgba(217,168,75,0.07) 0%, transparent 60%), radial-gradient(40% 40% at 100% 100%, rgba(14,42,61,0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Grid container spacing={{ xs: 5, md: 7 }} sx={{ alignItems: "flex-start" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <MotionBox
              initial={reduced ? false : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              sx={{ position: { md: "sticky" }, top: { md: 96 } }}
            >
              <Stack spacing={2.5}>
                <Typography variant="overline" sx={{ color: "#A07823", letterSpacing: "0.16em" }}>
                  {member.eyebrow}
                </Typography>
                <Typography
                  variant="h2"
                  component="h2"
                  sx={{ color: "#0A1A2F", fontSize: { xs: "1.9rem", md: "2.5rem" }, lineHeight: 1.1, mb: 1.5 }}
                >
                  {member.headline}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: "#3B4A55", maxWidth: 480 }}>
                  {member.subtitle}
                </Typography>

                <Stack spacing={1.5} sx={{ pt: 1.5 }}>
                  {member.benefits.map((b) => (
                    <Stack key={b} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                      <CheckCircleOutlineIcon sx={{ color: "#A07823", fontSize: 19, mt: "1px", flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: "#0A1A2F", fontSize: "0.95rem", lineHeight: 1.6 }}>
                        {b}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Box
                  sx={{
                    mt: 1.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(14,42,61,0.04)",
                    border: "1px solid rgba(14,42,61,0.08)",
                  }}
                >
                  <Typography sx={{ fontSize: "0.82rem", color: "#3B4A55", lineHeight: 1.55 }}>
                    A vendor partner?{" "}
                    <Box
                      component={Link}
                      href="/vendor/signup"
                      sx={{
                        color: "#A07823",
                        fontWeight: 700,
                        textDecoration: "underline",
                        textDecorationColor: "rgba(160,120,35,0.5)",
                        textUnderlineOffset: 3,
                        "&:hover": { textDecorationColor: "#A07823" },
                      }}
                    >
                      Apply directly here
                    </Box>{" "}
                    — vendors don&apos;t use the waitlist; our team reviews each application personally.
                  </Typography>
                </Box>
              </Stack>
            </MotionBox>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <MotionBox
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Box
                component="form"
                onSubmit={onSubmit}
                sx={{
                  position: "relative",
                  px: { xs: 3, sm: 3.5, md: 4 },
                  py: { xs: 3, sm: 3.25, md: 3.75 },
                  borderRadius: 4,
                  bgcolor: "#FFFFFF",
                  border: "1px solid rgba(14,42,61,0.08)",
                  boxShadow:
                    "0 1px 0 0 rgba(255,255,255,0.7) inset, 0 40px 80px -30px rgba(14,42,61,0.18), 0 0 0 1px rgba(217,168,75,0.08)",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  "& > *, & .MuiStack-root, & .MuiGrid-root, & > div > div": {
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  },
                  "& .MuiTextField-root, & .MuiOutlinedInput-root": {
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                  },
                  "& textarea, & input": {
                    width: "100%",
                    boxSizing: "border-box",
                    maxWidth: "100%",
                  },
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "8%",
                    right: "8%",
                    height: 2,
                    background:
                      "linear-gradient(90deg, transparent, rgba(217,168,75,0.85), rgba(240,193,110,0.95), rgba(217,168,75,0.85), transparent)",
                  }}
                />

                <Stack spacing={2.25}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LightField name="firstName" label="First name" placeholder="Dr. Taylor" autoComplete="given-name" required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LightField name="lastName" label="Last name" placeholder="Morgan" autoComplete="family-name" required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LightField name="email" type="email" label="Email address" placeholder="taylor@practice.com" autoComplete="email" required />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LightField
                        name="phone"
                        type="tel"
                        label="Mobile number"
                        placeholder="+1 (555) 010-1234"
                        autoComplete="tel"
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <LightField
                        name="roleLabel"
                        label="What best describes your role?"
                        select
                        value={memberRoleValue}
                        onChange={(e) => setMemberRoleValue(e.target.value)}
                      >
                        <MenuItem value="" disabled>
                          Choose one
                        </MenuItem>
                        {memberRoles.map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}
                          </MenuItem>
                        ))}
                      </LightField>
                      <OtherReveal show={memberRoleValue === OTHER}>
                        <LightField
                          name="roleLabelOther"
                          label="Explain your role"
                          placeholder="e.g. Practice administrator, CFO, regional director"
                          required
                        />
                      </OtherReveal>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <LightField name="practiceName" label="Practice name" placeholder="Morgan Dental Group" autoComplete="organization" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LightField name="locations" label="Number of locations" select defaultValue="">
                        <MenuItem value="" disabled>
                          Choose
                        </MenuItem>
                        {locationOptions.map((o) => (
                          <MenuItem key={o} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </LightField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <LightField
                        name="challenge"
                        label="Biggest challenge right now?"
                        select
                        value={memberChallengeValue}
                        onChange={(e) => setMemberChallengeValue(e.target.value)}
                      >
                        <MenuItem value="" disabled>
                          Choose
                        </MenuItem>
                        {challengeOptions.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </LightField>
                    </Grid>
                    {memberChallengeValue === OTHER && (
                      <Grid size={{ xs: 12 }}>
                        <OtherReveal show>
                          <LightField
                            name="challengeOther"
                            label="Describe your biggest challenge"
                            placeholder="What's slowing your practice down right now?"
                            multiline
                            minRows={2}
                            required
                          />
                        </OtherReveal>
                      </Grid>
                    )}
                  </Grid>

                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start", color: "#5C6770", mt: 0.5 }}>
                    <LockOutlinedIcon sx={{ fontSize: 14, mt: "3px", flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: "#5C6770", fontSize: "0.78rem", lineHeight: 1.55 }}>
                      By joining the waitlist you agree to the{" "}
                      <Box
                        component={Link}
                        href="/agreement/member"
                        target="_blank"
                        rel="noopener"
                        sx={{
                          color: "#A07823",
                          fontWeight: 700,
                          textDecoration: "underline",
                          textDecorationColor: "rgba(160,120,35,0.45)",
                          textUnderlineOffset: 3,
                          "&:hover": { textDecorationColor: "#A07823" },
                        }}
                      >
                        Member Agreement
                        <OpenInNewIcon sx={{ fontSize: 11, ml: 0.3, verticalAlign: "middle" }} />
                      </Box>
                      ,{" "}
                      <Box
                        component={Link}
                        href="/legal/refund"
                        target="_blank"
                        rel="noopener"
                        sx={{
                          color: "#A07823",
                          fontWeight: 700,
                          textDecoration: "underline",
                          textDecorationColor: "rgba(160,120,35,0.45)",
                          textUnderlineOffset: 3,
                          "&:hover": { textDecorationColor: "#A07823" },
                        }}
                      >
                        Refund Policy
                        <OpenInNewIcon sx={{ fontSize: 11, ml: 0.3, verticalAlign: "middle" }} />
                      </Box>
                      , and{" "}
                      <Box
                        component={Link}
                        href="/legal/privacy"
                        target="_blank"
                        rel="noopener"
                        sx={{
                          color: "#A07823",
                          fontWeight: 700,
                          textDecoration: "underline",
                          textDecorationColor: "rgba(160,120,35,0.45)",
                          textUnderlineOffset: 3,
                          "&:hover": { textDecorationColor: "#A07823" },
                        }}
                      >
                        Privacy Policy
                        <OpenInNewIcon sx={{ fontSize: 11, ml: 0.3, verticalAlign: "middle" }} />
                      </Box>
                      . {waitlistCopy.footerNote}
                    </Typography>
                  </Stack>

                  {error && (
                    <Typography
                      role="alert"
                      sx={{
                        color: "#8C1D1D",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        bgcolor: "rgba(220,60,60,0.08)",
                        border: "1px solid rgba(220,60,60,0.25)",
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      {error}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={submitting}
                    fullWidth
                    endIcon={
                      submitting ? (
                        <CircularProgress size={18} thickness={5} sx={{ color: "primary.dark" }} />
                      ) : (
                        <ArrowForwardIcon />
                      )
                    }
                    sx={{
                      py: 1.65,
                      fontSize: "0.98rem",
                      boxShadow: "0 18px 38px -14px rgba(217,168,75,0.55), 0 0 0 1px rgba(217,168,75,0.3) inset",
                      "&.Mui-disabled": {
                        opacity: 0.55,
                        color: "rgba(0,0,0,0.55) !important",
                      },
                    }}
                  >
                    {submitting ? waitlistCopy.submittingLabel : waitlistCopy.submitLabel}
                  </Button>

                  <Typography variant="body2" sx={{ color: "#5C6770", fontSize: "0.74rem", textAlign: "center" }}>
                    No payment now. Founding members are billed only when the doors open on launch day.
                  </Typography>
                </Stack>
              </Box>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

type FieldProps = React.ComponentProps<typeof TextField> & { label: string };

function LightField({ label, name, ...props }: FieldProps) {
  return (
    <TextField
      {...props}
      name={name}
      label={label}
      variant="outlined"
      fullWidth
      slotProps={{
        inputLabel: {
          shrink: true,
          sx: {
            color: "#3B4A55",
            fontWeight: 600,
            fontSize: "0.85rem",
            "&.MuiInputLabel-shrink": {
              transform: "translate(14px, -9px) scale(0.78)",
            },
            "&.Mui-focused": { color: "#A07823" },
          },
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "#FFFFFF",
          color: "#0A1320",
          minHeight: 50,
          transition: "all 280ms cubic-bezier(0.16, 1, 0.3, 1)",
          "& fieldset": { borderColor: "rgba(14,42,61,0.18)", borderWidth: 1 },
          "&:hover fieldset": { borderColor: "rgba(14,42,61,0.45)" },
          "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(217,168,75,0.18)" },
          "&.Mui-focused fieldset": { borderColor: "#A07823", borderWidth: 1.5 },
        },
        "& .MuiOutlinedInput-input": {
          color: "#0A1320",
          fontSize: "0.92rem",
          fontWeight: 500,
          py: 1.4,
          "&::placeholder": {
            color: "#9C9485",
            opacity: 1,
            fontSize: "0.82rem",
            fontWeight: 400,
          },
        },
        "& .MuiSelect-select": { py: "13px !important" },
      }}
    />
  );
}
