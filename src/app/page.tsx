import { redirect } from "next/navigation";
import Header from "@/components/sections/Header";
import WaitlistHero from "@/components/sections/WaitlistHero";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import WaitlistSection from "@/components/sections/WaitlistSection";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import ScrollProgressBar from "@/components/effects/ScrollProgressBar";

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
      <ScrollProgressBar />
      <Header />
      <main>
        <WaitlistHero />
        <Features />
        <Pricing />
        <WaitlistSection />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
