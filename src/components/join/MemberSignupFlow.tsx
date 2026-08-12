"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { challengeOptions, locationOptions, memberRoles } from "@/lib/content";

const MotionBox = motion.create(Box);

const OTHER = "Other";

// Must match WaitlistSection verbatim — this exact copy is persisted
// server-side as the TCPA/CASL audit trail when the box is checked.
const SMS_CONSENT_TEXT =
  "I agree to receive SMS messages from the Dental Member Network, including hotline replies. Reply STOP to opt out.";

const STEPS = [
  { eyebrow: "Step 1 of 3", title: "First, about you." },
  { eyebrow: "Step 2 of 3", title: "Your practice." },
  { eyebrow: "Step 3 of 3", title: "Almost in." },
] as const;

/**
 * Netflix-style member signup — the SAME fields and the SAME
 * /api/member/signup payload as the /join member form, split into three
 * short steps with one clear ask per screen. Email arrives prefilled from
 * the homepage hero (?email=...), ?ref= attribution passes through
 * unchanged, and success continues into the existing pay-first flow
 * (/upgrade → Stripe checkout).
 */
export default function MemberSignupFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(params.get("email") ?? "");
  // Step 2
  const [roleLabel, setRoleLabel] = useState("");
  const [roleLabelOther, setRoleLabelOther] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [locations, setLocations] = useState("");
  const [phone, setPhone] = useState("");
  // Step 3
  const [challenge, setChallenge] = useState("");
  const [challengeOther, setChallengeOther] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);

  const emailOk = /.+@.+\..+/.test(email.trim());

  const stepValid = useMemo(() => {
    if (step === 0) return firstName.trim() !== "" && lastName.trim() !== "" && emailOk;
    if (step === 1)
      return (
        practiceName.trim() !== "" &&
        (roleLabel !== OTHER || roleLabelOther.trim() !== "")
      );
    return agreed && (challenge !== OTHER || challengeOther.trim() !== "");
  }, [step, firstName, lastName, emailOk, practiceName, roleLabel, roleLabelOther, agreed, challenge, challengeOther]);

  const go = (d: 1 | -1) => {
    setError(null);
    setDir(d);
    setStep((s) => Math.min(2, Math.max(0, s + d)));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    const resolveOther = (v: string, other: string) => (v === OTHER ? other.trim() : v || null);
    try {
      const res = await fetch("/api/member/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "member" as const,
          fullName,
          email: email.trim(),
          practiceName: practiceName.trim(),
          phone: phone.trim() || null,
          smsConsent,
          smsConsentText: smsConsent ? SMS_CONSENT_TEXT : null,
          smsConsentAt: smsConsent ? new Date().toISOString() : null,
          source: "landing-join",
          ref: params.get("ref") ?? undefined,
          utm: {
            role_label: resolveOther(roleLabel, roleLabelOther),
            locations: locations || null,
            biggest_challenge: resolveOther(challenge, challengeOther),
            agreement_type: "member",
            agreement_version: "1.0",
            agreement_accepted_at: new Date().toISOString(),
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; next?: string };
      if (!res.ok) {
        setError(data?.error ?? "Couldn't complete signup right now. Please try again.");
        setSubmitting(false);
        return;
      }
      // Carry an annual pre-selection (from /pricing) through to the
      // /upgrade billing toggle.
      const next = data?.next ?? "/upgrade";
      const interval = params.get("interval");
      router.push(
        interval === "annual" ? `${next}${next.includes("?") ? "&" : "?"}interval=annual` : next,
      );
    } catch {
      setError("Network error. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#FFFFFF",
      borderRadius: 2,
      fontSize: "1rem",
    },
    "& .MuiInputLabel-root": { fontSize: "0.95rem" },
  } as const;

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#FBF8F1", display: "flex", flexDirection: "column" }}>
      {/* Thin gold progress bar — fills a third per step */}
      <Box sx={{ height: 4, bgcolor: "rgba(155,123,58,0.15)" }}>
        <Box
          sx={{
            height: "100%",
            width: `${((step + 1) / 3) * 100}%`,
            bgcolor: "#D9A84B",
            transition: "width 420ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </Box>

      <Container maxWidth="sm" sx={{ flex: 1, display: "flex", flexDirection: "column", py: { xs: 4, md: 7 } }}>
        <Box sx={{ maxWidth: 460, width: "100%", mx: "auto", flex: 1 }}>
          <AnimatePresence mode="wait" initial={false}>
            <MotionBox
              key={step}
              initial={reduced ? false : { opacity: 0, x: dir * 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: dir * -36 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <Typography
                sx={{
                  color: "#9B7B3A",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                {STEPS[step]!.eyebrow}
              </Typography>
              <Typography
                component="h1"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  fontWeight: 500,
                  color: "#0A1A2F",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  mb: 1,
                }}
              >
                {STEPS[step]!.title}
              </Typography>
              <Typography sx={{ color: "#5C6770", fontSize: "0.95rem", lineHeight: 1.6, mb: 3.5 }}>
                {step === 0 && "Three short steps and you're picking your plan. No payment on this page."}
                {step === 1 && "So the helpline and your member directory listing fit your practice."}
                {step === 2 && "One optional question, one agreement, and you're through to plan + checkout."}
              </Typography>

              {step === 0 && (
                <Stack spacing={2.25}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2.25}>
                    <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" autoFocus fullWidth required sx={fieldSx} />
                    <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" fullWidth required sx={fieldSx} />
                  </Stack>
                  <TextField label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" fullWidth required sx={fieldSx} />
                </Stack>
              )}

              {step === 1 && (
                <Stack spacing={2.25}>
                  <TextField select label="What best describes your role?" value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} fullWidth sx={fieldSx}>
                    {memberRoles.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </TextField>
                  {roleLabel === OTHER && (
                    <TextField label="Tell us your role" value={roleLabelOther} onChange={(e) => setRoleLabelOther(e.target.value)} placeholder="e.g. Director of Operations" fullWidth required sx={fieldSx} />
                  )}
                  <TextField label="Practice name" value={practiceName} onChange={(e) => setPracticeName(e.target.value)} autoComplete="organization" fullWidth required sx={fieldSx} />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2.25}>
                    <TextField select label="Number of locations" value={locations} onChange={(e) => setLocations(e.target.value)} fullWidth sx={fieldSx}>
                      {locationOptions.map((o) => (
                        <MenuItem key={o} value={o}>{o}</MenuItem>
                      ))}
                    </TextField>
                    <TextField label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" fullWidth sx={fieldSx} />
                  </Stack>
                </Stack>
              )}

              {step === 2 && (
                <Stack spacing={2.25}>
                  <TextField select label="Biggest challenge right now?" value={challenge} onChange={(e) => setChallenge(e.target.value)} fullWidth sx={fieldSx}>
                    {challengeOptions.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                  {challenge === OTHER && (
                    <TextField label="Describe your biggest challenge" value={challengeOther} onChange={(e) => setChallengeOther(e.target.value)} placeholder="e.g. Hiring & retaining hygienists" multiline minRows={2} fullWidth required sx={fieldSx} />
                  )}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        size="small"
                        sx={{ color: "#A8A29E", "&.Mui-checked": { color: "#9B7B3A" }, p: 0.5, mr: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.82rem", color: "#52525B", lineHeight: 1.5 }}>
                        I agree to the{" "}
                        <Box
                          component={Link}
                          href="/agreements/dmn-member-agreement.pdf"
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
                        </Box>{" "}
                        and to receive launch updates from DMN.
                      </Typography>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={smsConsent}
                        onChange={(e) => setSmsConsent(e.target.checked)}
                        size="small"
                        sx={{ color: "#A8A29E", "&.Mui-checked": { color: "#9B7B3A" }, p: 0.5, mr: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.82rem", color: "#52525B", lineHeight: 1.5 }}>
                        {SMS_CONSENT_TEXT}
                      </Typography>
                    }
                    sx={{ alignItems: "flex-start", m: 0 }}
                  />
                </Stack>
              )}

              {error && (
                <Typography
                  role="alert"
                  sx={{
                    mt: 2.5,
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

              <Stack direction="row" spacing={1.5} sx={{ mt: 4, alignItems: "center" }}>
                {step > 0 && (
                  <Button
                    onClick={() => go(-1)}
                    startIcon={<ArrowLeft size={15} />}
                    sx={{ textTransform: "none", color: "#5C6770", fontWeight: 600, borderRadius: 2, px: 1.5 }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={() => (step === 2 ? void submit() : go(1))}
                  disabled={!stepValid || submitting}
                  endIcon={
                    submitting ? (
                      <CircularProgress size={15} sx={{ color: "#0A1A2F" }} />
                    ) : step === 2 ? (
                      <Check size={16} />
                    ) : (
                      <ArrowRight size={16} />
                    )
                  }
                  sx={{
                    flex: 1,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: 2,
                    bgcolor: "#D9A84B",
                    color: "#0A1A2F",
                    "&:hover": { bgcolor: "#E5BA63" },
                    "&.Mui-disabled": { bgcolor: "rgba(217,168,75,0.35)", color: "rgba(10,26,47,0.5)" },
                  }}
                >
                  {step === 2 ? "Start your membership" : "Continue"}
                </Button>
              </Stack>

              {step === 0 && (
                <Typography sx={{ mt: 2.5, fontSize: "0.8rem", color: "#7A8590", textAlign: "center" }}>
                  Founding 100 · $49 a month, locked for life · cancel anytime
                </Typography>
              )}
            </MotionBox>
          </AnimatePresence>
        </Box>

        <Typography sx={{ mt: 4, fontSize: "0.78rem", color: "#7A8590", textAlign: "center" }}>
          An expert, partner, or team application instead?{" "}
          <Box component={Link} href="/join" sx={{ color: "#9B7B3A", fontWeight: 700 }}>
            Use the full form
          </Box>
        </Typography>
      </Container>
    </Box>
  );
}
