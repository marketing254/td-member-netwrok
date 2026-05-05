import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!SIGNING_SECRET) return new Response("no signing secret", { status: 500 });

  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTs = h.get("svix-timestamp");
  const svixSig = h.get("svix-signature");
  if (!svixId || !svixTs || !svixSig) return new Response("missing svix headers", { status: 400 });

  const payload = await req.text();
  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, { "svix-id": svixId, "svix-timestamp": svixTs, "svix-signature": svixSig }) as WebhookEvent;
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const user = evt.data;
    const existingRole = (user.public_metadata as { role?: string })?.role;

    // If the role wasn't pre-set (vendor flow sets it before user.created fires),
    // default this user to a member.
    if (!existingRole) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: { role: "member" },
      });
    }

    // TODO: write to your Postgres `users` + `member_profiles` row here
    // see PHASE1_LAUNCH_CHECKLIST.md §4 for schema
  }

  if (evt.type === "user.updated") {
    // sync metadata changes to DB
  }

  if (evt.type === "user.deleted") {
    // soft-delete the row in DB
  }

  return new Response("ok", { status: 200 });
}