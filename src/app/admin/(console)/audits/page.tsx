"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, Stack, TextField, Typography } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FindingsReport from "@/components/audit/FindingsReport";
import type { Findings, Facts } from "@/lib/tools/foundMoney/audit";

/*
 * Admin: Found Money audits. The team's screen to check the report against
 * the documents and release it (Lester, step 6). Documents open in a new
 * tab from signed links; findings are edited in place; Release sends the
 * member their email and shows them the full report.
 */

type Row = {
  id: string;
  email: string;
  practice_name: string | null;
  status: string;
  headline_total: number | null;
  member_id: string | null;
  created_at: string;
  unlocked_at: string | null;
  released_at: string | null;
  error: string | null;
  fileCount: number;
};
type Counts = { membersViaAudit: number; total: number; estimated: number; toReview: number; released: number; failed: number };
type Detail = Row & {
  files: { slot: string; name: string; path: string; mime: string; size: number; url: string | null }[];
  facts: Facts | null;
  findings: Findings | null;
  released_findings: Findings | null;
};

const STATUS_LABEL: Record<string, string> = { processing: "Processing", estimated: "Free estimate", failed: "Failed", unlocked: "Joined · to review", released: "Released", deleted: "Deleted" };

export default function AdminAuditsPage() {
  return (
    <Suspense fallback={null}>
      <AdminAuditsInner />
    </Suspense>
  );
}

function AdminAuditsInner() {
  const params = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unlocked" | "estimated" | "released" | "failed">("all");
  const [openId, setOpenId] = useState<string | null>(params.get("open"));
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audits", { cache: "no-store" });
      const body = (await res.json()) as { rows?: Row[]; counts?: Counts; error?: string };
      if (!res.ok || body.error) throw new Error(body.error ?? `Failed (${res.status})`);
      setRows(body.rows ?? []);
      setCounts(body.counts ?? null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const shown = rows.filter((r) => filter === "all" || r.status === filter);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>GROWTH · AUDITS</Typography>
        <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>Found Money audits</Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 760 }}>
          Every free upload, with its estimate. When someone joins, their audit attaches to their member account and lands in &ldquo;Joined · to review&rdquo;. Open it, check each finding against the documents, edit or delete, then Release. Releasing emails the member and shows them the full report.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {counts && (
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1.5 }}>
          <Stat label="Uploads" value={counts.total} />
          <Stat label="Joined · to review" value={counts.toReview} tone="warning" />
          <Stat label="Released" value={counts.released} tone="success" />
          <Stat label="Free estimates" value={counts.estimated} />
          <Stat label="Members via audit" value={counts.membersViaAudit} tone="success" />
          {counts.failed > 0 && <Stat label="Failed" value={counts.failed} tone="error" />}
        </Stack>
      )}

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1, alignItems: "center" }}>
        {(["all", "unlocked", "estimated", "released", "failed"] as const).map((k) => (
          <Chip key={k} label={k === "all" ? "All" : STATUS_LABEL[k]} onClick={() => setFilter(k)} color={filter === k ? "primary" : undefined} variant={filter === k ? "filled" : "outlined"} sx={{ fontWeight: 600 }} />
        ))}
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={() => void load()} startIcon={<RefreshOutlinedIcon />} sx={{ textTransform: "none" }}>Refresh</Button>
      </Stack>

      {loading ? (
        <Stack sx={{ alignItems: "center", py: 6 }}><CircularProgress size={22} /></Stack>
      ) : shown.length === 0 ? (
        <Typography sx={{ color: "text.secondary" }}>Nothing here yet.</Typography>
      ) : (
        <Stack spacing={1}>
          {shown.map((r) => (
            <Box key={r.id} onClick={() => setOpenId(r.id)} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 140px 150px 120px" }, gap: 1.5, alignItems: "center", p: 2, bgcolor: "common.white", border: "1px solid", borderColor: "divider", borderRadius: "14px", cursor: "pointer", "&:hover": { borderColor: "#A07823" } }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{r.practice_name || "(no practice name)"}</Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>{r.email}</Typography>
              </Box>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>{new Date(r.created_at).toLocaleString()} · {r.fileCount} file{r.fileCount === 1 ? "" : "s"}</Typography>
              <Typography sx={{ fontWeight: 700 }}>{r.headline_total != null ? `$${Math.round(r.headline_total).toLocaleString()} / yr` : "—"}</Typography>
              <Chip size="small" label={STATUS_LABEL[r.status] ?? r.status} color={r.status === "unlocked" ? "warning" : r.status === "released" ? "success" : r.status === "failed" ? "error" : "default"} sx={{ fontWeight: 600, justifySelf: "start" }} />
              <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{r.error ? `Error: ${r.error.slice(0, 40)}` : ""}</Typography>
            </Box>
          ))}
        </Stack>
      )}

      {openId && <ReviewDialog id={openId} onClose={() => setOpenId(null)} onChanged={(m) => { setToast(m); void load(); }} />}
      <Snackbar open={!!toast} autoHideDuration={3500} onClose={() => setToast(null)} message={toast ?? ""} />
    </Stack>
  );
}

