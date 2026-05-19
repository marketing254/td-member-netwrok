"use client";
import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { vendor, vendorCategories } from "@/lib/vendorData";

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
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          COMPANY PROFILE
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          Public profile
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          Edits go live immediately. Your offer copy is managed separately on the Offers page.
        </Typography>
      </Box>

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
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: "primary.main",
                  color: "common.white",
                  fontFamily: "var(--font-display)",
                  fontSize: "2.2rem",
                  fontWeight: 600,
                }}
              >
                {vendor.avatarInitials}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontSize: "1.1rem" }}>{displayName}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                  {category}
                </Typography>
              </Box>
              <Chip
                icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 14 }} />}
                label="VERIFIED PARTNER"
                size="small"
                sx={{
                  bgcolor: "rgba(217,168,75,0.14)",
                  color: "#A07823",
                  fontWeight: 700,
                  fontSize: "0.68rem",
                  letterSpacing: "0.08em",
                  "& .MuiChip-icon": { color: "#A07823" },
                }}
              />
              <Box sx={{ width: "100%", pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.75 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                    Joined
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                    {vendor.joinedAt}
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.75 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                    Agreement
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>
                    {vendor.agreementVersion}
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between", py: 0.75 }}>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                    Status
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "success.dark", textTransform: "capitalize" }}>
                    {vendor.status}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Grid>

        {/* Form */}
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
              <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
                COMPANY DETAILS
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.25, fontSize: "1.4rem", mb: 2.5 }}>
                Public listing
              </Typography>
              <Grid container spacing={2.25}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField label="Legal company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} helperText="Shown in member rewards page" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Category" select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {vendorCategories.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Public description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    helperText={`${description.length} / 240 characters`}
                    slotProps={{ htmlInput: { maxLength: 240 } }}
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
                CONTACT
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.25, fontSize: "1.4rem", mb: 2.5 }}>
                Where members and TDN reach you
              </Typography>
              <Grid container spacing={2.25}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Primary contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Primary email (login)" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} disabled helperText="Email changes go through verification, handled separately." />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Billing email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} helperText="Where invoices and payment receipts go." />
                </Grid>
              </Grid>
            </Box>

            {saved && (
              <Alert severity="success" icon={<CheckCircleOutlinedIcon />} sx={{ borderRadius: "14px" }}>
                Profile saved.
              </Alert>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button variant="text" color="primary">Cancel</Button>
              <Button variant="contained" color="primary" size="large" onClick={onSave}>
                Save changes
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
