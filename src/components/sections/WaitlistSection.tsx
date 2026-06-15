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
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  ExternalLink,
  Lock,
  Store,
  User,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  challengeOptions,
  locationOptions,
  memberRoles,
} from "@/lib/content";
import { vendorCategories } from "@/lib/vendorData";

const MotionBox = motion.create(Box);

type HeroRole = "member" | "vendor";

const OTHER = "Other";

/**
 * Standalone waitlist form section. Field structure and payload shape are
 * IDENTICAL to the previous hero-embedded version so the Supabase schema and
 * admin reporting continue to work unchanged.
 */
export default function WaitlistSection() {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [role, setRole] = useState<HeroRole>("member");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Vendor partnership agreement (left checkbox in vendor mode).
  const [agreed, setAgreed] = useState(false);
  // Vendor authorization (right checkbox in vendor mode).
  const [authorized, setAuthorized] = useState(false);
  // Member agreement acceptance (only checkbox in member mode).
  const [memberAgreed, setMemberAgreed] = useState(false);

  // Tracked dropdown values so we can reveal an "Other" text input when
  // the user picks "Other".
  const [vendorCategory, setVendorCategory] = useState("");
  const [memberRoleValue, setMemberRoleValue] = useState("");
  const [memberChallenge, setMemberChallenge] = useState("");

  const isVendor = role === "vendor";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (isVendor && (!agreed || !authorized)) {
      setError("Please confirm both boxes before applying as a vendor partner.");
      return;
    }
    if (!isVendor && !memberAgreed) {
      setError("Please agree to the Member Agreement to join the waitlist.");
      return;
    }

    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    // If the user picked "Other" in a dropdown, the typed text replaces
    // the literal "Other" so the saved value is the real answer.
    const resolveOther = (selected: FormDataEntryValue | null, otherText: FormDataEntryValue | null) => {
      const value = String(selected ?? "");
      if (value !== OTHER) return value;
      const typed = String(otherText ?? "").trim();
      return typed || OTHER;
    };

    const memberPayload = {
      role,
      fullName,
      email: fd.get("email"),
      practiceName: fd.get("practiceName"),
      phone: fd.get("phone"),
      source: "landing-hero",
      utm: {
        role_label: resolveOther(fd.get("roleLabel"), fd.get("roleLabelOther")),
        locations: fd.get("locations"),
        biggest_challenge: resolveOther(fd.get("challenge"), fd.get("challengeOther")),
        agreement_type: "member",
        agreement_version: "1.0",
        agreement_accepted_at: new Date().toISOString(),
      },
    };

    const vendorPayload = {
      role,
      fullName,
      email: fd.get("email"),
      practiceName: fd.get("companyName"),
      phone: fd.get("contactPhone"),
      source: "landing-hero",
      message: String(fd.get("description") ?? ""),
      utm: {
        company_name: fd.get("companyName"),
        website: fd.get("website"),
        category: resolveOther(fd.get("category"), fd.get("categoryOther")),
        primary_email: fd.get("email"),
        secondary_email: fd.get("secondaryEmail"),
        primary_phone: fd.get("contactPhone"),
        secondary_phone: fd.get("secondaryPhone"),
        signature_name: fd.get("signatureName"),
        signature_title: fd.get("signatureTitle"),
        agreement_version: "1.0",
        agreement_type: "vendor_partnership",
        agreement_accepted_at: new Date().toISOString(),
        confirmed_authority: true,
      },
    };

    const payload = isVendor ? vendorPayload : memberPayload;

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
        py: { xs: 7, md: 9 },
        bgcolor: "#F8F5EE",
        borderTop: "1px solid #E7E2D6",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={1.25} sx={{ textAlign: "center", maxWidth: 620, mx: "auto", mb: { xs: 4, md: 5 } }}>
          <Typography
            sx={{
              color: "#9B7B3A",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Reserve your spot
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: "#1A1A1A",
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.7rem", md: "2.1rem" },
              fontWeight: 500,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            Lock the $49 founding rate.
          </Typography>
          <Typography sx={{ color: "#52525B", fontSize: { xs: "0.95rem", md: "1.02rem" } }}>
            Takes 60 seconds. No payment now — you&apos;re only billed when doors open.
          </Typography>
        </Stack>

        <MotionBox
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E7E2D6",
            borderRadius: 3,
            p: { xs: 2.5, md: 3.5 },
            maxWidth: 620,
            mx: "auto",
            boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 24px 60px -30px rgba(20,20,20,0.18)",
          }}
        >
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              {/* Segmented toggle */}
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  p: 0.5,
                  borderRadius: 1.5,
                  bgcolor: "#F8F5EE",
                  border: "1px solid #E7E2D6",
                }}
              >
                {(["member", "vendor"] as HeroRole[]).map((r) => {
                  const isActive = role === r;
                  const Icon = r === "member" ? User : Store;
                  const label = r === "member" ? "I'm a dentist" : "I'm a vendor";
                  return (
                    <Box
                      key={r}
                      component="button"
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setAgreed(false);
                        setAuthorized(false);
                        setMemberAgreed(false);
                        setVendorCategory("");
                        setMemberRoleValue("");
                        setMemberChallenge("");
                        setError(null);
                      }}
                      sx={{
                        cursor: "pointer",
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.85,
                        py: 1,
                        border: "none",
                        borderRadius: 1.25,
                        bgcolor: isActive ? "#FFFFFF" : "transparent",
                        color: isActive ? "#1A1A1A" : "#71717A",
                        boxShadow: isActive ? "0 1px 2px rgba(20,20,20,0.08)" : "none",
                        fontSize: "0.86rem",
                        fontWeight: 600,
                        fontFamily: "inherit",
                        transition: "all 200ms ease",
                      }}
                    >
                      <Icon size={14} />
                      {label}
                    </Box>
                  );
                })}
              </Box>

              <AnimatePresence mode="wait" initial={false}>
                {isVendor ? (
                  <motion.div
                    key="vendor"
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Stack spacing={1.5}>
                      {/* 01 COMPANY */}
                      <SectionLabel num="01" title="Company" />
                      <Grid container spacing={1.25}>
                        <Grid size={{ xs: 12 }}>
                          <CompactField name="companyName" label="Company name" placeholder="Acme Dental Supply" autoComplete="organization" required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <CompactField name="website" label="Website" placeholder="https://acmedental.com" autoComplete="url" required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <CompactField
                            name="category"
                            label="Category"
                            select
                            value={vendorCategory}
                            onChange={(e) => setVendorCategory(e.target.value)}
                            required
                          >
                            <MenuItem value="" disabled>Choose</MenuItem>
                            {vendorCategories.map((c) => (
                              <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                          </CompactField>
                        </Grid>
                        {vendorCategory === OTHER && (
                          <Grid size={{ xs: 12 }}>
                            <CompactField
                              name="categoryOther"
                              label="Tell us your category"
                              placeholder="e.g. Practice management consultant"
                              required
                            />
                          </Grid>
                        )}
                        <Grid size={{ xs: 12 }}>
                          <CompactField
                            name="description"
                            label="What does your company do, in one sentence?"
                            placeholder="We negotiate PPO contracts on a contingency basis — practices pay only after fee increases land."
                            multiline
                            minRows={2}
                            required
                          />
                        </Grid>
                      </Grid>

                      {/* 02 CONTACT — primary + secondary email and phone */}
                      <SectionLabel num="02" title="Contact" />
                      <Grid container spacing={1.25}>
                        <Grid size={{ xs: 6 }}>
                          <CompactField name="firstName" label="First name" placeholder="Taylor" autoComplete="given-name" required />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <CompactField name="lastName" label="Last name" placeholder="Morgan" autoComplete="family-name" required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <CompactField name="email" type="email" label="Primary work email" placeholder="taylor@acme.com" autoComplete="email" required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <CompactField name="secondaryEmail" type="email" label="Secondary email (optional)" placeholder="partnerships@acme.com" autoComplete="email" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <CompactField name="contactPhone" type="tel" label="Primary phone" placeholder="+1 (555) 010-1234" autoComplete="tel" required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <CompactField name="secondaryPhone" type="tel" label="Secondary phone (optional)" placeholder="+1 (555) 010-5678" autoComplete="tel" />
                        </Grid>
                      </Grid>

                      {/* 03 SIGN */}
                      <SectionLabel num="03" title="Sign on behalf of the company" />
                      <Grid container spacing={1.25}>
                        <Grid size={{ xs: 12, sm: 7 }}>
                          <CompactField name="signatureName" label="Signer full name" placeholder="Taylor Morgan" autoComplete="name" required />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <CompactField name="signatureTitle" label="Signer title" placeholder="VP of Partnerships" autoComplete="organization-title" required />
                        </Grid>
                      </Grid>

                      {/* Dual checkboxes */}
                      <Stack spacing={1.25} sx={{ mt: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={agreed}
                              onChange={(e) => setAgreed(e.target.checked)}
                              size="small"
                              sx={{
                                color: "#A8A29E",
                                "&.Mui-checked": { color: "#9B7B3A" },
                                p: 0.5,
                                mr: 0.5,
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: "0.8rem", color: "#52525B", lineHeight: 1.5 }}>
                              I have read and agree to the{" "}
                              <Box
                                component={Link}
                                href="/agreement/vendor"
                                target="_blank"
                                rel="noopener"
                                sx={{
                                  color: "#9B7B3A",
                                  fontWeight: 700,
                                  textDecoration: "underline",
                                  textDecorationColor: "rgba(155,123,58,0.4)",
                                  textUnderlineOffset: 3,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 0.4,
                                }}
                              >
                                Vendor Partnership Agreement
                                <ExternalLink size={11} />
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
                                color: "#A8A29E",
                                "&.Mui-checked": { color: "#9B7B3A" },
                                p: 0.5,
                                mr: 0.5,
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: "0.8rem", color: "#52525B", lineHeight: 1.5 }}>
                              I confirm I am authorized to commit my company to this partnership
                              and to the member discount terms above.
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
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Grid container spacing={1.25}>
                      <Grid size={{ xs: 6 }}>
                        <CompactField name="firstName" label="First name" placeholder="Dr. Taylor" autoComplete="given-name" required />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <CompactField name="lastName" label="Last name" placeholder="Morgan" autoComplete="family-name" required />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <CompactField name="email" type="email" label="Work email" placeholder="taylor@practice.com" autoComplete="email" required />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <CompactField
                          name="roleLabel"
                          label="What best describes your role?"
                          select
                          value={memberRoleValue}
                          onChange={(e) => setMemberRoleValue(e.target.value)}
                        >
                          <MenuItem value="" disabled>Choose one</MenuItem>
                          {memberRoles.map((r) => (
                            <MenuItem key={r} value={r}>{r}</MenuItem>
                          ))}
                        </CompactField>
                      </Grid>
                      {memberRoleValue === OTHER && (
                        <Grid size={{ xs: 12 }}>
                          <CompactField
                            name="roleLabelOther"
                            label="Tell us your role"
                            placeholder="e.g. Director of Operations"
                            required
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12 }}>
                        <CompactField name="practiceName" label="Practice name (optional)" placeholder="Morgan Dental Group" autoComplete="organization" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CompactField name="locations" label="Number of locations" select defaultValue="">
                          <MenuItem value="" disabled>Choose</MenuItem>
                          {locationOptions.map((o) => (
                            <MenuItem key={o} value={o}>{o}</MenuItem>
                          ))}
                        </CompactField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CompactField name="phone" label="Phone (optional)" placeholder="(555) 000-0000" autoComplete="tel" />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <CompactField
                          name="challenge"
                          label="Biggest challenge right now?"
                          select
                          value={memberChallenge}
                          onChange={(e) => setMemberChallenge(e.target.value)}
                        >
                          <MenuItem value="" disabled>Choose</MenuItem>
                          {challengeOptions.map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                          ))}
                        </CompactField>
                      </Grid>
                      {memberChallenge === OTHER && (
                        <Grid size={{ xs: 12 }}>
                          <CompactField
                            name="challengeOther"
                            label="Describe your biggest challenge"
                            placeholder="e.g. Hiring & retaining hygienists"
                            multiline
                            minRows={2}
                            required
                          />
                        </Grid>
                      )}
                    </Grid>

                    {/* Member Agreement checkbox — required */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={memberAgreed}
                          onChange={(e) => setMemberAgreed(e.target.checked)}
                          size="small"
                          sx={{
                            color: "#A8A29E",
                            "&.Mui-checked": { color: "#9B7B3A" },
                            p: 0.5,
                            mr: 0.5,
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "0.8rem", color: "#52525B", lineHeight: 1.5 }}>
                          I agree to the{" "}
                          <Box
                            component={Link}
                            href="/agreement/member"
                            target="_blank"
                            rel="noopener"
                            sx={{
                              color: "#9B7B3A",
                              fontWeight: 700,
                              textDecoration: "underline",
                              textDecorationColor: "rgba(155,123,58,0.4)",
                              textUnderlineOffset: 3,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.4,
                            }}
                          >
                            Member Agreement
                            <ExternalLink size={11} />
                          </Box>
                          {" "}and to receive launch updates from DMN.
                        </Typography>
                      }
                      sx={{ alignItems: "flex-start", m: 0, mt: 1.5 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <Typography
                  role="alert"
                  sx={{
                    color: "#991B1B",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    bgcolor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 1.5,
                    px: 1.25,
                    py: 0.85,
                  }}
                >
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                disabled={
                  submitting ||
                  (isVendor ? !agreed || !authorized : !memberAgreed)
                }
                fullWidth
                endIcon={
                  submitting ? (
                    <CircularProgress size={15} thickness={5} sx={{ color: "#FFFFFF" }} />
                  ) : (
                    <ArrowRight size={16} />
                  )
                }
                sx={{
                  py: 1.4,
                  fontSize: "0.94rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#1A1A1A",
                  color: "#FFFFFF !important",
                  letterSpacing: "-0.005em",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  "&:hover": { bgcolor: "#2A2A2A" },
                  "&.Mui-disabled": {
                    bgcolor: "#E7E2D6",
                    color: "#A8A29E !important",
                  },
                }}
              >
                {submitting
                  ? "Reserving…"
                  : isVendor
                  ? "Apply as vendor partner"
                  : "Reserve my founding spot"}
              </Button>

              <Stack direction="row" spacing={0.65} sx={{ alignItems: "center", justifyContent: "center", color: "#71717A" }}>
                <Lock size={11} />
                <Typography sx={{ color: "#71717A", fontSize: "0.74rem" }}>
                  No payment today · billed only at launch · cancel anytime
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mt: 0.5 }}>
      <Typography
        sx={{
          color: "#9B7B3A",
          fontSize: "0.7rem",
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          letterSpacing: "0.04em",
        }}
      >
        {num}
      </Typography>
      <Typography
        sx={{ color: "#1A1A1A", fontSize: "0.76rem", fontWeight: 600, letterSpacing: "-0.005em" }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: "#E7E2D6" }} />
    </Stack>
  );
}

