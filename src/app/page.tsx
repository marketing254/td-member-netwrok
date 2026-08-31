import Header from "@/components/sections/Header";
import WaitlistHero from "@/components/sections/WaitlistHero";
import JustDropped from "@/components/sections/JustDropped";
import HelplineDemo from "@/components/sections/HelplineDemo";
import TourVideo from "@/components/sections/TourVideo";
import SocialProof from "@/components/sections/SocialProof";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import StickyMobileCTA from "@/components/sections/StickyMobileCTA";
import ScrollProgressBar from "@/components/effects/ScrollProgressBar";
import JsonLd from "@/components/seo/JsonLd";
import { faqs } from "@/lib/content";

// FAQPage JSON-LD — Google extracts these for "People also ask" boxes,
// and AI assistants use them verbatim for answering "what does DMN do",
// "how does the helpline work", "what's the price", etc.
const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: [
        f.a,
        ...((f as { items?: string[] }).items ?? []),
        (f as { aClose?: string }).aClose,
      ]
        .filter(Boolean)
        .join(" "),
    },
  })),
};

// The Supabase auth fallback (?code / ?error on the homepage) is handled
// in middleware.ts, so this page reads NO request data — it stays fully
// static and is served from the CDN edge on every visit.
export default function HomePage() {
  return (
    <>
      <JsonLd data={FAQ_JSONLD} />
      <ScrollProgressBar />
      <Header />
      <main>
        {/* Hero — ONE ask: email + Start your membership (2026-08 restructure) */}
        <WaitlistHero />
        {/* "Just dropped." — auto-scrolling shelf of real kit cards, newest first */}
        <JustDropped />
        {/* The differentiator — Helpline demo */}
        <HelplineDemo />
        {/* "See inside the member area." — click-to-play 2-minute tour */}
        <TourVideo />
        {/* Trust — testimonials + podcast credits */}
        <SocialProof />
        {/* Pricing + value stack */}
        <Pricing />
        {/* Objections */}
        <FAQ />
      </main>
      <Footer />
      {/* Mobile: hero CTA stays one glance away past the hero */}
      <StickyMobileCTA />
    </>
  );
}
