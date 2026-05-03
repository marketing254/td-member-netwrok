"use client";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import { brand, footerLinks } from "@/lib/content";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.dark",
        color: "common.white",
        pt: { xs: 8, md: 10 },
        pb: 5,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(45% 45% at 100% 0%, rgba(217,168,75,0.16) 0%, transparent 60%), radial-gradient(40% 35% at 0% 100%, rgba(34,108,165,0.14) 0%, transparent 65%)",
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 5, md: 6 }} sx={{ position: "relative" }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2.5} sx={{ maxWidth: 420 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: "secondary.main",
                    color: "primary.dark",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                  }}
                >
                  T
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "common.white",
                    fontFamily: "var(--font-display)",
                    textTransform: "none",
                    fontSize: "1.25rem",
                  }}
                >
                  {brand.name}
                </Typography>
              </Stack>

              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.74)" }}>
                A premium support network for dental practice owners who want faster answers, better buying power, and
                a cleaner operating system for growth.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1 }}>
                <Button href={brand.joinUrl} variant="contained" color="secondary">
                  Claim founding spot
                </Button>
                <Button
                  href={`mailto:${brand.email}`}
                  variant="outlined"
                  sx={{
                    color: "common.white",
                    borderColor: "rgba(255,255,255,0.16)",
                    "&:hover": { borderColor: "rgba(255,255,255,0.35)", bgcolor: "rgba(255,255,255,0.04)" },
                  }}
                >
                  Email founding team
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ pt: 1.5 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                    Hotline
                  </Typography>
                  <Typography
                    component="a"
                    href={`tel:${brand.phoneTel}`}
                    sx={{
                      display: "inline-block",
                      mt: 0.5,
                      color: "secondary.main",
                      textDecoration: "none",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.125rem",
                      fontWeight: 500,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {brand.phoneDisplay}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                    Response standard
                  </Typography>
                  <Typography sx={{ mt: 0.5, color: "common.white", fontWeight: 600 }}>
                    Human reply in under 1 business day
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={{ xs: 4, md: 3 }}>
              {Object.entries(footerLinks).map(([title, items]) => (
                <Grid key={title} size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1.5}>
                    <Typography variant="overline" sx={{ color: "secondary.main", letterSpacing: "0.14em" }}>
                      {title}
                    </Typography>
                    {items.map((item) => (
                      <Box
                        key={item.label}
                        component="a"
                        href={item.href}
                        sx={{
                          color: "rgba(255,255,255,0.76)",
                          textDecoration: "none",
                          fontSize: "0.95rem",
                          "&:hover": { color: "common.white" },
                        }}
                      >
                        {item.label}
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: { xs: 5, md: 6 },
            pt: 3,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            position: "relative",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
              © {new Date().getFullYear()} {brand.name}. Built for practice owners running real businesses.
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.4)" }}>
              HIPAA-aware product direction. No patient data stored in the network.
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
