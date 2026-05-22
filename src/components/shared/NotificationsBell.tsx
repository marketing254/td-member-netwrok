"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import type { SvgIconComponent } from "@mui/icons-material";

type NotificationRow = {
  id: string;
  audience: "vendor" | "admin";
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
};

const KIND_ICON: Record<string, SvgIconComponent> = {
  vendor_approved: VerifiedUserOutlinedIcon,
  vendor_rejected: StoreOutlinedIcon,
  new_vendor_application: StoreOutlinedIcon,
  offer_submitted: LocalOfferOutlinedIcon,
  catalog_submitted: Inventory2OutlinedIcon,
};

function iconFor(kind: string): SvgIconComponent {
  return KIND_ICON[kind] ?? NotificationsNoneOutlinedIcon;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationsBell({
  audience,
  tone = "light",
}: {
  audience: "vendor" | "admin";
  tone?: "light" | "dark";
}) {
  const router = useRouter();
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?audience=${audience}&limit=20`, {
        cache: "no-store",
      });
      const body = (await res.json()) as { rows?: NotificationRow[]; error?: string };
      if (!res.ok) {
        console.warn("[notifications] fetch failed:", body.error);
        setRows([]);
        return;
      }
      setRows(body.rows ?? []);
    } finally {
      setLoading(false);
    }
  }, [audience]);

  // Initial load + soft refresh every 60s while open.
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => void load(), 60_000);
    return () => clearInterval(t);
  }, [open, load]);

  const unread = useMemo(() => rows.filter((r) => !r.read_at).length, [rows]);

  const markRead = async (id: string) => {
    setBusyId(id);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action: "mark_read" }),
      });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read_at: new Date().toISOString() } : r)));
    } finally {
      setBusyId(null);
    }
  };

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ audience, action: "mark_all_read" }),
    });
    const now = new Date().toISOString();
    setRows((prev) => prev.map((r) => (r.read_at ? r : { ...r, read_at: now })));
  };

  const onItemClick = async (n: NotificationRow) => {
    if (!n.read_at) await markRead(n.id);
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const iconColor = tone === "dark" ? "rgba(255,255,255,0.85)" : "text.secondary";

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          ref={anchorRef}
          size="small"
          onClick={() => setOpen((v) => !v)}
          sx={{ color: iconColor }}
          aria-label="Notifications"
        >
          <Badge
            color="secondary"
            badgeContent={unread > 0 ? unread : 0}
            invisible={unread === 0}
            overlap="circular"
            sx={{ "& .MuiBadge-badge": { fontWeight: 700, fontSize: "0.65rem", minWidth: 16, height: 16 } }}
          >
            {unread > 0 ? (
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 18 }} />
            ) : (
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: { xs: "92vw", sm: 380 },
              maxHeight: 480,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 24px 48px -20px rgba(14,42,61,0.25)",
              overflow: "hidden",
            },
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", px: 1.75, py: 1.25 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "text.primary" }}>
              Notifications
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </Typography>
          </Box>
          <Button
            size="small"
            disabled={unread === 0}
            onClick={markAll}
            startIcon={<DoneAllOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: "none",
              fontSize: "0.74rem",
              color: "#A07823",
              "&:hover": { bgcolor: "rgba(217,168,75,0.06)" },
              "&.Mui-disabled": { color: "#9CA3AB" },
            }}
          >
            Mark all read
          </Button>
        </Stack>
        <Divider />

        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          {loading ? (
            <Stack sx={{ py: 4, alignItems: "center" }}>
              <CircularProgress size={20} sx={{ color: "#A07823" }} />
            </Stack>
          ) : rows.length === 0 ? (
            <Stack sx={{ py: 5, px: 3, alignItems: "center", textAlign: "center" }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: "rgba(14,42,61,0.04)",
                  display: "grid",
                  placeItems: "center",
                  mb: 1.25,
                  color: "text.secondary",
                }}
              >
                <NotificationsNoneRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "text.primary", mb: 0.25 }}>
                No notifications yet
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", maxWidth: 240 }}>
                {audience === "vendor"
                  ? "Updates about your approvals, offers, and redemptions will show up here."
                  : "New vendor applications, offer submissions, and team actions will land here."}
              </Typography>
            </Stack>
          ) : (
            rows.map((n) => {
              const Icon = iconFor(n.kind);
              const unread = !n.read_at;
              return (
                <Box
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onItemClick(n)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onItemClick(n);
                  }}
                  sx={{
                    px: 1.75,
                    py: 1.25,
                    display: "flex",
                    gap: 1.25,
                    borderBottom: "1px solid",
                    borderColor: "rgba(14,42,61,0.05)",
                    bgcolor: unread ? "rgba(217,168,75,0.05)" : "transparent",
                    cursor: "pointer",
                    transition: "background-color 160ms ease",
                    "&:hover": { bgcolor: "rgba(14,42,61,0.04)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.25,
                      bgcolor: unread ? "rgba(217,168,75,0.18)" : "rgba(14,42,61,0.06)",
                      color: unread ? "#A07823" : "text.secondary",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" sx={{ alignItems: "baseline", gap: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "0.84rem",
                          fontWeight: unread ? 700 : 500,
                          color: "text.primary",
                          flex: 1,
                          minWidth: 0,
                        }}
                        noWrap
                      >
                        {n.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "text.secondary", flexShrink: 0 }}>
                        {formatRelative(n.created_at)}
                      </Typography>
                    </Stack>
                    {n.body && (
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: "text.secondary",
                          mt: 0.25,
                          lineHeight: 1.45,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {n.body}
                      </Typography>
                    )}
                  </Box>
                  {unread && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#A07823",
                        flexShrink: 0,
                        mt: 1.25,
                      }}
                    />
                  )}
                  {busyId === n.id && (
                    <CircularProgress size={12} sx={{ color: "#A07823", mt: 1.25 }} />
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Popover>
    </>
  );
}
