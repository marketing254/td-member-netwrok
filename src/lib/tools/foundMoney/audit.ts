import "server-only";
import { getOpenAI } from "@/lib/ai/assistant";
import { extractText } from "@/lib/tools/secondOpinion/extract";
import { BENCHMARK, FOUND_MONEY_MODEL, STAGE_A_PROMPT, STAGE_A_SCHEMA, STAGE_C_PROMPT, STAGE_C_SCHEMA, type AuditSlot } from "./pack";

/**
 * Found Money Audit pipeline. Four stages, per Lester's pack:
 *   A. Read: the model copies facts off each document (JSON, schema A).
 *   B. Calculate: THIS CODE turns extractions into facts, in dollars a year.
 *   C. Explain: the model writes findings from the facts only (schema C).
 *   D. Show: the pages. After C, every number is checked against B; if any
 *      differs the prose is discarded and the facts are shown without it.
 */

export type Extraction = {
  document_type: "card_processing_statement" | "supply_invoice" | "card_statement" | "other";
  issuer: string | null;
  period: { start: string | null; end: string | null };
  currency: string | null;
  contains_patient_data: boolean;
  card_processing: { pricing_type: string | null; total_volume: number | null; total_fees: number | null; fee_lines: { label: string; amount: number | null; page: number }[] } | null;
  supply_lines: { description: string; item_code: string | null; quantity: number | null; unit: string | null; unit_price: number | null; line_total: number | null; page: number }[];
  card_charges: { date: string | null; merchant: string; amount: number | null; recurring_hint: boolean; page: number }[];
  unreadable: string[];
};

export type Fact = {
  id: string;
  category: "card_processing" | "supplies" | "subscriptions";
  label: string;
  detail: string;
  annual_saving: number;
  confidence: "high" | "medium" | "low";
  source: { file: string; page: number | null; line: string };
  partner?: string | null;
};

export type Facts = {
  practice_name: string | null;
  headline_total: number;
  facts: Fact[];
  checked_ok: string[];
  limits: string[];
  card: { effective_rate: number | null; total_volume: number | null; total_fees: number | null; pricing_type: string | null; benchmark_high: number | null } | null;
  supply_lines_read: number;
  subscriptions_seen: number;
};

export type Findings = {
  headline_total: number;
  findings: { fact_id: string; title: string; why: string; action: string; script: string | null; annual_saving: number; confidence: "high" | "medium" | "low" }[];
  already_fine: string[];
  limits: string[];
};

export class AuditError extends Error {
  constructor(message: string, public code: "patient_data" | "wrong_type" | "unreadable" | "model") {
    super(message);
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * True when the failure is on OpenAI's side rather than the document's:
 * no credit left, key rejected, rate limited, or the service down. The
 * route turns these into a calm "try again shortly" message and alerts the
 * team; the visitor is never told why.
 */
export function isModelOutage(err: unknown): boolean {
  const e = err as { status?: number; code?: string; type?: string; name?: string } | null;
  if (!e || typeof e !== "object") return false;
  if (e.code === "insufficient_quota" || e.type === "insufficient_quota") return true;
  if (e.name === "APIConnectionError" || e.name === "APIConnectionTimeoutError") return true;
  return typeof e.status === "number" && [401, 402, 403, 429, 500, 502, 503, 504].includes(e.status);
}

/** Console line per model call so token use shows up in the dev terminal and Vercel logs. */
function logUsage(stage: string, name: string, usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined) {
  if (!usage) return;
  console.info(`[audit tokens] ${stage} ${name}: in=${usage.prompt_tokens ?? 0} out=${usage.completion_tokens ?? 0} total=${usage.total_tokens ?? 0}`);
}

// ─── Stage A ────────────────────────────────────────────────────────────
export async function readDocument(buf: Buffer, mime: string, name: string): Promise<Extraction> {
  const extracted = await extractText(buf, mime); // pdf text, or a vision transcription of a photo
  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: FOUND_MONEY_MODEL,
    temperature: 0,
    max_tokens: 8000,
    response_format: { type: "json_schema", json_schema: { name: "extraction", strict: true, schema: STAGE_A_SCHEMA as unknown as Record<string, unknown> } },
    messages: [
      { role: "system", content: STAGE_A_PROMPT },
      { role: "user", content: `DOCUMENT (${name}):\n${extracted.text}\n\nRead this document.` },
    ],
  });
  logUsage("stage A", name, res.usage);
  const choice = res.choices[0];
  if (!choice || choice.finish_reason === "content_filter" || !choice.message?.content) {
    throw new AuditError("We couldn't read this document, please try another.", "model");
  }
  return JSON.parse(choice.message.content) as Extraction;
}

