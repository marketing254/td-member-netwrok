import "server-only";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

/**
 * Personalized founding agreement renderer.
 *
 * The approved v4 documents are HTML templates. We substitute only the
 * documented tokens, then print the result through headless Chrome at
 * Letter size so the attached/signed PDF matches the legal source.
 */

const execFileAsync = promisify(execFile);

const TEMPLATE_BY_ROLE = {
  expert: new URL("./templates/agreement_expert.html", import.meta.url),
  partner: new URL("./templates/agreement_partner.html", import.meta.url),
  both: new URL("./templates/agreement_expert_partner.html", import.meta.url),
} as const;

export type FoundingAgreementPdfInput = {
  role: "partner" | "expert" | "both";
  signer: {
    name: string;
    email: string;
    companyName?: string | null;
  };
  memberOffer?: string | null;
  signedAt: Date;
  ipHashLast6: string;
  accepted?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatEffectiveDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function memberOfferFor(input: FoundingAgreementPdfInput): string {
  if (input.role === "expert") return "";
  const offer = input.memberOffer?.trim();
  return offer || "To be confirmed before your listing goes live.";
}

async function renderAgreementHtml(input: FoundingAgreementPdfInput): Promise<string> {
  const template = await readFile(TEMPLATE_BY_ROLE[input.role], "utf8");
  const accepted = input.accepted !== false;
  const tokens: Record<string, string> = {
    SIGNER_NAME: input.signer.name,
    SIGNER_EMAIL: input.signer.email,
    COMPANY: input.signer.companyName?.trim() || input.signer.name,
    MEMBER_OFFER: memberOfferFor(input),
    EFFECTIVE_DATETIME: formatEffectiveDate(input.signedAt),
    STATUS: accepted
      ? `Accepted electronically. IP fingerprint SHA-256 ${input.ipHashLast6}`
      : "Awaiting electronic acceptance via your private invite link",
  };

  return Object.entries(tokens).reduce(
    (html, [token, value]) => html.replaceAll(`{{${token}}}`, escapeHtml(value)),
    template,
  );
}

function resolveChromeExecutable(): string {
  const configured =
    process.env.CHROME_PATH ??
    process.env.CHROMIUM_PATH ??
    process.env.PUPPETEER_EXECUTABLE_PATH ??
    null;
  if (configured && existsSync(configured)) return configured;

  const commonPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const found = commonPaths.find((candidate) => existsSync(candidate));
  if (found) return found;

  throw new Error(
    "Headless Chrome was not found. Set CHROME_PATH, CHROMIUM_PATH, or PUPPETEER_EXECUTABLE_PATH so founding agreement PDFs can be rendered.",
  );
}

async function printHtmlToPdf(html: string): Promise<Buffer> {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "dmn-agreement-"));
  const htmlPath = path.join(tmpDir, "agreement.html");
  const pdfPath = path.join(tmpDir, "agreement.pdf");

  try {
    await writeFile(htmlPath, html, "utf8");
    await execFileAsync(
      resolveChromeExecutable(),
      [
        "--headless=new",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--allow-file-access-from-files",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=5000",
        "--no-pdf-header-footer",
        "--print-to-pdf-no-header",
        `--print-to-pdf=${pdfPath}`,
        pathToFileURL(htmlPath).href,
      ],
      { timeout: 30_000, windowsHide: true },
    );
    return await readFile(pdfPath);
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function renderFoundingAgreementPdf(
  input: FoundingAgreementPdfInput,
): Promise<Buffer> {
  return printHtmlToPdf(await renderAgreementHtml(input));
}
