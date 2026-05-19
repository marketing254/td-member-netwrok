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

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dentalmembernetwork.com";
const SUPPORT_EMAIL = process.env.WAITLIST_SUPPORT_EMAIL ?? "hello@dentalmembernetwork.com";
const PARTNERSHIPS_EMAIL =
  process.env.WAITLIST_PARTNERSHIPS_EMAIL ?? "partnerships@dentalmembernetwork.com";
const FROM_EMAIL =
  process.env.WAITLIST_EMAIL_FROM ??
  "Dental Member Network <hello@dentalmembernetwork.com>";

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
    subject: "Welcome to the Dental Member Network, your lifetime spot is locked in",
    preview:
      "Your founding membership is confirmed. $49/month locked in, for life. Here's what happens next.",
    eyebrow: "Founding Member",
    headline: "Your lifetime spot is locked in.",
    accent: BRAND.gold,
    accentLight: BRAND.goldLight,
    replyTo: SUPPORT_EMAIL,
    intro: [
      `Hi ${firstName(input.signup.fullName)},`,
      "Welcome to the Dental Member Network. Your founding membership is confirmed and your $49/month lifetime price is locked in, for life. No surprise increases, ever.",
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
          "Your founding member status is permanent. As we add features over time, you keep access at the same $49/month lifetime price.",
          'Member discounts on vendor products and services are clearly marked in the Vendor Directory, just look for the "Member Benefit" panel on each vendor\'s card.',
          "If you registered with a practice email, feel free to invite your office manager or team members to set up their own accounts. The first 1,000 founding spots are still open.",
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

function expertDraft(input: ConfirmationInput): EmailDraft {
  const submitted = formatDate(input.submittedAt);
  return {
    role: "expert",
    subject: "Your Dental Member Network expert application, what happens next",
    preview:
      "We received your founding expert application. Our team reviews carefully, here's what to expect.",
    eyebrow: "Expert Application",
    headline: "Your founding expert application is in review.",
    accent: "#2AA7B8",
    accentLight: "#7FD2DE",
    replyTo: PARTNERSHIPS_EMAIL,
    intro: [
      `Hi ${firstName(input.signup.fullName)},`,
      "Thank you for applying to join the Dental Member Network as a founding expert. We've received your application and it's now in review.",
    ],
    sections: [
      {
        title: "Here's what to expect",
        body:
          "Within the next 5 business days, our team will review your application against our founding expert criteria, primarily your track record serving dental practice owners, the distinctiveness of your coaching or consulting approach, and the fit with our member base. We review carefully because protecting member trust is the whole point of curation.",
      },
      {
        title: "If your application is approved",
        items: [
          "You'll receive an approval email with a link to schedule a 30-minute onboarding conversation with our team.",
          "During onboarding, we'll set up your expert profile, walk you through how to publish your first paid course, and connect you with the Thriving Dentist editorial team for newsletter, podcast, and webinar feature opportunities.",
          "Your founding offer locks in: free for the first 6 months, then $99/month. No commission on any courses you sell to members during your founding window.",
        ],
      },
      {
        title: "If we have follow-up questions",
        body: `We may reach out by email to clarify aspects of your application or request additional information about your coaching approach. Watch for a message from ${PARTNERSHIPS_EMAIL}.`,
      },
      {
        title: "A few things worth knowing while you wait",
        items: [
          "Founding expert spots are limited. We're curating launch experts deliberately to cover the full range of practice growth specialties without overlapping too heavily in any one area.",
          "You set your own course prices. The network handles the platform, payment processing, and member promotion; the pricing and content of your offerings stay entirely yours.",
          "Members get a discount on every paid course. This is standard across all expert offerings and helps your courses reach more members faster.",
        ],
      },
    ],
    closing: `If you have questions in the meantime, reply to this email and we'll get back to you within one business day.`,
    signoff: [
      "Thanks for your interest in helping us build the network.",
      " The Dental Member Network Team",
      "Powered by Thriving Dentist",
    ],
    footerNote: "Do not reply to this email.",
    footerLines: [
      "This is an automated confirmation email for your Dental Member Network expert application.",
      `Application reference: ${input.referenceId} · Submitted: ${submitted}`,
      `Dental Member Network · ${PARTNERSHIPS_EMAIL} · dentalmembernetwork.com`,
    ],
  };
}

function vendorDraft(input: ConfirmationInput): EmailDraft {
  const submitted = formatDate(input.submittedAt);
  const companyName = input.signup.practiceName ?? "your company";
  const agreementUrl = normalizeUrl("/agreement/vendor");
  return {
    role: "vendor",
    subject: "Your Vendor Network partnership application, what happens next",
    preview:
      "We received your founding vendor partner application and your file is now in review.",
    eyebrow: "Vendor Partnership",
    headline: "Your founding vendor partner application is in review.",
    accent: "#2E8A57",
    accentLight: "#6FB287",
    replyTo: PARTNERSHIPS_EMAIL,
    intro: [
      `Hi ${firstName(input.signup.fullName)},`,
      "Thank you for applying to join the Dental Member Network as a founding vendor partner. We've received your application along with your acceptance of the Vendor Network Partnership Agreement, and your file is now in review.",
    ],
    sections: [
      {
        title: "Here's what to expect",
        body:
          "Within the next 5 business days, our partnerships team will review your application. We're verifying three things primarily: the fit of your service category with what our members need, the strength of the member discount you've committed to, and your ability to deliver responsive service through the partner hotline.",
      },
      {
        title: "If your application is approved",
        items: [
          "You'll receive an approval email with onboarding instructions, including how to access the partner dashboard, where to upload your final logo and assets, and how to confirm your directory listing draft before it goes live.",
          "We'll schedule a 30-minute onboarding call to walk you through the partner hotline setup, lead routing, the Verified Partner badge you can use on your own site, and the editorial calendar for newsletter, podcast, and webinar feature eligibility.",
          "Your founding partner pricing locks in: $0 for months 1–6, $49/month for months 7–12, and $199/month standard rate from month 13. Cancel anytime with 30 days' written notice through the partner dashboard.",
        ],
      },
      {
        title: "What you committed to in your application",
        items: [
          "Offering our members your best available deal.",
          "Joining our private partner hotline for member coordination.",
          "Maintaining the calendar booking link you provided.",
          "Accepting evolution of network terms with 30 days' notice via the partner dashboard.",
          "Paying the partnership fee (waived for the first 6 months as a founding partner).",
        ],
      },
      {
        title: "If we have follow-up questions",
        body: `We may reach out by email to clarify aspects of your service offering, the specifics of the member discount you've committed to, or your operational capacity. Watch for a message from ${PARTNERSHIPS_EMAIL}.`,
      },
    ],
    cta: {
      label: "Review the partnership agreement",
      url: agreementUrl,
    },
    closing:
      "While your application is in review, the partnerships team is happy to answer questions about how the network operates, how leads are routed, or what to expect during onboarding. Just reply to this email.",
    signoff: [
      "We're glad you applied. Looking forward to connecting soon.",
      " The Dental Member Network Team",
      "Powered by Thriving Dentist",
    ],
    footerNote: "Do not reply to this email.",
    footerLines: [
      "This is an automated confirmation email for your Dental Member Network vendor application.",
      `Application reference: ${input.referenceId} · Company: ${companyName} · Submitted: ${submitted}`,
      `Dental Member Network · ${PARTNERSHIPS_EMAIL} · dentalmembernetwork.com`,
    ],
  };
}

function draftFor(input: ConfirmationInput): EmailDraft {
  if (input.signup.role === "vendor") return vendorDraft(input);
  if (input.signup.role === "expert") return expertDraft(input);
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
// Selection priority:
//   1. Gmail SMTP if GMAIL_USER + GMAIL_APP_PASSWORD are set
//      (used during pre-launch testing, works for any recipient,
//       no DNS or domain verification needed)
//   2. Resend API if RESEND_API_KEY is set
//      (used in production once a sending domain is verified at resend.com)
//   3. Otherwise log-only (preview mode for dev without creds)
// ─────────────────────────────────────────────────────────────────────────

async function sendViaGmail(input: ConfirmationInput): Promise<{ id?: string }> {
  // Lazy-import nodemailer so the module only loads when actually needed.
  // Keeps cold-start fast and avoids a dependency at edge runtime.
  const nodemailer = (await import("nodemailer")).default;
  const email = buildWaitlistConfirmationEmail(input);

  const user = process.env.GMAIL_USER!;
  const pass = process.env.GMAIL_APP_PASSWORD!;
  // Gmail forces the SMTP-authenticated user as the envelope From. Honor
  // the WAITLIST_EMAIL_FROM display name when present (e.g.
  // "Dental Member Network <marketingbizycorp@gmail.com>"), otherwise
  // default to a sensible name.
  const fromHeader =
    process.env.WAITLIST_EMAIL_FROM ?? `Dental Member Network <${user}>`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: fromHeader,
    to: input.signup.email,
    replyTo: email.replyTo,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  return { id: info.messageId };
}

async function sendViaResend(input: ConfirmationInput): Promise<{ id?: string }> {
  const email = buildWaitlistConfirmationEmail(input);
  const apiKey = process.env.RESEND_API_KEY!;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [input.signup.email],
      reply_to: email.replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });

  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(`Resend email failed with ${res.status}: ${details.slice(0, 300)}`);
  }

  const data = (await res.json().catch(() => null)) as { id?: string } | null;
  return { id: data?.id };
}

export async function sendWaitlistConfirmationEmail(
  input: ConfirmationInput,
): Promise<SendResult> {
  if (process.env.WAITLIST_EMAIL_DISABLED === "true") {
    return { sent: false, reason: "disabled" };
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const resendKey = process.env.RESEND_API_KEY;

  if (gmailUser && gmailPass) {
    const { id } = await sendViaGmail(input);
    console.info("[waitlist:email] sent via Gmail SMTP", {
      to: input.signup.email,
      role: input.signup.role,
      messageId: id,
    });
    return { sent: true, id };
  }

  if (resendKey) {
    const { id } = await sendViaResend(input);
    console.info("[waitlist:email] sent via Resend", {
      to: input.signup.email,
      role: input.signup.role,
      messageId: id,
    });
    return { sent: true, id };
  }

  // No sender configured, log so a dev sees what would have shipped.
  const email = buildWaitlistConfirmationEmail(input);
  console.info("[waitlist:email] no sender configured; preview only", {
    to: input.signup.email,
    role: input.signup.role,
    subject: email.subject,
    referenceId: input.referenceId,
  });
  return { sent: false, reason: "missing_api_key" };
}
