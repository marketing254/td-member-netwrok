import { NextResponse } from "next/server";
import { requireMemberOrAdminPreview } from "@/lib/auth/guards";
import { serverError } from "@/lib/api/errorResponse";
import { loadEventBySlug } from "@/lib/events/portalEventsServer";
import { buildIcs } from "@/lib/events/portalEvents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/member/events/<slug>/ics — the "Apple" (and any other app)
 * calendar file for one event. Times are UTC in the file, so every
 * calendar shows them in the member's own zone.
 */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const guard = await requireMemberOrAdminPreview();
  if (!guard.ok) return guard.response;
  const { slug } = await ctx.params;
  try {
    const event = await loadEventBySlug(slug);
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    const origin = new URL(req.url).origin;
    const body = buildIcs(event, origin);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return serverError(err, { route: "GET /api/member/events/[slug]/ics" });
  }
}
