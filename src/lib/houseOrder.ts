import "server-only";

/**
 * House-first ordering for the expert / partner rosters.
 *
 * Gary and Naren (and their companies) anchor DMN — they lead every
 * directory, member-portal list first, then everyone else alphabetically.
 * Matched by display name so no schema change is needed; update here if
 * their display names ever change.
 */

const HOUSE_EXPERTS = ["Gary Takacs", "Naren Arulrajah"];
const HOUSE_PARTNERS = ["Thriving Dentist Inc.", "Ekwa Marketing Inc."];

function priority(name: string | null | undefined, list: string[]): number {
  const i = list.indexOf((name ?? "").trim());
  return i === -1 ? list.length : i;
}

/** Sort experts house-first, then A→Z. `name` = display/full name. */
export function sortExpertsHouseFirst<T>(rows: T[], name: (r: T) => string | null | undefined): T[] {
  return [...rows].sort((a, b) => {
    const pa = priority(name(a), HOUSE_EXPERTS);
    const pb = priority(name(b), HOUSE_EXPERTS);
    if (pa !== pb) return pa - pb;
    return (name(a) ?? "").localeCompare(name(b) ?? "");
  });
}

/** Sort partners house-first, then A→Z. `name` = display/company name. */
export function sortPartnersHouseFirst<T>(rows: T[], name: (r: T) => string | null | undefined): T[] {
  return [...rows].sort((a, b) => {
    const pa = priority(name(a), HOUSE_PARTNERS);
    const pb = priority(name(b), HOUSE_PARTNERS);
    if (pa !== pb) return pa - pb;
    return (name(a) ?? "").localeCompare(name(b) ?? "");
  });
}
