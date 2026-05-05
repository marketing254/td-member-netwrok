"use client";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { vendorOwnOffers, type VendorOfferStatus } from "@/lib/vendorData";

export default function VendorOffersPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            OFFERS
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
            Manage your member offers
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
            Create offers, pause them, edit terms. New offers go through a quick review by Reshani before going live.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" size="large" startIcon={<AddCircleOutlineOutlinedIcon />} onClick={() => setCreateOpen(true)}>
          Create new offer
        </Button>
      </Stack>

      <Box
        sx={{
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "2.2fr 1fr 1fr 1.2fr 1fr 0.8fr",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Cell head>Offer</Cell>
          <Cell head>Code</Cell>
          <Cell head>Status</Cell>
          <Cell head>Redemptions</Cell>
          <Cell head>Savings YTD</Cell>
          <Box />
        </Box>

        {vendorOwnOffers.map((o, i) => (
          <Box
            key={o.id}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "2.2fr 1fr 1fr 1.2fr 1fr 0.8fr" },
              alignItems: "center",
              gap: { xs: 1, md: 2 },
              px: { xs: 2.5, md: 3 },
              py: 2,
              borderBottom: i === vendorOwnOffers.length - 1 ? 0 : "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>{o.title}</Typography>
              <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.25 }}>
                {o.discountLabel} · expires {o.expiresOn}
              </Typography>
              {o.reviewerNote && (
                <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#A07823", mt: 0.5, fontStyle: "italic" }}>
                  {o.reviewerNote}
                </Typography>
              )}
              {/* mobile-only meta */}
              <Stack direction="row" spacing={1} sx={{ display: { xs: "flex", md: "none" }, mt: 1, alignItems: "center" }}>
                <StatusChip status={o.status} />
                <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                  {o.redemptions} redemptions · ${o.savingsDeliveredYtd.toLocaleString()} delivered
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Box
                component="span"
                sx={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  px: 1,
                  py: 0.5,
                  bgcolor: "grey.50",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: "8px",
                  color: "primary.dark",
                }}
              >
                {o.code}
              </Box>
            </Box>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <StatusChip status={o.status} />
            </Box>
            <Cell>
              <Box component="span" sx={{ display: { xs: "none", md: "inline" }, fontWeight: 600 }}>
                {o.redemptions}
              </Box>
            </Cell>
            <Cell>
              <Box component="span" sx={{ display: { xs: "none", md: "inline" }, fontWeight: 600, color: "success.dark" }}>
                ${o.savingsDeliveredYtd.toLocaleString()}
              </Box>
            </Cell>
            <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 0.5 }}>
              <Tooltip title="Edit">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={o.status === "paused" ? "Resume" : "Pause"}>
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  {o.status === "paused" ? <PlayArrowOutlinedIcon fontSize="small" /> : <PauseCircleOutlineOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ))}
      </Box>

      <Alert severity="info" sx={{ borderRadius: "14px" }}>
        <strong>Heads up:</strong> Offers are gated by Reshani for quality. New offers are typically reviewed within 24 hours.
        Once approved, they appear instantly in the member rewards page.
      </Alert>

      {/* Create offer dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "20px" } } }}>
        <DialogTitle sx={{ pr: 6 }}>
          Create new offer
          <IconButton onClick={() => setCreateOpen(false)} sx={{ position: "absolute", right: 12, top: 12 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Stack spacing={2.25}>
            <TextField label="Offer headline" placeholder="e.g. 12% off recurring orders" required />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Discount value" placeholder="12% off" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Promo code" placeholder="TDN-YOURS-12" />
              </Grid>
            </Grid>
            <TextField label="Mechanic" select defaultValue="promo_code">
              <MenuItem value="promo_code">Promo code at checkout</MenuItem>
              <MenuItem value="affiliate_link">Affiliate link</MenuItem>
              <MenuItem value="portal_redemption">Member portal redemption</MenuItem>
              <MenuItem value="manual_verification">Manual verification</MenuItem>
            </TextField>
            <TextField label="Terms" placeholder="e.g. Stacks with quarterly volume rebate. No minimum." multiline rows={3} required />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Expires on" type="date" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Redemption limit per member" placeholder="unlimited / once / monthly" />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)} variant="text" color="primary">
            Cancel
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setCreateOpen(false)}>
            Submit for review
          </Button>
        </DialogActions>
      </Dialog>
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

function StatusChip({ status }: { status: VendorOfferStatus }) {
  const map: Record<VendorOfferStatus, { bg: string; color: string; label: string }> = {
    published: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Live" },
    pending_review: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "In review" },
    draft: { bg: "grey.200", color: "#5C6770", label: "Draft" },
    paused: { bg: "rgba(14,42,61,0.07)", color: "#0E2A3D", label: "Paused" },
    rejected: { bg: "rgba(220,60,60,0.12)", color: "#8C1D1D", label: "Rejected" },
  };
  const s = map[status];
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.68rem", height: 22 }}
    />
  );
}
