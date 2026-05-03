"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  member,
  subscription,
  planTiers,
  invoices,
  paymentMethod,
  billingAddress,
  type PlanTier,
  type Invoice,
} from "@/lib/memberData";

type TabKey = "profile" | "subscription" | "billing";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: PersonOutlineOutlinedIcon },
  { key: "subscription", label: "Subscription", icon: WorkspacePremiumOutlinedIcon },
  { key: "billing", label: "Billing", icon: ReceiptLongOutlinedIcon },
];

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageInner />
    </Suspense>
  );
}

function AccountPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initialTab = (params.get("tab") as TabKey) || "profile";
  const [tab, setTab] = useState<TabKey>(
    TABS.some((t) => t.key === initialTab) ? initialTab : "profile",
  );

  useEffect(() => {
    const newTab = (params.get("tab") as TabKey) || "profile";
    if (TABS.some((t) => t.key === newTab) && newTab !== tab) {
      setTab(newTab);
    }
  }, [params, tab]);

  const onTabChange = (next: TabKey) => {
    setTab(next);
    const url = next === "profile" ? "/dashboard/account" : `/dashboard/account?tab=${next}`;
    router.replace(url, { scroll: false });
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          ACCOUNT
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1 }}>
          Manage your account
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 720 }}>
          Update your profile, change your subscription tier, and view past invoices in one place.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => onTabChange(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": { backgroundColor: "secondary.main", height: 3, borderRadius: 999 },
          }}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <Tab
                key={t.key}
                value={t.key}
                label={
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Icon sx={{ fontSize: 18 }} /> {t.label}
                  </Stack>
                }
              />
            );
          })}
        </Tabs>
      </Box>

      {tab === "profile" && <ProfilePanel />}
      {tab === "subscription" && <SubscriptionPanel />}
      {tab === "billing" && <BillingPanel />}
    </Stack>
  );
}

/* -------------------------------- Profile -------------------------------- */

