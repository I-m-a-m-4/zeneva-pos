
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import TypewriterEffect from '@/components/landing/typewriter-effect';

export default function HeroSection() {
  return (
    <section className="container grid lg:grid-cols-2 gap-10 items-center py-20 md:py-32 text-center lg:text-left relative overflow-hidden">
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl opacity-50 animate-subtle-pulse animation-delay-2000"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-3xl opacity-50 animate-subtle-pulse animation-delay-4000"></div>
      
      <div className="lg:order-1 space-y-6 z-10">
        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary mx-auto lg:mx-0 animate-fade-in-up">
          <Sparkles className="inline-block h-4 w-4 mr-1" />
          Effortless Control & Clear Insights for Growing Businesses
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl min-h-[150px] sm:min-h-[190px] md:min-h-[280px] lg:min-h-[330px]">
          <TypewriterEffect
            text="Grow Your Business with Zeneva"
            className="font-bold text-gradient-primary-accent"
          />
        </h1>
        <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          Unlock Effortless Control & Clear Insights. Zeneva powers SMEs to streamline operations, secure profits, and achieve sustainable growth. Explore our affordable plans, including a free inventory tier.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Button size="lg" asChild className="hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            <Link href="/login">
              Get Started with Zeneva
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="transform hover:scale-105 transition-all duration-200 hover:bg-accent/10">
            <Link href="#features">Discover Features</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.8s' }}>Empowering growth with smart, affordable solutions.</p>
      </div>
      <div className="lg:order-2 flex justify-center z-10 animate-fade-in-up perspective-[1000px]" style={{ animationDelay: '0.2s' }}>
        <div className="animated-gradient-border-wrapper transition-transform duration-500 ease-in-out transform-gpu rotate-x-4 hover:rotate-x-0">
          <Image
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop"
            alt="Diverse business team happily using Zeneva POS software in a modern retail environment, showcasing growth and control."
            width={600}
            height={450}
            className="rounded-lg shadow-2xl" 
            priority
            data-ai-hint="business team planning doodles"
          />
        </div>
      </div>
    </section>
  );
}
