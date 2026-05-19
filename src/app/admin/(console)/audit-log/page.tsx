"use client";
import {
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

const sample = [
  { id: 1, who: "Reshani", role: "reshani", what: "Approved vendor offer", target: "Henry Schein, Premium tier 18% off", when: "2 hrs ago" },
  { id: 2, who: "Lester", role: "lester", what: "Resolved hotline case", target: "hc_2026_05_03_1, Dr. Hannah Kim · M&A LOI review", when: "Yesterday" },
  { id: 3, who: "Rushda", role: "rushda", what: "Updated Stripe webhook config", target: "checkout.session.completed handler", when: "Yesterday" },
  { id: 4, who: "Reshani", role: "reshani", what: "Approved vendor application", target: "Patterson Dental → status=active", when: "Apr 30" },
  { id: 5, who: "Chamika", role: "chamika", what: "Edited landing page", target: "Hero subheadline copy", when: "Apr 28" },
  { id: 6, who: "Lester", role: "lester", what: "Published course", target: "Reading Your P&L Like an Operator (v2)", when: "Apr 26" },
  { id: 7, who: "Reshani", role: "reshani", what: "Sent vendor agreement", target: "CareStack PMS, pending signature", when: "May 04" },
];

const roleTint: Record<string, { bg: string; color: string }> = {
  lester: { bg: "rgba(14,42,61,0.07)", color: "#0E2A3D" },
  reshani: { bg: "rgba(217,168,75,0.16)", color: "#A07823" },
  rushda: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40" },
  chamika: { bg: "rgba(220,60,60,0.1)", color: "#8C1D1D" },
  va: { bg: "grey.200", color: "#5C6770" },
};

export default function AuditLogPage() {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          AUDIT LOG
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          Recent admin activity
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          Every write action is logged: who, what, when, which record. Use to investigate or to audit content / pricing / approvals.
        </Typography>
      </Box>

      <Box
        sx={{
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          overflow: "hidden",
        }}
      >
        <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
          {sample.map((s) => {
            const r = roleTint[s.role];
            return (
              <Stack key={s.id} direction="row" sx={{ p: 2.25, gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: r.bg, color: r.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.75, mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.92rem" }}>
                      {s.who}
                    </Typography>
                    <Chip
                      label={s.role.toUpperCase()}
                      size="small"
                      sx={{ bgcolor: r.bg, color: r.color, fontWeight: 700, fontSize: "0.6rem", height: 18, letterSpacing: "0.08em" }}
                    />
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                      {s.what}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "text.primary" }}>
                    {s.target}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary", flexShrink: 0 }}>
                  {s.when}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
