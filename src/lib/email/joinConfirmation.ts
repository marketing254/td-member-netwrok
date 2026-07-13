import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Confirmation email for a new founding partner / expert. Attaches the
 * signed agreement PDF and points them at their portal.
 *
 * Copy follows Agreements/personalized/CONFIRMATION EMAIL SPEC.md: no
 * em-dashes, v4 agreement label, support@dentalmembernetwork.com contact,
 * plain-date billing, and the sign-in email restated (no code is sent from
 * here; the portal login screen sends the 6-digit code once they arrive).
 *
 * Transport strategy mirrors teamNotify.ts — SMTP if configured,
 * Resend fallback, log-only in dev. Same fromAddress().
 */

const DEFAULT_FROM = "hello@joindmn.com";
const SUPPORT_EMAIL = process.env.FOUNDING_SUPPORT_EMAIL ?? "support@dentalmembernetwork.com";
const LOGO_CID = "dmn-logo-mark";

function fromAddress(): string {
  return process.env.MAIL_FROM ?? DEFAULT_FROM;
}

let LOGO_BUFFER: Buffer | null | undefined;
function getLogoBuffer(): Buffer | null {
  if (LOGO_BUFFER !== undefined) return LOGO_BUFFER;
  try {
    const file = path.join(process.cwd(), "public", "DGN-logo.png");
    LOGO_BUFFER = readFileSync(file);
  } catch {
    LOGO_BUFFER = null;
  }
  return LOGO_BUFFER;
}

function hasPartnerRole(role: JoinConfirmationInput["role"]): boolean {
  return role === "partner" || role === "both";
}
function hasExpertRole(role: JoinConfirmationInput["role"]): boolean {
  return role === "expert" || role === "both";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

export type JoinConfirmationInput = {
  role: "partner" | "expert" | "both";
  to: string;
  contactName: string;
  companyName?: string | null;
  pdfBuffer: Buffer;
  pdfFilename: string;
  portalUrl: string;
  agreementVersion: string;
  /** When the agreement was accepted. Defaults to now if omitted. */
  signedAt?: Date;
  /** Member offer text, partner roles only. Omit the whole section if empty. */
  memberOffer?: string | null;
  /** Multi-company agreements: every company on the agreement with its own
   * offer. When 2+ entries exist the email lists offers per company instead
   * of the single memberOffer line. */
  companies?: { name: string; category?: string | null; member_offer?: string | null }[] | null;
  /** ISO date the trial ends / first $49 charge lands. Partner roles only. */
  trialEndsAt?: string | null;
  /** Whether a card was actually saved to Stripe as part of this signup (founding invite accept). Public join/apply flows don't capture a card here, so default false. */
  cardCaptured?: boolean;
};

/** Normalize the companies list; folds the invite-level offer into the
 * primary company so the per-company list is complete. */
function companiesWithOffers(opts: {
  companies?: JoinConfirmationInput["companies"];
  memberOffer?: string | null;
}): { name: string; category: string | null; member_offer: string | null }[] {
  const list = (opts.companies ?? [])
    .map((c) => ({
      name: (c.name ?? "").trim(),
      category: c.category?.trim() || null,
      member_offer: c.member_offer?.trim() || null,
    }))
    .filter((c) => c.name);
  if (list.length > 0 && !list[0].member_offer && opts.memberOffer?.trim()) {
    list[0].member_offer = opts.memberOffer.trim();
  }
  return list;
}

export async function sendJoinConfirmationEmail(
  input: JoinConfirmationInput,
): Promise<boolean> {
  const roleLabel =
    input.role === "both"
      ? "Founding Expert + Partner"
      : input.role === "partner"
        ? "Founding Partner"
        : "Founding Expert";
  const firstName = input.contactName.split(/\s+/)[0] || "there";
  const subject = `You're in, ${firstName}. Welcome to the Dental Member Network.`;
  const preheader = `Your ${roleLabel} agreement is confirmed. A copy is attached for your records.`;

  const opts = { ...input, roleLabel, firstName, preheader };
  const html = buildHtml(opts);
  const text = buildText(opts);
  const logoBuffer = getLogoBuffer();

  const base64Attachments = [
    {
      filename: input.pdfFilename,
      content: input.pdfBuffer.toString("base64"),
      contentType: "application/pdf",
    },
    ...(logoBuffer
      ? [
          {
            filename: "dmn-logo.png",
            content: logoBuffer.toString("base64"),
            contentType: "image/png",
            content_id: LOGO_CID,
          },
        ]
      : []),
  ];

  try {
    const from = fromAddress();

    // SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpHost && smtpUser && smtpPass) {
      const port = Number(process.env.SMTP_PORT ?? "465");
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from,
        to: input.to,
        replyTo: SUPPORT_EMAIL,
        subject,
        html,
        text,
        attachments: [
          {
            filename: input.pdfFilename,
            content: input.pdfBuffer,
            contentType: "application/pdf",
          },
          ...(logoBuffer
            ? [
                {
                  filename: "dmn-logo.png",
                  content: logoBuffer,
                  contentType: "image/png",
                  cid: LOGO_CID,
                },
              ]
            : []),
        ],
      });
      console.info(`[join-confirm:${input.role}] sent via SMTP`, { to: input.to });
      return true;
    }

    // Resend fallback
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          reply_to: SUPPORT_EMAIL,
          subject,
          html,
          text,
          attachments: base64Attachments,
        }),
      });
      if (!res.ok) {
        console.error(
          `[join-confirm:${input.role}] Resend failed`,
          await res.text().catch(() => ""),
        );
        return false;
      }
      console.info(`[join-confirm:${input.role}] sent via Resend`, { to: input.to });
      return true;
    }

    console.info(
      `[join-confirm:${input.role}] (no transport) welcome PDF for ${input.to} skipped`,
    );
    return false;
  } catch (err) {
    console.error(`[join-confirm:${input.role}] send failed`, err);
    return false;
  }
}

