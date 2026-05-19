"use client";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { vendor, vendorPlans } from "@/lib/vendorData";

const sampleInvoices = [
  { id: "inv-2026-05", number: "TDN-V-2026-0501", date: "May 01, 2026", amount: 0, status: "paid" as const, period: "Founding waiver, Month 2 of 6" },
  { id: "inv-2026-04", number: "TDN-V-2026-0401", date: "Apr 24, 2026", amount: 0, status: "paid" as const, period: "Founding waiver, Month 1 of 6 (pro-rated)" },
];

export default function VendorAccountPage() {
  const plan = vendorPlans.find((p) => p.id === vendor.planId)!;
  const monthsLeftInWaiver = Math.max(0, 6 - vendor.monthsInProgram);

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          ACCOUNT & BILLING
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          Subscription & invoices
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          Your founding rate is locked through month 12. Manage payment method and download past invoices.
        </Typography>
      </Box>

      {/* Current plan card */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          p: { xs: 3, md: 4 },
          color: "common.white",
          backgroundImage: "linear-gradient(135deg, #06182A 0%, #0E2A3D 50%, #1B4258 100%)",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(45% 45% at 80% 0%, rgba(217,168,75,0.35) 0%, transparent 60%)",
          }}
        />
        <Grid container spacing={3} sx={{ position: "relative", alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Chip
                label="ACTIVE"
                size="small"
                sx={{
                  bgcolor: "rgba(56,176,109,0.18)",
                  color: "#A8E6BD",
                  border: "1px solid rgba(56,176,109,0.35)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                }}
              />
              <Chip
                label={`MONTH ${vendor.monthsInProgram} OF 12`}
                size="small"
                sx={{
                  bgcolor: "rgba(217,168,75,0.16)",
                  color: "secondary.light",
                  border: "1px solid rgba(217,168,75,0.35)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                }}
              />
            </Stack>
            <Typography variant="overline" sx={{ color: "secondary.light", display: "block", fontWeight: 700 }}>
              YOUR PARTNERSHIP PLAN
            </Typography>
            <Typography variant="h2" sx={{ color: "common.white", fontSize: { xs: "2.25rem", md: "3rem" }, mt: 0.5 }}>
              {plan.name}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.92)", mt: 1.25, lineHeight: 1.55, maxWidth: 540 }}>
              You&apos;re in the founding waiver, <strong>{monthsLeftInWaiver} months</strong> remain at $0.
              Months 7–12 will auto-bill at $49/mo. Standard $199/mo from month 13 unless you upgrade or cancel.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ p: 2.75, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(8px)" }}>
              <Stack spacing={1.5}>
                <KvDark label="Started on" value={vendor.joinedAt} />
                <KvDark label="Next bill" value="Oct 24, 2026 · $49.00" detail={`Months 7–12 locked rate`} />
                <KvDark label="Payment method" value="Visa ···· 4242" detail="Updates in Stripe" />
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button variant="contained" color="primary">Upgrade plan</Button>
        <Button variant="outlined" color="primary">Cancel subscription</Button>
      </Stack>

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
          <Box aria-hidden sx={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(50% 50% at 100% 0%, rgba(217,168,75,0.3) 0%, transparent 60%)" }} />
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            <CreditCardOutlinedIcon sx={{ fontSize: 28, color: "secondary.light" }} />
            <Typography sx={{ fontFamily: "var(--font-display)", color: "common.white", fontSize: "1.15rem", letterSpacing: "0.04em" }}>
              Visa
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
              •••• •••• •••• 4242
            </Typography>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.65)", letterSpacing: "0.14em", fontWeight: 700 }}>
                  HOLDER
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  HENRY SCHEIN
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.65)", letterSpacing: "0.14em", fontWeight: 700 }}>
                  EXPIRES
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  12 / 28
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
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
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <ReceiptLongOutlinedIcon sx={{ color: "primary.dark" }} />
            <Box>
              <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
                BILLING HISTORY
              </Typography>
              <Typography variant="h4" sx={{ fontSize: "1.4rem", mt: 0.25 }}>
                Invoices
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
          {sampleInvoices.map((inv) => (
            <Stack key={inv.id} direction="row" sx={{ p: 2, alignItems: "center", gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }}>{inv.period}</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                  {inv.number} · {inv.date}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: inv.amount === 0 ? "#A07823" : "text.primary" }}>
                ${inv.amount.toFixed(2)}
              </Typography>
              <Chip
                label="Paid"
                size="small"
                sx={{ bgcolor: "rgba(34,108,78,0.12)", color: "#1F5C40", fontWeight: 700, fontSize: "0.7rem", height: 24 }}
              />
              <Tooltip title="Download invoice (PDF)">
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

function KvDark({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", fontSize: "0.82rem", flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ textAlign: "right", minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "common.white" }}>
          {value}
        </Typography>
        {detail && (
          <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.7)", mt: 0.25 }}>
            {detail}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
