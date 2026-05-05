"use client";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { adminHotlineCases } from "@/lib/vendorData";

export default function AdminHotlinePage() {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
          HOTLINE TRIAGE
        </Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
          Open cases
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
          SLA: first response within 2 business hours · expert match within 1 business day · written summary within 3 days. Lester is the case owner.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1 }}>
        <TextField select size="small" defaultValue="all" sx={{ minWidth: 200 }}>
          <MenuItem value="all">All pillars</MenuItem>
          <MenuItem value="ops">Practice Ops</MenuItem>
          <MenuItem value="hr">HR</MenuItem>
          <MenuItem value="marketing">Marketing</MenuItem>
          <MenuItem value="tech">Tech</MenuItem>
          <MenuItem value="ma">M&A</MenuItem>
          <MenuItem value="finance">Finance</MenuItem>
        </TextField>
        <TextField select size="small" defaultValue="open" sx={{ minWidth: 180 }}>
          <MenuItem value="open">Open cases</MenuItem>
          <MenuItem value="all">All cases</MenuItem>
          <MenuItem value="resolved">Resolved</MenuItem>
        </TextField>
      </Stack>

      <Stack spacing={2}>
        {adminHotlineCases.map((c) => (
          <Box
            key={c.id}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: "16px",
              border: "1px solid",
              borderColor: c.urgency === "critical" ? "rgba(220,60,60,0.32)" : c.status === "received" ? "rgba(217,168,75,0.4)" : "divider",
              bgcolor: c.urgency === "critical" ? "rgba(220,60,60,0.04)" : "common.white",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "flex-start" }, justifyContent: "space-between" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={0.75} sx={{ mb: 1, flexWrap: "wrap", gap: 0.5 }}>
                  <Chip label={c.pillar} size="small" sx={{ bgcolor: "rgba(14,42,61,0.07)", color: "primary.dark", fontWeight: 700, fontSize: "0.68rem", height: 22 }} />
                  <UrgencyChip urgency={c.urgency} />
                  <CaseStatusChip status={c.status} />
                </Stack>
                <Typography sx={{ fontSize: "1.02rem", fontWeight: 600, mb: 0.5 }}>
                  {c.summary}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ color: "text.secondary", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                    <strong>Member:</strong> {c.member}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                    <strong>Opened:</strong> {c.openedAt}
                  </Typography>
                  {c.assignedTo && (
                    <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                      <strong>Owner:</strong> {c.assignedTo}
                    </Typography>
                  )}
                  {c.expert && (
                    <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                      <strong>Expert:</strong> {c.expert}
                    </Typography>
                  )}
                </Stack>
                <Box
                  sx={{
                    mt: 1.25,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: "8px",
                    bgcolor: "rgba(217,168,75,0.12)",
                    color: "#A07823",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    display: "inline-flex",
                  }}
                >
                  {c.slaDueIn}
                </Box>
              </Box>
              <Stack direction={{ xs: "row", md: "column" }} spacing={1} sx={{ flexShrink: 0, minWidth: { md: 200 } }}>
                {c.status === "received" && (
                  <Button variant="contained" color="primary" startIcon={<AssignmentIndOutlinedIcon />}>
                    Triage
                  </Button>
                )}
                {(c.status === "triaged" || c.status === "matched") && (
                  <Button variant="contained" color="secondary">
                    Match expert
                  </Button>
                )}
                {c.status === "replied" && (
                  <Button variant="contained" color="primary" startIcon={<CheckCircleOutlinedIcon />}>
                    Mark resolved
                  </Button>
                )}
                <Tooltip title="Open case">
                  <Button variant="outlined" color="primary" endIcon={<OpenInNewOutlinedIcon />}>
                    Open case
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

function UrgencyChip({ urgency }: { urgency: "critical" | "high" | "normal" }) {
  const map = {
    critical: { bg: "rgba(220,60,60,0.12)", color: "#8C1D1D", label: "Critical" },
    high: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "High" },
    normal: { bg: "grey.100", color: "#5C6770", label: "Normal" },
  } as const;
  const s = map[urgency];
  return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.68rem", height: 22 }} />;
}

function CaseStatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    received: { bg: "rgba(220,60,60,0.1)", color: "#8C1D1D", label: "New" },
    triaged: { bg: "rgba(14,42,61,0.07)", color: "primary.dark", label: "Triaged" },
    matched: { bg: "rgba(34,108,78,0.08)", color: "success.dark", label: "With expert" },
    replied: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Replied" },
    resolved: { bg: "rgba(14,42,61,0.07)", color: "primary.dark", label: "Resolved" },
  };
  const s = map[status] ?? map.received;
  return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.68rem", height: 22 }} />;
}
