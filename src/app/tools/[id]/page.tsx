import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import ToolCard from "@/components/tools/ToolCard";
import { MEMBER_TOOLS, TOOL_CATEGORIES, isPublicTool, toolById, toolPreviewSrc } from "@/lib/toolsData";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isMemberPaid } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mirrors COLORS in src/theme.ts (that file is "use client", so a server
// component can't import from it).
const COLORS = {
  ink: "#0A1320",
  inkSoft: "#3B4A55",
  muted: "#5C6770",
  surface: "#F7F5F0",
  surfaceAlt: "#EFEAE0",
  line: "#E0DACE",
  primary: "#0E2A3D",
  primaryDark: "#06182A",
  accent: "#D9A84B",
  accentDeep: "#A07823",
};
const GOLD_DEEP = "#A07823";
const GOLD_SOFT = "#FBF3E1";

/**
 * /tools/[id] — PUBLIC preview of one member tool.
 *
 * The "glimpse then lock" pattern: the page shows a static screenshot of
 * the calculator with the lower part blurred behind a lock card. The tool
 * HTML is NOT here and is never publicly reachable — members get it via
 * /api/member/tools/[id] inside the portal.
 *
 * A signed-in active member who lands here (from Google, or a shared
 * link) is sent straight to the working tool in their portal.
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tool = toolById(id);
  if (!tool) return { title: "Tool not found" };
  const title = `${tool.title} for dental practices`;
  const description = `${tool.blurb} ${tool.expert ? `Built with ${tool.expert}.` : "Built by Dental Member Network."} Free preview; members run it with their own numbers.`;
  return {
    title,
    description,
    alternates: { canonical: `/tools/${tool.id}` },
    openGraph: { type: "website", title, description, images: [{ url: toolPreviewSrc(tool.id) }] },
  };
}

/**
 * True only for a signed-in member whose subscription is active or
 * trialing. An unpaid or lapsed member gets the public page like anyone
 * else (never a bounce into the portal's upgrade wall from a public URL).
 */
async function signedInPaidMember(): Promise<boolean> {
  try {
    const sb = await createServerSupabase();
    const { data } = await sb.auth.getUser();
    const email = data?.user?.email?.toLowerCase();
    if (!email) return false;
    const { data: row } = await getSupabaseAdmin()
      .from("members")
      .select("status, subscription_status")
      .eq("email", email)
      .maybeSingle();
    return !!row && row.status === "active" && isMemberPaid(row.subscription_status);
  } catch {
    return false;
  }
}

export default async function PublicToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = toolById(id);
  if (!tool) notFound();

  if (await signedInPaidMember()) redirect(`/dashboard/tools/${tool.id}`);

  const color = TOOL_CATEGORIES.find((c) => c.name === tool.category)?.color ?? COLORS.ink;
  const live = isPublicTool(tool.id);
  const sameCat = MEMBER_TOOLS.filter((t) => t.category === tool.category && t.id !== tool.id);
  const more = (sameCat.length ? sameCat : MEMBER_TOOLS.filter((t) => t.id !== tool.id)).slice(0, 3);
  const signInHref = `/member/login?redirect=${encodeURIComponent(`/dashboard/tools/${tool.id}`)}`;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.surface, display: "flex", flexDirection: "column" }}>
      <Header />

      <Box component="main" sx={{ flex: 1, pb: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          {/* Breadcrumb */}
          <Stack
            component="nav"
            aria-label="Breadcrumb"
            direction="row"
            spacing={1}
            sx={{ pt: { xs: 3, md: 4 }, alignItems: "center", color: COLORS.muted, fontSize: "0.85rem", flexWrap: "wrap" }}
          >
            <Link href="/tools" style={{ color: COLORS.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> Tools
            </Link>
            <span>/</span>
            <span>{tool.category}</span>
            <span>/</span>
            <Box component="span" sx={{ color: COLORS.inkSoft, fontWeight: 600 }}>{tool.title}</Box>
          </Stack>

          {/* Title + membership box */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
              gap: { xs: 2.5, md: 4 },
              alignItems: "end",
              pt: 2.5,
              pb: { xs: 3, md: 3.5 },
            }}
          >
            <Stack spacing={1.25} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color }}>
                {tool.category}
              </Typography>
              <Typography
                component="h1"
                sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "2rem", md: "2.9rem" }, fontWeight: 500, color: COLORS.ink, lineHeight: 1.08, letterSpacing: "-0.02em" }}
              >
                {tool.title}
              </Typography>
              <Typography sx={{ color: COLORS.muted, fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 620 }}>{tool.blurb}</Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", columnGap: 2.5, rowGap: 0.5, color: COLORS.inkSoft, fontSize: "0.92rem" }}>
                <span>
                  {tool.expert ? "Built with " : "Built by "}
                  <b>{tool.expert ?? "DMN"}</b>
                </span>
                {tool.kit ? (
                  <span>
                    From the Playbook <b>{tool.kit}</b>
                  </span>
                ) : null}
                <span>
                  For <b>{tool.audience === "team" ? "the whole team" : "practice owners"}</b>
                </span>
              </Stack>
            </Stack>

            <Box sx={{ bgcolor: GOLD_SOFT, border: "1px solid #F0E2BF", borderRadius: 3, px: 2.5, py: 2.25, minWidth: { md: 280 }, display: "grid", gap: 0.75 }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: GOLD_DEEP }}>
                {live ? "Free to try · Results with membership" : "Members use this free"}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", lineHeight: 1.1, color: COLORS.ink }}>
                Founding membership · $49/mo
              </Typography>
              <Typography sx={{ color: COLORS.muted, fontSize: "0.8rem", lineHeight: 1.5 }}>
                {live
                  ? `See your results and download them as a PDF, plus the other ${MEMBER_TOOLS.length - 1} tools, the Practice Playbook library and the expert hotline.`
                  : `Locked for life. All ${MEMBER_TOOLS.length} tools, the Practice Playbook library, the expert hotline and partner offers.`}
              </Typography>
              <Button
                href="/join/member"
                variant="contained"
                fullWidth
                sx={{ mt: 0.5, textTransform: "none", borderRadius: 999, fontWeight: 700, bgcolor: COLORS.primary, "&:hover": { bgcolor: COLORS.primaryDark } }}
              >
                {live ? "Join to see your results" : "Join to unlock"}
              </Button>
            </Box>
          </Box>

          {/* The glimpse */}
          <Box sx={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, overflow: "hidden", bgcolor: "#fff", boxShadow: "0 30px 60px -40px rgba(10,19,32,0.4)" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", px: 1.75, py: 1.25, borderBottom: `1px solid ${COLORS.line}`, bgcolor: "#FBFAF7" }}>
              {[0, 1, 2].map((i) => (
                <Box key={i} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS.line }} />
              ))}
              <Box sx={{ ml: 1, fontFamily: "ui-monospace, Consolas, monospace", fontSize: "0.75rem", color: COLORS.inkSoft, bgcolor: COLORS.surfaceAlt, px: 1.25, py: 0.4, borderRadius: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                dentalmembernetwork.com/tools/{tool.id}
              </Box>
              <Box sx={{ ml: "auto", flexShrink: 0, bgcolor: live ? "#E4F1E4" : GOLD_SOFT, color: live ? "#1B6B4A" : GOLD_DEEP, fontWeight: 800, fontSize: "0.64rem", letterSpacing: "0.1em", textTransform: "uppercase", px: 1.1, py: 0.5, borderRadius: 999 }}>
                {live ? "Live · free to use" : "Preview · inputs locked"}
              </Box>
            </Stack>

            {live ? (
              /* The real calculator, served by the public allow-list route
                 with its PDF button turned into a membership gate. */
              <Box
                component="iframe"
                src={`/api/tools/public/${tool.id}`}
                title={tool.title}
                sx={{ display: "block", width: "100%", border: 0, height: { xs: "calc(100vh - 120px)", md: 960 }, bgcolor: "#f2f5f8" }}
              />
            ) : (
            <Box sx={{ position: "relative", height: { xs: 520, md: 620 }, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={toolPreviewSrc(tool.id)}
                alt={`Preview of the ${tool.title}`}
                style={{ width: "100%", display: "block", pointerEvents: "none", userSelect: "none" }}
              />
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  backdropFilter: "blur(7px)",
                  WebkitBackdropFilter: "blur(7px)",
                  maskImage: "linear-gradient(180deg, transparent 42%, #000 72%)",
                  WebkitMaskImage: "linear-gradient(180deg, transparent 42%, #000 72%)",
                }}
              />
              <Box
                aria-hidden
                sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(247,245,240,0) 40%, rgba(247,245,240,0.5) 64%, rgba(247,245,240,0.96) 100%)" }}
              />

              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: { xs: "50%", md: "66%" },
                  transform: "translate(-50%, -30%)",
                  width: "min(460px, calc(100% - 32px))",
                  bgcolor: "#fff",
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 4,
                  p: { xs: 2.5, md: 3.25 },
                  textAlign: "center",
                  display: "grid",
                  gap: 1.25,
                  justifyItems: "center",
                  boxShadow: "0 24px 50px -24px rgba(10,19,32,0.35)",
                }}
              >
                <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: COLORS.primary, color: "#fff", display: "grid", placeItems: "center" }}>
                  <LockRoundedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 500, color: COLORS.ink, lineHeight: 1.15 }}>
                  This calculator is for members
                </Typography>
                <Typography sx={{ color: COLORS.muted, fontSize: "0.92rem", lineHeight: 1.55, maxWidth: 380 }}>
                  Join to run it with your own numbers, plus the other {MEMBER_TOOLS.length - 1} tools, the full resource
                  library and the expert hotline.
                </Typography>
                <Stack direction="row" spacing={1.25} sx={{ flexWrap: "wrap", justifyContent: "center", mt: 0.5 }}>
                  <Button
                        href="/join/member"
                    variant="contained"
                    sx={{ textTransform: "none", borderRadius: 999, px: 3, fontWeight: 700, bgcolor: COLORS.accent, color: COLORS.ink, "&:hover": { bgcolor: COLORS.accentDeep, color: "#fff" } }}
                  >
                    Become a member
                  </Button>
                  <Button
                        href={signInHref}
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: 999, px: 3, fontWeight: 700, color: COLORS.ink, borderColor: COLORS.line, "&:hover": { borderColor: COLORS.ink, bgcolor: "#fff" } }}
                  >
                    Sign in
                  </Button>
                </Stack>
                <Typography sx={{ color: COLORS.muted, fontSize: "0.76rem" }}>
                  Already a member? Sign in and this page opens the tool.
                </Typography>
              </Box>
            </Box>
            )}
          </Box>

          {/* About */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.6fr) minmax(0, 1fr)" }, gap: 3, py: { xs: 4, md: 5 } }}>
            <Box sx={{ bgcolor: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 3.5, p: { xs: 2.5, md: 3 } }}>
              <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 500, color: COLORS.ink, mb: 1.25 }}>
                What this tool does
              </Typography>
              <Typography sx={{ color: COLORS.inkSoft, lineHeight: 1.7, maxWidth: 620, mb: 1 }}>
                {tool.blurb} Enter your own figures and the calculator updates as you type, with the result explained
                in plain language so you can act on it the same day.
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: COLORS.inkSoft, lineHeight: 1.7, "& li": { mb: 0.5 } }}>
                <li>Runs entirely in your browser. Nothing you type is saved or sent anywhere.</li>
                {live ? <li>Enter your numbers free right here. Members see the results and download them as a PDF.</li> : null}
                {tool.kit ? <li>Built to pair with the expert Playbook, so the numbers feed straight into it.</li> : null}
                <li>Works on a phone at chairside as well as on a desktop.</li>
              </Box>
            </Box>
            <Box sx={{ bgcolor: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 3.5, p: { xs: 2.5, md: 3 }, display: "grid", gap: 1.5, alignContent: "start" }}>
              <Fact label="Category" value={tool.category} />
              <Fact label="Expert" value={tool.expert ?? "DMN original"} />
              <Fact label="Companion Playbook" value={tool.kit ?? "—"} />
              <Fact label="Access" value={live ? "Free to try · results for members" : "Members only · included"} />
            </Box>
          </Box>

          {/* More */}
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
            <Typography component="h2" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.5rem", md: "1.9rem" }, fontWeight: 500, color: COLORS.ink }}>
              {sameCat.length ? `More tools in ${tool.category}` : "More member tools"}
            </Typography>
            <Link href="/tools" style={{ color: GOLD_DEEP, fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
              See all {MEMBER_TOOLS.length} tools →
            </Link>
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
            {more.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.muted }}>
        {label}
      </Typography>
      <Typography sx={{ color: COLORS.ink, fontWeight: 600, mt: 0.25 }}>{value}</Typography>
    </Box>
  );
}
