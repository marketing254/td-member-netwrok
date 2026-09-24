"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Button, Checkbox, CircularProgress, FormControlLabel, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { UPLOAD_OWNERSHIP_LINE, UPLOAD_POOL_LINE } from "@/lib/tools/secondOpinion/prompt";

const INK = "#1A2230";
const INK_SOFT = "#4A5566";
const INK_MUTED = "#8A929E";
const GOLD = "#A07823";
const GOLD_BRIGHT = "#D9A84B";
const LINE = "#E7E3DA";
const PAPER = "#FBFAF7";

type RunRow = { id: string; status: "processing" | "done" | "failed"; fileName: string; whatThisIs: string | null; error: string | null; createdAt: string };

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp";
const MAX_MB = 15;

/**
 * /dashboard/tools/second-opinion
 *
 * The front of the reading tool. Two doors per the 22 September brief:
 * "Check something before I sign it" (Second Opinion, live) and "Check
 * what I already pay" (Found Money, next). One upload, the two fixed
 * lines under it, and the member's past results.
 */
export default function SecondOpinionPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pool, setPool] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<RunRow[] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/member/tools/second-opinion", { cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; runs?: RunRow[] };
      if (res.ok && body.ok) setRuns(body.runs ?? []);
      else setRuns([]);
    } catch {
      setRuns([]);
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const pick = (f: File | null) => {
    setError(null);
    if (!f) return setFile(null);
    if (f.size > MAX_MB * 1024 * 1024) return setError(`Files must be under ${MAX_MB}MB.`);
    setFile(f);
  };

  const submit = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("document", file);
      fd.set("share_to_pool", pool ? "1" : "0");
      const res = await fetch("/api/member/tools/second-opinion", { method: "POST", body: fd });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? "That did not work. Please try again.");
        setBusy(false);
        void load();
        return;
      }
      router.push(`/dashboard/tools/second-opinion/${body.id}`);
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this result and the uploaded document? This cannot be undone.")) return;
    await fetch(`/api/member/tools/second-opinion/${id}`, { method: "DELETE" });
    void load();
  };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2.5, md: 4 }, px: { xs: 1.5, md: 0 } }}>
      <Box component={Link} href="/dashboard/tools" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, textDecoration: "none", color: INK_MUTED, fontSize: "0.85rem", fontWeight: 600, "&:hover": { color: GOLD } }}>
        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> All tools
      </Box>
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", mt: 2 }}>
        Reading tool
      </Typography>
      <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "1.8rem", md: "2.15rem" }, fontWeight: 500, color: INK, lineHeight: 1.1, letterSpacing: "-0.02em", mt: 0.5 }}>
        Second Opinion
      </Typography>
      <Typography sx={{ color: INK_SOFT, fontSize: "0.95rem", mt: 0.75, maxWidth: 600, lineHeight: 1.55 }}>
        A clear second opinion before you sign, in minutes. Facts from your own document first, then what our experts notice, then what we would do.
      </Typography>

      {/* The two doors */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 3.5 }}>
        <Door icon={<GavelOutlinedIcon sx={{ fontSize: 22 }} />} title="Check something before I sign it" sub="A quote, proposal, contract or renewal. One file." active />
        <Door icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />} title="Check what I already pay" sub="Your bills, grouped, with the ones worth questioning." soon />
      </Box>

      {/* Upload */}
      <Box sx={{ mt: 3, p: { xs: 2.5, md: 3.5 }, bgcolor: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 3 }}>
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0] ?? null); }}
          onClick={() => inputRef.current?.click()}
          sx={{
            border: `2px dashed ${dragOver ? GOLD_BRIGHT : LINE}`,
            bgcolor: dragOver ? "rgba(217,168,75,0.06)" : PAPER,
            borderRadius: 2.5,
            p: { xs: 3, md: 4 },
            textAlign: "center",
            cursor: "pointer",
            transition: "all 150ms",
          }}
        >
          <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          <UploadFileOutlinedIcon sx={{ fontSize: 34, color: GOLD }} />
          {file ? (
            <>
              <Typography sx={{ fontWeight: 700, color: INK, mt: 1 }}>{file.name}</Typography>
              <Typography sx={{ fontSize: "0.82rem", color: INK_MUTED, mt: 0.25 }}>{(file.size / 1024 / 1024).toFixed(1)} MB · click to choose a different file</Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 700, color: INK, mt: 1 }}>Drop the document here, or click to choose</Typography>
              <Typography sx={{ fontSize: "0.82rem", color: INK_MUTED, mt: 0.25 }}>PDF, or a PNG, JPG or WebP screenshot. Up to {MAX_MB}MB.</Typography>
            </>
          )}
        </Box>

        <Stack direction="row" spacing={0.75} sx={{ alignItems: "flex-start", mt: 2, color: INK_SOFT }}>
          <LockRoundedIcon sx={{ fontSize: 15, mt: "2px", color: INK_MUTED }} />
          <Typography sx={{ fontSize: "0.84rem", lineHeight: 1.5 }}>{UPLOAD_OWNERSHIP_LINE}</Typography>
        </Stack>
        <FormControlLabel
          sx={{ alignItems: "flex-start", m: 0, mt: 1.25 }}
          control={<Checkbox checked={pool} onChange={(e) => setPool(e.target.checked)} size="small" sx={{ color: "#A8A29E", "&.Mui-checked": { color: GOLD }, p: 0.5, mr: 0.5 }} />}
          label={<Typography sx={{ fontSize: "0.84rem", color: INK_SOFT, lineHeight: 1.5 }}>{UPLOAD_POOL_LINE}</Typography>}
        />

        {error && (
          <Typography role="alert" sx={{ mt: 2, color: "#991B1B", fontWeight: 600, fontSize: "0.84rem", bgcolor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 1.5, px: 1.25, py: 0.85 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 2.5 }}>
        <Button
          onClick={() => void submit()}
          disabled={!file || busy}
          endIcon={busy ? <CircularProgress size={15} sx={{ color: INK }} /> : undefined}
          sx={{ py: 1.35, px: 3.5, fontSize: "0.95rem", fontWeight: 800, textTransform: "none", borderRadius: 999, bgcolor: GOLD_BRIGHT, color: INK, "&:hover": { bgcolor: "#E5BA63" }, "&.Mui-disabled": { bgcolor: "rgba(217,168,75,0.35)", color: "rgba(10,26,47,0.5)" } }}
        >
          {busy ? "Reading your document" : "Get a second opinion"}
        </Button>
        {busy && (
          <Typography sx={{ fontSize: "0.8rem", color: INK_MUTED, mt: 1 }}>Usually under a minute. Please keep this page open.</Typography>
        )}
        </Box>
      </Box>

      {/* History */}
      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.2em", color: INK_MUTED, textTransform: "uppercase", mb: 1.25 }}>
          Your past results
        </Typography>
        {runs === null ? (
          <CircularProgress size={18} sx={{ color: GOLD }} />
        ) : runs.length === 0 ? (
          <Typography sx={{ fontSize: "0.9rem", color: INK_MUTED }}>Nothing yet. Your results will be listed here so you can reopen them.</Typography>
        ) : (
          <Stack spacing={1}>
            {runs.map((r) => (
              <Stack key={r.id} direction="row" spacing={1.5} sx={{ alignItems: "center", p: 1.75, bgcolor: "#FFFFFF", border: `1px solid ${LINE}`, borderRadius: 2 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {r.status === "done" ? (
                    <Box component={Link} href={`/dashboard/tools/second-opinion/${r.id}`} sx={{ fontWeight: 700, color: INK, textDecoration: "none", "&:hover": { color: GOLD } }}>
                      {r.whatThisIs ?? r.fileName}
                    </Box>
                  ) : (
                    <Typography component="span" sx={{ fontWeight: 700, color: INK }}>{r.fileName}</Typography>
                  )}
                  <Typography sx={{ fontSize: "0.8rem", color: r.status === "failed" ? "#991B1B" : INK_MUTED, mt: 0.25 }} noWrap>
                    {r.status === "failed" ? r.error ?? "Could not read this document." : `${r.fileName} · ${new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  </Typography>
                </Box>
                <Button onClick={() => void remove(r.id)} size="small" startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: "none", color: INK_MUTED, "&:hover": { color: "#991B1B" } }}>
                  Delete
                </Button>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function Door({ icon, title, sub, active, soon }: { icon: React.ReactNode; title: string; sub: string; active?: boolean; soon?: boolean }) {
  return (
    <Box sx={{ p: 2.25, borderRadius: 2.5, bgcolor: active ? "#FFFFFF" : PAPER, border: `2px solid ${active ? GOLD_BRIGHT : LINE}`, opacity: soon ? 0.7 : 1 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "rgba(217,168,75,0.14)", color: GOLD, display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 700, color: INK, fontSize: "0.98rem", lineHeight: 1.25 }}>{title}</Typography>
            {soon && <Box component="span" sx={{ fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", px: 0.9, py: 0.3, borderRadius: 999, bgcolor: "rgba(217,168,75,0.16)", color: GOLD }}>Soon</Box>}
          </Stack>
          <Typography sx={{ fontSize: "0.82rem", color: INK_SOFT, mt: 0.25 }}>{sub}</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
