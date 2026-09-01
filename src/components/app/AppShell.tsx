"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Logo from "@/components/brand/Logo";
import { useSignOut } from "@/lib/auth/identity";
import { useCurrentMember } from "@/lib/hooks/useCurrentMember";
import { MemberAssistant } from "@/components/member/MemberAssistant";
import ProfileEditDialog from "@/components/shared/ProfileEditDialog";

const SIDEBAR_W = 240;

const navItems = [
  { href: "/dashboard", label: "Overview", icon: DashboardOutlinedIcon },
  { href: "/dashboard/resources", label: "Resource library", icon: LibraryBooksOutlinedIcon },
  { href: "/dashboard/systems", label: "Systems", icon: FactCheckOutlinedIcon },
  { href: "/dashboard/experts", label: "Experts", icon: SchoolOutlinedIcon },
  { href: "/dashboard/partners", label: "Partners", icon: StorefrontOutlinedIcon },
  { href: "/dashboard/tools", label: "Tools", icon: CalculateOutlinedIcon },
  { href: "/dashboard/network", label: "Network", icon: HubOutlinedIcon },
  { href: "/dashboard/inbox", label: "Inbox", icon: InboxOutlinedIcon },
  { href: "/dashboard/account", label: "Profile", icon: PersonOutlineOutlinedIcon },
];

function initialsFromName(first?: string | null, last?: string | null): string {
  const a = (first ?? "").trim().charAt(0);
  const b = (last ?? "").trim().charAt(0);
  return (a + b).toUpperCase() || "M";
}

