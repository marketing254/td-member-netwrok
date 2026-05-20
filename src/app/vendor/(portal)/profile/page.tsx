"use client";

import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { vendor, vendorCategories } from "@/lib/vendorData";
import { PageHeader, SectionCard, StatusPill, TagPill, portalText } from "@/components/vendor/PortalUI";

export default function VendorProfilePage() {
  const [companyName, setCompanyName] = useState(vendor.companyName);
  const [displayName, setDisplayName] = useState(vendor.displayName);
  const [website, setWebsite] = useState(vendor.website);
  const [category, setCategory] = useState<string>(vendor.category);
  const [description, setDescription] = useState(vendor.description);
  const [contactName, setContactName] = useState(vendor.contactName);
  const [contactEmail, setContactEmail] = useState(vendor.contactEmail);
  const [contactPhone, setContactPhone] = useState(vendor.contactPhone);
  const [billingEmail, setBillingEmail] = useState(vendor.billingEmail);
  const [calendarLink, setCalendarLink] = useState("https://cal.com/marcus-reilly/intro");
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader
        eyebrow="COMPANY PROFILE"
        title="Public profile"
        subtitle="What members see in the directory. Edits go live immediately; offer copy is managed separately on the Offers page."
        actions={
          <Button
            variant="contained"
            size="small"
            onClick={onSave}
            startIcon={saved ? <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} /> : undefined}
            sx={{
              bgcolor: saved ? "#1F5C40" : "#0A1A2F",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              "&:hover": { bgcolor: saved ? "#19533A" : "#0F2540" },
            }}
          >
            {saved ? "Saved" : "Save changes"}
          </Button>
        }
      />

      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <SectionCard padding="default">
              <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: "#0A1A2F",
                      color: "#F0C16E",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      border: "2px solid rgba(217,168,75,0.4)",
                    }}
                  >
                    {vendor.avatarInitials}
                  </Avatar>
                  <Box
                    sx={{
                      position: "absolute",
                      right: -4,
                      bottom: -4,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "#1F5C40",
                      color: "#FFFFFF",
                      display: "grid",
                      placeItems: "center",
                      border: "2px solid #FFFFFF",
                    }}
                  >
                    <VerifiedUserOutlinedIcon sx={{ fontSize: 13 }} />
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0A1A2F" }}>
                    {displayName}
                  </Typography>
                  <Typography sx={portalText.meta}>{category}</Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", justifyContent: "center", gap: 0.5 }}>
                  <TagPill label="VERIFIED" tone="gold" size="sm" />
                  <TagPill label="FOUNDING" tone="navy" size="sm" />
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    mt: 0.5,
                    borderColor: "rgba(14,42,61,0.18)",
                    color: "#0A1A2F",
                    textTransform: "none",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.06)" },
                  }}
                >
                  Upload logo
                </Button>
              </Stack>
            </SectionCard>

            <SectionCard title="Listing health" padding="default">
              <Stack spacing={1.25}>
                <HealthRow label="Logo" ok />
                <HealthRow label="Description" ok={description.length >= 60} />
                <HealthRow label="Website" ok={website.length > 0} />
                <HealthRow label="Calendar link" ok={calendarLink.length > 0} />
                <HealthRow label="Contact phone" ok={contactPhone.length > 0} />
              </Stack>
            </SectionCard>

            <SectionCard title="Review status" padding="default">
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <StatusPill status="approved" size="sm" />
                  <Typography sx={portalText.body}>Profile is live in the directory.</Typography>
                </Stack>
                <Typography sx={portalText.meta}>
                  Material changes (name, category) trigger a team re-review. Cosmetic edits (description, contact) go live immediately.
                </Typography>
              </Stack>
            </SectionCard>
          </Stack>
        </Grid>

        {/* Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <SectionCard title="Company" padding="default">
              <Grid container spacing={1.75}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Legal company name"
                    value={companyName}
                    onChange={setCompanyName}
                    placeholder="Henry Schein, Inc."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Display name (shown in directory)"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Henry Schein"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Website"
                    value={website}
                    onChange={setWebsite}
                    placeholder="https://www.henryschein.com"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Category"
                    value={category}
                    onChange={setCategory}
                    select
                  >
                    {vendorCategories.map((c) => (
                      <MenuItem key={c} value={c} sx={{ fontSize: "0.84rem" }}>
                        {c}
                      </MenuItem>
                    ))}
                  </FormField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormField
                    label="Description"
                    value={description}
                    onChange={setDescription}
                    multiline
                    minRows={3}
                    placeholder="Short pitch members see in the directory."
                    helperText={`${description.length}/600`}
                  />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Contact" subtitle="Where members and our team reach you." padding="default">
              <Grid container spacing={1.75}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Primary contact name" value={contactName} onChange={setContactName} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Contact email"
                    type="email"
                    value={contactEmail}
                    onChange={setContactEmail}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Contact phone"
                    type="tel"
                    value={contactPhone}
                    onChange={setContactPhone}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Calendar booking link"
                    value={calendarLink}
                    onChange={setCalendarLink}
                    placeholder="https://cal.com/your-handle/intro"
                    helperText="Members book intros from your profile."
                  />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Billing" subtitle="Used for invoices and receipts only — not displayed publicly." padding="default">
              <Grid container spacing={1.75}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    label="Billing email"
                    type="email"
                    value={billingEmail}
                    onChange={setBillingEmail}
                  />
                </Grid>
              </Grid>
            </SectionCard>

            <Alert
              severity="info"
              sx={{ borderRadius: 1.5, fontSize: "0.82rem", py: 0.75 }}
            >
              Material edits (legal name, category change) re-trigger team review. Cosmetic edits (description, contact) go live instantly.
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function HealthRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
      <Typography sx={{ fontSize: "0.82rem", color: "#3B4A55" }}>{label}</Typography>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 0.75,
          height: 18,
          borderRadius: 0.75,
          bgcolor: ok ? "rgba(34,108,78,0.1)" : "rgba(217,168,75,0.14)",
          color: ok ? "#1F5C40" : "#A07823",
          border: ok ? "1px solid rgba(34,108,78,0.28)" : "1px solid rgba(217,168,75,0.32)",
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <Box
          sx={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            bgcolor: ok ? "#1F5C40" : "#A07823",
          }}
        />
        {ok ? "Complete" : "Add"}
      </Box>
    </Stack>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  multiline,
  minRows,
  select,
  type,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helperText?: string;
  multiline?: boolean;
  minRows?: number;
  select?: boolean;
  type?: string;
  children?: React.ReactNode;
}) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      helperText={helperText}
      multiline={multiline}
      minRows={minRows}
      select={select}
      type={type}
      fullWidth
      size="small"
      slotProps={{
        inputLabel: { sx: { fontSize: "0.82rem" } },
        formHelperText: { sx: { fontSize: "0.7rem", ml: 0.5, mt: 0.5 } },
      }}
      sx={{
        "& .MuiOutlinedInput-root": { fontSize: "0.84rem", borderRadius: 1.5 },
        "& .MuiOutlinedInput-input": { py: 1.1 },
      }}
    >
      {children}
    </TextField>
  );
}
