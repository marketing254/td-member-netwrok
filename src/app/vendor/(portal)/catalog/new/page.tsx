"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import { CATALOG_CATEGORIES, type CatalogItemType } from "@/lib/catalogData";
import { PageHeader } from "@/components/vendor/PortalUI";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  createCatalogItem,
  fetchCurrentVendor,
  uploadCatalogMedia,
} from "@/lib/supabase/vendorQueries";
import type { VendorsRow } from "@/lib/supabase/types";

const TYPE_OPTIONS: { value: CatalogItemType; label: string; description: string; icon: SvgIconComponent }[] = [
  {
    value: "service",
    label: "Service",
    description: "Recurring or one-time work you deliver to a practice — consulting, billing, IT, etc.",
    icon: MedicalServicesOutlinedIcon,
  },
  {
    value: "product",
    label: "Product",
    description: "Equipment, supplies, software, or anything physical or licensed you sell.",
    icon: Inventory2OutlinedIcon,
  },
  {
    value: "course",
    label: "Course",
    description: "Education with modules, video lessons, and optional CE credit.",
    icon: SchoolOutlinedIcon,
  },
];

type FormState = {
  type: CatalogItemType | "";
  name: string;
  category: string;
  /** Free text used when category === "Other". */
  categoryOther: string;
  description: string;
  priceLabel: string;
  durationHours: string;
  images: File[];
  videos: File[];
  documents: File[];
};

const empty: FormState = {
  type: "",
  name: "",
  category: "",
  categoryOther: "",
  description: "",
  priceLabel: "",
  durationHours: "",
  images: [],
  videos: [],
  documents: [],
};

