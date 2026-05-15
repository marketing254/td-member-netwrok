import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { validateWaitlist } from "@/lib/waitlist/validate";
import { checkRateLimit } from "@/lib/waitlist/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TESTING MODE
// While Rushdha is reviewing the thank-you page, the form submits without
// hitting Supabase. Flip this to `false` (or remove the constant) once the
// Supabase env vars are wired in production.
const MOCK_MODE = true;

// In-memory counter for the mock mode. Starts at zero so the hero badge
// reflects an honest "0 on the list" until someone actually submits the form,
// and ticks up by 1 per submission. Resets when the dev server restarts.
type MockCounts = { total: number; members: number; vendors: number; experts: number; last_24h: number };
const mockCounts: MockCounts = { total: 0, members: 0, vendors: 0, experts: 0, last_24h: 0 };

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "td-waitlist-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const result = validateWaitlist(json);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, field: result.field }, { status: 400 });
  }

  const ip = clientIp(req);
  const rl = checkRateLimit(`${ip}:${result.data.email}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec ?? 60) } },
    );
  }

  // Mock path — log to server console, increment the in-memory counter, then
  // pretend the row was inserted. Used to preview the thank-you flow without DB.
  if (MOCK_MODE) {
    console.log("[waitlist:mock] signup", {
      role: result.data.role,
      email: result.data.email,
      fullName: result.data.fullName,
      practiceName: result.data.practiceName,
      utm: result.data.utm,
    });
    mockCounts.total += 1;
    mockCounts.last_24h += 1;
    if (result.data.role === "member") mockCounts.members += 1;
    if (result.data.role === "vendor") mockCounts.vendors += 1;
    if (result.data.role === "expert") mockCounts.experts += 1;
    return NextResponse.json({
      ok: true,
      id: "mock-" + Math.random().toString(36).slice(2, 10),
      role: result.data.role,
      createdAt: new Date().toISOString(),
      mock: true,
    });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    console.error("[waitlist] supabase not configured:", err);
    return NextResponse.json(
      { error: "Waitlist temporarily unavailable. Try again shortly." },
      { status: 503 },
    );
  }

  const payload = {
    role: result.data.role,
    email: result.data.email,
    full_name: result.data.fullName,
    practice_name: result.data.practiceName ?? null,
    phone: result.data.phone ?? null,
    city_state: result.data.cityState ?? null,
    message: result.data.message ?? null,
    source: result.data.source ?? "landing",
    utm: result.data.utm ?? null,
    ip_hash: hashIp(ip),
    user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
  };

  const { data, error } = await supabase
    .from("waitlist_signups")
    .insert(payload)
    .select("id, role, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          ok: true,
          duplicate: true,
          message: "You are already on the list. We will be in touch as soon as we open the doors.",
        },
        { status: 200 },
      );
    }
    console.error("[waitlist] insert failed:", error);
    return NextResponse.json(
      { error: "Could not save your spot. Please try again or email hello@thrivingdentist.com." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: data.id, role: data.role, createdAt: data.created_at });
}

export async function GET() {
  if (MOCK_MODE) {
    // Counter starts at 0 and only goes up when someone actually submits the form.
    return NextResponse.json(
      { ...mockCounts, mock: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("waitlist_counts")
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[waitlist] count read failed:", err);
    return NextResponse.json(
      { total: 0, members: 0, vendors: 0, experts: 0, last_24h: 0 },
      { status: 200 },
    );
  }
}
