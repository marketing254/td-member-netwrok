import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { SOPS } from "@/lib/sops";

/**
 * The knowledge base the reading tools may answer from.
 *
 * Lester's rule (24 September): only Playbooks, SOPs, directory entries
 * and partner offers from experts and partners who are LIVE in the
 * directory. Built from the live listings, never from the kit folder, so
 * the tool can never quote somebody who is not in.
 *
 * "Live" uses the same gate as the public directory pages:
 *   experts:  status = active AND headshot AND bio
 *   partners: status = approved AND verified AND logo
 * A kit whose expert is not live is left out. House kits with no expert
 * attached are attributed to the Thriving Dentist house expert and are
 * included only while that expert is live.
 *
 * Note: this passes each kit's title, category, summary and item titles,
 * not the full PDF text. Enough to name the right expert and Playbook;
 * quoting a Playbook's inner guidance needs the kit text loaded into the
 * library, which is the next step once Lester confirms the set.
 */

const HOUSE_EXPERT_NAME = "Gary Takacs";

type LiveExpert = { id: string; name: string; specialty: string | null };

export async function loadLiveExperts(): Promise<LiveExpert[]> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("experts")
    .select("id, display_name, full_name, specialty")
    .eq("status", "active")
    .not("headshot_url", "is", null)
    .not("bio", "is", null);
  return (data ?? []).map((e) => ({ id: e.id, name: e.display_name || e.full_name, specialty: e.specialty }));
}

export async function buildLibraryText(opts: { withPartners?: boolean } = {}): Promise<string> {
  const sb = getSupabaseAdmin();
  const experts = await loadLiveExperts();
  const liveIds = new Set(experts.map((e) => e.id));
  const liveNames = new Set(experts.map((e) => e.name));
  const houseLive = experts.find((e) => e.name === HOUSE_EXPERT_NAME) ?? null;

  const { data } = await sb
    .from("resources")
    .select("topic_slug, topic_title, topic_summary, category, title, originating_expert_id")
    .eq("is_published", true)
    .eq("submission_status", "approved");

  const kits = new Map<string, { title: string; category: string | null; summary: string | null; items: string[]; expertId: string | null }>();
  for (const r of data ?? []) {
    const k = kits.get(r.topic_slug);
    if (k) {
      if (r.title && k.items.length < 10) k.items.push(r.title);
      if (!k.expertId && r.originating_expert_id) k.expertId = r.originating_expert_id;
    } else {
      kits.set(r.topic_slug, { title: r.topic_title, category: r.category, summary: r.topic_summary, items: r.title ? [r.title] : [], expertId: r.originating_expert_id });
    }
  }

  const lines: string[] = ["PRACTICE PLAYBOOKS (expert, title, category, summary, contents). Only experts live in the directory appear here:"];
  for (const k of kits.values()) {
    let who: string | null = null;
    if (k.expertId) who = liveIds.has(k.expertId) ? experts.find((e) => e.id === k.expertId)!.name : null;
    else if (houseLive) who = houseLive.name;
    if (!who) continue; // expert not live: the tool must never see this kit
    lines.push(`- ${who}, "${k.title}"${k.category ? ` [${k.category}]` : ""}: ${k.summary ?? ""}${k.items.length ? ` Contents: ${k.items.join("; ")}.` : ""}`);
  }

  lines.push("", "APPROVED STANDARD OPERATING PROCEDURES (expert, title, category). Only experts live in the directory appear here:");
  for (const s of SOPS) if (liveNames.has(s.expert.name)) lines.push(`- ${s.expert.name}, "${s.title}" [${s.category}], approved ${s.approved}.`);

  lines.push("", "EXPERT DIRECTORY (name, specialty, link):");
  for (const e of experts) lines.push(`- ${e.name}${e.specialty ? `, ${e.specialty}` : ""}: /dashboard/experts/${e.id}`);

  if (opts.withPartners) {
    const { data: vendors } = await sb
      .from("vendors")
      .select("id, company_name, display_name, category")
      .eq("status", "approved")
      .eq("verified", true)
      .not("logo_url", "is", null);
    const live = (vendors ?? []).filter((v) => !/^(test|tt)/i.test(v.company_name));
    const vIds = live.map((v) => v.id);
    const { data: offers } = vIds.length
      ? await sb.from("offers").select("vendor_id, headline, discount_value, terms, valid_to").in("vendor_id", vIds).eq("review_status", "approved")
      : { data: [] as { vendor_id: string; headline: string; discount_value: string | null; terms: string | null; valid_to: string | null }[] };
    lines.push("", "PARTNER MEMBER OFFERS (partner, category, offer, link). Only partners live in the directory appear here:");
    for (const o of offers ?? []) {
      const v = live.find((x) => x.id === o.vendor_id);
      if (!v) continue;
      if (o.valid_to && new Date(o.valid_to) < new Date()) continue;
      lines.push(`- ${v.display_name || v.company_name}${v.category ? ` [${v.category}]` : ""}: ${o.headline}${o.discount_value ? ` (${o.discount_value})` : ""}. /dashboard/partners/${v.id}`);
    }
  }

  return lines.join("\n");
}
