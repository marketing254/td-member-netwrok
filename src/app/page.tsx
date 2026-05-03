import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
import ProductPreview from "@/components/sections/ProductPreview";
import Features from "@/components/sections/Features";
import SavingsCalculator from "@/components/sections/SavingsCalculator";
import SLA from "@/components/sections/SLA";
import Cadence from "@/components/sections/Cadence";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import CTAForm from "@/components/sections/CTAForm";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <ProductPreview />
        <Features />
        <SavingsCalculator />
        <SLA />
        <Cadence />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTAForm />
      </main>
      <Footer />
    </>
  );
}
