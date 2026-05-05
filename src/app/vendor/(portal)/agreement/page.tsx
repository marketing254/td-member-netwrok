"use client";
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import {
  vendor,
  vendorAgreementMeta,
  vendorAgreementSections,
} from "@/lib/vendorData";

export default function VendorAgreementPage() {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          AGREEMENT
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          Your partnership agreement
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          Read-only copy of the signed Vendor Network Partnership Agreement. The full PDF was emailed to your contact at signup.
        </Typography>
      </Box>

      {/* Signature meta card */}
      <Box
        sx={{
          p: { xs: 3, md: 3.5 },
          borderRadius: "20px",
          border: "1px solid rgba(34,108,78,0.3)",
          backgroundImage: "linear-gradient(135deg, #ECF6EE 0%, #D5EBDB 100%)",
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
              <VerifiedUserOutlinedIcon sx={{ color: "success.dark", fontSize: 28 }} />
              <Typography variant="overline" sx={{ color: "success.dark", fontWeight: 700, letterSpacing: "0.18em" }}>
                AGREEMENT IN FORCE
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontSize: "1.35rem", mb: 0.5 }}>
              {vendorAgreementMeta.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              Click-to-signed by your authorized representative on {vendor.agreementSignedAt} · version {vendor.agreementVersion}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: { md: "flex-end" }, flexWrap: "wrap", gap: 1 }}>
              <Button variant="outlined" color="primary" startIcon={<DownloadOutlinedIcon />}>
                Download PDF
              </Button>
              <Button variant="text" color="primary">
                Request changes
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Sections */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
          <GavelOutlinedIcon sx={{ color: "#A07823" }} />
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
              FULL TEXT
            </Typography>
            <Typography variant="h4" sx={{ fontSize: "1.25rem", mt: 0.25 }}>
              Sections 1–11
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip
            label={vendorAgreementMeta.version}
            size="small"
            sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.7rem" }}
          />
        </Stack>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, fontSize: "0.9rem", lineHeight: 1.6 }}>
          {vendorAgreementMeta.intro}
        </Typography>

        <Stack spacing={3} divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
          {vendorAgreementSections.map((s) => (
            <Box key={s.id} sx={{ pt: 2.5 }}>
              <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, mb: 1, color: "text.primary" }}>
                {s.number}. {s.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.92rem", lineHeight: 1.7 }}>
                {s.body}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
