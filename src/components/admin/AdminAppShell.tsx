"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import Logo from "@/components/brand/Logo";
import NotificationsBell from "@/components/shared/NotificationsBell";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const SIDEBAR_W = 264;

type CurrentAdmin = {
  email: string;
  full_name: string;
  role: string;
};

type QueueCounts = {
  vendorsPending: number;
  offersPending: number;
  catalogPending: number;
  resourcesPending: number;
  expertsPending: number;
};

function useCurrentAdmin(): CurrentAdmin | null {
  const [me, setMe] = useState<CurrentAdmin | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createBrowserSupabase();
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email?.toLowerCase();
      if (!email) return;
      const { data } = await supabase
        .from("admin_users")
        .select("email, full_name, role")
        .eq("email", email)
        .maybeSingle();
      if (!active) return;
      setMe(
        data ?? {
          email,
          full_name: email.split("@")[0] ?? "Admin",
          role: "admin",
        },
      );
    })();
    return () => {
      active = false;
    };
  }, []);
  return me;
}

function initials(full: string): string {
  return full
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type NavItem = { href: string; label: string; icon: React.ElementType<{ sx?: object }>; badgeKey?: keyof QueueCounts };

// Sidebar nav — grouped by job-to-be-done. Tight 3-section structure
// keeps everything visible on a 13" / 1080p laptop without scrolling;
// the middle nav box scrolls on shorter screens (see SidebarContent).
const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "PEOPLE",
    items: [
      { href: "/admin", label: "Dashboard", icon: DashboardOutlinedIcon },
      { href: "/admin/members", label: "Members", icon: PeopleAltOutlinedIcon },
      { href: "/admin/experts", label: "Experts", icon: SchoolOutlinedIcon, badgeKey: "expertsPending" },
      // URL stays /admin/vendors so routes, /api/admin/vendors, and the
      // vendors DB table don't have to migrate. Label is "Partners"
      // everywhere in the UI.
      { href: "/admin/vendors", label: "Partners", icon: StoreOutlinedIcon, badgeKey: "vendorsPending" },
      { href: "/admin/admins", label: "Admin team", icon: AdminPanelSettingsOutlinedIcon },
    ],
  },
  {
    label: "CONTENT & ENGAGEMENT",
    items: [
      { href: "/admin/resources", label: "Resources", icon: LibraryBooksOutlinedIcon, badgeKey: "resourcesPending" },
      { href: "/admin/content", label: "Catalog", icon: LibraryBooksOutlinedIcon, badgeKey: "catalogPending" },
      { href: "/admin/offers", label: "Partner offers", icon: LocalOfferOutlinedIcon, badgeKey: "offersPending" },
      { href: "/admin/inquiries", label: "Inquiries", icon: ChatBubbleOutlineOutlinedIcon },
      { href: "/admin/feedback", label: "Kit feedback", icon: StarOutlineRoundedIcon },
      { href: "/admin/broadcast", label: "Broadcast", icon: CampaignOutlinedIcon },
      { href: "/admin/referrals", label: "Referrals", icon: LinkRoundedIcon },
      { href: "/admin/hotline", label: "Hotline triage", icon: SupportAgentOutlinedIcon },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { href: "/admin/waitlist", label: "Launch waitlist", icon: MarkEmailReadOutlinedIcon },
      { href: "/admin/audit-log", label: "Audit log", icon: HistoryOutlinedIcon },
    ],
  },
];

