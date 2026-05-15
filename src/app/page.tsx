import Header from "@/components/sections/Header";
import WaitlistHero from "@/components/sections/WaitlistHero";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import WaitlistSection from "@/components/sections/WaitlistSection";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";
import ScrollProgressBar from "@/components/effects/ScrollProgressBar";

export default function HomePage() {
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
