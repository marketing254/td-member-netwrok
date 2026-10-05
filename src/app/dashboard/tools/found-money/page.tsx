"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FindingsReport, { type ReportFinding } from "@/components/audit/FindingsReport";

type Audit = {
  id: string;
  status: string;
  practiceName: string | null;
  headline: number | null;
  createdAt: string;
  releasedAt: string | null;
  findings: ReportFinding[];
  alreadyFine: string[];
  limits: string[];
};

const INK = "#1A2230";
const MUTED = "#8A929E";
const LINE = "#E7E3DA";

/**
 * Found Money inside the portal. Step 5 and 6 of Lester's walkthrough:
 * the member's free upload has moved into their account; until a person
 * releases it they see the headline and the first finding, then everything.
 */
export default function FoundMoneyMemberPage() {
  const [audits, setAudits] = useState<Audit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/member/tools/found-money", { cache: "no-store" })
      .then(async (r) => {
        const body = (await r.json().catch(() => ({}))) as { audits?: Audit[]; error?: string };
        if (!r.ok) throw new Error(body.error ?? `Failed (${r.status})`);
        return body.audits ?? [];
      })
      .then((a) => alive && setAudits(a))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Could not load."));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Stack spacing={3}>
      <Link href="/dashboard/tools" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 700, color: "#0E2A3D", textDecoration: "none" }}>
        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> Tools
      </Link>
      <Box>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A07823" }}>Audits</Typography>
        <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: { xs: "1.6rem", md: "2rem" }, color: INK, mt: 0.5 }}>Found Money Audit</Typography>
        <Typography sx={{ color: "#4A5566", mt: 0.75, maxWidth: 640 }}>
          Card fees, supply prices and subscriptions, read from your own documents. A person on our team checks every line before the full report is released.
        </Typography>
      </Box>

      {audits === null && !error && (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress size={22} sx={{ color: "#A07823" }} />
        </Stack>
      )}
      {error && <Typography sx={{ color: "#8A1C1C" }}>{error}</Typography>}

      {audits && audits.length === 0 && (
        <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderRadius: 2.5, p: 3 }}>
          <Typography sx={{ fontWeight: 700, color: INK }}>No audit yet.</Typography>
          <Typography sx={{ color: "#4A5566", mt: 0.5 }}>Upload three documents and see your number in minutes. Use the same email as your membership so the report lands here.</Typography>
          <Button component={Link} href="/audit/found-money" variant="contained" disableElevation sx={{ mt: 2, borderRadius: 999, textTransform: "none", fontWeight: 700, bgcolor: "#0E2A3D" }}>
            Start my audit
          </Button>
        </Box>
      )}

      {audits?.map((a) => (
        <Box key={a.id}>
          {a.status !== "released" && (
            <Box sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: "#FBF3E1", border: "1px solid rgba(160,120,35,0.35)", color: INK, fontSize: "0.92rem" }}>
              <strong>A person is checking this report.</strong> Your estimate is below. The full report, with every fix and the words to use, is released once every line has been checked against your documents, usually within a day. We will email you.
            </Box>
          )}
          <FindingsReport practiceName={a.practiceName} headline={a.headline ?? 0} findings={a.findings} alreadyFine={a.alreadyFine} limits={a.limits} checked={a.status === "released"} />
          <Typography sx={{ mt: 1.5, fontSize: "0.78rem", color: MUTED }}>
            Uploaded {new Date(a.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            {a.releasedAt ? ` · checked and released ${new Date(a.releasedAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : ""}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
