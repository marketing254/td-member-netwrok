"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

type SubmissionStatus = "draft" | "pending_review" | "approved" | "rejected";

type AdminKit = {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  portalCardUrl: string | null;
  resourceCardUrl: string | null;
  itemCount: number;
  videoCount: number;
  isFree: boolean;
  isPublished: boolean;
  submissionStatus: SubmissionStatus;
  submittedBy: string | null;
  submittedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  representativeId: string;
};

const STATUS_TABS: { value: "all" | SubmissionStatus; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "all", label: "All" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminResourcesPage() {
  const [kits, setKits] = useState<AdminKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | SubmissionStatus>("pending_review");
  const [toast, setToast] = useState<string | null>(null);
  const [rejectKit, setRejectKit] = useState<AdminKit | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/resources", { cache: "no-store" });
      const body = (await res.json()) as { kits?: AdminKit[]; error?: string };
      if (!res.ok) {
        setError(body.error ?? `Load failed (${res.status})`);
        setKits([]);
        return;
      }
      setKits(body.kits ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
      setKits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(
    () => ({
      pending_review: kits.filter((k) => k.submissionStatus === "pending_review").length,
      approved: kits.filter((k) => k.submissionStatus === "approved").length,
      rejected: kits.filter((k) => k.submissionStatus === "rejected").length,
      draft: kits.filter((k) => k.submissionStatus === "draft").length,
      all: kits.length,
    }),
    [kits],
  );

  const visible = useMemo(
    () => (tab === "all" ? kits : kits.filter((k) => k.submissionStatus === tab)),
    [kits, tab],
  );

  const callAction = async (
    slug: string,
    action: "approve" | "reject" | "publish" | "unpublish",
    extra?: { reason?: string },
  ) => {
    try {
      const res = await fetch(`/api/admin/resources/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(extra ?? {}) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast(body?.error ?? `Action failed (${res.status})`);
        return;
      }
      setToast(`${action.charAt(0).toUpperCase() + action.slice(1)}d.`);
      void load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Action failed.");
    }
  };

  const onConfirmReject = async () => {
    if (!rejectKit) return;
    await callAction(rejectKit.slug, "reject", { reason: rejectReason });
    setRejectKit(null);
    setRejectReason("");
  };

  const onDelete = async (slug: string) => {
    if (!confirm(`Delete this kit? Every file row for "${slug}" will be removed. The Storage files stay in place. This cannot be undone.`)) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/admin/resources/${slug}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast(body?.error ?? `Delete failed (${res.status})`);
        return;
      }
      setToast(`Deleted (${body?.rowsDeleted ?? 0} rows).`);
      void load();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "flex-end" }, justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.18em", color: "#7A8590", textTransform: "uppercase", mb: 0.5 }}>
            Content
          </Typography>
          <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.4rem", md: "1.6rem" }, fontWeight: 500, color: "#0A1A2F", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            Resource kits
          </Typography>
          <Typography sx={{ fontSize: "0.84rem", color: "#5C6770", mt: 0.5, maxWidth: 640 }}>
            Approve team submissions, toggle visibility, and manage the founding-kit library. Approved + published kits show up on the public /resources page and inside the member portal.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/resources/new"
          variant="contained"
          size="small"
          disableElevation
          startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: "#0A1A2F",
            textTransform: "none",
            fontSize: "0.84rem",
            fontWeight: 600,
            borderRadius: 0.75,
            px: 1.75,
            py: 0.85,
            "&:hover": { bgcolor: "#0F2540" },
          }}
        >
          Submit new kit
        </Button>
      </Stack>

      {/* Tab strip */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          minHeight: 36,
          "& .MuiTab-root": {
            minHeight: 36,
            textTransform: "none",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#5C6770",
            px: 1.5,
          },
          "& .MuiTabs-indicator": { backgroundColor: "#A07823" },
          "& .Mui-selected": { color: "#0A1A2F !important" },
        }}
      >
        {STATUS_TABS.map((t) => {
          const c = t.value === "all" ? counts.all : counts[t.value];
          return (
            <Tab
              key={t.value}
              value={t.value}
              label={
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <span>{t.label}</span>
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      bgcolor: "rgba(14,42,61,0.06)",
                      color: "#5C6770",
                      px: 0.6,
                      py: 0.1,
                      borderRadius: 0.5,
                      minWidth: 18,
                      textAlign: "center",
                    }}
                  >
                    {c}
                  </Box>
                </Stack>
              }
            />
          );
        })}
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 1, fontSize: "0.82rem" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress size={22} sx={{ color: "#A07823" }} />
        </Stack>
      ) : visible.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", borderTop: "1px solid rgba(14,42,61,0.08)", borderBottom: "1px solid rgba(14,42,61,0.08)" }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#0A1A2F", mb: 0.5 }}>
            Nothing here yet.
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "#5C6770" }}>
            {tab === "pending_review"
              ? "No kits awaiting approval."
              : tab === "approved"
                ? "No approved kits yet."
                : tab === "rejected"
                  ? "No rejected kits."
                  : "No kits in the catalog."}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {visible.map((k) => (
            <KitRow
              key={k.slug}
              kit={k}
              deleting={deleting === k.slug}
              onApprove={() => callAction(k.slug, "approve")}
              onReject={() => {
                setRejectKit(k);
                setRejectReason("");
              }}
              onPublish={() => callAction(k.slug, "publish")}
              onUnpublish={() => callAction(k.slug, "unpublish")}
              onDelete={() => onDelete(k.slug)}
            />
          ))}
        </Stack>
      )}

      {/* Reject dialog */}
      <Dialog
        open={!!rejectKit}
        onClose={() => setRejectKit(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600 }}>
          Reject &ldquo;{rejectKit?.title ?? ""}&rdquo;?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.84rem", color: "#5C6770", mb: 1.5 }}>
            The kit will be marked rejected and hidden from members and the public site. The submitter can revise and resubmit.
          </Typography>
          <TextField
            label="Reason (optional, shown to the submitter)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectKit(null)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={onConfirmReject}
            variant="contained"
            disableElevation
            sx={{ bgcolor: "#8C1D1D", textTransform: "none", "&:hover": { bgcolor: "#6E1717" } }}
          >
            Reject kit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={2600}
        onClose={() => setToast(null)}
        message={toast ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Stack>
  );
}

function KitRow({
  kit,
  deleting,
  onApprove,
  onReject,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  kit: AdminKit;
  deleting: boolean;
  onApprove: () => void;
  onReject: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "stretch", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.75,
        p: 1.75,
        border: "1px solid rgba(14,42,61,0.08)",
        borderRadius: 1.25,
        bgcolor: "#FFFFFF",
        transition: "border-color 160ms ease",
        "&:hover": { borderColor: "rgba(14,42,61,0.18)" },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          width: { xs: "100%", sm: 90 },
          aspectRatio: "1 / 1",
          flexShrink: 0,
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#0A1A2F",
          backgroundImage: kit.portalCardUrl
            ? `url("${kit.portalCardUrl}")`
            : "linear-gradient(135deg, #061322 0%, #0A1A2F 50%, #1F3850 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Title + meta */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.4 }}>
          <StatusBadge status={kit.submissionStatus} />
          {kit.isFree && <SmallTag label="Free" tone="leaf" />}
          {kit.category && <SmallTag label={kit.category} tone="neutral" />}
          {!kit.isPublished && kit.submissionStatus === "approved" && (
            <SmallTag label="Unpublished" tone="gold" />
          )}
        </Stack>
        <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#0A1A2F", lineHeight: 1.25 }}>
          {kit.title}
        </Typography>
        {kit.summary && (
          <Typography
            sx={{
              fontSize: "0.78rem",
              color: "#5C6770",
              lineHeight: 1.5,
              mt: 0.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {kit.summary}
          </Typography>
        )}
        <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, alignItems: "center", flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.72rem", color: "#7A8590" }}>
            {kit.itemCount} {kit.itemCount === 1 ? "item" : "items"}
            {kit.videoCount > 0 ? ` · ${kit.videoCount} video${kit.videoCount === 1 ? "" : "s"}` : ""}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#7A8590" }}>
            · Added {formatDate(kit.createdAt)}
          </Typography>
          {kit.approvedAt && (
            <Typography sx={{ fontSize: "0.72rem", color: "#1F5C40" }}>
              · Approved {formatDate(kit.approvedAt)}
            </Typography>
          )}
        </Stack>
        {kit.rejectedReason && kit.submissionStatus === "rejected" && (
          <Box
            sx={{
              mt: 0.75,
              p: 1,
              borderRadius: 0.75,
              bgcolor: "rgba(140,29,29,0.06)",
              border: "1px solid rgba(140,29,29,0.18)",
            }}
          >
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#8C1D1D", letterSpacing: "0.08em", textTransform: "uppercase", mb: 0.25 }}>
              Reason
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: "#3B4A55", lineHeight: 1.5 }}>
              {kit.rejectedReason}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        {kit.submissionStatus === "pending_review" && (
          <>
            <ActionButton
              onClick={onApprove}
              tone="leaf"
              icon={<CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />}
              label="Approve"
            />
            <ActionButton
              onClick={onReject}
              tone="signal"
              icon={<HighlightOffOutlinedIcon sx={{ fontSize: 16 }} />}
              label="Reject"
            />
          </>
        )}
        {kit.submissionStatus === "approved" && (
          <>
            {kit.isPublished ? (
              <ActionButton
                onClick={onUnpublish}
                tone="neutral"
                icon={<VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />}
                label="Unpublish"
              />
            ) : (
              <ActionButton
                onClick={onPublish}
                tone="leaf"
                icon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                label="Publish"
              />
            )}
          </>
        )}
        {kit.submissionStatus === "rejected" && (
          <ActionButton
            onClick={onApprove}
            tone="leaf"
            icon={<CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />}
            label="Approve anyway"
          />
        )}
        <IconButton
          component={Link}
          href={`/dashboard/resources/${kit.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Preview kit"
          size="small"
          sx={{ color: "#5C6770", "&:hover": { color: "#0A1A2F", bgcolor: "rgba(14,42,61,0.04)" } }}
        >
          <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          onClick={onDelete}
          disabled={deleting}
          aria-label="Delete kit"
          size="small"
          sx={{ color: "#8C1D1D", "&:hover": { bgcolor: "rgba(140,29,29,0.06)" } }}
        >
          {deleting ? (
            <CircularProgress size={14} sx={{ color: "inherit" }} />
          ) : (
            <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      </Stack>
    </Box>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const palette = {
    draft: { bg: "rgba(14,42,61,0.06)", fg: "#5C6770", border: "rgba(14,42,61,0.16)", label: "Draft" },
    pending_review: { bg: "rgba(217,168,75,0.14)", fg: "#7A5B17", border: "rgba(217,168,75,0.4)", label: "Pending review" },
    approved: { bg: "rgba(34,108,78,0.1)", fg: "#1F5C40", border: "rgba(34,108,78,0.28)", label: "Approved" },
    rejected: { bg: "rgba(140,29,29,0.06)", fg: "#8C1D1D", border: "rgba(140,29,29,0.26)", label: "Rejected" },
  }[status];
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.85,
        height: 20,
        borderRadius: 0.5,
        bgcolor: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        fontSize: "0.6rem",
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: palette.fg, opacity: 0.9 }} />
      {palette.label}
    </Box>
  );
}

function SmallTag({ label, tone }: { label: string; tone: "leaf" | "gold" | "neutral" }) {
  const palette =
    tone === "leaf"
      ? { bg: "rgba(34,108,78,0.1)", fg: "#1F5C40", border: "rgba(34,108,78,0.28)" }
      : tone === "gold"
        ? { bg: "rgba(217,168,75,0.1)", fg: "#7A5B17", border: "rgba(217,168,75,0.32)" }
        : { bg: "rgba(14,42,61,0.04)", fg: "#3B4A55", border: "rgba(14,42,61,0.1)" };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 0.75,
        height: 18,
        borderRadius: 0.5,
        bgcolor: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Box>
  );
}

function ActionButton({
  onClick,
  tone,
  icon,
  label,
}: {
  onClick: () => void;
  tone: "leaf" | "signal" | "neutral";
  icon: React.ReactNode;
  label: string;
}) {
  const palette =
    tone === "leaf"
      ? { bg: "#1F5C40", hover: "#19533A" }
      : tone === "signal"
        ? { bg: "#8C1D1D", hover: "#6E1717" }
        : { bg: "#0A1A2F", hover: "#0F2540" };
  return (
    <Button
      onClick={onClick}
      size="small"
      variant="contained"
      disableElevation
      startIcon={icon}
      sx={{
        bgcolor: palette.bg,
        textTransform: "none",
        fontSize: "0.76rem",
        fontWeight: 600,
        borderRadius: 0.75,
        px: 1.25,
        py: 0.4,
        minHeight: 30,
        "&:hover": { bgcolor: palette.hover },
      }}
    >
      {label}
    </Button>
  );
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}