function SidebarContent({
  pathname,
  onClose,
  me,
  counts,
}: {
  pathname: string;
  onClose?: () => void;
  me: CurrentAdmin | null;
  counts: QueueCounts;
}) {
  const displayName = me?.full_name ?? "—";
  const role = me?.role ?? "admin";
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
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Logo dark height={26} href="/admin" />
        <Typography variant="body2" sx={{ mt: 1, color: "rgba(255,255,255,0.55)", fontSize: "0.62rem", letterSpacing: "0.18em", fontWeight: 700, textTransform: "uppercase" }}>
          Admin Console
        </Typography>
      </Box>

      <Box sx={{ px: 2.25, pb: 0.75 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(255,255,255,0.03)",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Avatar
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
              {initials(displayName)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: "common.white", fontWeight: 600, fontSize: "0.84rem", lineHeight: 1.2 }} noWrap>
                {displayName}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.68rem", textTransform: "capitalize" }} noWrap>
                {role}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Scrollable nav — `flex: 1 + minHeight: 0` is the magic combo
          that lets this box shrink inside its flex parent so a long nav
          list can scroll instead of pushing the queue card off-screen.
          A custom thin scrollbar keeps it discreet. */}
      <Box
        sx={{
          px: 2.25,
          py: 1,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          // Slim scrollbar — visible on hover but unobtrusive
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255,255,255,0.10)",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            bgcolor: "rgba(255,255,255,0.18)",
          },
        }}
      >
        <Stack spacing={1.25}>
          {navSections.map((sec) => (
            <Box key={sec.label}>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.18em",
                  fontWeight: 700,
                  mb: 0.5,
                  px: 1,
                }}
              >
                {sec.label}
              </Typography>
              <Stack spacing={0.15}>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const badge = item.badgeKey ? counts[item.badgeKey] : 0;
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
                        py: 0.85,
                        borderRadius: 2,
                        color: active ? "common.white" : "rgba(255,255,255,0.65)",
                        bgcolor: active ? "rgba(217,168,75,0.12)" : "transparent",
                        border: "1px solid",
                        borderColor: active ? "rgba(217,168,75,0.25)" : "transparent",
                        textDecoration: "none",
                        fontSize: "0.86rem",
                        fontWeight: active ? 600 : 500,
                        "&:hover": {
                          bgcolor: active ? "rgba(217,168,75,0.16)" : "rgba(255,255,255,0.05)",
                          color: "common.white",
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 18, color: active ? "secondary.light" : "inherit" }} />
                      <Box sx={{ flex: 1 }}>{item.label}</Box>
                      {badge > 0 && (
                        <Chip
                          label={badge}
                          size="small"
                          sx={{
                            bgcolor: "rgba(217,168,75,0.2)",
                            color: "secondary.light",
                            fontWeight: 700,
                            fontSize: "0.62rem",
                            height: 16,
                            minWidth: 20,
                            "& .MuiChip-label": { px: 0.65 },
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
            </Stack>
          </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ px: 2.25, pb: 1.75, pt: 0.5, flexShrink: 0 }}>
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(255,255,255,0.03)",
          }}
        >
          <Typography sx={{ fontSize: "0.6rem", letterSpacing: "0.18em", fontWeight: 700, color: "rgba(255,255,255,0.5)", mb: 0.85 }}>
            QUEUES OPEN
          </Typography>
          {/* 4-column compact stat row — fits cleanly on a single line and
              keeps the bottom of the sidebar small. */}
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "flex-end" }}
          >
            {[
              { value: counts.expertsPending, label: "exp" },
              { value: counts.vendorsPending, label: "par" },
              { value: counts.offersPending, label: "off" },
              { value: counts.catalogPending, label: "cat" },
            ].map((s) => (
              <Stack key={s.label} sx={{ alignItems: "center", minWidth: 0 }}>
                <Typography sx={{ fontFamily: "var(--font-display)", color: "common.white", fontSize: "1.15rem", lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.55)", mt: 0.4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {s.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuAnchor = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const signOut = useSignOut();
  const me = useCurrentAdmin();

  const [counts, setCounts] = useState<QueueCounts>({
    vendorsPending: 0,
    offersPending: 0,
    catalogPending: 0,
    resourcesPending: 0,
    expertsPending: 0,
  });

  const loadCounts = useCallback(async () => {
    try {
      const [overviewRes, resourcesRes] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/resources", { cache: "no-store" }),
      ]);
      const overview = overviewRes.ok
        ? ((await overviewRes.json()) as {
            vendors?: { pending?: number };
            offers?: { pending?: number };
            catalog?: { pending?: number };
            experts?: { pending?: number };
          })
        : {};
      const resources = resourcesRes.ok
        ? ((await resourcesRes.json()) as {
            kits?: { submissionStatus: string }[];
          })
        : {};
      setCounts({
        vendorsPending: overview.vendors?.pending ?? 0,
        offersPending: overview.offers?.pending ?? 0,
        catalogPending: overview.catalog?.pending ?? 0,
        resourcesPending:
          (resources.kits ?? []).filter((k) => k.submissionStatus === "pending_review").length,
        expertsPending: overview.experts?.pending ?? 0,
      });
    } catch {
      // ignore — counts are decorative
    }
  }, []);

  useEffect(() => {
    void loadCounts();
    const t = setInterval(() => void loadCounts(), 90_000);
    return () => clearInterval(t);
  }, [loadCounts]);

  const handleSignOut = () => {
    setUserMenuOpen(false);
    signOut();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F4F0E6", display: "flex" }}>
      {isMd && (
        <Box component="nav" sx={{ width: SIDEBAR_W, flexShrink: 0, position: "fixed", inset: 0, right: "auto", zIndex: theme.zIndex.appBar - 1 }}>
          <SidebarContent pathname={pathname} me={me} counts={counts} />
        </Box>
      )}
      {!isMd && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: SIDEBAR_W, border: "none" } } }}
        >
          <SidebarContent pathname={pathname} onClose={() => setDrawerOpen(false)} me={me} counts={counts} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, ml: { md: `${SIDEBAR_W}px` }, minWidth: 0 }}>
        <AppBar position="sticky" sx={{ bgcolor: "rgba(244,240,230,0.85)", backdropFilter: "blur(14px)", borderBottom: "1px solid", borderColor: "divider", color: "text.primary" }}>
          <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, md: 68 } }}>
            {!isMd && (
              <IconButton onClick={() => setDrawerOpen(true)} edge="start">
                <MenuOutlinedIcon />
              </IconButton>
            )}
            <Chip
              label="ADMIN MODE"
              size="small"
              sx={{
                bgcolor: "rgba(220, 60, 60, 0.12)",
                color: "#8C1D1D",
                border: "1px solid rgba(220,60,60,0.3)",
                fontWeight: 700,
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                height: 24,
              }}
            />
            <Box sx={{ flex: 1 }} />
            <NotificationsBell audience="admin" />
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
                {initials(me?.full_name ?? "")}
              </Avatar>
              <Box sx={{ display: { xs: "none", lg: "block" }, textAlign: "left" }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.15 }}>
                  {me?.full_name ?? "—"}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary", textTransform: "capitalize" }}>
                  Admin · {me?.role ?? "—"}
                </Typography>
              </Box>
              <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 18, color: "text.secondary", ml: 0.25 }} />
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
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, lineHeight: 1.2 }}>
                  {me?.full_name ?? "—"}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                  {me?.email ?? ""}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setUserMenuOpen(false); router.push("/dashboard"); }}>
                <ListItemIcon><PeopleAltOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="View as member" slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }} />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut} sx={{ color: "error.main" }}>
                <ListItemIcon sx={{ color: "error.main" }}><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Sign out" slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: 600 } } }} />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ py: { xs: 3, md: 5 } }}>
          <Container maxWidth="xl">{children}</Container>
        </Box>

        <Divider />
        <Box sx={{ px: 3, py: 2.5, color: "text.secondary", fontSize: "0.8rem" }}>
          © 2026 Thriving Dentist Network · Admin console · v0.1 prototype
        </Box>
      </Box>
    </Box>
  );
}
