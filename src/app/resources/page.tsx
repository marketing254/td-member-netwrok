"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";

type Kit = {
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  resourceCardUrl: string | null;
  videoCount: number;
  itemCount: number;
  isFree: boolean;
};

type FilterKey = "all" | "free" | string;

const PAGE_SIZE = 9;

export default function PublicResourcesPage() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilterState] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);
  const [lockOpen, setLockOpen] = useState(false);
  const [lockedKit, setLockedKit] = useState<Kit | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/resources", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setKits([]);
          return;
        }
        const body = (await res.json()) as { kits: Kit[] };
        if (!active) return;
        setKits(body.kits ?? []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setFilter = (k: FilterKey) => {
    setFilterState(k);
    setPage(1);
  };
  const setQuery = (next: string) => {
    setQ(next);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let out = kits;
    if (filter === "free") {
      out = out.filter((k) => k.isFree);
    } else if (filter !== "all") {
      out = out.filter((k) => k.category === filter);
    }
    if (q.trim()) {
      const lc = q.toLowerCase();
      out = out.filter(
        (k) =>
          k.title.toLowerCase().includes(lc) ||
          (k.summary ?? "").toLowerCase().includes(lc) ||
          (k.category ?? "").toLowerCase().includes(lc),
      );
    }
    return out;
  }, [kits, q, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const k of kits) if (k.category) set.add(k.category);
    return Array.from(set).sort();
  }, [kits]);

  const freeCount = kits.filter((k) => k.isFree).length;

  const onCardClick = (kit: Kit) => {
    setLockedKit(kit);
    setLockOpen(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FBF8F1", display: "flex", flexDirection: "column" }}>
      <Header />

      {/* Hero */}
      <Box sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 3, md: 4 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{
              color: "#A07823",
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              display: "block",
              mb: 1.25,
            }}
          >
            FREE RESOURCE LIBRARY
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "2rem", md: "2.75rem" },
              fontWeight: 500,
              color: "#0A1A2F",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              mb: 1.5,
              maxWidth: 760,
            }}
          >
            Practical kits for practice owners. Free with founding membership.
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              color: "#3B4A55",
              lineHeight: 1.6,
              maxWidth: 640,
            }}
          >
            Each kit pairs a short training video with the action guide, worksheet,
            checklist, and slide deck your team can use this week. Sign up to
            unlock and download — every founding member gets the full library.
          </Typography>
        </Container>
      </Box>

      {/* Filter row */}
      <Container maxWidth="lg" sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 2.5, rowGap: 1 }}>
            <FilterLink
              label="All"
              count={kits.length}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterLink
              label="Free"
              count={freeCount}
              active={filter === "free"}
              onClick={() => setFilter("free")}
              tone="leaf"
            />
            {availableCategories.map((c) => (
              <FilterLink
                key={c}
                label={c}
                count={kits.filter((k) => k.category === c).length}
                active={filter === c}
                onClick={() => setFilter(c)}
              />
            ))}
          </Box>

          <TextField
            size="small"
            placeholder="Search kits"
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            variant="standard"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ fontSize: 15, color: "#7A8590" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: 260,
              "& .MuiInputBase-input": { fontSize: "0.86rem", py: 0.5 },
              "& .MuiInput-underline:before": { borderBottomColor: "rgba(14,42,61,0.12)" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottomColor: "rgba(14,42,61,0.25)",
              },
              "& .MuiInput-underline:after": { borderBottomColor: "#A07823" },
            }}
          />
        </Stack>
      </Container>

      {/* Grid */}
      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 }, flex: 1 }}>
        {loading ? (
          <Stack sx={{ alignItems: "center", py: 8 }}>
            <CircularProgress size={22} sx={{ color: "#A07823" }} />
          </Stack>
        ) : filtered.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: "center",
              borderTop: "1px solid rgba(14,42,61,0.1)",
              borderBottom: "1px solid rgba(14,42,61,0.1)",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "#0A1A2F", mb: 0.5 }}>
              {q ? `No kits match "${q}"` : "No kits in this filter"}
            </Typography>
            <Typography sx={{ fontSize: "0.86rem", color: "#5C6770" }}>
              Try a different filter or clear the search.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: { xs: 3, md: 3.5 },
                rowGap: { xs: 3.5, md: 4 },
              }}
            >
              {pageItems.map((k) => (
                <PublicKitCard key={k.slug} kit={k} onClick={() => onCardClick(k)} />
              ))}
            </Box>

            {totalPages > 1 && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
                onChange={setPage}
              />
            )}
          </>
        )}
      </Container>

      <Footer />

      <LockModal
        open={lockOpen}
        onClose={() => setLockOpen(false)}
        kit={lockedKit}
      />
    </Box>
  );
}

