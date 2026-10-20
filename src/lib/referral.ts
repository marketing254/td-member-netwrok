import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/** Untyped client for slug_aliases (migration 0074, not in the generated types yet). */
function db(): SupabaseClient {
  return getSupabaseAdmin() as unknown as SupabaseClient;
}

/**
 * Handles an admin may not choose: every top-level page and public folder
 * on the site (a real page always wins over a referral handle, so the link
 * would never work), plus a few system names.
 */
const RESERVED_HANDLES = new Set([
  "admin", "agreement", "api", "audit", "auth", "blog", "dashboard", "expert", "experts", "founding",
  "invite", "jobs", "join", "legal", "member", "partners", "pricing", "replay", "reshani", "resources",
  "reviews", "rida", "seeker", "start", "summit", "tools", "upgrade", "vendor", "waitlist", "welcome",
  "ads", "agreements", "free-kit", "team", "video", "index", "login", "signup", "support", "about",
  "contact", "privacy", "terms", "well-known", "sw", "static", "_next", "favicon",
]);

export const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

/** True when another referral row already uses this handle, as its link or a previous one. */
async function handleTaken(handle: string, exceptId?: string): Promise<boolean> {
  let q = db().from("referral_codes").select("id").or(`slug.ilike.${handle},slug_aliases.cs.{${handle}}`);
  if (exceptId) q = q.neq("id", exceptId);
  const { data } = await q.limit(1);
  return (data ?? []).length > 0;
}

/**
 * Admin rename of a referral link (Oct 2026). The old handle moves into
 * slug_aliases so printed links keep working; the referral CODE never
 * changes, so attribution of past and future sign-ups is unaffected.
 */
export async function renameReferralHandle(
  id: string,
  rawHandle: string,
): Promise<{ ok: true; slug: string; aliases: string[] } | { ok: false; error: string }> {
  const handle = (rawHandle || "").trim().toLowerCase().replace(/^\/+|\/+$/g, "");
  if (!HANDLE_RE.test(handle) || handle.includes("--")) {
    return { ok: false, error: "Use 3 to 40 lowercase letters, numbers or single hyphens, starting and ending with a letter or number." };
  }
  if (RESERVED_HANDLES.has(handle)) return { ok: false, error: `"${handle}" is a page on the site already. Pick another.` };

  const { data: row, error } = await db().from("referral_codes").select("id, slug, slug_aliases").eq("id", id).maybeSingle();
  if (error || !row) return { ok: false, error: "Referral link not found." };
  const current = ((row as { slug: string | null }).slug ?? "").toLowerCase();
  const aliases: string[] = ((row as { slug_aliases: string[] | null }).slug_aliases ?? []).map((a) => a.toLowerCase());
  if (handle === current) return { ok: true, slug: current, aliases };
  if (await handleTaken(handle, id)) return { ok: false, error: "That link is already used by someone else." };

  const nextAliases = Array.from(new Set([...aliases, ...(current ? [current] : [])])).filter((a) => a !== handle);
  const { error: upErr } = await db().from("referral_codes").update({ slug: handle, slug_aliases: nextAliases }).eq("id", id);
  if (upErr) return { ok: false, error: /duplicate|unique/i.test(upErr.message) ? "That link is already used by someone else." : "Could not save the link." };
  return { ok: true, slug: handle, aliases: nextAliases };
}

/**
 * Generate a short, human-readable referral code (e.g. "GARY7K3"). Avoids
 * easily-confused characters (0/O/1/I). 6 chars by default.
 */
export function generateReferralCode(prefix: string, length = 4): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < length; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const clean = prefix.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "DMN";
  return `${clean}${suffix}`;
}

/**
 * Turn an owner's display name into a vanity handle for the shareable link
 * dentalmembernetwork.com/<handle>.
 *
 *   "Dr. Parul Dua Makkar" -> "drparul"
 *   "The Phillips Group"    -> "phillipsgroup"
 *   "Callie Ward"           -> "callieward"
 *
 * Keeps it name-based and short: drops leading articles (the/a/an) but NOT
 * titles (so "Dr Parul" stays "drparul"), takes the first two meaningful
 * words, lowercases, strips to [a-z0-9], caps length. Returns "" if nothing
 * usable is left (caller falls back to the code).
 */
