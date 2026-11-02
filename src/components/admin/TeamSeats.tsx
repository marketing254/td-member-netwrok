"use client";
import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type Seat = { id: string; email: string; name: string | null; created_at: string };

/**
 * Team seats block for the admin profile dialogs (migration 0079). Extra
 * people who sign in with their own email and land in this company's or
 * expert's portal. Only the team sees or edits this list.
 */
export default function TeamSeats({ vendorId, expertId }: { vendorId?: string | null; expertId?: string | null }) {
  const [seats, setSeats] = useState<Seat[] | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const key = vendorId ? `vendor_id=${vendorId}` : expertId ? `expert_id=${expertId}` : null;

  const load = useCallback(async () => {
    if (!key) return;
    const res = await fetch(`/api/admin/seats?${key}`, { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as { seats?: Seat[] };
    setSeats(body.seats ?? []);
  }, [key]);

  useEffect(() => {
    setSeats(null);
    setMsg(null);
    void load();
  }, [load]);

  if (!key) return null;

  const add = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor_id: vendorId ?? undefined, expert_id: expertId ?? undefined, email, name }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; authCreated?: boolean };
      if (!res.ok) throw new Error(body.error ?? "Could not add the seat.");
      setEmail("");
      setName("");
      setMsg({ tone: "success", text: `Seat added. They sign in with ${email.trim().toLowerCase()} and the usual 6-digit code.` });
      await load();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Could not add the seat." });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/seats", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error("Could not remove the seat.");
      await load();
    } catch (e) {
      setMsg({ tone: "error", text: e instanceof Error ? e.message : "Could not remove the seat." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ borderTop: "1px solid #E6DDCF", pt: 2, mt: 1 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Team seats</Typography>
      <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 1 }}>
        Extra people who sign in with their own email and work in this portal. They cannot see billing, the agreement or the card. Only the team can add or remove them.
      </Typography>
      {seats === null ? (
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>Loading…</Typography>
      ) : seats.length === 0 ? (
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>No seats yet.</Typography>
      ) : (
        <Stack spacing={0.5} sx={{ mb: 1 }}>
          {seats.map((s) => (
            <Stack key={s.id} direction="row" spacing={1} sx={{ alignItems: "center", bgcolor: "#FBF8F1", borderRadius: 1, px: 1.25, py: 0.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.84rem", fontWeight: 600 }}>{s.name || s.email}</Typography>
                {s.name && <Typography sx={{ fontSize: "0.76rem", color: "text.secondary" }}>{s.email}</Typography>}
              </Box>
              <IconButton size="small" aria-label={`Remove ${s.email}`} disabled={busy} onClick={() => void remove(s.id)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} size="small" fullWidth />
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth />
        <Button variant="outlined" size="small" disabled={busy || !email.includes("@")} onClick={() => void add()} sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}>
          Add seat
        </Button>
      </Stack>
      {msg && <Alert severity={msg.tone} sx={{ mt: 1, fontSize: "0.8rem" }}>{msg.text}</Alert>}
    </Box>
  );
}
