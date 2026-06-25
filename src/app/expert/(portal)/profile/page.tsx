"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";
const EXPERT_GREEN_TINT = "#E8F2EC";
const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const LINE = "#E6DDCF";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  display_name: string | null;
  phone: string | null;
  company_name: string | null;
  specialty: string;
  bio: string | null;
  topics: string | null;
  website: string | null;
  booking_link: string | null;
  headshot_url: string | null;
  status: string;
  activated_at: string | null;
};

type FormState = {
  display_name: string;
  phone: string;
  company_name: string;
  specialty: string;
  bio: string;
  topics: string;
  website: string;
  booking_link: string;
  headshot_url: string;
};

const EMPTY_FORM: FormState = {
  display_name: "",
  phone: "",
  company_name: "",
  specialty: "",
  bio: "",
  topics: "",
  website: "",
  booking_link: "",
  headshot_url: "",
};

function profileToForm(p: Profile): FormState {
  return {
    display_name: p.display_name ?? "",
    phone: p.phone ?? "",
    company_name: p.company_name ?? "",
    specialty: p.specialty ?? "",
    bio: p.bio ?? "",
    topics: p.topics ?? "",
    website: p.website ?? "",
    booking_link: p.booking_link ?? "",
    headshot_url: p.headshot_url ?? "",
  };
}

