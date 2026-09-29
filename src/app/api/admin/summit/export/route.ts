import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";
import { eventsDb, SUMMIT_EVENTS, SUMMIT_SEPT, type EventRegistrationRow } from "@/lib/events/summit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/summit/export?event=<eventId>
 *
 * The list export Lester asked for (email 1, 29 Sep 2026): everyone who
 * registered for the September event through us and did NOT finish
 * joining, as a CSV with first name, email and campaign, plus a flag for
 * anyone already in the automated abandoned sequence so nobody gets both.
 *
 * "Did not finish" = an event_registrations row still in pending_payment
 * whose email has no active or trialing member. "In the automated
 * sequence" = an open pending_registrations row (stopped_at is null).
 * Downloads only; nothing is written.
 */
function csvEscape(v: string | null | undefined): string {
  return `"${(v ?? "").replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const route = "GET /api/admin/summit/export";
  const wanted = new URL(req.url).searchParams.get("event");
  const event = SUMMIT_EVENTS.find((e) => e.eventId === wanted) ?? SUMMIT_SEPT;
  try {
    const sb = eventsDb();
    const { data, error } = await sb
      .from("event_registrations")
      .select("*")
      .eq("event_id", event.eventId)
      .eq("status", "pending_payment")
      .order("created_at", { ascending: true })
      .limit(5000);
    if (error) throw error;
    const regs = (data ?? []) as EventRegistrationRow[];
    const emails = Array.from(new Set(regs.map((r) => r.email.toLowerCase())));

    // Anyone who became a member since (through any door) is not "unfinished".
    const members = emails.length
      ? await sb.from("members").select("email, subscription_status, status").in("email", emails)
      : { data: [] as { email: string; subscription_status: string | null; status: string | null }[] };
    const joined = new Set(
      (members.data ?? [])
        .filter((m) => m.subscription_status === "active" || m.subscription_status === "trialing")
        .map((m) => (m.email ?? "").toLowerCase()),
    );

    // Open rows in the automated abandoned sequence.
    const pending = emails.length
      ? await sb.from("pending_registrations").select("email, stopped_at, captured_at").in("email", emails)
      : { data: [] as { email: string; stopped_at: string | null; captured_at: string }[] };
    const inSequence = new Set(
      (pending.data ?? []).filter((p) => !p.stopped_at).map((p) => (p.email ?? "").toLowerCase()),
    );

    const seen = new Set<string>();
    const lines: string[] = [];
    for (const r of regs) {
      const email = r.email.toLowerCase();
      if (seen.has(email) || joined.has(email)) continue;
      seen.add(email);
      const utm = (r.utm ?? {}) as Record<string, string>;
      lines.push(
        [
          r.first_name,
          r.last_name,
          r.email,
          utm.campaign ?? event.campaign,
          utm.source ?? "",
          utm.content ?? "",
          r.practice_website_name,
          r.created_at,
          inSequence.has(email) ? "yes" : "no",
        ]
          .map(csvEscape)
          .join(","),
      );
    }
    const head = ["First name", "Last name", "Email", "Campaign", "utm_source", "utm_content", "Practice", "Registered at", "In automated abandoned sequence"].join(",");
    const csv = [head, ...lines].join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rida-unfinished-${event.eventId}-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return serverError(err, { route });
  }
}
