"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import Logo from "@/components/brand/Logo";
import { brand, navLinks } from "@/lib/content";

/**
 * Premium pill-cluster nav inspired by modern SaaS landings.
 *
 * Layout: [Logo]          [pill with nav items]          [Join CTA]
 * No vertical divider, no rectangle "gap" artifact. The pill is one
 * continuous rounded container; on mobile it collapses into an animated
 * hamburger drawer.
 */
export default function Header() {
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          backgroundColor: "rgba(251, 248, 241, 0.85)",
          backdropFilter: "saturate(180%) blur(14px)",
          WebkitBackdropFilter: "saturate(180%) blur(14px)",
          borderBottom: "1px solid",
          borderColor: "rgba(14,42,61,0.06)",
          color: "#0A1A2F",
          zIndex: (t) => t.zIndex.appBar,
          overflow: "visible",
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ overflow: "visible" }}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 76, md: 92 },
              height: { xs: 76, md: 92 },
              px: { xs: 2.5, sm: 3, md: 4 },
              gap: { xs: 2, md: 3 },
              justifyContent: "space-between",
              overflow: "visible",
            }}
          >
            {/* Logo, oversized, overflows the toolbar intentionally */}
            <Box sx={{ position: "relative", zIndex: 1, mt: -2, mb: -6 }}>
              <Logo href="/#top" height={160} ariaLabel={`${brand.name} · home`} />
            </Box>

            {/* Pill cluster with nav items, single container, no artifacts */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 0.25,
                bgcolor: "#FFFFFF",
                border: "1px solid rgba(14,42,61,0.08)",
                borderRadius: 999,
                px: 0.75,
                py: 0.75,
                boxShadow: "0 4px 20px -8px rgba(14,42,61,0.08)",
              }}
            >
              {navLinks.map((l) => (
                <Button
                  key={l.label}
                  href={l.href.startsWith("#") ? `/${l.href}` : l.href}
                  disableRipple
                  sx={{
                    color: "#3B4A55",
                    fontWeight: 500,
                    fontSize: "0.86rem",
                    px: 2.25,
                    py: 0.85,
                    borderRadius: 999,
                    minWidth: "auto",
                    textTransform: "none",
                    transition: "color 200ms ease, background-color 200ms ease",
                    "&:hover": {
                      color: "#0A1A2F",
                      bgcolor: "rgba(217,168,75,0.10)",
                    },
                  }}
                >
                  {l.label}
                </Button>
              ))}
            </Box>

            {/* Right side: primary CTA + vendor sign-in */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Button
                component={Link}
                href="/#waitlist"
                onClick={(e: React.MouseEvent) => {
                  const el = document.getElementById("waitlist");
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                disableElevation
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  py: 1.1,
                  px: 2.5,
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  bgcolor: "#1A1A1A",
                  color: "#FFFFFF !important",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 8px 22px -12px rgba(20,20,20,0.4)",
                  "&:hover": { bgcolor: "#2A2A2A" },
                }}
              >
                Join the waitlist
              </Button>
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.84rem",
                }}
              >
                <Box component="span" sx={{ color: "#5C6770" }}>
                  Already a vendor?
                </Box>
                <Box
                  component={Link}
                  href="/vendor/login"
                  sx={{
                    color: "#0A1A2F",
                    fontWeight: 600,
                    textDecoration: "none",
                    borderBottom: "1px solid transparent",
                    transition: "color 200ms ease, border-color 200ms ease",
                    "&:hover": {
                      color: "#A07823",
                      borderBottomColor: "#A07823",
                    },
                  }}
                >
                  Sign in
                </Box>
              </Box>

              <IconButton
                onClick={() => setDrawer((v) => !v)}
                sx={{
                  display: { xs: "inline-flex", lg: "none" },
                  width: 40,
                  height: 40,
                  bgcolor: drawer ? "#0A1A2F" : "rgba(14,42,61,0.05)",
                  color: drawer ? "#F6F1E7" : "#0A1A2F",
                  "&:hover": { bgcolor: drawer ? "#0A1A2F" : "rgba(14,42,61,0.1)" },
                  transition: "background-color 200ms ease, color 200ms ease",
                }}
                aria-label={drawer ? "Close menu" : "Open menu"}
              >
                {drawer ? <CloseIcon sx={{ fontSize: 20 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawer}
        onClose={() => setDrawer(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 360 },
              bgcolor: "#FBF8F1",
              color: "#0A1A2F",
            },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
            <Logo href="/" height={48} />
            <IconButton onClick={() => setDrawer(false)} aria-label="Close menu" sx={{ color: "#0A1A2F" }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box
            sx={{
              mb: 3.5,
              p: 2,
              borderRadius: 3,
              bgcolor: "rgba(217,168,75,0.10)",
              border: "1px solid rgba(217,168,75,0.28)",
            }}
          >
            <Typography variant="overline" sx={{ color: "#A07823", display: "block", mb: 0.5, fontSize: "0.66rem", letterSpacing: "0.16em" }}>
              FOUNDING ACCESS
            </Typography>
            <Typography variant="body2" sx={{ color: "#3B4A55", fontSize: "0.86rem", lineHeight: 1.55 }}>
              Expert helpline, vendor savings, exclusive content, and a network of 500+ practice owners.
            </Typography>
          </Box>

          <Stack spacing={0.5} sx={{ mb: 4 }}>
            {navLinks.map((l) => (
              <Button
                key={l.label}
                href={l.href.startsWith("#") ? `/${l.href}` : l.href}
                onClick={() => setDrawer(false)}
                disableRipple
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14, opacity: 0.4 }} />}
                sx={{
                  justifyContent: "space-between",
                  color: "#0A1A2F",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  py: 1.5,
                  px: 1.5,
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(14,42,61,0.04)" },
                }}
              >
                {l.label}
              </Button>
            ))}
          </Stack>

          <Button
            component={Link}
            href="/#waitlist"
            onClick={(e: React.MouseEvent) => {
              setDrawer(false);
              const el = document.getElementById("waitlist");
              if (el) {
                e.preventDefault();
                setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
              }
            }}
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            endIcon={<ArrowForwardIcon />}
          >
            Join the waitlist
          </Button>

          <Button
            component={Link}
            href="/vendor/login"
            onClick={() => setDrawer(false)}
            variant="outlined"
            fullWidth
            size="large"
            startIcon={<LoginOutlinedIcon />}
            sx={{
              mt: 1.5,
              borderColor: "rgba(14,42,61,0.18)",
              color: "#0A1A2F",
              textTransform: "none",
              "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.06)" },
            }}
          >
            Already a vendor? Sign in
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
