"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { ExpertsRow } from "@/lib/supabase/types";

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";
const EXPERT_GREEN_TINT = "#E8F2EC";
const CREAM_BG = "#FBF8F1";
const CREAM_BG_DEEP = "#F4EFE2";
const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const LINE = "#E6DDCF";

type CurrentExpert = Pick<
  ExpertsRow,
  "id" | "email" | "full_name" | "display_name" | "specialty" | "status" | "headshot_url"
>;

function useCurrentExpert(): { expert: CurrentExpert | null; loading: boolean } {
  const [expert, setExpert] = useState<CurrentExpert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createBrowserSupabase();
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email?.toLowerCase();
      if (!email) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("experts")
        .select("id, email, full_name, display_name, specialty, status, headshot_url")
        .eq("email", email)
        .maybeSingle();
      if (!active) return;
      setExpert(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { expert, loading };
}

function initials(name: string | null | undefined): string {
  const t = (name ?? "").trim();
  if (!t) return "EX";
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType<{ sx?: object }>;
};

// Top-of-page nav. Order matches the editorial/creator workflow:
// Dashboard → Resources (upload work) → Inquiries (see who responded) →
// Posts (broadcast) → Profile (manage public-facing).
const navItems: NavItem[] = [
  { href: "/expert", label: "Dashboard", icon: DashboardOutlinedIcon },
  { href: "/expert/resources", label: "Resources", icon: UploadFileOutlinedIcon },
  { href: "/expert/posts", label: "Feed", icon: ChatBubbleOutlineOutlinedIcon },
  { href: "/expert/chatbot", label: "AI helper", icon: SmartToyOutlinedIcon },
  { href: "/expert/inquiries", label: "Inquiries", icon: InsightsOutlinedIcon },
  { href: "/expert/profile", label: "Profile", icon: ManageAccountsOutlinedIcon },
];

function isActive(itemHref: string, pathname: string): boolean {
  if (itemHref === "/expert") return pathname === "/expert";
  return pathname.startsWith(itemHref);
}

/**
 * WorkspaceMark
 *
 * Standalone wordmark for the expert workspace — no DMN logo, no platform
 * cues. A small filled square with the monogram + "Workspace" set in the
 * display serif. Feels like a tool of theirs, not a tenant of someone
 * else's network.
 */
function WorkspaceMark({ href }: { href: string }) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        textDecoration: "none",
        color: "inherit",
        "&:hover .ws-mark": {
          transform: "scale(1.06)",
        },
      }}
    >
      <Box
        className="ws-mark"
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.25,
          background: `linear-gradient(140deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
          color: "#FFFFFF",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-display)",
          fontSize: "1.05rem",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18), 0 6px 14px -10px rgba(44,122,82,0.55)",
          transition: "transform 200ms ease",
        }}
      >
        e
      </Box>
      <Box sx={{ display: { xs: "none", sm: "block" }, lineHeight: 1 }}>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            fontWeight: 500,
            color: INK,
            letterSpacing: "-0.015em",
            lineHeight: 1,
          }}
        >
          Workspace
        </Typography>
        <Typography
          sx={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: EXPERT_GREEN_DARK,
            textTransform: "uppercase",
            mt: 0.5,
          }}
        >
          Expert · bench
        </Typography>
      </Box>
    </Box>
  );
}

function NavTabs({
  pathname,
  expanded,
  onNavigate,
}: {
  pathname: string;
  expanded?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Stack
      direction={expanded ? "column" : "row"}
      spacing={expanded ? 0.5 : 0.5}
      sx={{
        alignItems: expanded ? "stretch" : "center",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, pathname);
        return (
          <Box
            key={item.href}
            component={Link}
            href={item.href}
            onClick={onNavigate}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: expanded ? 2 : 1.75,
              py: expanded ? 1.5 : 1,
              borderRadius: expanded ? 2 : "999px",
              textDecoration: "none",
              fontSize: "0.92rem",
              fontWeight: active ? 700 : 500,
              color: active ? INK : INK_SOFT,
              bgcolor: active ? (expanded ? EXPERT_GREEN_TINT : "transparent") : "transparent",
              borderBottom: !expanded ? "2px solid" : "none",
              borderColor: active ? EXPERT_GREEN : "transparent",
              transition: "color 180ms ease, background-color 180ms ease, border-color 180ms ease",
              "&:hover": {
                color: INK,
                bgcolor: expanded ? EXPERT_GREEN_TINT : "rgba(44,122,82,0.06)",
              },
            }}
          >
            <Icon sx={{ fontSize: 18, color: active ? EXPERT_GREEN : "inherit" }} />
            <Box>{item.label}</Box>
          </Box>
        );
      })}
    </Stack>
  );
}

export default function ExpertAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuAnchor = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const { expert } = useCurrentExpert();

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    try {
      await fetch("/api/expert/login", { method: "DELETE" });
    } catch {
      // ignore — best effort
    }
    router.push("/expert/login");
  };

  const displayName = expert?.display_name ?? expert?.full_name ?? "Expert";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: CREAM_BG,
        // Subtle paper-grain feel — tiny radial gradient at the top edge
        // so the cream doesn't read as flat.
        backgroundImage: `
          radial-gradient(80% 50% at 50% 0%, ${CREAM_BG_DEEP} 0%, transparent 60%),
          radial-gradient(40% 30% at 100% 0%, rgba(44,122,82,0.04) 0%, transparent 100%)
        `,
      }}
    >
      {/* Top bar: logo · nav · avatar */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: "rgba(251,248,241,0.85)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            sx={{
              minHeight: { xs: 60, md: 72 },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* LEFT — standalone workspace mark (no DMN logo) */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
              {!isMd && (
                <IconButton
                  onClick={() => setDrawerOpen(true)}
                  edge="start"
                  size="small"
                  sx={{ color: INK }}
                >
                  <MenuOutlinedIcon />
                </IconButton>
              )}
              <WorkspaceMark href="/expert" />
            </Stack>

            {/* CENTER — desktop nav */}
            {isMd && (
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <NavTabs pathname={pathname} />
              </Box>
            )}

            {/* RIGHT — public profile + user menu */}
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Box
                ref={userMenuAnchor}
                component="button"
                onClick={() => setUserMenuOpen(true)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: { xs: 0.5, sm: 1 },
                  py: 0.5,
                  bgcolor: "transparent",
                  border: 0,
                  borderRadius: "999px",
                  cursor: "pointer",
                  color: INK,
                  fontFamily: "inherit",
                  transition: "background-color 180ms ease",
                  "&:hover": { bgcolor: "rgba(14,26,47,0.04)" },
                }}
              >
                <Avatar
                  src={expert?.headshot_url ?? undefined}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: EXPERT_GREEN,
                    color: "#FFFFFF",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  {initials(displayName)}
                </Avatar>
                <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left" }}>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.15, color: INK }}>
                    {displayName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: INK_MUTED }}>
                    {expert?.status === "active" ? "Active" : expert?.status ?? "—"}
                  </Typography>
                </Box>
                <KeyboardArrowDownOutlinedIcon
                  sx={{ fontSize: 16, color: INK_MUTED, ml: 0.25, display: { xs: "none", sm: "block" } }}
                />
              </Box>
            </Stack>

            <Menu
              open={userMenuOpen}
              onClose={() => setUserMenuOpen(false)}
              anchorEl={userMenuAnchor.current}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 260,
                    borderRadius: "16px",
                    border: `1px solid ${LINE}`,
                    boxShadow: "0 24px 60px -28px rgba(14,42,61,0.25)",
                    overflow: "hidden",
                  },
                },
                list: { sx: { py: 0.5 } },
              }}
            >
              <Box sx={{ px: 2, pt: 1.5, pb: 1.25 }}>
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, lineHeight: 1.2, color: INK }}>
                  {displayName}
                </Typography>
                <Typography sx={{ fontSize: "0.74rem", color: INK_MUTED }}>
                  {expert?.email ?? ""}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push("/expert/profile");
                }}
              >
                <ListItemIcon>
                  <ManageAccountsOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Edit profile"
                  slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }}
                />
              </MenuItem>
              <MenuItem
                component="a"
                href="/experts"
                target="_blank"
                rel="noopener"
                onClick={() => setUserMenuOpen(false)}
              >
                <ListItemIcon>
                  <OpenInNewRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="View public experts page"
                  slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} sx={{ color: "error.main" }}>
                <ListItemIcon sx={{ color: "error.main" }}>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Sign out"
                  slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }}
                />
              </MenuItem>
            </Menu>
          </Stack>
        </Container>
      </Box>

      {/* Mobile drawer with nav tabs */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 280, bgcolor: CREAM_BG } } }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ mb: 3 }}>
            <WorkspaceMark href="/expert" />
          </Box>
          <NavTabs pathname={pathname} expanded onNavigate={() => setDrawerOpen(false)} />
          <Divider sx={{ my: 2.5 }} />
          <Stack spacing={0.5}>
            <Chip
              label={expert?.email ?? ""}
              size="small"
              sx={{
                bgcolor: EXPERT_GREEN_TINT,
                color: EXPERT_GREEN_DARK,
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
                alignSelf: "flex-start",
              }}
            />
          </Stack>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          {children}
        </Container>
      </Box>

      {/* Footer — quiet, editorial; no DMN cue */}
      <Box
        sx={{
          py: 3.5,
          borderTop: `1px solid ${LINE}`,
          mt: 6,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: EXPERT_GREEN,
                  boxShadow: `0 0 0 3px ${EXPERT_GREEN}22`,
                }}
              />
              <Typography sx={{ fontSize: "0.74rem", color: INK_MUTED, letterSpacing: "0.04em" }}>
                Workspace · all systems normal
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2.5} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
              <Box
                component="a"
                href="tel:+18556334707"
                sx={{
                  fontSize: "0.74rem",
                  color: EXPERT_GREEN_DARK,
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Hotline: (855) 633-4707
              </Box>
              <Box
                component="a"
                href="mailto:experts@joindmn.com"
                sx={{
                  fontSize: "0.74rem",
                  color: EXPERT_GREEN_DARK,
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                experts@joindmn.com
              </Box>
              <Typography sx={{ fontSize: "0.72rem", color: INK_MUTED }}>
                Powered by Thriving Dentist
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
