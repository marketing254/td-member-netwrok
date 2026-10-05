"use client";

import { useState } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Header from "@/components/sections/Header";
import FindingsReport, { type ReportFinding } from "@/components/audit/FindingsReport";

/*
 * Local-only preview of the Found Money report in its three states, with
 * sample data. No database, no uploads, no emails. The page that mounts
 * this returns 404 in production.
 */

const SAMPLE_FINDINGS: Omit<ReportFinding, "locked">[] = [
  {
    title: "Three card-processor fees you can have removed",
    why: "Your statement charges a PCI non-compliance fee of $39.95, a statement fee of $9.95 and a $25 monthly minimum. All three are printed on your statement and all three are negotiable.",
    action: "Call your processor and ask for the PCI, statement and minimum fees to be removed. If they refuse, ask for a written reason and let us know.",
    script: "I'm reviewing our account. I'd like the PCI non-compliance fee, the statement fee and the monthly minimum removed from next month's statement. Can you confirm that today?",
    annual_saving: 899,
    confidence: "high",
  },
  {
    title: "Two scheduling tools charged every month",
    why: "Two charges for online scheduling software appear on your card statement in the same month: $129 and $89. Practices usually need one.",
    action: "Check which one the front desk actually uses and cancel the other after the notice period.",
    script: null,
    annual_saving: 1068,
    confidence: "medium",
  },
  {
    title: "Check whether you still use: streaming subscription, $15.99 a month",
    why: "A $15.99 monthly charge for a consumer streaming service appears on the business card. It may be intended, so we have not counted it.",
    action: "Check who uses it. If nobody does, cancel it after the notice period.",
    script: null,
    annual_saving: 192,
    confidence: "low",
  },
];

const ALREADY_FINE = ["No other avoidable card fees appeared on your statement.", "No other repeat subscription charges stood out on the card statement we read."];
const LIMITS = ["Card processing: your effective rate reads as 2.41%. We have not compared it to a benchmark yet; that comparison is added once a sourced fair rate is confirmed.", "Supplies: 14 item lines read. Price comparison against other members' prices is added as the member price list grows; none is claimed here."];

type Mode = "estimate" | "pending" | "released";

const MODES: { key: Mode; label: string; sub: string }[] = [
  { key: "estimate", label: "1. Free estimate", sub: "Visitor, not a member. First fix open, rest locked." },
  { key: "pending", label: "2. Member, awaiting check", sub: "Joined. Same report in the portal, waiting on a person." },
  { key: "released", label: "3. Released report", sub: "Checked by the team. Every fix open." },
];

const INK = "#0A1A2F";
const MUTED = "#5C6770";

export default function FoundMoneyPreview() {
  const [mode, setMode] = useState<Mode>("released");
  const findings: ReportFinding[] = SAMPLE_FINDINGS.map((f, i) => ({ ...f, locked: mode === "estimate" && i > 0 }));
  const headline = SAMPLE_FINDINGS.filter((f) => f.confidence !== "low").reduce((s, f) => s + f.annual_saving, 0);
  const lockedTotal = findings.filter((f) => f.locked && f.confidence !== "low").reduce((s, f) => s + f.annual_saving, 0);

  return (
    <Box sx={{ bgcolor: "#F7F5F0", minHeight: "100vh", color: INK }}>
      <Header />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 3, p: 2, borderRadius: "14px", bgcolor: "#FFF4D6", border: "1px solid rgba(160,120,35,0.35)" }}>
          <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#A07823" }}>Local preview · sample data</Typography>
          <Typography sx={{ fontSize: "0.9rem", color: INK, mt: 0.5 }}>Nothing here is saved or sent. This page does not exist in production.</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1.5 }}>
            {MODES.map((m) => (
              <Button key={m.key} onClick={() => setMode(m.key)} variant={mode === m.key ? "contained" : "outlined"} disableElevation sx={{ textTransform: "none", borderRadius: "999px", fontWeight: 700, fontSize: "0.85rem", bgcolor: mode === m.key ? "#0E2A3D" : "transparent", color: mode === m.key ? "#fff !important" : "#0E2A3D !important", borderColor: "#0E2A3D", "&:hover": { bgcolor: mode === m.key ? "#0E2A3D" : "rgba(14,42,61,0.06)", borderColor: "#0E2A3D" } }}>
                {m.label}
              </Button>
            ))}
          </Stack>
          <Typography sx={{ fontSize: "0.82rem", color: MUTED, mt: 1 }}>{MODES.find((m) => m.key === mode)?.sub}</Typography>
        </Box>

        {mode === "pending" && (
          <Box sx={{ mb: 2, p: 2, borderRadius: "12px", bgcolor: "#FBF3E1", border: "1px solid rgba(160,120,35,0.35)", color: INK, fontSize: "0.92rem" }}>
            <strong>A person is checking this report.</strong> Your estimate is below. The full report, with every fix and the words to use, is released once every line has been checked against your documents, usually within a day. We will email you.
          </Box>
        )}

        <FindingsReport
          practiceName="Maple Grove Family Dental"
          headline={headline}
          findings={findings}
          alreadyFine={ALREADY_FINE}
          limits={LIMITS}
          checked={mode === "released"}
          unlockHref={mode === "estimate" ? "/join/member?utm_source=audit&utm_campaign=found_money" : undefined}
          lockedTotal={mode === "estimate" ? lockedTotal : undefined}
        />

        <Typography sx={{ mt: 1.5, fontSize: "0.78rem", color: MUTED }}>
          Uploaded October 5, 2026{mode === "released" ? " · checked and released October 8" : ""}
        </Typography>
      </Container>
    </Box>
  );
}
