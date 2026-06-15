import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/resources/upload-url
 *
 * Returns a one-time signed upload URL that the browser can PUT to directly,
 * bypassing the Vercel 4.5MB body limit on our own routes. We never see the
 * file bytes — the browser uploads them straight to Supabase Storage.
 *
 * Body:
 *   {
 *     bucket: "member-resources" | "kit-thumbnails",
 *     path: "<slug>/<filename>"  // path within the bucket
 *   }
 *
 * Response:
 *   {
 *     signedUrl: "...",      // PUT here from the browser
 *     token: "...",          // already embedded in signedUrl, returned for completeness
 *     publicUrl: "..."       // the final public URL once upload completes
 *   }
 */
const ALLOWED_BUCKETS = new Set(["member-resources", "kit-thumbnails"]);

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as {
    bucket?: string;
    path?: string;
  };

  if (!body.bucket || !ALLOWED_BUCKETS.has(body.bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }
  if (!body.path || typeof body.path !== "string" || body.path.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // Signed UPLOAD URL — short-lived (default ~2h), valid for a single PUT.
  // upsert: true lets us re-upload the same path if the admin retries.
  const { data, error } = await sb.storage
    .from(body.bucket)
    .createSignedUploadUrl(body.path, { upsert: true });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create signed URL" },
      { status: 500 },
    );
  }

  // Public URL for after the upload (works because both buckets are public).
  const { data: pub } = sb.storage.from(body.bucket).getPublicUrl(body.path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    publicUrl: pub.publicUrl,
  });
}
