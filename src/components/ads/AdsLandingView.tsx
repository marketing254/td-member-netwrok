"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import Logo from "@/components/brand/Logo";
import { initMetaPixel, trackMeta } from "@/components/ads/metaPixel";
import { trackEvent } from "@/lib/analytics";

/**
 * /start — the Meta paid-ads direct-purchase page (approved prototype:
 * "DMN Paid Ads Developer Package - 2026-08-27"). One page: pitch →
 * short form → Stripe EMBEDDED checkout → /welcome.
 *
 * Traffic & security posture:
 *   - This page is fully static (no DB reads on view) so ad spikes hit
 *     the CDN, not the database. The only server work happens on submit.
 *   - Card entry is Stripe's iframe — card data never exists in our DOM
 *     or JS, so the console/network/application tabs have nothing to take.
 *   - The client only ever sends a plan KEY; prices and activation are
 *     decided server-side. PUBLIC OFFER ONLY — no promo/trial UI exists
 *     on this page by design (the 3-month arrangement is private).
 */

const INK = "#0a1320";
const NAVY = "#173650";
const CREAM = "#f7f5f0";
const GOLD = "#d9aa3f";
const GOLD_DARK = "#9b7420";
const GREEN = "#2c7a52";
const MUTED = "#68717b";
const LINE = "#ded9ce";

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const ROLES = [
  "Practice Owner",
  "Dentist",
  "Office Manager",
  "Clinical Team Member",
  "Administrative Team Member",
  "Other",
];

// Pre-cropped 5:7 card images (public/ads/cards/) with every expert's
// eye-line at the same 38% height — the card locks the same 5:7 aspect
// ratio, so faces stay aligned at EVERY viewport width.
const KITS = [
  { img: "/ads/cards/laura.jpg", by: "Laura Phillips, E.A.", title: "Know Your Real Numbers" },
  { img: "/ads/cards/parul.jpg", by: "Dr. Parul Dua Makkar", title: "Seen, Felt and Acknowledged" },
  { img: "/ads/cards/ashley.jpg", by: "Ashley Boaz", title: "Transition Without Turbulence" },
  { img: "/ads/cards/callie2.jpg", by: "Callie Ward", title: "The Successful Morning Huddle" },
  { img: "/ads/cards/devon.jpg", by: "DeVon Banks", title: "The Process Comes First" },
];

// Ad-creative hero variants (?creative=…) — approved copy from the
// prototype. Applied on mount so the page itself stays fully static.
const CREATIVE_VARIANTS: Record<string, { badge: string; title: [string, string]; copy: string }> = {
  laura: {
    badge: "Expert resource kit · Laura Phillips, E.A.",
    title: ["Cash is not always ", "profit."],
    copy: "Learn to read the numbers that explain the health of your dental practice, then access the full Know Your Real Numbers resource inside DMN.",
  },
  makkar: {
    badge: "Expert resource kit · Dr. Parul Dua Makkar",
    title: ["Patients remember how you made them ", "feel."],
    copy: "Explore a practical patient-experience resource from Dr. Parul Dua Makkar, plus a growing library of expert-led kits inside DMN.",
  },
  ashley: {
    badge: "Practice transitions · Ashley Boaz",
    title: ["Don’t break every system on ", "day one."],
    copy: "Protect the people, processes and value behind a practice transition with Ashley Boaz’s practical resource kit inside DMN.",
  },
  callie: {
    badge: "Practice management · Callie Ward",
    title: ["A better day starts before the first patient ", "arrives."],
    copy: "Build a focused, practical morning huddle with Callie Ward, plus access a growing library of expert-led resources inside DMN.",
  },
  savings: {
    badge: "Vetted partner savings",
    title: ["Membership savings for your ", "practice."],
    copy: "Access confirmed offers from The Phillips Group alongside DMN’s experts, resource kits, tools and wider company network.",
  },
  hotline: {
    badge: "The DMN Expert Hotline",
    title: ["When your practice gets stuck, get a ", "written next step."],
    copy: "Describe the problem in plain English. Receive a written response and the right people to consider within 2–3 business days.",
  },
};

