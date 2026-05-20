"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  challengeOptions,
  locationOptions,
  memberRoles,
  waitlist as waitlistCopy,
  waitlistByRole,
} from "@/lib/content";
import { vendorCategories } from "@/lib/vendorData";

const MotionBox = motion.create(Box);
const OTHER = "Other";

/**
 * Landing page sign-up form.
 *
 * Members → POST /api/waitlist (the founding-cohort waitlist).
 * Vendors → POST /api/vendor/signup (dedicated vendor application path that
 * triggers team review + a magic-link email). Vendors do NOT go through the
 * waitlist API, but the apply-as-vendor surface lives here on the landing
 * page so prospects can choose either path in one place.
 */

type Role = "member" | "vendor";

// Role-specific copy for the LEFT pitch panel. Members come from content.ts;
// vendors have a dedicated copy block tailored to the apply flow.
const VENDOR_PITCH = {
  eyebrow: "FOUNDING VENDOR PARTNER",
  headline: "Six months free. Featured to dentists actively buying.",
  subtitle:
    "The founding vendor cohort gets featured placement in the directory, warm introductions to members, and access to the partner hotline from day one.",
  benefits: [
    "$0 for the first 6 months, $49/mo for months 7-12, $199/mo standard",
    "Featured listing + warm-intro routing through the partner hotline",
    "Co-branded content opportunities (podcast, AMAs, written guides)",
    "Members already pre-qualified, practice owners actively spending",
  ],
};

function pitchFor(role: Role) {
  if (role === "vendor") return VENDOR_PITCH;
  return waitlistByRole.member;
}

