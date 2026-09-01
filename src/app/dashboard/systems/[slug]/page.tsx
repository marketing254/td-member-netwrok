"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isSupabaseImage } from "@/lib/images";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { SOPS } from "@/lib/sops";

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const INK_MUTED = "#7A8590";
const GOLD = "#A07823";
const LINE = "#E6DDCF";

/**
 * /dashboard/systems/[slug] — an SOP read INSIDE the portal, exactly like
 * a kit resource: the PDF renders in the same inline native viewer the
 * resource library uses (fitted to width, toolbar on so members can page,
 * zoom, print and download without leaving the portal).
 */
export default function SopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const sop = SOPS.find((s) => s.slug === slug);
  if (!sop) notFound();

  const others = SOPS.filter((s) => s.slug !== slug);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: { xs: 3, md: 4 }, px: { xs: 2, md: 0 } }}>
      <Box
        component={Link}
        href="/dashboard/systems"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          fontSize: "0.8rem",
          fontWeight: 700,
          color: INK_MUTED,
          textDecoration: "none",
          mb: 2.5,
          "&:hover": { color: GOLD },
        }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> All systems
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "flex-end" }, justifyContent: "space-between", mb: 2.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.66rem",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: GOLD,
              mb: 0.75,
            }}
          >
            {sop.category} · SOP
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: { xs: "1.6rem", md: "2rem" },
              fontWeight: 500,
              color: INK,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              mb: 0.75,
            }}
          >
            {sop.title}
          </Typography>
          <Typography sx={{ fontSize: "0.88rem", color: INK_SOFT }}>
            By{" "}
            <Box
              component={Link}
              href={`/dashboard/experts/${sop.expert.id}`}
              sx={{
                color: INK,
                fontWeight: 700,
                textDecoration: "none",
                borderBottom: "1px solid rgba(217,168,75,0.5)",
                "&:hover": { color: GOLD },
              }}
            >
              {sop.expert.name}
            </Box>{" "}
            · written from their session and approved by them
          </Typography>
        </Box>
        <Button
          component="a"
          href={sop.pdfUrl}
          target="_blank"
          rel="noopener"
          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            "&&": {
              bgcolor: INK,
              color: "#F6F1E7",
              fontWeight: 700,
              fontSize: "0.82rem",
              textTransform: "none",
              px: 2.5,
              py: 1,
              borderRadius: 999,
              whiteSpace: "nowrap",
            },
            "&&:hover": { bgcolor: "#12325A" },
          }}
        >
          Download PDF
        </Button>
      </Stack>

      {/* Inline reader — same native PDF viewer the kit resources use. */}
      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: `1px solid ${LINE}`,
          bgcolor: "#FFFFFF",
          boxShadow: "0 24px 48px -28px rgba(10,26,47,0.25)",
        }}
      >
        <Box
          component="iframe"
          src={`${sop.pdfUrl}#view=FitH&toolbar=1&navpanes=0`}
          title={`${sop.title} — SOP by ${sop.expert.name}`}
          sx={{
            display: "block",
            width: "100%",
            height: { xs: "70vh", md: "82vh" },
            border: 0,
          }}
        />
      </Box>
      <Typography sx={{ mt: 1, fontSize: "0.74rem", color: INK_MUTED }}>
        Print or save from the viewer toolbar — this SOP is yours to run with your team.
      </Typography>

      {/* More systems */}
      {others.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: INK,
              mb: 2,
            }}
          >
            More systems
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: 2,
            }}
          >
            {others.map((s) => (
              <Box
                key={s.slug}
                component={Link}
                href={`/dashboard/systems/${s.slug}`}
                sx={{
                  position: "relative",
                  display: "block",
                  aspectRatio: "3 / 4",
                  borderRadius: 2.5,
                  overflow: "hidden",
                  border: `1px solid ${LINE}`,
                  transition: "transform 240ms cubic-bezier(0.16,1,0.3,1), border-color 240ms ease",
                  "&:hover": { transform: "translateY(-3px)", borderColor: "#D9A84B" },
                }}
              >
                <Image
                  src={s.cardUrl}
                  alt={`${s.title} — SOP by ${s.expert.name}`}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                  unoptimized={!isSupabaseImage(s.cardUrl)}
                  style={{ objectFit: "cover" }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
