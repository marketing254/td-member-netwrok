"use client";
import { Box } from "@mui/material";
import CircleIcon from "@mui/icons-material/FiberManualRecord";

const SAMPLE_ACTIVITY = [
  "Dr. M.S. from Boston, MA just joined",
  "Dr. R.T. from Austin, TX just joined",
  "Acme Dental Supply — Vendor partner",
  "Dr. K.P. from Seattle, WA just joined",
  "Brightway Practice Loans — Vendor partner",
  "Dr. J.L. from Miami, FL just joined",
  "Dr. A.W. from Denver, CO just joined",
  "ChairSide CE — Vendor partner",
  "Dr. P.G. from Chicago, IL just joined",
  "Dr. N.K. from Portland, OR just joined",
];

export default function LiveMarquee({ items = SAMPLE_ACTIVITY }: { items?: string[] }) {
  // Duplicate so the loop is seamless.
  const looped = [...items, ...items];
  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        overflow: "hidden",
        py: 1.5,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(8px)",
        maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 5,
          width: "fit-content",
          animation: "marqueeScroll 36s linear infinite",
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        {looped.map((item, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              color: "rgba(255,255,255,0.55)",
              fontSize: "0.78rem",
              fontWeight: 500,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            <CircleIcon sx={{ fontSize: 5, color: "rgba(217,168,75,0.7)" }} />
            {item}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
