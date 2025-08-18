
import Link from 'next/link';
import HeroSection from '@/components/landing/hero-section';
import FeaturesOverview from '@/components/landing/features-overview';
import DashboardPreviewSection from '@/components/landing/dashboard-preview-section';
import KeyBenefitsSection from '@/components/landing/key-benefits-section';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import PricingSection from '@/components/landing/pricing-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import FinalCtaSection from '@/components/landing/final-cta-section';
import FaqSection from '@/components/landing/faq-section';
import ControlAndClaritySection from '@/components/landing/control-and-clarity-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesOverview />
      <DashboardPreviewSection />
      <KeyBenefitsSection />
      <ControlAndClaritySection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
