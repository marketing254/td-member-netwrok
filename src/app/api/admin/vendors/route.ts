import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { sendVendorApprovalEmail } from "@/lib/waitlist/confirmationEmail";
import type { VendorStatus } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const simple = url.searchParams.get("simple") === "1";

  try {
    const supabase = getSupabaseAdmin();
    if (simple) {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, company_name, display_name, status")
        .eq("status", "approved")
        .order("display_name", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return NextResponse.json({ vendors: data ?? [] });
    }
    const { data, error } = await supabase
      .from("vendors")
      .select(
        "id, company_name, display_name, category, contact_name, contact_email, plan_id, status, verified, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return NextResponse.json({ rows: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type Action = "approve" | "reject" | "suspend" | "unsuspend";

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: { id?: string; action?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const allowed: Action[] = ["approve", "reject", "suspend", "unsuspend"];
  if (!body.id || !body.action || !allowed.includes(body.action as Action)) {
    return NextResponse.json(
      { error: "id and a valid action are required." },
      { status: 400 },
    );
  }
  const action = body.action as Action;

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing, error: readErr } = await supabase
      .from("vendors")
      .select("id, company_name, contact_name, contact_email, status, verified")
      .eq("id", body.id)
      .maybeSingle();
    if (readErr) throw readErr;
    if (!existing) {
      return NextResponse.json({ error: "Vendor not found." }, { status: 404 });
    }

    const patch: { status: VendorStatus; verified?: boolean } = (() => {
      if (action === "approve") return { status: "approved", verified: true };
      if (action === "reject") return { status: "rejected", verified: false };
      if (action === "suspend") return { status: "suspended" };
      return { status: "approved" };
    })();

    const { error: upErr } = await supabase
      .from("vendors")
      .update(patch)
      .eq("id", body.id);
    if (upErr) throw upErr;

    // Best-effort: log the action + send the approval email.
    await supabase.from("review_actions").insert({
      target_type: "vendor",
      target_id: body.id,
      action,
      note: body.note ?? null,
      admin_id: guard.adminId,
    });

    if (action === "approve" && existing.status !== "approved") {
      const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://dentalmembernetwork.com";
      try {
        await sendVendorApprovalEmail({
          email: existing.contact_email,
          contactName: existing.contact_name,
          companyName: existing.company_name,
          portalUrl: `${origin.replace(/\/$/, "")}/vendor`,
        });
      } catch (mailErr) {
        console.warn("[admin/vendors] approval email failed:", mailErr);
      }
      await supabase.from("email_events").insert({
        template: "vendor_approved",
        recipient: existing.contact_email,
        subject: `You're verified — ${existing.company_name} is live on the network`,
        provider: process.env.GMAIL_USER ? "gmail" : process.env.RESEND_API_KEY ? "resend" : "log",
        status: "queued",
        metadata: { vendor_id: body.id },
      });

      // In-app notifications: vendor + admin team
      await supabase.from("notifications").insert([
        {
          audience: "vendor",
          vendor_id: body.id,
          kind: "vendor_approved",
          title: "You're verified — welcome aboard",
          body: `${existing.company_name} is approved. You can now publish catalog items, offers, and member discounts.`,
          link: "/vendor",
          metadata: { vendor_id: body.id },
        },
        {
          audience: "admin",
          admin_id: null,
          kind: "vendor_approved",
          title: `Vendor approved: ${existing.company_name}`,
          body: `${existing.contact_name} is now verified and can publish.`,
          link: "/admin/vendors?filter=approved",
          metadata: { vendor_id: body.id },
        },
      ]);
    } else if (action === "reject") {
      await supabase.from("notifications").insert({
        audience: "admin",
        admin_id: null,
        kind: "vendor_rejected",
        title: `Vendor rejected: ${existing.company_name}`,
        body: body.note ?? null,
        link: "/admin/vendors?filter=rejected",
        metadata: { vendor_id: body.id },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
