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
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  fetchCurrentVendor,
  fetchVendorCatalog,
  type CatalogItemWithMedia,
} from "@/lib/supabase/vendorQueries";
import type { CatalogItemsRow } from "@/lib/supabase/types";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatusPill,
  TagPill,
} from "@/components/vendor/PortalUI";

type CatalogType = CatalogItemsRow["type"];

const TYPE_FILTERS: { key: "all" | CatalogType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "service", label: "Services" },
  { key: "product", label: "Products" },
  { key: "course", label: "Courses" },
];

function TypeIcon({ type, size = 16 }: { type: CatalogType; size?: number }) {
  const Icon =
    type === "service"
      ? MedicalServicesOutlinedIcon
      : type === "product"
        ? Inventory2OutlinedIcon
        : SchoolOutlinedIcon;
  return <Icon sx={{ fontSize: size }} />;
}

export default function VendorCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CatalogItemWithMedia[]>([]);
  const [filter, setFilter] = useState<"all" | CatalogType>("all");
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
      const data = await fetchVendorCatalog(supabase, v.id);
      if (!active) return;
      setItems(data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((c) => {
      if (filter !== "all" && c.type !== filter) return false;
      if (!ql) return true;
      return (
        c.name.toLowerCase().includes(ql) ||
        c.category.toLowerCase().includes(ql) ||
        (c.tagline ?? "").toLowerCase().includes(ql)
      );
    });
  }, [items, filter, q]);

  const counts = useMemo(() => {
    const acc = { all: items.length, service: 0, product: 0, course: 0 };
    for (const c of items) acc[c.type] += 1;
    return acc;
  }, [items]);

  if (loading) {
    return (
      <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
        <CircularProgress size={28} sx={{ color: "#A07823" }} />
        <Typography sx={{ color: "#5C6770", fontSize: "0.88rem" }}>Loading catalog…</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader
        eyebrow="CATALOG"
        title="Services, products & courses"
        subtitle="Each row is a single listing. Click to see full details, media, and attached offers."
        actions={
          <Button
            component={Link}
            href="/vendor/catalog/new"
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: "#0A1A2F",
              textTransform: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              "&:hover": { bgcolor: "#0F2540" },
            }}
          >
            Add new item
          </Button>
        }
      />

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
            value={filter}
            onChange={(_, v) => setFilter(v)}
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
            {TYPE_FILTERS.map((t) => (
              <Tab
                key={t.key}
                value={t.key}
                label={
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <span>{t.label}</span>
                    <Box
                      sx={{
                        bgcolor: filter === t.key ? "rgba(217,168,75,0.18)" : "rgba(14,42,61,0.05)",
                        color: filter === t.key ? "#A07823" : "#7A8590",
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
          placeholder="Search items"
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

      {rows.length === 0 ? (
        q || filter !== "all" ? (
          <EmptyState icon={SearchOutlinedIcon} title="No results" body="Adjust the filter or search." />
        ) : (
          <EmptyState
            icon={Inventory2OutlinedIcon}
            title="Nothing here yet"
            body="Add the services, products, or courses you want to offer through the network."
            action={
              <Button
                component={Link}
                href="/vendor/catalog/new"
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: "#0A1A2F",
                  textTransform: "none",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#0F2540" },
                }}
              >
                Add your first item
              </Button>
            }
          />
        )
      ) : (
        <SectionCard padding="none">
          <Box
            sx={{
              display: { xs: "none", md: "grid" },
              gridTemplateColumns: "72px minmax(0, 2fr) 120px 100px 110px 90px 36px",
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
            <Box />
            <Box>Name</Box>
            <Box>Type</Box>
            <Box>Status</Box>
            <Box>Price</Box>
            <Box>Offers</Box>
            <Box />
          </Box>

          <Stack divider={<Box sx={{ borderTop: "1px solid rgba(14,42,61,0.06)" }} />}>
            {rows.map((item) => (
              <CatalogRow key={item.id} item={item} />
            ))}
          </Stack>
        </SectionCard>
      )}
    </Stack>
  );
}

function CatalogRow({ item }: { item: CatalogItemWithMedia }) {
  const hero = item.catalog_media.find((m) => m.kind === "image");
  const updatedOn = (item.updated_at ?? "").slice(0, 10);

  return (
    <Box
      component={Link}
      href={`/vendor/catalog/${item.id}`}
      sx={{
        textDecoration: "none",
        color: "inherit",
        display: { xs: "flex", md: "grid" },
        gridTemplateColumns: "72px minmax(0, 2fr) 120px 100px 110px 90px 36px",
        alignItems: "center",
        gap: { xs: 1.5, md: 1.5 },
        px: 2,
        py: 1.5,
        "&:hover": { bgcolor: "rgba(14,42,61,0.025)" },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1,
          overflow: "hidden",
          flexShrink: 0,
          bgcolor: "rgba(217,168,75,0.08)",
          border: "1px solid rgba(14,42,61,0.06)",
          display: "grid",
          placeItems: "center",
        }}
      >
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box sx={{ color: "#A07823", opacity: 0.6 }}>
            <TypeIcon type={item.type} size={20} />
          </Box>
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: { xs: 1, md: "unset" } }}>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#0A1A2F", mb: 0.25 }} noWrap>
          {item.name}
        </Typography>
        <Typography sx={{ fontSize: "0.74rem", color: "#6A7591" }} noWrap>
          {item.category} · Updated {updatedOn}
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TagPill
          label={item.type}
          tone={item.type === "product" ? "navy" : item.type === "course" ? "gold" : "neutral"}
          size="sm"
        />
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <StatusPill status={item.review_status} size="sm" />
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Typography sx={{ fontSize: "0.84rem", fontWeight: 700, color: "#0A1A2F" }} noWrap>
          {item.price_label}
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
        <LocalOfferOutlinedIcon sx={{ fontSize: 14, color: "#A07823" }} />
        <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0A1A2F" }}>
          {item.offer_count}
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end" }}>
        <Tooltip title="Open details">
          <IconButton size="small" sx={{ color: "#9CA3AB", pointerEvents: "none" }}>
            <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          display: { xs: "flex", md: "none" },
          flexWrap: "wrap",
          rowGap: 0.5,
          mt: 0.5,
          gridColumn: "1 / -1",
        }}
      >
        <TagPill
          label={item.type}
          tone={item.type === "product" ? "navy" : item.type === "course" ? "gold" : "neutral"}
          size="sm"
        />
        <StatusPill status={item.review_status} size="sm" />
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#0A1A2F" }}>
          {item.price_label}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "#A07823", fontWeight: 600 }}>
          {item.offer_count} offer{item.offer_count === 1 ? "" : "s"}
        </Typography>
      </Stack>
    </Box>
  );
}
