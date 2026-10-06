import "server-only";
import { readFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";
import { cadenceOf, costsParagraph, hasStep, normalizePlan, planAmounts, planLabel, referralLine, type PartnerPlan } from "@/lib/billing/partnerPlan";

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

// Fonts are embedded as base64 data URIs rather than fetched from Google
// Fonts at render time. The serverless Chromium starts with almost no
// fonts and has to fetch them fresh on every cold start; if that fetch is
// slow or fails, text falls back to a different font with different
// metrics — shifting pagination and page breaks versus what renders
// locally. Embedding removes that network dependency entirely so the PDF
// is byte-identical regardless of environment. Both files are variable
// fonts, so one file each covers every weight used (600/700 for
// Fraunces, 400/500/600/700 for Inter).
let FONT_FACE_CSS: string | null = null;
async function getFontFaceCss(): Promise<string> {
  if (FONT_FACE_CSS) return FONT_FACE_CSS;
  const [fraunces, inter] = await Promise.all([
    readFile(new URL("./fonts/fraunces-latin.woff2", import.meta.url)),
    readFile(new URL("./fonts/inter-latin.woff2", import.meta.url)),
  ]);
  const frauncesUrl = `data:font/woff2;base64,${fraunces.toString("base64")}`;
  const interUrl = `data:font/woff2;base64,${inter.toString("base64")}`;
  FONT_FACE_CSS = [600, 700]
    .map(
      (w) =>
        `@font-face{font-family:'Fraunces';font-style:normal;font-weight:${w};src:url(${frauncesUrl}) format('woff2');}`,
    )
    .concat(
      [400, 500, 600, 700].map(
        (w) =>
          `@font-face{font-family:'Inter';font-style:normal;font-weight:${w};src:url(${interUrl}) format('woff2');}`,
      ),
    )
    .join("");
  return FONT_FACE_CSS;
}

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
  /**
   * Partner price plan (0066). "ladder" prints the original $49 → $199
   * ramp with the annual pre-pay line; anything else prints the flat $49
   * plan. Expert-only agreements have no ramp block at all.
   */
  pricing?: PartnerPlan | null;
  signer: {
    name: string;
    email: string;
    companyName?: string | null;
  };
  // When a partner/expert names several companies, list them here. The PDF
  // itemizes each one and {{COMPANY}} becomes the joined list. Falls back to
  // signer.companyName when omitted.
  companies?: { name: string; category?: string | null; member_offer?: string | null }[] | null;
  memberOffer?: string | null;
  signedAt: Date;
  ipHashLast6: string;
  accepted?: boolean;
};

/**
 * Fee ramp for the partner agreements ("3. What it costs"). Static HTML,
 * no user input, so it is injected raw like {{COMPANIES_LIST}}.
 */
function rampBlockHtml(pricing: FoundingAgreementPdfInput["pricing"]): string {
  const plan = normalizePlan(pricing);
  const a = planAmounts(plan);
  const unit = cadenceOf(plan) === "monthly" ? "/mo" : "/3 mo";
  const step = (amount: string, label: string) =>
    `<div class="rstep"><div class="n">${amount}</div><div class="l">${label}</div></div>`;
  const per = `<span style="font-size:9pt;color:#5C6B7A;">${unit}</span>`;
  const steps = hasStep(plan)
    ? `${step("$0", "Months 1&ndash;6")}${step(`$${a.growth}${per}`, "Months 7&ndash;12")}${step(`$${a.standard}${per}`, "Month 13+ &middot; standard")}`
    : `${step("$0", "Months 1&ndash;6")}${step(`$${a.growth}${per}`, "Month 7 onward")}`;
  return `<p style="margin:0 0 4px;">${escapeHtml(costsParagraph(plan))}</p><div class="ramp">${steps}</div><p style="font-size:9pt;color:#5C6B7A;">Your plan: ${escapeHtml(planLabel(plan))}. You&#39;ll see this on the sign-up page before you pay.</p>`;
}

/** Section 3 intro and the Schedule B referral line, per plan. */
function billingIntroHtml(pricing: FoundingAgreementPdfInput["pricing"], role: FoundingAgreementPdfInput["role"]): string {
  const plan = normalizePlan(pricing);
  const cadence = cadenceOf(plan) === "monthly" ? "monthly" : "every three months";
  if (role === "both") {
    return isFoundingBoth(pricing)
      ? `Your company&#39;s partner listing, billed ${cadence} through Stripe:`
      : `Your expert and partner listing (one fee covers both), billed ${cadence} through Stripe:`;
  }
  return `Your partner listing, billed ${cadence} through Stripe:`;
}
function refundLineHtml(pricing: FoundingAgreementPdfInput["pricing"]): string {
  return cadenceOf(normalizePlan(pricing)) === "monthly" ? "No pro-rated refunds for partial months." : "No pro-rated refunds for part of a quarter.";
}
/**
 * The quarterly Expert + Partner agreement is not a founding one (Lester,
 * 6 Oct 2026): no free expert listing, no "founding", one fee covers both
 * roles. The monthly one keeps the founding wording.
 */