function SidebarContent({
  pathname,
  member,
  onClose,
  onEditProfile,
  avatarUrl,
}: {
  pathname: string;
  member: { first_name: string; last_name: string | null; practice_name: string | null } | null;
  onClose?: () => void;
  onEditProfile: () => void;
  avatarUrl?: string | null;
}) {
  const displayName = member
    ? `${member.first_name}${member.last_name ? " " + member.last_name : ""}`
    : "—";
  const initials = initialsFromName(member?.first_name, member?.last_name);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0A1726",
        color: "common.white",
        backgroundImage:
          "radial-gradient(120% 60% at 50% -20%, rgba(217,168,75,0.10) 0%, transparent 60%)",
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.75 }}>
        <Logo dark height={64} href="/dashboard" />
        <Typography
          sx={{
            mt: 0.75,
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Member portal
        </Typography>
      </Box>

      <Box sx={{ px: 1.75, pb: 1.5 }}>
        <Box
          component="button"
          type="button"
          onClick={onEditProfile}
          sx={{
            all: "unset",
            display: "block",
            width: "100%",
            cursor: "pointer",
            p: 1.5,
            borderRadius: 1.5,
            border: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(255,255,255,0.03)",
            textAlign: "left",
            transition: "background-color 160ms ease, border-color 160ms ease",
            "&:hover": { bgcolor: "rgba(255,255,255,0.07)", borderColor: "rgba(217,168,75,0.32)" },
            "&:focus-visible": { outline: "2px solid var(--gold, #F0C16E)", outlineOffset: 2 },
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Avatar
              src={avatarUrl ?? undefined}
              sx={{
                bgcolor: "rgba(217,168,75,0.18)",
                color: "secondary.light",
                width: 32,
                height: 32,
                fontWeight: 700,
                fontSize: "0.72rem",
                border: "1px solid rgba(217,168,75,0.4)",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{ color: "common.white", fontWeight: 600, fontSize: "0.78rem", lineHeight: 1.2 }}
                noWrap
              >
                {displayName}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.66rem" }} noWrap>
                Edit profile →
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          px: 1.5,
          py: 1,
          flex: 1,
          overflowY: "auto",
          // Slim, surface-matched scrollbar — the default chrome bar reads
          // as a bright white stripe against the navy sidebar.
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.18) transparent",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.14)", borderRadius: 3 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        }}
      >
        <Typography
          sx={{
            color: "rgba(255,255,255,0.32)",
            fontSize: "0.58rem",
            letterSpacing: "0.18em",
            fontWeight: 700,
            mb: 0.75,
            px: 1,
          }}
        >
          NAVIGATE
        </Typography>
        <Stack spacing={0.25}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Box
                key={item.href}
                component={Link}
                href={item.href}
                onClick={onClose}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 1.25,
                  py: 0.7,
                  borderRadius: 1.25,
                  color: active ? "common.white" : "rgba(255,255,255,0.62)",
                  bgcolor: active ? "rgba(217,168,75,0.12)" : "transparent",
                  border: "1px solid",
                  borderColor: active ? "rgba(217,168,75,0.25)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.78rem",
                  fontWeight: active ? 600 : 500,
                  transition: "all 160ms ease",
                  "&:hover": {
                    bgcolor: active ? "rgba(217,168,75,0.16)" : "rgba(255,255,255,0.05)",
                    color: "common.white",
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: 16,
                    color: active ? "secondary.light" : "inherit",
                    flexShrink: 0,
                  }}
                />
                {item.label}
              </Box>
            );
          })}
        </Stack>

        {/* Coming soon — upcoming member features, highlighted so members
            notice what's on the way. */}
        <Box
          sx={{
            mt: 1.75,
            p: 1,
            borderRadius: 1.5,
            bgcolor: "rgba(217,168,75,0.08)",
            border: "1px solid rgba(217,168,75,0.25)",
          }}
        >
          <Typography
            sx={{
              color: "#D9A84B",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              fontWeight: 800,
              mb: 0.75,
              px: 0.5,
            }}
          >
            ✦ COMING SOON
          </Typography>
          <Stack spacing={0.25}>
            {[
              { label: "Chairside", sub: "Podcast", icon: PodcastsIcon },
              { label: "Office Hours", sub: "Live events", icon: EventAvailableOutlinedIcon },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Box
                  key={item.label}
                  aria-disabled
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 0.75,
                    py: 0.7,
                    borderRadius: 1.25,
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "default",
                    userSelect: "none",
                  }}
                >
                  <Icon sx={{ fontSize: 16, flexShrink: 0, color: "#D9A84B", opacity: 0.85 }} />
                  <Box sx={{ minWidth: 0, flex: 1, lineHeight: 1.15 }}>
                    {item.label}
                    <Typography component="span" sx={{ display: "block", fontSize: "0.6rem", color: "rgba(255,255,255,0.45)" }}>
                      {item.sub}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 0.7,
                      py: 0.2,
                      borderRadius: 999,
                      bgcolor: "rgba(217,168,75,0.18)",
                      border: "1px solid rgba(217,168,75,0.45)",
                      color: "#F0C16E",
                      fontSize: "0.55rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      flexShrink: 0,
                    }}
                  >
                    SOON
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* Support — hotline + email reachable from every dashboard page.
          Compact single-line rows so the footer stays short and the nav
          gets the vertical space. */}
      <Box sx={{ px: 1.5, pt: 1, pb: 1.25, flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.32)",
            fontSize: "0.58rem",
            letterSpacing: "0.18em",
            fontWeight: 700,
            textTransform: "uppercase",
            px: 1.25,
            mb: 0.5,
          }}
        >
          Support
        </Typography>
        {[
          { href: "tel:+18556334707", Icon: PhoneRoundedIcon, label: "(855) 633-4707" },
          { href: "mailto:hello@joindmn.com", Icon: EmailOutlinedIcon, label: "hello@joindmn.com" },
        ].map(({ href, Icon, label }) => (
          <Box
            key={href}
            component="a"
            href={href}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.25,
              py: 0.6,
              borderRadius: 1.25,
              color: "rgba(255,255,255,0.68)",
              textDecoration: "none",
              fontSize: "0.76rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "common.white" },
            }}
          >
            <Icon sx={{ fontSize: 15, color: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuAnchor = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const signOut = useSignOut("member");
  const { member } = useCurrentMember();
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const displayName = member
    ? `${member.first_name}${member.last_name ? " " + member.last_name : ""}`
    : "—";
  const email = member?.email ?? "";
  const initials = initialsFromName(member?.first_name, member?.last_name);
  const effectiveAvatar = avatarPreview ?? (member as { avatar_url?: string | null } | null)?.avatar_url ?? null;

  const goTo = (href: string) => {
    setUserMenuOpen(false);
    router.push(href);
  };

  const handleSignOut = () => {
    setUserMenuOpen(false);
    signOut();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F0E6", display: "flex" }}>
      {isMd && (
        <Box
          component="nav"
          sx={{
            width: SIDEBAR_W,
            flexShrink: 0,
            position: "fixed",
            inset: 0,
            right: "auto",
            zIndex: theme.zIndex.appBar - 1,
          }}
        >
          <SidebarContent
            pathname={pathname}
            member={member}
            onEditProfile={() => setProfileOpen(true)}
            avatarUrl={effectiveAvatar}
          />
        </Box>
      )}
      {!isMd && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: SIDEBAR_W, border: "none" } } }}
        >
          <SidebarContent
            pathname={pathname}
            member={member}
            onClose={() => setDrawerOpen(false)}
            onEditProfile={() => {
              setDrawerOpen(false);
              setProfileOpen(true);
            }}
            avatarUrl={effectiveAvatar}
          />
        </Drawer>
      )}

      {/* Profile edit dialog mounted at AppShell root so it overlays all
          content cleanly. */}
      <ProfileEditDialog
        open={profileOpen}
        endpoint="/api/member/profile"
        nameField="memberName"
        initial={{
          avatarUrl: effectiveAvatar,
          firstName: member?.first_name ?? "",
          lastName: member?.last_name ?? "",
        }}
        onClose={() => setProfileOpen(false)}
        onSaved={(next) => {
          if (next.avatarPreview) setAvatarPreview(next.avatarPreview);
        }}
      />


      <Box
        sx={{
          flex: 1,
          ml: { md: `${SIDEBAR_W}px` },
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(244,240,230,0.92)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: { xs: 50, md: 54 }, px: { xs: 1.5, md: 2 } }}>
            {!isMd && (
              <IconButton onClick={() => setDrawerOpen(true)} edge="start" size="small">
                <MenuOutlinedIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1 }} />

            <Box
              ref={userMenuAnchor}
              component="button"
              onClick={() => setUserMenuOpen(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                pl: { xs: 0.5, sm: 1 },
                pr: { xs: 0.5, sm: 0.75 },
                py: 0.25,
                bgcolor: "transparent",
                border: 0,
                borderRadius: "999px",
                cursor: "pointer",
                color: "text.primary",
                fontFamily: "inherit",
                "&:hover": { bgcolor: "rgba(14,42,61,0.05)" },
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "primary.main",
                  color: "common.white",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.15 }} noWrap>
                  {displayName}
                </Typography>
                <Typography sx={{ fontSize: "0.62rem", color: "text.secondary" }}>
                  {member?.tier === "founding" ? "Founding member" : "Member"}
                </Typography>
              </Box>
              <KeyboardArrowDownOutlinedIcon
                sx={{
                  fontSize: 15,
                  color: "text.secondary",
                  transition: "transform 200ms ease",
                  transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </Box>
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
                    minWidth: 220,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 24px 48px -20px rgba(14,42,61,0.25)",
                  },
                },
                list: { sx: { py: 0.5 } },
              }}
            >
              <Box sx={{ px: 1.75, pt: 1.25, pb: 1 }}>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.2 }} noWrap>
                  {displayName}
                </Typography>
                <Typography sx={{ fontSize: "0.66rem", color: "text.secondary" }} noWrap>
                  {email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => goTo("/dashboard/account")} sx={{ py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Profile"
                  slotProps={{ primary: { sx: { fontSize: "0.78rem", fontWeight: 500 } } }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} sx={{ color: "error.main", py: 0.75 }}>
                <ListItemIcon sx={{ color: "error.main", minWidth: 28 }}>
                  <LogoutOutlinedIcon sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Sign out"
                  slotProps={{ primary: { sx: { fontSize: "0.78rem", fontWeight: 500 } } }}
                />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ py: { xs: 2.5, md: 3 }, flex: 1 }}>
          <Container maxWidth="lg">{children}</Container>
        </Box>

        <Divider />
        <Box sx={{ px: 2.5, py: 1.25, color: "text.secondary", fontSize: "0.7rem" }}>
          © 2026 Dental Member Network · Powered by Thriving Dentist
        </Box>
      </Box>

      {/* Concierge bot — floats bottom-right on every member portal page */}
      <MemberAssistant />
    </Box>
  );
}
