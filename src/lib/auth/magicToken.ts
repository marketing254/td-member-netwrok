import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// HMAC signing secret for the vendor magic-link token. MUST be set in
// production — without a per-environment secret, anyone could forge a
// valid vendor sign-in link. Falling back to a hard-coded preview string
// would defeat the whole point of the signature, so in production we
// refuse to sign or verify until VENDOR_MAGIC_SECRET is configured.
// The preview fallback is allowed in dev only so local development runs
// without env wiring.
const RAW_SECRET = process.env.VENDOR_MAGIC_SECRET;
const IS_PROD = process.env.NODE_ENV === "production";
const SECRET =
  RAW_SECRET && RAW_SECRET.length >= 16
    ? RAW_SECRET
    : IS_PROD
      ? null
      : "td-vendor-magic-dev-only-secret";

function getSecretOrThrow(): string {
  if (!SECRET) {
    throw new Error(
      "VENDOR_MAGIC_SECRET is not set. Configure a 32+ char random secret " +
        "in the production environment before issuing or verifying vendor " +
        "magic-link tokens.",
    );
  }
  return SECRET;
}

const TOKEN_TTL_MS = 30 * 60 * 1000;

export const VENDOR_SESSION_COOKIE = "vendor_session";
export const VENDOR_SESSION_TTL_S = 60 * 60 * 24 * 7;

function sign(payload: string) {
  return createHmac("sha256", getSecretOrThrow()).update(payload).digest("hex");
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
  // If the deployment hasn't configured the signing secret, refuse to
  // verify anything — otherwise an attacker could compute a valid token
  // against a known fallback secret.
  try {
    getSecretOrThrow();
  } catch {
    return { ok: false, reason: "Vendor magic-link is not configured on this environment." };
  }

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
