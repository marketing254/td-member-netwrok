/**
 * Slack notifications for the DMN Inquiries channel.
 *
 * Two supported configs (see handover/pearl-ai-expert/slack-bot/):
 *   - Bot token + channel id (SLACK_BOT_TOKEN + SLACK_INQUIRIES_CHANNEL_ID)
 *     → chat.postMessage, returns the message ts for later threading.
 *   - Incoming webhook (SLACK_INQUIRIES_WEBHOOK_URL) → simpler, no ts.
 *
 * All failures are swallowed and logged — Slack being down must never
 * fail the member's request (the inquiry row + email are source of truth).
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dentalmembernetwork.com";

function buildBlocks(input: { memberName: string; email: string; question: string }): unknown[] {
  // Block-quote every line so multi-line questions stay inside the quote.
  const question = input.question.slice(0, 2500).split("\n").map((l) => `>${l}`).join("\n");
  return [
    { type: "header", text: { type: "plain_text", text: "New Member Inquiry", emoji: false } },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: "*Pearl* · Dental Member Network · Member portal" }],
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Member*\n${input.memberName}` },
        { type: "mrkdwn", text: `*Reply to*\n<mailto:${input.email}|${input.email}>` },
      ],
    },
    { type: "section", text: { type: "mrkdwn", text: `*Question*\n${question}` } },
    { type: "divider" },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: "✓ Member Pack emailed automatically  ·  ⏱ Reply within *2–3 business days* from support@dentalmembernetwork.com" },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          style: "primary",
          text: { type: "plain_text", text: "Open Hotline Triage", emoji: false },
          url: `${APP_URL}/admin/hotline`,
        },
      ],
    },
  ];
}

export async function notifyInquirySlack(input: {
  memberName: string;
  email: string;
  question: string;
}): Promise<string | null> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_INQUIRIES_CHANNEL_ID;
  const webhook = process.env.SLACK_INQUIRIES_WEBHOOK_URL;
  const blocks = buildBlocks(input);
  const text = `New Pearl inquiry from ${input.memberName}`;

  try {
    if (token && channel) {
      const res = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ channel, text, blocks }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; ts?: string; error?: string };
      if (!j.ok) console.warn("[slack] chat.postMessage failed", j.error);
      return j.ts ?? null;
    }
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, blocks }),
      });
      return null;
    }
    console.info("[slack] not configured; notification skipped");
    return null;
  } catch (err) {
    console.warn("[slack] notify failed", err instanceof Error ? err.message : err);
    return null;
  }
}