// ─── Stage B ────────────────────────────────────────────────────────────
export function calculateFacts(
  docs: { slot: AuditSlot; name: string; extraction: Extraction }[],
  practiceName: string | null,
): Facts {
  const facts: Fact[] = [];
  const limits: string[] = [];
  const checked: string[] = [];
  let card: Facts["card"] = null;
  let supplyLines = 0;
  let subsSeen = 0;

  // Card processing: effective rate, benchmark gap (only when a sourced
  // benchmark exists), and avoidable fee lines, each times 12.
  for (const d of docs.filter((x) => x.extraction.document_type === "card_processing_statement")) {
    const cp = d.extraction.card_processing;
    if (!cp) continue;
    const rate = cp.total_fees != null && cp.total_volume ? cp.total_fees / cp.total_volume : null;
    card = { effective_rate: rate, total_volume: cp.total_volume, total_fees: cp.total_fees, pricing_type: cp.pricing_type, benchmark_high: BENCHMARK.card_fair_rate_high };
    if (rate != null && BENCHMARK.card_fair_rate_high != null && cp.total_volume) {
      const gap = rate - BENCHMARK.card_fair_rate_high;
      if (gap > 0) {
        facts.push({
          id: "card_rate",
          category: "card_processing",
          label: `Card processing effective rate ${(rate * 100).toFixed(2)}% against a fair rate of about ${(BENCHMARK.card_fair_rate_high * 100).toFixed(2)}%`,
          detail: `Total fees ${cp.total_fees} on volume ${cp.total_volume} for the period. Source: ${BENCHMARK.card_benchmark_source}.`,
          annual_saving: round2(gap * cp.total_volume * 12),
          confidence: "medium",
          source: { file: d.name, page: null, line: "Total fees / total volume" },
          partner: BENCHMARK.partners.find((p) => p.category === "card_processing")?.name ?? null,
        });
      } else {
        checked.push("Your card processing rate is within the fair range we compare against.");
      }
    } else if (rate != null) {
      limits.push(`Card processing: your effective rate reads as ${(rate * 100).toFixed(2)}%. We have not compared it to a benchmark yet; that comparison is added once a sourced fair rate is confirmed.`);
    } else {
      limits.push("Card processing: the statement did not show both total fees and total volume, so the effective rate could not be worked out.");
    }
    let i = 0;
    for (const line of cp.fee_lines) {
      if (line.amount == null || line.amount <= 0) continue;
      const hit = BENCHMARK.avoidable_card_fees.find((a) => line.label.toLowerCase().includes(a.toLowerCase()));
      if (!hit) continue;
      i += 1;
      facts.push({
        id: `card_fee_${i}`,
        category: "card_processing",
        label: `"${line.label}" fee of ${line.amount} a month`,
        detail: `This fee is usually avoidable. Printed as "${line.label}" on page ${line.page}.`,
        annual_saving: round2(line.amount * 12),
        confidence: "high",
        source: { file: d.name, page: line.page, line: line.label },
        partner: null,
      });
    }
    if (i === 0 && cp.fee_lines.length) checked.push("No avoidable card fees (PCI non-compliance, monthly minimum, statement fee) appeared on your statement.");
  }

  // Supplies: compare only on an exact match in the member price list. No
  // price list exists yet, so lines are read and counted, nothing is claimed.
  for (const d of docs.filter((x) => x.extraction.document_type === "supply_invoice")) {
    supplyLines += d.extraction.supply_lines.length;
  }
  if (supplyLines > 0) {
    limits.push(`Supplies: ${supplyLines} item line${supplyLines === 1 ? "" : "s"} read. Price comparison against other members' prices is added as the member price list grows; none is claimed here.`);
  }

  // Subscriptions: a merchant charged more than once, or marked recurring,
  // is a subscription. Low confidence: a person confirms whether it is used.
  const groups = new Map<string, { merchant: string; amounts: number[]; pages: number[]; file: string; hint: boolean }>();
  for (const d of docs.filter((x) => x.extraction.document_type === "card_statement")) {
    for (const c of d.extraction.card_charges) {
      if (c.amount == null || c.amount <= 0) continue;
      const key = c.merchant.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").slice(0, 2).join(" ");
      const g = groups.get(key) ?? { merchant: c.merchant, amounts: [], pages: [], file: d.name, hint: false };
      g.amounts.push(c.amount);
      g.pages.push(c.page);
      g.hint = g.hint || c.recurring_hint;
      groups.set(key, g);
    }
  }
  let s = 0;
  for (const g of groups.values()) {
    const sameAmount = g.amounts.length >= 2 && new Set(g.amounts.map((a) => a.toFixed(2))).size === 1;
    if (!(g.hint || sameAmount)) continue;
    subsSeen += 1;
    const monthly = g.amounts[0]!;
    s += 1;
    facts.push({
      id: `sub_${s}`,
      category: "subscriptions",
      label: `A recurring charge from ${g.merchant} of ${monthly} a month`,
      detail: `Seen ${g.amounts.length} time${g.amounts.length === 1 ? "" : "s"} on page ${g.pages[0]}. Worth checking whether it is still used, or paid for twice.`,
      annual_saving: round2(monthly * 12),
      confidence: "low",
      source: { file: g.file, page: g.pages[0] ?? null, line: g.merchant },
      partner: null,
    });
  }
  if (docs.some((x) => x.extraction.document_type === "card_statement") && subsSeen === 0) {
    checked.push("No repeat subscription charges stood out on the card statement we read.");
  }

  for (const d of docs) for (const u of d.extraction.unreadable) limits.push(`${d.name}: ${u}`);

  // Headline = high and medium only. Low-confidence facts are shown, never counted.
  const headline = round2(facts.filter((f) => f.confidence !== "low").reduce((sum, f) => sum + f.annual_saving, 0));
  return { practice_name: practiceName, headline_total: headline, facts, checked_ok: checked, limits, card, supply_lines_read: supplyLines, subscriptions_seen: subsSeen };
}

