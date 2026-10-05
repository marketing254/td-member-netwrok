import { createElement as h, type ReactElement } from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer, type DocumentProps } from "@react-pdf/renderer";

/**
 * The Found Money report as a branded PDF. Built with @react-pdf/renderer
 * (no headless browser) so it runs the same locally and on Vercel.
 * Plain createElement, no JSX, so a Node script can import this file
 * directly for drafts.
 *
 * Only released (checked) reports should be rendered to PDF: every finding
 * is printed in full, nothing is locked.
 */

export type PdfFinding = {
  title: string;
  why: string | null;
  action: string | null;
  script: string | null;
  annual_saving: number;
  confidence: "high" | "medium" | "low";
};

export type FoundMoneyReportInput = {
  practiceName: string | null;
  headline: number;
  findings: PdfFinding[];
  alreadyFine: string[];
  limits: string[];
  uploadedAt: Date;
  releasedAt: Date;
  promise: string;
};

const INK = "#0A1A2F";
const INK_SOFT = "#3B4A55";
const MUTED = "#7A8590";
const GOLD = "#A07823";
const GOLD_LIGHT = "#D9A84B";
const GOLD_PALE = "#FBF3E1";
const GREEN = "#2C7A52";
const LINE = "#E6DDCF";
const PAPER = "#FBF8F1";

const s = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", paddingTop: 48, paddingHorizontal: 48, paddingBottom: 56, fontFamily: "Helvetica", fontSize: 10, color: INK_SOFT, lineHeight: 1.5 },
  // Header band
  band: { backgroundColor: INK, borderRadius: 10, padding: 24, marginBottom: 22 },
  eyebrow: { fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 2, color: GOLD_LIGHT, textTransform: "uppercase" },
  practice: { fontFamily: "Helvetica-Bold", fontSize: 18, color: "#FFFFFF", marginTop: 6 },
  checked: { fontSize: 9, color: "#C7CFD8", marginTop: 8 },
  headlineRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 16 },
  headline: { fontFamily: "Helvetica-Bold", fontSize: 32, color: GOLD_LIGHT, lineHeight: 1 },
  headlineSub: { fontSize: 10, color: "#E6E9EE", marginLeft: 10, marginBottom: 3 },
  // Section
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: 8, marginTop: 6 },
  // Finding card
  card: { borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  num: { width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD_LIGHT, color: INK, fontFamily: "Helvetica-Bold", fontSize: 10, textAlign: "center", paddingTop: 5, marginRight: 10 },
  cardBody: { flex: 1 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 12, color: INK, lineHeight: 1.3 },
  amountWrap: { marginLeft: 12, alignItems: "flex-end", minWidth: 70 },
  amount: { fontFamily: "Helvetica-Bold", fontSize: 13, color: INK },
  amountSub: { fontSize: 7.5, color: MUTED },
  why: { marginTop: 6, color: INK_SOFT },
  label: { fontFamily: "Helvetica-Bold", color: INK },
  action: { marginTop: 5, color: INK },
  script: { marginTop: 7, backgroundColor: GOLD_PALE, borderRadius: 6, padding: 8, color: INK },
  tag: { marginTop: 7, fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1.5, color: GOLD, textTransform: "uppercase" },
  tagLow: { color: MUTED },
  // Two-column notes
  cols: { flexDirection: "row", marginTop: 6 },
  col: { flex: 1, backgroundColor: PAPER, borderWidth: 1, borderColor: LINE, borderRadius: 8, padding: 12 },
  colGap: { width: 10 },
  colTitle: { fontFamily: "Helvetica-Bold", fontSize: 7.5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  bullet: { flexDirection: "row", marginBottom: 3 },
  bulletDot: { width: 10, color: GREEN, fontFamily: "Helvetica-Bold" },
  bulletText: { flex: 1, fontSize: 9, color: INK_SOFT },
  // Promise + footer
  promise: { marginTop: 14, borderLeftWidth: 3, borderLeftColor: GOLD_LIGHT, paddingLeft: 10, fontSize: 9, color: INK },
  footer: { position: "absolute", left: 48, right: 48, bottom: 24, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: MUTED, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 8 },
});

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const date = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const CONF: Record<PdfFinding["confidence"], string> = { high: "From your document", medium: "Against a benchmark", low: "Worth checking, not counted" };

