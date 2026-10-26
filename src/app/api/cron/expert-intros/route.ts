import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendExpertIntroReport, type ExpertIntroRow } from "@/lib/email/expertIntroReport";
import { EXPERT_INTROS_ENABLED, EXPERT_INTROS_REPORT_TO } from "@/lib/expertIntros";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/expert-intros — daily (vercel.json, 13:00 UTC).
 *
 * Emails Lester the members who ticked "introduce me to experts" since the
 * last run: one email, table + CSV attachment, then stamps those rows so
 * they are never reported twice. Sends nothing when there is nobody new.
 *
 * Auth: Vercel sends `Authorization: Bearer ${CRON_SECRET}`; required in
 * production, open locally for testing (same pattern as /api/cron/onboarding).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 503 });
    if (req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  // Switched off until Lester confirms the privacy wording is live. Also
  // keeps the cron quiet before migration 0076 has run.
  if (!EXPERT_INTROS_ENABLED) return NextResponse.json({ sent: 0, disabled: true });

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("members")
    .select("id, first_name, last_name, practice_name, email, phone, expert_intro_help_area, biggest_challenge, expert_intro_opt_in_at")
    .eq("expert_intro_opt_in", true)
    .is("expert_intro_notified_at", null)
    .order("expert_intro_opt_in_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const members = data ?? [];
  if (members.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const rows: ExpertIntroRow[] = members.map((m) => ({
    name: [m.first_name, m.last_name].filter(Boolean).join(" "),
    practice: m.practice_name ?? "",
    email: m.email,
    phone: m.phone ?? "",
    helpArea: m.expert_intro_help_area ?? m.biggest_challenge ?? "",
    chosenAt: m.expert_intro_opt_in_at ?? new Date().toISOString(),
  }));
  const reportDate = new Date().toISOString().slice(0, 10);
  const sent = await sendExpertIntroReport(rows, reportDate);
  if (!sent) {
    // Leave the rows unstamped so tomorrow's run picks them up again.
    return NextResponse.json({ ok: false, sent: 0, pending: rows.length, error: "Report email failed; rows left for the next run." }, { status: 502 });
  }

  const now = new Date().toISOString();
  const { error: stampErr } = await sb
    .from("members")
    .update({ expert_intro_notified_at: now })
    .in("id", members.map((m) => m.id));
  if (stampErr) return NextResponse.json({ ok: false, sent: rows.length, error: stampErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, sent: rows.length, to: EXPERT_INTROS_REPORT_TO });
}
