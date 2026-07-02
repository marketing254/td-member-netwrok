import "server-only";

/**
 * Confirmation email for a new founding partner / expert. Attaches the
 * signed agreement PDF and points them at their portal.
 *
 * Transport strategy mirrors teamNotify.ts — SMTP if configured,
 * Resend fallback, log-only in dev. Same fromAddress().
 */

const DEFAULT_FROM = "hello@joindmn.com";

function fromAddress(): string {
  return process.env.MAIL_FROM ?? DEFAULT_FROM;
}

export type JoinConfirmationInput = {
  role: "partner" | "expert";
  to: string;
  contactName: string;
  companyName?: string | null;
  pdfBuffer: Buffer;
  pdfFilename: string;
  portalUrl: string;
  agreementVersion: string;
};

export async function sendJoinConfirmationEmail(
  input: JoinConfirmationInput,
): Promise<boolean> {
  const roleLabel = input.role === "partner" ? "Founding Partner" : "Founding Expert";
  const firstName = input.contactName.split(/\s+/)[0] || "there";
  const subject = `You're in — welcome to DMN, ${firstName}`;
  const preheader = `Your ${roleLabel} agreement is confirmed. A copy is attached for your records.`;

  const html = buildHtml({ ...input, roleLabel, firstName, preheader });
  const text = buildText({ ...input, roleLabel, firstName });
  const attachments = [
    {
      filename: input.pdfFilename,
      content: input.pdfBuffer.toString("base64"),
      contentType: "application/pdf",
    },
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
        subject,
        html,
        text,
        attachments: [
          {
            filename: input.pdfFilename,
            content: input.pdfBuffer,
            contentType: "application/pdf",
          },
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
          subject,
          html,
          text,
          attachments,
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

function buildHtml(opts: JoinConfirmationInput & { roleLabel: string; firstName: string; preheader: string }): string {
  return `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;background:#F7F5F0;padding:24px;color:#0A1A2F;">
<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>
<div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:12px;padding:32px;border:1px solid #E0DACE;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-weight:800;letter-spacing:6px;color:#0A1A2F;font-size:20px;">DMN</div>
    <div style="font-size:9px;letter-spacing:2px;color:#5C6770;margin-top:4px;">DENTAL MEMBER NETWORK</div>
  </div>
  <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:500;margin:0 0 8px 0;color:#0A1A2F;">
    You're in, ${opts.firstName}.
  </h1>
  <p style="color:#3B4A55;line-height:1.55;margin:0 0 16px 0;font-size:15px;">
    Welcome to the Dental Member Network as a ${opts.roleLabel}. Your card is safely
    saved with Stripe — billing starts in month 7 (nothing charged today).
  </p>
  <div style="background:#F7EED9;border:1px solid #D9A84B;border-radius:8px;padding:16px;margin:20px 0;">
    <div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#A07823;margin-bottom:8px;">
      YOUR AGREEMENT
    </div>
    <p style="margin:0;font-size:14px;color:#0A1A2F;line-height:1.55;">
      A copy of the DMN Founding Agreement (${opts.agreementVersion}) you accepted is
      attached to this email. Save it — you'll want it on record.
    </p>
  </div>
  <h2 style="font-size:14px;font-weight:800;letter-spacing:1px;color:#5C6770;margin:24px 0 10px 0;">
    WHAT'S NEXT
  </h2>
  <ul style="padding-left:18px;line-height:1.6;color:#3B4A55;font-size:14px;margin:0 0 20px 0;">
    <li>Your profile and listing go live at launch</li>
    <li>Your resource kit is ready in the portal</li>
    <li>We'll email you when members start reaching out</li>
    <li>7 days before trial ends, we'll remind you to update your card if it's expired</li>
  </ul>
  <div style="text-align:center;margin:28px 0 8px 0;">
    <a href="${opts.portalUrl}" style="display:inline-block;background:#0E2A3D;color:#FFFFFF;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
      Open your portal →
    </a>
  </div>
  <p style="color:#7A8590;font-size:12px;line-height:1.5;margin:24px 0 0 0;text-align:center;">
    Questions? Reply to this email — hello@joindmn.com.<br/>
    Cancel anytime with 30 days' written notice.
  </p>
</div>
</body></html>`;
}

function buildText(opts: JoinConfirmationInput & { roleLabel: string; firstName: string }): string {
  return `You're in, ${opts.firstName}.

Welcome to the Dental Member Network as a ${opts.roleLabel}. Your card is safely
saved with Stripe — billing starts in month 7 (nothing charged today).

A copy of the DMN Founding Agreement (${opts.agreementVersion}) you accepted is
attached to this email. Save it — you'll want it on record.

What's next:
  • Your profile and listing go live at launch
  • Your resource kit is ready in the portal
  • We'll email you when members start reaching out
  • 7 days before trial ends, we'll remind you to update your card if it's expired

Open your portal: ${opts.portalUrl}

Questions? Reply to this email — hello@joindmn.com.
Cancel anytime with 30 days' written notice.
`;
}
