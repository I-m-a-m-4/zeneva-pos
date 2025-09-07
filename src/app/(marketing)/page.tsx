import HeroSection from '@/components/landing/hero-section';
import FeaturesOverview from '@/components/landing/features-overview';
import KeyBenefitsSection from '@/components/landing/key-benefits-section';
import PricingSection from '@/components/landing/pricing-section';
import FaqSection from '@/components/landing/faq-section';
import FinalCtaSection from '@/components/landing/final-cta-section';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import ControlAndClaritySection from '@/components/landing/control-and-clarity-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesOverview />
      <HowItWorksSection />
      <ControlAndClaritySection />
      <TestimonialsSection />
      <KeyBenefitsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