// ─── Stage C ────────────────────────────────────────────────────────────
export async function explainFacts(facts: Facts): Promise<Findings | null> {
  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: FOUND_MONEY_MODEL,
    temperature: 0.2,
    max_tokens: 4000,
    response_format: { type: "json_schema", json_schema: { name: "findings", strict: true, schema: STAGE_C_SCHEMA as unknown as Record<string, unknown> } },
    messages: [
      { role: "system", content: STAGE_C_PROMPT },
      { role: "user", content: `Write the findings for these facts:\n${JSON.stringify(facts)}` },
    ],
  });
  logUsage("stage C", "findings", res.usage);
  const content = res.choices[0]?.message?.content;
  if (!content) return null;
  const out = JSON.parse(content) as Findings;
  return verifyFindings(out, facts) ? out : null;
}

/** Every number in the prose must exist in the facts. If not, the prose is discarded. */
export function verifyFindings(f: Findings, facts: Facts): boolean {
  if (Math.abs(f.headline_total - facts.headline_total) > 0.01) return false;
  const byId = new Map(facts.facts.map((x) => [x.id, x]));
  for (const fi of f.findings) {
    const fact = byId.get(fi.fact_id);
    if (!fact || fact.annual_saving <= 0) return false;
    if (Math.abs(fi.annual_saving - fact.annual_saving) > 0.01) return false;
    if (fi.confidence !== fact.confidence) return false;
  }
  if (f.findings.length && f.findings[0]!.confidence === "low") return false;
  // No benchmark configured means no comparison may be claimed anywhere in
  // the prose. If the model slips one in, the plain facts are used instead.
  if (BENCHMARK.card_fair_rate_high == null) {
    const prose = [...f.findings.flatMap((x) => [x.title, x.why, x.action, x.script]), ...f.already_fine, ...f.limits].filter(Boolean).join(" ");
    if (/benchmark|members pay|other members|your size|fair rate|normal range|typical rate|above what|below what/i.test(prose)) {
      const allowed = /We have not compared it to a benchmark yet|none is claimed here/g;
      const stripped = prose.replace(allowed, "");
      if (/benchmark|members pay|other members|your size|fair rate|normal range|typical rate|above what|below what/i.test(stripped)) return false;
    }
  }
  return true;
}

/** Facts without prose, for when stage C fails its check. Same shape the pages render. */
export function findingsFromFacts(facts: Facts): Findings {
  const ordered = [...facts.facts].filter((x) => x.annual_saving > 0).sort((a, b) => (a.confidence === "low" ? 1 : 0) - (b.confidence === "low" ? 1 : 0) || b.annual_saving - a.annual_saving);
  return {
    headline_total: facts.headline_total,
    findings: ordered.map((x) => ({
      fact_id: x.id,
      title: x.confidence === "low" ? `Check whether you still use: ${x.label}` : x.label,
      why: x.detail,
      action: x.category === "subscriptions" ? "Check who uses it. If nobody does, cancel it after the notice period." : "Ask the provider to remove this line. Members get the words to use.",
      script: null,
      annual_saving: x.annual_saving,
      confidence: x.confidence,
    })),
    already_fine: facts.checked_ok,
    limits: facts.limits,
  };
}
