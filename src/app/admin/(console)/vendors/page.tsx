"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { vendorCategories } from "@/lib/vendorData";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";

type VendorRow = {
  id: string;
  company_name: string;
  display_name: string;
  category: string | null;
  contact_name: string;
  contact_email: string;
  plan_id: string | null;
  status: "pending_review" | "approved" | "rejected" | "suspended" | "churned";
  verified: boolean;
  created_at: string;
};

type FilterKey = "all" | "pending_review" | "approved" | "suspended" | "rejected";
type ActionKey = "approve" | "reject" | "suspend" | "unsuspend";

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const params = useSearchParams();
  const initial = (params.get("filter") as FilterKey) || "all";
  const [filter, setFilter] = useState<FilterKey>(initial);
  const [rows, setRows] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vendors", { cache: "no-store" });
      const body = (await res.json()) as { rows?: VendorRow[]; error?: string };
      if (!res.ok || body.error) {
        setError(body.error ?? `Failed to load (${res.status})`);
        setRows([]);
        return;
      }
      setRows(body.rows ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (vendorId: string, action: ActionKey) => {
    setActingId(vendorId);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: vendorId, action }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || body.error) {
        setToast(body.error ?? `Action failed (${res.status})`);
        return;
      }
      const verb =
        action === "approve"
          ? "approved & verified"
          : action === "reject"
            ? "rejected"
            : action === "suspend"
              ? "suspended"
              : "reinstated";
      setToast(`Partner ${verb}.`);
      await load();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActingId(null);
    }
  };

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      pending_review: rows.filter((r) => r.status === "pending_review").length,
      approved: rows.filter((r) => r.status === "approved").length,
      suspended: rows.filter((r) => r.status === "suspended").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
    }),
    [rows],
  );

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
      >
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            PARTNERS
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
            All partners
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
            Approve new applications and manage active partners. Use{" "}
            <strong>Send founding invite</strong> to email a hand-picked partner or
            expert a private link with their personalized agreement — they accept
            and pay through it, no public form needed.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1OutlinedIcon />}
          onClick={() => setInviteOpen(true)}
          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Send founding invite
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={filter}
          onChange={(_, v) => setFilter(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": { backgroundColor: "secondary.main", height: 3, borderRadius: 999 },
          }}
        >
          {(["all", "pending_review", "approved", "suspended", "rejected"] as FilterKey[]).map((k) => (
            <Tab
              key={k}
              value={k}
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ textTransform: "capitalize" }}>{labelForFilter(k)}</Box>
                  <Chip
                    size="small"
                    label={counts[k]}
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      bgcolor: filter === k ? "rgba(217,168,75,0.18)" : "grey.100",
                      color: filter === k ? "#A07823" : "text.secondary",
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "common.white",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "1.8fr 1.2fr 0.9fr 0.9fr 0.8fr 1.2fr",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 1.5,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Cell head>Partner</Cell>
          <Cell head>Category</Cell>
          <Cell head>Plan</Cell>
          <Cell head>Status</Cell>
          <Cell head>Verified</Cell>
          <Box />
        </Box>

        {loading ? (
          <Box sx={{ p: 6, display: "grid", placeItems: "center" }}>
            <CircularProgress size={24} sx={{ color: "#A07823" }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary" }}>No partners in this view.</Typography>
          </Box>
        ) : (
          filtered.map((v, i) => (
            <Box
              key={v.id}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr auto", md: "1.8fr 1.2fr 0.9fr 0.9fr 0.8fr 1.2fr" },
                alignItems: "center",
                gap: 2,
                px: { xs: 2.5, md: 3 },
                py: 2,
                borderBottom: i === filtered.length - 1 ? 0 : "1px solid",
                borderColor: "divider",
                "&:hover": { bgcolor: "grey.50" },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }} noWrap>
                  {v.company_name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                  {v.contact_name} · {v.contact_email}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ display: { xs: "flex", md: "none" }, mt: 0.75, flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                  <StatusChip status={v.status} />
                  <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                    {v.category ?? "—"}
                  </Typography>
                </Stack>
              </Box>
              <Cell>
                <Box sx={{ display: { xs: "none", md: "block" }, fontSize: "0.85rem" }} component="span">
                  {v.category ?? "—"}
                </Box>
              </Cell>
              <Cell>
                <Box sx={{ display: { xs: "none", md: "inline-block" } }}>
                  <Chip
                    label={planLabel(v.plan_id)}
                    size="small"
                    sx={{
                      bgcolor: "rgba(14,42,61,0.07)",
                      color: "primary.dark",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      height: 22,
                      textTransform: "capitalize",
                    }}
                  />
                </Box>
              </Cell>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <StatusChip status={v.status} />
              </Box>
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Chip
                  label={v.verified ? "Verified" : "—"}
                  size="small"
                  sx={{
                    bgcolor: v.verified ? "rgba(34,108,78,0.12)" : "rgba(14,42,61,0.06)",
                    color: v.verified ? "#1F5C40" : "text.secondary",
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    height: 22,
                  }}
                />
              </Box>
              <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 0.5, alignItems: "center" }}>
                {actingId === v.id ? (
                  <CircularProgress size={18} sx={{ color: "#A07823" }} />
                ) : (
                  <>
                    {v.status === "pending_review" && (
                      <>
                        <Tooltip title="Approve & verify">
                          <IconButton
                            size="small"
                            sx={{ color: "success.dark" }}
                            onClick={() => runAction(v.id, "approve")}
                          >
                            <CheckCircleOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            sx={{ color: "error.main" }}
                            onClick={() => runAction(v.id, "reject")}
                          >
                            <CancelOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {v.status === "approved" && (
                      <Tooltip title="Suspend">
                        <IconButton
                          size="small"
                          sx={{ color: "text.secondary" }}
                          onClick={() => runAction(v.id, "suspend")}
                        >
                          <PauseCircleOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {v.status === "suspended" && (
                      <Tooltip title="Reinstate">
                        <IconButton
                          size="small"
                          sx={{ color: "success.dark" }}
                          onClick={() => runAction(v.id, "unsuspend")}
                        >
                          <PlayCircleOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {v.status === "rejected" && (
                      <Tooltip title="Approve & verify">
                        <IconButton
                          size="small"
                          sx={{ color: "success.dark" }}
                          onClick={() => runAction(v.id, "approve")}
                        >
                          <CheckCircleOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          ))
        )}
      </Box>

      {filter === "pending_review" && counts.pending_review > 0 && (
        <Stack direction="row" spacing={1.5} sx={{ p: 2.5, borderRadius: "14px", bgcolor: "rgba(217,168,75,0.08)", border: "1px solid rgba(217,168,75,0.32)" }}>
          <Typography variant="body2" sx={{ flex: 1, color: "text.primary", fontSize: "0.92rem" }}>
            <strong>{counts.pending_review} pending application{counts.pending_review === 1 ? "" : "s"}.</strong> SLA: review within 1 business day. Approving sends a confirmation email and unlocks publishing in the partner portal.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={!!actingId}
            onClick={async () => {
              const pending = rows.filter((r) => r.status === "pending_review");
              for (const v of pending) {
                // eslint-disable-next-line no-await-in-loop
                await runAction(v.id, "approve");
              }
            }}
          >
            Bulk approve
          </Button>
        </Stack>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        message={toast ?? ""}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <InvitePartnerDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(name) => {
          setInviteOpen(false);
          setToast(`Founding invite link emailed to ${name}.`);
          void load();
        }}
        onError={(msg) => setError(msg)}
      />
    </Stack>
  );
}

function InvitePartnerDialog({
  open,
  onClose,
  onInvited,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  onInvited: (name: string) => void;
  onError: (msg: string) => void;
}) {
  const [role, setRole] = useState<"partner" | "expert" | "both">("partner");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signatureTitle, setSignatureTitle] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [memberOffer, setMemberOffer] = useState("");
  const [calendarLink, setCalendarLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const needsCompany = role === "partner" || role === "both";

  const reset = () => {
    setRole("partner");
    setCompanyName("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setSecondaryEmail("");
    setPhone("");
    setSecondaryPhone("");
    setSignatureName("");
    setSignatureTitle("");
    setCategory("");
    setWebsite("");
    setDescription("");
    setMemberOffer("");
    setCalendarLink("");
    setNotes("");
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    const contactName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!contactName || !email.trim()) {
      setFormError("Contact name and email are required.");
      return;
    }
    if (needsCompany && !companyName.trim()) {
      setFormError("Company name is required for partner / both invites.");
      return;
    }
    setSubmitting(true);
    try {
      // Fold the extra contact/signer detail into notes so nothing is
      // lost — the founding invite record keeps the core fields as
      // columns and the rest here for the team's reference.
      const extras = [
        website.trim() && `Website: ${website.trim()}`,
        category.trim() && `Category: ${category.trim()}`,
        description.trim() && `Does: ${description.trim()}`,
        secondaryEmail.trim() && `2nd email: ${secondaryEmail.trim()}`,
        secondaryPhone.trim() && `2nd phone: ${secondaryPhone.trim()}`,
        signatureName.trim() && `Signer: ${signatureName.trim()}${signatureTitle.trim() ? ` (${signatureTitle.trim()})` : ""}`,
        calendarLink.trim() && `Calendar: ${calendarLink.trim()}`,
        notes.trim(),
      ]
        .filter(Boolean)
        .join(" · ");

      const res = await fetch("/api/admin/founding-invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          full_name: contactName,
          email: email.trim(),
          company_name: companyName.trim() || undefined,
          member_offer: memberOffer.trim() || undefined,
          phone: phone.trim() || undefined,
          notes: extras || undefined,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || body.error) {
        setFormError(body.error ?? `Failed (${res.status}).`);
        return;
      }
      reset();
      onInvited(contactName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to invite partner.";
      setFormError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!submitting) {
          reset();
          onClose();
        }
      }}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Send founding invite</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "text.secondary", mb: 2, fontSize: "0.88rem" }}>
          Emails a private link to a hand-picked partner / expert. Their
          personalized agreement (name, company, offer) is generated and attached.
          They open the link, agree, and complete agree-and-pay — no public form,
          no login needed to accept.
        </Typography>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Grid container spacing={2}>
          {/* Role */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Invite as"
              value={role}
              onChange={(e) => setRole(e.target.value as "partner" | "expert" | "both")}
              fullWidth
              select
            >
              <MenuItem value="partner">Partner (company)</MenuItem>
              <MenuItem value="expert">Expert (individual)</MenuItem>
              <MenuItem value="both">Both — Expert + Partner (one fee covers both)</MenuItem>
            </TextField>
          </Grid>

          {/* 01 Company */}
          <Grid size={{ xs: 12 }}>
            <DialogSectionLabel>
              01 · Company{needsCompany ? "" : " (optional for expert-only)"}
            </DialogSectionLabel>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              fullWidth
              required={needsCompany}
              placeholder="Acme Dental Supply"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              fullWidth
              placeholder="https://acmedental.com"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
              select
            >
              <MenuItem value="" disabled>
                Choose a category
              </MenuItem>
              {vendorCategories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Booking / calendar link"
              value={calendarLink}
              onChange={(e) => setCalendarLink(e.target.value)}
              fullWidth
              placeholder="https://cal.com/acme/intro"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="What does your company do, in one sentence?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Exclusive member offer"
              value={memberOffer}
              onChange={(e) => setMemberOffer(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              placeholder="e.g. 15% off your first year, or a free consultation"
            />
          </Grid>

          {/* 02 Contact */}
          <Grid size={{ xs: 12 }}>
            <DialogSectionLabel>02 · Contact</DialogSectionLabel>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              placeholder="Taylor"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              required
              placeholder="Morgan"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Primary work email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              placeholder="taylor@acme.com"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Secondary email (optional)"
              type="email"
              value={secondaryEmail}
              onChange={(e) => setSecondaryEmail(e.target.value)}
              fullWidth
              placeholder="partnerships@acme.com"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Primary phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              placeholder="+1 (555) 010-1234"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Secondary phone (optional)"
              value={secondaryPhone}
              onChange={(e) => setSecondaryPhone(e.target.value)}
              fullWidth
              placeholder="+1 (555) 010-5678"
            />
          </Grid>

          {/* 03 Signer */}
          <Grid size={{ xs: 12 }}>
            <DialogSectionLabel>03 · Signs on behalf of the company</DialogSectionLabel>
          </Grid>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              label="Signer full name"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              fullWidth
              placeholder="Taylor Morgan"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              label="Signer title"
              value={signatureTitle}
              onChange={(e) => setSignatureTitle(e.target.value)}
              fullWidth
              placeholder="VP of Partnerships"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Internal notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={() => {
            if (!submitting) {
              reset();
              onClose();
            }
          }}
          disabled={submitting}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={15} sx={{ color: "inherit" }} /> : null}
          sx={{ textTransform: "none" }}
        >
          {submitting ? "Sending…" : "Send founding invite link"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function labelForFilter(k: FilterKey): string {
  if (k === "pending_review") return "Pending";
  if (k === "approved") return "Approved";
  if (k === "suspended") return "Suspended";
  if (k === "rejected") return "Rejected";
  return "All";
}

function planLabel(planId: string | null): string {
  if (planId === "founding") return "Founding";
  if (planId === "annual") return "Annual";
  return "Standard";
}

function Cell({ head, children }: { head?: boolean; children?: React.ReactNode }) {
  return (
    <Box
      sx={{
        fontSize: head ? "0.7rem" : "0.9rem",
        fontWeight: head ? 700 : 500,
        letterSpacing: head ? "0.06em" : 0,
        textTransform: head ? "uppercase" : "none",
        color: head ? "text.secondary" : "text.primary",
      }}
    >
      {children}
    </Box>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending_review: { bg: "rgba(217,168,75,0.16)", color: "#A07823", label: "Pending" },
    approved: { bg: "rgba(34,108,78,0.12)", color: "#1F5C40", label: "Approved" },
    suspended: { bg: "rgba(220,60,60,0.12)", color: "#8C1D1D", label: "Suspended" },
    rejected: { bg: "rgba(220,60,60,0.08)", color: "#8C1D1D", label: "Rejected" },
    churned: { bg: "rgba(14,42,61,0.06)", color: "text.secondary", label: "Churned" },
  };
  const s = map[status] ?? map.pending_review;
  return (
    <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, fontSize: "0.68rem", height: 22 }} />
  );
}

function DialogSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "text.secondary",
        mt: 0.5,
      }}
    >
      {children}
    </Typography>
  );
}
