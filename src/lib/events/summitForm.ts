/**
 * RIDA sign-up form: the two quick questions (Amani via Lester, 13 Oct 2026).
 * Shared by the page, the API routes, the sheet row and the exports. Safe to
 * import from client components.
 */

export const JOB_TITLES = [
  { value: "practice_owner", label: "Practice owner or dentist" },
  { value: "office_manager", label: "Office manager" },
  { value: "team_member", label: "Team member" },
  { value: "other", label: "Other" },
] as const;

export type JobTitle = (typeof JOB_TITLES)[number]["value"];

export function isJobTitle(v: unknown): v is JobTitle {
  return typeof v === "string" && JOB_TITLES.some((j) => j.value === v);
}

export function jobTitleLabel(v: string | null | undefined): string {
  return JOB_TITLES.find((j) => j.value === v)?.label ?? "";
}

/**
 * Country dropdown (Lester, 13 Oct 2026): five options only. Stored as the
 * ISO code, with "OTHER" for the last one. Pre-selected from the visitor's
 * location: one of the four when it matches, "Other" when the location is
 * known but not one of them, United States when it cannot tell.
 */
export const COUNTRIES = [
  { code: "US", name: "USA" },
  { code: "GB", name: "UK" },
  { code: "CA", name: "Canada" },
  { code: "NZ", name: "New Zealand" },
  { code: "OTHER", name: "Other" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export function isCountryCode(v: unknown): v is CountryCode {
  return typeof v === "string" && COUNTRIES.some((c) => c.code === v.toUpperCase());
}

/** "USA" for "US", "" for unknown. */
export function countryName(code: string | null | undefined): string {
  if (!code) return "";
  return COUNTRIES.find((c) => c.code === code.toUpperCase())?.name ?? "";
}

export function countryOptions(): { code: string; name: string }[] {
  return COUNTRIES.map((c) => ({ code: c.code, name: c.name }));
}

/** Map a two-letter geo code to a dropdown value. */
export function countryFromGeo(geo: string | null | undefined): CountryCode {
  const g = (geo ?? "").toUpperCase();
  if (!g) return "US";
  if (g === "US" || g === "GB" || g === "CA" || g === "NZ") return g;
  return "OTHER";
}
