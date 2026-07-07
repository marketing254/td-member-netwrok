"use client";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { vendorCategories } from "@/lib/vendorData";

export type FoundingInviteRoleValue = "partner" | "expert" | "both";

export type FoundingInviteFormValues = {
  id?: string;
  role: FoundingInviteRoleValue;
  full_name: string;
  email: string;
  company_name: string;
  member_offer: string;
  website: string;
  category: string;
  calendar_link: string;
  description: string;
  phone: string;
  secondary_email: string;
  secondary_phone: string;
  signer_name: string;
  signer_title: string;
  notes: string;
};

const EMPTY: FoundingInviteFormValues = {
  role: "partner",
  full_name: "",
  email: "",
  company_name: "",
  member_offer: "",
  website: "",
  category: "",
  calendar_link: "",
  description: "",
  phone: "",
  secondary_email: "",
  secondary_phone: "",
  signer_name: "",
  signer_title: "",
  notes: "",
};

/**
 * Create OR edit a founding invite. Creating writes a DRAFT — it never
 * emails anyone. Sending is a separate, explicit action on the list.
 */
export default function FoundingInviteDialog({
  open,
  mode,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Partial<FoundingInviteFormValues> | null;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const [v, setV] = useState<FoundingInviteFormValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setV({ ...EMPTY, ...(initial ?? {}) });
      setFormError(null);
    }
  }, [open, initial]);

  const set = (k: keyof FoundingInviteFormValues) => (e: { target: { value: string } }) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }));

  const needsCompany = v.role === "partner" || v.role === "both";

  const submit = async () => {
    setFormError(null);
    if (!v.full_name.trim() || !v.email.trim()) {
      setFormError("Full name and email are required.");
      return;
    }
    if (needsCompany && !v.company_name.trim()) {
      setFormError("Company name is required for partner / both invites.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        role: v.role,
        full_name: v.full_name.trim(),
        email: v.email.trim(),
        company_name: v.company_name.trim() || undefined,
        member_offer: v.member_offer.trim() || undefined,
        website: v.website.trim() || undefined,
        category: v.category.trim() || undefined,
        calendar_link: v.calendar_link.trim() || undefined,
        description: v.description.trim() || undefined,
        phone: v.phone.trim() || undefined,
        secondary_email: v.secondary_email.trim() || undefined,
        secondary_phone: v.secondary_phone.trim() || undefined,
        signer_name: v.signer_name.trim() || undefined,
        signer_title: v.signer_title.trim() || undefined,
        notes: v.notes.trim() || undefined,
      };
      const url =
        mode === "edit" && initial?.id
          ? `/api/admin/founding-invite/${initial.id}`
          : "/api/admin/founding-invite";
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || body.error) {
        setFormError(body.error ?? `Failed (${res.status}).`);
        return;
      }
      onSaved(v.full_name.trim());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save invite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!submitting) onClose();
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === "edit" ? "Edit founding invite" : "New founding invite (draft)"}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", mb: 2, fontSize: "0.88rem" }}>
          Saves a <strong>draft</strong> only. No email is sent and nothing is approved.
          Review it in the list, then click <strong>Send invite</strong> to email the
          private link with their personalized agreement.
        </Typography>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField label="Invite as" value={v.role} onChange={set("role")} fullWidth select>
              <MenuItem value="partner">Partner (company)</MenuItem>
              <MenuItem value="expert">Expert (individual)</MenuItem>
              <MenuItem value="both">Both — Expert + Partner (one fee covers both)</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionLabel>01 · Company{needsCompany ? "" : " (optional for expert-only)"}</SectionLabel>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Company name"
              value={v.company_name}
              onChange={set("company_name")}
              fullWidth
              required={needsCompany}
              placeholder="Acme Dental Supply"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Website" value={v.website} onChange={set("website")} fullWidth placeholder="https://acmedental.com" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Category" value={v.category} onChange={set("category")} fullWidth select>
              <MenuItem value="">— none —</MenuItem>
              {vendorCategories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Booking / calendar link"
              value={v.calendar_link}
              onChange={set("calendar_link")}
              fullWidth
              placeholder="https://cal.com/acme/intro"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="What do they do, in one sentence?"
              value={v.description}
              onChange={set("description")}
              fullWidth
              multiline
              minRows={2}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Exclusive member offer"
              value={v.member_offer}
              onChange={set("member_offer")}
              fullWidth
              multiline
              minRows={2}
              placeholder="e.g. 15% off your first year, or a free consultation"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionLabel>02 · Contact</SectionLabel>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Full name"
              value={v.full_name}
              onChange={set("full_name")}
              fullWidth
              required
              placeholder="Taylor Morgan"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Primary work email"
              type="email"
              value={v.email}
              onChange={set("email")}
              fullWidth
              required
              placeholder="taylor@acme.com"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Primary phone" value={v.phone} onChange={set("phone")} fullWidth placeholder="+1 (555) 010-1234" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Secondary email (optional)"
              type="email"
              value={v.secondary_email}
              onChange={set("secondary_email")}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Secondary phone (optional)"
              value={v.secondary_phone}
              onChange={set("secondary_phone")}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionLabel>03 · Signs on behalf of the company</SectionLabel>
          </Grid>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField label="Signer full name" value={v.signer_name} onChange={set("signer_name")} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField label="Signer title" value={v.signer_title} onChange={set("signer_title")} fullWidth placeholder="VP of Partnerships" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField label="Internal notes (optional)" value={v.notes} onChange={set("notes")} fullWidth multiline minRows={2} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={() => !submitting && onClose()} disabled={submitting} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={15} sx={{ color: "inherit" }} /> : null}
          sx={{ textTransform: "none" }}
        >
          {submitting ? "Saving…" : mode === "edit" ? "Save changes" : "Save draft"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "text.secondary",
        mt: 0.5,
      }}
    >
      {children}
    </Typography>
  );
}
