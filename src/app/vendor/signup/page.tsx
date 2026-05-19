"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import Logo from "@/components/brand/Logo";
import {
  vendorAgreementKeyTerms,
  vendorAgreementMeta,
  vendorAgreementSections,
  vendorCategories,
  vendorCommitments,
  vendorFeeSchedule,
  vendorPlans,
  type VendorPlanId,
} from "@/lib/vendorData";

const STEPS = ["Company", "Commitments", "Plan", "Agreement", "Review"];

type Form = {
  companyName: string;
  website: string;
  category: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  // Commitment #1, member discount
  offerTitle: string;
  offerDiscount: string;
  offerMechanic: "promo_code" | "affiliate_link" | "portal_redemption" | "manual_verification";
  offerCode: string;
  offerTerms: string;
  // Commitment #3, calendar booking link
  calendarLink: string;
  // Commitment #2, hotline notifications email
  hotlineEmail: string;
  planId: VendorPlanId;
  // Dual acceptance checkboxes
  agreedToTerms: boolean;
  confirmedAuthority: boolean;
  signatureName: string;
  signatureTitle: string;
};

const empty: Form = {
  companyName: "",
  website: "",
  category: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  description: "",
  offerTitle: "",
  offerDiscount: "",
  offerMechanic: "promo_code",
  offerCode: "",
  offerTerms: "",
  calendarLink: "",
  hotlineEmail: "",
  planId: "founding",
  agreedToTerms: false,
  confirmedAuthority: false,
  signatureName: "",
  signatureTitle: "",
};

export default function VendorSignupPage() {
  return (
    <Suspense fallback={null}>
      <VendorSignupInner />
    </Suspense>
  );
}

function VendorSignupInner() {
  const params = useSearchParams();
  const initialPlan = (params.get("plan") as VendorPlanId) || "founding";
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<Form>(() => ({ ...empty, planId: initialPlan }));

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const canContinue = useMemo(() => {
    if (step === 0)
      return Boolean(
        form.companyName.trim() &&
          form.category &&
          form.website.trim() &&
          form.contactName.trim() &&
          form.contactEmail.trim() &&
          form.description.trim().length >= 20,
      );
    if (step === 1)
      return Boolean(
        form.offerTitle.trim() &&
          form.offerDiscount.trim() &&
          form.offerTerms.trim() &&
          form.calendarLink.trim() &&
          form.hotlineEmail.trim(),
      );
    if (step === 2) return Boolean(form.planId);
    if (step === 3)
      return (
        form.agreedToTerms &&
        form.confirmedAuthority &&
        Boolean(form.signatureName.trim() && form.signatureTitle.trim())
      );
    return true;
  }, [step, form]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/vendor/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
      } else if (res.status === 409) {
        setSubmitError(
          "An invitation has already been sent to this email. Check your inbox or use a different email.",
        );
      } else {
        setSubmitError(data?.error ?? "Something went wrong. Please try again or contact partner@thrivingdentist.com.");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlan = vendorPlans.find((p) => p.id === form.planId)!;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Top bar */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <Container maxWidth="lg">
          <Stack direction="row" sx={{ py: 2, justifyContent: "space-between", alignItems: "center" }}>
            <Logo href="/" height={30} showSubline={false} />
            <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
              <Box component={Link} href="/partners" sx={{ fontSize: "0.85rem", color: "text.secondary", textDecoration: "none", display: { xs: "none", sm: "inline-flex" }, alignItems: "center", gap: 0.5, "&:hover": { color: "text.primary" } }}>
                <ArrowBackIcon sx={{ fontSize: 14 }} /> Back to partners page
              </Box>
              <Box component={Link} href="/vendor/signin" sx={{ fontSize: "0.85rem", fontWeight: 600, color: "primary.main", textDecoration: "none" }}>
                Already a partner? Sign in
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pt: { xs: 4, md: 6 }, pb: 8 }}>
        {/* Page heading */}
        <Stack spacing={1.5} sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="overline" sx={{ color: "#A07823", fontWeight: 700, letterSpacing: "0.18em" }}>
            VENDOR PARTNER APPLICATION
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
            Become a Featured Partner
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 560, mx: "auto" }}>
            Five quick steps · about 6 minutes · review by Reshani within 1 business day
          </Typography>
        </Stack>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={submitted ? STEPS.length : step} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Card */}
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "common.white",
            boxShadow: "0 24px 48px -32px rgba(14,42,61,0.18)",
          }}
        >
          {submitted ? (
            <SuccessCard plan={selectedPlan.name} email={form.contactEmail} />
          ) : (
            <>
              {step === 0 && <CompanyStep form={form} set={set} />}
              {step === 1 && <OfferStep form={form} set={set} />}
              {step === 2 && <PlanStep form={form} set={set} />}
              {step === 3 && <AgreementStep form={form} set={set} />}
              {step === 4 && <ReviewStep form={form} />}

              <Stack direction="row" spacing={1.5} sx={{ mt: 4, justifyContent: "space-between", alignItems: "center" }}>
                <Button onClick={back} disabled={step === 0} startIcon={<ArrowBackIcon />} variant="text" color="primary">
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    onClick={next}
                    disabled={!canContinue}
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={submitting}
                    endIcon={<CelebrationOutlinedIcon />}
                  >
                    {submitting ? "Submitting…" : "Submit application"}
                  </Button>
                )}
              </Stack>
              {submitError && (
                <Alert severity="error" sx={{ mt: 2.5, borderRadius: "12px" }} onClose={() => setSubmitError(null)}>
                  {submitError}
                </Alert>
              )}
            </>
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 3, alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
          <LockOutlinedIcon sx={{ fontSize: 14 }} />
          <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
            Your application is encrypted in transit and reviewed only by the TDN partner team.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

