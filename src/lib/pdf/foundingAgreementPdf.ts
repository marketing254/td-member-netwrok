import "server-only";
import { readFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";

/**
 * Personalized founding agreement renderer.
 *
 * The approved v4 documents are HTML templates. We substitute only the
 * documented tokens, then print the result through headless Chrome at
 * Letter size so the attached/signed PDF matches the legal source.
 *
 * Chrome itself differs by environment: on Vercel (or any Lambda-style
 * host) there's no system browser, so we launch the bundled serverless
 * Chromium from @sparticuz/chromium. Locally we drive whatever Chrome/
 * Edge is already installed — no extra setup for developers.
 */

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

function loadTemplate(role: FoundingAgreementPdfInput["role"]): Promise<string> {
  switch (role) {
    case "expert":
      return readFile(new URL("./templates/agreement_expert.html", import.meta.url), "utf8");
    case "partner":
      return readFile(new URL("./templates/agreement_partner.html", import.meta.url), "utf8");
    case "both":
      return readFile(new URL("./templates/agreement_expert_partner.html", import.meta.url), "utf8");
  }
}

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
  const template = await loadTemplate(input.role);
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

async function launchBrowser(): Promise<Browser> {
  if (IS_SERVERLESS) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });
  }
  const { resolveLocalChromeExecutable } = await import("./resolveLocalChrome");
  return puppeteer.launch({
    executablePath: resolveLocalChromeExecutable(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

async function printHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
    // Templates pull Google Fonts via a <link>, which doesn't block the
    // load event — wait for the actual font files so the PDF doesn't
    // print with the fallback font.
    await Promise.race([
      page.evaluate(() => document.fonts.ready),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
    const pdf = await page.pdf({
      format: "letter",
      printBackground: true,
      timeout: 30_000,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function renderFoundingAgreementPdf(
  input: FoundingAgreementPdfInput,
): Promise<Buffer> {
  return printHtmlToPdf(await renderAgreementHtml(input));
}
