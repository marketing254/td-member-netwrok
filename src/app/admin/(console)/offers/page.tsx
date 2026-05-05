"use client";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { adminPendingOffers } from "@/lib/vendorData";

export default function AdminOffersPage() {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          OFFER MODERATION
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          Pending vendor offers
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          Reshani reviews each new offer before it appears in the member rewards page. Reject anything misleading, expired, or off-brand.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {adminPendingOffers.map((o) => (
          <Box
            key={o.id}
            sx={{
              p: { xs: 2.75, md: 3.5 },
              borderRadius: "20px",
              border: "1px solid",
              borderColor: "rgba(217,168,75,0.4)",
              bgcolor: "rgba(217,168,75,0.05)",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} sx={{ alignItems: { md: "flex-start" } }}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap", gap: 0.75 }}>
                  <Chip
                    label="PENDING REVIEW"
                    size="small"
                    sx={{
                      bgcolor: "rgba(217,168,75,0.16)",
                      color: "#A07823",
                      border: "1px solid rgba(217,168,75,0.35)",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                    }}
                  />
                  <Chip
                    label={o.category}
                    size="small"
                    sx={{
                      bgcolor: "rgba(14,42,61,0.07)",
                      color: "primary.dark",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem", alignSelf: "center" }}>
                    Submitted {o.submittedOn}
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontSize: "1.35rem", mb: 0.75 }}>
                  {o.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.75 }}>
                  <strong>Vendor:</strong> {o.vendor}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.95rem" }}>
                  <strong>Discount:</strong> {o.discountLabel}
                </Typography>
              </Box>
              <Stack direction={{ xs: "row", md: "column" }} spacing={1.25} sx={{ minWidth: { md: 200 } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleOutlinedIcon />}
                  size="large"
                  fullWidth
                >
                  Approve & publish
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditOutlinedIcon />}
                  fullWidth
                >
                  Edit before publishing
                </Button>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<CancelOutlinedIcon />}
                  fullWidth
                >
                  Reject
                </Button>
              </Stack>
            </Stack>
          </Box>
        ))}

        {adminPendingOffers.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center", borderRadius: "20px", border: "1px dashed", borderColor: "divider", bgcolor: "common.white" }}>
            <Typography variant="h5" sx={{ fontSize: "1.15rem", mb: 1 }}>
              Queue is clear.
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              All vendor offers have been reviewed.
            </Typography>
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
