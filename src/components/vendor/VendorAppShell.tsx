"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSignOut } from "@/lib/auth/identity";
import {
  AppBar,
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
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import Logo from "@/components/brand/Logo";
import NotificationsBell from "@/components/shared/NotificationsBell";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { fetchCurrentVendor } from "@/lib/supabase/vendorQueries";
import type { VendorsRow } from "@/lib/supabase/types";
import ProfileEditDialog from "@/components/shared/ProfileEditDialog";
import { checkBillingAccess } from "@/lib/stripe";
import BillingGate from "@/components/shared/BillingGate";

function useCurrentVendorRow(): { vendor: VendorsRow | null; loading: boolean } {
  const [vendor, setVendor] = useState<VendorsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();
    (async () => {
      const v = await fetchCurrentVendor(supabase);
      if (!active) return;
      setVendor(v);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { vendor, loading };
}

function initialsFromName(s: string | null | undefined): string {
  const t = (s ?? "").trim();
  if (!t) return "VP";
  const parts = t.split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const SIDEBAR_W_EXPANDED = 240;
const SIDEBAR_W_COLLAPSED = 64;
const COLLAPSE_KEY = "vendor-sidebar-collapsed";

const navItems = [
  { href: "/vendor", label: "Overview", icon: DashboardOutlinedIcon },
  { href: "/vendor/profile", label: "Company profile", icon: StoreOutlinedIcon },
  { href: "/vendor/catalog", label: "Catalog", icon: Inventory2OutlinedIcon },
  { href: "/vendor/offers", label: "Offers", icon: LocalOfferOutlinedIcon },
  { href: "/vendor/inquiries", label: "Inquiries", icon: ChatBubbleOutlineRoundedIcon },
  { href: "/vendor/analytics", label: "Analytics", icon: InsightsRoundedIcon },
  { href: "/vendor/redemptions", label: "Redemptions", icon: ReceiptLongOutlinedIcon },
  { href: "/vendor/account", label: "Account & billing", icon: ManageAccountsOutlinedIcon },
  { href: "/vendor/agreement", label: "Agreement", icon: GavelOutlinedIcon },
];

function SidebarContent({
  pathname,
  collapsed,
  vendor,
  onClose,
  onToggleCollapse,
  showCollapseToggle,
  onEditProfile,
  avatarUrl,
}: {
  pathname: string;
  collapsed: boolean;
  vendor: VendorsRow | null;
  onClose?: () => void;
  onEditProfile: () => void;
  avatarUrl?: string | null;
  onToggleCollapse?: () => void;
  showCollapseToggle?: boolean;
}) {
  const displayName = vendor?.display_name ?? vendor?.company_name ?? "—";
  const category = vendor?.category ?? "";
  const isVerified = vendor?.verified === true;
  const logoUrl = vendor?.logo_url ?? null;
  const initials = initialsFromName(displayName);
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
        transition: "all 240ms cubic-bezier(0.16, 1, 0.3, 1)",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 0 : 2,
          pt: 2.25,
          pb: 1.75,
          flexShrink: 0,
        }}
      >
        {!collapsed ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Logo dark height={44} href="/vendor" />
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <Logo dark height={36} href="/vendor" />
          </Box>
        )}
        {showCollapseToggle && !collapsed && (
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.45)",
              "&:hover": { color: "#F0C16E", bgcolor: "rgba(255,255,255,0.04)" },
            }}
            aria-label="Collapse sidebar"
          >
            <KeyboardDoubleArrowLeftRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Stack>

      {!collapsed && (
        <Box sx={{ px: 2, pb: 1.5, flexShrink: 0 }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Partner Portal
          </Typography>
        </Box>
      )}

      {!collapsed && (
        <Box sx={{ px: 1.75, pb: 1.25, flexShrink: 0 }}>
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
              "&:focus-visible": { outline: "2px solid #F0C16E", outlineOffset: 2 },
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1 }}>
              <Avatar
                src={avatarUrl ?? logoUrl ?? undefined}
                sx={{
                  bgcolor: "rgba(217,168,75,0.18)",
                  color: "secondary.light",
                  width: 32,
                  height: 32,
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  border: "1px solid rgba(217,168,75,0.4)",
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ color: "common.white", fontWeight: 600, fontSize: "0.82rem", lineHeight: 1.2 }} noWrap>
                  {displayName}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.68rem" }} noWrap>
                  {category || "Edit profile →"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
              <Chip
                icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 11 }} />}
                label={isVerified ? "VERIFIED" : "PENDING"}
                size="small"
                sx={{
                  bgcolor: isVerified ? "rgba(34,108,78,0.18)" : "rgba(217,168,75,0.16)",
                  color: isVerified ? "#A8E6BD" : "secondary.light",
                  border: isVerified ? "1px solid rgba(34,108,78,0.4)" : "1px solid rgba(217,168,75,0.35)",
                  fontSize: "0.55rem",
                  height: 18,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
              <Chip
                label="FOUNDING"
                size="small"
                sx={{
                  bgcolor: "rgba(217,168,75,0.14)",
                  color: "secondary.light",
                  border: "1px solid rgba(217,168,75,0.3)",
                  fontSize: "0.55rem",
                  height: 18,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              />
            </Stack>
          </Box>
        </Box>
      )}

      <Box sx={{ px: collapsed ? 1 : 1.5, py: 1, flex: 1, overflowY: "auto" }}>
        {!collapsed && (
          <Typography
            sx={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              fontWeight: 700,
              mb: 0.75,
              px: 1,
            }}
          >
            NAVIGATE
          </Typography>
        )}
        <Stack spacing={0.25}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/vendor"
                ? pathname === "/vendor"
                : pathname.startsWith(item.href);
            const node = (
              <Box
                key={item.href}
                component={Link}
                href={item.href}
                onClick={onClose}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 1.25,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 0 : 1.25,
                  py: 1,
                  borderRadius: 1.5,
                  color: active ? "common.white" : "rgba(255,255,255,0.65)",
                  bgcolor: active ? "rgba(217,168,75,0.12)" : "transparent",
                  border: "1px solid",
                  borderColor: active ? "rgba(217,168,75,0.25)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.84rem",
                  fontWeight: active ? 600 : 500,
                  transition: "all 160ms ease",
                  "&:hover": {
                    bgcolor: active ? "rgba(217,168,75,0.16)" : "rgba(255,255,255,0.05)",
                    color: "common.white",
                  },
                }}
              >
                <Icon sx={{ fontSize: 18, color: active ? "secondary.light" : "inherit", flexShrink: 0 }} />
                {!collapsed && item.label}
              </Box>
            );
            return collapsed ? (
              <Tooltip key={item.href} title={item.label} placement="right" arrow>
                {node}
              </Tooltip>
            ) : (
              node
            );
          })}
        </Stack>
      </Box>

      {!collapsed && (
        <Box sx={{ px: 1.5, pb: 1.5, flexShrink: 0 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />
          <Typography
            sx={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              fontWeight: 700,
              textTransform: "uppercase",
              mb: 0.75,
              px: 0.5,
            }}
          >
            Support
          </Typography>
          <Box
            component="a"
            href="tel:+18556334707"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.25,
              py: 0.85,
              borderRadius: 1.25,
              color: "rgba(255,255,255,0.65)",
              textDecoration: "none",
              transition: "background-color 160ms ease, color 160ms ease",
              "&:hover": { bgcolor: "rgba(255,255,255,0.04)", color: "common.white" },
            }}
          >
            <PhoneRoundedIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.55)" }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.45)", lineHeight: 1 }}>
                Hotline
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "inherit", lineHeight: 1.2, mt: 0.2 }}>
                (855) 633-4707
              </Typography>
            </Box>
          </Box>
          <Box
            component="a"
            href="mailto:partnerships@joindmn.com"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.25,
              py: 0.85,
              borderRadius: 1.25,
              color: "rgba(255,255,255,0.65)",
              textDecoration: "none",
              transition: "background-color 160ms ease, color 160ms ease",
              "&:hover": { bgcolor: "rgba(255,255,255,0.04)", color: "common.white" },
            }}
          >
            <HelpOutlineOutlinedIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.55)" }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.45)", lineHeight: 1 }}>
                Email
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "inherit",
                  lineHeight: 1.2,
                  mt: 0.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                partnerships@joindmn.com
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {showCollapseToggle && collapsed && (
        <Box sx={{ pb: 1.5, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Tooltip title="Expand sidebar" placement="right" arrow>
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                color: "rgba(255,255,255,0.5)",
                "&:hover": { color: "#F0C16E", bgcolor: "rgba(255,255,255,0.04)" },
              }}
              aria-label="Expand sidebar"
            >
              <KeyboardDoubleArrowRightRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

export default function VendorAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuAnchor = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const signOut = useSignOut("vendor");
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Hydrate sidebar state from localStorage after mount. We can't read
  // localStorage in the initial state (SSR vs client mismatch), so we read
  // post-mount and setState once. The lint rule below flags this pattern, but
  // it's the correct shape for one-shot hydration from external storage.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(COLLAPSE_KEY);
    } catch {
      stored = null;
    }
    if (stored === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  // Live vendor row — replaces the old mock import. Used by both the sidebar
  // identity card and the top-right user menu so they always agree.
  const { vendor: currentVendor } = useCurrentVendorRow();
  const topbarDisplayName = currentVendor?.display_name ?? currentVendor?.company_name ?? "—";
  const topbarEmail = currentVendor?.contact_email ?? "";
  const topbarInitials = initialsFromName(topbarDisplayName);
  const topbarLogo = currentVendor?.logo_url ?? undefined;

  const handleSignOut = () => {
    setUserMenuOpen(false);
    signOut();
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
            width: sidebarW,
            flexShrink: 0,
            position: "fixed",
            inset: 0,
            right: "auto",
            zIndex: theme.zIndex.appBar - 1,
            transition: "width 240ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <SidebarContent
            pathname={pathname}
            collapsed={collapsed}
            vendor={currentVendor}
            onToggleCollapse={toggleCollapse}
            showCollapseToggle
            onEditProfile={() => setProfileOpen(true)}
            avatarUrl={
              avatarPreview ??
              ((currentVendor as { avatar_url?: string | null } | null)?.avatar_url ?? null)
            }
          />
        </Box>
      )}
      {!isMd && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: SIDEBAR_W_EXPANDED, border: "none" } } }}
        >
          <SidebarContent
            pathname={pathname}
            collapsed={false}
            vendor={currentVendor}
            onClose={() => setDrawerOpen(false)}
            onEditProfile={() => {
              setDrawerOpen(false);
              setProfileOpen(true);
            }}
            avatarUrl={
              avatarPreview ??
              ((currentVendor as { avatar_url?: string | null } | null)?.avatar_url ?? null)
            }
          />
        </Drawer>
      )}

      <ProfileEditDialog
        open={profileOpen}
        endpoint="/api/vendor/profile/avatar"
        nameField="displayName"
        initial={{
          avatarUrl:
            avatarPreview ??
            ((currentVendor as { avatar_url?: string | null } | null)?.avatar_url ?? currentVendor?.logo_url ?? null),
          displayName: currentVendor?.display_name ?? currentVendor?.company_name ?? "",
        }}
        onClose={() => setProfileOpen(false)}
        onSaved={(next) => {
          if (next.avatarPreview) setAvatarPreview(next.avatarPreview);
        }}
      />


      <Box
        sx={{
          flex: 1,
          ml: { md: `${sidebarW}px` },
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 240ms cubic-bezier(0.16, 1, 0.3, 1)",
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
          <Toolbar sx={{ gap: 1, minHeight: { xs: 52, md: 56 }, px: { xs: 1.5, md: 2 } }}>
            {!isMd && (
              <IconButton onClick={() => setDrawerOpen(true)} edge="start" size="small">
                <MenuOutlinedIcon />
              </IconButton>
            )}
            {isMd && (
              <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
                <IconButton
                  onClick={toggleCollapse}
                  size="small"
                  sx={{ color: "text.secondary" }}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <MenuOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            <Box sx={{ flex: 1 }} />

            <Tooltip title="Help">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <HelpOutlineOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <NotificationsBell audience="vendor" />

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
                ml: 0.5,
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
                src={topbarLogo}
                sx={{ width: 30, height: 30, bgcolor: "primary.main", color: "common.white", fontSize: "0.75rem", fontWeight: 700 }}
              >
                {topbarInitials}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.15 }}>
                  {topbarDisplayName}
                </Typography>
                <Typography sx={{ fontSize: "0.66rem", color: "text.secondary" }}>
                  {currentVendor?.verified ? "Verified Partner" : "Pending Review"}
                </Typography>
              </Box>
              <KeyboardArrowDownOutlinedIcon
                sx={{
                  fontSize: 16,
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
                    minWidth: 240,
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
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }} noWrap>
                  {topbarDisplayName}
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }} noWrap>
                  {topbarEmail}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => goTo("/vendor/profile")} sx={{ py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 32 }}><StoreOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                <ListItemText
                  primary="Company profile"
                  slotProps={{ primary: { sx: { fontSize: "0.82rem", fontWeight: 500 } } }}
                />
              </MenuItem>
              <MenuItem onClick={() => goTo("/vendor/account")} sx={{ py: 0.75 }}>
                <ListItemIcon sx={{ minWidth: 32 }}><ManageAccountsOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
                <ListItemText
                  primary="Account & billing"
                  slotProps={{ primary: { sx: { fontSize: "0.82rem", fontWeight: 500 } } }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} sx={{ color: "error.main", py: 0.75 }}>
                <ListItemIcon sx={{ color: "error.main", minWidth: 32 }}>
                  <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Sign out"
                  slotProps={{ primary: { sx: { fontSize: "0.82rem", fontWeight: 500 } } }}
                />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ py: { xs: 2.5, md: 3 }, flex: 1 }}>
          <Container maxWidth="xl">
            {(() => {
              // Billing gate — locks portal access once the founding
              // waiver runs out and the partner has no healthy
              // subscription. Allow-lists /vendor/account so the partner
              // can always get to billing to update their card or
              // re-sync from Stripe.
              const access = currentVendor
                ? checkBillingAccess({
                    monthsInProgram: currentVendor.months_in_program ?? 0,
                    subscriptionStatus: currentVendor.subscription_status ?? null,
                    hasSubscription: !!currentVendor.stripe_subscription_id,
                  })
                : { allowed: true as const };
              const onAccountPage = pathname.startsWith("/vendor/account");
              if (!access.allowed && !onAccountPage) {
                return (
                  <BillingGate
                    access={access}
                    portalEndpoint="/api/vendor/billing/portal"
                    billingHref="/vendor/account"
                    accent="gold"
                  >
                    {children}
                  </BillingGate>
                );
              }
              return children;
            })()}
          </Container>
        </Box>

        <Divider />
        <Box sx={{ px: 2.5, py: 1.5, color: "text.secondary", fontSize: "0.74rem" }}>
          © 2026 Thriving Dentist Network · Vendor Network · v0.1 prototype
        </Box>
      </Box>
    </Box>
  );
}
