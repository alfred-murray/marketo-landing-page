import { Navbar } from "./components/sections/Navbar";
import { Hero } from "./components/sections/Hero";
import { LogoCloud } from "./components/sections/LogoCloud";
import { Features } from "./components/sections/Features";
import { ProductShowcase } from "./components/sections/ProductShowcase";
import { Stats } from "./components/sections/Stats";
import { Testimonial } from "./components/sections/Testimonial";
import { Pricing } from "./components/sections/Pricing";
import { CTA } from "./components/sections/CTA";
import { Footer } from "./components/sections/Footer";

export default function Page() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <LogoCloud />
      <Features />
      <ProductShowcase />
      <Stats />
      <Testimonial />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
