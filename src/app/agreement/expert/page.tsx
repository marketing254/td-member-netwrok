import type { Metadata } from "next";
import { Box, Container, Stack, Typography } from "@mui/material";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import { COLORS } from "@/theme";

export const metadata: Metadata = {
  title: "Expert Network Agreement · Dental Member Network",
  description:
    "The standing agreement for Dental Member Network experts — the five commitments, fee schedule, cancellation terms, and governing law.",
};

/**
 * /agreement/expert — the human-readable standing agreement for DMN
 * experts. The agreement PDFs reference this URL ("a complete,
 * human-readable version … is available at
 * dentalmembernetwork.com/agreement/expert"), and the invite +
 * application forms link here. Copy mirrors lib/pdf/agreementPdf.tsx —
 * update both together.
 */

const COMMITMENTS = [
  {
    n: "1",
    title: "Bring your best teaching to the bench",
    body: "What you publish through DMN is your best, most honest work — the same depth you'd give a paying client.",
  },
  {
    n: "2",
    title: "Join the private expert hotline",
    body: "Be reachable during business hours and respond within one business day to bookings + referrals routed to you.",
  },
  {
    n: "3",
    title: "Keep a working calendar link",
    body: "Provide a working booking link (Calendly, HubSpot, Cal.com — any) we feature on every kit and on your profile.",
  },
  {
    n: "4",
    title: "Accept that the bench will evolve",
    body: "The bench is new. We may update fees, benefits, or rules with at least 30 days' written notice.",
  },
  {
    n: "5",
    title: "Pay the fee",
    body: "Per the fee schedule below — waived for your first 6 months as a founding expert.",
  },
];

const FEES = [
  { period: "Months 1–6", fee: "$0", note: "Founding waiver via 180-day Stripe trial; card on file" },
  { period: "Months 7–12", fee: "$49/mo", note: "Locked launch rate" },
  { period: "Month 13+", fee: "$199/mo", note: "Standard rate; annual pre-pay $1,990/yr = 2 months free" },
];

export default function ExpertAgreementPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.surface, display: "flex", flexDirection: "column" }}>
      <Header />
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 }, flex: 1 }}>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: COLORS.accent, mb: 1.25 }}>
          Dental Member Network
        </Typography>
        <Typography component="h1" sx={{ fontFamily: "var(--font-display)", fontSize: { xs: "2rem", md: "2.6rem" }, fontWeight: 500, color: COLORS.ink, lineHeight: 1.1, letterSpacing: "-0.02em", mb: 2 }}>
          Expert Network Agreement
        </Typography>
        <Typography sx={{ color: COLORS.inkSoft, fontSize: "1rem", lineHeight: 1.7, maxWidth: 680, mb: 5 }}>
          This agreement is between Thriving Dentist / Dental Member Network (&quot;DMN&quot;) and the expert who accepts it
          (&quot;you&quot;). It is the standing, human-readable version of the terms you accept electronically — via your
          invite link or the application form. The five commitments below are the operative terms.
        </Typography>

        <Section title="1. The five commitments">
          <Stack spacing={2.5}>
            {COMMITMENTS.map((c) => (
              <Stack key={c.n} direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "50%", bgcolor: "rgba(217,168,75,0.14)", color: COLORS.accent, display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }}>
                  {c.n}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: COLORS.ink, fontSize: "1rem", mb: 0.25 }}>{c.title}</Typography>
                  <Typography sx={{ color: COLORS.inkSoft, fontSize: "0.95rem", lineHeight: 1.6 }}>{c.body}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Section>

        <Section title="2. Fee schedule">
          <Box sx={{ border: `1px solid ${COLORS.line}`, borderRadius: 2, overflow: "hidden", maxWidth: 620 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 0.7fr 2fr", bgcolor: "#FFFFFF", px: 2, py: 1.25, borderBottom: `1px solid ${COLORS.line}` }}>
              {["Period", "Fee", "Note"].map((h) => (
                <Typography key={h} sx={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.muted }}>{h}</Typography>
              ))}
            </Box>
            {FEES.map((f) => (
              <Box key={f.period} sx={{ display: "grid", gridTemplateColumns: "1fr 0.7fr 2fr", px: 2, py: 1.25, bgcolor: "#FFFFFF", "&:not(:last-child)": { borderBottom: `1px solid ${COLORS.line}` } }}>
                <Typography sx={{ fontSize: "0.9rem", color: COLORS.ink, fontWeight: 600 }}>{f.period}</Typography>
                <Typography sx={{ fontSize: "0.9rem", color: COLORS.ink }}>{f.fee}</Typography>
                <Typography sx={{ fontSize: "0.88rem", color: COLORS.inkSoft }}>{f.note}</Typography>
              </Box>
            ))}
          </Box>
          <Typography sx={{ color: COLORS.muted, fontSize: "0.85rem", mt: 1.5 }}>
            The founding waiver applies to founding experts; standard (non-founding) experts start their trial when they
            add a card in the portal.
          </Typography>
        </Section>

        <Section title="3. Cancellation">
          <Typography sx={{ color: COLORS.inkSoft, fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 680 }}>
            Either party may terminate for convenience with 30 days&apos; written notice. You remain responsible for fees
            accrued through the effective termination date. Fees paid in advance (e.g. annual pre-pay) are non-refundable
            except as expressly required by law.
          </Typography>
        </Section>

        <Section title="4. Governing law">
          <Typography sx={{ color: COLORS.inkSoft, fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 680 }}>
            This Agreement is governed by the laws of the Province of Ontario, Canada, and the federal laws of Canada
            applicable therein. If a change materially reduces your benefits, you may terminate with no penalty before the
            change takes effect.
          </Typography>
        </Section>

        <Typography sx={{ color: COLORS.muted, fontSize: "0.85rem", mt: 5 }}>
          Questions? Email{" "}
          <Box component="a" href="mailto:experts@dentalmembernetwork.com" sx={{ color: COLORS.accent, fontWeight: 700, textDecoration: "none" }}>
            experts@dentalmembernetwork.com
          </Box>
          {" "}· Partners: see the{" "}
          <Box component="a" href="/agreement/vendor" sx={{ color: COLORS.accent, fontWeight: 700 }}>
            Partner Network Agreement
          </Box>
          .
        </Typography>
      </Container>
      <Footer />
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 600, color: COLORS.ink, mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
