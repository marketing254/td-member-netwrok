"use client";
import { Box, Container, Stack, Typography } from "@mui/material";

const items = [
  "Expert Guidance",
  "Trusted Network",
  "Proven Systems",
  "Exclusive Savings",
  "Real Outcomes",
  "Published SLA",
];

export default function Marquee() {
  return (
    <Box
      sx={{
        py: { xs: 5, md: 6 },
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          spacing={{ xs: 3, md: 6 }}
          useFlexGap
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            rowGap: 2,
          }}
        >
          {items.map((item) => (
            <Stack key={item} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "secondary.main",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  fontSize: { xs: "0.8125rem", md: "0.9375rem" },
                }}
              >
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