function ReviewDialog({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: (msg: string) => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [draft, setDraft] = useState<Findings | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/audits/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const body = (await r.json()) as { audit?: Detail; error?: string };
        if (!r.ok || !body.audit) throw new Error(body.error ?? `Failed (${r.status})`);
        return body.audit;
      })
      .then((a) => {
        if (!alive) return;
        setD(a);
        setDraft(structuredClone(a.released_findings ?? a.findings ?? null));
      })
      .catch((e) => alive && setErr(e instanceof Error ? e.message : "Failed to load."));
    return () => {
      alive = false;
    };
  }, [id]);

  const update = (i: number, k: "title" | "why" | "action" | "script", v: string) =>
    setDraft((p) => (p ? { ...p, findings: p.findings.map((f, j) => (j === i ? { ...f, [k]: k === "script" ? v || null : v } : f)) } : p));
  const remove = (i: number) => setDraft((p) => (p ? { ...p, findings: p.findings.filter((_, j) => j !== i) } : p));

  const act = async (action: "save" | "release") => {
    if (!draft) return;
    if (action === "release" && !window.confirm("Release this report to the member? They will be emailed and see every finding.")) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/audits/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ findings: draft, action }) });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Failed (${res.status})`);
      onChanged(action === "release" ? "Released. The member has been emailed." : "Saved.");
      if (action === "release") onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  };

  const headline = draft ? Math.round(draft.findings.filter((f) => f.confidence !== "low").reduce((s, f) => s + Number(f.annual_saving || 0), 0)) : 0;

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {d ? (
          <>
            {d.practice_name || "(no practice name)"} <Typography component="span" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>· {d.email} · {STATUS_LABEL[d.status] ?? d.status}</Typography>
          </>
        ) : "Loading…"}
      </DialogTitle>
      <DialogContent dividers>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        {!d ? (
          <Stack sx={{ alignItems: "center", py: 4 }}><CircularProgress size={22} /></Stack>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.1fr) minmax(0, 0.9fr)" }, gap: 3, alignItems: "start" }}>
            {/* Left: documents + facts + editable findings */}
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "text.secondary", mb: 1 }}>Documents</Typography>
                <Stack spacing={0.75}>
                  {d.files.map((f) => (
                    <Stack key={f.path} direction="row" spacing={1} sx={{ alignItems: "center", fontSize: "0.88rem" }}>
                      <Chip size="small" label={f.slot.replace("_", " ")} />
                      <span>{f.name}</span>
                      {f.url && <IconButton size="small" component="a" href={f.url} target="_blank" rel="noopener noreferrer" title="Open the document"><OpenInNewRoundedIcon sx={{ fontSize: 16 }} /></IconButton>}
                    </Stack>
                  ))}
                  {d.files.length === 0 && <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>No files (deleted or failed before upload).</Typography>}
                </Stack>
              </Box>

              {d.facts && (
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "text.secondary", mb: 1 }}>Facts our code calculated</Typography>
                  <Box component="pre" sx={{ m: 0, p: 1.5, bgcolor: "#F7F5F0", borderRadius: 1.5, fontSize: "0.72rem", maxHeight: 220, overflow: "auto", whiteSpace: "pre-wrap" }}>
                    {JSON.stringify({ headline_total: d.facts.headline_total, card: d.facts.card, facts: d.facts.facts.map((f) => ({ id: f.id, label: f.label, annual_saving: f.annual_saving, confidence: f.confidence, source: f.source })) }, null, 1)}
                  </Box>
                  {d.error === "stage_c_discarded" && <Alert severity="warning" sx={{ mt: 1 }}>The AI&apos;s prose failed the number check and was discarded. These findings are generated from the facts alone; edit the wording before releasing.</Alert>}
                </Box>
              )}

              {draft && (
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "text.secondary", mb: 1 }}>Findings (edit or delete, then release)</Typography>
                  <Stack spacing={2}>
                    {draft.findings.map((f, i) => (
                      <Box key={f.fact_id + i} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: "12px" }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>${Math.round(f.annual_saving).toLocaleString()} / yr · {f.confidence} · {f.fact_id}</Typography>
                          <IconButton size="small" onClick={() => remove(i)} title="Delete this finding"><DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} /></IconButton>
                        </Stack>
                        <Stack spacing={1}>
                          <TextField label="Title" value={f.title} onChange={(e) => update(i, "title", e.target.value)} size="small" fullWidth />
                          <TextField label="Why (what we saw, and where)" value={f.why} onChange={(e) => update(i, "why", e.target.value)} size="small" fullWidth multiline minRows={2} />
                          <TextField label="What to do" value={f.action} onChange={(e) => update(i, "action", e.target.value)} size="small" fullWidth multiline minRows={2} />
                          <TextField label="What to say (script, optional)" value={f.script ?? ""} onChange={(e) => update(i, "script", e.target.value)} size="small" fullWidth multiline minRows={2} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                  <Typography sx={{ mt: 1.5, fontSize: "0.85rem", color: "text.secondary" }}>Headline after edits: <b>${headline.toLocaleString()}</b> a year (high and medium only).</Typography>
                </Box>
              )}
            </Stack>

            {/* Right: what the member will see */}
            <Box sx={{ position: { lg: "sticky" }, top: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "text.secondary", mb: 1 }}>Preview, as the member sees it</Typography>
              {draft ? (
                <FindingsReport practiceName={d.practice_name} headline={headline} findings={draft.findings.map((f) => ({ ...f, locked: false }))} alreadyFine={draft.already_fine} limits={draft.limits} checked />
              ) : (
                <Typography sx={{ color: "text.secondary" }}>No findings on this audit.</Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>Close</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={() => void act("save")} disabled={!draft || busy} variant="outlined" sx={{ textTransform: "none" }}>Save edits</Button>
        <Button onClick={() => void act("release")} disabled={!draft || busy || !d?.member_id} variant="contained" disableElevation sx={{ textTransform: "none", fontWeight: 700 }} title={!d?.member_id ? "Release once they have joined" : ""}>
          {d?.status === "released" ? "Release again" : "Release to member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warning" | "success" | "error" }) {
  const color = tone === "warning" ? "#9a5b00" : tone === "success" ? "#2C7A52" : tone === "error" ? "#b3261e" : "text.primary";
  return (
    <Box sx={{ px: 2.25, py: 1.5, borderRadius: "14px", border: "1px solid", borderColor: "divider", bgcolor: "common.white", minWidth: 150 }}>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, color }}>{value}</Typography>
      <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", mt: 0.25 }}>{label}</Typography>
    </Box>
  );
}
