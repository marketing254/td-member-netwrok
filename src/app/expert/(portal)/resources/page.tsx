"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";

const EXPERT_GREEN = "#2C7A52";
const EXPERT_GREEN_DARK = "#1F5238";
const EXPERT_GREEN_TINT = "#E8F2EC";
const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const LINE = "#E6DDCF";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  published_at: string | null;
  published_url: string | null;
  storage_path: string;
  created_at: string;
  signed_url: string | null;
};

const KIND_OPTIONS = [
  { value: "sop", label: "SOP" },
  { value: "template", label: "Template" },
  { value: "slide_deck", label: "Slide deck" },
  { value: "recording", label: "Recording" },
  { value: "pdf", label: "PDF" },
  { value: "checklist", label: "Checklist" },
  { value: "worksheet", label: "Worksheet" },
  { value: "other", label: "Other" },
];

export default function ExpertResourcesPage() {
  const [rows, setRows] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload form state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadKind, setUploadKind] = useState<string>("other");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expert/resources", { cache: "no-store" });
      const body = (await res.json()) as { rows?: Resource[]; error?: string };
      if (!res.ok || body.error) {
        setError(body.error ?? `Failed to load (${res.status})`);
        setRows([]);
        return;
      }
      setRows(body.rows ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadKind("other");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFilePick = (file: File | null) => {
    setUploadFile(file);
    if (file && !uploadTitle.trim()) {
      // Auto-populate the title from the filename (stripped of extension)
      const niceTitle = file.name.replace(/\.[^.]+$/, "");
      setUploadTitle(niceTitle);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!uploadFile) {
      setError("Pick a file to upload.");
      return;
    }
    if (uploadTitle.trim().length < 1) {
      setError("Give your resource a title.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", uploadFile);
      fd.set("title", uploadTitle.trim());
      if (uploadDescription.trim()) fd.set("description", uploadDescription.trim());
      fd.set("kind", uploadKind);

      const res = await fetch("/api/expert/resources", { method: "POST", body: fd });
      const body = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !body.ok) {
        setError(body.error ?? `Upload failed (${res.status})`);
        return;
      }

      setToast("Resource uploaded — the team will review it shortly.");
      resetUploadForm();
      setShowUpload(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this resource? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/expert/resources?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setToast(body.error ?? "Delete failed.");
        return;
      }
      setToast("Resource deleted.");
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Stack spacing={4} sx={{ maxWidth: 960, mx: "auto" }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "flex-end" }, justifyContent: "space-between" }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: EXPERT_GREEN_DARK,
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Library
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.9rem", md: "2.4rem" },
              fontWeight: 500,
              color: INK,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              mb: 1,
            }}
          >
            Your resources
          </Typography>
          <Typography sx={{ color: INK_SOFT, fontSize: "0.98rem", lineHeight: 1.55, maxWidth: 620 }}>
            Upload your raw files (SOPs, templates, decks, recordings, PDFs). Our team reviews each one and re-brands it in the DMN style before publishing to the member library.
          </Typography>
        </Box>
        {!showUpload && (
          <Button
            variant="contained"
            onClick={() => setShowUpload(true)}
            startIcon={<CloudUploadOutlinedIcon />}
            sx={{
              borderRadius: 999,
              px: 3,
              bgcolor: EXPERT_GREEN,
              color: "#FFFFFF",
              backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
              boxShadow: `0 8px 22px -10px ${EXPERT_GREEN}88`,
              alignSelf: { xs: "flex-start", md: "center" },
              "&:hover": {
                bgcolor: EXPERT_GREEN_DARK,
                backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
              },
            }}
          >
            Upload a resource
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload form */}
      {showUpload && (
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: `1px solid ${EXPERT_GREEN}33`,
            bgcolor: "#FFFFFF",
            boxShadow: "0 1px 2px rgba(20,20,20,0.04), 0 24px 60px -36px rgba(44,122,82,0.22)",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: EXPERT_GREEN_TINT,
                color: EXPERT_GREEN,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                fontWeight: 500,
                color: INK,
                letterSpacing: "-0.005em",
              }}
            >
              New resource
            </Typography>
          </Stack>

          <Stack spacing={2.25}>
            {/* File picker */}
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
              />
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: `2px dashed ${uploadFile ? EXPERT_GREEN : LINE}`,
                  borderRadius: 3,
                  p: { xs: 3, md: 4 },
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: uploadFile ? EXPERT_GREEN_TINT : "rgba(251,248,241,0.5)",
                  transition: "border-color 200ms ease, background-color 200ms ease",
                  "&:hover": { borderColor: EXPERT_GREEN, bgcolor: EXPERT_GREEN_TINT },
                }}
              >
                {uploadFile ? (
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "center" }}>
                    <AttachFileOutlinedIcon sx={{ color: EXPERT_GREEN, fontSize: 22 }} />
                    <Box sx={{ textAlign: "left", minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, color: INK, fontSize: "0.92rem" }} noWrap>
                        {uploadFile.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: INK_MUTED }}>
                        {formatBytes(uploadFile.size)} · click to change
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={0.75} sx={{ alignItems: "center" }}>
                    <CloudUploadOutlinedIcon sx={{ color: INK_MUTED, fontSize: 32 }} />
                    <Typography sx={{ fontWeight: 600, color: INK, fontSize: "0.95rem" }}>
                      Click to select a file
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: INK_MUTED }}>
                      PDF · DOCX · PPTX · MP4 · audio · images · up to 500 MB
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Box>

            {/* Title + kind */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
              <TextField
                label="Title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                fullWidth
                required
                placeholder="e.g. Morning huddle template"
              />
              <TextField
                label="Type"
                value={uploadKind}
                onChange={(e) => setUploadKind(e.target.value)}
                select
                fullWidth
              >
                {KIND_OPTIONS.map((k) => (
                  <MenuItem key={k.value} value={k.value}>
                    {k.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              label="Description (optional)"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              placeholder="Who this is for, what problem it solves, anything the team should know when branding it."
            />

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "flex-end", mt: 1 }}
            >
              <Button
                variant="text"
                onClick={() => {
                  setShowUpload(false);
                  resetUploadForm();
                }}
                disabled={uploading}
                sx={{ color: INK_SOFT, fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={uploading || !uploadFile}
                endIcon={
                  uploading ? <CircularProgress size={14} sx={{ color: "#FFFFFF" }} /> : <CloudUploadOutlinedIcon />
                }
                sx={{
                  borderRadius: 999,
                  px: 3,
                  bgcolor: EXPERT_GREEN,
                  color: "#FFFFFF",
                  backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                  "&:hover": {
                    bgcolor: EXPERT_GREEN_DARK,
                    backgroundImage: `linear-gradient(180deg, ${EXPERT_GREEN} 0%, ${EXPERT_GREEN_DARK} 100%)`,
                  },
                }}
              >
                {uploading ? "Uploading…" : "Submit for review"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Resources list */}
      {loading ? (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress size={28} sx={{ color: EXPERT_GREEN }} />
        </Stack>
      ) : rows.length === 0 ? (
        <Box
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            border: `1px dashed ${LINE}`,
            bgcolor: "rgba(255,255,255,0.5)",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: EXPERT_GREEN_TINT,
              color: EXPERT_GREEN,
              display: "grid",
              placeItems: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <CloudUploadOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              fontWeight: 500,
              color: INK,
              mb: 0.75,
              letterSpacing: "-0.01em",
            }}
          >
            No resources yet
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", color: INK_SOFT, maxWidth: 440, mx: "auto" }}>
            Upload your first SOP, template, or slide deck. Our team reviews each one within a few business days and re-brands it before it goes into the member library.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {rows.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              isDeleting={deletingId === r.id}
              onDelete={() => onDelete(r.id)}
            />
          ))}
        </Stack>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        message={toast ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Stack>
  );
}

function ResourceCard({
  resource,
  isDeleting,
  onDelete,
}: {
  resource: Resource;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const status = STATUS_MAP[resource.status] ?? STATUS_MAP.pending_review;
  const canDelete = resource.status !== "approved";
  const kindLabel = KIND_OPTIONS.find((k) => k.value === resource.kind)?.label ?? "Other";
  const downloadUrl = resource.published_url ?? resource.signed_url;

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: `1px solid ${LINE}`,
        bgcolor: "#FFFFFF",
        transition: "border-color 220ms ease, box-shadow 220ms ease",
        "&:hover": {
          borderColor: `${EXPERT_GREEN}40`,
          boxShadow: "0 8px 30px -22px rgba(14,42,61,0.18)",
        },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "flex-start" }, justifyContent: "space-between" }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.75 }}>
            <Chip
              label={status.label}
              size="small"
              sx={{
                bgcolor: status.bg,
                color: status.color,
                fontWeight: 700,
                fontSize: "0.66rem",
                height: 20,
                "& .MuiChip-label": { px: 0.85 },
              }}
            />
            <Chip
              label={kindLabel}
              size="small"
              sx={{
                bgcolor: "rgba(14,42,61,0.06)",
                color: INK_SOFT,
                fontWeight: 600,
                fontSize: "0.66rem",
                height: 20,
                "& .MuiChip-label": { px: 0.85 },
              }}
            />
          </Stack>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              fontWeight: 500,
              color: INK,
              lineHeight: 1.3,
              letterSpacing: "-0.005em",
              mb: 0.5,
            }}
          >
            {resource.title}
          </Typography>
          {resource.description && (
            <Typography sx={{ color: INK_SOFT, fontSize: "0.9rem", lineHeight: 1.55, mb: 1 }}>
              {resource.description}
            </Typography>
          )}
          {resource.review_note && (
            <Box
              sx={{
                mt: 1,
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                bgcolor: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#8B5A00", mb: 0.25, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Team note
              </Typography>
              <Typography sx={{ fontSize: "0.86rem", color: INK_SOFT, lineHeight: 1.5 }}>
                {resource.review_note}
              </Typography>
            </Box>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              mt: 1.25,
              fontSize: "0.78rem",
              color: INK_MUTED,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box>{resource.file_name ?? "Untitled file"}</Box>
            {resource.file_size && <Box>· {formatBytes(resource.file_size)}</Box>}
            <Box>· Uploaded {formatDate(resource.created_at)}</Box>
            {resource.published_at && (
              <Box>· Published {formatDate(resource.published_at)}</Box>
            )}
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "center", flexShrink: 0, alignSelf: { xs: "flex-end", md: "flex-start" } }}
        >
          {downloadUrl && (
            <Tooltip title={resource.published_url ? "Open published version" : "Download your upload"}>
              <IconButton
                component="a"
                href={downloadUrl}
                target="_blank"
                rel="noopener"
                size="small"
                sx={{ color: EXPERT_GREEN_DARK }}
              >
                {resource.published_url ? (
                  <OpenInNewRoundedIcon fontSize="small" />
                ) : (
                  <DownloadOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={onDelete}
                disabled={isDeleting}
                sx={{ color: "error.main" }}
              >
                {isDeleting ? (
                  <CircularProgress size={16} sx={{ color: "error.main" }} />
                ) : (
                  <DeleteOutlineRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  draft: { label: "Draft", bg: "rgba(14,42,61,0.08)", color: INK_SOFT },
  pending_review: { label: "In review", bg: "rgba(245,158,11,0.14)", color: "#A07823" },
  needs_changes: { label: "Needs changes", bg: "rgba(220,60,60,0.10)", color: "#8C1D1D" },
  approved: { label: "Published", bg: "rgba(34,108,78,0.14)", color: "#1F5C40" },
  rejected: { label: "Rejected", bg: "rgba(220,60,60,0.10)", color: "#8C1D1D" },
  archived: { label: "Archived", bg: "rgba(14,42,61,0.06)", color: INK_MUTED },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
