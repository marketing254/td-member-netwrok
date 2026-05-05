import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.companyName || !body.contactEmail || !body.agreedToTerms) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }

  try {
    const client = await clerkClient();

    // Invitation-only flow:
    //   - Clerk emails the vendor a one-time link
    //   - When they click it, Clerk creates the user account with all
    //     publicMetadata pre-baked, then routes them to /vendor
    //   - No duplicate createUser call → no race condition
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const invitation = await client.invitations.createInvitation({
      emailAddress: body.contactEmail,
      redirectUrl: `${appUrl}/vendor`,
      publicMetadata: {
        role: "vendor",
        vendor_status: "pending",
        company: body.companyName,
        category: body.category,
        website: body.website,
        plan_id: body.planId,
        contact_name: body.contactName,
        contact_phone: body.contactPhone ?? "",
        agreement_signed_at: new Date().toISOString(),
        agreement_version: "v1.0",
        agreement_signed_by: body.signatureName,
        agreement_signed_title: body.signatureTitle,
        offer_draft: {
          title: body.offerTitle,
          discount: body.offerDiscount,
          mechanic: body.offerMechanic,
          code: body.offerCode,
          terms: body.offerTerms,
        },
      },
    });

    // TODO when DB is wired: insert vendor_profiles row with status='pending'
    // TODO: notify Reshani in Slack channel #vendor-applications

    return NextResponse.json({ success: true, invitationId: invitation.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("vendor signup failed:", msg, e);
    // 409 if email already invited; 500 otherwise
    const status = msg.toLowerCase().includes("already") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
