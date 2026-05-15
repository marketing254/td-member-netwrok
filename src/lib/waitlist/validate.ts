export type WaitlistRole = "member" | "vendor" | "expert";

export type WaitlistPayload = {
  role: WaitlistRole;
  fullName: string;
  email: string;
  practiceName?: string;
  phone?: string;
  cityState?: string;
  message?: string;
  source?: string;
  utm?: Record<string, string>;
};

export type ValidationResult =
  | { ok: true; data: WaitlistPayload }
  | { ok: false; error: string; field?: keyof WaitlistPayload };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function validateWaitlist(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be JSON." };
  }
  const b = body as Record<string, unknown>;

  const role = asString(b.role).toLowerCase();
  if (role !== "member" && role !== "vendor" && role !== "expert") {
    return { ok: false, error: "Pick whether you are joining as a member, vendor, or expert.", field: "role" };
  }

  const fullName = asString(b.fullName);
  if (fullName.length < 2 || fullName.length > 120) {
    return { ok: false, error: "Enter your full name.", field: "fullName" };
  }

  const email = asString(b.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "Use a valid work email.", field: "email" };
  }

  const practiceName = asString(b.practiceName) || undefined;
  if (practiceName && practiceName.length > 160) {
    return { ok: false, error: "Practice name is too long.", field: "practiceName" };
  }

  const phone = asString(b.phone) || undefined;
  if (phone && phone.length > 32) {
    return { ok: false, error: "Phone number is too long.", field: "phone" };
  }

  const cityState = asString(b.cityState) || undefined;
  if (cityState && cityState.length > 120) {
    return { ok: false, error: "City/state field is too long.", field: "cityState" };
  }

  const message = asString(b.message) || undefined;
  if (message && message.length > 2000) {
    return { ok: false, error: "Message is too long. Keep it under 2000 characters.", field: "message" };
  }

  const source = asString(b.source) || "landing";
  const utmRaw = b.utm;
  const utm =
    utmRaw && typeof utmRaw === "object" && !Array.isArray(utmRaw)
      ? (utmRaw as Record<string, string>)
      : undefined;

  return {
    ok: true,
    data: { role: role as WaitlistRole, fullName, email, practiceName, phone, cityState, message, source, utm },
  };
}
