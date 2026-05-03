"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import UpgradeOutlinedIcon from "@mui/icons-material/UpgradeOutlined";
import Logo from "@/components/brand/Logo";
import { member } from "@/lib/memberData";

const SIDEBAR_W = 264;

const navItems = [
  { href: "/dashboard", label: "Overview", icon: DashboardOutlinedIcon },
  { href: "/dashboard/courses", label: "Courses", icon: SchoolOutlinedIcon },
  { href: "/dashboard/rewards", label: "Rewards", icon: RedeemOutlinedIcon },
  { href: "/dashboard/certificates", label: "Certifications", icon: WorkspacePremiumOutlinedIcon },
  { href: "/dashboard/account", label: "Account", icon: ManageAccountsOutlinedIcon },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const ceProgress = (member.ceCreditsEarnedYtd / member.ceCreditsGoalYtd) * 100;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0A1726",
        color: "common.white",
        backgroundImage:
          "radial-gradient(120% 60% at 50% -20%, rgba(217,168,75,0.12) 0%, transparent 60%)",
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Logo dark height={30} href="/dashboard" />
      </Box>

      <Box sx={{ px: 2.25, pb: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(255,255,255,0.03)",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(217,168,75,0.18)",
                color: "secondary.light",
                width: 38,
                height: 38,
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "1px solid rgba(217,168,75,0.4)",
              }}
            >
              {member.avatarInitials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: "common.white", fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.2 }} noWrap>
                Dr. {member.firstName} {member.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.74rem" }} noWrap>
                {member.practice}
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={member.tier}
            size="small"
            sx={{
              bgcolor: "rgba(217,168,75,0.14)",
              color: "secondary.light",
              border: "1px solid rgba(217,168,75,0.3)",
              fontSize: "0.65rem",
              height: 22,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          />
        </Box>
      </Box>

      <Box sx={{ px: 2.25, py: 1.5 }}>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            fontWeight: 700,
            mb: 1,
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
                  gap: 1.5,
                  px: 1.5,
                  py: 1.1,
                  borderRadius: 2,
                  color: active ? "common.white" : "rgba(255,255,255,0.65)",
                  bgcolor: active ? "rgba(217,168,75,0.12)" : "transparent",
                  border: "1px solid",
                  borderColor: active ? "rgba(217,168,75,0.25)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: active ? 600 : 500,
                  transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
                  "&:hover": {
                    bgcolor: active ? "rgba(217,168,75,0.16)" : "rgba(255,255,255,0.05)",
                    color: "common.white",
                  },
                }}
              >
                <Icon sx={{ fontSize: 20, color: active ? "secondary.light" : "inherit" }} />
                {item.label}
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ px: 2.25, mt: "auto", pb: 2.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: "14px",
            border: "1px solid rgba(217,168,75,0.28)",
            backgroundImage:
              "linear-gradient(155deg, rgba(217,168,75,0.2) 0%, rgba(14,42,61,0.6) 100%)",
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              fontWeight: 700,
              color: "secondary.light",
              mb: 0.75,
            }}
          >
            CE PROGRESS · 2026
          </Typography>
          <Typography sx={{ color: "common.white", fontFamily: "var(--font-display)", fontSize: "1.5rem", lineHeight: 1 }}>
            {member.ceCreditsEarnedYtd}{" "}
            <Box component="span" sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.95rem" }}>
              / {member.ceCreditsGoalYtd}
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", fontSize: "0.74rem", mb: 1.25 }}>
            credits earned
          </Typography>
          <LinearProgress
            variant="determinate"
            value={ceProgress}
            sx={{
              height: 5,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.08)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                backgroundImage: "linear-gradient(90deg, #D9A84B 0%, #F0C16E 100%)",
              },
            }}
          />
        </Box>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<PhoneInTalkOutlinedIcon />}
          sx={{
            color: "common.white",
            borderColor: "rgba(255,255,255,0.18)",
            bgcolor: "rgba(255,255,255,0.04)",
            "&:hover": { borderColor: "rgba(255,255,255,0.4)", bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          Open hotline case
        </Button>
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
  const userMenuAnchor = useRef<HTMLButtonElement | null>(null);
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const displayFirst = user?.firstName ?? member.firstName;
  const displayLast = user?.lastName ?? member.lastName;
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? member.email;
  const displayInitials =
    `${displayFirst?.[0] ?? ""}${displayLast?.[0] ?? ""}`.toUpperCase() || member.avatarInitials;

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut({ redirectUrl: "/" });
  };

  const goTo = (href: string) => {
    setUserMenuOpen(false);
    router.push(href);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F0E6", display: "flex" }}>
      {/* Sidebar — desktop */}
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
          <SidebarContent pathname={pathname} />
        </Box>
      )}

      {/* Sidebar — mobile drawer */}
      {!isMd && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: SIDEBAR_W, border: "none" } } }}
        >
          <SidebarContent pathname={pathname} onClose={() => setDrawerOpen(false)} />
        </Drawer>
      )}

      {/* Main column */}
      <Box sx={{ flex: 1, ml: { md: `${SIDEBAR_W}px` }, minWidth: 0 }}>
        <AppBar
          position="sticky"
          sx={{
            bgcolor: "rgba(244,240,230,0.85)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, md: 68 } }}>
            {!isMd && (
              <IconButton onClick={() => setDrawerOpen(true)} edge="start">
                <MenuOutlinedIcon />
              </IconButton>
            )}
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1.25, maxWidth: 480 }}>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.75,
                  py: 1,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(255,255,255,0.65)",
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Box component="span">Search courses, vendors, playbooks…</Box>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Help">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <HelpOutlineOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <Badge color="secondary" variant="dot" overlap="circular">
                  <NotificationsNoneOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Box
              ref={userMenuAnchor as unknown as React.RefObject<HTMLDivElement>}
              component="button"
              onClick={() => setUserMenuOpen(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                pl: { xs: 0, sm: 1.25 },
                pr: { xs: 0, sm: 1 },
                py: 0.5,
                ml: 0.5,
                borderLeft: { xs: 0, sm: "1px solid" },
                borderColor: "divider",
                bgcolor: "transparent",
                border: 0,
                borderRadius: "999px",
                cursor: "pointer",
                color: "text.primary",
                fontFamily: "inherit",
                transition: "background-color 180ms ease",
                "&:hover": { bgcolor: "rgba(14,42,61,0.05)" },
                "&:focus-visible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "primary.main",
                  color: "common.white",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {displayInitials}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.15 }}>
                  Dr. {displayFirst} {displayLast}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                  {member.tier}
                </Typography>
              </Box>
              <KeyboardArrowDownOutlinedIcon
                sx={{
                  fontSize: 18,
                  color: "text.secondary",
                  transition: "transform 200ms ease",
                  transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)",
                  ml: 0.25,
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
                    minWidth: 280,
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 24px 48px -20px rgba(14,42,61,0.25)",
                    overflow: "hidden",
                  },
                },
                list: { sx: { py: 0.5 } },
              }}
            >
              <Box sx={{ px: 2, pt: 1.5, pb: 1.25 }}>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "primary.main",
                      color: "common.white",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    {displayInitials}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, lineHeight: 1.2 }} noWrap>
                      Dr. {displayFirst} {displayLast}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }} noWrap>
                      {displayEmail}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={member.tier}
                  size="small"
                  sx={{
                    mt: 1.25,
                    bgcolor: "rgba(217,168,75,0.14)",
                    color: "#A07823",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    height: 22,
                    letterSpacing: "0.06em",
                  }}
                />
              </Box>
              <Divider />
              <MenuItem onClick={() => goTo("/dashboard/account")}>
                <ListItemIcon>
                  <ManageAccountsOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Account settings"
                  secondary="Profile, password, preferences"
                  slotProps={{
                    primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } },
                    secondary: { sx: { fontSize: "0.74rem" } },
                  }}
                />
              </MenuItem>
              <MenuItem onClick={() => goTo("/dashboard/account?tab=subscription")}>
                <ListItemIcon>
                  <UpgradeOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Subscription & plan"
                  secondary={`Founding · $${49}/mo`}
                  slotProps={{
                    primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } },
                    secondary: { sx: { fontSize: "0.74rem" } },
                  }}
                />
              </MenuItem>
              <MenuItem onClick={() => goTo("/dashboard/account?tab=billing")}>
                <ListItemIcon>
                  <ReceiptLongOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Billing & invoices"
                  secondary="View, download, payment method"
                  slotProps={{
                    primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } },
                    secondary: { sx: { fontSize: "0.74rem" } },
                  }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} sx={{ color: "error.main" }}>
                <ListItemIcon sx={{ color: "error.main" }}>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Sign out"
                  slotProps={{
                    primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } },
                  }}
                />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ py: { xs: 3, md: 5 } }}>
          <Container maxWidth="xl">{children}</Container>
        </Box>

        <Divider />
        <Box sx={{ px: 3, py: 2.5, color: "text.secondary", fontSize: "0.8rem" }}>
          © 2026 Thriving Dentist Network · Founding member workspace · v0.1 prototype
        </Box>
      </Box>
    </Box>
  );
}
