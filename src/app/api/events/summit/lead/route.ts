import { NextResponse } from "next/server";
import { SUMMIT, eventsDb, summitOpen } from "@/lib/events/summit";
import { isCountryCode, isJobTitle } from "@/lib/events/summitForm";
import { apiError, serverError } from "@/lib/api/errorResponse";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Save the lead the moment name and email are entered (Lester, 13 Oct 2026),
 * before the "two quick questions" and before the card. Creates the
 * event_registrations row as pending_payment, or fills in job title and
 * country on an existing pending row. Never touches a row that has moved
 * past pending, so nobody can overwrite a registered person's details.
 *
 * Also the entry point for Facebook lead forms: n8n posts the same body
 * with header `x-summit-secret: <SUMMIT_SHEET_SECRET>` and utm.source
 * "facebook". Those calls skip the per-IP rate limit.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const route = "POST /api/events/summit/lead";
  if (!summitOpen()) return NextResponse.json({ error: "Registration for this summit has closed." }, { status: 410 });

  const secret = process.env.SUMMIT_SHEET_SECRET;
  const trusted = !!secret && req.headers.get("x-summit-secret") === secret;
  if (!trusted) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = checkRateLimit(`summit-lead:${ip}`);
    if (!rl.allowed) return apiError.rateLimited(route);
  }

  let b: Record<string, unknown>;
  try {
    b = (await req.json()) as Record<string, unknown>;
  } catch {
    return apiError.badRequest();
  }

  const firstName = str(b.firstName, 80);
  const lastName = str(b.lastName, 80);
  const email = str(b.email, 254).toLowerCase();
  if (!firstName) return apiError.validation("Please enter your first name.", route);
  if (!lastName) return apiError.validation("Please enter your last name.", route);
  if (!EMAIL_RE.test(email)) return apiError.validation("Please enter a valid email address.", route);

  const jobTitle = isJobTitle(b.jobTitle) ? b.jobTitle : null;
  const country = isCountryCode(b.country) ? (b.country as string).toUpperCase() : null;
  const rawUtm = (b.utm && typeof b.utm === "object" ? b.utm : {}) as Record<string, unknown>;
  const utm: Record<string, string> = {};
  for (const k of ["source", "medium", "campaign", "content", "term"] as const) {
    const v = str(rawUtm[k], 200);
    if (v) utm[k] = v;
  }
  if (!utm.campaign) utm.campaign = SUMMIT.campaign;
  const landingUrl = str(b.landingUrl, 400) || null;

  try {
    const ev = eventsDb();
    const { data: existing } = await ev
      .from("event_registrations")
      .select("id, status")
      .eq("event_id", SUMMIT.eventId)
      .eq("email", email)
      .maybeSingle();

    if (existing && (existing as { status: string }).status !== "pending_payment") {
      // Already registered: nothing to save, and no hint to the browser beyond ok.
      return NextResponse.json({ ok: true, saved: false });
    }
    if (existing) {
      const patch: Record<string, unknown> = { first_name: firstName, last_name: lastName };
      if (jobTitle) patch.job_title = jobTitle;
      if (country) patch.country = country;
      const { error } = await ev.from("event_registrations").update(patch).eq("id", (existing as { id: string }).id).eq("status", "pending_payment");
      if (error) throw error;
      return NextResponse.json({ ok: true, saved: true });
    }
    const { error } = await ev.from("event_registrations").insert({
      event_id: SUMMIT.eventId,
      email,
      first_name: firstName,
      last_name: lastName,
      job_title: jobTitle,
      country,
      utm,
      landing_url: landingUrl,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, saved: true });
  } catch (err) {
    return serverError(err, { route });
  }
}
