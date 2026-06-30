import { redirect } from "next/navigation";
import Header from "@/components/sections/Header";
import WaitlistHero from "@/components/sections/WaitlistHero";
import PoweredByStrip from "@/components/sections/PoweredByStrip";
import HelplineDemo from "@/components/sections/HelplineDemo";
import SocialProof from "@/components/sections/SocialProof";
import Features from "@/components/sections/Features";
import OneNetworkThreeWays from "@/components/sections/OneNetworkThreeWays";
import MemberLibraryPreview from "@/components/sections/MemberLibraryPreview";
import ROICalculator from "@/components/sections/ROICalculator";
import Pricing from "@/components/sections/Pricing";
import WhoItsFor from "@/components/sections/WhoItsFor";
import FreeKitMagnet from "@/components/sections/FreeKitMagnet";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
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

type HomeSearchParams = Promise<{
  code?: string | string[];
  error?: string | string[];
  error_description?: string | string[];
  error_code?: string | string[];
  next?: string | string[];
  role?: string | string[];
}>;

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const params = await searchParams;

  // Supabase Auth fallback handler — when the magic-link redirect URL isn't
  // in Supabase's allowlist, Supabase falls back to the Site URL (this
  // homepage) and appends ?code=... Forward that to /auth/callback so the
  // exchange + bootstrap still run normally.
  const code = Array.isArray(params.code) ? params.code[0] : params.code;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  const role = Array.isArray(params.role) ? params.role[0] : params.role;
  if (code) {
    const target = new URLSearchParams({ code });
    if (next) target.set("next", next);
    if (role) target.set("role", role);
    redirect(`/auth/callback?${target.toString()}`);
  }

  // Same for Supabase Auth error redirects (e.g. otp_expired).
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  if (error) {
    const errorDescription = Array.isArray(params.error_description)
      ? params.error_description[0]
      : params.error_description;
    const target = new URLSearchParams({ error });
    if (errorDescription) target.set("error_description", errorDescription);
    redirect(`/auth/callback?${target.toString()}`);
  }

  return (
    <>
      <JsonLd data={FAQ_JSONLD} />
      <ScrollProgressBar />
      <Header />
      <main>
        {/* Hero — left copy + right launch-card with countdown + CTA */}
        <WaitlistHero />
        {/* Connected communities behind DMN */}
        <PoweredByStrip />
        {/* The differentiator — Helpline demo */}
        <HelplineDemo />
        {/* Trust — testimonials + podcast credits */}
        <SocialProof />
        {/* What you get */}
        <Features />
        {/* Inside the member portal */}
        <MemberLibraryPreview />
        {/* Do the math */}
        <ROICalculator />
        {/* Pricing + value stack */}
        <Pricing />
        {/* Honest fit check */}
        <WhoItsFor />
        {/* Free kit lead magnet */}
        <FreeKitMagnet />
        {/* One network. Three ways in. — Members / Experts / Partners */}
        <OneNetworkThreeWays />
        {/* Objections */}
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
