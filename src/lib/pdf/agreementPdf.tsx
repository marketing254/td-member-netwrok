import "server-only";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";

/**
 * DMN Founding Agreement PDF — server-only.
 *
 * Renders the signed agreement as a real PDF (not HTML masquerading as
 * one) so the file works in email attachments, downloads, and legal
 * review. One template covers both partners and experts; the role +
 * commitments/agreement body varies via props.
 *
 * Called from /api/join/partner and /api/join/expert after Stripe
 * confirms the subscription creation. The buffer is uploaded to the
 * `agreements` storage bucket and the path stored on the
 * vendors/experts row.
 */

// Bundled fonts would need to ship with the deploy — we stay on the
// built-in Helvetica family so the PDF has zero external asset deps.
// If you want the Fraunces display serif in the PDF later, register it
// via Font.register() before renderAgreementPdf() runs.
Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  ink: "#0A1A2F",
  inkSoft: "#3B4A55",
  muted: "#5C6770",
  gold: "#A07823",
  goldTint: "#F7EED9",
  line: "#D8D2C1",
} as const;

// DMN brand mark, embedded as a data URI so the PDF has zero external
// asset dependency (works in email attachments + offline legal review).
// Read once per server process from /public. Falls back to the text
// wordmark if the file is missing so PDF generation never hard-fails.
let LOGO_DATA_URL: string | null | undefined;
function getLogoDataUrl(): string | null {
  if (LOGO_DATA_URL !== undefined) return LOGO_DATA_URL;
  try {
    const file = path.join(process.cwd(), "public", "DGN-logo.png");
    const b64 = fs.readFileSync(file).toString("base64");
    LOGO_DATA_URL = `data:image/png;base64,${b64}`;
  } catch {
    LOGO_DATA_URL = null;
  }
  return LOGO_DATA_URL;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: COLORS.inkSoft,
    lineHeight: 1.5,
    padding: 48,
    paddingTop: 56,
  },
  header: {
    marginBottom: 24,
    borderBottom: `2 solid ${COLORS.gold}`,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 34,
    height: 34,
    marginRight: 10,
    objectFit: "contain",
  },
  wordmark: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    letterSpacing: 4,
  },
  wordmarkSub: {
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 2,
    marginTop: 2,
  },
  titleEyebrow: {
    fontSize: 8,
    color: COLORS.gold,
    letterSpacing: 3,
    marginTop: 22,
    fontFamily: "Helvetica-Bold",
  },
  title: {
    fontSize: 22,
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    lineHeight: 1.15,
  },
  parties: {
    marginTop: 22,
    padding: 14,
    borderRadius: 4,
    backgroundColor: COLORS.goldTint,
    border: `1 solid ${COLORS.gold}`,
  },
  partyRow: { flexDirection: "row", marginBottom: 4 },
  partyLabel: {
    width: 90,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    fontSize: 9,
  },
  partyValue: { flex: 1, color: COLORS.ink, fontSize: 9 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: { marginBottom: 8 },
  commitmentRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  commitmentNumber: {
    width: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.gold,
  },
  commitmentBody: { flex: 1 },
  commitmentTitle: {
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 2,
  },
  feeRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: `1 solid ${COLORS.line}`,
  },
  feeRowHead: {
    flexDirection: "row",
    padding: 6,
    backgroundColor: "#F5F1E8",
    borderTop: `1 solid ${COLORS.line}`,
    borderBottom: `1 solid ${COLORS.line}`,
  },
  feeCol: { flex: 1, fontSize: 9 },
  feeColStrong: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  signatureBlock: {
    marginTop: 24,
    padding: 14,
    border: `1 solid ${COLORS.ink}`,
    borderRadius: 4,
  },
  signatureTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 8,
  },
  signatureField: {
    flexDirection: "row",
    marginBottom: 4,
  },
  signatureLabel: {
    width: 90,
    fontSize: 9,
    color: COLORS.muted,
  },
  signatureValue: {
    flex: 1,
    fontSize: 9,
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 7,
    color: COLORS.muted,
    textAlign: "center",
    borderTop: `1 solid ${COLORS.line}`,
    paddingTop: 8,
  },
});

// Copy — kept inline so the PDF has zero runtime dep on the app's
// vendorData/expertData files (those are React-only). If you update the
// commitments in the app, update them here too.
const PARTNER_COMMITMENTS = [
  {
    n: "1",
    title: "Best deal for members",
    body:
      "Give members a discount or exclusive benefit at least as good as any offer you make to comparable customers.",
  },
  {
    n: "2",
    title: "Join the private hotline",
    body:
      "Stay reachable during business hours so members get fast coordination with you.",
  },
  {
    n: "3",
    title: "Provide a booking link",
    body:
      "Share a Calendly / Cal.com link members can book directly — respond within one business day.",
  },
  {
    n: "4",
    title: "Evolve with the network",
    body:
      "Terms or fees may update with 30 days' notice; if a change materially reduces your benefits, you can exit before it takes effect.",
  },
  {
    n: "5",
    title: "Pay the partnership fee",
    body:
      "Per the fee schedule below — waived for your first 6 months as a Founding Partner.",
  },
];

