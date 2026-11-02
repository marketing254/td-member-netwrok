import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

type Client = SupabaseClient<Database>;

/**
 * Which expert does the signed-in person act for? The owner (row whose
 * email is the signed-in email) first; otherwise a team seat (0079) that
 * names this email. Returns the expert id plus whether this is a seat, so
 * the portal can keep billing and the agreement owner-only.
 */
export async function resolveCurrentExpert(
  supabase: Client,
): Promise<{ expertId: string; isSeat: boolean; email: string } | null> {
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email?.toLowerCase();
  if (!email) return null;

  const own = await supabase.from("experts").select("id").eq("email", email).maybeSingle();
  if (own.data?.id) return { expertId: own.data.id, isSeat: false, email };

  const seat = await supabase
    .from("portal_seats")
    .select("expert_id")
    .eq("email", email)
    .not("expert_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (seat.data?.expert_id) return { expertId: seat.data.expert_id, isSeat: true, email };
  return null;
}
