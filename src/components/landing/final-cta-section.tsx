
"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function FinalCtaSection() {
  return (
    <section id="final-cta" className="relative py-20 md:py-32 bg-gradient-to-br from-primary via-primary/90 to-accent">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="container relative z-10 text-center text-primary-foreground">
        <ShieldCheck className="h-16 w-16 mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
          Ready to Gain Effortless Control and Clear Insights with Zeneva?
        </h2>
        <p className="max-w-2xl mx-auto text-lg md:text-xl mb-10 opacity-90">
          Join hundreds of businesses transforming their operations with Zeneva. Experience full control, enhanced security, and data-driven growth.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="bg-white text-primary hover:bg-white/90 hover:text-primary/90 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Link href="/login">
              Get Started with Zeneva
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/50 text-white hover:bg-white/10 hover:text-white transform hover:scale-105 transition-all duration-200"
          >
            <Link href="#pricing">View Pricing Plans</Link>
          </Button>
        </div>
        <p className="text-xs mt-6 opacity-70">Start with our free trial. No obligations, cancel anytime.</p>
      </div>
    </section>
  );
}
