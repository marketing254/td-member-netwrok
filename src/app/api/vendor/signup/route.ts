import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

type ClerkError = { errors?: Array<{ code?: string; message?: string; long_message?: string }> };

function readClerkError(e: unknown): { code?: string; message?: string } {
  const err = e as ClerkError;
  const first = err?.errors?.[0];
  return { code: first?.code, message: first?.long_message ?? first?.message };
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.companyName || !body.contactEmail || !body.agreedToTerms) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const publicMetadata = {
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
  };

  const client = await clerkClient();

  const tryCreateInvitation = async () =>
    client.invitations.createInvitation({
      emailAddress: body.contactEmail,
      // After accepting, vendors land on their sign-in page (vendor-branded),
      // sign in/set password, then Clerk forwards them to /vendor.
      redirectUrl: `${appUrl}/vendor/signin`,
      publicMetadata,
    });

  try {
    const invitation = await tryCreateInvitation();
    return NextResponse.json({ success: true, invitationId: invitation.id });
  } catch (e) {
    const { code, message } = readClerkError(e);
    console.error("vendor signup failed:", { code, message, raw: e });

    // Case 1 — a pending invitation already exists for this email.
    // Revoke it and retry once. This is the most common dev-loop case.
    if (code === "duplicate_record" || message?.toLowerCase().includes("already") && message?.toLowerCase().includes("invit")) {
      try {
        const list = await client.invitations.getInvitationList({ status: "pending" });
        const existing = list.data.find((i) => i.emailAddress === body.contactEmail);
        if (existing) {
          await client.invitations.revokeInvitation(existing.id);
          const fresh = await tryCreateInvitation();
          return NextResponse.json({ success: true, invitationId: fresh.id, retried: true });
        }
      } catch (retryErr) {
        console.error("retry after revoke failed:", retryErr);
      }
    }

    // Case 2 — a real user already exists with this email.
    if (code === "form_identifier_exists" || message?.toLowerCase().includes("exists")) {
      return NextResponse.json(
        {
          error: "An account already exists with this email. Sign in at /vendor or use a different email.",
        },
        { status: 409 },
      );
    }

    // Case 3 — bad email format.
    if (code === "form_param_format_invalid") {
      return NextResponse.json({ error: "That email address looks invalid." }, { status: 400 });
    }

    // Fallback — surface Clerk's actual message instead of a generic 500.
    return NextResponse.json(
      { error: message ?? "Could not create invitation. Please try again." },
      { status: 422 },
    );
  }
}
