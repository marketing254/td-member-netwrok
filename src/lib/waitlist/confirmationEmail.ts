import type { WaitlistPayload, WaitlistRole } from "@/lib/waitlist/validate";

type ConfirmationInput = {
  signup: WaitlistPayload;
  referenceId: string;
  submittedAt: string;
};

type EmailSection = {
  title: string;
  body?: string;
  items?: string[];
};

type CtaSpec = {
  label: string;
  url: string;
};

type EmailDraft = {
  role: WaitlistRole;
  subject: string;
  preview: string;
  eyebrow: string;
  headline: string;
  intro: string[];
  sections: EmailSection[];
  cta?: CtaSpec;
  closing: string;
  signoff: string[];
  footerNote: string;
  footerLines: string[];
  replyTo: string;
  accent: string;
  accentLight: string;
};

type BuiltEmail = {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
};

type SendResult =
  | { sent: true; id?: string }
  | { sent: false; reason: "disabled" | "missing_api_key" };

// The website lives at dentalmembernetwork.com — that's where members
// land, where the portal runs, where links in emails point back to.
// All outbound mail is sent FROM joindmn.com (and replies route to
// hello@joindmn.com) to keep dentalmembernetwork.com's inbox reputation
// pristine. The two domains play different roles on purpose.
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dentalmembernetwork.com";
const SUPPORT_EMAIL = process.env.WAITLIST_SUPPORT_EMAIL ?? "hello@joindmn.com";
const PARTNERSHIPS_EMAIL =
  process.env.WAITLIST_PARTNERSHIPS_EMAIL ?? "partnerships@joindmn.com";
const FROM_EMAIL =
  process.env.WAITLIST_EMAIL_FROM ??
  "Dental Member Network <hello@joindmn.com>";

// Brand palette, used inline in the email HTML
const BRAND = {
  ink: "#0A1A2F",
  inkSoft: "#3B4A55",
  inkMute: "#5C6770",
  cream: "#F7F5F0",
  creamSoft: "#FBF8F1",
  line: "#E6DDCF",
  goldDeep: "#A07823",
  gold: "#D9A84B",
  goldLight: "#F0C16E",
};

// Email-safe font stacks. We import Fraunces from Google Fonts in <head> for
// the clients that support it (Apple Mail, iOS Mail, Gmail web, Yahoo); for
// Outlook + Windows Mail (which strip @import), the stacks fall back to
// Georgia/system sans, which already look refined, far better than Arial.
//
// Body uses a "system stack" that renders as San Francisco on macOS/iOS,
// Segoe UI on Windows, Roboto on Android, every reader sees the sharpest
// native font on their device.
const FONT_DISPLAY =
  "'Fraunces','Iowan Old Style','Apple Garamond','Baskerville','Times New Roman', Georgia, serif";