function FilterLink({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "leaf";
}) {
  const activeColor = tone === "leaf" ? "#1F5C40" : "#0A1A2F";
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.5,
        py: 0.5,
        cursor: "pointer",
        userSelect: "none",
        color: active ? activeColor : "#7A8590",
        borderBottom: active ? `1px solid ${activeColor}` : "1px solid transparent",
        fontSize: "0.86rem",
        fontWeight: active ? 700 : 500,
        transition: "color 160ms ease, border-color 160ms ease",
        "&:hover": { color: activeColor },
        "&:focus-visible": { outline: "2px solid #A07823", outlineOffset: 2 },
      }}
    >
      <span>{label}</span>
      <Box component="span" sx={{ fontSize: "0.7rem", opacity: 0.6, fontWeight: 600 }}>
        {count}
      </Box>
    </Box>
  );
}

function PublicKitCard({ kit, onClick }: { kit: Kit; onClick: () => void }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "transform 200ms ease",
        "&:hover": { transform: "translateY(-2px)" },
        "&:focus-visible": { outline: "2px solid #A07823", outlineOffset: 4, borderRadius: "4px" },
      }}
    >
      {/* Hero image (resource card) */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 9",
          backgroundImage: kit.resourceCardUrl
            ? `url("${kit.resourceCardUrl}")`
            : "linear-gradient(135deg, #061322 0%, #0A1A2F 50%, #1F3850 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          bgcolor: "#0A1A2F",
          overflow: "hidden",
          borderRadius: 1.5,
          mb: 1.5,
          isolation: "isolate",
        }}
      >
        {/* Lock overlay — soft, restrained */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(10,26,47,0.35)",
            transition: "background-color 200ms ease",
            ".kit-card:hover &": { bgcolor: "rgba(10,26,47,0.5)" },
          }}
        />

        {/* Top-left FREE badge */}
        {kit.isFree && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              display: "inline-flex",
              alignItems: "center",
              height: 20,
              px: 0.85,
              borderRadius: 0.5,
              bgcolor: "rgba(255,255,255,0.96)",
              color: "#1F5C40",
              fontSize: "0.6rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              zIndex: 2,
            }}
          >
            FREE
          </Box>
        )}

        {/* Centered lock + "Sign up to unlock" pill */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: "#FFFFFF",
            zIndex: 2,
            textShadow: "0 1px 2px rgba(0,0,0,0.4)",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.4)",
              display: "grid",
              placeItems: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <LockRoundedIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />
          </Box>
          <Typography
            sx={{
              fontSize: "0.66rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.95,
            }}
          >
            Sign up to unlock
          </Typography>
        </Box>

        {/* Bottom-right meta */}
        <Box
          sx={{
            position: "absolute",
            bottom: 12,
            right: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.4,
            px: 0.75,
            py: 0.3,
            borderRadius: 0.5,
            bgcolor: "rgba(10,26,47,0.78)",
            color: "#FFFFFF",
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.04em",
            zIndex: 2,
          }}
        >
          {kit.videoCount > 0 && (
            <PlayArrowRoundedIcon sx={{ fontSize: 11 }} />
          )}
          {kit.videoCount > 0
            ? `${kit.videoCount} video${kit.videoCount === 1 ? "" : "s"}`
            : `${kit.itemCount} items`}
        </Box>
      </Box>

      {/* Body */}
      {kit.category && (
        <Typography
          sx={{
            fontSize: "0.66rem",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#A07823",
            mb: 0.5,
          }}
        >
          {kit.category}
        </Typography>
      )}
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontSize: "1.15rem",
          fontWeight: 500,
          color: "#0A1A2F",
          letterSpacing: "-0.01em",
          lineHeight: 1.25,
          mb: 0.5,
        }}
      >
        {kit.title}
      </Typography>
      {kit.summary && (
        <Typography
          sx={{
            fontSize: "0.86rem",
            color: "#3B4A55",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {kit.summary}
        </Typography>
      )}
    </Box>
  );
}

