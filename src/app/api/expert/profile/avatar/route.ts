import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireExpert } from "@/lib/auth/guards";
import { apiError, serverError } from "@/lib/api/errorResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/**
 * PATCH /api/expert/profile/avatar
 *
 * multipart/form-data:
 *   avatar     image (optional)
 *   display_name string (optional)
 *
 * Updates whichever fields are present. avatar_url separate from
 * headshot_url (the public-facing big headshot stays untouched).
 */
export async function PATCH(req: Request) {
  const guard = await requireExpert();
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
    const storagePath = `experts/${guard.expertId}/${randomUUID()}.${ext}`;
    try {
      const buf = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await admin.storage
        .from(AVATAR_BUCKET)
        .upload(storagePath, buf, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = admin.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);
      patch.avatar_url = data?.publicUrl ?? null;
    } catch (err) {
      return serverError(err, { route: "PATCH /api/expert/profile/avatar" });
    }
  }

  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true });
  try {
    const { error } = await admin.from("experts").update(patch as never).eq("id", guard.expertId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err, { route: "PATCH /api/expert/profile/avatar" });
  }
}