type BuiltOpts = JoinConfirmationInput & {
  roleLabel: string;
  firstName: string;
  preheader: string;
};

function billingDates(opts: BuiltOpts): { freeThrough: string; firstCharge: string; standardStart: string } {
  const signedAt = opts.signedAt ?? new Date();
  const trialEnd = opts.trialEndsAt ? new Date(opts.trialEndsAt) : addMonths(signedAt, 6);
  const freeThrough = new Date(trialEnd.getTime() - 24 * 60 * 60 * 1000);
  const standardStart = addMonths(trialEnd, 6);
  return {
    freeThrough: formatDate(freeThrough),
    firstCharge: formatDate(trialEnd),
    standardStart: formatDate(standardStart),
  };
}

function agreementSection(opts: BuiltOpts): string {
  const acceptedOn = formatDateTime(opts.signedAt ?? new Date());
  return `A copy of the DMN ${opts.roleLabel} Agreement (${opts.agreementVersion}) is attached to this email, and you can download it anytime from your portal. Accepted by ${escapeHtml(opts.contactName)} on ${acceptedOn}.`;
}

function whatsNextItems(opts: BuiltOpts): string[] {
  const partner = hasPartnerRole(opts.role);
  const expert = hasExpertRole(opts.role);
  const items: string[] = [];
  if (expert) items.push("Your profile and resource kit go live at launch");
  if (partner) items.push("Your listing, member offer, and resources go live at launch");
  items.push("We&#39;ll email you when members start reaching out");
  return items;
}

