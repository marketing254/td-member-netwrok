import "server-only";
import { getOpenAI } from "@/lib/ai/assistant";

/** Accepted uploads. Mirrors the client-side accept list on the page. */
export const SO_ACCEPTED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/webp"] as const;
export const SO_ACCEPTED_EXT = [".pdf", ".png", ".jpg", ".jpeg", ".webp"] as const;
export const SO_MAX_BYTES = 15 * 1024 * 1024;
/** Cap on text sent to the model. A 40-page contract fits; beyond that we truncate and say so. */
export const SO_MAX_CHARS = 60_000;
/** Below this, a PDF almost certainly has no text layer (a scan). */
const MIN_USEFUL_CHARS = 120;

export type Extracted = { text: string; truncated: boolean; pages: number | null; via: "pdf-text" | "vision" };

export function validateUpload(file: { name: string; size: number; type: string }): string | null {
  if (!file.name || file.size <= 0) return "That file looks empty. Try attaching it again.";
  if (file.size > SO_MAX_BYTES) return "Files must be under 15MB.";
  const lower = file.name.toLowerCase();
  const extOk = SO_ACCEPTED_EXT.some((e) => lower.endsWith(e));
  const mimeOk = (SO_ACCEPTED_MIME as readonly string[]).includes(file.type);
  if (!extOk || !mimeOk) return "Upload a PDF, or a PNG, JPG or WebP image.";
  if (file.name.length > 255) return "That filename is too long. Rename it and try again.";
  return null;
}

export function safeFilename(name: string): string {
  const base = name.replace(/[\\/]/g, "_").replace(/[^\w.\- ()]/g, "").trim();
  return base.slice(0, 120) || "document";
}

/** Text from a PDF's own text layer, page by page. */
async function extractPdfText(buf: Buffer): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buf),
    useWorkerFetch: false,
    disableFontFace: true,
  }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (line) parts.push(`[Page ${i}]\n${line}`);
  }
  return { text: parts.join("\n\n"), pages: doc.numPages };
}

/** Transcribe an image (screenshot, photo of a quote) with the vision model. Transcription only, no opinion. */
async function transcribeImage(buf: Buffer, mime: string): Promise<string> {
  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 4000,
    messages: [
      {
        role: "system",
        content:
          "You transcribe documents. Return the full text of the image exactly as written, keeping headings, line breaks, numbers and currency symbols. Do not summarise, interpret or add anything. If the image holds no readable text, reply with exactly: NO_TEXT",
      },
      {
        role: "user",
        content: [{ type: "image_url", image_url: { url: `data:${mime};base64,${buf.toString("base64")}`, detail: "high" } }],
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim() ?? "";
  return text === "NO_TEXT" ? "" : text;
}

export async function extractText(buf: Buffer, mime: string): Promise<Extracted> {
  let text = "";
  let pages: number | null = null;
  let via: Extracted["via"] = "pdf-text";
  if (mime === "application/pdf") {
    const r = await extractPdfText(buf);
    text = r.text;
    pages = r.pages;
  } else {
    via = "vision";
    text = await transcribeImage(buf, mime);
  }
  if (text.replace(/\[Page \d+\]/g, "").trim().length < MIN_USEFUL_CHARS) {
    throw new ExtractError(
      mime === "application/pdf"
        ? "We could not read any text in that PDF. It may be a scan. Try a screenshot of the pages instead."
        : "We could not read any text in that image. Try a clearer, closer picture, or the original PDF.",
    );
  }
  const truncated = text.length > SO_MAX_CHARS;
  return { text: truncated ? text.slice(0, SO_MAX_CHARS) : text, truncated, pages, via };
}

export class ExtractError extends Error {}
