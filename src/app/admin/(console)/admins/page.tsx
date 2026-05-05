"use client";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import { adminUsers } from "@/lib/vendorData";

const roleColors: Record<string, { bg: string; color: string; label: string }> = {
  lester: { bg: "rgba(14,42,61,0.07)", color: "primary.dark", label: "Lester" },
  reshani: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "Reshani" },
  rushda: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Rushda" },
  chamika: { bg: "rgba(220,60,60,0.1)", color: "#8C1D1D", label: "Chamika" },
  va: { bg: "grey.200", color: "text.secondary", label: "VA" },
};

export default function AdminTeamPage() {
  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            ADMIN TEAM
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
            Who can access the console
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
            Each admin sees a different default view based on their workstream. Lester invites new admins by email.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<PersonAddOutlinedIcon />}>
          Invite admin
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        {adminUsers.map((a) => {
          const r = roleColors[a.role];
          return (
            <Grid key={a.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "common.white",
                  height: "100%",
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 24px 40px -28px rgba(14,42,61,0.3)",
                  },
                }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: r.bg,
                      color: r.color,
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    {a.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }} noWrap>
                      {a.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                      {a.email}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={r.label.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: r.bg,
                    color: r.color,
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    letterSpacing: "0.08em",
                    mb: 1.75,
                  }}
                />
                <Typography variant="overline" sx={{ color: "text.secondary", display: "block", fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.65rem", mb: 0.5 }}>
                  WORKSTREAM
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem", lineHeight: 1.55, mb: 2 }}>
                  {a.workstream}
                </Typography>
                <Stack direction="row" sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                    {a.lastActive}
                  </Typography>
                  <Chip
                    label="ACTIVE"
                    size="small"
                    sx={{ bgcolor: "rgba(34,108,78,0.12)", color: "#1F5C40", fontWeight: 700, fontSize: "0.62rem", height: 20 }}
                  />
                </Stack>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