const FONT_BODY =
  "-apple-system, BlinkMacSystemFont,'Segoe UI', Roboto,'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_MONO =
  "ui-monospace, SFMono-Regular,'SF Mono', Menlo, Consolas,'Liberation Mono', monospace";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString("en-US");
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeUrl(path: string): string {
  try {
    return new URL(path, SITE_URL).toString();
  } catch {
    return `https://dentalmembernetwork.com${path}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DRAFTS, copy mirrors `Confirmation emails.md` (May 2026 source of truth).
// ─────────────────────────────────────────────────────────────────────────

function memberDraft(input: ConfirmationInput): EmailDraft {
  const submitted = formatDate(input.submittedAt);
  return {
    role: "member",
    subject: "Welcome to the Dental Member Network — your founding spot is locked in",
    preview:
      "Your founding membership is confirmed. $49/month at the founding rate. Here's what happens next.",
    eyebrow: "Founding Member",
    headline: "Your founding spot is locked in.",
    accent: BRAND.gold,
    accentLight: BRAND.goldLight,
    replyTo: SUPPORT_EMAIL,
    intro: [
      `Hi ${firstName(input.signup.fullName)},`,
      "Welcome to the Dental Member Network. Your founding membership is confirmed and your $49/month founding rate is locked in — it never increases for as long as your membership stays active.",
    ],
    sections: [
      {
        title: "Here's what happens next",
        items: [
          "Your account is being set up right now. After launching the network you will have access to the network.",
          "Once you log in, you'll have immediate access to the full Vendor Network with member-exclusive discounts, the complete Free Library (Thriving Dentist podcast, webinars, expert panels, Less Insurance Dependence podcast and blog), and member rates on every paid course from our experts.",
        ],
      },
      {
        title: "A few things to know",
        items: [
          "Your founding member status is permanent. As we add features over time, you keep access at the same $49/month founding rate for as long as your membership stays active.",
          'Member discounts on vendor products and services are clearly marked in the Vendor Directory, just look for the "Member Benefit" panel on each vendor\'s card.',
          "If you registered with a practice email, feel free to invite your office manager or team members to set up their own accounts. The first 100 founding spots are still open.",
        ],
      },
    ],
    cta: {
      label: "Visit the network",
      url: normalizeUrl("/"),
    },
    closing: `If you have any questions or run into issues accessing your account, send us a mail to ${SUPPORT_EMAIL}, we read and respond to every message.`,
    signoff: ["Welcome aboard.", " The Dental Member Network Team", "Powered by Thriving Dentist"],
    footerNote: "Do not reply to this email.",
    footerLines: [
      `This is an automated confirmation email for your Dental Member Network founding membership submitted on ${submitted}.`,
      `Order reference: ${input.referenceId}`,
      `Dental Member Network · ${SUPPORT_EMAIL} · dentalmembernetwork.com`,
    ],
  };
}

function draftFor(input: ConfirmationInput): EmailDraft {
  // Waitlist is members-only. Vendors apply via /vendor/signup and receive a
  // separate magic-link email (see sendVendorMagicLinkEmail).
  return memberDraft(input);
}

// ─────────────────────────────────────────────────────────────────────────
// HTML RENDER, table-based layout so it works in every email client
// (Outlook, Apple Mail, Gmail iOS/Android). Inline styles only.
// ─────────────────────────────────────────────────────────────────────────

function renderIntro(intro: string[]): string {
  return intro
    .map(
      (line, i) =>
        `<p style="margin:${i === 0 ? "0" : "0"} 0 ${i === intro.length - 1 ? "0" : "16px"};color:${BRAND.inkSoft};font-family:${FONT_BODY};font-size:16px;line-height:1.7;font-weight:400;letter-spacing:-.003em;">${escapeHtml(line)}</p>`,
    )
    .join("");
}

function renderSection(section: EmailSection, accent: string): string {
  const body = section.body
    ? `<p style="margin:8px 0 0;color:${BRAND.inkSoft};font-family:${FONT_BODY};font-size:15px;line-height:1.7;font-weight:400;letter-spacing:-.003em;">${escapeHtml(section.body)}</p>`
    : "";
  const items = section.items
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 0;width:100%;">${section.items
        .map(
          (item) => `
        <tr>
          <td valign="top" width="22" style="padding:9px 10px 0 0;">
            <div style="width:7px;height:7px;border-radius:50%;background:${accent};margin-top:0;"></div>
          </td>
          <td valign="top" style="padding:4px 0;color:${BRAND.inkSoft};font-family:${FONT_BODY};font-size:15px;line-height:1.65;font-weight:400;letter-spacing:-.003em;">${escapeHtml(item)}</td>
        </tr>`,
        )
        .join("")}</table>`
    : "";
  return `
    <tr>
      <td style="padding:26px 0 0;">
        <div style="display:inline-block;height:3px;width:24px;background:${accent};border-radius:2px;margin-bottom:12px;"></div>
        <h2 style="margin:0;color:${BRAND.ink};font-family:${FONT_BODY};font-size:16px;line-height:1.3;font-weight:700;letter-spacing:-.005em;">${escapeHtml(section.title)}</h2>
        ${body}
        ${items}
      </td>
    </tr>`;
}

function renderCta(cta: CtaSpec, accent: string): string {
  return `
    <tr>
      <td style="padding:30px 0 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td bgcolor="${accent}" style="border-radius:8px;background:${accent};">
              <a href="${cta.url}" style="display:inline-block;padding:14px 24px;color:#FFFFFF;font-family:${FONT_BODY};font-size:14px;font-weight:700;letter-spacing:.005em;text-decoration:none;border-radius:8px;mso-padding-alt:0;">${escapeHtml(cta.label)} &nbsp;→</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderHtml(draft: EmailDraft): string {
  const intro = renderIntro(draft.intro);
  const sections = draft.sections.map((s) => renderSection(s, draft.accent)).join("");
  const cta = draft.cta ? renderCta(draft.cta, draft.accent) : "";
  const closing = `
    <tr>
      <td style="padding:24px 0 0;">
        <div style="height:1px;background:${BRAND.line};margin-bottom:20px;"></div>
        <p style="margin:0;color:${BRAND.inkSoft};font-family:${FONT_BODY};font-size:14.5px;line-height:1.7;font-weight:400;letter-spacing:-.003em;">${escapeHtml(draft.closing)}</p>
      </td>
    </tr>`;
  const signoff = `
    <tr>
      <td style="padding:24px 0 0;">
        ${draft.signoff
          .map(
            (line, i) =>
              `<p style="margin:${i === 0 ? "0" : "4px 0 0"};color:${i === 0 ? BRAND.ink : BRAND.inkSoft};font-family:${FONT_BODY};font-size:${i === 0 ? "15.5px" : "14px"};line-height:1.6;font-weight:${i === 0 ? "600" : "500"};letter-spacing:-.003em;">${escapeHtml(line)}</p>`,
          )
          .join("")}
      </td>
    </tr>`;
  const footer = draft.footerLines
    .map(
      (line) =>
        `<div style="margin:3px 0;color:rgba(247,245,240,0.55);font-family:${FONT_BODY};font-size:11.5px;line-height:1.6;letter-spacing:.002em;">${escapeHtml(line)}</div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>${escapeHtml(draft.subject)}</title>
    <!-- Web fonts for clients that support @import (Apple Mail, iOS Mail,
         Gmail web, Yahoo, AOL). Outlook/Windows Mail will strip this and
         fall back to the system stack below, which still looks professional. -->
    <!--[if !mso]><!-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz, wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!--<![endif]-->
    <style>
      /* Strong typographic defaults, applied to every text node that doesn't override */
      body, table, td, p, a, h1, h2, h3, span, div {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      /* Tighten the optical sizing on the display headline */
      h1, .dmn-display {
        font-feature-settings: "ss01" on, "ss02" on, "kern" on;
      }
      @media (max-width: 600px) {
        .container { padding: 18px 8px !important; }
        .card-pad { padding: 24px 22px 28px !important; }
        .footer-pad { padding: 20px 22px !important; }
        h1 { font-size: 24px !important; line-height: 1.16 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.creamSoft};font-family:${FONT_BODY};color:${BRAND.ink};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${escapeHtml(draft.preview)}</div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.creamSoft};">
      <tr>
        <td class="container" align="center" style="padding:36px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#FFFFFF;border:1px solid ${BRAND.line};border-radius:16px;overflow:hidden;box-shadow:0 24px 60px -28px rgba(14,42,61,0.18);">

            <!-- Top brand bar with role accent -->
            <tr>
              <td style="height:5px;background:linear-gradient(90deg, ${BRAND.ink} 0%, ${draft.accent} 50%, ${BRAND.goldLight} 100%);font-size:0;line-height:0;">&nbsp;</td>
            </tr>

            <!-- Header: brand wordmark + role chip -->
            <tr>
              <td style="padding:26px 34px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div class="dmn-display" style="font-family:${FONT_DISPLAY};font-size:24px;font-weight:600;letter-spacing:-.025em;color:${BRAND.ink};line-height:1;">
                        <span style="color:${BRAND.ink};">D</span><span style="color:${BRAND.gold};">M</span><span style="color:${BRAND.ink};">N</span>
                        <span style="display:inline-block;margin-left:10px;padding-left:12px;border-left:1px solid ${BRAND.line};font-family:${FONT_BODY};font-size:10.5px;font-weight:700;letter-spacing:.18em;color:${BRAND.inkMute};text-transform:uppercase;vertical-align:4px;">Dental Member Network</span>
                      </div>
                    </td>
                    <td align="right" style="white-space:nowrap;">
                      <span style="display:inline-block;padding:6px 11px;border-radius:999px;background:${BRAND.creamSoft};border:1px solid ${BRAND.line};color:${draft.accent};font-family:${FONT_BODY};font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">${escapeHtml(draft.eyebrow)}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Headline + intro -->
            <tr>
              <td class="card-pad" style="padding:24px 34px 6px;">
                <h1 class="dmn-display" style="margin:0 0 18px;color:${BRAND.ink};font-family:${FONT_DISPLAY};font-size:30px;line-height:1.12;font-weight:500;letter-spacing:-.02em;">${escapeHtml(draft.headline)}</h1>
                ${intro}
              </td>
            </tr>

            <!-- Sections -->
            <tr>
              <td class="card-pad" style="padding:0 34px 4px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${sections}
                  ${cta}
                  ${closing}
                  ${signoff}
                </table>
              </td>
            </tr>

            <!-- Spacer to footer -->
            <tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- Footer -->
            <tr>
              <td class="footer-pad" style="padding:22px 34px;background:${BRAND.ink};">
                <div style="color:${BRAND.goldLight};font-family:${FONT_BODY};font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin:0 0 8px;">${escapeHtml(draft.footerNote)}</div>
                ${footer}
              </td>
            </tr>

          </table>

          <!-- Outside footer (legal hint) -->
          <div style="max-width:620px;margin:14px auto 0;color:${BRAND.inkMute};font-family:${FONT_BODY};font-size:11px;line-height:1.55;text-align:center;letter-spacing:.002em;">
            You received this because you submitted the Dental Member Network waitlist form.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(draft: EmailDraft): string {
  const sections = draft.sections
    .map((section) => {
      const body = section.body ? `\n${section.body}` : "";
      const items = section.items ? `\n${section.items.map((item) => `- ${item}`).join("\n")}` : "";
      return `${section.title.toUpperCase()}${body}${items}`;
    })
    .join("\n\n");

  const lines = [
    draft.subject,
    "",
    ...draft.intro,
    "",
    sections,
    "",
    draft.cta ? `${draft.cta.label}: ${draft.cta.url}` : "",
    "",
    draft.closing,
    "",
    ...draft.signoff,
    "",
    draft.footerNote,
    ...draft.footerLines,
  ].filter((line, i, arr) => !(line === "" && arr[i - 1] === ""));

  return lines.join("\n");
}

export function buildWaitlistConfirmationEmail(input: ConfirmationInput): BuiltEmail {
  const draft = draftFor(input);
  return {
    subject: draft.subject,
    html: renderHtml(draft),
    text: renderText(draft),
    replyTo: draft.replyTo,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// SENDERS
//
// Single shared transport. Selection priority:
//   1. Generic SMTP (Rackspace, AWS SES SMTP, Mailgun SMTP, anything)
//      if SMTP_HOST + SMTP_USER + SMTP_PASS are set.
//   2. Gmail SMTP if GMAIL_USER + GMAIL_APP_PASSWORD are set (dev/legacy).
//   3. Resend API if RESEND_API_KEY is set (alternate prod path).
//   4. Otherwise log-only (preview mode for dev without creds).
//
// For DMN we use Rackspace — already configured with mailboxes + passwords.
// Set these env vars in Vercel:
//   SMTP_HOST=secure.emailsrvr.com
//   SMTP_PORT=465
//   SMTP_USER=hello@joindmn.com
//   SMTP_PASS=<the password Rackspace provided>
// ─────────────────────────────────────────────────────────────────────────

type BuiltMail = { subject: string; html: string; text: string; replyTo: string };

/**
 * Send via whichever transport is configured. Returns the message id on
 * success or throws on failure. Caller decides whether to swallow the
 * error or surface it.
 */
async function dispatchMail(args: {
  to: string;
  from: string;
  mail: BuiltMail;
  tag: string;
}): Promise<{ id?: string; transport: "smtp" | "gmail" | "resend" | "log" }> {
  const { to, from, mail, tag } = args;

  // 1. Generic SMTP (Rackspace + most other providers)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpUser && smtpPass) {
    const port = Number(process.env.SMTP_PORT ?? "465");
    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user: smtpUser, pass: smtpPass },
    });
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    console.info(`[${tag}] sent via SMTP`, { to, host: smtpHost, messageId: info.messageId });
    return { id: info.messageId, transport: "smtp" };
  }

  // 2. Gmail (dev fallback)
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    const nodemailer = (await import("nodemailer")).default;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPass },
    });
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    console.info(`[${tag}] sent via Gmail SMTP`, { to, messageId: info.messageId });
    return { id: info.messageId, transport: "gmail" };
  }

  // 3. Resend API (alternate prod path)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: mail.replyTo,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });
    if (!res.ok) {
      const details = await res.text().catch(() => "");
      throw new Error(`Resend ${tag} failed with ${res.status}: ${details.slice(0, 300)}`);
    }
    const data = (await res.json().catch(() => null)) as { id?: string } | null;
    console.info(`[${tag}] sent via Resend`, { to, messageId: data?.id });
    return { id: data?.id, transport: "resend" };
  }

  // 4. No sender configured — log only.
  console.info(`[${tag}] no sender configured; preview only`, { to, subject: mail.subject });
  return { transport: "log" };
}

