"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

type FileField = {
  field: string;
  label: string;
  accept: string;
  description: string;
};

const COVER_FIELDS: FileField[] = [
  {
    field: "portal_card",
    label: "Portal card",
    accept: "image/*",
    description: "Square cover used in the member-portal grid (recommended 2160×2160 PNG).",
  },
  {
    field: "resource_card",
    label: "Resource card",
    accept: "image/*",
    description: "Wide hero used on the public /resources page and the kit detail header (recommended 2560×1440 PNG).",
  },
];

const CONTENT_FIELDS: FileField[] = [
  { field: "training_video", label: "Training Video", accept: "video/mp4", description: "1080p MP4." },
  { field: "action_guide", label: "Action Guide", accept: "application/pdf", description: "PDF — multi-page reference." },
  { field: "checklist", label: "Checklist", accept: "application/pdf", description: "PDF — implementation steps." },
  { field: "worksheet", label: "Worksheet", accept: "application/pdf", description: "PDF — fill-in worksheet." },
  { field: "key_takeaways", label: "Key Takeaways", accept: "application/pdf", description: "PDF — 1-page summary." },
  { field: "slide_deck_pdf", label: "Slide Deck (PDF)", accept: "application/pdf", description: "PDF — previews inline in the player." },
  {
    field: "slide_deck_pptx",
    label: "Slide Deck (PowerPoint)",
    accept: ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    description: "Editable PowerPoint — opens via Microsoft Office viewer.",
  },
  { field: "wall_poster", label: "Wall Poster", accept: "application/pdf", description: "PDF — printable wall tool." },
];

const CATEGORIES = [
  "Practice Management",
  "Front Desk",
  "Team & Culture",
  "Patient Experience",
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewKitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [approveOnSubmit, setApproveOnSubmit] = useState(false);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const derivedSlug = useMemo(() => slugify(title), [title]);
  const effectiveSlug = slugDirty ? slug : derivedSlug;

  const setFile = (field: string, f: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: f }));
  };

  const contentFileCount = CONTENT_FIELDS.filter((c) => files[c.field]).length;
  const canSubmit =
    title.trim().length > 0 &&
    effectiveSlug.length > 0 &&
    contentFileCount > 0 &&
    !submitting;

  const totalSize = useMemo(() => {
    let bytes = 0;
    for (const f of Object.values(files)) {
      if (f) bytes += f.size;
    }
    return bytes;
  }, [files]);

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.set("slug", effectiveSlug);
      fd.set("title", title.trim());
      if (category) fd.set("category", category);
      if (summary.trim()) fd.set("summary", summary.trim());
      if (approveOnSubmit) fd.set("approveOnSubmit", "1");
      for (const [field, file] of Object.entries(files)) {
        if (file) fd.set(field, file);
      }

      const res = await fetch("/api/admin/resources", {
        method: "POST",
        body: fd,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.error ?? `Submit failed (${res.status})`);
        return;
      }
      setSuccess(
        approveOnSubmit
          ? `Kit "${title}" published. ${body.rowsInserted} rows inserted.`
          : `Kit "${title}" submitted for review. ${body.rowsInserted} rows inserted.`,
      );
      // Bounce back to the list after a short pause so the admin sees the result
      setTimeout(() => router.push("/admin/resources"), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Button
          component={Link}
          href="/admin/resources"
          startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{ textTransform: "none", fontSize: "0.8rem", color: "#5C6770" }}
        >
          All kits
        </Button>
      </Stack>

      <Box>
        <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.18em", color: "#7A8590", textTransform: "uppercase", mb: 0.5 }}>
          New submission
        </Typography>
        <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.4rem", md: "1.6rem" }, fontWeight: 500, color: "#0A1A2F", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
          Submit a new resource kit
        </Typography>
        <Typography sx={{ fontSize: "0.86rem", color: "#5C6770", mt: 0.5, maxWidth: 720 }}>
          Upload the kit&apos;s covers and content files. Submissions land as <strong>Pending review</strong> by default — toggle &ldquo;Approve on submit&rdquo; below to publish immediately (requires admin role). At least one content file is required.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 1, fontSize: "0.82rem" }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          icon={<CheckRoundedIcon fontSize="inherit" />}
          sx={{ borderRadius: 1, fontSize: "0.82rem" }}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Kit details" subtitle="What members see in the library.">
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The 9 KPIs That Drive Your Practice"
                size="small"
                fullWidth
                slotProps={{ inputLabel: { sx: { fontSize: "0.84rem" } } }}
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.88rem", borderRadius: 1.25 } }}
              />
              <TextField
                label="URL slug"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  setSlugDirty(true);
                }}
                helperText="Auto-derived from the title until you edit it. Lowercase letters, digits, hyphens."
                size="small"
                fullWidth
                slotProps={{ inputLabel: { sx: { fontSize: "0.84rem" } }, formHelperText: { sx: { fontSize: "0.7rem", ml: 0.25 } } }}
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.88rem", borderRadius: 1.25 } }}
              />
              <TextField
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                select
                size="small"
                fullWidth
                slotProps={{ inputLabel: { sx: { fontSize: "0.84rem" } } }}
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.88rem", borderRadius: 1.25 } }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c} sx={{ fontSize: "0.86rem" }}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="One-paragraph blurb shown on the card."
                size="small"
                fullWidth
                multiline
                minRows={3}
                slotProps={{ inputLabel: { sx: { fontSize: "0.84rem" } } }}
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.88rem", borderRadius: 1.25 } }}
              />
            </Stack>
          </SectionCard>

          <Box sx={{ mt: 2.5 }}>
            <SectionCard
              title="Covers"
              subtitle="Two images per kit. Both optional, but a kit looks much better with them."
            >
              <Stack spacing={1.25}>
                {COVER_FIELDS.map((f) => (
                  <FilePicker
                    key={f.field}
                    field={f}
                    file={files[f.field] ?? null}
                    onChange={(file) => setFile(f.field, file)}
                  />
                ))}
              </Stack>
            </SectionCard>
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <SectionCard
              title="Content files"
              subtitle="Pick the files you have ready. Each one becomes a row in the kit's curriculum. At least one required."
            >
              <Stack spacing={1.25}>
                {CONTENT_FIELDS.map((f) => (
                  <FilePicker
                    key={f.field}
                    field={f}
                    file={files[f.field] ?? null}
                    onChange={(file) => setFile(f.field, file)}
                  />
                ))}
              </Stack>
            </SectionCard>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ position: { md: "sticky" }, top: { md: 80 } }}>
            <SectionCard title="Submit">
              <Stack spacing={1.5}>
                <SummaryRow label="Content files" value={`${contentFileCount} selected`} />
                <SummaryRow label="Covers" value={`${COVER_FIELDS.filter((c) => files[c.field]).length}/2 selected`} />
                <SummaryRow label="Total upload size" value={formatBytes(totalSize)} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={approveOnSubmit}
                      onChange={(e) => setApproveOnSubmit(e.target.checked)}
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#A07823" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#A07823" },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0A1A2F" }}>
                        Approve on submit
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#5C6770" }}>
                        Skip the review queue and publish to landing + member portal immediately.
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", m: 0, gap: 1 }}
                />

                {contentFileCount === 0 && (
                  <FormHelperText sx={{ fontSize: "0.72rem", color: "#8C1D1D" }}>
                    Add at least one content file to enable Submit.
                  </FormHelperText>
                )}

                <Button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  variant="contained"
                  size="medium"
                  disableElevation
                  startIcon={
                    submitting ? (
                      <CircularProgress size={14} sx={{ color: "inherit" }} />
                    ) : (
                      <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />
                    )
                  }
                  sx={{
                    bgcolor: "#0A1A2F",
                    color: "#FFFFFF",
                    textTransform: "none",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    borderRadius: 0.75,
                    py: 1.1,
                    mt: 0.5,
                    "&:hover": { bgcolor: "#0F2540" },
                    "&.Mui-disabled": { bgcolor: "#9CA3AB", color: "#FFFFFF" },
                  }}
                >
                  {submitting
                    ? "Uploading…"
                    : approveOnSubmit
                      ? "Submit & publish"
                      : "Submit for review"}
                </Button>

                <Typography sx={{ fontSize: "0.7rem", color: "#5C6770", lineHeight: 1.5 }}>
                  Files upload to Supabase Storage. Large videos can take a couple of minutes — don&apos;t close the tab while it&apos;s working.
                </Typography>
              </Stack>
            </SectionCard>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        border: "1px solid rgba(14,42,61,0.08)",
        borderRadius: 1.5,
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: { xs: 2, md: 2.5 }, py: 1.5, borderBottom: "1px solid rgba(14,42,61,0.06)" }}>
        <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#0A1A2F" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: "0.76rem", color: "#5C6770", mt: 0.25 }}>{subtitle}</Typography>
        )}
      </Box>
      <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>{children}</Box>
    </Box>
  );
}

