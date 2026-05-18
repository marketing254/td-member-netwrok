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
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  challengeOptions,
  expertAvailability,
  expertExperienceLevels,
  expertSpecialties,
  locationOptions,
  memberRoles,
  waitlist as waitlistCopy,
  waitlistByRole,
} from "@/lib/content";
import { vendorCategories } from "@/lib/vendorData";
import type { WaitlistRole } from "@/lib/waitlist/validate";

const MotionBox = motion.create(Box);

export default function WaitlistSection() {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [role, setRole] = useState<WaitlistRole>("member");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const isVendor = role === "vendor";
  const isExpert = role === "expert";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (isVendor && (!agreed || !authorized)) {
      setError("Please confirm both boxes before applying as a vendor partner.");
      return;
    }
    if (isExpert && !agreed) {
      setError("Please confirm the expert participation notice to apply.");
      return;
    }

    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    let payload: Record<string, unknown> = {
      role,
      fullName,
      email: fd.get("email"),
      source: "landing-waitlist",
    };

    if (isVendor) {
      payload = {
        ...payload,
        practiceName: fd.get("companyName"),
        message: String(fd.get("description") ?? ""),
        utm: {
          company_name: fd.get("companyName"),
          website: fd.get("website"),
          category: fd.get("category"),
          contact_phone: fd.get("contactPhone"),
          offer_summary: fd.get("offerSummary"),
          calendar_link: fd.get("calendarLink"),
          hotline_email: fd.get("hotlineEmail"),
          signature_name: fd.get("signatureName"),
          signature_title: fd.get("signatureTitle"),
          agreement_version: "1.0",
          agreement_type: "vendor_partnership",
          agreement_accepted_at: new Date().toISOString(),
          confirmed_authority: true,
        },
      };
    } else if (isExpert) {
      payload = {
        ...payload,
        practiceName: fd.get("companyName"),
        phone: fd.get("contactPhone"),
        message: String(fd.get("bio") ?? ""),
        utm: {
          title: fd.get("title"),
          specialty: fd.get("specialty"),
          years_experience: fd.get("yearsExperience"),
          credentials: fd.get("credentials"),
          linkedin: fd.get("linkedin"),
          availability: fd.get("availability"),
          company_name: fd.get("companyName"),
          contact_phone: fd.get("contactPhone"),
          agreement_type: "expert_participation",
          agreement_accepted_at: new Date().toISOString(),
        },
      };
    } else {
      payload = {
        ...payload,
        practiceName: fd.get("practiceName"),
        utm: {
          role_label: fd.get("roleLabel"),
          locations: fd.get("locations"),
          biggest_challenge: fd.get("challenge"),
        },
      };
    }

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
      router.push(`/waitlist/thanks?role=${role}${data.duplicate ? "&again=1" : ""}`);
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
          {/* LEFT — verbatim benefits panel */}
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
                  {waitlistByRole[role].eyebrow}
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
                      {waitlistByRole[role].headline}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: "#3B4A55", maxWidth: 480 }}>
                      {waitlistByRole[role].subtitle}
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
                        {waitlistByRole[role].benefits.map((b) => (
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

          {/* RIGHT — the form */}
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
                  {/* Anchor targets for the nav links — invisible spans that scroll-into-view */}
                  <Box id="waitlist-member" sx={{ position: "absolute", top: -100, height: 1, width: 1, pointerEvents: "none" }} />
                  <Box id="waitlist-vendor" sx={{ position: "absolute", top: -100, height: 1, width: 1, pointerEvents: "none" }} />
                  <Box id="waitlist-expert" sx={{ position: "absolute", top: -100, height: 1, width: 1, pointerEvents: "none" }} />

                  <ToggleButtonGroup
                    exclusive
                    value={role}
                    onChange={(_, v) => {
                      if (v) {
                        setRole(v as WaitlistRole);
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
                        fontSize: "0.82rem",
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
                      <PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                      Member
                    </ToggleButton>
                    <ToggleButton value="vendor">
                      <StoreOutlinedIcon sx={{ fontSize: 16 }} />
                      Vendor
                    </ToggleButton>
                    <ToggleButton value="expert">
                      <SchoolOutlinedIcon sx={{ fontSize: 16 }} />
                      Expert
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
                              <LightField name="category" label="Category" select defaultValue="" required>
                                <MenuItem value="" disabled>
                                  Choose
                                </MenuItem>
                                {vendorCategories.map((c) => (
                                  <MenuItem key={c} value={c}>
                                    {c}
                                  </MenuItem>
                                ))}
                              </LightField>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <LightField
                                name="description"
                                label="What does your company do, in one sentence?"
                                placeholder="We negotiate PPO contracts on a contingency basis — practices pay only after fee increases land."
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
                              <LightField name="email" type="email" label="Work email" placeholder="taylor@acme.com" autoComplete="email" required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField name="contactPhone" label="Phone" placeholder="+1 (555) 010-1234" autoComplete="tel" />
                            </Grid>
                          </Grid>

                          <SectionLabel num="03" title="Member offer" />
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12 }}>
                              <LightField
                                name="offerSummary"
                                label="Discount or value you'll offer DMN members"
                                placeholder="18% off catalog · First month free · Flat 15% off ongoing services"
                                multiline
                                minRows={2}
                                required
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField
                                name="calendarLink"
                                label="Calendar link for warm intros"
                                placeholder="https://calendly.com/your-team"
                                autoComplete="url"
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <LightField
                                name="hotlineEmail"
                                label="Email for member helpline notifications"
                                placeholder="partners@acme.com"
                                autoComplete="email"
                              />
                            </Grid>
                          </Grid>

                          <SectionLabel num="04" title="Sign on behalf of the company" />
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
                                  I confirm I am authorized to commit my company to this partnership and to the member discount terms above.
                                </Typography>
                              }
                              sx={{ alignItems: "flex-start", m: 0 }}
                            />
                          </Stack>
                        </Stack>
                      </motion.div>
                    ) : isExpert ? (
                      <motion.div
                        key="expert"
                        initial={reduced ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: "100%", minWidth: 0 }}
                      >
                        <Stack spacing={2.25} sx={{ width: "100%", minWidth: 0 }}>
                          <SectionLabel num="01" title="About you" />
                          <FieldGrid cols={2}>
                            <LightField name="firstName" label="First name" placeholder="Dr. Taylor" autoComplete="given-name" required />
                            <LightField name="lastName" label="Last name" placeholder="Morgan" autoComplete="family-name" required />
                            <LightField name="email" type="email" label="Email" placeholder="taylor@yourpractice.com" autoComplete="email" required />
                            <LightField name="contactPhone" label="Phone" placeholder="+1 (555) 010-1234" autoComplete="tel" />
                            <LightField name="title" label="Title or role" placeholder="Practice Management Coach" autoComplete="organization-title" required />
                            <LightField name="companyName" label="Company / firm (optional)" placeholder="Morgan Coaching" autoComplete="organization" />
                          </FieldGrid>

                          <SectionLabel num="02" title="Specialty" />
                          <FieldGrid cols={2}>
                            <LightField name="specialty" label="Primary specialty" select defaultValue="" required>
                              <MenuItem value="" disabled>Choose</MenuItem>
                              {expertSpecialties.map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                              ))}
                            </LightField>
                            <LightField name="yearsExperience" label="Years of experience" select defaultValue="" required>
                              <MenuItem value="" disabled>Choose</MenuItem>
                              {expertExperienceLevels.map((y) => (
                                <MenuItem key={y} value={y}>{y}</MenuItem>
                              ))}
                            </LightField>
                            <FullSpan>
                              <LightField
                                name="credentials"
                                label="Credentials, licenses, certifications"
                                placeholder="DDS · MBA · 20+ practice owner clients · author of …"
                                required
                              />
                            </FullSpan>
                            <FullSpan>
                              <LightField
                                name="linkedin"
                                label="LinkedIn or portfolio URL"
                                placeholder="https://linkedin.com/in/yourprofile"
                                autoComplete="url"
                              />
                            </FullSpan>
                          </FieldGrid>

                          <SectionLabel num="03" title="How you'd like to help" />
                          <FieldGrid cols={1}>
                            <LightField name="availability" label="Availability" select defaultValue="" required>
                              <MenuItem value="" disabled>Choose</MenuItem>
                              {expertAvailability.map((a) => (
                                <MenuItem key={a} value={a}>{a}</MenuItem>
                              ))}
                            </LightField>
                            <LightField
                              name="bio"
                              label="Short bio (3–4 sentences)"
                              placeholder="What problem do you solve? Who do you typically work with? What's an example win?"
                              multiline
                              minRows={3}
                              required
                            />
                          </FieldGrid>

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
                                  href="/agreement/expert"
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
                                  Expert Partner Agreement
                                  <OpenInNewIcon sx={{ fontSize: 12, ml: 0.4, verticalAlign: "middle" }} />
                                </Box>
                                . DMN will review my application and follow up before any expert
                                listing or paid session.
                              </Typography>
                            }
                            sx={{ alignItems: "flex-start", m: 0, mt: 1 }}
                          />
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
                          <Grid size={{ xs: 12 }}>
                            <LightField name="email" type="email" label="Email address" placeholder="taylor@practice.com" autoComplete="email" required />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <LightField name="roleLabel" label="What best describes your role?" select defaultValue="">
                              <MenuItem value="" disabled>
                                Choose one
                              </MenuItem>
                              {memberRoles.map((r) => (
                                <MenuItem key={r} value={r}>
                                  {r}
                                </MenuItem>
                              ))}
                            </LightField>
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
                            <LightField name="challenge" label="Biggest challenge right now?" select defaultValue="">
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
                        </Grid>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isVendor && !isExpert && (
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
                    disabled={
                      submitting ||
                      (isVendor && (!agreed || !authorized)) ||
                      (isExpert && !agreed)
                    }
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
                      ? waitlistCopy.submittingLabel
                      : isVendor
                      ? "Apply as vendor partner"
                      : isExpert
                      ? "Apply as expert"
                      : waitlistCopy.submitLabel}
                  </Button>

                  {!isVendor && !isExpert && (
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
      <Box
        sx={{
          flex: "1 1 0",
          minWidth: 0,
          height: 1,
          bgcolor: "rgba(14,42,61,0.08)",
        }}
      />
    </Box>
  );
}

/**
 * CSS Grid wrapper for form fields. Replaces MUI's <Grid container> which
 * can compute widths incorrectly inside overflow:hidden form panels.
 * `cols` = number of equal columns on >=sm; on xs always 1.
 */
function FieldGrid({
  cols,
  children,
}: {
  cols: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        width: "100%",
        minWidth: 0,
        gridTemplateColumns: {
          xs: "1fr",
          sm: cols === 1 ? "1fr" : cols === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
        },
      }}
    >
      {children}
    </Box>
  );
}

function FullSpan({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" }, minWidth: 0 }}>
      {children}
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