export async function sendWaitlistConfirmationEmail(
  input: ConfirmationInput,
): Promise<SendResult> {
  if (process.env.WAITLIST_EMAIL_DISABLED === "true") {
    return { sent: false, reason: "disabled" };
  }

  const mail = buildWaitlistConfirmationEmail(input);
  const result = await dispatchMail({
    to: input.signup.email,
    from: FROM_EMAIL,
    mail,
    tag: "waitlist:email",
  });
  if (result.transport === "log") {
    return { sent: false, reason: "missing_api_key" };
  }
  return { sent: true, id: result.id };
}

// ─────────────────────────────────────────────────────────────────────────
// VENDOR MAGIC LINK
// Used by /api/vendor/signup and /api/vendor/login (magic mode) to send the
// one-time sign-in link to the partner email. Reuses the same Gmail/Resend
// transport stack as the waitlist confirmation; if neither is configured the
// link is logged so a dev can copy it.
// ─────────────────────────────────────────────────────────────────────────

type VendorMagicInput = { email: string; link: string };

function buildVendorMagicEmail({ link }: VendorMagicInput): { subject: string; html: string; text: string; replyTo: string } {
  const subject = "Your partner sign-in link";
  const safeLink = escapeHtml(link);
  const html = `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.creamSoft};font-family:${FONT_BODY};color:${BRAND.ink};">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
  <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND.goldDeep};font-weight:700;margin-bottom:16px;">PARTNER PORTAL</div>
  <h1 style="font-family:${FONT_DISPLAY};font-size:28px;line-height:1.2;font-weight:500;color:${BRAND.ink};margin:0 0 16px;">Your sign-in link</h1>
  <p style="font-size:15px;line-height:1.65;color:${BRAND.inkSoft};margin:0 0 28px;">
    Click the button below to access your Dental Member Network partner portal. The link expires in 30 minutes for your security.
  </p>
  <a href="${safeLink}" style="display:inline-block;background:${BRAND.ink};color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;">Sign in to portal →</a>
  <p style="font-size:13px;line-height:1.6;color:${BRAND.inkMute};margin:28px 0 0;">
    If the button doesn't work, paste this link into your browser:<br/>
    <span style="word-break:break-all;color:${BRAND.goldDeep};">${safeLink}</span>
  </p>
  <hr style="border:0;border-top:1px solid ${BRAND.line};margin:32px 0;" />
  <p style="font-size:12px;line-height:1.6;color:${BRAND.inkMute};margin:0;">
    Didn't request this? You can safely ignore the email — the link won't sign anyone in unless they click it from your inbox.
  </p>
</div>
</body></html>`;
  const text = `Your Dental Member Network partner sign-in link.\n\nOpen this URL to access the portal (expires in 30 minutes):\n${link}\n\nIf you didn't request this, ignore the email.`;
  return { subject, html, text, replyTo: PARTNERSHIPS_EMAIL };
}