const EXPERT_COMMITMENTS = [
  {
    n: "1",
    title: "Bring your best teaching to the bench",
    body:
      "What you publish through DMN is your best, most honest work — the same depth you'd give a paying client.",
  },
  {
    n: "2",
    title: "Join the private expert hotline",
    body:
      "Be reachable during business hours and respond within one business day to bookings + referrals routed to you.",
  },
  {
    n: "3",
    title: "Keep a working calendar link",
    body:
      "Provide a working booking link (Calendly, HubSpot, Cal.com — any) we feature on every kit and on your profile.",
  },
  {
    n: "4",
    title: "Accept that the bench will evolve",
    body:
      "The bench is new. We may update fees, benefits, or rules with at least 30 days' written notice.",
  },
  {
    n: "5",
    title: "Pay the fee",
    body:
      "Per the fee schedule below — waived for your first 6 months as a founding expert.",
  },
];

export type AgreementPdfInput = {
  role: "partner" | "expert" | "both";
  agreementVersion: string;
  signer: {
    name: string;
    email: string;
    companyName?: string | null;
  };
  // Personalized member offer (shown for partners / both). Founding
  // invites merge Lester's noted offer here so the person reads their
  // own terms, not a blank.
  memberOffer?: string | null;
  signedAt: Date;
  ipHashLast6: string;
  // false → render as the personalized-but-unaccepted copy shown on the
  // invite page (signature block reads "Awaiting acceptance"). true →
  // the accepted receipt with the filled acceptance record.
  accepted?: boolean;
};

