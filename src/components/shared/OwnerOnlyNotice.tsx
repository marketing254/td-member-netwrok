"use client";
import { Box, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

/** Shown to a team seat (migration 0079) on billing / agreement pages. */
export default function OwnerOnlyNotice({ what = "Billing and the agreement" }: { what?: string }) {
  return (
    <Box sx={{ maxWidth: 560, mx: "auto", mt: 6, p: 3, borderRadius: 2, bgcolor: "#FFFFFF", border: "1px solid rgba(14,42,61,0.10)", textAlign: "center" }}>
      <LockOutlinedIcon sx={{ color: "#A07823", fontSize: 32, mb: 1 }} />
      <Typography sx={{ fontWeight: 700, color: "#0A1A2F", mb: 0.5 }}>Owner only</Typography>
      <Typography sx={{ fontSize: "0.9rem", color: "#5C6770", lineHeight: 1.6 }}>
        {what} are managed by the account owner. Everything else in the portal is open to you.
      </Typography>
    </Box>
  );
}