// ─────────────────────────────────────────────────────────────────────────
// VENDOR APPROVAL NOTIFICATION
// Sent by /api/admin/vendors/[id]/approve when the team marks a vendor
// approved+verified. Reuses the same transport stack.
// ─────────────────────────────────────────────────────────────────────────

type VendorApprovalInput = {
  email: string;
  contactName: string;
  companyName: string;
  portalUrl: string;
};

function buildVendorApprovalEmail({
  contactName,
  companyName,
  portalUrl,
}: VendorApprovalInput): { subject: string; html: string; text: string; replyTo: string } {
  const subject = `You're verified — ${companyName} is live on the network`;
  const safePortal = escapeHtml(portalUrl);
  const safeName = escapeHtml(contactName);
  const safeCompany = escapeHtml(companyName);
  const html = `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.creamSoft};font-family:${FONT_BODY};color:${BRAND.ink};">
<div style="max-width:580px;margin:0 auto;padding:44px 24px;">
  <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1F5C40;font-weight:700;margin-bottom:18px;">PARTNER VERIFIED</div>
  <h1 style="font-family:${FONT_DISPLAY};font-size:30px;line-height:1.18;font-weight:500;color:${BRAND.ink};margin:0 0 18px;letter-spacing:-.02em;">You're in, ${safeName}.</h1>
  <p style="font-size:16px;line-height:1.7;color:${BRAND.inkSoft};margin:0 0 14px;">
    Our team reviewed <strong>${safeCompany}</strong> and we're delighted to confirm your partner account is now approved and verified.
  </p>
  <p style="font-size:16px;line-height:1.7;color:${BRAND.inkSoft};margin:0 0 28px;">
    Your verified badge is live, and you can now publish services, products, courses, and member offers in the directory. Submissions still go through team review, but the publish gate is open.
  </p>
  <a href="${safePortal}" style="display:inline-block;background:${BRAND.ink};color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;">Open your portal →</a>
  <hr style="border:0;border-top:1px solid ${BRAND.line};margin:36px 0 24px;" />
  <h2 style="font-family:${FONT_BODY};font-size:14px;font-weight:700;color:${BRAND.ink};letter-spacing:.005em;margin:0 0 10px;">What's next</h2>
  <ul style="font-size:14.5px;line-height:1.75;color:${BRAND.inkSoft};margin:0;padding-left:20px;">
    <li>Add your first catalog items — services, products, or courses.</li>
    <li>Attach member offers (discounts, bonuses) to each item.</li>
    <li>Upload your logo, spec sheets, and any supporting documents.</li>
    <li>The first 6 months are on us — you'll add a payment method ahead of month 7.</li>
  </ul>
  <p style="font-size:13px;line-height:1.65;color:${BRAND.inkMute};margin:32px 0 0;">
    Questions? Reply to this email and our partnerships team will get back to you.
  </p>
</div>
</body></html>`;
  const text = `You're in, ${contactName}.

Our team reviewed ${companyName} and your partner account is now approved and verified.

You can now publish services, products, courses, and member offers in the directory.

Open your portal: ${portalUrl}

What's next:
- Add your first catalog items (services, products, courses)
- Attach member offers to each item
- Upload your logo and supporting documents
- The first 6 months are on us — you'll add a payment method ahead of month 7

Questions? Reply to this email.`;
  return { subject, html, text, replyTo: PARTNERSHIPS_EMAIL };
}