export default function CatalogNewPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorsRow | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(true);
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();
    (async () => {
      const v = await fetchCurrentVendor(supabase);
      if (!active) return;
      setVendor(v);
      setLoadingVendor(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const categoryOptions = useMemo(
    () => (form.type ? CATALOG_CATEGORIES[form.type] : []),
    [form.type],
  );

  const canPublish = Boolean(vendor && vendor.status === "approved" && vendor.verified);

  const effectiveCategory =
    form.category === "Other" ? form.categoryOther.trim() : form.category.trim();

  const canSubmit =
    canPublish &&
    Boolean(form.type) &&
    form.name.trim().length >= 3 &&
    effectiveCategory.length > 0 &&
    form.description.trim().length >= 20 &&
    form.priceLabel.trim().length > 0;

  const submit = async () => {
    if (!canSubmit || !form.type || !vendor) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const supabase = createBrowserSupabase();

      const durationHours = form.type === "course" && form.durationHours
        ? Number(form.durationHours)
        : null;

      const result = await createCatalogItem(supabase, {
        vendor_id: vendor.id,
        type: form.type,
        name: form.name.trim(),
        description: form.description.trim(),
        category: effectiveCategory,
        price_label: form.priceLabel.trim(),
        duration_hours: durationHours,
      });

      if (!result.ok) {
        setSubmitError(result.error);
        setSubmitting(false);
        return;
      }

      // Upload media (best effort — surface first error if any)
      const all: { kind: "image" | "video" | "document"; file: File }[] = [
        ...form.images.map((f) => ({ kind: "image" as const, file: f })),
        ...form.videos.map((f) => ({ kind: "video" as const, file: f })),
        ...form.documents.map((f) => ({ kind: "document" as const, file: f })),
      ];
      for (const m of all) {
        const up = await uploadCatalogMedia(supabase, {
          vendorId: vendor.id,
          catalogItemId: result.id,
          kind: m.kind,
          file: m.file,
        });
        if (!up.ok) {
          console.warn("[catalog/new] media upload failed:", up.error);
        }
      }

      setSubmitted(true);
      setTimeout(() => router.push("/vendor/catalog"), 800);
    } catch (err) {
      console.error("[catalog/new] submit failed:", err);
      setSubmitError("Could not save the item. Please try again.");
      setSubmitting(false);
    }
  };

  if (loadingVendor) {
    return (
      <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#A07823" }} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button
          component={Link}
          href="/vendor/catalog"
          startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
          size="small"
          sx={{
            color: "#5C6770",
            textTransform: "none",
            fontSize: "0.78rem",
            mb: 0.75,
            px: 0,
            "&:hover": { bgcolor: "transparent", color: "#0A1A2F" },
          }}
        >
          Back to catalog
        </Button>
        <PageHeader
          eyebrow="NEW CATALOG ITEM"
          title="Add a service, product, or course"
          subtitle="Tell us what you want members to find in the directory. Our team reviews every submission within 24 business hours."
        />
      </Box>

      {!canPublish && (
        <Alert
          severity="warning"
          icon={<LockOutlinedIcon />}
          sx={{
            borderRadius: "14px",
            border: "1px solid rgba(217,168,75,0.4)",
            bgcolor: "rgba(217,168,75,0.06)",
            "& .MuiAlert-icon": { color: "#A07823" },
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5, color: "#7A5B17" }}>
            Verification required
          </Typography>
          <Typography sx={{ fontSize: "0.86rem", color: "#7A5B17", lineHeight: 1.55 }}>
            Your partner account is still being reviewed by our team. Once your account is approved
            and verified you can publish services, products, courses, and offers. We&apos;ll email
            you the moment that happens — usually within one business day.
          </Typography>
        </Alert>
      )}

      {submitted ? (
        <Alert severity="success" sx={{ borderRadius: "14px" }}>
          <strong>Submitted for review.</strong> Redirecting you back to your catalog…
        </Alert>
      ) : (
        <Stack spacing={3.5}>
          {/* Type picker */}
          <Section title="What are you adding?" hint="This shapes the fields we ask for next.">
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = form.type === opt.value;
                return (
                  <Box
                    key={opt.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!canPublish) return;
                      set("type", opt.value);
                      set("category", "");
                    }}
                    onKeyDown={(e) => {
                      if (!canPublish) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        set("type", opt.value);
                        set("category", "");
                      }
                    }}
                    sx={{
                      cursor: canPublish ? "pointer" : "not-allowed",
                      opacity: canPublish ? 1 : 0.55,
                      flex: 1,
                      p: 2.5,
                      borderRadius: 2.5,
                      border: "2px solid",
                      borderColor: active ? "#A07823" : "divider",
                      bgcolor: active ? "rgba(217,168,75,0.06)" : "common.white",
                      transition: "border-color 200ms ease, background-color 200ms ease, transform 200ms ease",
                      "&:hover": canPublish ? { borderColor: active ? "#A07823" : "rgba(160,120,35,0.4)", transform: "translateY(-2px)" } : {},
                      "&:focus-visible": {
                        outline: "2px solid #A07823",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: active ? "rgba(217,168,75,0.18)" : "rgba(14,42,61,0.04)",
                        color: active ? "#A07823" : "#5C6770",
                        border: "1px solid",
                        borderColor: active ? "rgba(217,168,75,0.4)" : "rgba(14,42,61,0.08)",
                        mb: 1.5,
                      }}
                    >
                      <Icon sx={{ fontSize: 22 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", mb: 0.5 }}>
                      {opt.label}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.86rem", lineHeight: 1.55 }}>
                      {opt.description}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Section>

          {/* Basics */}
          {form.type && (
            <Section title="Basics" hint="The essentials members see in the directory.">
              <Stack spacing={2.5}>
                <TextField
                  label="Name"
                  required
                  fullWidth
                  disabled={!canPublish}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder={
                    form.type === "service"
                      ? "e.g. Quarterly Supply Concierge"
                      : form.type === "product"
                        ? "e.g. Henry Schein IO-1 Intraoral Scanner"
                        : "e.g. PPO Renegotiation in 90 Days"
                  }
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                  <Stack spacing={1.25} sx={{ flex: 1 }}>
                    <TextField
                      label="Category"
                      required
                      select
                      fullWidth
                      disabled={!canPublish}
                      value={form.category}
                      onChange={(e) => {
                        set("category", e.target.value);
                        if (e.target.value !== "Other") set("categoryOther", "");
                      }}
                    >
                      {categoryOptions.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                    {form.category === "Other" && (
                      <TextField
                        label="Specify category"
                        required
                        fullWidth
                        autoFocus
                        disabled={!canPublish}
                        value={form.categoryOther}
                        onChange={(e) => set("categoryOther", e.target.value)}
                        placeholder="e.g. AI tooling, sleep dentistry, payroll"
                        helperText="Tell us how to label this in the directory."
                      />
                    )}
                  </Stack>
                  <TextField
                    label="Price"
                    required
                    fullWidth
                    disabled={!canPublish}
                    value={form.priceLabel}
                    onChange={(e) => set("priceLabel", e.target.value)}
                    placeholder='e.g. "$4,200", "Quote", "$99/mo"'
                    helperText="Free-form — any unit. Quotes and ranges are fine."
                    sx={{ flex: 1 }}
                  />
                </Stack>

                {form.type === "course" && (
                  <TextField
                    label="Total duration (hours)"
                    type="number"
                    fullWidth
                    disabled={!canPublish}
                    value={form.durationHours}
                    onChange={(e) => set("durationHours", e.target.value)}
                    placeholder="e.g. 18"
                    helperText="Used to surface CE credit hours where relevant."
                    slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                  />
                )}

                <TextField
                  label="Description"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  disabled={!canPublish}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="What it is, what's included, who it's for. Aim for 2–3 sentences."
                  helperText={`${form.description.trim().length}/20 minimum characters`}
                />
              </Stack>
            </Section>
          )}

          {/* Media */}
          {form.type && (
            <Section
              title="Media & documents"
              hint={
                form.type === "course"
                  ? "Add 1–3 images, at least one preview video, and any course materials as PDFs."
                  : "Add 1–4 images. Optional product video. Attach spec sheets, brochures, or any supporting PDF."
              }
            >
              <Stack spacing={2}>
                <MediaUploader
                  label="Images"
                  emptyHint="No images yet"
                  items={form.images}
                  disabled={!canPublish}
                  onAdd={(files) => set("images", [...form.images, ...files])}
                  onRemove={(i) => set("images", form.images.filter((_, idx) => idx !== i))}
                  accept="image"
                />
                <MediaUploader
                  label={form.type === "course" ? "Videos" : "Video (optional)"}
                  emptyHint="No videos yet"
                  items={form.videos}
                  disabled={!canPublish}
                  onAdd={(files) => set("videos", [...form.videos, ...files])}
                  onRemove={(i) => set("videos", form.videos.filter((_, idx) => idx !== i))}
                  accept="video"
                />
                <MediaUploader
                  label="Documents (PDF, spec sheets, brochures)"
                  emptyHint="No documents yet"
                  items={form.documents}
                  disabled={!canPublish}
                  onAdd={(files) => set("documents", [...form.documents, ...files])}
                  onRemove={(i) => set("documents", form.documents.filter((_, idx) => idx !== i))}
                  accept="document"
                />
              </Stack>
            </Section>
          )}

          {submitError && <Alert severity="error">{submitError}</Alert>}

          {form.type && (
            <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
              <Button component={Link} href="/vendor/catalog" variant="text" color="primary">
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={submit}
                disabled={!canSubmit || submitting}
                endIcon={!canPublish ? <LockOutlinedIcon /> : <ArrowForwardIcon />}
              >
                {!canPublish
                  ? "Verification required"
                  : submitting
                    ? "Submitting…"
                    : "Submit for team review"}
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: "common.white",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        p: { xs: 2.5, md: 3.5 },
      }}
    >
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "text.primary", mb: hint ? 0.5 : 0 }}>
          {title}
        </Typography>
        {hint && (
          <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>{hint}</Typography>
        )}
      </Box>
      {children}
    </Box>
  );
}

function MediaUploader({
  label,
  emptyHint,
  items,
  onAdd,
  onRemove,
  accept,
  disabled,
}: {
  label: string;
  emptyHint: string;
  items: File[];
  onAdd: (files: File[]) => void;
  onRemove: (idx: number) => void;
  accept: "image" | "video" | "document";
  disabled?: boolean;
}) {
  const acceptAttr =
    accept === "image"
      ? "image/*"
      : accept === "video"
        ? "video/*"
        : "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const chipLabel = accept === "image" ? "IMG" : accept === "video" ? "VID" : "DOC";
  const ctaLabel =
    accept === "image" ? "Add an image" : accept === "video" ? "Add a video" : "Add a document";

  return (
    <Box>
      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, mb: 1, color: "text.primary" }}>
        {label}
      </Typography>
      <Box
        sx={{
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: "12px",
          p: 2,
          bgcolor: "rgba(14,42,61,0.02)",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {items.length === 0 ? (
          <Typography sx={{ color: "text.disabled", fontSize: "0.88rem", mb: 1.5 }}>
            {emptyHint}
          </Typography>
        ) : (
          <Stack spacing={0.75} sx={{ mb: 1.5 }}>
            {items.map((f, i) => (
              <Stack
                key={`${f.name}-${i}`}
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  bgcolor: "common.white",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  px: 1.25,
                  py: 0.75,
                }}
              >
                <Chip
                  label={chipLabel}
                  size="small"
                  sx={{ bgcolor: "rgba(14,42,61,0.06)", color: "#0E2A3D", fontWeight: 700, fontSize: "0.62rem", height: 20 }}
                />
                <Typography sx={{ flex: 1, fontSize: "0.86rem" }} noWrap>
                  {f.name}
                </Typography>
                <Typography sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                  {Math.max(1, Math.round(f.size / 1024))} KB
                </Typography>
                <IconButton size="small" onClick={() => onRemove(i)} sx={{ color: "text.secondary" }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}

        <Button
          component="label"
          variant="outlined"
          size="small"
          disabled={disabled}
          startIcon={<CloudUploadOutlinedIcon />}
          sx={{
            borderColor: "rgba(14,42,61,0.2)",
            color: "text.primary",
            "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.06)" },
          }}
        >
          {ctaLabel}
          <input
            type="file"
            accept={acceptAttr}
            multiple
            hidden
            disabled={disabled}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onAdd(files);
              e.currentTarget.value = "";
            }}
          />
        </Button>
      </Box>
    </Box>
  );
}
