"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { TourPortal } from "@/lib/portalTour";

/**
 * Drives the portal tour pop-up (Lester, 8 Oct 2026).
 *
 * Opens once per account: when the signed-in expert / partner row has no
 * tour_seen_at (migration 0072). Closing it stamps the flag through the
 * portal's tour-seen route. The flag is read best-effort, so if the column
 * is missing the pop-up simply does not auto-open and the sidebar link
 * still works.
 */
export function usePortalTour(portal: TourPortal, accountId: string | null | undefined) {
  const [open, setOpen] = useState(false);
  const [autoShown, setAutoShown] = useState(false);

  useEffect(() => {
    if (!accountId || autoShown) return;
    let active = true;
    (async () => {
      try {
        const supabase = createBrowserSupabase();
        const table = portal === "expert" ? "experts" : "vendors";
        const { data, error } = await supabase.from(table).select("tour_seen_at").eq("id", accountId).maybeSingle();
        if (!active || error || !data) return;
        if ((data as { tour_seen_at?: string | null }).tour_seen_at == null) {
          setAutoShown(true);
          setOpen(true);
        }
      } catch {
        /* never block the portal */
      }
    })();
    return () => {
      active = false;
    };
  }, [portal, accountId, autoShown]);

  const show = useCallback(() => setOpen(true), []);
  const close = useCallback(() => {
    setOpen(false);
    void fetch(portal === "expert" ? "/api/expert/tour-seen" : "/api/vendor/tour-seen", { method: "POST" }).catch(() => undefined);
  }, [portal]);

  return { open, show, close };
}