function FilePicker({
  field,
  file,
  onChange,
}: {
  field: FileField;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputId = `file-${field.field}`;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: 1,
        border: "1px solid rgba(14,42,61,0.08)",
        bgcolor: file ? "rgba(34,108,78,0.04)" : "rgba(14,42,61,0.02)",
        borderColor: file ? "rgba(34,108,78,0.28)" : "rgba(14,42,61,0.08)",
        transition: "border-color 160ms ease, background-color 160ms ease",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0A1A2F" }}>
          {field.label}
        </Typography>
        <Typography sx={{ fontSize: "0.7rem", color: "#5C6770", lineHeight: 1.4 }}>
          {file ? `${file.name} — ${formatBytes(file.size)}` : field.description}
        </Typography>
      </Box>
      {file ? (
        <Button
          onClick={() => onChange(null)}
          size="small"
          variant="outlined"
          startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{
            borderColor: "rgba(140,29,29,0.3)",
            color: "#8C1D1D",
            textTransform: "none",
            fontSize: "0.74rem",
            fontWeight: 600,
            borderRadius: 0.75,
            px: 1.25,
            py: 0.35,
            "&:hover": { borderColor: "#8C1D1D", bgcolor: "rgba(140,29,29,0.04)" },
          }}
        >
          Remove
        </Button>
      ) : (
        <Button
          component="label"
          htmlFor={inputId}
          size="small"
          variant="outlined"
          sx={{
            borderColor: "rgba(14,42,61,0.18)",
            color: "#0A1A2F",
            textTransform: "none",
            fontSize: "0.74rem",
            fontWeight: 600,
            borderRadius: 0.75,
            px: 1.25,
            py: 0.35,
            "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.06)" },
          }}
        >
          Choose file
          <input
            id={inputId}
            type="file"
            hidden
            accept={field.accept}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </Button>
      )}
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
      <Typography sx={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A8590" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: "#0A1A2F" }}>
        {value}
      </Typography>
    </Stack>
  );
}

function formatBytes(b: number): string {
  if (b === 0) return "0 B";
  const kb = b / 1024;
  if (kb < 900) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  if (mb < 900) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}
