"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import type { SvgIconComponent } from "@mui/icons-material";
import { CATALOG_CATEGORIES, type CatalogItemType } from "@/lib/catalogData";
import { PageHeader } from "@/components/vendor/PortalUI";

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
  description: string;
  priceLabel: string;
  durationHours: string;
  images: string[];
  videos: string[];
};

const empty: FormState = {
  type: "",
  name: "",
  category: "",
  description: "",
  priceLabel: "",
  durationHours: "",
  images: [],
  videos: [],
};

export default function CatalogNewPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const categoryOptions = useMemo(
    () => (form.type ? CATALOG_CATEGORIES[form.type] : []),
    [form.type],
  );

  const canSubmit =
    Boolean(form.type) &&
    form.name.trim().length >= 3 &&
    form.category.trim().length > 0 &&
    form.description.trim().length >= 20 &&
    form.priceLabel.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Preview mode: pretend persistence. Replace with a real POST when the
      // catalog table lands.
      await new Promise((r) => setTimeout(r, 500));
      setSubmitted(true);
      setTimeout(() => router.push("/vendor/catalog"), 900);
    } catch {
      setSubmitError("Could not save the item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
                      set("type", opt.value);
                      set("category", "");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        set("type", opt.value);
                        set("category", "");
                      }
                    }}
                    sx={{
                      cursor: "pointer",
                      flex: 1,
                      p: 2.5,
                      borderRadius: 2.5,
                      border: "2px solid",
                      borderColor: active ? "#A07823" : "divider",
                      bgcolor: active ? "rgba(217,168,75,0.06)" : "common.white",
                      transition: "border-color 200ms ease, background-color 200ms ease, transform 200ms ease",
                      "&:hover": { borderColor: active ? "#A07823" : "rgba(160,120,35,0.4)", transform: "translateY(-2px)" },
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
                  <TextField
                    label="Category"
                    required
                    select
                    fullWidth
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    {categoryOptions.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Price"
                    required
                    fullWidth
                    value={form.priceLabel}
                    onChange={(e) => set("priceLabel", e.target.value)}
                    placeholder='e.g. "$4,200", "Quote", "$99/mo"'
                    helperText="Free-form — any unit. Quotes and ranges are fine."
                  />
                </Stack>

                {form.type === "course" && (
                  <TextField
                    label="Total duration (hours)"
                    type="number"
                    fullWidth
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
              title="Media"
              hint={
                form.type === "course"
                  ? "Add 1–3 images and at least one preview video."
                  : "Add 1–4 images. Optional product video helps members evaluate."
              }
            >
              <Stack spacing={2}>
                <MediaUploader
                  label="Images"
                  emptyHint="No images yet"
                  items={form.images}
                  onAdd={(name) => set("images", [...form.images, name])}
                  onRemove={(i) => set("images", form.images.filter((_, idx) => idx !== i))}
                  accept="image"
                />
                <MediaUploader
                  label={form.type === "course" ? "Videos" : "Video (optional)"}
                  emptyHint="No videos yet"
                  items={form.videos}
                  onAdd={(name) => set("videos", [...form.videos, name])}
                  onRemove={(i) => set("videos", form.videos.filter((_, idx) => idx !== i))}
                  accept="video"
                />
                <Alert severity="info" sx={{ borderRadius: "12px" }}>
                  Real upload to object storage is wired in the next phase. For now, filenames
                  are tracked locally so you can see the shape of the form.
                </Alert>
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
                endIcon={<ArrowForwardIcon />}
              >
                {submitting ? "Submitting…" : "Submit for team review"}
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
}: {
  label: string;
  emptyHint: string;
  items: string[];
  onAdd: (name: string) => void;
  onRemove: (idx: number) => void;
  accept: "image" | "video";
}) {
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
        }}
      >
        {items.length === 0 ? (
          <Typography sx={{ color: "text.disabled", fontSize: "0.88rem", mb: 1.5 }}>
            {emptyHint}
          </Typography>
        ) : (
          <Stack spacing={0.75} sx={{ mb: 1.5 }}>
            {items.map((name, i) => (
              <Stack
                key={`${name}-${i}`}
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
                  label={accept === "image" ? "IMG" : "VID"}
                  size="small"
                  sx={{ bgcolor: "rgba(14,42,61,0.06)", color: "#0E2A3D", fontWeight: 700, fontSize: "0.62rem", height: 20 }}
                />
                <Typography sx={{ flex: 1, fontSize: "0.86rem" }} noWrap>
                  {name}
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
          startIcon={<CloudUploadOutlinedIcon />}
          sx={{
            borderColor: "rgba(14,42,61,0.2)",
            color: "text.primary",
            "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.06)" },
          }}
        >
          {`Add ${accept === "image" ? "an image" : "a video"}`}
          <input
            type="file"
            accept={accept === "image" ? "image/*" : "video/*"}
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              for (const f of files) onAdd(f.name);
              e.currentTarget.value = "";
            }}
          />
        </Button>
      </Box>
    </Box>
  );
}