function buildHtml(opts: BuiltOpts): string {
  const partnerRole = hasPartnerRole(opts.role);
  const billingActive = partnerRole && opts.cardCaptured === true;
  const companyDisplay = opts.companyName?.trim() || opts.contactName;

  const welcomeLines: string[] = [];
  if (opts.role === "both") {
    welcomeLines.push(
      `Welcome to the Dental Member Network as a Founding Expert and Partner.`,
      billingActive
        ? `Your expert listing is free for life. The billing below applies only to ${escapeHtml(companyDisplay)}&#39;s partner listing.`
        : `Your expert listing is free for life, and no payment details were taken today.`,
    );
  } else if (opts.role === "partner") {
    welcomeLines.push(
      billingActive
        ? `Welcome to the Dental Member Network as a Founding Partner. Your card is safely saved with Stripe. Nothing was charged today.`
        : `Welcome to the Dental Member Network as a Founding Partner. Your application is confirmed, and no payment details were taken today. We&#39;ll be in touch once it&#39;s reviewed.`,
    );
  } else {
    welcomeLines.push(
      `Welcome to the Dental Member Network as a Founding Expert. Your expert listing is free for life, and no payment details were taken today.`,
    );
  }

  const logoHtml = getLogoBuffer()
    ? `<img src="cid:${LOGO_CID}" alt="Dental Member Network" width="120" style="display:block;margin:0 auto;" />`
    : `<div style="font-weight:800;letter-spacing:6px;color:#0A1A2F;font-size:20px;">DMN</div>
    <div style="font-size:9px;letter-spacing:2px;color:#5C6770;margin-top:4px;">DENTAL MEMBER NETWORK</div>`;

  let billingHtml = "";
  if (billingActive) {
    const dates = billingDates(opts);
    billingHtml = `
  <h2 style="font-size:14px;font-weight:800;letter-spacing:1px;color:#5C6770;margin:24px 0 10px 0;">
    YOUR BILLING, IN PLAIN DATES
  </h2>
  <ul style="padding-left:18px;line-height:1.6;color:#3B4A55;font-size:14px;margin:0 0 4px 0;">
    <li>Today through ${dates.freeThrough}: $0 (your 6 founding months)</li>
    <li>First billing on ${dates.firstCharge}: $49/month</li>
    <li>From ${dates.standardStart}: $199/month standard rate</li>
    <li>Cancel anytime with 30 days&#39; written notice. We&#39;ll remind you 7 days before your free period ends.</li>
  </ul>`;
  }

  let memberOfferHtml = "";
  const emailCompanies = companiesWithOffers(opts);
  const offer = opts.memberOffer?.trim();
  if (partnerRole && emailCompanies.length > 1) {
    // Multi-company agreement — one block listing each company's own offer.
    const rows = emailCompanies
      .map(
        (c) => `
      <div style="margin-bottom:10px;">
        <div style="font-size:13.5px;font-weight:700;color:#0A1A2F;">${escapeHtml(c.name)}${
          c.category ? ` <span style="font-weight:400;color:#7A8590;">&middot; ${escapeHtml(c.category)}</span>` : ""
        }</div>
        <div style="font-size:13.5px;color:#3B4A55;line-height:1.5;">${
          c.member_offer ? escapeHtml(c.member_offer) : "Offer to be confirmed before this listing goes live."
        }</div>
      </div>`,
      )
      .join("");
    memberOfferHtml = `
  <div style="background:#F7EED9;border:1px solid #D9A84B;border-radius:8px;padding:16px;margin:20px 0;">
    <div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#A07823;margin-bottom:10px;">
      YOUR COMPANIES &amp; MEMBER OFFERS ON FILE
    </div>
    ${rows}
    <p style="margin:6px 0 0;font-size:13px;color:#5C6770;line-height:1.5;">
      One founding fee covers all of the above. This is what members will see — reply if anything needs correcting before it goes live.
    </p>
  </div>`;
  } else if (partnerRole && offer) {
    memberOfferHtml = `
  <div style="background:#F7EED9;border:1px solid #D9A84B;border-radius:8px;padding:16px;margin:20px 0;">
    <div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#A07823;margin-bottom:8px;">
      YOUR MEMBER OFFER ON FILE
    </div>
    <p style="margin:0;font-size:14px;color:#0A1A2F;line-height:1.55;">
      ${escapeHtml(offer)}. This is what members will see. Reply if anything needs correcting before it goes live.
    </p>
  </div>`;
  }

  const whatsNextHtml = whatsNextItems(opts)
    .map((item) => `<li>${item}</li>`)
    .join("\n    ");

  const cancelFooterLine =
    opts.role === "expert" ? `<br/>Cancel anytime with 30 days&#39; written notice.` : "";

  return `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;background:#F7F5F0;padding:24px;color:#0A1A2F;">
<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>
<div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:12px;padding:32px;border:1px solid #E0DACE;">
  <div style="text-align:center;margin-bottom:24px;">
    ${logoHtml}
  </div>
  <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:500;margin:0 0 8px 0;color:#0A1A2F;">
    You&#39;re in, ${escapeHtml(opts.firstName)}.
  </h1>
  ${welcomeLines.map((line) => `<p style="color:#3B4A55;line-height:1.55;margin:0 0 8px 0;font-size:15px;">${line}</p>`).join("\n  ")}
  ${billingHtml}
  ${memberOfferHtml}
  <div style="background:#F7EED9;border:1px solid #D9A84B;border-radius:8px;padding:16px;margin:20px 0;">
    <div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#A07823;margin-bottom:8px;">
      YOUR AGREEMENT
    </div>
    <p style="margin:0;font-size:14px;color:#0A1A2F;line-height:1.55;">
      ${agreementSection(opts)}
    </p>
  </div>
  <h2 style="font-size:14px;font-weight:800;letter-spacing:1px;color:#5C6770;margin:24px 0 10px 0;">
    WHAT&#39;S NEXT
  </h2>
  <ul style="padding-left:18px;line-height:1.6;color:#3B4A55;font-size:14px;margin:0 0 20px 0;">
    ${whatsNextHtml}
  </ul>
  <p style="color:#3B4A55;line-height:1.55;margin:0 0 8px 0;font-size:14px;">
    Sign in at your portal with this email: <strong>${escapeHtml(opts.to)}</strong>. Enter it there and we&#39;ll send you a 6-digit sign-in code.
  </p>
  <div style="text-align:center;margin:20px 0 8px 0;">
    <a href="${opts.portalUrl}" style="display:inline-block;background:#0E2A3D;color:#FFFFFF;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
      Open your portal
    </a>
  </div>
  <p style="color:#7A8590;font-size:12px;line-height:1.5;margin:24px 0 0 0;text-align:center;">
    Questions? Reply to this email or write to us at ${SUPPORT_EMAIL}.${cancelFooterLine}<br/>
    Dental Member Network, a service offered by Thriving Dentist Inc.
  </p>
</div>
</body></html>`;
}

