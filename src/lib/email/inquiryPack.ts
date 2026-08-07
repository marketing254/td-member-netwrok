import nodemailer from "nodemailer";

/**
 * Sends the Beacon inquiry pack email. Transactional-first: if the
 * dedicated dentalmembernetwork.com mailbox is configured (SMTP_TX_*) it
 * sends From noreply@dentalmembernetwork.com; otherwise it falls back to
 * the existing marketing mailbox so From stays SPF-aligned with whatever
 * domain actually authenticates. Reply-To is always support@.
 *
 * See handover/pearl-ai-expert/email-domains.md for the domain plan.
 */

const SUPPORT = process.env.MAIL_REPLYTO_SUPPORT ?? "support@dentalmembernetwork.com";

type TransportChoice = { transport: nodemailer.Transporter; from: string };

function pickTransport(): TransportChoice | null {
  // 1. Transactional (dentalmembernetwork.com) — preferred.
  if (process.env.SMTP_TX_HOST && process.env.SMTP_TX_USER && process.env.SMTP_TX_PASS) {
    const port = Number(process.env.SMTP_TX_PORT ?? "465");
    return {
      transport: nodemailer.createTransport({
        host: process.env.SMTP_TX_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_TX_USER, pass: process.env.SMTP_TX_PASS },
      }),
      from: process.env.MAIL_FROM_TX ?? "Dental Member Network <noreply@dentalmembernetwork.com>",
    };
  }
  // 2. Marketing (joindmn.com) — fallback so it still delivers.
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT ?? "465");
    return {
      transport: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      }),
      from: process.env.WAITLIST_EMAIL_FROM ?? "Dental Member Network <hello@joindmn.com>",
    };
  }
  return null;
}

function renderHtml(input: { memberName: string; pdfUrl: string; question: string }): string {
  const q = input.question
    ? `<p style="margin:0 0 18px;color:#3B4A55;font-style:italic">You asked: “${escapeHtml(input.question)}”</p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#FBF8F1;font-family:Arial,Helvetica,sans-serif;color:#3B4A55">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="font-size:11px;letter-spacing:2px;color:#A07823;text-transform:uppercase;margin-bottom:10px">Dental Member Network</div>
    <h1 style="font-size:22px;color:#0A1A2F;margin:0 0 14px">Thanks — the team will be in touch</h1>
    <p style="margin:0 0 14px">Hi ${escapeHtml(input.memberName)}, we&apos;ve got your question and a member of the team will get back to you within <strong>2–3 business days</strong>.</p>
    ${q}
    <p style="margin:0 0 20px">In the meantime, here&apos;s a pack of everything your membership gives you right now — every expert, partner offer, and resource in the portal.</p>
    <p style="margin:0 0 26px">
      <a href="${escapeAttr(input.pdfUrl)}" style="display:inline-block;background:#0A1A2F;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:6px">Download your DMN pack (PDF)</a>
    </p>
    <p style="margin:0 0 4px;font-size:13px">It&apos;s also attached to this email, and waiting in your portal Inbox.</p>
    <hr style="border:none;border-top:1px solid #E6DDCF;margin:24px 0" />
    <p style="font-size:12px;color:#7A8590;margin:0">Prefer a person now? Call the hotline on <strong>(855) 633-4707</strong> or reply to this email — it reaches <a href="mailto:${SUPPORT}" style="color:#A07823">${SUPPORT}</a>.</p>
  </div></body></html>`;
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(v: string): string {
  return v.replace(/"/g, "&quot;");
}

export async function sendInquiryPackEmail(input: {
  to: string;
  memberName: string;
  pdfUrl: string;
  pdfBuffer: Buffer;
  question: string;
}): Promise<{ sent: boolean }> {
  const choice = pickTransport();
  if (!choice) {
    console.info("[inquiry-pack] no SMTP configured; email skipped", { to: input.to });
    return { sent: false };
  }
  await choice.transport.sendMail({
    from: choice.from,
    to: input.to,
    replyTo: SUPPORT,
    subject: "Your Dental Member Network pack",
    html: renderHtml(input),
    attachments: [{ filename: "DMN-member-pack.pdf", content: input.pdfBuffer, contentType: "application/pdf" }],
  });
  return { sent: true };
}
