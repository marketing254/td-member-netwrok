"use client";
import { useEffect, useState } from "react";
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
import { Show, UserButton } from "@clerk/nextjs";
import { brand, navLinks } from "@/lib/content";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fg = scrolled ? "text.primary" : "rgba(255,255,255,0.92)";
  const fgMuted = scrolled ? "text.secondary" : "rgba(255,255,255,0.72)";

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          top: 0,
          backdropFilter: scrolled ? "saturate(180%) blur(18px)" : "blur(10px)",
          backgroundColor: scrolled ? "rgba(247,245,240,0.88)" : "rgba(6,24,42,0.08)",
          borderBottom: "1px solid",
          borderColor: scrolled ? "divider" : "rgba(255,255,255,0.06)",
          transition: "background-color 280ms ease, backdrop-filter 280ms ease, border-color 280ms ease",
          zIndex: (t) => t.zIndex.appBar,
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, px: { xs: 3, md: 0 } }}>
            <Box
              component="a"
              href="#top"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                textDecoration: "none",
                color: fg,
                transition: "color 250ms ease",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #F0C16E 0%, #D9A84B 100%)",
                  display: "grid",
                  placeItems: "center",
                  color: "#06182A",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 6px 16px -8px rgba(217,168,75,0.6)",
                }}
              >
                T
              </Box>
              <Typography
                variant="h6"
                sx={{
                  textTransform: "none",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "1.0625rem",
                  color: fg,
                  transition: "color 250ms ease",
                }}
              >
                {brand.name}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ ml: 6, display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              {navLinks.map((l) => (
                <Button
                  key={l.href}
                  href={l.href}
                  sx={{ color: fgMuted, fontWeight: 500, "&:hover": { color: fg, bgcolor: "transparent" } }}
                >
                  {l.label}
                </Button>
              ))}
            </Stack>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1.25} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
              <Show when="signed-out">
                <Button
                  href={brand.signInUrl}
                  sx={{ color: fgMuted, "&:hover": { color: fg, bgcolor: "transparent" } }}
                >
                  Sign in
                </Button>
                <Button href={brand.joinUrl} variant="contained" color="secondary" size="small" sx={{ py: 1, px: 2.5 }}>
                  Claim founding spot
                </Button>
              </Show>
              <Show when="signed-in">
                <Box
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    bgcolor: scrolled ? "rgba(14,42,61,0.06)" : "rgba(255,255,255,0.08)",
                    border: "1px solid",
                    borderColor: scrolled ? "rgba(14,42,61,0.08)" : "rgba(255,255,255,0.12)",
                  }}
                >
                  <UserButton />
                </Box>
              </Show>
            </Stack>

            <IconButton
              onClick={() => setDrawer(true)}
              sx={{ display: { xs: "inline-flex", md: "none" }, color: fg }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
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
              width: 320,
              bgcolor: "primary.dark",
              color: "common.white",
              backgroundImage:
                "radial-gradient(60% 55% at 100% 0%, rgba(217,168,75,0.22) 0%, transparent 60%), linear-gradient(180deg, #0A2236 0%, #06182A 100%)",
            },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              variant="h6"
              sx={{ textTransform: "none", fontFamily: "var(--font-display)", color: "common.white" }}
            >
              {brand.name}
            </Typography>
            <IconButton onClick={() => setDrawer(false)} aria-label="Close menu" sx={{ color: "common.white" }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box
            sx={{
              mb: 3.5,
              p: 2,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography variant="overline" sx={{ color: "secondary.light", display: "block", mb: 0.75 }}>
              FOUNDING ACCESS
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)" }}>
              Premium support for practice owners who want fast answers and cleaner decisions.
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ mb: 4 }}>
            {navLinks.map((l) => (
              <Button
                key={l.href}
                href={l.href}
                onClick={() => setDrawer(false)}
                sx={{
                  justifyContent: "flex-start",
                  color: "common.white",
                  fontSize: "1.125rem",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                }}
              >
                {l.label}
              </Button>
            ))}
          </Stack>

          <Show when="signed-out">
            <Stack spacing={1.5}>
              <Button href={brand.joinUrl} variant="contained" color="secondary" fullWidth size="large">
                Claim founding spot
              </Button>
              <Button
                href={brand.signInUrl}
                variant="outlined"
                fullWidth
                sx={{
                  color: "common.white",
                  borderColor: "rgba(255,255,255,0.18)",
                  "&:hover": { borderColor: "rgba(255,255,255,0.35)", bgcolor: "rgba(255,255,255,0.04)" },
                }}
                >
                  Sign in
                </Button>
            </Stack>
          </Show>

          <Show when="signed-in">
            <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Signed in
              </Typography>
              <UserButton />
            </Stack>
          </Show>
        </Box>
      </Drawer>
    </>
  );
}
