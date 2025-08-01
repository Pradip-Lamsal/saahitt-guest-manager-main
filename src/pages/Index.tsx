
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { EventTypes } from "@/components/landing/EventTypes";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <Features />
        <EventTypes />
        <Pricing />
        <FAQ />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
