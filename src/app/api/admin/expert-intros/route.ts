import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";
import { expertIntroCsv, type ExpertIntroRow } from "@/lib/email/expertIntroReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/expert-intros — CSV of EVERY member who currently has
 * "introduce me to experts" switched on (not just the ones the daily
 * report has not sent yet). Admin only. Same columns as the daily email.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const route = "GET /api/admin/expert-intros";
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("members")
      .select("first_name, last_name, practice_name, email, phone, expert_intro_help_area, biggest_challenge, expert_intro_opt_in_at")
      .eq("expert_intro_opt_in", true)
      .order("expert_intro_opt_in_at", { ascending: false });
    if (error) throw error;
    const rows: ExpertIntroRow[] = (data ?? []).map((m) => ({
      name: [m.first_name, m.last_name].filter(Boolean).join(" "),
      practice: m.practice_name ?? "",
      email: m.email,
      phone: m.phone ?? "",
      helpArea: m.expert_intro_help_area ?? m.biggest_challenge ?? "",
      chosenAt: m.expert_intro_opt_in_at ?? "",
    }));
    const today = new Date().toISOString().slice(0, 10);
    return new NextResponse(expertIntroCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expert-introductions-${today}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return serverError(err, { route });
  }
}
