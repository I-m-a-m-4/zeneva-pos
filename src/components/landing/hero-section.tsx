
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-primary text-primary-foreground relative overflow-hidden bg-grid-pattern">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-20 md:py-28 lg:py-32">
          
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white">
              Real-Time Inventory Insights, Anytime, Anywhere
            </h1>
            <p className="mx-auto text-primary-foreground/80 md:text-xl">
              Automate stock updates, streamline order processes, and manage multiple
              locations with an inventory system that works for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" variant="outline" asChild className="border-white bg-black text-white hover:bg-black/80 transform hover:scale-105 transition-all duration-200">
              <Link href="#features">Learn More</Link>
            </Button>
            <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg transform hover:scale-105 transition-all duration-200">
              <Link href="/login">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative -mb-[15%] md:-mb-[10%] lg:-mb-[8%] xl:-mb-[6%] z-20 group perspective-[1000px]">
          <div className="relative rounded-t-xl transition-transform duration-500 ease-out group-hover:scale-[1.03] group-hover:rotate-x-4">
             <div className="absolute inset-0 bg-black/50 rounded-t-xl flex items-center justify-center z-10 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayCircle className="w-20 h-20 text-white/70 group-hover:text-white transition-colors duration-300" />
            </div>
             <div className="p-2 rounded-xl bg-gradient-to-b from-gray-800 via-gray-900 to-black shadow-2xl">
                 <video
                    src="/zeneva.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="rounded-lg w-full"
                    poster="https://images.unsplash.com/photo-1606184545585-6a537f078536?q=80&w=1200&auto=format&fit=crop"
                >
                  Your browser does not support the video tag.
                </video>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