const DEFAULT_HERO = {
  badge: "Curated by the Thriving Dentist team — not an algorithm",
  title: ["Never solve a practice problem ", "alone again."] as [string, string],
  copy: "Bring DMN a real dental-practice problem and get a written response within 2–3 business days, plus a growing library of practical resources from vetted experts.",
};

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

const kicker = {
  color: GOLD_DARK,
  fontSize: "0.7rem",
  fontWeight: 800,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
} as const;

const display = {
  fontFamily: "var(--font-display)",
  letterSpacing: "-0.03em",
  lineHeight: 1.06,
  fontWeight: 600,
  color: INK,
} as const;

export default function AdsLandingView() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [plan, setPlan] = useState<"founding_monthly" | "founding_annual">("founding_monthly");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    practiceName: "",
    role: "",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const tracking = useRef<{ utm: Record<string, string>; fbclid: string | null; landingUrl: string | null }>({
    utm: {},
    fbclid: null,
    landingUrl: null,
  });
  const initiateFired = useRef(false);

  // Campaign context + pixel — read once on mount so the page itself is
  // static/CDN-cacheable no matter what query string the ad appends.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const creative = q.get("creative");
    if (creative && CREATIVE_VARIANTS[creative]) setHero(CREATIVE_VARIANTS[creative]);
    const utm: Record<string, string> = {};
    for (const k of ["source", "medium", "campaign", "content", "term"]) {
      const v = q.get(`utm_${k}`);
      if (v) utm[k] = v.slice(0, 200);
    }
    if (!utm.source) utm.source = "meta";
    if (!utm.medium) utm.medium = "paid_social";
    if (!utm.content && creative) utm.content = creative;
    tracking.current = {
      utm,
      fbclid: q.get("fbclid"),
      landingUrl: window.location.origin + window.location.pathname,
    };
    initMetaPixel();
    trackMeta("PageView");
    trackMeta("ViewContent", { content_name: "dmn_founding_membership" });
  }, []);

  const fireInitiate = useCallback(() => {
    if (initiateFired.current) return;
    initiateFired.current = true;
    trackMeta("InitiateCheckout", { content_name: "dmn_founding_membership" });
  }, []);

  const monthly = plan === "founding_monthly";
  const priceLabel = monthly ? "$49/month" : "$490/year";

  const canSubmit =
    form.firstName.trim() &&
    form.lastName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) &&
    form.practiceName.trim() &&
    form.role &&
    form.agree;

  const startCheckout = useCallback(async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    setAlreadyMember(false);
    try {
      const res = await fetch("/api/ads/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          practiceName: form.practiceName.trim(),
          role: form.role,
          plan,
          agreementAccepted: form.agree,
          utm: tracking.current.utm,
          fbclid: tracking.current.fbclid,
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
          landingUrl: tracking.current.landingUrl,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        clientSecret?: string;
        error?: string;
        alreadyMember?: boolean;
      };
      if (!res.ok || !body.clientSecret) {
        if (body.alreadyMember) setAlreadyMember(true);
        setErrorMsg(body.error ?? "Something went wrong — please try again.");
        return;
      }
      // GA4 key events: account created + embedded checkout opened.
      trackEvent("sign_up", { method: "meta_ads" });
      trackEvent("begin_checkout", {
        currency: "USD",
        value: plan === "founding_annual" ? 490 : 49,
        items: [{ item_id: plan, item_name: plan }],
      });
      setClientSecret(body.clientSecret);
    } catch {
      setErrorMsg("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, form, plan]);

  const field = (label: string, key: keyof typeof form, opts?: { type?: string; auto?: string }) => (
    <Box>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#44505c", mb: 0.6 }}>
        {label} *
      </Typography>
      <TextField
        fullWidth
        size="small"
        type={opts?.type}
        autoComplete={opts?.auto}
        value={form[key] as string}
        onFocus={fireInitiate}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "14px",
            bgcolor: "#fff",
            fontSize: "0.85rem",
            height: 50,
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: GOLD_DARK,
          },
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: CREAM, color: INK, fontFamily: "var(--font-body), Manrope, sans-serif" }}>
      <Box sx={{ height: 4, bgcolor: GOLD }} />

      {/* Header */}
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{ height: { xs: 72, md: 86 }, alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${LINE}` }}
        >
          <Box sx={{ mt: -1.5, mb: -4 }}>
            <Logo href="/start" height={120} ariaLabel="Dental Member Network" />
          </Box>

          {/* Section nav pill (desktop) — in-page anchors, matching the
              approved prototype's navbar. */}
          <Stack
            direction="row"
            component="nav"
            aria-label="Page sections"
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              gap: 0.5,
              p: 0.6,
              border: `1px solid ${LINE}`,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.62)",
            }}
          >
            {(
              [
                ["Resources", "#library"],
                ["Expert Hotline", "#hotline"],
                ["What is included", "#inside"],
                ["Pricing", "#checkout"],
                ["FAQ", "#faq"],
              ] as const
            ).map(([label, href]) => (
              <Box
                key={href}
                component="a"
                href={href}
                sx={{
                  px: 1.75,
                  py: 1.1,
                  borderRadius: 999,
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  color: INK,
                  textDecoration: "none",
                  transition: "background-color 180ms ease",
                  "&:hover": { bgcolor: "#fff" },
                }}
              >
                {label}
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: "0.76rem", fontWeight: 700, color: MUTED }}>
              Founding membership
            </Typography>
            <Button
              href="#checkout"
              sx={{
                "&&": {
                  bgcolor: GOLD,
                  color: "#111",
                  fontWeight: 800,
                  borderRadius: 999,
                  px: 3,
                  py: 1.1,
                  textTransform: "none",
                  fontSize: "0.85rem",
                },
                "&&:hover": { bgcolor: "#e4b95f" },
              }}
            >
              Start membership
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Hero */}
      <Box component="section" sx={{ position: "relative", overflow: "hidden", textAlign: "center", py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.75,
              py: 1,
              border: `1px solid ${LINE}`,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.55)",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#56606b",
              "&::before": { content: '"✦"', color: GOLD_DARK },
            }}
          >
            {hero.badge}
          </Box>
          <Typography component="h1" sx={{ ...display, fontSize: { xs: "2.8rem", md: "4.4rem" }, maxWidth: 850, mx: "auto", mt: 2.5 }}>
            {hero.title[0]}
            <Box component="span" sx={{ color: GOLD_DARK, fontStyle: "italic" }}>{hero.title[1]}</Box>
          </Typography>
          <Typography sx={{ maxWidth: 700, mx: "auto", mt: 2.5, color: "#59636e", fontSize: { xs: "0.95rem", md: "1.06rem" }, lineHeight: 1.6 }}>
            {hero.copy}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center", alignItems: "center", mt: 3.5 }}>
            <Button
              href="#checkout"
              sx={{
                "&&": { bgcolor: GOLD, color: "#111", fontWeight: 800, borderRadius: 999, px: 3.5, py: 1.5, textTransform: "none", fontSize: "0.95rem" },
                "&&:hover": { bgcolor: "#e4b95f" },
              }}
            >
              Start your membership ›
            </Button>
            <Typography sx={{ fontSize: "0.76rem", color: "#727982" }}>
              Founding rate · $49/month · locked while active
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "center", flexWrap: "wrap", gap: "10px 24px", mt: 3.25, color: "#69717a", fontSize: "0.7rem" }}>
            {["30-day money-back guarantee", "Cancel anytime", "Real human replies"].map((t) => (
              <Box key={t} component="span" sx={{ "&::before": { content: '"✓"', mr: 0.9, color: GREEN, fontWeight: 900 } }}>
                {t}
              </Box>
            ))}
          </Stack>
          <Typography sx={{ maxWidth: 720, mx: "auto", mt: 3.25, pt: 2.25, borderTop: `1px solid ${LINE}`, fontSize: "0.76rem", color: "#717780" }}>
            One short form. Choose monthly or annual and pay securely on this page—no registration detour.
          </Typography>
        </Container>
      </Box>

      {/* Library */}
      <Box component="section" id="library" sx={{ bgcolor: "#eee9de", borderTop: "1px solid #e2dccf", borderBottom: "1px solid #e2dccf", py: { xs: 8, md: 11 }, scrollMarginTop: 16 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 760, mx: "auto", mb: 5 }}>
            <Typography sx={kicker}>The library</Typography>
            <Typography component="h2" sx={{ ...display, fontSize: { xs: "2.2rem", md: "3.2rem" }, mt: 1.25 }}>
              Real experts. Practical resources.
            </Typography>
            <Typography sx={{ mt: 2, color: MUTED, fontSize: "1rem" }}>
              Every kit turns expert knowledge into tools a dental team can understand and put to work.
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: "flex", md: "grid" },
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1.75,
              overflowX: { xs: "auto", md: "visible" },
              scrollSnapType: { xs: "x mandatory", md: "none" },
              pb: { xs: 1, md: 0 },
            }}
          >
            {KITS.map((kit) => (
              <Box
                key={kit.title}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  // Same 5:7 ratio as the pre-cropped images — the photo
                  // maps 1:1 onto the card at every screen width, so the
                  // aligned eye-lines never drift responsively.
                  aspectRatio: "5 / 7",
                  minWidth: { xs: 245, md: "auto" },
                  borderRadius: "18px",
                  bgcolor: "#15263a",
                  boxShadow: "0 16px 38px rgba(23,35,49,0.13)",
                  scrollSnapAlign: "start",
                  flexShrink: 0,
                }}
              >
                <Image src={kit.img} alt={kit.by} fill sizes="(max-width: 900px) 245px, 20vw" style={{ objectFit: "cover" }} />
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(4,12,22,0.94), rgba(4,12,22,0) 68%)" }} />
                <Box sx={{ position: "absolute", zIndex: 2, left: 18, right: 18, bottom: 17, color: "#fff" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: "0.64rem", fontWeight: 600 }}>{kit.by}</Typography>
                  <Typography sx={{ mt: 0.5, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.18rem", lineHeight: 1.1, color: "#FFFFFF" }}>
                    {kit.title}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Hotline */}
      <Box component="section" id="hotline" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: 16 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" }, alignItems: "center", gap: { xs: 5, md: 8.5 } }}>
            <Box>
              <Typography sx={kicker}>The Expert Hotline</Typography>
              <Typography component="h2" sx={{ ...display, fontSize: { xs: "2.4rem", md: "3.4rem" }, my: 2 }}>
                Stuck? Put a human on it.
              </Typography>
              <Typography sx={{ color: MUTED, fontSize: "1rem" }}>
                DMN does not leave you with another search box. Bring us the practice problem in plain English.
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 3.25 }}>
                {[
                  ["Describe the problem", "Clinical, financial, team or operational."],
                  ["DMN reviews and routes it", "The right expertise and resources are considered."],
                  ["Receive a written response", "Within 2–3 business days, with the right people to consider."],
                ].map(([title, sub], i) => (
                  <Stack key={title} direction="row" spacing={1.6} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: "50%", bgcolor: GOLD, fontSize: "0.8rem", fontWeight: 800, flexShrink: 0 }}>
                      {i + 1}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{title}</Typography>
                      <Typography sx={{ color: MUTED, fontSize: "0.82rem" }}>{sub}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Box sx={{ p: { xs: 3, md: 4.25 }, borderRadius: "28px", bgcolor: "#fff", boxShadow: "0 20px 60px rgba(25,31,38,0.10)", border: "1px solid rgba(255,255,255,0.85)" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: GOLD_DARK }}>
                <span>Illustrative example</span>
                <span>DMN</span>
              </Stack>
              <Typography sx={{ my: { xs: 3, md: 4 }, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: { xs: "1.5rem", md: "1.9rem" }, lineHeight: 1.22 }}>
                “Our hygiene schedule has been flat for six months.”
              </Typography>
              <Typography sx={{ p: 2.25, borderRadius: "16px", bgcolor: "#f1eee6", color: "#53606c", fontSize: "0.82rem" }}>
                A clear written response, relevant practical resources and vetted expertise to help the practice decide what to do next.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Value */}
      <Box component="section" id="inside" sx={{ bgcolor: NAVY, color: "#fff", py: { xs: 8, md: 11 }, scrollMarginTop: 16 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", maxWidth: 760, mx: "auto", mb: 5 }}>
            <Typography sx={{ ...kicker, color: "#e9c979" }}>One membership</Typography>
            <Typography component="h2" sx={{ ...display, color: "#fff", fontSize: { xs: "2.2rem", md: "3.2rem" }, mt: 1.25 }}>
              What your practice unlocks.
            </Typography>
            <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.64)", fontSize: "1rem" }}>
              A growing operating resource for practice owners, dentists, office managers and dental teams.
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
            {[
              ["Learn", "Expert directory and resource kits", "Find trusted specialists and practical materials built around real dental-practice problems."],
              ["Act", "Tools, worksheets and templates", "Move from knowing what to do to having something your team can actually use."],
              ["Connect", "Vetted companies and member offers", "Discover relevant providers and confirmed savings available through the network."],
            ].map(([b, h, p]) => (
              <Box key={b} sx={{ p: 3.5, border: "1px solid rgba(255,255,255,0.14)", borderRadius: "20px", bgcolor: "rgba(255,255,255,0.06)" }}>
                <Typography sx={{ color: "#e9c979", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>{b}</Typography>
                <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.5rem", mt: 3, color: "#fff", lineHeight: 1.15 }}>{h}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem", mt: 1.4 }}>{p}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Checkout */}
      <Box component="section" id="checkout" sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 8, md: 11 }, scrollMarginTop: 18 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.82fr 1.18fr" },
              overflow: "hidden",
              borderRadius: { xs: "23px", md: "30px" },
              bgcolor: "#fff",
              boxShadow: "0 20px 60px rgba(25,31,38,0.10)",
              border: "1px solid rgba(10,19,32,0.08)",
            }}
          >
            {/* Summary */}
            <Box sx={{ p: { xs: 3, md: 6 }, bgcolor: "#111820", color: "#fff" }}>
              <Typography sx={{ ...kicker, color: "#e9c979" }}>Founding membership</Typography>
              <Typography component="h2" sx={{ ...display, color: "#fff", fontSize: { xs: "2.4rem", md: "3.2rem" }, mt: 1.25 }}>
                Join DMN today.
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.67)", fontSize: "0.88rem", my: 2.5 }}>
                One short form. Choose your plan and pay securely without leaving this page.
              </Typography>

              {/* Plan toggle */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, p: 0.6, border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, bgcolor: "rgba(255,255,255,0.06)" }}>
                {(
                  [
                    ["founding_monthly", "Monthly · $49"],
                    ["founding_annual", "Annual · $490"],
                  ] as const
                ).map(([key, label]) => (
                  <Box
                    key={key}
                    component="button"
                    type="button"
                    onClick={() => {
                      if (!clientSecret) setPlan(key);
                    }}
                    disabled={!!clientSecret}
                    sx={{
                      border: 0,
                      cursor: clientSecret ? "default" : "pointer",
                      py: 1.4,
                      px: 1,
                      borderRadius: 999,
                      textAlign: "center",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      fontFamily: "inherit",
                      bgcolor: plan === key ? "#fff" : "transparent",
                      color: plan === key ? "#111820" : "rgba(255,255,255,0.65)",
                      opacity: clientSecret && plan !== key ? 0.4 : 1,
                      transition: "all 180ms ease",
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Box>

              <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "3.4rem", mt: 3.5, mb: 0.75, lineHeight: 1, color: "#FFFFFF" }}>
                {monthly ? "$49" : "$490"}{" "}
                <Box component="span" sx={{ fontFamily: "var(--font-body), Manrope, sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "rgba(255,255,255,0.68)" }}>
                  {monthly ? "/month" : "/year"}
                </Box>
              </Typography>
              <Typography sx={{ minHeight: 20, color: "#e8c76f", fontSize: "0.7rem", fontWeight: 700 }}>
                {monthly
                  ? "Founding rate locked while your membership stays active"
                  : "Save two months · equivalent to $40.83/month"}
              </Typography>

              <Box component="ul" sx={{ listStyle: "none", p: 0, mt: 3, mb: 0, color: "rgba(255,255,255,0.77)", fontSize: "0.76rem" }}>
                {[
                  "Expert Hotline and written practice support",
                  "Expert kits, tools and templates",
                  "Vetted companies and member offers",
                  "30-day money-back guarantee",
                  "Cancel anytime",
                ].map((li) => (
                  <Box key={li} component="li" sx={{ py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.1)", "&::before": { content: '"✓"', color: "#e5c570", fontWeight: 900, mr: 1.1 } }}>
                    {li}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Form / embedded payment */}
            <Box sx={{ p: { xs: 3, md: 6 }, bgcolor: "#fff" }}>
              {clientSecret && stripePromise ? (
                <>
                  <Typography sx={{ ...kicker, fontSize: "0.64rem" }}>Secure payment · Stripe</Typography>
                  <Typography component="h3" sx={{ ...display, fontSize: { xs: "1.8rem", md: "2.2rem" }, mt: 0.75, mb: 1 }}>
                    Complete your payment
                  </Typography>
                  <Typography sx={{ mb: 2.5, color: MUTED, fontSize: "0.82rem" }}>
                    {form.email} · {priceLabel}.{" "}
                    <Box
                      component="button"
                      type="button"
                      onClick={() => setClientSecret(null)}
                      sx={{ border: 0, p: 0, bgcolor: "transparent", color: GOLD_DARK, fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", fontSize: "inherit" }}
                    >
                      Edit details
                    </Box>
                  </Typography>
                  <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </>
              ) : (
                <>
                  <Typography sx={{ ...kicker, fontSize: "0.64rem" }}>Secure one-page registration</Typography>
                  <Typography component="h3" sx={{ ...display, fontSize: { xs: "1.8rem", md: "2.2rem" }, mt: 0.75, mb: 1 }}>
                    Create your membership
                  </Typography>
                  <Typography sx={{ mb: 3, color: MUTED, fontSize: "0.82rem" }}>
                    Your membership details and payment stay together—no extra registration screens.
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    {field("First name", "firstName", { auto: "given-name" })}
                    {field("Last name", "lastName", { auto: "family-name" })}
                    <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                      {field("Work email", "email", { type: "email", auto: "email" })}
                    </Box>
                    {field("Practice name", "practiceName", { auto: "organization" })}
                    <Box>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#44505c", mb: 0.6 }}>
                        Your role *
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={form.role}
                        onFocus={fireInitiate}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "14px", bgcolor: "#fff", fontSize: "0.85rem", height: 50 },
                        }}
                      >
                        {ROLES.map((r) => (
                          <MenuItem key={r} value={r} sx={{ fontSize: "0.85rem" }}>
                            {r}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>

                  {/* Payment note — the real Stripe fields render after this step */}
                  <Stack direction="row" sx={{ mt: 3.25, pt: 3, borderTop: `1px solid ${LINE}`, justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>Payment</Typography>
                    <Typography sx={{ fontSize: "0.66rem", color: MUTED }}>Secured by Stripe</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "0.78rem", color: MUTED, mb: 2 }}>
                    Card, Apple Pay and Link open in Stripe’s secure payment window on this page after you continue. Card details are entered with Stripe only — they never touch our servers.
                  </Typography>

                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start", my: 2.25 }}>
                    <Box
                      component="input"
                      type="checkbox"
                      id="ads-agreement"
                      checked={form.agree}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, agree: e.target.checked }))}
                      sx={{ width: 16, height: 16, mt: "3px", accentColor: GOLD_DARK, flexShrink: 0 }}
                    />
                    <Typography component="label" htmlFor="ads-agreement" sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#44505c", cursor: "pointer" }}>
                      I agree to the{" "}
                      <Box component="a" href="/agreement/member" target="_blank" rel="noopener" sx={{ color: GOLD_DARK, textDecoration: "underline" }}>
                        Member Agreement
                      </Box>{" "}
                      and recurring membership billing.
                    </Typography>
                  </Stack>

                  {errorMsg && (
                    <Box sx={{ mb: 2, p: 1.75, borderRadius: "11px", bgcolor: "#fdf0ee", color: "#8a2f24", fontSize: "0.78rem" }}>
                      {errorMsg}{" "}
                      {alreadyMember && (
                        <Box component="a" href="/member/login" sx={{ color: "#8a2f24", fontWeight: 800, textDecoration: "underline" }}>
                          Sign in →
                        </Box>
                      )}
                    </Box>
                  )}

                  <Button
                    fullWidth
                    disabled={!canSubmit || submitting}
                    onClick={startCheckout}
                    sx={{
                      "&&": {
                        bgcolor: GOLD,
                        color: "#111",
                        fontWeight: 800,
                        borderRadius: 999,
                        py: 1.6,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        boxShadow: "0 10px 25px rgba(188,137,30,0.18)",
                      },
                      "&&:hover": { bgcolor: "#e4b95f" },
                      "&&.Mui-disabled": { bgcolor: "#eadfc4", color: "#9a8f75" },
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={20} sx={{ color: "#111" }} />
                    ) : (
                      `Continue to secure payment — ${priceLabel}`
                    )}
                  </Button>
                  <Typography sx={{ textAlign: "center", mt: 1.4, color: "#7b8289", fontSize: "0.66rem" }}>
                    You are covered by DMN’s 30-day money-back guarantee.
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FAQ */}
      <Box component="section" id="faq" sx={{ pb: { xs: 9, md: 12 }, scrollMarginTop: 16 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography sx={kicker}>Questions</Typography>
            <Typography component="h2" sx={{ ...display, fontSize: { xs: "2.2rem", md: "3rem" }, mt: 1 }}>
              Everything else.
            </Typography>
          </Box>
          {[
            ["Who is DMN membership for?", "Dental practice owners, dentists, office managers, and clinical and administrative team members."],
            ["What is included?", "The Expert Hotline, a curated expert directory, a growing resource-kit library, practical tools and templates, a vetted company directory, and confirmed member offers."],
            ["How does registration work?", "Complete your essential membership details, choose monthly or annual billing, agree to the member terms, and pay securely—all on the same page."],
            ["When will I be charged?", "Payment is collected securely in the payment section on this page. Your DMN portal unlocks once Stripe confirms the payment."],
            ["Can I cancel?", "Yes. Membership can be cancelled anytime and includes a 30-day money-back guarantee."],
          ].map(([q, a]) => (
            <Box key={q} component="details" sx={{ borderBottom: `1px solid ${LINE}`, py: 2.75, "& summary": { cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "0.95rem" }, "& summary::after": { content: '"+"', color: GOLD_DARK, fontSize: "1.4rem", lineHeight: 1 }, "&[open] summary::after": { content: '"–"' } }}>
              <Box component="summary">{q}</Box>
              <Typography sx={{ color: MUTED, fontSize: "0.88rem", mt: 1.25, maxWidth: 760 }}>{a}</Typography>
            </Box>
          ))}
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: `1px solid ${LINE}`, py: 4, pb: { xs: 12, md: 4 }, color: "#777e86", fontSize: "0.7rem" }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between" }}>
            <span>© Dental Member Network · Powered by Thriving Dentist Inc.</span>
            <Stack direction="row" spacing={2}>
              <Box component="a" href="/legal/privacy" sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: INK } }}>Privacy</Box>
              <Box component="a" href="/legal/refund" sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: INK } }}>Cancellation</Box>
              <Box component="a" href="mailto:lester@dentalmembernetwork.com" sx={{ color: "inherit", textDecoration: "none", "&:hover": { color: INK } }}>Membership support</Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Mobile sticky CTA */}
      {!clientSecret && (
        <Box sx={{ display: { xs: "block", md: "none" }, position: "fixed", zIndex: 20, left: 12, right: 12, bottom: 12 }}>
          <Button
            href="#checkout"
            fullWidth
            sx={{
              "&&": { bgcolor: GOLD, color: "#111", fontWeight: 800, borderRadius: 999, py: 1.6, textTransform: "none", fontSize: "0.95rem", boxShadow: "0 12px 35px rgba(25,25,25,0.3)" },
              "&&:hover": { bgcolor: "#e4b95f" },
            }}
          >
            Start your membership ›
          </Button>
        </Box>
      )}
    </Box>
  );
}
