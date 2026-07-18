import { Hero } from "@/components/landing/hero";
import { Countdown } from "@/components/landing/countdown";
import {
  ProblemSection,
  SolutionSection,
  CategoriesSection,
  BenefitsSection,
  HowItWorksSection,
  ForWhoSection,
  PricingSection,
  FAQSection,
  FinalCTASection,
  LandingFooter,
} from "@/components/landing/sections";

export default function LocalePage() {
  return (
    <main>
      <Hero />
      <Countdown />
      <ProblemSection />
      <SolutionSection />
      <CategoriesSection />
      <BenefitsSection />
      <HowItWorksSection />
      <ForWhoSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <LandingFooter />
    </main>
  );
}
