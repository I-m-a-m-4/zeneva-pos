"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FinalCtaSection() {
  return (
    <section id="final-cta" className="relative py-20 md:py-32 bg-gray-900">
      <div className="container relative z-10 text-center text-primary-foreground">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
          Ready to Take Control of Your Inventory?
        </h2>
        <p className="max-w-2xl mx-auto text-lg md:text-xl mb-10 opacity-90">
          Join businesses who trust our system for their inventory management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Link href="/login">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
