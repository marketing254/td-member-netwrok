"use client";

import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";

/**
 * ProfileEditDialog — reusable identity-edit modal used by all three
 * portals (member, expert, partner) via their sidebar identity card.
 *
 * Accepts:
 *   endpoint   PATCH URL (multipart/form-data) the role's API exposes
 *   nameField  which field the role's table uses for the display name
 *              ("first_name + last_name" for members, "display_name" for
 *               experts/partners)
 *   initial    current avatar + name values for the inputs
 *
 * On submit:
 *   - Reads file + name into FormData and PATCHes the endpoint.
 *   - Calls onSaved with the local preview avatar URL so the parent can
 *     update its UI optimistically without a full reload.
 */

export type ProfileEditInitial = {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export default function ProfileEditDialog({
  open,
  endpoint,
  nameField,
  initial,
  onClose,
  onSaved,
  accentColor = "#A07823",
}: {
  open: boolean;
  endpoint: string;
  nameField: "memberName" | "displayName";
  initial: ProfileEditInitial;
  onClose: () => void;
  onSaved?: (next: { avatarPreview: string | null; firstName?: string; lastName?: string; displayName?: string }) => void;
  accentColor?: string;
}) {
  const [firstName, setFirstName] = useState(initial.firstName ?? "");
  const [lastName, setLastName] = useState(initial.lastName ?? "");
  const [displayName, setDisplayName] = useState(initial.displayName ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial.avatarUrl ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setFirstName(initial.firstName ?? "");
      setLastName(initial.lastName ?? "");
      setDisplayName(initial.displayName ?? "");
      setFile(null);
      setPreviewUrl(initial.avatarUrl ?? null);
      setError(null);
    }
  }, [open, initial.avatarUrl, initial.firstName, initial.lastName, initial.displayName]);

  // Create a local object URL for preview when the user picks a file.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Pick an image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      if (file) form.append("avatar", file);
      if (nameField === "memberName") {
        form.append("first_name", firstName.trim());
        form.append("last_name", lastName.trim());
      } else {
        form.append("display_name", displayName.trim());
      }
      const res = await fetch(endpoint, { method: "PATCH", body: form });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Couldn't save changes. Please try again.");
        return;
      }
      onSaved?.({
        avatarPreview: previewUrl,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName.trim(),
      });
      onClose();
    } catch {
      setError("Couldn't save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            border: "1px solid rgba(14,42,61,0.08)",
            boxShadow: "0 32px 64px -32px rgba(14,42,61,0.4)",
          },
        },
      }}
    >
      <Box sx={{ position: "relative", p: { xs: 3, sm: 3.5 } }}>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", top: 10, right: 10, color: "#7A8590" }}
          disabled={submitting}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            fontWeight: 500,
            color: "#0A1A2F",
            letterSpacing: "-0.01em",
            mb: 0.5,
          }}
        >
          Edit profile
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "#3B4A55", mb: 2.5 }}>
          Update your photo and how your name appears across the portal.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2.5 }}>
          <Avatar
            src={previewUrl ?? undefined}
            sx={{
              width: 72,
              height: 72,
              bgcolor: "#FBF8F1",
              color: accentColor,
              border: `1px solid ${accentColor}`,
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              fontWeight: 700,
            }}
          >
            {initials(initial.firstName, initial.lastName, initial.displayName)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Button
              onClick={() => fileInputRef.current?.click()}
              startIcon={<PhotoCameraRoundedIcon sx={{ fontSize: 16 }} />}
              variant="outlined"
              size="small"
              disabled={submitting}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 999,
                borderColor: "rgba(14,42,61,0.18)",
                color: "#0A1A2F",
                "&:hover": { bgcolor: "rgba(14,42,61,0.04)", borderColor: accentColor },
              }}
            >
              Choose photo
            </Button>
            <Typography sx={{ fontSize: "0.72rem", color: "#7A8590", mt: 0.6 }}>
              JPG / PNG · max 5 MB
            </Typography>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/*"
              onChange={onPickFile}
            />
          </Box>
        </Stack>

        {nameField === "memberName" ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mb: 2 }}>
            <TextField
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              size="small"
              fullWidth
              disabled={submitting}
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              size="small"
              fullWidth
              disabled={submitting}
            />
          </Stack>
        ) : (
          <TextField
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            size="small"
            fullWidth
            disabled={submitting}
            sx={{ mb: 2 }}
          />
        )}

        {error && (
          <Typography sx={{ fontSize: "0.78rem", color: "#8C1D1D", mb: 1.5 }}>
            {error}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "#5C6770",
              "&:hover": { bgcolor: "rgba(14,42,61,0.04)" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            variant="contained"
            disableElevation
            endIcon={submitting ? <CircularProgress size={14} sx={{ color: "#FFFFFF" }} /> : null}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              borderRadius: 1,
              px: 2,
              bgcolor: "#0A1A2F !important",
              backgroundImage: "none !important",
              color: "#FFFFFF !important",
              "&:hover": { bgcolor: "#0F2540 !important", color: "#FFFFFF !important" },
              "&.Mui-disabled": {
                bgcolor: "#3A3A3A !important",
                color: "rgba(255,255,255,0.55) !important",
              },
            }}
          >
            {submitting ? "Saving…" : "Save"}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
}

function initials(first?: string, last?: string, display?: string): string {
  if (display) {
    const parts = display.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  const a = (first ?? "").trim().charAt(0);
  const b = (last ?? "").trim().charAt(0);
  return (a + b).toUpperCase() || "··";
}
