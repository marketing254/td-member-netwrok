"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  vendorAgreementKeyTerms,
  vendorAgreementMeta,
  vendorAgreementSections,
  vendorCommitments,
  vendorFeeSchedule,
} from "@/lib/vendorData";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { fetchCurrentVendor } from "@/lib/supabase/vendorQueries";
import type { VendorsRow } from "@/lib/supabase/types";

export default function VendorAgreementPage() {
  const [vendor, setVendor] = useState<VendorsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();
    (async () => {
      const v = await fetchCurrentVendor(supabase);
      if (!active) return;
      setVendor(v);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#A07823" }} />
      </Stack>
    );
  }

  const signedAt = vendor?.agreement_signed_at?.slice(0, 10) ?? "—";
  const version = vendor?.agreement_version ?? "v1.0";
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
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
              <VerifiedUserOutlinedIcon sx={{ color: "success.dark", fontSize: 28 }} />
              <Typography variant="overline" sx={{ color: "success.dark", fontWeight: 700, letterSpacing: "0.18em" }}>
                AGREEMENT IN FORCE
              </Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontSize: "1.35rem", mb: 0.5 }}>
              {vendorAgreementMeta.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#A07823", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.7rem", mb: 0.75 }}>
              {vendorAgreementMeta.tagline}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              Click-to-signed by your authorized representative on {signedAt} · version {version}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Key terms band */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" },
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          overflow: "hidden",
        }}
      >
        {vendorAgreementKeyTerms.map((t, i) => (
          <Box
            key={t.label}
            sx={{
              p: 2.5,
              textAlign: "center",
              borderRight: { sm: i === vendorAgreementKeyTerms.length - 1 ? 0 : "1px solid" },
              borderBottom: { xs: i >= vendorAgreementKeyTerms.length - 2 ? 0 : "1px solid", sm: 0 },
              borderColor: { xs: "divider", sm: "divider" },
            }}
          >
            <Typography variant="body2" sx={{ fontSize: "0.65rem", color: "text.secondary", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>
              {t.label}
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", color: "primary.dark", lineHeight: 1.1, mt: 0.5 }}>
              {t.value}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.25 }}>
              {t.sub}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* The five commitments */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
        }}
      >
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: "#A07823", fontWeight: 700, letterSpacing: "0.18em" }}>
            THE FIVE COMMITMENTS
          </Typography>
          <Typography variant="h4" sx={{ fontSize: "1.35rem" }}>
            What you agreed to as a partner
          </Typography>
        </Stack>
        <Stack spacing={2}>
          {vendorCommitments.map((c) => (
            <Box
              key={c.number}
              sx={{
                p: 2.5,
                borderRadius: "14px",
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                gridTemplateColumns: "52px 1fr",
                gap: 2.5,
                alignItems: "flex-start",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "secondary.light",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {c.number}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 0.5 }}>
                  {c.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  {c.body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Fee schedule */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
        }}
      >
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
          SCHEDULE A
        </Typography>
        <Typography variant="h4" sx={{ fontSize: "1.35rem", mb: 2 }}>
          Fee schedule
        </Typography>
        <Box
          sx={{
            borderRadius: "14px",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.6fr",
              bgcolor: "primary.main",
              color: "common.white",
            }}
          >
            {["Period", "Monthly fee", "Note"].map((h) => (
              <Box key={h} sx={{ p: 1.75, fontSize: "0.68rem", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>
                {h}
              </Box>
            ))}
          </Box>
          {vendorFeeSchedule.map((row, i) => (
            <Box
              key={row.period}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1.6fr",
                bgcolor: "common.white",
                borderTop: i === 0 ? 0 : "1px solid",
                borderColor: "divider",
                alignItems: "center",
              }}
            >
              <Box sx={{ p: 1.75, fontSize: "0.9rem", fontWeight: 600, color: "primary.dark" }}>
                {row.period}
              </Box>
              <Box sx={{ p: 1.75, fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, color: "primary.dark" }}>
                {row.fee}
              </Box>
              <Box sx={{ p: 1.75, fontSize: "0.85rem", color: "text.secondary" }}>
                {row.note}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Full operational + legal sections */}
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
              OPERATIONAL & LEGAL TERMS
            </Typography>
            <Typography variant="h4" sx={{ fontSize: "1.25rem", mt: 0.25 }}>
              Sections 01–09
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip
            label={vendorAgreementMeta.version}
            size="small"
            sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.7rem" }}
          />
        </Stack>

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