type FieldProps = React.ComponentProps<typeof TextField> & { label: string };

function CompactField({ label, name, ...props }: FieldProps) {
  return (
    <TextField
      {...props}
      name={name}
      label={label}
      variant="outlined"
      fullWidth
      size="small"
      slotProps={{
        inputLabel: {
          shrink: true,
          sx: {
            color: "#52525B",
            fontWeight: 600,
            fontSize: "0.78rem",
            "&.MuiInputLabel-shrink": {
              transform: "translate(12px, -7px) scale(0.85)",
            },
            "&.Mui-focused": { color: "#1A1A1A" },
          },
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "#FFFFFF",
          color: "#1A1A1A",
          minHeight: 42,
          borderRadius: 1.5,
          transition: "border-color 180ms ease, box-shadow 180ms ease",
          "& fieldset": { borderColor: "#E7E2D6", borderWidth: 1 },
          "&:hover fieldset": { borderColor: "#D4CDB8" },
          "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(155,123,58,0.14)" },
          "&.Mui-focused fieldset": { borderColor: "#9B7B3A", borderWidth: 1.5 },
        },
        "& .MuiOutlinedInput-input": {
          color: "#1A1A1A",
          fontSize: "0.9rem",
          fontWeight: 500,
          py: 1.1,
          "&::placeholder": {
            color: "#A8A29E",
            opacity: 1,
            fontSize: "0.84rem",
          },
        },
        "& .MuiSelect-select": { py: "11px !important" },
      }}
    />
  );
}