export default function ExpertProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expert/profile", { cache: "no-store" });
      const body = (await res.json()) as { expert?: Profile; error?: string };
      if (!res.ok || !body.expert) {
        setError(body.error ?? `Failed to load (${res.status})`);
        return;
      }
      setProfile(body.expert);
      setForm(profileToForm(body.expert));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty =
    profile !== null &&
    Object.entries(form).some(([k, v]) => {
      const original = (profile as unknown as Record<string, string | null>)[k];
      return (original ?? "") !== v;
    });

  const onSave = async () => {
    if (!dirty) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/expert/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string; expert?: Profile };
      if (!res.ok || !body.ok) {
        setError(body.error ?? `Save failed (${res.status})`);
        return;
      }
      setToast("Profile saved.");
      // Re-fetch to get the freshest snapshot including server-side trimming.
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 12 }}>
        <CircularProgress size={32} sx={{ color: EXPERT_GREEN }} />
      </Stack>
    );
  }

  if (!profile) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <Alert severity="error">{error ?? "Could not load your profile."}</Alert>
      </Stack>
    );
  }

  const displayInitials = (form.display_name || profile.full_name || "EX")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Stack spacing={4} sx={{ maxWidth: 880, mx: "auto" }}>
      {/* Header */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: EXPERT_GREEN_DARK,
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Public profile
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.9rem", md: "2.4rem" },
            fontWeight: 500,
            color: INK,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            mb: 1,
          }}
        >
          How members see you
        </Typography>
        <Typography sx={{ color: INK_SOFT, fontSize: "0.98rem", lineHeight: 1.55, maxWidth: 620 }}>
          Your bio, headshot, and links appear in the member directory and on every resource you publish. Keep it tight, specific, and human.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Preview card — left-aligned, shows what members will see */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: `1px solid ${LINE}`,
          bgcolor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 24px 60px -36px rgba(14,42,61,0.18)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: { sm: "flex-start" } }}
        >
          <Avatar
            src={form.headshot_url || undefined}
            sx={{
              width: 96,
              height: 96,
              bgcolor: EXPERT_GREEN_TINT,
              color: EXPERT_GREEN,
              fontSize: "1.7rem",
              fontWeight: 700,
              border: `1px solid ${EXPERT_GREEN}33`,
              flexShrink: 0,
            }}
          >
            {displayInitials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75, flexWrap: "wrap" }}>
              <Chip
                label="Preview"
                size="small"
                sx={{
                  bgcolor: EXPERT_GREEN_TINT,
                  color: EXPERT_GREEN_DARK,
                  fontSize: "0.66rem",
                  height: 20,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  "& .MuiChip-label": { px: 0.85 },
                }}
              />
              <Typography sx={{ fontSize: "0.78rem", color: INK_MUTED }}>
                {profile.email}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 500,
                color: INK,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                mb: 0.25,
              }}
            >
              {form.display_name || profile.full_name}
            </Typography>
            {form.specialty && (
              <Typography sx={{ color: INK_SOFT, fontSize: "0.95rem", mb: 1.25 }}>
                {form.specialty}
              </Typography>
            )}
            {form.bio && (
              <Typography
                sx={{ color: INK_SOFT, fontSize: "0.92rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}
              >
                {form.bio}
              </Typography>
            )}
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.75, flexWrap: "wrap", gap: 1 }}>
              {form.website && (
                <PreviewLink href={form.website} label="Website" />
              )}
              {form.booking_link && (
                <PreviewLink href={form.booking_link} label="Book a meeting" emphasized />
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Edit form */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: `1px solid ${LINE}`,
          bgcolor: "rgba(255,255,255,0.7)",
        }}
      >
        <Stack spacing={3}>
          <FieldGroup title="Identity">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Display name"
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                placeholder={profile.full_name}
                helperText="Shown in the member directory. Defaults to your full name."
                fullWidth
              />
              <TextField
                label="Company / brand"
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="e.g. Takacs Learning Center"
                fullWidth
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Phone (optional, never shown publicly)"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 010-1234"
                fullWidth
              />
              <TextField
                label="Headshot URL"
                value={form.headshot_url}
                onChange={(e) => setForm((f) => ({ ...f, headshot_url: e.target.value }))}
                placeholder="https://..."
                helperText="Paste a public image URL. Direct upload comes later."
                fullWidth
              />
            </Box>
          </FieldGroup>

          <FieldGroup title="What you teach">
            <TextField
              label="Specialty (required)"
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
              placeholder="e.g. Practice growth and PPO renegotiation"
              required
              fullWidth
            />
            <TextField
              label="Bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="2–4 sentences. Who you serve, your unique angle, why dentists trust your work."
              multiline
              minRows={4}
              fullWidth
            />
            <TextField
              label="Topics you cover (one per line)"
              value={form.topics}
              onChange={(e) => setForm((f) => ({ ...f, topics: e.target.value }))}
              placeholder={"How to negotiate better PPO fees\nMorning huddle playbook\nHiring & onboarding"}
              multiline
              minRows={4}
              fullWidth
            />
          </FieldGroup>

          <FieldGroup title="Links">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                label="Website"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://yourcoaching.com"
                fullWidth
              />
              <TextField
                label="Booking link"
                value={form.booking_link}
                onChange={(e) => setForm((f) => ({ ...f, booking_link: e.target.value }))}
                placeholder="https://cal.com/you/intro"
                helperText="Members tap this to book a meeting with you."
                fullWidth
              />
            </Box>
          </FieldGroup>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.5}
            sx={{ justifyContent: "flex-end", pt: 1 }}
          >
            <Button
              variant="text"
              startIcon={<RestartAltOutlinedIcon />}
              onClick={() => setForm(profileToForm(profile))}
              disabled={!dirty || saving}
              sx={{ color: INK_SOFT, fontWeight: 600 }}
            >
              Reset changes
            </Button>
            <Button
              variant="contained"
              onClick={onSave}
              disabled={!dirty || saving}
              startIcon={
                saving ? <CircularProgress size={14} sx={{ color: "#FFFFFF" }} /> : <SaveOutlinedIcon />
              }
              sx={{
                borderRadius: 999,
                px: 3,
                bgcolor: EXPERT_GREEN,
                color: "#FFFFFF",
                backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                "&:hover": {
                  bgcolor: EXPERT_GREEN_DARK,
                  backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                },
              }}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        message={toast ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Stack>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.16em",
          color: INK_MUTED,
          textTransform: "uppercase",
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}

function PreviewLink({
  href,
  label,
  emphasized,
}: {
  href: string;
  label: string;
  emphasized?: boolean;
}) {
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.5,
        py: 0.6,
        borderRadius: "999px",
        fontSize: "0.78rem",
        fontWeight: 700,
        textDecoration: "none",
        bgcolor: emphasized ? EXPERT_GREEN : "rgba(14,42,61,0.06)",
        color: emphasized ? "#FFFFFF" : INK_SOFT,
        transition: "transform 180ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
        },
      }}
    >
      {label}
      <OpenInNewRoundedIcon sx={{ fontSize: 12 }} />
    </Box>
  );
}