// ─────────────────────────────────────────────────────────────────────────
// MEMBER WELCOME EMAIL
// Sent by /api/admin/members/activate when a waitlist signup is promoted
// to an active member. Same brand language as the vendor approval email.
// ─────────────────────────────────────────────────────────────────────────

type MemberWelcomeInput = {
  email: string;
  firstName: string;
  portalUrl: string;
};

function buildMemberWelcomeEmail({ firstName, portalUrl }: MemberWelcomeInput): {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
} {
  const subject = "Your DMN portal is ready";
  const safePortal = escapeHtml(portalUrl);
  const safeName = escapeHtml(firstName);

  const html = `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.creamSoft};font-family:${FONT_BODY};color:${BRAND.ink};">
<div style="max-width:580px;margin:0 auto;padding:44px 24px;">
  <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND.goldDeep};font-weight:700;margin-bottom:18px;">FOUNDING MEMBER · PORTAL ACTIVE</div>
  <h1 style="font-family:${FONT_DISPLAY};font-size:30px;line-height:1.18;font-weight:500;color:${BRAND.ink};margin:0 0 18px;letter-spacing:-.02em;">Welcome, ${safeName}.</h1>
  <p style="font-size:16px;line-height:1.7;color:${BRAND.inkSoft};margin:0 0 14px;">
    Your founding-member portal is live. You'll find the full Resource Kit library waiting for you — practical, no-fluff training built for practice owners. Pick a topic and dig in.
  </p>
  <p style="font-size:16px;line-height:1.7;color:${BRAND.inkSoft};margin:0 0 28px;">
    To get in, click the button below. We'll email you a one-time sign-in link.
  </p>
  <a href="${safePortal}" style="display:inline-block;background:${BRAND.ink};color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:15px;">Open your portal →</a>
  <hr style="border:0;border-top:1px solid ${BRAND.line};margin:36px 0 24px;" />
  <h2 style="font-family:${FONT_BODY};font-size:14px;font-weight:700;color:${BRAND.ink};letter-spacing:.005em;margin:0 0 10px;">What you have access to today</h2>
  <ul style="font-size:14.5px;line-height:1.75;color:${BRAND.inkSoft};margin:0;padding-left:20px;">
    <li>The full Resource Kit library — videos, action guides, worksheets, checklists</li>
    <li>Topic packs on KPIs, scheduling, PPO renegotiation, marketing, SEO and more</li>
    <li>Your member profile (practice details, contact info)</li>
    <li>Future drops auto-unlock — you don't need to do anything</li>
  </ul>
  <p style="font-size:13px;line-height:1.65;color:${BRAND.inkMute};margin:32px 0 0;">
    Questions? Reply to this email — our team reads every reply.
  </p>
</div>
</body></html>`;

  const text = `Welcome, ${firstName}.

Your founding-member portal is live. You'll find the full Resource Kit library waiting for you — practical, no-fluff training built for practice owners. Pick a topic and dig in.

To get in, click the link below. We'll email you a one-time sign-in link.

Open your portal: ${portalUrl}

What you have access to today:
- The full Resource Kit library — videos, action guides, worksheets, checklists
- Topic packs on KPIs, scheduling, PPO renegotiation, marketing, SEO and more
- Your member profile (practice details, contact info)
- Future drops auto-unlock — you don't need to do anything

Questions? Reply to this email — our team reads every reply.`;

  return { subject, html, text, replyTo: SUPPORT_EMAIL };
}