function LockModal({
  open,
  onClose,
  kit,
}: {
  open: boolean;
  onClose: () => void;
  kit: Kit | null;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#FFFFFF",
            border: "1px solid rgba(14,42,61,0.08)",
            boxShadow: "0 32px 64px -32px rgba(14,42,61,0.35)",
          },
        },
      }}
    >
      {/* Header strip with kit hero */}
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 9",
          backgroundImage: kit?.resourceCardUrl
            ? `url("${kit.resourceCardUrl}")`
            : "linear-gradient(135deg, #061322 0%, #0A1A2F 50%, #1F3850 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          bgcolor: "#0A1A2F",
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(10,26,47,0.5)",
          }}
        />
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#FFFFFF",
            bgcolor: "rgba(0,0,0,0.3)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
            zIndex: 2,
          }}
          size="small"
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#FFFFFF",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.4)",
              display: "grid",
              placeItems: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <LockRoundedIcon sx={{ fontSize: 28, color: "#FFFFFF" }} />
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        {kit?.category && (
          <Typography
            sx={{
              fontSize: "0.62rem",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#A07823",
              mb: 0.75,
            }}
          >
            {kit.category}
          </Typography>
        )}
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem",
            fontWeight: 500,
            color: "#0A1A2F",
            lineHeight: 1.2,
            mb: 1,
          }}
        >
          {kit?.title ?? "Resource kit"}
        </Typography>
        <Typography sx={{ fontSize: "0.88rem", color: "#3B4A55", lineHeight: 1.6, mb: 2.5 }}>
          This kit is free with founding membership. Join the waitlist and you&apos;ll
          unlock the full library — training videos, action guides, worksheets,
          and slide decks — the moment your portal goes live.
        </Typography>

        <Stack spacing={1}>
          <Button
            component={Link}
            href="/#waitlist"
            onClick={() => {
              onClose();
              requestAnimationFrame(() => {
                const el = document.getElementById("waitlist");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            }}
            variant="contained"
            color="secondary"
            fullWidth
            disableElevation
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              py: 1.1,
              fontSize: "0.9rem",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "0 8px 22px -10px rgba(217,168,75,0.55)",
            }}
          >
            Join the waitlist
          </Button>
          <Button
            component={Link}
            href="/member/login"
            variant="outlined"
            fullWidth
            sx={{
              py: 1,
              fontSize: "0.86rem",
              fontWeight: 600,
              textTransform: "none",
              borderColor: "rgba(14,42,61,0.18)",
              color: "#0A1A2F",
              "&:hover": { borderColor: "#A07823", bgcolor: "rgba(217,168,75,0.06)" },
            }}
          >
            Already a member? Sign in
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goPrev = () => {
    if (canPrev) {
      onChange(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const goNext = () => {
    if (canNext) {
      onChange(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pageNumbers: Array<number | "…"> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    if (page > 3) pageNumbers.push("…");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (page < totalPages - 2) pageNumbers.push("…");
    pageNumbers.push(totalPages);
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{
        mt: 5,
        pt: 2.5,
        borderTop: "1px solid rgba(14,42,61,0.1)",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ fontSize: "0.78rem", color: "#5C6770" }}>
        Showing {from}–{to} of {totalItems}
      </Typography>

      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <PageButton onClick={goPrev} disabled={!canPrev}>
          <ArrowBackIcon sx={{ fontSize: 13 }} /> Prev
        </PageButton>

        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.25, mx: 1 }}>
          {pageNumbers.map((p, i) =>
            p === "…" ? (
              <Box key={`gap-${i}`} sx={{ px: 0.75, color: "#9CA3AB", fontSize: "0.82rem" }}>
                …
              </Box>
            ) : (
              <PageNumber
                key={p}
                page={p}
                active={p === page}
                onClick={() => {
                  onChange(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ),
          )}
        </Box>

        <Box
          sx={{
            display: { xs: "inline-flex", sm: "none" },
            mx: 1,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#0A1A2F",
          }}
        >
          {page} / {totalPages}
        </Box>

        <PageButton onClick={goNext} disabled={!canNext}>
          Next <ArrowForwardIcon sx={{ fontSize: 13 }} />
        </PageButton>
      </Stack>
    </Stack>
  );
}

function PageButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        height: 32,
        px: 1.5,
        bgcolor: "transparent",
        border: "1px solid rgba(14,42,61,0.12)",
        borderRadius: 0.75,
        color: disabled ? "#9CA3AB" : "#0A1A2F",
        fontSize: "0.8rem",
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background-color 160ms ease, border-color 160ms ease",
        "&:hover": disabled
          ? {}
          : {
              borderColor: "#0A1A2F",
              bgcolor: "rgba(14,42,61,0.04)",
            },
        "&:focus-visible": { outline: "2px solid #A07823", outlineOffset: 2 },
      }}
    >
      {children}
    </Box>
  );
}

function PageNumber({
  page,
  active,
  onClick,
}: {
  page: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      sx={{
        minWidth: 32,
        height: 32,
        bgcolor: active ? "#0A1A2F" : "transparent",
        color: active ? "#FBF8F1" : "#0A1A2F",
        border: "1px solid",
        borderColor: active ? "#0A1A2F" : "transparent",
        borderRadius: 0.75,
        fontSize: "0.8rem",
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: "pointer",
        transition: "background-color 160ms ease, color 160ms ease",
        "&:hover": active ? {} : { bgcolor: "rgba(14,42,61,0.06)" },
        "&:focus-visible": { outline: "2px solid #A07823", outlineOffset: 2 },
      }}
    >
      {page}
    </Box>
  );
}
