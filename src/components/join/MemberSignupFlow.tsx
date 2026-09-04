"use client";
import { trackEvent } from "@/lib/analytics";
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
import { ArrowLeft, ArrowRight, Check, ExternalLink, MessageCircle, Search, Tag, BookOpen, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { challengeOptions, heardAboutOptions, locationOptions, memberRoles } from "@/lib/content";

const MotionBox = motion.create(Box);

// Resolved server-side by the page (lib/referralContext) so the
// invitation header is in the first paint — type mirrored here because
// the lib is server-only.
type RefContext = {
  name: string;
  kind: "expert" | "partner" | "team";
  tagline: string | null;
  imageUrl: string | null;
  pairedName: string | null;
  offerActive: boolean;
  offerMonths: number;
};

function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((w) => !/^dr\.?$/i.test(w));
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "DM";
}

/** "Gary Takacs" → "Gary"; "Dr. Parul Dua Makkar" → "Dr. Makkar";
 *  companies keep their full name. */
function shortNameOf(ctx: RefContext): string {
  if (ctx.kind === "team") return "the team";
  if (ctx.kind === "partner") return ctx.name;
  const base = (ctx.name.split(",")[0] ?? ctx.name).trim();
  const parts = base.split(/\s+/);
  if (/^dr\.?$/i.test(parts[0] ?? "")) return `Dr. ${parts[parts.length - 1]}`;
  return parts[0] ?? base;
}

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
export type SignupPrefill = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  practiceName: string | null;
};

