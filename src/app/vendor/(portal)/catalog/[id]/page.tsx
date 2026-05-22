"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  fetchCatalogItem,
  fetchVendorOffers,
  type CatalogItemWithMedia,
  type OfferWithCatalog,
} from "@/lib/supabase/vendorQueries";
import type { CatalogItemsRow } from "@/lib/supabase/types";
import {
  SectionCard,
  StatusPill,
  TagPill,
  portalText,
} from "@/components/vendor/PortalUI";

type CatalogType = CatalogItemsRow["type"];

function TypeIcon({ type, size = 16 }: { type: CatalogType; size?: number }) {
  const Icon =
    type === "service"
      ? MedicalServicesOutlinedIcon
      : type === "product"
        ? Inventory2OutlinedIcon
        : SchoolOutlinedIcon;
  return <Icon sx={{ fontSize: size }} />;
}

type RouteParams = Promise<{ id: string }>;

export default function CatalogDetailPage({ params }: { params: RouteParams }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<CatalogItemWithMedia | null>(null);
  const [offers, setOffers] = useState<OfferWithCatalog[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();
    (async () => {
      const result = await fetchCatalogItem(supabase, id);
      if (!active) return;
      setItem(result);

      if (result) {
        const allOffers = await fetchVendorOffers(supabase, result.vendor_id);
        if (!active) return;
        setOffers(allOffers.filter((o) => o.catalog_item_id === id));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const images = useMemo(
    () => (item?.catalog_media ?? []).filter((m) => m.kind === "image"),
    [item],
  );
  const videos = useMemo(
    () => (item?.catalog_media ?? []).filter((m) => m.kind === "video"),
    [item],
  );
  const documents = useMemo(
    () => (item?.catalog_media ?? []).filter((m) => m.kind === "document"),
    [item],
  );

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#A07823" }} />
        <Typography sx={{ color: "#5C6770", fontSize: "0.88rem" }}>Loading item…</Typography>
      </Stack>
    );
  }

  if (!item) {
    return (
      <SectionCard padding="default">
        <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center", py: 4 }}>
          <Typography sx={portalText.sectionTitle}>Item not found.</Typography>
          <Typography sx={{ color: "#5C6770", fontSize: "0.88rem" }}>
            The item may have been removed or you don&apos;t have access.
          </Typography>
          <Button
            onClick={() => router.push("/vendor/catalog")}
            variant="outlined"
            size="small"
            sx={{
              borderColor: "rgba(14,42,61,0.18)",
              color: "#0A1A2F",
              textTransform: "none",
              fontSize: "0.82rem",
              mt: 1,
            }}
          >
            Back to catalog
          </Button>
        </Stack>
      </SectionCard>
    );
  }

  const heroImage = images[activeImage];
  const createdOn = (item.created_at ?? "").slice(0, 10);
  const updatedOn = (item.updated_at ?? "").slice(0, 10);

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
            px: 0,
            "&:hover": { bgcolor: "transparent", color: "#0A1A2F" },
          }}
        >
          Back to catalog
        </Button>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            <Box sx={{ color: "#A07823", display: "inline-flex" }}>
              <TypeIcon type={item.type} size={14} />
            </Box>
            <Typography
              sx={{
                fontSize: "0.66rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#7A8590",
              }}
            >
              {item.type} · {item.category}
            </Typography>
          </Stack>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "1.3rem", md: "1.5rem" },
              fontWeight: 600,
              lineHeight: 1.2,
              color: "#0A1A2F",
              letterSpacing: "-0.01em",
              mb: 0.5,
            }}
          >
            {item.name}
          </Typography>
          {item.tagline && (
            <Typography sx={{ fontSize: "0.95rem", color: "#3B4A55", lineHeight: 1.5, maxWidth: 720 }}>
              {item.tagline}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
            sx={{
              borderColor: "rgba(14,42,61,0.18)",
              color: "#0A1A2F",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.06)" },
            }}
          >
            Edit
          </Button>
          <Button
            component={Link}
            href={`/vendor/offers/new?catalog=${item.id}`}
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 15 }} />}
            sx={{
              bgcolor: "#0A1A2F",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              "&:hover": { bgcolor: "#0F2540" },
            }}
          >
            Add offer
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.5 }}>
        <StatusPill status={item.review_status} />
        {(item.tags ?? []).map((t) => (
          <TagPill key={t} label={t} tone="neutral" />
        ))}
      </Stack>

      {item.review_note && (
        <Box
          sx={{
            bgcolor: "rgba(217,168,75,0.06)",
            border: "1px dashed rgba(217,168,75,0.3)",
            borderRadius: 1.5,
            px: 2,
            py: 1.25,
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", color: "#7A5B17", fontStyle: "italic" }}>
            <Box component="strong" sx={{ fontWeight: 700, fontStyle: "normal", mr: 0.5 }}>
              Team note:
            </Box>
            {item.review_note}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2}>
            {images.length > 0 && heroImage && (
              <SectionCard padding="none">
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    bgcolor: "#F7F4ED",
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage.url}
                    alt={heroImage.caption ?? item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {heroImage.caption && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 12,
                        bottom: 12,
                        px: 1,
                        py: 0.5,
                        borderRadius: 0.75,
                        bgcolor: "rgba(10,26,47,0.78)",
                        color: "#FFFFFF",
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {heroImage.caption}
                    </Box>
                  )}
                </Box>
                {images.length > 1 && (
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{
                      px: 1,
                      py: 1,
                      borderTop: "1px solid rgba(14,42,61,0.06)",
                      bgcolor: "#FBFAF6",
                      overflowX: "auto",
                    }}
                  >
                    {images.map((img, i) => (
                      <Box
                        key={img.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveImage(i)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveImage(i);
                          }
                        }}
                        sx={{
                          width: 64,
                          height: 64,
                          flexShrink: 0,
                          borderRadius: 1,
                          overflow: "hidden",
                          border: "2px solid",
                          borderColor: i === activeImage ? "#A07823" : "rgba(14,42,61,0.08)",
                          cursor: "pointer",
                          opacity: i === activeImage ? 1 : 0.7,
                          "&:hover": { opacity: 1, borderColor: "#A07823" },
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption ?? ""}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </SectionCard>
            )}

            <SectionCard title="About this listing">
              <Typography sx={{ ...portalText.body, fontSize: "0.9rem", lineHeight: 1.65 }}>
                {item.description}
              </Typography>
            </SectionCard>

            {item.highlights && item.highlights.length > 0 && (
              <SectionCard title="Highlights">
                <Stack spacing={1.25}>
                  {item.highlights.map((h) => (
                    <Stack key={h} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#A07823", mt: "1px", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "0.86rem", color: "#0A1A2F", lineHeight: 1.55 }}>
                        {h}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </SectionCard>
            )}

            {videos.length > 0 && (
              <SectionCard
                title="Videos"
                subtitle={`${videos.length} video${videos.length === 1 ? "" : "s"}`}
                padding="default"
              >
                <Grid container spacing={1.5}>
                  {videos.map((v) => (
                    <Grid key={v.id} size={{ xs: 12, sm: 6 }}>
                      <Box
                        component="a"
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: "block",
                          textDecoration: "none",
                          color: "inherit",
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border: "1px solid rgba(14,42,61,0.08)",
                          "&:hover": { borderColor: "#A07823" },
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16 / 9",
                            bgcolor: "#0A1A2F",
                          }}
                        >
                          {v.thumbnail_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={v.thumbnail_url}
                              alt={v.caption ?? ""}
                              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                            />
                          )}
                          <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                bgcolor: "rgba(255,255,255,0.92)",
                                display: "grid",
                                placeItems: "center",
                                color: "#0A1A2F",
                              }}
                            >
                              <PlayArrowRoundedIcon sx={{ fontSize: 28 }} />
                            </Box>
                          </Box>
                          {v.duration_label && (
                            <Box
                              sx={{
                                position: "absolute",
                                right: 8,
                                bottom: 8,
                                px: 0.85,
                                py: 0.25,
                                borderRadius: 0.5,
                                bgcolor: "rgba(10,26,47,0.85)",
                                color: "#FFFFFF",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              {v.duration_label}
                            </Box>
                          )}
                        </Box>
                        {v.caption && (
                          <Box sx={{ p: 1.25 }}>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#0A1A2F" }}>
                              {v.caption}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>
            )}

            {documents.length > 0 && (
              <SectionCard
                title="Documents"
                subtitle={`${documents.length} file${documents.length === 1 ? "" : "s"} attached`}
                padding="none"
              >
                <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
                  {documents.map((d) => {
                    const filename = d.url.split("/").pop() ?? "document";
                    const sizeKb = d.file_size_bytes
                      ? Math.max(1, Math.round(d.file_size_bytes / 1024))
                      : null;
                    return (
                      <Box
                        key={d.id}
                        component="a"
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          py: 1.5,
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": { bgcolor: "rgba(217,168,75,0.05)" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "rgba(217,168,75,0.12)",
                            color: "#A07823",
                            flexShrink: 0,
                          }}
                        >
                          <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, color: "#0A1A2F" }} noWrap>
                            {d.caption || filename}
                          </Typography>
                          <Typography sx={{ fontSize: "0.74rem", color: "#7A8590" }}>
                            {(d.mime_type ?? "Document").replace("application/", "").toUpperCase()}
                            {sizeKb ? ` · ${sizeKb} KB` : ""}
                          </Typography>
                        </Box>
                        <OpenInNewOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AB" }} />
                      </Box>
                    );
                  })}
                </Stack>
              </SectionCard>
            )}

            <SectionCard
              title="Attached offers"
              subtitle={`${offers.length} offer${offers.length === 1 ? "" : "s"} on this item`}
              padding="none"
              action={
                <Button
                  component={Link}
                  href={`/vendor/offers/new?catalog=${item.id}`}
                  size="small"
                  startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.78rem",
                    color: "#A07823",
                    "&:hover": { bgcolor: "rgba(217,168,75,0.06)" },
                  }}
                >
                  Add offer
                </Button>
              }
            >
              {offers.length === 0 ? (
                <Box sx={{ px: 2, py: 3, color: "#9CA3AB", fontSize: "0.84rem" }}>
                  No offers attached yet. Create one to give members a discount on this listing.
                </Box>
              ) : (
                <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
                  {offers.map((o) => (
                    <Box
                      key={o.id}
                      sx={{
                        px: 2,
                        py: 1.5,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) 110px 110px 120px" },
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.25 }}>
                          <LocalOfferOutlinedIcon sx={{ fontSize: 14, color: "#A07823" }} />
                          <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, color: "#0A1A2F" }} noWrap>
                            {o.headline}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: "0.74rem", color: "#6A7591" }} noWrap>
                          {o.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1F5C40" }}>
                          {o.discount_value}
                        </Typography>
                      </Box>
                      <Box sx={{ display: { xs: "none", md: "block" } }}>
                        <StatusPill status={o.review_status} size="sm" />
                      </Box>
                      <Box sx={{ display: { xs: "none", md: "block" }, color: "#7A8590", fontSize: "0.74rem" }}>
                        {o.valid_from} → {o.valid_to}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </SectionCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2} sx={{ position: { lg: "sticky" }, top: { lg: 76 } }}>
            <SectionCard title="Details" padding="default">
              <Stack spacing={1.25}>
                <MetaRow label="Price" value={item.price_label} highlight />
                {item.duration_hours !== null && item.duration_hours !== undefined && (
                  <MetaRow label="Duration" value={`${item.duration_hours} hours`} />
                )}
                {item.module_count !== null && item.module_count !== undefined && (
                  <MetaRow label="Modules" value={`${item.module_count}`} />
                )}
                {item.ce_credits !== null && item.ce_credits !== undefined && (
                  <MetaRow label="CE credits" value={`${item.ce_credits}`} />
                )}
                <MetaRow label="Category" value={item.category} />
                <MetaRow label="Created" value={createdOn} />
                <MetaRow label="Updated" value={updatedOn} />
              </Stack>
            </SectionCard>

            <SectionCard title="Performance" padding="default">
              <Stack spacing={1.25}>
                <MetaRow label="Attached offers" value={`${item.offer_count}`} />
                <MetaRow label="Lifetime redemptions" value={`${item.redemptions_lifetime}`} />
                <MetaRow
                  label="Media"
                  value={`${images.length} images · ${videos.length} videos · ${documents.length} docs`}
                />
              </Stack>
            </SectionCard>

            <SectionCard title="Media library" padding="default">
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", color: "#5C6770" }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <PhotoLibraryOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0A1A2F" }}>
                    {images.length}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <OndemandVideoOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0A1A2F" }}>
                    {videos.length}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0A1A2F" }}>
                    {documents.length}
                  </Typography>
                </Stack>
              </Stack>
            </SectionCard>

            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
              <Tooltip title="Delete item">
                <IconButton
                  size="small"
                  sx={{
                    color: "#8C1D1D",
                    border: "1px solid rgba(220,60,60,0.18)",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(220,60,60,0.06)", borderColor: "rgba(220,60,60,0.35)" },
                  }}
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function MetaRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
      <Typography
        sx={{
          fontSize: "0.72rem",
          color: "#9CA3AB",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: highlight ? "0.92rem" : "0.82rem",
          fontWeight: highlight ? 700 : 500,
          color: highlight ? "#A07823" : "#0A1A2F",
          textAlign: "right",
          minWidth: 0,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
