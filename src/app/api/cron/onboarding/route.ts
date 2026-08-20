import { NextResponse } from "next/server";
import { processOnboardingQueue, processTrialReminders } from "@/lib/onboarding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * GET /api/cron/onboarding
 *
 * Hourly Vercel Cron (vercel.json). Advances every member through the
 * onboarding sequence: day-3 AI kit email, day-7 hotline, day-14
 * feedback — anchored to each member's Day 0 send. Idempotent: a unique
 * (member_id, kind) index makes double-sends impossible, so overlapping
 * or manual runs are safe.
 *
 * Auth: Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically
 * when the CRON_SECRET env var exists. In production the secret is
 * REQUIRED; locally (no secret set) the route runs open for testing.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret) {
      return NextResponse.json({ error: "CRON_SECRET not configured." }, { status: 503 });
    }
    if (req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const result = await processOnboardingQueue();
  const trialReminders = await processTrialReminders();
  return NextResponse.json({ ok: true, ...result, trialReminders });
}
