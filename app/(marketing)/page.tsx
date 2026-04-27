import { HeroSection } from "@/components/ui/hero-section";
import { FeaturesSection } from "@/components/ui/features-section";
import { HowItWorksSection } from "@/components/ui/how-it-works-section";
import { TemplatesSection } from "@/components/ui/templates-section";
import { TestimonialsSection } from "@/components/ui/testimonials-section";
import { PricingCard } from "@/components/ui/pricing-card";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TemplatesSection />
      <TestimonialsSection />
      <PricingCard />
    </>
  );
}