export function slugifyHandle(name: string): string {
  const words = (name || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  while (words.length > 1 && ["the", "a", "an"].includes(words[0])) words.shift();
  let handle = words.slice(0, 2).join("");
  // If two words were too short (e.g. initials), pull in a third.
  if (handle.length < 4 && words.length > 2) handle = words.slice(0, 3).join("");
  return handle.slice(0, 20);
}

const HANDLE_SUFFIX_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
function randomHandleSuffix(len = 3): string {
  let s = "";
  for (let i = 0; i < len; i += 1) s += HANDLE_SUFFIX_ALPHABET[Math.floor(Math.random() * HANDLE_SUFFIX_ALPHABET.length)];
  return s;
}

/**
 * Find a free vanity handle derived from `name`, avoiding case-insensitive
 * collisions with existing handles. Falls back to `<base>-<suffix>` when the
 * clean handle is taken, and to the code-derived handle if the name yields
 * nothing usable.
 */
async function allocateHandle(name: string, fallbackCode: string): Promise<string> {
  const admin = getSupabaseAdmin();
  const base = slugifyHandle(name) || fallbackCode.toLowerCase();
  void admin;
  const taken = async (h: string) => RESERVED_HANDLES.has(h) || (await handleTaken(h));
  if (!(await taken(base))) return base;
  for (let i = 0; i < 8; i += 1) {
    const candidate = `${base}-${randomHandleSuffix(i < 4 ? 2 : 3)}`;
    if (!(await taken(candidate))) return candidate;
  }
  // Extremely unlikely — last resort keeps it unique via the code.
  return `${base}-${fallbackCode.toLowerCase()}`;
}

/**
 * Ensure (or create) a referral code + vanity handle for an expert.
 * Idempotent. Backfills the handle on legacy rows that predate it.
 */
export async function getOrCreateExpertReferral(
  expertId: string,
  displayName: string,
): Promise<{ code: string; slug: string }> {
  return getOrCreateReferral("expert_id", expertId, displayName);
}

/** Same as the expert helper, scoped to a vendor (partner). */
export async function getOrCreateVendorReferral(
  vendorId: string,
  displayName: string,
): Promise<{ code: string; slug: string }> {
  return getOrCreateReferral("vendor_id", vendorId, displayName);
}

async function getOrCreateReferral(
  ownerCol: "expert_id" | "vendor_id",
  ownerId: string,
  displayName: string,
): Promise<{ code: string; slug: string }> {
  const admin = getSupabaseAdmin();
  const { data: existing } = await admin
    .from("referral_codes")
    .select("id, code, slug")
    .eq(ownerCol, ownerId)
    .maybeSingle();

  if (existing) {
    if (existing.slug) return { code: existing.code, slug: existing.slug };
    // Legacy row without a handle — backfill one now.
    const slug = await allocateHandle(displayName, existing.code);
    await admin.from("referral_codes").update({ slug }).eq("id", existing.id);
    return { code: existing.code, slug };
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateReferralCode(displayName);
    const slug = await allocateHandle(displayName, code);
    const { error } =
      ownerCol === "expert_id"
        ? await admin.from("referral_codes").insert({ expert_id: ownerId, code, slug })
        : await admin.from("referral_codes").insert({ vendor_id: ownerId, code, slug });
    if (!error) return { code, slug };
  }
  throw new Error("Could not allocate a unique referral code");
}

/**
 * Look up a referral code's row id by string. Returns null when invalid.
 * Used by the member-signup route to stamp the referral on the new row.
 */
export async function resolveReferralCode(code: string | null | undefined): Promise<string | null> {
  if (!code) return null;
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("referral_codes")
    .select("id, active")
    .eq("code", trimmed)
    .maybeSingle();
  if (!data || !data.active) return null;
  return data.id;
}

/**
 * Resolve a vanity handle (e.g. "drparul") to its referral code, for the
 * root-level /<handle> redirect. Case-insensitive. Returns null when the
 * handle is unknown or its code is inactive.
 */
export async function resolveReferralSlug(slug: string | null | undefined): Promise<{ code: string } | null> {
  if (!slug) return null;
  const trimmed = slug.trim();
  if (!trimmed || !/^[a-zA-Z0-9-]{2,40}$/.test(trimmed)) return null;
  const handle = trimmed.toLowerCase();
  const { data: rows } = await db()
    .from("referral_codes")
    .select("code, active, slug")
    .or(`slug.ilike.${handle},slug_aliases.cs.{${handle}}`)
    .limit(2);
  // Current handle wins over an old one if both somehow exist.
  const list = (rows ?? []) as { code: string; active: boolean; slug: string | null }[];
  const data = list.find((r) => (r.slug ?? "").toLowerCase() === handle) ?? list[0];
  if (!data || !data.active) return null;
  return { code: data.code };
}