/* -------------------------------- Step 1 -------------------------------- */

function CompanyStep({ form, set }: { form: Form; set: <K extends keyof Form>(k: K, v: Form[K]) => void }) {
  return (
    <Stack spacing={3.5}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: "1.4rem", mb: 0.5 }}>
          Tell us about your company
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          This information populates your public Vendor Profile. You can edit it anytime after approval.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            label="Company name"
            placeholder="e.g. Henry Schein Dental"
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Vendor category"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            select
            required
          >
            {vendorCategories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Website"
            placeholder="https://yourcompany.com"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Primary contact name"
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Contact phone"
            placeholder="+1 (555) 555-0100"
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Contact email"
            type="email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
            required
            helperText="We'll create your partner account login with this email."
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Public description"
            placeholder="2–3 sentences members will see in your profile."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            multiline
            rows={3}
            required
            helperText={`${form.description.length} / 240, minimum 20 characters`}
            slotProps={{ htmlInput: { maxLength: 240 } }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

/* -------------------------------- Step 2 -------------------------------- */

function OfferStep({ form, set }: { form: Form; set: <K extends keyof Form>(k: K, v: Form[K]) => void }) {
  return (
    <Stack spacing={3.5}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: "1.4rem", mb: 0.5 }}>
          Your commitments to members
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Three of the five partner commitments are concrete things we need from you: the member discount (#1), the hotline contact (#2), and a calendar booking link (#3).
        </Typography>
      </Box>

      <Box>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1.5 }}>
          <Chip
            label="COMMITMENT 01"
            size="small"
            sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.12em", height: 22 }}
          />
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            Member discount you commit to
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Offer headline"
              placeholder="e.g. 12% off recurring orders"
              value={form.offerTitle}
              onChange={(e) => set("offerTitle", e.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Discount value"
              placeholder="12% off, $500 off, etc."
              value={form.offerDiscount}
              onChange={(e) => set("offerDiscount", e.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Discount mechanic"
              value={form.offerMechanic}
              onChange={(e) => set("offerMechanic", e.target.value as Form["offerMechanic"])}
              select
            >
              <MenuItem value="promo_code">Promo code at checkout</MenuItem>
              <MenuItem value="affiliate_link">Affiliate / referral link</MenuItem>
              <MenuItem value="portal_redemption">Redeemed in member portal</MenuItem>
              <MenuItem value="manual_verification">Manual member verification</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={form.offerMechanic === "affiliate_link" ? "Affiliate URL" : "Promo code (if any)"}
              placeholder={form.offerMechanic === "affiliate_link" ? "https://refer.example.com/?id=tdn" : "TDN-YOURS-12"}
              value={form.offerCode}
              onChange={(e) => set("offerCode", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Terms of the offer"
              placeholder="E.g. 15% off first year, waived $500 setup fee, free month of service…"
              value={form.offerTerms}
              onChange={(e) => set("offerTerms", e.target.value)}
              multiline
              rows={3}
              required
            />
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1.5 }}>
          <Chip
            label="COMMITMENT 02"
            size="small"
            sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.12em", height: 22 }}
          />
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            Hotline notifications
          </Typography>
        </Stack>
        <TextField
          label="Best email for hotline notifications"
          placeholder="Where should we route member inquiries from the partner hotline?"
          type="email"
          value={form.hotlineEmail}
          onChange={(e) => set("hotlineEmail", e.target.value)}
          required
          helperText="One team member at this address should be responsive during business hours."
        />
      </Box>

      <Box>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1.5 }}>
          <Chip
            label="COMMITMENT 03"
            size="small"
            sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.12em", height: 22 }}
          />
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
            Calendar booking link
          </Typography>
        </Stack>
        <TextField
          label="Calendar URL"
          placeholder="https://calendly.com/yourcompany/intro-call"
          type="url"
          value={form.calendarLink}
          onChange={(e) => set("calendarLink", e.target.value)}
          required
          helperText="Calendly, HubSpot, Cal.com, anything, keep it live and respond to bookings within 1 business day."
        />
      </Box>
      <Alert
        severity="info"
        icon={<VerifiedUserOutlinedIcon />}
        sx={{ borderRadius: "12px" }}
      >
        Your offer goes through a quick review by Reshani before it appears in the member rewards page, usually within 24 hours.
      </Alert>
    </Stack>
  );
}

/* -------------------------------- Step 3 -------------------------------- */

function PlanStep({ form, set }: { form: Form; set: <K extends keyof Form>(k: K, v: Form[K]) => void }) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: "1.4rem", mb: 0.5 }}>
          Pick your plan
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Same Featured Partner benefits across all three. You can change plans later, downgrades take effect at the next renewal.
        </Typography>
      </Box>
      <Stack spacing={1.75}>
        {vendorPlans.map((p) => {
          const selected = form.planId === p.id;
          return (
            <Box
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => set("planId", p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  set("planId", p.id);
                }
              }}
              sx={{
                p: 2.5,
                borderRadius: "16px",
                border: "1.5px solid",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "rgba(14,42,61,0.04)" : "common.white",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 2,
                alignItems: "center",
                transition: "all 180ms ease",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: selected ? "primary.main" : "grey.300",
                  bgcolor: selected ? "primary.main" : "transparent",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {selected && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "common.white" }} />}
              </Box>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap", gap: 0.75 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>{p.name}</Typography>
                  {p.badge && (
                    <Chip
                      label={p.badge}
                      size="small"
                      sx={{
                        bgcolor: "#0E2A3D",
                        color: "secondary.light",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        height: 20,
                        letterSpacing: "0.08em",
                      }}
                    />
                  )}
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.86rem", lineHeight: 1.5 }}>
                  {p.blurb}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", lineHeight: 1 }}>
                  {p.priceLabel}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary", maxWidth: 140 }}>
                  {p.cadenceLabel}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

/* -------------------------------- Step 4, Agreement -------------------------------- */

function AgreementStep({ form, set }: { form: Form; set: <K extends keyof Form>(k: K, v: Form[K]) => void }) {
  const bothChecked = form.agreedToTerms && form.confirmedAuthority;
  return (
    <Stack spacing={3.5}>
      <Box>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 0.75 }}>
          <GavelOutlinedIcon sx={{ color: "#A07823" }} />
          <Typography variant="h4" sx={{ fontSize: "1.4rem" }}>
            {vendorAgreementMeta.title}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: "#A07823", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.72rem", mb: 1.25 }}>
          {vendorAgreementMeta.tagline}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
          {vendorAgreementMeta.intro}
        </Typography>
      </Box>

      {/* Key terms band, the headline numbers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" },
          gap: 0,
          borderRadius: "14px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          overflow: "hidden",
        }}
      >
        {vendorAgreementKeyTerms.map((t, i) => (
          <Box
            key={t.label}
            sx={{
              p: 2,
              textAlign: "center",
              borderRight: { sm: i === vendorAgreementKeyTerms.length - 1 ? 0 : "1px solid" },
              borderBottom: { xs: i >= vendorAgreementKeyTerms.length - 2 ? 0 : "1px solid", sm: 0 },
              borderColor: { xs: "divider", sm: "divider" },
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "0.65rem", color: "text.secondary", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>
              {t.label}
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "primary.dark", lineHeight: 1.1, mt: 0.5 }}>
              {t.value}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 0.25 }}>
              {t.sub}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* The five commitments, headline cards */}
      <Box>
        <Typography variant="overline" sx={{ display: "block", color: "primary.main", fontWeight: 700, letterSpacing: "0.18em", mb: 0.5 }}>
          THE FIVE COMMITMENTS
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          These are the only things we hold every vendor in the network to. Everything else is operational detail.
        </Typography>
        <Stack spacing={1.25}>
          {vendorCommitments.map((c) => (
            <Box
              key={c.number}
              sx={{
                p: 2.25,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "common.white",
                display: "grid",
                gridTemplateColumns: "44px 1fr",
                gap: 2,
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "secondary.light",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {c.number}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}>
                  {c.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  {c.body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Fee schedule table */}
      <Box>
        <Typography variant="overline" sx={{ display: "block", color: "text.secondary", fontWeight: 700, letterSpacing: "0.18em", mb: 1 }}>
          FEE SCHEDULE
        </Typography>
        <Box
          sx={{
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.5fr",
              bgcolor: "primary.main",
              color: "common.white",
            }}
          >
            {["Period", "Monthly fee", "Note"].map((h) => (
              <Box key={h} sx={{ p: 1.5, fontSize: "0.68rem", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>
                {h}
              </Box>
            ))}
          </Box>
          {vendorFeeSchedule.map((row, i) => (
            <Box
              key={row.period}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1.5fr",
                bgcolor: "common.white",
                borderTop: i === 0 ? 0 : "1px solid",
                borderColor: "divider",
                alignItems: "center",
              }}
            >
              <Box sx={{ p: 1.75, fontSize: "0.88rem", fontWeight: 600, color: "primary.dark" }}>
                {row.period}
              </Box>
              <Box sx={{ p: 1.75, fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, color: "primary.dark" }}>
                {row.fee}
              </Box>
              <Box sx={{ p: 1.75, fontSize: "0.82rem", color: "text.secondary" }}>
                {row.note}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Scrollable full sections */}
      <Box>
        <Typography variant="overline" sx={{ display: "block", color: "text.secondary", fontWeight: 700, letterSpacing: "0.18em", mb: 1 }}>
          OPERATIONAL & LEGAL TERMS (SECTIONS 01–09)
        </Typography>
        <Box
          sx={{
            maxHeight: 360,
            overflowY: "auto",
            p: 2.5,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Stack spacing={2.25}>
            {vendorAgreementSections.map((s) => (
              <Box key={s.id}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "text.primary", mb: 0.5 }}>
                  {s.number}. {s.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", lineHeight: 1.7 }}>
                  {s.body}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Two click-to-agree checkboxes */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: "14px",
          border: "1.5px solid",
          borderColor: bothChecked ? "rgba(34,108,78,0.4)" : "rgba(217,168,75,0.4)",
          bgcolor: bothChecked ? "rgba(34,108,78,0.04)" : "rgba(217,168,75,0.06)",
        }}
      >
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.agreedToTerms}
                onChange={(e) => set("agreedToTerms", e.target.checked)}
                sx={{ alignSelf: "flex-start", mt: -0.5 }}
              />
            }
            slotProps={{ typography: { sx: { fontSize: "0.92rem", lineHeight: 1.55 } } }}
            label={
              <Typography variant="body2" sx={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                <strong>I have read and agree to the Vendor Network Partnership Agreement above</strong>,
                including the five commitments, the fee schedule ($0 / $49 / $199), the 12-month initial
                term, and the right of Thriving Dentist to update terms on 30 days' notice.
              </Typography>
            }
            sx={{ alignItems: "flex-start", m: 0 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.confirmedAuthority}
                onChange={(e) => set("confirmedAuthority", e.target.checked)}
                sx={{ alignSelf: "flex-start", mt: -0.5 }}
              />
            }
            slotProps={{ typography: { sx: { fontSize: "0.92rem", lineHeight: 1.55 } } }}
            label={
              <Typography variant="body2" sx={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                <strong>I confirm I am authorized to enter this Agreement on behalf of the Vendor</strong>
                {" "}named above, and that my electronic acceptance has the same effect as a written signature.
              </Typography>
            }
            sx={{ alignItems: "flex-start", m: 0 }}
          />
        </Stack>

        <Grid container spacing={2} sx={{ mt: 2, opacity: bothChecked ? 1 : 0.5, transition: "opacity 200ms ease" }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Signing as (full name)"
              placeholder="Marcus Reilly"
              value={form.signatureName}
              onChange={(e) => set("signatureName", e.target.value)}
              disabled={!bothChecked}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Title"
              placeholder="VP Partnerships"
              value={form.signatureTitle}
              onChange={(e) => set("signatureTitle", e.target.value)}
              disabled={!bothChecked}
              required
            />
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}

/* -------------------------------- Step 5, Review -------------------------------- */

function ReviewStep({ form }: { form: Form }) {
  const plan = vendorPlans.find((p) => p.id === form.planId)!;
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: "1.4rem", mb: 0.5 }}>
          Review your application
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Make sure everything looks right. After submission, Reshani reviews within 1 business day.
        </Typography>
      </Box>

      <Section title="Company">
        <KV k="Company name" v={form.companyName} />
        <KV k="Category" v={form.category} />
        <KV k="Website" v={form.website} />
        <KV k="Primary contact" v={`${form.contactName} · ${form.contactEmail}`} />
        {form.contactPhone && <KV k="Phone" v={form.contactPhone} />}
        <KV k="Description" v={form.description} />
      </Section>

      <Section title="Member discount (Commitment 01)">
        <KV k="Headline" v={form.offerTitle} />
        <KV k="Discount" v={form.offerDiscount} />
        <KV
          k="Mechanic"
          v={
            form.offerMechanic === "promo_code"
              ? "Promo code at checkout"
              : form.offerMechanic === "affiliate_link"
                ? "Affiliate link"
                : form.offerMechanic === "portal_redemption"
                  ? "Member portal redemption"
                  : "Manual member verification"
          }
        />
        {form.offerCode && <KV k={form.offerMechanic === "affiliate_link" ? "Affiliate URL" : "Code"} v={form.offerCode} />}
        <KV k="Terms" v={form.offerTerms} />
      </Section>

      <Section title="Hotline notifications (Commitment 02)">
        <KV k="Email" v={form.hotlineEmail} />
      </Section>

      <Section title="Calendar booking link (Commitment 03)">
        <KV k="URL" v={form.calendarLink} />
      </Section>

      <Section title="Plan">
        <KV k="Plan" v={plan.name} />
        <KV k="Pricing" v={`${plan.priceLabel} ${plan.cadenceLabel}`} />
      </Section>

      <Section title="Agreement">
        <KV k="Status" v="Both checkboxes confirmed · click-to-sign accepted" />
        <KV k="Signed by" v={`${form.signatureName} · ${form.signatureTitle}`} />
        <KV k="Version" v={vendorAgreementMeta.version} />
      </Section>
    </Stack>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "grey.50",
      }}
    >
      <Typography variant="overline" sx={{ display: "block", color: "text.secondary", fontWeight: 700, letterSpacing: "0.14em", mb: 1.5 }}>
        {title.toUpperCase()}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem", minWidth: 110, fontWeight: 600 }}>
        {k}
      </Typography>
      <Typography sx={{ fontSize: "0.88rem", color: "text.primary", flex: 1 }}>
        {v}
      </Typography>
    </Stack>
  );
}

/* -------------------------------- Success -------------------------------- */

function SuccessCard({ plan, email }: { plan: string; email: string }) {
  return (
    <Stack spacing={2.5} sx={{ alignItems: "center", textAlign: "center", py: 4 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          bgcolor: "rgba(34,108,78,0.12)",
          border: "1px solid rgba(34,108,78,0.4)",
          color: "success.dark",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CheckCircleOutlinedIcon sx={{ fontSize: 40 }} />
      </Box>
      <Typography variant="h3" sx={{ fontSize: { xs: "1.85rem", md: "2.25rem" } }}>
        Application submitted.
      </Typography>
      <Typography sx={{ color: "text.secondary", maxWidth: 460 }}>
        Welcome to the Thriving Dentist partner program, <strong>{plan}</strong>.
      </Typography>
      <Box
        sx={{
          mt: 1,
          p: 2.5,
          maxWidth: 460,
          width: "100%",
          borderRadius: "14px",
          border: "1px solid rgba(217,168,75,0.32)",
          bgcolor: "rgba(217,168,75,0.06)",
          textAlign: "left",
        }}
      >
        <Typography variant="overline" sx={{ color: "#A07823", display: "block", fontWeight: 700, letterSpacing: "0.14em", mb: 0.75 }}>
          NEXT STEP, CHECK YOUR EMAIL
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.88rem", lineHeight: 1.6 }}>
          We sent a partner sign-in link to <strong>{email}</strong>. Click it to set your
          password and access your partner dashboard. Reshani will review and approve your
          application within 1 business day.
        </Typography>
      </Box>
    </Stack>
  );
}
