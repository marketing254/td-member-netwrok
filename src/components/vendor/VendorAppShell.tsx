"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
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
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Logo from "@/components/brand/Logo";
import { vendor } from "@/lib/vendorData";

const SIDEBAR_W = 264;

const navItems = [
  { href: "/vendor", label: "Overview", icon: DashboardOutlinedIcon },
  { href: "/vendor/profile", label: "Company profile", icon: StoreOutlinedIcon },
  { href: "/vendor/offers", label: "Offers", icon: LocalOfferOutlinedIcon },
  { href: "/vendor/redemptions", label: "Redemptions", icon: ReceiptLongOutlinedIcon },
  { href: "/vendor/account", label: "Account & billing", icon: ManageAccountsOutlinedIcon },
  { href: "/vendor/agreement", label: "Agreement", icon: GavelOutlinedIcon },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
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
        <Logo dark height={30} href="/vendor" />
        <Typography variant="body2" sx={{ mt: 1.25, color: "rgba(255,255,255,0.55)", fontSize: "0.68rem", letterSpacing: "0.18em", fontWeight: 700, textTransform: "uppercase" }}>
          Partner Portal
        </Typography>
      </Box>

      <Box sx={{ px: 2.25, pb: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: "14px",
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
              {vendor.avatarInitials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: "common.white", fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.2 }} noWrap>
                {vendor.displayName}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.72rem" }} noWrap>
                {vendor.category}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 12 }} />}
              label={vendor.verified ? "VERIFIED" : "PENDING"}
              size="small"
              sx={{
                bgcolor: vendor.verified ? "rgba(34,108,78,0.18)" : "rgba(217,168,75,0.16)",
                color: vendor.verified ? "#A8E6BD" : "secondary.light",
                border: vendor.verified ? "1px solid rgba(34,108,78,0.4)" : "1px solid rgba(217,168,75,0.35)",
                fontSize: "0.6rem",
                height: 20,
                fontWeight: 700,
                letterSpacing: "0.06em",
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
            <Chip
              label="FOUNDING PARTNER"
              size="small"
              sx={{
                bgcolor: "rgba(217,168,75,0.14)",
                color: "secondary.light",
                border: "1px solid rgba(217,168,75,0.3)",
                fontSize: "0.6rem",
                height: 20,
                fontWeight: 700,
                letterSpacing: "0.06em",
              }}
            />
          </Stack>
        </Box>
      </Box>

      <Box sx={{ px: 2.25, py: 1.5, flex: 1 }}>
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
              item.href === "/vendor"
                ? pathname === "/vendor"
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

      <Box sx={{ px: 2.25, pb: 2.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: "14px",
            border: "1px solid rgba(217,168,75,0.28)",
            backgroundImage:
              "linear-gradient(155deg, rgba(217,168,75,0.2) 0%, rgba(14,42,61,0.6) 100%)",
          }}
        >
          <Typography sx={{ fontSize: "0.65rem", letterSpacing: "0.18em", fontWeight: 700, color: "secondary.light", mb: 0.5 }}>
            NEED HELP?
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.78rem", lineHeight: 1.5, mb: 1.25 }}>
            Reach Reshani directly for vendor support — partner@thrivingdentist.com
          </Typography>
          <Button
            href="mailto:partner@thrivingdentist.com"
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              color: "common.white",
              borderColor: "rgba(255,255,255,0.18)",
              bgcolor: "rgba(255,255,255,0.04)",
              "&:hover": { borderColor: "rgba(255,255,255,0.4)", bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            Email partner team
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function VendorAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuAnchor = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { signOut } = useClerk();

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
      {!isMd && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: SIDEBAR_W, border: "none" } } }}
        >
          <SidebarContent pathname={pathname} onClose={() => setDrawerOpen(false)} />
        </Drawer>
      )}

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
              ref={userMenuAnchor}
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
                "&:hover": { bgcolor: "rgba(14,42,61,0.05)" },
              }}
            >
              <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "common.white", fontSize: "0.8rem", fontWeight: 700 }}>
                {vendor.avatarInitials}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.15 }}>
                  {vendor.displayName}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                  Featured Partner
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
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, lineHeight: 1.2 }} noWrap>
                  {vendor.displayName}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }} noWrap>
                  {vendor.contactEmail}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => goTo("/vendor/profile")}>
                <ListItemIcon><StoreOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Company profile"
                  slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }}
                />
              </MenuItem>
              <MenuItem onClick={() => goTo("/vendor/account")}>
                <ListItemIcon><ManageAccountsOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Account & billing"
                  slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }}
                />
              </MenuItem>
              <MenuItem onClick={() => goTo("/vendor/agreement")}>
                <ListItemIcon><GavelOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Partnership agreement"
                  slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} sx={{ color: "error.main" }}>
                <ListItemIcon sx={{ color: "error.main" }}><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Sign out"
                  slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }}
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
          © 2026 Thriving Dentist Network · Vendor Network · v0.1 prototype
        </Box>
      </Box>
    </Box>
  );
}
