"use client";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import type { SecondOpinionResult } from "@/lib/tools/secondOpinion/run";

const INK = "#1A2230";
const INK_SOFT = "#4A5566";
const INK_MUTED = "#8A929E";
const GOLD = "#A07823";
const GOLD_BRIGHT = "#D9A84B";
const LINE = "#E7E3DA";
const NAVY = "#0A1726";

type Run = { id: string; status: "processing" | "done" | "failed"; fileName: string; result: SecondOpinionResult | null; error: string | null; createdAt: string };

/**
 * /dashboard/tools/second-opinion/[runId]
 *
 * The result page. Four blocks in the fixed order from the brief: what
 * this is, what is actually in it, what we notice, our recommendation.
 * Facts before opinion; the recommendation never moves up. Two links at
 * the foot, an option and never a gate.
 */
export default function SecondOpinionResultPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = use(params);
  const router = useRouter();
  const [run, setRun] = useState<Run | null | undefined>(undefined);
  const [askOpen, setAskOpen] = useState(false);
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState(false);
  const [asked, setAsked] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/member/tools/second-opinion/${runId}`, { cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; run?: Run };
      setRun(res.ok && body.ok && body.run ? body.run : null);
    } catch {
      setRun(null);
    }
  }, [runId]);
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const remove = async () => {
    if (!window.confirm("Delete this result and the uploaded document? This cannot be undone.")) return;
    await fetch(`/api/member/tools/second-opinion/${runId}`, { method: "DELETE" });
    router.push("/dashboard/tools/second-opinion");
  };

  const ask = async () => {
    setAsking(true);
    try {
      const res = await fetch(`/api/member/tools/second-opinion/${runId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) });
      if (res.ok) setAsked(true);
    } finally {
      setAsking(false);
    }
  };

  if (run === undefined) {
    return (
      <Stack sx={{ alignItems: "center", py: 10 }}>
        <CircularProgress size={26} sx={{ color: GOLD }} />
      </Stack>
    );
  }
  if (run === null) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", py: 6, px: 2, textAlign: "center" }}>
        <Typography sx={{ fontSize: "1.05rem", fontWeight: 600, color: INK, mb: 0.5 }}>We couldn&apos;t find that result</Typography>
        <Box component={Link} href="/dashboard/tools/second-opinion" sx={{ color: GOLD, fontWeight: 600, fontSize: "0.9rem" }}>Back to Second Opinion</Box>
      </Box>
    );
  }

  const r = run.result;

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", py: { xs: 2.5, md: 4 }, px: { xs: 1.5, md: 0 } }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Box component={Link} href="/dashboard/tools/second-opinion" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, textDecoration: "none", color: INK_MUTED, fontSize: "0.85rem", fontWeight: 600, "&:hover": { color: GOLD } }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> Second Opinion
        </Box>
        <Button onClick={() => void remove()} size="small" startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: "none", color: INK_MUTED, "&:hover": { color: "#991B1B" } }}>
          Delete this result
        </Button>
      </Stack>

      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", mt: 2 }}>
        Second Opinion
      </Typography>
      <Typography sx={{ fontSize: "0.86rem", color: INK_MUTED, mt: 0.5 }}>
        {run.fileName} · {new Date(run.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </Typography>

      {run.status !== "done" || !r ? (
        <Box sx={{ mt: 3, p: 3, bgcolor: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 700, color: INK }}>{run.status === "failed" ? "We could not read this document." : "Still reading."}</Typography>
          <Typography sx={{ fontSize: "0.9rem", color: INK_SOFT, mt: 0.5 }}>{run.error ?? "Try again in a moment."}</Typography>
        </Box>
      ) : (
        <>
          {/* 1 · What this is */}
          <Block n="1" title="What this is">
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.35rem", md: "1.6rem" }, color: INK, lineHeight: 1.25 }}>{r.what_this_is}</Typography>
          </Block>

          {/* 2 · What is actually in it */}
          <Block n="2" title="What is actually in it" sub="Facts from your own document. Nothing here is our opinion.">
            {r.whats_in_it.length === 0 ? (
              <Typography sx={{ color: INK_SOFT, fontSize: "0.95rem" }}>The document did not give us facts to list.</Typography>
            ) : (
              <Stack spacing={1.75}>
                {r.whats_in_it.map((f, i) => (
                  <Box key={i}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>{f.label}</Typography>
                    <Typography sx={{ fontSize: "0.98rem", color: INK, lineHeight: 1.55, mt: 0.25 }}>{f.fact}</Typography>
                    {f.quote && (
                      <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, pl: 1.5, borderLeft: `3px solid ${LINE}`, color: INK_SOFT }}>
                        <FormatQuoteRoundedIcon sx={{ fontSize: 16, color: INK_MUTED, mt: "2px" }} />
                        <Typography sx={{ fontSize: "0.86rem", fontStyle: "italic", lineHeight: 1.5 }}>{f.quote}</Typography>
                      </Stack>
                    )}
                  </Box>
                ))}
                {r.truncated && (
                  <Typography sx={{ fontSize: "0.82rem", color: INK_MUTED }}>This document was longer than we can read in one go. The facts above come from the first part of it.</Typography>
                )}
              </Stack>
            )}
          </Block>

          {/* 3 · What we notice */}
          <Block n="3" title="What we notice" sub="Only where an expert in our library, or a published source we can name, has something to say. Each point says which.">
            {r.library_silent || r.what_we_notice.length === 0 ? (
              <Typography sx={{ color: INK_SOFT, fontSize: "0.95rem" }}>Our expert library does not cover this kind of agreement yet.</Typography>
            ) : (
              <Stack spacing={1.75}>
                {r.what_we_notice.map((n, i) => (
                  <Box key={i}>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: n.kind === "published" ? INK_MUTED : GOLD, mb: 0.35 }}>
                      {n.kind === "published" ? "From a published source" : "From our library"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.86rem", fontWeight: 700, color: INK }}>
                      {n.expert}
                      <Box component="span" sx={{ color: INK_MUTED, fontWeight: 500 }}> · {n.source}</Box>
                      {n.url && (
                        <Box component="a" href={n.url} target="_blank" rel="noopener noreferrer" sx={{ ml: 1, color: GOLD, fontWeight: 600, fontSize: "0.8rem" }}>
                          Open source
                        </Box>
                      )}
                    </Typography>
                    <Typography sx={{ fontSize: "0.96rem", color: INK, lineHeight: 1.55, mt: 0.25 }}>{n.point}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Block>

          {/* 4 · Our recommendation */}
          <Box sx={{ mt: 2, p: { xs: 2.5, md: 3.25 }, bgcolor: NAVY, color: "#FFFFFF", borderRadius: 3 }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#e9c979" }}>4 · Our recommendation</Typography>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.15rem", md: "1.3rem" }, lineHeight: 1.45, mt: 1.25, color: "#FFFFFF !important" }}>{r.recommendation}</Typography>

          </Box>

          {/* The route out: an option, never a gate */}
          <Box sx={{ mt: 3, p: { xs: 2.25, md: 3 }, bgcolor: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 700, color: INK }}>Want a person on it?</Typography>
            <Typography sx={{ fontSize: "0.88rem", color: INK_SOFT, mt: 0.25 }}>Your answer above is complete on its own. These are here if you want more.</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2 }}>
              {asked ? (
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#2C7A52" }}>Sent to the team. They will come back to you in writing, and it will show in your Inbox.</Typography>
              ) : (
                <Button onClick={() => setAskOpen((v) => !v)} startIcon={<SupportAgentOutlinedIcon />} sx={{ textTransform: "none", fontWeight: 800, borderRadius: 999, px: 2.5, "&&": { bgcolor: GOLD_BRIGHT, color: INK }, "&&:hover": { bgcolor: "#E5BA63" } }}>
                  Ask the team about this
                </Button>
              )}
            </Stack>
            {askOpen && !asked && (
              <Box sx={{ mt: 2 }}>
                <TextField value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything you want the team to know (optional)" multiline minRows={2} fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FFFFFF", fontSize: "0.92rem" } }} />
                <Button onClick={() => void ask()} disabled={asking} sx={{ mt: 1.25, textTransform: "none", fontWeight: 800, borderRadius: 999, px: 3, py: 1.1, "&&": { bgcolor: GOLD_BRIGHT, color: INK }, "&&:hover": { bgcolor: "#E5BA63" }, "&&.Mui-disabled": { bgcolor: "rgba(217,168,75,0.35)", color: "rgba(10,26,47,0.6)" } }}>
                  {asking ? "Sending" : "Send to the team"}
                </Button>
                <Typography sx={{ fontSize: "0.78rem", color: INK_MUTED, mt: 1 }}>This result goes to the Expert Hotline as a normal question.</Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

function Block({ n, title, sub, children }: { n: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mt: 2, p: { xs: 2.5, md: 3.25 }, bgcolor: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 3 }}>
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD }}>{n} · {title}</Typography>
      {sub && <Typography sx={{ fontSize: "0.8rem", color: INK_MUTED, mt: 0.35 }}>{sub}</Typography>}
      <Box sx={{ mt: 1.5 }}>{children}</Box>
    </Box>
  );
}
