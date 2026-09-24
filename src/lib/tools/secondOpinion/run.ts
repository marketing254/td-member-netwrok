import "server-only";
import { getOpenAI } from "@/lib/ai/assistant";
import { SECOND_OPINION_PROMPT } from "./prompt";
import { buildLibraryText } from "./library";

export const SECOND_OPINION_MODEL = "gpt-4o-mini";

export const POOL_CATEGORIES = [
  "supplies",
  "lab",
  "software",
  "marketing",
  "card_processing",
  "insurance_verification",
  "payroll",
  "equipment",
  "other",
] as const;
export const COST_BANDS = ["under_1k", "1k_5k", "5k_15k", "15k_50k", "over_50k", "unknown"] as const;

export type SecondOpinionResult = {
  what_this_is: string;
  whats_in_it: { label: string; fact: string; quote: string | null }[];
  what_we_notice: { kind: "library" | "published"; expert: string; source: string; url: string | null; point: string }[];
  /** The model found nothing in the LIBRARY that applies. */
  library_silent: boolean;
  recommendation: string;
  meta: {
    is_signable_document: boolean;
    vendor: string | null;
    category: (typeof POOL_CATEGORIES)[number];
    annual_cost_band: (typeof COST_BANDS)[number];
  };
  /** Set by us, not the model: the document was longer than the cap. */
  truncated?: boolean;
};

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Parse and clamp the model's JSON so a malformed reply never reaches the page unchecked. */
export function parseResult(raw: string): SecondOpinionResult {
  const j = JSON.parse(raw) as Record<string, unknown>;
  const meta = (j.meta ?? {}) as Record<string, unknown>;
  const cat = str(meta.category, 40) as SecondOpinionResult["meta"]["category"];
  const band = str(meta.annual_cost_band, 40) as SecondOpinionResult["meta"]["annual_cost_band"];
  return {
    what_this_is: str(j.what_this_is, 400),
    whats_in_it: Array.isArray(j.whats_in_it)
      ? j.whats_in_it.slice(0, 20).map((x) => {
          const o = (x ?? {}) as Record<string, unknown>;
          return { label: str(o.label, 80), fact: str(o.fact, 800), quote: str(o.quote, 800) || null };
        })
      : [],
    what_we_notice: Array.isArray(j.what_we_notice)
      ? j.what_we_notice.slice(0, 10).map((x) => {
          const o = (x ?? {}) as Record<string, unknown>;
          const url = str(o.url, 500);
          return {
            kind: o.kind === "published" ? ("published" as const) : ("library" as const),
            expert: str(o.expert, 120),
            source: str(o.source, 200),
            url: /^https?:\/\//i.test(url) ? url : null,
            point: str(o.point, 800),
          };
        })
      : [],
    library_silent: j.library_silent === true || !Array.isArray(j.what_we_notice) || j.what_we_notice.length === 0,
    recommendation: str(j.recommendation, 1400),
    meta: {
      is_signable_document: meta.is_signable_document !== false,
      vendor: str(meta.vendor, 160) || null,
      category: (POOL_CATEGORIES as readonly string[]).includes(cat) ? cat : "other",
      annual_cost_band: (COST_BANDS as readonly string[]).includes(band) ? band : "unknown",
    },
  };
}

export async function runSecondOpinion(documentText: string, truncated: boolean): Promise<SecondOpinionResult> {
  const library = await buildLibraryText();
  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: SECOND_OPINION_MODEL,
    temperature: 0.2,
    max_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SECOND_OPINION_PROMPT },
      {
        role: "user",
        content: `DOCUMENT:\n${documentText}${truncated ? "\n\n[The document was longer than the reading limit and has been cut here. Say so in block 2.]" : ""}\n\nLIBRARY:\n${library}`,
      },
    ],
  });
  const raw = res.choices[0]?.message?.content ?? "";
  const result = parseResult(raw);
  if (truncated) result.truncated = true;
  return result;
}

/** Map the member's "number of locations" answer to a coarse, anonymous band for the pool. */
export function practiceSizeBand(locations: string | null | undefined): string {
  const v = (locations ?? "").toLowerCase();
  if (!v) return "unknown";
  if (v.startsWith("1")) return "single_location";
  if (v.startsWith("2") || v.startsWith("3")) return "2_3_locations";
  return "4_plus_locations";
}
