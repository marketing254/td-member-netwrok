import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const SECRET = process.env.VENDOR_MAGIC_SECRET ?? "td-vendor-magic-preview-secret";
const TOKEN_TTL_MS = 30 * 60 * 1000;

export const VENDOR_SESSION_COOKIE = "vendor_session";
export const VENDOR_SESSION_TTL_S = 60 * 60 * 24 * 7;

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeEq(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function buildVendorMagicToken(email: string): string {
  const issuedAt = Date.now();
  const nonce = randomBytes(12).toString("hex");
  const payload = `${email}:${issuedAt}:${nonce}`;
  return Buffer.from(`${payload}:${sign(payload)}`).toString("base64url");
}

export function buildVendorMagicLink(origin: string, email: string): string {
  return `${origin}/vendor/login?token=${buildVendorMagicToken(email)}`;
}

export type MagicTokenResult =
  | { ok: true; email: string }
  | { ok: false; reason: string };

export function parseVendorMagicToken(token: string): MagicTokenResult {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return { ok: false, reason: "Malformed link." };
  }
  const parts = decoded.split(":");
  if (parts.length !== 4) return { ok: false, reason: "Malformed link." };
  const [email, issuedAtStr, nonce, sig] = parts as [string, string, string, string];
  const payload = `${email}:${issuedAtStr}:${nonce}`;
  if (!safeEq(sign(payload), sig)) return { ok: false, reason: "Invalid signature." };
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return { ok: false, reason: "Invalid timestamp." };
  if (Date.now() - issuedAt > TOKEN_TTL_MS) return { ok: false, reason: "Link expired. Request a new one." };
  return { ok: true, email };
}