function OtherReveal({ show, children }: { show: boolean; children: React.ReactNode }) {
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

  const [role, setRole] = useState<Role>("member");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const [memberRoleValue, setMemberRoleValue] = useState("");
  const [memberChallengeValue, setMemberChallengeValue] = useState("");
  const [vendorCategoryValue, setVendorCategoryValue] = useState("");

  const isVendor = role === "vendor";
  const pitch = pitchFor(role);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (isVendor && (!agreed || !authorized)) {
      setError("Please confirm both boxes before applying as a vendor partner.");
      return;
    }

    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    try {
      if (isVendor) {
        // Vendors go to the dedicated application endpoint, not the waitlist.
        const payload = {
          companyName: fd.get("companyName"),
          category:
            vendorCategoryValue === OTHER ? fd.get("categoryOther") : fd.get("category"),
          website: fd.get("website"),
          contactName: fullName,
          contactEmail: fd.get("email"),
          contactPhone: fd.get("contactPhone"),
          hotlineEmail: fd.get("secondaryEmail") || fd.get("email"),
          calendarLink: "",
          signatureName: fd.get("signatureName"),
          signatureTitle: fd.get("signatureTitle"),
          agreedToTerms: agreed,
          confirmedAuthority: authorized,
          planId: "founding",
          source: "landing-vendor-cta",
          description: fd.get("description") ?? "",
        };

        const res = await fetch("/api/vendor/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error ?? "Could not submit your application. Please try again.");
          setSubmitting(false);
          return;
        }
        router.push(`/waitlist/thanks?role=vendor`);
        return;
      }

      // Member waitlist branch
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

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
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
                  {pitch.eyebrow}
                </Typography>
                <AnimatePresence mode="wait">
                  <MotionBox
                    key={`headline-${role}`}
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Typography
                      variant="h2"
                      component="h2"
                      sx={{ color: "#0A1A2F", fontSize: { xs: "1.9rem", md: "2.5rem" }, lineHeight: 1.1, mb: 1.5 }}
                    >
                      {pitch.headline}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: "#3B4A55", maxWidth: 480 }}>
                      {pitch.subtitle}
                    </Typography>
                  </MotionBox>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <MotionBox
                    key={`bullets-${role}`}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Stack spacing={1.5} sx={{ pt: 1.5 }}>
                      {pitch.benefits.map((b) => (
                        <Stack key={b} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                          <CheckCircleOutlineIcon sx={{ color: "#A07823", fontSize: 19, mt: "1px", flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: "#0A1A2F", fontSize: "0.95rem", lineHeight: 1.6 }}>
                            {b}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </MotionBox>
                </AnimatePresence>
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
                  <ToggleButtonGroup
                    exclusive
                    value={role}
                    onChange={(_, v) => {
                      if (v) {
                        setRole(v as Role);
                        setAgreed(false);
                        setAuthorized(false);
                        setError(null);
                      }
                    }}
                    fullWidth
                    sx={{
                      gap: 1,
                      "& .MuiToggleButtonGroup-grouped": {
                        border: "1px solid rgba(14,42,61,0.14) !important",
                        borderRadius: "12px !important",
                        ml: "0 !important",
                      },
                      "& .MuiToggleButton-root": {
                        flex: 1,
                        color: "#3B4A55",
                        bgcolor: "rgba(247,245,240,0.6)",
                        py: 1.15,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        gap: 0.6,
                        transition: "all 350ms cubic-bezier(0.16, 1, 0.3, 1)",
                        "&.Mui-selected": {
                          bgcolor: "rgba(217,168,75,0.16)",
                          color: "#0A1320",
                          border: "1px solid rgba(217,168,75,0.6) !important",
                          boxShadow: "0 0 0 1px rgba(217,168,75,0.2), 0 12px 30px -10px rgba(217,168,75,0.4)",
                          "&:hover": { bgcolor: "rgba(217,168,75,0.22)" },
                        },
                        "&:hover": { bgcolor: "rgba(247,245,240,0.9)" },
                      },
                    }}
                  >
                    <ToggleButton value="member">
                      <PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                      Join the waitlist
                    </ToggleButton>
                    <ToggleButton value="vendor">
                      <StoreOutlinedIcon sx={{ fontSize: 17 }} />
                      Apply as vendor
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <AnimatePresence mode="wait" initial={false}>
                    {isVendor ? (
                      <motion.div
                        key="vendor"
                        initial={reduced ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: "100%", minWidth: 0 }}
                      >
                        <Stack spacing={2.25}>
                          <SectionLabel num="01" title="Company" />
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12 }}>
                              <LightField name="companyName" label="Company name" placeholder="Acme Dental Supply" autoComplete="organization" required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField name="website" label="Website" placeholder="https://acmedental.com" autoComplete="url" required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField
                                name="category"
                                label="Category"
                                select
                                value={vendorCategoryValue}
                                onChange={(e) => setVendorCategoryValue(e.target.value)}
                                required
                              >
                                <MenuItem value="" disabled>
                                  Choose
                                </MenuItem>
                                {vendorCategories.map((c) => (
                                  <MenuItem key={c} value={c}>
                                    {c}
                                  </MenuItem>
                                ))}
                              </LightField>
                              <OtherReveal show={vendorCategoryValue === OTHER}>
                                <LightField
                                  name="categoryOther"
                                  label="Describe your category"
                                  placeholder="What kind of product or service do you provide?"
                                  required
                                />
                              </OtherReveal>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <LightField
                                name="description"
                                label="What does your company do, in one sentence?"
                                placeholder="We negotiate PPO contracts on a contingency basis."
                                multiline
                                minRows={2}
                                required
                              />
                            </Grid>
                          </Grid>

                          <SectionLabel num="02" title="Contact" />
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField name="firstName" label="First name" placeholder="Taylor" autoComplete="given-name" required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField name="lastName" label="Last name" placeholder="Morgan" autoComplete="family-name" required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField
                                name="email"
                                type="email"
                                label="Primary work email"
                                placeholder="taylor@acme.com"
                                autoComplete="email"
                                required
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField
                                name="secondaryEmail"
                                type="email"
                                label="Secondary email (optional)"
                                placeholder="partnerships@acme.com"
                                autoComplete="email"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField
                                name="contactPhone"
                                type="tel"
                                label="Primary phone"
                                placeholder="+1 (555) 010-1234"
                                autoComplete="tel"
                                required
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField
                                name="secondaryPhone"
                                type="tel"
                                label="Secondary phone (optional)"
                                placeholder="+1 (555) 010-5678"
                                autoComplete="tel"
                              />
                            </Grid>
                          </Grid>

                          <SectionLabel num="03" title="Sign on behalf of the company" />
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField name="signatureName" label="Signer full name" placeholder="Taylor Morgan" autoComplete="name" required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField name="signatureTitle" label="Signer title" placeholder="VP of Partnerships" autoComplete="organization-title" required />
                            </Grid>
                          </Grid>

                          <Stack spacing={1.25} sx={{ mt: 1 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={agreed}
                                  onChange={(e) => setAgreed(e.target.checked)}
                                  size="small"
                                  sx={{
                                    color: "rgba(14,42,61,0.35)",
                                    "&.Mui-checked": { color: "#A07823" },
                                    p: 0.5,
                                    mr: 0.5,
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: "0.82rem", color: "#3B4A55", lineHeight: 1.5 }}>
                                  I have read and agree to the{" "}
                                  <Box
                                    component={Link}
                                    href="/agreement/vendor"
                                    target="_blank"
                                    rel="noopener"
                                    sx={{
                                      color: "#A07823",
                                      fontWeight: 700,
                                      textDecoration: "underline",
                                      textDecorationColor: "rgba(160,120,35,0.5)",
                                      textUnderlineOffset: 3,
                                      "&:hover": { textDecorationColor: "#A07823" },
                                    }}
                                  >
                                    Vendor Partnership Agreement
                                    <OpenInNewIcon sx={{ fontSize: 12, ml: 0.4, verticalAlign: "middle" }} />
                                  </Box>
                                  .
                                </Typography>
                              }
                              sx={{ alignItems: "flex-start", m: 0 }}
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={authorized}
                                  onChange={(e) => setAuthorized(e.target.checked)}
                                  size="small"
                                  sx={{
                                    color: "rgba(14,42,61,0.35)",
                                    "&.Mui-checked": { color: "#A07823" },
                                    p: 0.5,
                                    mr: 0.5,
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: "0.82rem", color: "#3B4A55", lineHeight: 1.5 }}>
                                  I confirm I am authorized to commit my company to this partnership.
                                </Typography>
                              }
                              sx={{ alignItems: "flex-start", m: 0 }}
                            />
                          </Stack>
                        </Stack>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="member"
                        initial={reduced ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: "100%", minWidth: 0 }}
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isVendor && (
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
                  )}

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
                    disabled={submitting || (isVendor && (!agreed || !authorized))}
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
                    {submitting
                      ? isVendor
                        ? "Sending application…"
                        : waitlistCopy.submittingLabel
                      : isVendor
                        ? "Apply as vendor partner"
                        : waitlistCopy.submitLabel}
                  </Button>

                  {!isVendor && (
                    <Typography variant="body2" sx={{ color: "#5C6770", fontSize: "0.74rem", textAlign: "center" }}>
                      No payment now. Founding members are billed only when the doors open on launch day.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        mt: 1,
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: "50%",
          bgcolor: "rgba(217,168,75,0.14)",
          color: "#A07823",
          display: "grid",
          placeItems: "center",
          fontSize: "0.66rem",
          fontWeight: 700,
          border: "1px solid rgba(217,168,75,0.3)",
        }}
      >
        {num}
      </Box>
      <Typography
        variant="overline"
        sx={{
          color: "#0A1A2F",
          fontSize: "0.7rem",
          letterSpacing: "0.18em",
          fontWeight: 700,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: "rgba(14,42,61,0.1)" }} />
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
