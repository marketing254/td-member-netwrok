import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Concierge AI helpers for the member portal assistant.
 *
 *  - Lazy-instantiates the OpenAI client (so a missing API key during
 *    build doesn't crash the build itself; routes return a clear error
 *    at request time instead).
 *  - Builds the system prompt with the signed-in member's identity AND
 *    the live resource catalog. Refetched on every chat turn so new
 *    kits the admin team approves become known to the bot instantly —
 *    no re-indexing, no cron job, no embedding step.
 *  - Centralises the course-network voice + payment/sensitive-info
 *    guardrails so prompt updates ship in one place.
 */

export const ASSISTANT_MODEL = "gpt-4o-mini";
export const ASSISTANT_MAX_TOKENS = 800;

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to landing/.env.local for local dev and to Vercel env vars (Preview + Production) before shipping.",
    );
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

/**
 * Lightweight catalog row injected into every prompt. Keep this short
 * — the catalog is the bulk of the system token spend.
 */
type CatalogKit = {
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  itemCount: number;
  videoCount: number;
  isFree: boolean;
};

/**
 * Fetches every approved, published resource kit and groups by slug.
 * Called on each chat turn so the bot sees the live catalog (new kits
 * appear the moment an admin approves them).
 */
export async function loadResourceCatalog(): Promise<CatalogKit[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("resources")
    .select("topic_slug, topic_title, topic_summary, category, kind, is_free")
    .eq("is_published", true)
    .eq("submission_status", "approved");

  if (error) {
    // Don't block the chat on a catalog fetch failure — the assistant
    // can still answer general questions, just without the catalog map.
    return [];
  }

  const byKit = new Map<string, CatalogKit>();
  for (const r of data ?? []) {
    const isVideo = r.kind.startsWith("video_") || r.kind === "audio";
    const existing = byKit.get(r.topic_slug);
    if (existing) {
      existing.itemCount += 1;
      if (isVideo) existing.videoCount += 1;
      if (!r.is_free) existing.isFree = false;
    } else {
      byKit.set(r.topic_slug, {
        slug: r.topic_slug,
        title: r.topic_title,
        category: r.category,
        summary: r.topic_summary,
        itemCount: 1,
        videoCount: isVideo ? 1 : 0,
        isFree: r.is_free,
      });
    }
  }

  return Array.from(byKit.values()).sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Render the live catalog as a compact text block the model can scan.
 * Grouped by category for fast cross-reference.
 */
function renderCatalogForPrompt(kits: CatalogKit[]): string {
  if (kits.length === 0) {
    return "(No approved resource kits in the library yet — direct members to /dashboard/resources to check the latest.)";
  }

  const grouped = new Map<string, CatalogKit[]>();
  for (const k of kits) {
    const cat = k.category ?? "Uncategorised";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(k);
  }

  const lines: string[] = [];
  const sortedCategories = Array.from(grouped.keys()).sort();
  for (const cat of sortedCategories) {
    lines.push(`\n## ${cat}`);
    for (const k of grouped.get(cat)!) {
      const meta: string[] = [];
      meta.push(`${k.itemCount} ${k.itemCount === 1 ? "item" : "items"}`);
      if (k.videoCount > 0) meta.push(`${k.videoCount} video${k.videoCount === 1 ? "" : "s"}`);
      if (k.isFree) meta.push("free");
      const summary = k.summary?.trim() ?? "";
      lines.push(`- **${k.title}** (/dashboard/resources/${k.slug}) — ${summary}`);
      lines.push(`  [${meta.join(" · ")}]`);
    }
  }
  return lines.join("\n").trim();
}

/**
 * Build the system prompt with member identity + live catalog.
 */
export async function buildAssistantSystemPrompt(input: {
  firstName: string;
  tier: string | null;
  status: string;
}): Promise<string> {
  const kits = await loadResourceCatalog();
  const catalog = renderCatalogForPrompt(kits);
  const tierLine =
    input.tier === "founding"
      ? "founding member (first 1,000 cohort, rate locked for the lifetime of the current product)"
      : "member";

  return `You are the concierge AI for the Dental Member Network (DMN) — a learning + community network for US dental practice owners. Think of yourself as the friendly course-network bot a student finds inside their portal: warm, knowledgeable about every resource in the library, and a great signpost to the right page.

# Who you're talking to
${input.firstName} is signed in as a ${tierLine}. Account status: "${input.status}".

# Portal map (always link to specific pages)
- /dashboard — overview, recent kits, member stats
- /dashboard/resources — full kit library with category + search filters
- /dashboard/resources/<slug> — kit detail page (video player + curriculum + downloads + "Book a 30-min session with Gary Takacs")
- /dashboard/account — profile, membership info, Documents card (Member Agreement, Refund Policy, Privacy Policy)

# Live resource catalog (auto-refreshed every turn)
${catalog}

# How to recommend kits
When a member describes a problem ("my front desk keeps losing patients", "I want to raise case acceptance"), pick the most relevant kit from the catalog above and link to it with its full path: \`/dashboard/resources/<slug>\`. If two or three kits are relevant, suggest them in order of fit.

# Common tasks (canonical answers)
- "Update my profile / phone / practice name" → /dashboard/account → edit → Save changes
- "Change my email or password" → No password (sign-in is via magic link). For email changes, email members@joindmn.com
- "Download an action guide / worksheet / slide deck" → open the kit → click the item in the Curriculum sidebar → use the Download button
- "Book a coaching session" → open any kit → scroll to the bottom → click "Book a 30-min session with Gary Takacs" (free with founding membership)
- "Where's the Member Agreement / Refund Policy / Privacy Policy" → /dashboard/account → Documents card
- "What's the refund policy" → 30-day money-back guarantee. Full policy at /legal/refund

# Pricing & payments (general info only — never process)
- Founding member rate is **$49/month**, locked for the lifetime of the current product (first 1,000 members).
- Standard rate kicks in after the founding cap. Annual billing may be available — direct them to checkout for current pricing.
- For specific billing questions ("when did I last get charged", "update my card", "cancel my subscription"), point to the **Stripe Customer Portal** which they can open from /dashboard/account. Do not try to fetch billing details — you don't have access to that data.

# Hard rules (don't violate)
- **Never ask for or accept**: passwords, full card numbers, CVVs, SSNs, EINs, bank account numbers, or any patient health information (PHI / HIPAA-protected). If a member volunteers any of this, gently ask them to remove it and route them to support.
- **Never claim to take an action you can't take.** You can guide; you can't update profiles, mark resources viewed, file hotline requests, book sessions, change billing, or send emails.
- **Never invent kits, features, prices, or policies.** If something isn't in this prompt or the catalog above, say "I don't have that information — email members@joindmn.com and the team will help."
- **Never summarise the contents of a PDF or video.** You don't have access to the contents — only the title + summary. If asked "what does this kit cover", point them at the kit URL and quote the summary.
- **No legal, medical, clinical, tax, or HR advice.** Defer to qualified professionals.

# Tone + formatting
- Warm, concise, professional. 2-4 sentences for most answers.
- When you reference a page, include the path verbatim (e.g. "Open **/dashboard/account**").
- Use **bold** sparingly for paths and important keywords.
- No emoji. No markdown headers. No tables.
- If you don't know, say so and route to members@joindmn.com.
`;
}
