import { redirect } from "next/navigation";

/**
 * /summit — the September ad page's old address. The live offer page is
 * /rida (spec v2, 29 Sep 2026). Query parameters (utm_*, fbclid) are
 * carried across so campaign attribution survives old links.
 * /summit/confirmed stays where it is: it is the Stripe return URL.
 */
export const dynamic = "force-dynamic";

export default async function SummitRedirect({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") qs.set(k, v);
  }
  const suffix = qs.toString();
  redirect(suffix ? `/rida?${suffix}` : "/rida");
}