function buildText(opts: BuiltOpts): string {
  const partnerRole = hasPartnerRole(opts.role);
  const billingActive = partnerRole && opts.cardCaptured === true;
  const companyDisplay = opts.companyName?.trim() || opts.contactName;

  const welcomeLines: string[] = [];
  if (opts.role === "both") {
    welcomeLines.push(
      `Welcome to the Dental Member Network as a Founding Expert and Partner.`,
      billingActive
        ? `Your expert listing is free for life. The billing below applies only to ${companyDisplay}'s partner listing.`
        : `Your expert listing is free for life, and no payment details were taken today.`,
    );
  } else if (opts.role === "partner") {
    welcomeLines.push(
      billingActive
        ? `Welcome to the Dental Member Network as a Founding Partner. Your card is safely saved with Stripe. Nothing was charged today.`
        : `Welcome to the Dental Member Network as a Founding Partner. Your application is confirmed, and no payment details were taken today. We'll be in touch once it's reviewed.`,
    );
  } else {
    welcomeLines.push(
      `Welcome to the Dental Member Network as a Founding Expert. Your expert listing is free for life, and no payment details were taken today.`,
    );
  }

  let billingText = "";
  if (billingActive) {
    const dates = billingDates(opts);
    billingText = `
Your billing, in plain dates:
  - Today through ${dates.freeThrough}: $0 (your 6 founding months)
  - First billing on ${dates.firstCharge}: $49/month
  - From ${dates.standardStart}: $199/month standard rate
  - Cancel anytime with 30 days' written notice. We'll remind you 7 days before your free period ends.
`;
  }

  let memberOfferText = "";
  const emailCompanies = companiesWithOffers(opts);
  const offer = opts.memberOffer?.trim();
  if (partnerRole && emailCompanies.length > 1) {
    const rows = emailCompanies
      .map(
        (c) =>
          `  - ${c.name}${c.category ? ` (${c.category})` : ""}: ${
            c.member_offer ?? "offer to be confirmed before this listing goes live"
          }`,
      )
      .join("\n");
    memberOfferText = `
Your companies & member offers on file (one founding fee covers all):
${rows}
This is what members will see. Reply if anything needs correcting before it goes live.
`;
  } else if (partnerRole && offer) {
    memberOfferText = `
Your member offer on file:
${offer}. This is what members will see. Reply if anything needs correcting before it goes live.
`;
  }

  const whatsNextText = whatsNextItems(opts)
    .map((item) => `  - ${item.replace(/&#39;/g, "'")}`)
    .join("\n");

  const cancelFooterLine = opts.role === "expert" ? `\nCancel anytime with 30 days' written notice.` : "";

  return `You're in, ${opts.firstName}.

${welcomeLines.join("\n")}
${billingText}${memberOfferText}
Your agreement:
${agreementSection(opts).replace(/&#39;/g, "'")}

What's next:
${whatsNextText}

Sign in at your portal with this email: ${opts.to}. Enter it there and we'll send you a 6-digit sign-in code.

Open your portal: ${opts.portalUrl}

Questions? Reply to this email or write to us at ${SUPPORT_EMAIL}.${cancelFooterLine}
Dental Member Network, a service offered by Thriving Dentist Inc.
`;
}