export default function MemberSignupFlow({
  refCtx = null,
  prefill = null,
}: {
  refCtx?: RefContext | null;
  prefill?: SignupPrefill | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 (a ?resume= welcome-back visit arrives with saved details)
  const [firstName, setFirstName] = useState(prefill?.firstName ?? "");
  const [lastName, setLastName] = useState(prefill?.lastName ?? "");
  const [email, setEmail] = useState(prefill?.email ?? params.get("email") ?? "");
  // Step 2
  const [roleLabel, setRoleLabel] = useState("");
  const [roleLabelOther, setRoleLabelOther] = useState("");
  const [practiceName, setPracticeName] = useState(prefill?.practiceName ?? "");
  const [locations, setLocations] = useState("");
  const [phone, setPhone] = useState("");
  // Step 3
  const [challenge, setChallenge] = useState("");
  const [challengeOther, setChallengeOther] = useState("");
  const [heardAbout, setHeardAbout] = useState("");
  const [heardAboutOther, setHeardAboutOther] = useState("");
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
    return (
      agreed &&
      (challenge !== OTHER || challengeOther.trim() !== "") &&
      (heardAbout !== OTHER || heardAboutOther.trim() !== "")
    );
  }, [step, firstName, lastName, emailOk, practiceName, roleLabel, roleLabelOther, agreed, challenge, challengeOther, heardAbout, heardAboutOther]);

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
            heard_about: resolveOther(heardAbout, heardAboutOther),
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
      // GA4 key event: account created (marks the top of the paid funnel).
      trackEvent("sign_up", { method: params.get("ref") ? "referral" : "organic" });
      // Carry context through to /upgrade: an annual pre-selection (from
      // /pricing) for the billing toggle, and the referral code so the
      // owner's promo auto-applies on the payment card.
      const next = data?.next ?? "/upgrade";
      const carry = new URLSearchParams();
      if (params.get("interval") === "annual") carry.set("interval", "annual");
      const ref = params.get("ref");
      if (ref) carry.set("ref", ref);
      // Direct promo links (/reshani, the exit-intent offer) ride a
      // ?promo=CODE param the same way referrals ride ?ref=.
      const promo = params.get("promo");
      if (promo && /^[A-Za-z0-9-]{3,20}$/.test(promo)) carry.set("promo", promo);
      // Welcome-back links: the resume token rides through so the payment
      // card applies the month-free code server-side at checkout.
      const resume = params.get("resume");
      if (resume && /^[A-Za-z0-9_-]{16,64}$/.test(resume)) carry.set("resume", resume);
      router.push(
        carry.size > 0 ? `${next}${next.includes("?") ? "&" : "?"}${carry.toString()}` : next,
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

      <Container
        maxWidth={refCtx ? "lg" : "sm"}
        sx={{ flex: 1, display: "flex", flexDirection: "column", py: { xs: 4, md: 7 } }}
      >
        <Box
          sx={
            refCtx
              ? {
                  // Referred desktop: two columns — invitation rail left,
                  // form card right. Mobile stacks (rail hidden; the
                  // step-0 header + slim strip carry the invitation).
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "minmax(0, 0.95fr) minmax(0, 1.05fr)" },
                  gap: { xs: 0, md: 7 },
                  alignItems: "start",
                  maxWidth: { xs: 460, md: "none" },
                  width: "100%",
                  mx: "auto",
                  flex: 1,
                }
              : { maxWidth: 460, width: "100%", mx: "auto", flex: 1 }
          }
        >
          {/* Desktop invitation rail — persistent through all steps */}
          {refCtx && (
            <Box sx={{ display: { xs: "none", md: "block" }, position: "sticky", top: 32 }}>
              <InvitationHeader ctx={refCtx} />
            </Box>
          )}

          <Box sx={{ minWidth: 0 }}>
            {/* Mobile: full invitation header on step 1, then a slim
                reminder strip while they complete the form. */}
            {refCtx && step === 0 && (
              <Box sx={{ display: { xs: "block", md: "none" } }}>
                <InvitationHeader ctx={refCtx} />
              </Box>
            )}
            {refCtx && step > 0 && (
              <Stack
                direction="row"
                spacing={1.25}
                sx={{
                  display: { xs: "flex", md: "none" },
                  alignItems: "center",
                  mb: 3,
                  px: 1.75,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E6DDCF",
                }}
              >
                <RefAvatar ctx={refCtx} size={26} />
                <Typography sx={{ fontSize: "0.8rem", color: "#3B4A55", fontWeight: 600 }}>
                  {refCtx.kind === "team" ? "Your welcome gift" : `Invited by ${refCtx.name}`}
                  {refCtx.offerActive && (
                    <Box component="span" sx={{ color: "#9B7B3A", fontWeight: 700 }}>
                      {" "}· {refCtx.offerMonths} month{refCtx.offerMonths === 1 ? "" : "s"} free, applied at checkout
                    </Box>
                  )}
                </Typography>
              </Stack>
            )}

            {/* On referred desktop the form sits in a white card, matching
                the invitation mock; mobile + organic stay flush on paper. */}
            <Box
              sx={
                refCtx
                  ? {
                      bgcolor: { xs: "transparent", md: "#FFFFFF" },
                      border: { xs: "none", md: "1px solid #E6DDCF" },
                      borderRadius: { xs: 0, md: 3 },
                      p: { xs: 0, md: 3.5 },
                      boxShadow: { xs: "none", md: "0 18px 40px -30px rgba(10,26,47,0.25)" },
                    }
                  : undefined
              }
            >
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
                  <TextField select label="How did you hear about us?" value={heardAbout} onChange={(e) => setHeardAbout(e.target.value)} fullWidth sx={fieldSx}>
                    {heardAboutOptions.map((o) => (
                      <MenuItem key={o} value={o}>{o}</MenuItem>
                    ))}
                  </TextField>
                  {heardAbout === OTHER && (
                    <TextField label="Tell us where you heard about us" value={heardAboutOther} onChange={(e) => setHeardAboutOther(e.target.value)} placeholder="e.g. A study club, a Facebook group…" fullWidth required sx={fieldSx} />
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
              {refCtx?.offerActive && (
                <Typography sx={{ mt: step === 0 ? 0.75 : 2.5, fontSize: "0.8rem", color: "#7A8590", textAlign: "center" }}>
                  You&apos;ll review {shortNameOf(refCtx)}&apos;s offer before entering any payment information.
                </Typography>
              )}
            </MotionBox>
          </AnimatePresence>
            </Box>
          </Box>
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

/** Avatar for the referring expert (headshot) or partner (logo), with an
 *  initials fallback. Plain <img> — these are user-supplied URLs, so we
 *  deliberately skip the Next image optimizer. */
function RefAvatar({ ctx, size }: { ctx: RefContext; size: number }) {
  if (ctx.imageUrl) {
    return (
      <Box
        component="img"
        src={ctx.imageUrl}
        alt={ctx.name}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: ctx.kind === "expert" ? "cover" : "contain",
          objectPosition: "center top",
          bgcolor: "#FFFFFF",
          border: "1px solid #E6DDCF",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: "rgba(217,168,75,0.18)",
        border: "1px solid rgba(217,168,75,0.5)",
        color: "#9B7B3A",
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.38,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {initialsOf(ctx.name)}
    </Box>
  );
}

/** The personalized invitation block shown above step 1 when someone
 *  arrives through a referral link. The "months free" promise renders
 *  ONLY while the owner's promo code is actually active. */
function InvitationHeader({ ctx }: { ctx: RefContext }) {
  const short = shortNameOf(ctx);
  const benefits = [
    { icon: MessageCircle, title: "Get practical answers", sub: "The expert hotline — a written answer within 2 to 3 working days." },
    { icon: Search, title: "Find trusted help", sub: "The expert directory and the company directory, curated by the team." },
    { icon: Tag, title: "Access member savings", sub: "Member-only offers from vetted partner companies." },
    { icon: BookOpen, title: "Done-for-you resources", sub: "A growing library of kits — action guide, checklist, worksheet, video." },
  ];
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{ color: "#9B7B3A", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", mb: 1 }}
      >
        {ctx.kind === "team" ? "Your invitation" : `${ctx.name} invitation`}
      </Typography>
      <Typography
        component="p"
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: { xs: "1.7rem", md: "2rem" },
          fontWeight: 500,
          color: "#0A1A2F",
          letterSpacing: "-0.02em",
          lineHeight: 1.12,
          mb: 2,
        }}
      >
        {ctx.offerActive
          ? `${ctx.offerMonths} month${ctx.offerMonths === 1 ? "" : "s"} free for your practice.`
          : "You've been personally invited."}
      </Typography>
      <Typography sx={{ fontSize: "0.92rem", color: "#5C6770", lineHeight: 1.6, mb: 2.5, mt: -1 }}>
        One place to find practical answers, trusted resources, and the right expert when your
        practice is stuck.
      </Typography>

      {/* Recommended-by card */}
      <Stack
        direction="row"
        spacing={1.75}
        sx={{
          alignItems: "center",
          p: 2,
          borderRadius: 2.5,
          bgcolor: "#FFFFFF",
          border: "1px solid #E6DDCF",
          mb: ctx.offerActive ? 1.5 : 2.5,
        }}
      >
        <RefAvatar ctx={ctx} size={52} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0A1A2F", lineHeight: 1.3 }}>
            {ctx.kind === "team" ? "A gift from the Dental Member Network team" : `Recommended by ${ctx.name}`}
          </Typography>
          {ctx.tagline && (
            <Typography sx={{ fontSize: "0.82rem", color: "#5C6770", mt: 0.25 }} noWrap>
              {ctx.tagline}
            </Typography>
          )}
          {ctx.pairedName && (
            <Typography sx={{ fontSize: "0.8rem", color: "#9B7B3A", fontWeight: 700, mt: 0.25 }} noWrap>
              {ctx.kind === "expert" ? ctx.pairedName : `with ${ctx.pairedName}`}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Offer recognition note — only while the code is live */}
      {ctx.offerActive && (
        <Box
          sx={{
            borderLeft: "3px solid #D9A84B",
            bgcolor: "rgba(217,168,75,0.08)",
            borderRadius: "0 10px 10px 0",
            px: 2,
            py: 1.5,
            mb: 2.5,
          }}
        >
          <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0A1A2F", mb: 0.25 }}>
            Your invitation is recognized.
          </Typography>
          <Typography sx={{ fontSize: "0.84rem", color: "#3B4A55", lineHeight: 1.55 }}>
            Complete your details first — {short === "the team" ? "your" : `${short}’s`} {ctx.offerMonths}-month-free offer is applied
            automatically and shown before you choose a plan.
          </Typography>
        </Box>
      )}

      {/* What membership includes */}
      <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0A1A2F", mb: 1.25 }}>
        Everything your practice can use
      </Typography>
      <Stack spacing={1.25} sx={{ mb: 2 }}>
        {benefits.map(({ icon: Icon, title, sub }) => (
          <Stack key={title} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: "rgba(217,168,75,0.12)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                mt: 0.2,
              }}
            >
              <Icon size={14} color="#9B7B3A" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#0A1A2F", lineHeight: 1.35 }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#5C6770", lineHeight: 1.5 }}>{sub}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
      <Box
        component={Link}
        href="/#tour"
        target="_blank"
        rel="noopener"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          fontSize: "0.84rem",
          fontWeight: 700,
          color: "#9B7B3A",
          textDecoration: "none",
          borderBottom: "1px dashed rgba(155,123,58,0.5)",
          pb: "1px",
          mb: 1,
          "&:hover": { color: "#0A1A2F" },
        }}
      >
        <Play size={13} />
        See what membership includes — watch the 2-minute tour
      </Box>
    </Box>
  );
}
