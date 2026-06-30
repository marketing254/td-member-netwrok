import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireVendor } from "@/lib/auth/guards";
import { apiError, serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/**
 * PATCH /api/vendor/profile/avatar
 *
 * multipart/form-data:
 *   avatar       image (optional)
 *   display_name string (optional)
 *
 * Vendor's contact avatar — separate from logo_url (the company logo on
 * the partner directory).
 */
export async function PATCH(req: Request) {
  const guard = await requireVendor();
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return apiError.badRequest();
  }

  const displayName = (form.get("display_name") as string | null)?.trim();
  const file = form.get("avatar");
  const patch: Record<string, string | null> = {};
  if (typeof displayName === "string") patch.display_name = displayName;

  const admin = getSupabaseAdmin();

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_AVATAR_BYTES) return apiError.validation("Avatar too large (max 5 MB).");
    if (!file.type.startsWith("image/")) return apiError.validation("Avatar must be an image.");
    const ext = file.name.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase() ?? "png";
    const storagePath = `vendors/${guard.vendorId}/${randomUUID()}.${ext}`;
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await admin.storage
        .from(AVATAR_BUCKET)
        .upload(storagePath, buf, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = admin.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);
      patch.avatar_url = data?.publicUrl ?? null;
    } catch (err) {
      return serverError(err, { route: "PATCH /api/vendor/profile/avatar" });
    }
  }

  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true });
  try {
    const { error } = await admin.from("vendors").update(patch as never).eq("id", guard.vendorId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, { route: "PATCH /api/vendor/profile/avatar" });
  }
}
