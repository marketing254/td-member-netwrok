"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import {
  REDEMPTION_LIMIT_OPTIONS,
  catalogItems,
  getCatalogItem,
  type CatalogItem,
} from "@/lib/catalogData";
import { PageHeader } from "@/components/vendor/PortalUI";

function TypeIcon({ type, size = 18 }: { type: CatalogItem["type"]; size?: number }) {
  const Icon =
    type === "service"
      ? MedicalServicesOutlinedIcon
      : type === "product"
        ? Inventory2OutlinedIcon
        : SchoolOutlinedIcon;
  return <Icon sx={{ fontSize: size }} />;
}

type FormState = {
  catalogItemId: string;
  headline: string;
  discountValue: string;
  promoCode: string;
  terms: string;
  description: string;
  validFrom: string;
  validTo: string;
  redemptionLimit: string;
  customLimit: string;
  images: string[];
  videos: string[];
};

const empty: FormState = {
  catalogItemId: "",
  headline: "",
  discountValue: "",
  promoCode: "",
  terms: "",
  description: "",
  validFrom: "",
  validTo: "",
  redemptionLimit: "unlimited",
  customLimit: "",
  images: [],
  videos: [],
};

function OfferNewInner() {
  const params = useSearchParams();
  const router = useRouter();
  const preselect = params.get("catalog") ?? "";

  const [form, setForm] = useState<FormState>(() => ({
    ...empty,
    catalogItemId:
      preselect && catalogItems.some((c) => c.id === preselect) ? preselect : "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const item = useMemo(
    () => (form.catalogItemId ? getCatalogItem(form.catalogItemId) : undefined),
    [form.catalogItemId],
  );

  const canSubmit =
    Boolean(form.catalogItemId) &&
    form.headline.trim().length >= 5 &&
    form.discountValue.trim().length > 0 &&
    form.terms.trim().length >= 10 &&
    form.description.trim().length >= 10 &&
    form.validFrom.length > 0 &&
    form.validTo.length > 0 &&
    (form.redemptionLimit !== "custom" || form.customLimit.trim().length > 0);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Preview mode persistence. Replace with a real POST once the offers
      // table is in place.
      await new Promise((r) => setTimeout(r, 500));
      setSubmitted(true);
      setTimeout(() => router.push("/vendor/offers"), 900);
    } catch {
      setSubmitError("Could not save the offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Button
          component={Link}
          href="/vendor/offers"
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
          Back to offers
        </Button>
        <PageHeader
          eyebrow="NEW OFFER"
          title="Create a member offer"
          subtitle="An offer is a discount or bonus attached to one of your catalog items. Pick the item, fill in the details, and submit for team review."
        />
      </Box>

      {submitted ? (
        <Alert severity="success" sx={{ borderRadius: "14px" }}>
          <strong>Submitted for review.</strong> Redirecting you back to your offers…
        </Alert>
      ) : (
        <Stack spacing={3.5}>
          {/* Catalog item picker */}
          <Section title="Attach to a catalog item" hint="Offers always sit on top of something you already list.">
            {catalogItems.length === 0 ? (
              <Alert
                severity="warning"
                sx={{ borderRadius: "12px" }}
                action={
                  <Button component={Link} href="/vendor/catalog/new" size="small" variant="outlined">
                    Add item
                  </Button>
                }
              >
                You don&apos;t have any catalog items yet. Add a service, product, or
                course first.
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                {catalogItems.map((c) => {
                  const active = form.catalogItemId === c.id;
                  return (
                    <Box
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => set("catalogItemId", c.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          set("catalogItemId", c.id);
                        }
                      }}
                      sx={{
                        cursor: "pointer",
                        p: 2,
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor: active ? "#A07823" : "divider",
                        bgcolor: active ? "rgba(217,168,75,0.06)" : "common.white",
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        transition: "border-color 200ms ease, background-color 200ms ease",
                        "&:hover": { borderColor: active ? "#A07823" : "rgba(160,120,35,0.4)" },
                        "&:focus-visible": { outline: "2px solid #A07823", outlineOffset: 2 },
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: active ? "rgba(217,168,75,0.18)" : "rgba(14,42,61,0.04)",
                          color: active ? "#A07823" : "#5C6770",
                          border: "1px solid",
                          borderColor: active ? "rgba(217,168,75,0.4)" : "rgba(14,42,61,0.08)",
                          flexShrink: 0,
                        }}
                      >
                        <TypeIcon type={c.type} size={20} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.25 }}>
                          <Typography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>{c.name}</Typography>
                          <Chip
                            label={c.type.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: "rgba(14,42,61,0.06)",
                              color: "#0E2A3D",
                              fontWeight: 700,
                              fontSize: "0.6rem",
                              letterSpacing: "0.1em",
                              height: 18,
                            }}
                          />
                        </Stack>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                          {c.category} · {c.priceLabel}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Section>

          {/* Offer details */}
          {item && (
            <>
              <Section title="Offer details" hint="What members see in the directory and at checkout.">
                <Stack spacing={2.5}>
                  <TextField
                    label="Offer headline"
                    required
                    fullWidth
                    value={form.headline}
                    onChange={(e) => set("headline", e.target.value)}
                    placeholder='e.g. "12% off the IO-1 Scanner"'
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                    <TextField
                      label="Discount value"
                      required
                      fullWidth
                      value={form.discountValue}
                      onChange={(e) => set("discountValue", e.target.value)}
                      placeholder='e.g. "12% off", "$300 off", "Free training"'
                      helperText="Free-form so percentages, dollars, and bonuses all fit."
                    />
                    <TextField
                      label="Promo code"
                      fullWidth
                      value={form.promoCode}
                      onChange={(e) => set("promoCode", e.target.value.toUpperCase())}
                      placeholder="DMN-YOURS-12"
                      helperText="Optional. Members enter this at checkout or mention it on a call."
                      slotProps={{
                        input: {
                          sx: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
                        },
                      }}
                    />
                  </Stack>

                  <TextField
                    label="Description"
                    required
                    fullWidth
                    multiline
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Short pitch — what the member gets and why it matters. 1–2 sentences."
                    helperText={`${form.description.trim().length}/10 minimum characters`}
                  />

                  <TextField
                    label="Terms"
                    required
                    fullWidth
                    multiline
                    rows={4}
                    value={form.terms}
                    onChange={(e) => set("terms", e.target.value)}
                    placeholder='Eligibility, exclusions, stacking rules. e.g. "Excludes service contracts. Limit one per practice."'
                    helperText={`${form.terms.trim().length}/10 minimum characters`}
                  />
                </Stack>
              </Section>

              <Section title="Validity & redemption" hint="When the offer runs and how often each member can redeem.">
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                    <TextField
                      label="Offer valid from"
                      type="date"
                      required
                      fullWidth
                      value={form.validFrom}
                      onChange={(e) => set("validFrom", e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      label="Offer valid to"
                      type="date"
                      required
                      fullWidth
                      value={form.validTo}
                      onChange={(e) => set("validTo", e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                    <TextField
                      label="Redemption limit per member"
                      select
                      required
                      fullWidth
                      value={form.redemptionLimit}
                      onChange={(e) => set("redemptionLimit", e.target.value)}
                    >
                      {REDEMPTION_LIMIT_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                      <MenuItem value="custom">Custom…</MenuItem>
                    </TextField>
                    {form.redemptionLimit === "custom" && (
                      <TextField
                        label="Custom limit"
                        required
                        fullWidth
                        value={form.customLimit}
                        onChange={(e) => set("customLimit", e.target.value)}
                        placeholder='e.g. "twice per year"'
                      />
                    )}
                  </Stack>
                </Stack>
              </Section>

              <Section title="Media" hint="Optional. Help members visualise the offer in the directory.">
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
                    label="Videos"
                    emptyHint="No videos yet"
                    items={form.videos}
                    onAdd={(name) => set("videos", [...form.videos, name])}
                    onRemove={(i) => set("videos", form.videos.filter((_, idx) => idx !== i))}
                    accept="video"
                  />
                  <Alert severity="info" sx={{ borderRadius: "12px" }}>
                    Real upload to object storage is wired in the next phase. For now,
                    filenames are tracked locally so you can see the shape of the form.
                  </Alert>
                </Stack>
              </Section>
            </>
          )}

          {submitError && <Alert severity="error">{submitError}</Alert>}

          {item && (
            <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
              <Button component={Link} href="/vendor/offers" variant="text" color="primary">
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={submit}
                disabled={!canSubmit || submitting}
                endIcon={submitting ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <ArrowForwardIcon />}
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

export default function VendorOfferNewPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
          <CircularProgress size={28} sx={{ color: "#A07823" }} />
        </Box>
      }
    >
      <OfferNewInner />
    </Suspense>
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
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: hint ? 0.5 : 0 }}>
          <LocalOfferOutlinedIcon sx={{ fontSize: 18, color: "#A07823" }} />
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "text.primary" }}>
            {title}
          </Typography>
        </Stack>
        {hint && (
          <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", pl: 3.5 }}>{hint}</Typography>
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
