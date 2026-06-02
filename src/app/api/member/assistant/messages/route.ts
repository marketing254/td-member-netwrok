import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth/guards";
import {
  ASSISTANT_MAX_TOKENS,
  ASSISTANT_MODEL,
  buildAssistantSystemPrompt,
  getAnthropic,
} from "@/lib/ai/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Streaming responses can run longer than the default 10s edge limit.
export const maxDuration = 60;

/** Maximum messages from history to send Claude on each turn. */
const HISTORY_WINDOW = 20;
/** User messages allowed per member per rolling 24h. */
const DAILY_USER_LIMIT = 30;
/** Hard cap on incoming message length to prevent runaway tokens. */
const MAX_USER_MESSAGE_CHARS = 4000;

/**
 * GET /api/member/assistant/messages
 *
 * Returns the signed-in member's prior conversation, oldest first.
 * The widget loads this on first open so the chat shows where the
 * member left off across sessions.
 */
export async function GET() {
  const guard = await requireMember();
  if (!guard.ok) return guard.response;

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("member_assistant_messages")
    .select("id, role, content, created_at")
    .eq("member_id", guard.memberId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ messages: data ?? [] });
}

/**
 * POST /api/member/assistant/messages
 *
 * Body: { content: string }
 * Response: text/plain stream — each chunk is the next bit of the assistant
 * reply. The full assistant message is also persisted to the DB once the
 * stream completes.
 */
export async function POST(req: Request) {
  const guard = await requireMember();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as { content?: string };
  const raw = typeof body.content === "string" ? body.content.trim() : "";

  if (!raw) {
    return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });
  }
  if (raw.length > MAX_USER_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: `Message is too long (${raw.length} chars, max ${MAX_USER_MESSAGE_CHARS}).` },
      { status: 400 },
    );
  }

  const sb = getSupabaseAdmin();

  // ---- 1. Rate limit (user messages in last 24h) ----
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await sb
    .from("member_assistant_messages")
    .select("id", { head: true, count: "exact" })
    .eq("member_id", guard.memberId)
    .eq("role", "user")
    .gte("created_at", since);

  if ((recentCount ?? 0) >= DAILY_USER_LIMIT) {
    return NextResponse.json(
      {
        error: `You've hit your daily limit of ${DAILY_USER_LIMIT} assistant messages. Try again tomorrow or email members@joindmn.com.`,
      },
      { status: 429 },
    );
  }

  // ---- 2. Persist the user message before we call Claude, so a crash
  //         halfway through doesn't lose what the member typed.
  const { error: insErr } = await sb.from("member_assistant_messages").insert({
    member_id: guard.memberId,
    role: "user",
    content: raw,
  });
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  // ---- 3. Pull recent history (capped at HISTORY_WINDOW) ----
  const { data: history } = await sb
    .from("member_assistant_messages")
    .select("role, content")
    .eq("member_id", guard.memberId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_WINDOW);

  const ordered = (history ?? []).slice().reverse();
  const claudeMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of ordered) {
    if (m.role === "user" || m.role === "assistant") {
      claudeMessages.push({ role: m.role, content: m.content });
    }
  }

  // ---- 4. Stream the assistant response ----
  let anthropic;
  try {
    anthropic = getAnthropic();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Assistant unavailable." },
      { status: 503 },
    );
  }

  const systemPrompt = buildAssistantSystemPrompt({
    firstName: guard.firstName,
    tier: null, // (CurrentMember.tier isn't on the guard yet — defaults to "member" voice)
    status: guard.status,
  });

  const encoder = new TextEncoder();
  let fullText = "";
  let inputTokens: number | null = null;
  let outputTokens: number | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const eventStream = anthropic.messages.stream({
          model: ASSISTANT_MODEL,
          max_tokens: ASSISTANT_MAX_TOKENS,
          system: systemPrompt,
          messages: claudeMessages,
        });

        for await (const event of eventStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text;
            fullText += chunk;
            controller.enqueue(encoder.encode(chunk));
          } else if (event.type === "message_start") {
            inputTokens = event.message.usage?.input_tokens ?? null;
          } else if (event.type === "message_delta") {
            outputTokens = event.usage?.output_tokens ?? outputTokens;
          }
        }

        // Persist the assistant message (best effort — we still close the
        // stream cleanly if this fails so the member sees the response).
        if (fullText.trim()) {
          try {
            await sb.from("member_assistant_messages").insert({
              member_id: guard.memberId,
              role: "assistant",
              content: fullText,
              tokens_input: inputTokens,
              tokens_output: outputTokens,
            });
          } catch {
            /* swallow — content already streamed to the client */
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Assistant error";
        // Stream a small error suffix so the user sees something rather
        // than the chat hanging silently.
        controller.enqueue(encoder.encode(`\n\n[assistant error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