function AgreementDoc({ input }: { input: AgreementPdfInput }) {
  const accepted = input.accepted !== false;
  const logoDataUrl = getLogoDataUrl();
  const commitments =
    input.role === "expert" ? EXPERT_COMMITMENTS : PARTNER_COMMITMENTS;
  const roleLabel =
    input.role === "both"
      ? "Founding Expert + Partner"
      : input.role === "partner"
        ? "Founding Partner"
        : "Founding Expert";
  const signedDate = input.signedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });

  return (
    <Document
      title={`DMN Founding Agreement — ${input.signer.name}`}
      author="Dental Member Network"
      creator="dentalmembernetwork.com"
    >
      <Page size="LETTER" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {logoDataUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logoDataUrl} style={styles.logo} />
            ) : null}
            <View>
              <Text style={styles.wordmark}>DMN</Text>
              <Text style={styles.wordmarkSub}>DENTAL MEMBER NETWORK</Text>
            </View>
          </View>
          <Text style={styles.titleEyebrow}>{roleLabel.toUpperCase()} · AGREEMENT</Text>
          <Text style={styles.title}>DMN Founding Agreement ({input.agreementVersion})</Text>
        </View>

        {/* Parties */}
        <View style={styles.parties}>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Between:</Text>
            <Text style={styles.partyValue}>
              Ekwa Marketing dba Dental Member Network ("DMN")
            </Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>And:</Text>
            <Text style={styles.partyValue}>
              {input.signer.name}
              {input.signer.companyName ? ` · ${input.signer.companyName}` : ""}
            </Text>
          </View>
          <View style={styles.partyRow}>
            <Text style={styles.partyLabel}>Effective:</Text>
            <Text style={styles.partyValue}>{signedDate} UTC</Text>
          </View>
        </View>

        {/* Preamble */}
        <Text style={styles.sectionTitle}>1. What you're agreeing to</Text>
        <Text style={styles.paragraph}>
          By clicking "Agree and subscribe" on dentalmembernetwork.com, {input.signer.name}{" "}
          ("Signer") agrees to be bound by this {roleLabel} Agreement with DMN. Signer's
          electronic acceptance has the same legal effect as a handwritten signature under
          applicable e-signature laws (E-SIGN Act, UETA).
        </Text>

        {/* Commitments */}
        <Text style={styles.sectionTitle}>2. The five commitments</Text>
        {commitments.map((c) => (
          <View key={c.n} style={styles.commitmentRow}>
            <Text style={styles.commitmentNumber}>{c.n}.</Text>
            <View style={styles.commitmentBody}>
              <Text style={styles.commitmentTitle}>{c.title}</Text>
              <Text>{c.body}</Text>
            </View>
          </View>
        ))}

        {/* Fee schedule */}
        <Text style={styles.sectionTitle}>3. Fee schedule</Text>
        <View style={styles.feeRowHead}>
          <Text style={[styles.feeColStrong, { flex: 1 }]}>Period</Text>
          <Text style={[styles.feeColStrong, { flex: 0.7 }]}>Fee</Text>
          <Text style={[styles.feeColStrong, { flex: 2 }]}>Note</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeCol}>Months 1–6</Text>
          <Text style={styles.feeCol}>$0</Text>
          <Text style={styles.feeCol}>
            Founding waiver via 180-day Stripe trial; card on file
          </Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeCol}>Months 7–12</Text>
          <Text style={styles.feeCol}>$49/mo</Text>
          <Text style={styles.feeCol}>Locked launch rate</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeCol}>Month 13+</Text>
          <Text style={styles.feeCol}>$199/mo</Text>
          <Text style={styles.feeCol}>
            Standard rate; annual pre-pay $1,990/yr = 2 months free
          </Text>
        </View>

        {/* Member offer — personalized. Shown for partner / both. */}
        {input.memberOffer && input.role !== "expert" ? (
          <>
            <Text style={styles.sectionTitle}>3a. Your member offer</Text>
            <Text style={styles.paragraph}>
              {input.signer.companyName ?? input.signer.name} commits the following
              exclusive benefit to DMN members: {input.memberOffer}
            </Text>
          </>
        ) : null}

        {/* Cancellation */}
        <Text style={styles.sectionTitle}>4. Cancellation</Text>
        <Text style={styles.paragraph}>
          Either party may terminate for convenience with 30 days' written notice. Signer
          remains responsible for fees accrued through the effective termination date.
          Fees paid in advance (e.g. annual pre-pay) are non-refundable except as
          expressly required by law.
        </Text>

        {/* Governing */}
        <Text style={styles.sectionTitle}>5. Governing law + full agreement</Text>
        <Text style={styles.paragraph}>
          This Agreement is governed by the laws of the Province of Ontario, Canada, and
          the federal laws of Canada applicable therein. The five commitments above are
          the operative terms; a complete, human-readable version of the standing
          agreement (including confidentiality, indemnification, and limits of liability)
          is available at dentalmembernetwork.com/agreement/{input.role === "expert" ? "expert" : "vendor"}{" "}
          and is incorporated by reference. If a change materially reduces Signer's
          benefits, Signer may terminate with no penalty before the change takes effect.
        </Text>

        {/* Signature block — "Acceptance record" once accepted, otherwise
            a personalized-but-pending prepared-for block on the invite copy. */}
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureTitle}>
            {accepted ? "Acceptance record" : "Prepared for"}
          </Text>
          <View style={styles.signatureField}>
            <Text style={styles.signatureLabel}>{accepted ? "Accepted by:" : "Name:"}</Text>
            <Text style={styles.signatureValue}>{input.signer.name}</Text>
          </View>
          <View style={styles.signatureField}>
            <Text style={styles.signatureLabel}>Email:</Text>
            <Text style={styles.signatureValue}>{input.signer.email}</Text>
          </View>
          {input.signer.companyName ? (
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Company:</Text>
              <Text style={styles.signatureValue}>{input.signer.companyName}</Text>
            </View>
          ) : null}
          <View style={styles.signatureField}>
            <Text style={styles.signatureLabel}>Role:</Text>
            <Text style={styles.signatureValue}>{roleLabel}</Text>
          </View>
          {accepted ? (
            <>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>Accepted at:</Text>
                <Text style={styles.signatureValue}>{signedDate} UTC</Text>
              </View>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>Version:</Text>
                <Text style={styles.signatureValue}>{input.agreementVersion}</Text>
              </View>
              <View style={styles.signatureField}>
                <Text style={styles.signatureLabel}>IP fingerprint:</Text>
                <Text style={styles.signatureValue}>SHA-256 · {input.ipHashLast6}</Text>
              </View>
            </>
          ) : (
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Status:</Text>
              <Text style={styles.signatureValue}>
                Awaiting electronic acceptance via your private invite link
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.footer} fixed>
          DMN Founding Agreement {input.agreementVersion} · {input.signer.email} ·
          dentalmembernetwork.com
        </Text>
      </Page>
    </Document>
  );
}

/**
 * Render the agreement to a Buffer suitable for Supabase Storage upload
 * or email attachment. Server-only — @react-pdf/renderer imports native
 * fontkit/canvg which don't work in the browser.
 */
export async function renderAgreementPdf(input: AgreementPdfInput): Promise<Buffer> {
  return renderToBuffer(<AgreementDoc input={input} />);
}