function finding(f: PdfFinding, i: number): ReactElement {
  return h(
    View,
    { key: i, style: s.card, wrap: false },
    h(
      View,
      { style: s.cardTop },
      h(Text, { style: s.num }, String(i + 1)),
      h(
        View,
        { style: s.cardBody },
        h(Text, { style: s.title }, f.title),
        f.why ? h(Text, { style: s.why }, f.why) : null,
        f.action ? h(Text, { style: s.action }, h(Text, { style: s.label }, "What to do: "), f.action) : null,
        f.script ? h(Text, { style: s.script }, h(Text, { style: s.label }, "What to say: "), `“${f.script}”`) : null,
        h(Text, { style: [s.tag, f.confidence === "low" ? s.tagLow : {}] }, CONF[f.confidence]),
      ),
      h(
        View,
        { style: s.amountWrap },
        h(Text, { style: s.amount }, usd(f.annual_saving)),
        h(Text, { style: s.amountSub }, f.confidence === "low" ? "a year, not counted" : "a year"),
      ),
    ),
  );
}

function notes(title: string, color: string, items: string[]): ReactElement {
  return h(
    View,
    { style: s.col },
    h(Text, { style: [s.colTitle, { color }] }, title),
    ...items.map((x, i) => h(View, { key: i, style: s.bullet }, h(Text, { style: [s.bulletDot, { color }] }, "•"), h(Text, { style: s.bulletText }, x))),
  );
}

export function FoundMoneyReportDocument(input: FoundMoneyReportInput): ReactElement<DocumentProps> {
  const counted = input.findings.filter((f) => f.confidence !== "low");
  const footer = h(
    View,
    { style: s.footer, fixed: true },
    h(Text, { fixed: true }, `Found Money Audit · ${input.practiceName ?? "Your practice"} · Dental Member Network`),
    h(Text, { fixed: true, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` }),
  );

  return h(
    Document as unknown as (p: DocumentProps) => ReactElement<DocumentProps>,
    { title: `Found Money Audit - ${input.practiceName ?? "Report"}`, author: "Dental Member Network" },
    h(
      Page,
      { size: "LETTER", style: s.page },
      h(
        View,
        { style: s.band },
        h(Text, { style: s.eyebrow }, "Your checked report"),
        h(Text, { style: s.practice }, input.practiceName ?? "Your practice"),
        h(Text, { style: s.checked }, `Every line checked by a person on our team · uploaded ${date(input.uploadedAt)}, released ${date(input.releasedAt)}`),
        h(
          View,
          { style: s.headlineRow },
          h(Text, { style: s.headline }, usd(input.headline)),
          h(Text, { style: s.headlineSub }, `a year you may be overpaying, across ${counted.length} ${counted.length === 1 ? "fix" : "fixes"}`),
        ),
      ),
      h(Text, { style: s.sectionTitle }, "The fixes"),
      ...input.findings.map(finding),
      input.alreadyFine.length || input.limits.length
        ? h(
            View,
            { style: s.cols, wrap: false },
            input.alreadyFine.length ? notes("Already fine", GREEN, input.alreadyFine) : null,
            input.alreadyFine.length && input.limits.length ? h(View, { style: s.colGap }) : null,
            input.limits.length ? notes("What we could not read or compare", MUTED, input.limits) : null,
          )
        : null,
      h(Text, { style: s.promise }, input.promise),
      footer,
    ),
  );
}

export async function renderFoundMoneyReportPdf(input: FoundMoneyReportInput): Promise<Buffer> {
  return renderToBuffer(FoundMoneyReportDocument(input));
}
