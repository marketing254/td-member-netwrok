"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useCurrentMember, type CurrentMember } from "@/lib/hooks/useCurrentMember";

export default function MemberProfilePage() {
  const { member, loading } = useCurrentMember();
  const [form, setForm] = useState<Partial<CurrentMember>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) setForm(member);
  }, [member]);

  const set = <K extends keyof CurrentMember>(k: K, v: CurrentMember[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/member/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name ?? "",
          last_name: form.last_name ?? "",
          credential: form.credential ?? "",
          phone: form.phone ?? "",
          practice_name: form.practice_name ?? "",
          practice_role: form.practice_role ?? "",
          city: form.city ?? "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? `Save failed (${res.status})`);
        return;
      }
      setToast("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress size={24} sx={{ color: "#A07823" }} />
      </Stack>
    );
  }

  if (!member) {
    return (
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "common.white",
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, mb: 0.5 }}>
          No member profile found
        </Typography>
        <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
          Your session may have expired. Sign in again from the member login page.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "#A07823", fontSize: "0.62rem", letterSpacing: "0.18em", fontWeight: 700 }}
        >
          PROFILE
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "1.4rem", md: "1.7rem" },
            fontWeight: 500,
            color: "#0A1A2F",
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
            mt: 0.5,
          }}
        >
          Your member profile
        </Typography>
        <Typography sx={{ color: "#5C6770", fontSize: "0.82rem", mt: 0.5, maxWidth: 600 }}>
          Keep your contact info current. The team uses this to match vendor offers and route any
          1:1 outreach.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#A07823",
            textTransform: "uppercase",
            mb: 1.5,
          }}
        >
          Identity
        </Typography>

        <Stack spacing={1.75}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="First name"
              fullWidth
              size="small"
              value={form.first_name ?? ""}
              onChange={(e) => set("first_name", e.target.value)}
            />
            <TextField
              label="Last name"
              fullWidth
              size="small"
              value={form.last_name ?? ""}
              onChange={(e) => set("last_name", e.target.value)}
            />
            <TextField
              label="Credential"
              size="small"
              sx={{ width: { xs: "100%", sm: 140 } }}
              placeholder="DDS"
              value={form.credential ?? ""}
              onChange={(e) => set("credential", e.target.value)}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Email"
              fullWidth
              size="small"
              value={member.email}
              disabled
              helperText="Email can't be changed here — contact the team if you need to update it."
            />
            <TextField
              label="Phone"
              fullWidth
              size="small"
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Stack>
        </Stack>

        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#A07823",
            textTransform: "uppercase",
            mt: 3,
            mb: 1.5,
          }}
        >
          Practice
        </Typography>

        <Stack spacing={1.75}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Practice name"
              fullWidth
              size="small"
              value={form.practice_name ?? ""}
              onChange={(e) => set("practice_name", e.target.value)}
            />
            <TextField
              label="Your role"
              fullWidth
              size="small"
              placeholder="Practice Owner"
              value={form.practice_role ?? ""}
              onChange={(e) => set("practice_role", e.target.value)}
            />
          </Stack>
          <TextField
            label="City / state"
            fullWidth
            size="small"
            value={form.city ?? ""}
            onChange={(e) => set("city", e.target.value)}
          />
        </Stack>

        <Stack direction="row" sx={{ mt: 2.5, justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : <SaveOutlinedIcon />}
            sx={{
              bgcolor: "#0A1A2F",
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              px: 2,
              "&:hover": { bgcolor: "#0F2540" },
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "text.secondary",
            textTransform: "uppercase",
            mb: 1,
          }}
        >
          Membership
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          sx={{ alignItems: { sm: "baseline" } }}
        >
          <MetaRow label="Tier" value={member.tier === "founding" ? "Founding member" : "Member"} />
          <MetaRow
            label="Joined"
            value={member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "—"}
          />
          <MetaRow label="Status" value={member.status} highlight={member.status === "active"} />
        </Stack>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Stack>
  );
}

function MetaRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Stack spacing={0.25}>
      <Typography
        sx={{
          fontSize: "0.58rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "text.secondary",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.86rem",
          fontWeight: 600,
          color: highlight ? "#1F5C40" : "#0A1A2F",
          textTransform: highlight ? "capitalize" : "none",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
