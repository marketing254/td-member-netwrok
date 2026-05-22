"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  fetchCurrentVendor,
  fetchVendorCatalog,
  fetchVendorOffers,
  type CatalogItemWithMedia,
  type OfferWithCatalog,
} from "@/lib/supabase/vendorQueries";
import type { CatalogItemsRow, ReviewStatus } from "@/lib/supabase/types";
import {
  EmptyState,
  PageHeader,
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

type StatusFilter = "all" | ReviewStatus;
const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Live" },
  { key: "pending_review", label: "In review" },
  { key: "draft", label: "Draft" },
  { key: "rejected", label: "Rejected" },
];

export default function VendorOffersPage() {
  const [loading, setLoading] = useState(true);
  const [hasCatalog, setHasCatalog] = useState(false);
  const [offers, setOffers] = useState<OfferWithCatalog[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabase();
    (async () => {
      const v = await fetchCurrentVendor(supabase);
      if (!active) return;
      if (!v) {
        setLoading(false);
        return;
      }

      const [catalogData, offerData] = await Promise.all([
        fetchVendorCatalog(supabase, v.id),
        fetchVendorOffers(supabase, v.id),
      ]);
      if (!active) return;
      setHasCatalog((catalogData as CatalogItemWithMedia[]).length > 0);
      setOffers(offerData);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const acc: Record<StatusFilter, number> = {
      all: offers.length,
      approved: 0,
      pending_review: 0,
      draft: 0,
      rejected: 0,
      needs_changes: 0,
    };
    for (const o of offers) acc[o.review_status] += 1;
    return acc;
  }, [offers]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return offers.filter((o) => {
      if (statusFilter !== "all" && o.review_status !== statusFilter) return false;
      if (!ql) return true;
      return (
        o.headline.toLowerCase().includes(ql) ||
        (o.promo_code ?? "").toLowerCase().includes(ql) ||
        (o.catalog_items?.name ?? "").toLowerCase().includes(ql)
      );
    });
  }, [offers, statusFilter, q]);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#A07823" }} />
        <Typography sx={{ color: "#5C6770", fontSize: "0.88rem" }}>Loading offers…</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader
        eyebrow="OFFERS"
        title="Member discounts on your catalog"
        subtitle="Each offer is a discount or bonus on top of a service, product, or course you list. Our team reviews new offers before they go live to members."
        actions={
          <Button
            component={Link}
            href="/vendor/offers/new"
            variant="contained"
            size="small"
            disabled={!hasCatalog}
            startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: "#0A1A2F",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              "&:hover": { bgcolor: "#0F2540" },
            }}
          >
            Create offer
          </Button>
        }
      />

      {!hasCatalog ? (
        <EmptyState
          icon={Inventory2OutlinedIcon}
          title="Add a catalog item first"
          body="Offers attach to a service, product, or course. Add one to your catalog first."
          action={
            <Button
              component={Link}
              href="/vendor/catalog/new"
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#0A1A2F",
                textTransform: "none",
                fontSize: "0.82rem",
                fontWeight: 600,
                "&:hover": { bgcolor: "#0F2540" },
              }}
            >
              Add catalog item
            </Button>
          }
        />
      ) : (
        <>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid",
                borderColor: "rgba(14,42,61,0.08)",
                borderRadius: 2,
                px: 0.5,
                flex: 1,
              }}
            >
              <Tabs
                value={statusFilter}
                onChange={(_, v) => setStatusFilter(v)}
                variant="scrollable"
                allowScrollButtonsMobile
                sx={{
                  minHeight: 40,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    minHeight: 40,
                    color: "#5C6770",
                    "&.Mui-selected": { color: "#0A1A2F" },
                  },
                  "& .MuiTabs-indicator": { backgroundColor: "#A07823", height: 2 },
                }}
              >
                {STATUS_FILTERS.map((t) => (
                  <Tab
                    key={t.key}
                    value={t.key}
                    label={
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <span>{t.label}</span>
                        <Box
                          sx={{
                            bgcolor: statusFilter === t.key ? "rgba(217,168,75,0.18)" : "rgba(14,42,61,0.05)",
                            color: statusFilter === t.key ? "#A07823" : "#7A8590",
                            borderRadius: 999,
                            px: 0.85,
                            fontSize: "0.66rem",
                            fontWeight: 700,
                            minWidth: 20,
                            textAlign: "center",
                            lineHeight: "16px",
                          }}
                        >
                          {counts[t.key]}
                        </Box>
                      </Stack>
                    }
                  />
                ))}
              </Tabs>
            </Box>
            <TextField
              size="small"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search offers"
              sx={{
                minWidth: { md: 280 },
                "& .MuiOutlinedInput-root": { bgcolor: "#FFFFFF", fontSize: "0.84rem", borderRadius: 2 },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon sx={{ fontSize: 16, color: "#7A8590" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          {filtered.length === 0 ? (
            <EmptyState
              icon={LocalOfferOutlinedIcon}
              title="No offers match"
              body="Try a different filter or clear your search."
            />
          ) : (
            <SectionCard padding="none">
              <Box
                sx={{
                  display: { xs: "none", md: "grid" },
                  gridTemplateColumns: "minmax(0, 2.5fr) 130px 120px 150px 110px 56px",
                  alignItems: "center",
                  px: 2,
                  py: 1.25,
                  borderBottom: "1px solid rgba(14,42,61,0.06)",
                  bgcolor: "#FBFAF6",
                  fontSize: "0.66rem",
                  fontWeight: 700,
                  color: "#7A8590",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                <Box>Offer · Attached to</Box>
                <Box>Discount</Box>
                <Box>Status</Box>
                <Box>Validity</Box>
                <Box>Promo code</Box>
                <Box />
              </Box>
              <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
                {filtered.map((o) => (
                  <OfferRow key={o.id} offer={o} />
                ))}
              </Stack>
            </SectionCard>
          )}

          <Typography sx={portalText.meta}>
            New offers go through team review within 24 business hours.
          </Typography>
        </>
      )}
    </Stack>
  );
}

function OfferRow({ offer }: { offer: OfferWithCatalog }) {
  const item = offer.catalog_items;
  return (
    <Box
      sx={{
        display: { xs: "block", md: "grid" },
        gridTemplateColumns: "minmax(0, 2.5fr) 130px 120px 150px 110px 56px",
        alignItems: "center",
        px: 2,
        py: 1.5,
        gap: 1,
        "&:hover": { bgcolor: "rgba(14,42,61,0.02)" },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#0A1A2F" }} noWrap>
          {offer.headline}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
          {item && (
            <>
              <Box sx={{ color: "#7A8590", display: "inline-flex" }}>
                <TypeIcon type={item.type} size={13} />
              </Box>
              <Typography sx={{ fontSize: "0.74rem", color: "#5C6770" }} noWrap>
                {item.name}
              </Typography>
            </>
          )}
          <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AB" }}>·</Typography>
          <TagPill label={`limit ${offer.redemption_limit_per_member}`} tone="neutral" size="sm" />
        </Stack>
        {offer.review_note && (
          <Typography sx={{ fontSize: "0.72rem", color: "#7A5B17", fontStyle: "italic", mt: 0.5 }}>
            Team note: {offer.review_note}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1F5C40" }} noWrap>
          {offer.discount_value}
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <StatusPill status={offer.review_status} size="sm" />
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Typography sx={{ fontSize: "0.78rem", color: "#0A1A2F" }} noWrap>
          {offer.valid_from}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "#7A8590" }} noWrap>
          to {offer.valid_to}
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#A07823",
              px: 0.75,
              py: 0.25,
              borderRadius: 0.75,
              bgcolor: "rgba(217,168,75,0.08)",
              border: "1px dashed rgba(217,168,75,0.3)",
            }}
          >
            {offer.promo_code || "—"}
          </Box>
          {offer.promo_code && (
            <Tooltip title="Copy code">
              <IconButton size="small" sx={{ color: "#7A8590" }}>
                <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Edit offer">
          <IconButton size="small" sx={{ color: "#5C6770" }}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          display: { xs: "flex", md: "none" },
          flexWrap: "wrap",
          rowGap: 0.5,
          mt: 1,
          gridColumn: "1 / -1",
        }}
      >
        <StatusPill status={offer.review_status} size="sm" />
        <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#1F5C40" }}>
          {offer.discount_value}
        </Typography>
        <Typography sx={{ fontSize: "0.74rem", color: "#5C6770" }}>
          {offer.valid_from} → {offer.valid_to}
        </Typography>
      </Stack>
    </Box>
  );
}