function ProfilePanel() {
  const { user, isLoaded } = useUser();

  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [credential, setCredential] = useState(member.credential);
  const [phone, setPhone] = useState(member.phone);
  const [practice, setPractice] = useState(member.practice);
  const [practiceRole, setPracticeRole] = useState(member.practiceRole);
  const [city, setCity] = useState(member.city);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hydrate from Clerk once it loads.
  useEffect(() => {
    if (!isLoaded || !user) return;
    if (user.firstName) setFirstName(user.firstName);
    if (user.lastName) setLastName(user.lastName);
    const meta = (user.unsafeMetadata ?? {}) as Record<string, string | undefined>;
    if (meta.credential) setCredential(meta.credential);
    if (meta.phone) setPhone(meta.phone);
    if (meta.practice) setPractice(meta.practice);
    if (meta.practiceRole) setPracticeRole(meta.practiceRole);
    if (meta.city) setCity(meta.city);
  }, [isLoaded, user]);

  const email = user?.primaryEmailAddress?.emailAddress ?? member.email;
  const avatarInitials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  const onSave = async () => {
    setSaveState("saving");
    setErrorMsg(null);
    try {
      if (user) {
        await user.update({
          firstName,
          lastName,
          unsafeMetadata: {
            ...(user.unsafeMetadata ?? {}),
            credential,
            phone,
            practice,
            practiceRole,
            city,
          },
        });
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2400);
    } catch (e) {
      setSaveState("error");
      setErrorMsg(e instanceof Error ? e.message : "Could not save changes.");
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Identity card */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Box
          sx={{
            p: 3,
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "common.white",
            position: "sticky",
            top: 88,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                backgroundImage: "linear-gradient(135deg, #1B4258 0%, #06182A 100%)",
                display: "grid",
                placeItems: "center",
                color: "common.white",
                fontFamily: "var(--font-display)",
                fontSize: "2.2rem",
                fontWeight: 600,
                boxShadow: "0 24px 40px -16px rgba(14,42,61,0.4)",
              }}
            >
              {avatarInitials || member.avatarInitials}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontSize: "1.1rem" }}>
                Dr. {firstName} {lastName}
                {credential ? `, ${credential}` : ""}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {email}
              </Typography>
            </Box>
            <Chip
              icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />}
              label={member.tier}
              size="small"
              sx={{
                bgcolor: "rgba(217,168,75,0.14)",
                color: "#A07823",
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 26,
                "& .MuiChip-icon": { color: "#A07823" },
              }}
            />
            <Box sx={{ width: "100%", pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.75 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                  Member since
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                  {member.memberSince}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.75 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                  Practice
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", maxWidth: 160, textAlign: "right" }} noWrap>
                  {practice}
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.75 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                  Location
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{city}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Grid>

      {/* Editable form */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={3}>
          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: "20px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "common.white",
            }}
          >
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
              <Box>
                <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
                  PERSONAL DETAILS
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.25, fontSize: "1.4rem" }}>
                  Edit your profile
                </Typography>
              </Box>
              <Tooltip title="Edit">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Grid container spacing={2.25}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Credential"
                  placeholder="DDS, DMD, MD"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Email"
                  value={email}
                  disabled
                  helperText="Email changes go through verification — handled separately."
                />
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: "20px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "common.white",
            }}
          >
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
              PRACTICE DETAILS
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.25, fontSize: "1.4rem", mb: 2.5 }}>
              Where you operate
            </Typography>
            <Grid container spacing={2.25}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Practice name"
                  value={practice}
                  onChange={(e) => setPractice(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Role"
                  value={practiceRole}
                  onChange={(e) => setPracticeRole(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="City, State"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          {saveState === "saved" && (
            <Alert severity="success" icon={<CheckCircleOutlinedIcon />} sx={{ borderRadius: "14px" }}>
              Profile saved.
            </Alert>
          )}
          {saveState === "error" && (
            <Alert severity="error" sx={{ borderRadius: "14px" }}>
              {errorMsg ?? "Could not save changes."}
            </Alert>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "flex-end" }}>
            <Button variant="text" color="primary" disabled={saveState === "saving"}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onSave}
              disabled={saveState === "saving" || !isLoaded}
              endIcon={saveState === "saved" ? <CheckCircleOutlinedIcon /> : <ArrowForwardIcon />}
            >
              {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Saved"
                  : "Save changes"}
            </Button>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}

/* ------------------------------ Subscription ----------------------------- */

function SubscriptionPanel() {
  const current = useMemo(
    () => planTiers.find((p) => p.id === subscription.planId) ?? planTiers[1],
    [],
  );

  return (
    <Stack spacing={4}>
      {/* Current plan hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          p: { xs: 3, md: 4 },
          color: "common.white",
          backgroundImage:
            "linear-gradient(135deg, #06182A 0%, #0E2A3D 50%, #1B4258 100%)",
          boxShadow: "0 32px 64px -36px rgba(6,24,42,0.55)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(45% 45% at 80% 0%, rgba(217,168,75,0.35) 0%, transparent 60%)",
          }}
        />
        <Grid container spacing={3} sx={{ position: "relative", alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Chip
                icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />}
                label="ACTIVE"
                size="small"
                sx={{
                  bgcolor: "rgba(56,176,109,0.18)",
                  color: "#A8E6BD",
                  border: "1px solid rgba(56,176,109,0.35)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  "& .MuiChip-icon": { color: "#A8E6BD" },
                }}
              />
              {subscription.isLifetimeLocked && (
                <Chip
                  icon={<LockOutlinedIcon sx={{ fontSize: 14 }} />}
                  label="LIFETIME LOCK"
                  size="small"
                  sx={{
                    bgcolor: "rgba(217,168,75,0.16)",
                    color: "secondary.light",
                    border: "1px solid rgba(217,168,75,0.35)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    fontWeight: 700,
                    "& .MuiChip-icon": { color: "secondary.light" },
                  }}
                />
              )}
            </Stack>
            <Typography variant="overline" sx={{ color: "secondary.light", display: "block", fontWeight: 700 }}>
              YOUR CURRENT PLAN
            </Typography>
            <Typography variant="h2" sx={{ color: "common.white", fontSize: { xs: "2.25rem", md: "3rem" }, mt: 0.5 }}>
              {current.name}
              <Box component="span" sx={{ color: "secondary.light", fontSize: { xs: "1.5rem", md: "2rem" } }}>
                {" · "}${current.priceMonthly}/mo
              </Box>
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.92)", mt: 1.25, maxWidth: 540, lineHeight: 1.55 }}>
              {current.blurb}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                p: 2.75,
                borderRadius: "16px",
                bgcolor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Stack spacing={1.5}>
                <KvRow label="Started" value={subscription.startedOn} dark />
                <KvRow
                  label="Renews on"
                  value={subscription.renewsOn}
                  detail={`Auto-charge $${subscription.nextChargeAmount} to ${paymentMethod.brand} ···· ${paymentMethod.last4}`}
                  dark
                />
                <KvRow label="Billing cycle" value="Monthly" dark />
                <KvRow label="Seats" value={`${subscription.seats}`} dark />
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Upgrade/compare */}
      <Box>
        <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" }, gap: 2, mb: 2.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
              CHANGE PLAN
            </Typography>
            <Typography variant="h4">Upgrade or compare tiers</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 360 }}>
            Your founding rate is locked for life on this product. Upgrading to Pro or Premium
            preserves your $49 founding seat — you only pay the difference.
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {planTiers.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <PlanCard plan={p} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Cancel zone */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "rgba(220, 60, 60, 0.2)",
          bgcolor: "rgba(220, 60, 60, 0.03)",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.5 }}>
              Cancel subscription
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 520 }}>
              You&apos;ll keep access through {subscription.renewsOn}. Your founding rate is{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>permanently lost</Box> if you
              cancel and return — we won&apos;t reopen the founding seat.
            </Typography>
          </Box>
          <Button variant="outlined" color="error" sx={{ flexShrink: 0 }}>
            Cancel plan
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}