export async function sendMemberWelcomeEmail(input: MemberWelcomeInput): Promise<SendResult> {
  if (process.env.WAITLIST_EMAIL_DISABLED === "true") {
    return { sent: false, reason: "disabled" };
  }
  const mail = buildMemberWelcomeEmail(input);
  const result = await dispatchMail({
    to: input.email,
    from: FROM_EMAIL,
    mail,
    tag: "member:welcome",
  });
  if (result.transport === "log") {
    return { sent: false, reason: "missing_api_key" };
  }
  return { sent: true, id: result.id };
}

export async function sendVendorApprovalEmail(input: VendorApprovalInput): Promise<SendResult> {
  if (process.env.WAITLIST_EMAIL_DISABLED === "true") {
    return { sent: false, reason: "disabled" };
  }

  const mail = buildVendorApprovalEmail(input);
  const result = await dispatchMail({
    to: input.email,
    from: FROM_EMAIL,
    mail,
    tag: "vendor:approval",
  });
  if (result.transport === "log") {
    return { sent: false, reason: "missing_api_key" };
  }
  return { sent: true, id: result.id };
}

export async function sendVendorMagicLinkEmail(input: VendorMagicInput): Promise<SendResult> {
  if (process.env.WAITLIST_EMAIL_DISABLED === "true") {
    return { sent: false, reason: "disabled" };
  }

  const mail = buildVendorMagicEmail(input);
  const result = await dispatchMail({
    to: input.email,
    from: FROM_EMAIL,
    mail,
    tag: "vendor:magic-link",
  });
  if (result.transport === "log") {
    return { sent: false, reason: "missing_api_key" };
  }
  return { sent: true, id: result.id };
}
