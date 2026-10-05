"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import Header from "@/components/sections/Header";
import FindingsReport, { type ReportFinding } from "@/components/audit/FindingsReport";

type Estimate = {
  status: string;
  practiceName: string | null;
  headline: number | null;
  first: { title: string; why: string; action: string; annual_saving: number; confidence: "high" | "medium" | "low" } | null;
  locked: { title: string; annual_saving: number; confidence: "high" | "medium" | "low" }[];
  lockedTotal: number;
  alreadyFine: string[];
  limits: string[];
};

const CREAM = "#F7F5F0";
const MUTED = "#5C6770";

/** The free estimate: headline + first fix, the rest locked. Step 4 of Lester's walkthrough. */
export default function FoundMoneyEstimate({ token }: { token: string }) {
  const [data, setData] = useState<Estimate | null | "missing">(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/audit/found-money/${token}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? ((await r.json()) as Estimate) : "missing"))
      .then((d) => alive && setData(d))
      .catch(() => alive && setData("missing"));
    return () => {
      alive = false;
    };
  }, [token]);

  const unlockHref = `/join/member?utm_source=audit&utm_campaign=found_money`;

  const remove = async () => {
    if (!window.confirm("Delete your documents and this estimate? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/audit/found-money/${token}`, { method: "DELETE" });
    window.location.href = "/audit/found-money";
  };

  const findings: ReportFinding[] =
    data && data !== "missing"
      ? [
          ...(data.first ? [{ ...data.first, script: null, locked: false }] : []),
          ...data.locked.map((x) => ({ title: x.title, why: null, action: null, script: null, annual_saving: x.annual_saving, confidence: x.confidence, locked: true })),
        ]
      : [];

  return (
    <Box sx={{ bgcolor: CREAM, minHeight: "100vh" }}>
      <Header />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {data === null && (
          <Stack sx={{ alignItems: "center", py: 8 }} spacing={1.5}>
            <CircularProgress size={24} sx={{ color: "#A07823" }} />
            <Typography sx={{ color: MUTED }}>Loading your estimate…</Typography>
          </Stack>
        )}
        {data === "missing" && (
          <Stack sx={{ alignItems: "center", py: 8, textAlign: "center" }} spacing={1.5}>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 600 }}>We couldn&apos;t find that estimate</Typography>
            <Typography sx={{ color: MUTED }}>The link may have been deleted. You can run a new one in a minute.</Typography>
            <Button component={Link} href="/audit/found-money" variant="contained" disableElevation sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}>Start a new audit</Button>
          </Stack>
        )}
        {data && data !== "missing" && (
          <>
            {data.status === "failed" ? (
              <Typography sx={{ color: MUTED }}>This audit could not be completed. Please start again with clearer documents.</Typography>
            ) : (
              <FindingsReport
                practiceName={data.practiceName}
                headline={data.headline ?? 0}
                findings={findings}
                alreadyFine={data.alreadyFine}
                limits={data.limits}
                checked={false}
                unlockHref={unlockHref}
                lockedTotal={data.lockedTotal}
              />
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4, justifyContent: "space-between", alignItems: { sm: "center" } }}>
              <Typography sx={{ fontSize: "0.82rem", color: MUTED }}>Already a member? Sign in and this report moves into your account.</Typography>
              <Button onClick={() => void remove()} disabled={deleting} size="small" sx={{ textTransform: "none", color: MUTED }}>
                Delete my documents
              </Button>
            </Stack>
          </>
        )}
      </Container>
    </Box>
  );
}