function PlanCard({ plan }: { plan: PlanTier }) {
  const isCurrent = !!plan.isCurrent;
  return (
    <Box
      sx={{
        height: "100%",
        p: 2.75,
        borderRadius: "20px",
        border: "1.5px solid",
        borderColor: isCurrent ? "rgba(217,168,75,0.5)" : plan.highlight ? "rgba(217,168,75,0.35)" : "divider",
        bgcolor: isCurrent ? "rgba(255,247,228,0.55)" : "common.white",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms ease, border-color 240ms ease",
        "&:hover": isCurrent
          ? {}
          : {
              transform: "translateY(-3px)",
              borderColor: "rgba(14,42,61,0.3)",
              boxShadow: "0 24px 40px -28px rgba(14,42,61,0.4)",
            },
      }}
    >
      {plan.badge && (
        <Chip
          label={plan.badge}
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: 16,
            bgcolor: "#0E2A3D",
            color: "secondary.light",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            height: 24,
          }}
        />
      )}
      <Typography variant="overline" sx={{ color: "text.secondary", display: "block", fontWeight: 700 }}>
        {plan.name.toUpperCase()}
      </Typography>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline", mt: 0.5, mb: 1.25 }}>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            lineHeight: 1,
            color: "text.primary",
          }}
        >
          ${plan.priceMonthly}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
          {plan.cadenceLabel}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 2, minHeight: 44 }}>
        {plan.blurb}
      </Typography>
      <Stack spacing={0.75} sx={{ mb: 2.5, flex: 1 }}>
        {plan.features.map((f) => (
          <Stack key={f} direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: isCurrent ? "#A07823" : "primary.main", mt: 0.25, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
              {f}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Button
        fullWidth
        variant={isCurrent ? "outlined" : plan.highlight ? "contained" : "contained"}
        color={isCurrent ? "primary" : plan.highlight ? "secondary" : "primary"}
        disabled={isCurrent}
        endIcon={isCurrent ? <CheckCircleOutlinedIcon /> : <ArrowForwardIcon />}
      >
        {plan.ctaLabel}
      </Button>
    </Box>
  );
}

function KvRow({
  label,
  value,
  detail,
  dark,
}: {
  label: string;
  value: string;
  detail?: string;
  dark?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
      <Typography
        variant="body2"
        sx={{
          color: dark ? "rgba(255,255,255,0.78)" : "text.secondary",
          fontSize: "0.82rem",
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ textAlign: "right", minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.88rem",
            color: dark ? "common.white" : "text.primary",
          }}
        >
          {value}
        </Typography>
        {detail && (
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.74rem",
              color: dark ? "rgba(255,255,255,0.7)" : "text.secondary",
              mt: 0.25,
            }}
          >
            {detail}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

/* -------------------------------- Billing -------------------------------- */

function BillingPanel() {
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <Stack spacing={3}>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2.75,
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "common.white",
              height: "100%",
            }}
          >
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.74rem" }}>
                NEXT INVOICE
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "10px",
                  bgcolor: "rgba(14,42,61,0.07)",
                  border: "1px solid rgba(14,42,61,0.18)",
                  display: "grid",
                  placeItems: "center",
                  color: "primary.dark",
                }}
              >
                <AutorenewOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: 1, mb: 0.5 }}>
              ${subscription.nextChargeAmount}.00
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              Auto-charges {paymentMethod.brand} ···· {paymentMethod.last4} on{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>{subscription.renewsOn}</Box>
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2.75,
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "common.white",
              height: "100%",
            }}
          >
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.74rem" }}>
                LIFETIME PAID
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "10px",
                  bgcolor: "rgba(217,168,75,0.14)",
                  border: "1px solid rgba(217,168,75,0.32)",
                  display: "grid",
                  placeItems: "center",
                  color: "#A07823",
                }}
              >
                <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Stack>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", lineHeight: 1, mb: 0.5 }}>
              ${totalPaid.toLocaleString()}.00
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              Across {invoices.filter((i) => i.status === "paid").length} successful payments
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Payment method */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
              PAYMENT METHOD
            </Typography>
            <Typography variant="h4" sx={{ fontSize: "1.35rem", mt: 0.25 }}>
              On file
            </Typography>
          </Box>
          <Button variant="outlined" color="primary" size="small" startIcon={<EditOutlinedIcon />}>
            Update card
          </Button>
        </Stack>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: "16px",
                color: "common.white",
                backgroundImage: "linear-gradient(135deg, #1B4258 0%, #06182A 100%)",
                position: "relative",
                overflow: "hidden",
                aspectRatio: "1.6 / 1",
                maxWidth: 340,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 24px 40px -16px rgba(14,42,61,0.5)",
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(50% 50% at 100% 0%, rgba(217,168,75,0.3) 0%, transparent 60%)",
                }}
              />
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                <CreditCardOutlinedIcon sx={{ fontSize: 28, color: "secondary.light" }} />
                <Typography sx={{ fontFamily: "var(--font-display)", color: "common.white", fontSize: "1.15rem", letterSpacing: "0.04em" }}>
                  {paymentMethod.brand}
                </Typography>
              </Stack>
              <Box sx={{ position: "relative" }}>
                <Typography
                  sx={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "1.15rem",
                    color: "common.white",
                    letterSpacing: "0.18em",
                    mb: 1.25,
                  }}
                >
                  •••• •••• •••• {paymentMethod.last4}
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.14em", fontWeight: 700 }}>
                      HOLDER
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "common.white" }}>
                      {paymentMethod.holderName.toUpperCase()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.14em", fontWeight: 700 }}>
                      EXPIRES
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "common.white" }}>
                      {String(paymentMethod.expMonth).padStart(2, "0")} / {String(paymentMethod.expYear).slice(-2)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1.5}>
              <Typography variant="overline" sx={{ color: "text.secondary", display: "block", fontWeight: 700 }}>
                BILLING ADDRESS
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "grey.50",
                }}
              >
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, lineHeight: 1.6 }}>
                  {member.firstName} {member.lastName}
                  <br />
                  {billingAddress.line1}
                  <br />
                  {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                  <br />
                  {billingAddress.country}
                </Typography>
              </Box>
              <Button variant="text" color="primary" startIcon={<EditOutlinedIcon />} sx={{ alignSelf: "flex-start", ml: -1 }}>
                Edit billing address
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Invoices */}
      <Box
        sx={{
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 2.5, md: 3 }, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            INVOICES
          </Typography>
          <Typography variant="h4" sx={{ fontSize: "1.4rem", mt: 0.25 }}>
            Your billing history
          </Typography>
        </Box>
        <Box>
          {/* Header row */}
          <Box
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.8fr 0.5fr",
              alignItems: "center",
              gap: 2,
              px: 3,
              py: 1.25,
              bgcolor: "grey.50",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Cell head>Description</Cell>
            <Cell head>Invoice #</Cell>
            <Cell head>Date</Cell>
            <Cell head>Amount</Cell>
            <Cell head>Status</Cell>
            <Box />
          </Box>
          {invoices.map((inv, i) => (
            <InvoiceRow key={inv.id} invoice={inv} isLast={i === invoices.length - 1} />
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

function Cell({ head, children }: { head?: boolean; children?: React.ReactNode }) {
  return (
    <Typography
      variant={head ? "body2" : "body1"}
      sx={{
        fontSize: head ? "0.7rem" : "0.9rem",
        fontWeight: head ? 700 : 500,
        letterSpacing: head ? "0.06em" : 0,
        textTransform: head ? "uppercase" : "none",
        color: head ? "text.secondary" : "text.primary",
      }}
    >
      {children}
    </Typography>
  );
}

function InvoiceRow({ invoice, isLast }: { invoice: Invoice; isLast: boolean }) {
  const statusStyles: Record<Invoice["status"], { bg: string; color: string; label: string }> = {
    paid: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Paid" },
    pending: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "Pending" },
    failed: { bg: "rgba(220,60,60,0.12)", color: "#8C1D1D", label: "Failed" },
    refunded: { bg: "rgba(14,42,61,0.08)", color: "#0E2A3D", label: "Refunded" },
  };
  const s = statusStyles[invoice.status];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr auto", md: "1.4fr 1fr 1fr 1fr 0.8fr 0.5fr" },
        alignItems: "center",
        gap: { xs: 1, md: 2 },
        px: { xs: 2.5, md: 3 },
        py: 2,
        borderBottom: isLast ? 0 : "1px solid",
        borderColor: "divider",
        transition: "background-color 160ms ease",
        "&:hover": { bgcolor: "grey.50" },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }} noWrap>
          {invoice.description}
        </Typography>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", mt: 0.5, color: "text.secondary" }}
        >
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            {invoice.date}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            ·
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.primary" }}>
            ${invoice.amount}.00
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            ·
          </Typography>
          <Chip
            label={s.label}
            size="small"
            sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.66rem", height: 20 }}
          />
        </Stack>
      </Box>
      <Cell>
        <Box
          component="span"
          sx={{
            display: { xs: "none", md: "inline" },
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.82rem",
            color: "text.secondary",
          }}
        >
          {invoice.number}
        </Box>
      </Cell>
      <Cell>
        <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
          {invoice.date}
        </Box>
      </Cell>
      <Cell>
        <Box component="span" sx={{ display: { xs: "none", md: "inline" }, fontWeight: 600 }}>
          ${invoice.amount}.00
        </Box>
      </Cell>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Chip
          label={s.label}
          size="small"
          sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.7rem", height: 24 }}
        />
      </Box>
      <Tooltip title="Download invoice (PDF)">
        <IconButton size="small" sx={{ color: "text.secondary", justifySelf: "end" }}>
          <DownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
