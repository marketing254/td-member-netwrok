import { NextResponse } from "next/server";
import {
  VENDOR_SESSION_COOKIE,
  VENDOR_SESSION_TTL_S,
  buildVendorMagicLink,
  parseVendorMagicToken,
} from "@/lib/auth/magicToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Preview-phase vendor auth.
// - mode "password": accepts the test/test stand-in credential and sets the
//   session cookie. Replace with a real lookup when the vendor table lands.
// - mode "magic": stubs the email-a-link flow. Logs the link to the server
//   console and attempts SMTP delivery if the env vars are set.
// - mode "verify": consumes a signed magic-link token and sets the session
//   cookie.

function setSessionCookie(res: NextResponse, value: string) {
  res.cookies.set(VENDOR_SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: VENDOR_SESSION_TTL_S,
  });
}

export async function POST(req: Request) {
  let body: { mode?: string; email?: string; password?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const mode = body.mode ?? "password";

  if (mode === "password") {
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const isTestCredential = email === "test" && password === "test";
    if (!isTestCredential) {
      return NextResponse.json(
        { error: "Invalid credentials. During preview, use 'test' for both fields." },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ ok: true, redirect: "/vendor" });
    setSessionCookie(res, "test-preview");
    return res;
  }

  if (mode === "magic") {
    const email = (body.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const link = buildVendorMagicLink(origin, email);

    console.log(`[vendor:magic-link] for ${email} → ${link}`);

    try {
      const mailer = await import("@/lib/waitlist/confirmationEmail");
      const sender = (mailer as { sendVendorMagicLinkEmail?: (a: { email: string; link: string }) => Promise<unknown> })
        .sendVendorMagicLinkEmail;
      if (typeof sender === "function") {
        await sender({ email, link });
      }
    } catch {
      // No-op: preview mode tolerates missing transport.
    }

    return NextResponse.json({
      ok: true,
      sent: true,
      message: "We sent a sign-in link to your inbox. It expires in 30 minutes.",
    });
  }

  if (mode === "verify") {
    const token = body.token ?? "";
    if (!token) return NextResponse.json({ error: "Token is required." }, { status: 400 });
    const parsed = parseVendorMagicToken(token);
    if (!parsed.ok) return NextResponse.json({ error: parsed.reason }, { status: 401 });

    const res = NextResponse.json({ ok: true, redirect: "/vendor", email: parsed.email });
    setSessionCookie(res, parsed.email);
    return res;
  }

  return NextResponse.json({ error: `Unknown mode '${mode}'.` }, { status: 400 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(VENDOR_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