function isFoundingBoth(pricing: FoundingAgreementPdfInput["pricing"]): boolean {
  return cadenceOf(normalizePlan(pricing)) === "monthly";
}
function expertListingBoxHtml(pricing: FoundingAgreementPdfInput["pricing"]): string {
  return isFoundingBoth(pricing)
    ? `<div class="free"><b>Your expert listing</b> (your content and profile): <b>free, for as long as your membership stays continuously active</b>, our founding-expert offer. If you cancel and re-join, this no longer applies.</div>`
    : "";
}
function termLineHtml(pricing: FoundingAgreementPdfInput["pricing"]): string {
  return cadenceOf(normalizePlan(pricing)) === "monthly" ? "Month-to-month, with no long-term contract." : "Billed every three months, with no long-term contract.";
}

/** Join names for prose: ["A","B","C"] → "A, B and C". */
function joinAnd(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

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

function memberOfferFor(
  input: FoundingAgreementPdfInput,
  companyCount: number,
): string {
  if (input.role === "expert") return "";
  // Multi-company agreements list each company's own offer under
  // "Companies covered" in Schedule B — the single line just points there.
  if (companyCount > 1) {
    return "Per company — each offer is listed under “Companies covered” in Schedule B.";
  }
  const offer = input.memberOffer?.trim() || input.companies?.[0]?.member_offer?.trim();
  return offer || "To be confirmed before your listing goes live.";
}

async function renderAgreementHtml(input: FoundingAgreementPdfInput): Promise<string> {
  const [template, fontFaceCss] = await Promise.all([loadTemplate(input.role), getFontFaceCss()]);
  const accepted = input.accepted !== false;

  // Resolve the company list. Prefer the explicit companies[]; fall back to
  // the single companyName so single-company invites are unchanged.
  const companyList = (input.companies ?? [])
    .map((c) => ({
      name: (c.name ?? "").trim(),
      category: c.category?.trim() || null,
      member_offer: c.member_offer?.trim() || null,
    }))
    .filter((c) => c.name);
  const fallbackName = input.signer.companyName?.trim() || input.signer.name;
  const names = companyList.length ? companyList.map((c) => c.name) : [fallbackName];
  const companyJoined = joinAnd(names);

  // The primary company's offer may live on the invite itself rather than
  // the companies[0] entry — fold it in so the itemized list is complete.
  if (companyList.length > 0 && !companyList[0].member_offer && input.memberOffer?.trim()) {
    companyList[0].member_offer = input.memberOffer.trim();
  }

  const tokens: Record<string, string> = {
    SIGNER_NAME: input.signer.name,
    SIGNER_EMAIL: input.signer.email,
    COMPANY: companyJoined.replace(/[.]+$/, ""),
    MEMBER_OFFER: memberOfferFor(input, companyList.length),
    EFFECTIVE_DATETIME: formatEffectiveDate(input.signedAt),
    STATUS: accepted
      ? `Accepted electronically. IP fingerprint SHA-256 ${input.ipHashLast6}`
      : "Awaiting electronic acceptance via your private invite link",
  };

  // Itemized list for the "Companies covered" block — each company with its
  // category AND its own member-exclusive offer. Injected raw (after the
  // escaped-token pass) with every value individually escaped.
  const listSource = companyList.length
    ? companyList
    : names.map((n) => ({ name: n, category: null as string | null, member_offer: input.memberOffer?.trim() || null }));
  const companiesListHtml = listSource
    .map((c) => {
      const offer =
        input.role === "expert"
          ? ""
          : `<div style="font-size:9pt;color:#3B4A55;margin-top:1px;"><span style="color:#7a8794;">Member offer:</span> ${
              c.member_offer
                ? escapeHtml(c.member_offer)
                : "to be confirmed before this listing goes live"
            }</div>`;
      return `<li style="margin-bottom:5px;">${escapeHtml(c.name)}${
        c.category ? ` <span style="color:#7a8794;">&middot; ${escapeHtml(c.category)}</span>` : ""
      }${offer}</li>`;
    })
    .join("");

  const withFonts = template.replace("{{FONT_FACE_CSS}}", fontFaceCss);
  const withTokens = Object.entries(tokens).reduce(
    (html, [token, value]) => html.replaceAll(`{{${token}}}`, escapeHtml(value)),
    withFonts,
  );
  return withTokens
    .replaceAll("{{COMPANIES_LIST}}", companiesListHtml)
    .replaceAll("{{RAMP_BLOCK}}", rampBlockHtml(input.pricing))
    .replaceAll("{{BILLING_INTRO}}", billingIntroHtml(input.pricing, input.role))
    .replaceAll("{{TERM_LINE}}", termLineHtml(input.pricing))
    .replaceAll("{{REFUND_LINE}}", refundLineHtml(input.pricing))
    .replaceAll("{{EXPERT_LISTING_BOX}}", expertListingBoxHtml(input.pricing))
    .replaceAll("{{FOUNDING_}}", isFoundingBoth(input.pricing) ? "Founding " : "")
    .replaceAll("{{RATE_WORD}}", isFoundingBoth(input.pricing) ? "founding" : "special")
    .replaceAll("{{AN_FOUNDING}}", isFoundingBoth(input.pricing) ? "a founding " : "an ")
    .replaceAll("{{REFERRAL_LINE}}", escapeHtml(referralLine(normalizePlan(input.pricing))));
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
