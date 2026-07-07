import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
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

/**
 * POST /api/admin/vendors — admin invites a partner (mirrors the
 * admin add-expert flow).
 *
 * Lester recruits a partner personally, then adds them here. This:
 *   1. Upserts a `vendors` row (status `approved` — they're pre-vetted).
 *   2. Pre-creates the Supabase auth user for their email so they can
 *      sign in (shouldCreateUser:false on /vendor/login means only
 *      known emails can request a magic link).
 *   3. Sends the magic-link sign-in email so they log in with the exact
 *      email the admin added them under.
 *
 * They then land in the portal, hit the billing gate (no subscription
 * yet), and complete the same agree-and-pay step every partner does —
 * the invite doesn't change the payment path, it just skips the public
 * application form.
 */
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: {
    company_name?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    secondary_email?: string;
    secondary_phone?: string;
    signature_name?: string;
    signature_title?: string;
    category?: string;
    website?: string;
    description?: string;
    member_offer?: string;
    calendar_link?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const companyName = (body.company_name ?? "").trim();
  const contactName = (body.contact_name ?? "").trim();
  const email = (body.contact_email ?? "").trim().toLowerCase();
  if (!companyName || !contactName || !email) {
    return NextResponse.json(
      { error: "company_name, contact_name and contact_email are required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const secondaryEmail = body.secondary_email?.trim().toLowerCase() || null;
  const secondaryPhone = body.secondary_phone?.trim() || null;
  const signatureName = body.signature_name?.trim() || contactName;
  const signatureTitle = body.signature_title?.trim() || null;
  const contactPhone = body.contact_phone?.trim() || null;
  const category = body.category?.trim() || null;
  const website = body.website?.trim() || null;
  const description = body.description?.trim() || null;
  const calendarLink = body.calendar_link?.trim() || null;

  try {
    const supabase = getSupabaseAdmin();

    // Upsert vendors row by contact_email — safe to re-run for the same
    // partner. Invited partners are pre-vetted, so status = approved.
    const { data: existing } = await supabase
      .from("vendors")
      .select("id, status")
      .eq("contact_email", email)
      .maybeSingle();

    let vendorId: string;
    const vendorPatch = {
      company_name: companyName,
      display_name: companyName,
      contact_name: contactName,
      contact_email: email,
      contact_phone: contactPhone,
      category,
      website,
      description,
      calendar_link: calendarLink,
      billing_email: email,
      plan_id: "founding",
      status: "approved" as VendorStatus,
      verified: true,
    };
    if (existing) {
      vendorId = existing.id;
      const { error: upErr } = await supabase
        .from("vendors")
        .update(vendorPatch as never)
        .eq("id", vendorId);
      if (upErr) throw upErr;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("vendors")
        .insert({ ...vendorPatch, months_in_program: 0 } as never)
        .select("id")
        .single();
      if (insErr) throw insErr;
      vendorId = inserted.id;
    }

    // Also create/refresh a vendor_applications row so the full field
    // set (secondary contact, signer, member offer) is captured exactly
    // like a public application — the admin panel reads from there.
    const { data: existingApp } = await supabase
      .from("vendor_applications")
      .select("id")
      .eq("contact_email", email)
      .maybeSingle();
    const appPatch = {
      company_name: companyName,
      category,
      website,
      description,
      contact_name: contactName,
      contact_email: email,
      contact_phone: contactPhone,
      secondary_email: secondaryEmail,
      secondary_phone: secondaryPhone,
      signature_name: signatureName,
      signature_title: signatureTitle,
      agreement_version: "v1",
      agreed_to_terms: true,
      confirmed_authority: true,
      plan_id: "founding",
      source: "admin-invite",
      calendar_link: calendarLink,
      status: "pending_review",
      vendor_id: vendorId,
    };
    if (existingApp) {
      await supabase.from("vendor_applications").update(appPatch as never).eq("id", existingApp.id);
    } else {
      await supabase.from("vendor_applications").insert(appPatch as never);
    }

    // Pre-create the auth user so they can request a magic link.
    const { error: createErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { company: companyName, user_type: "vendor", invited_by_admin: true },
    });
    if (createErr && !/already.*registered|exists/i.test(createErr.message)) {
      console.error("[admin:vendors:invite] auth user create failed:", createErr);
    }

    // Send the magic-link sign-in email — they log in with THIS email.
    let magicLinkSent = false;
    try {
      const origin =
        req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://dentalmembernetwork.com";
      const cookieClient = await createServerSupabase();
      const { error: otpErr } = await cookieClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/vendor&role=vendor`,
          shouldCreateUser: false,
        },
      });
      magicLinkSent = !otpErr;
      if (otpErr) console.error("[admin:vendors:invite] magic-link failed:", otpErr);
    } catch (err) {
      console.error("[admin:vendors:invite] magic-link threw:", err);
    }

    // Audit + admin notification. Member offer + notes are captured in
    // the notification body so they're not lost (no dedicated column).
    await supabase.from("review_actions").insert({
      target_type: "vendor",
      target_id: vendorId,
      action: "admin_invite",
      note: [body.member_offer && `Offer: ${body.member_offer}`, body.notes]
        .filter(Boolean)
        .join(" · ") || null,
      admin_id: guard.adminId,
    });
    await supabase.from("notifications").insert({
      audience: "admin",
      admin_id: null,
      kind: "vendor_invited",
      title: `Partner invited by admin: ${companyName}`,
      body: `${contactName} (${email}) can now sign in and complete agree-and-pay.${body.member_offer ? ` Offer: "${body.member_offer}".` : ""}`,
      link: "/admin/vendors?filter=approved",
      metadata: { vendor_id: vendorId, invited: true },
    });

    return NextResponse.json({ ok: true, vendor_id: vendorId, magicLinkSent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to invite partner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
