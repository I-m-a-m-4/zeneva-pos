
"use client";

import * as React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Zeneva transformed how we manage our stock. Tracking sizes and colors for my boutique is so simple now!",
    name: "Aisha Bello",
    role: "Owner, The Chic Boutique",
    avatarFallback: "AB",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    dataAiHint: "smiling female entrepreneur fashion store",
  },
  {
    quote: "The reporting features in Zeneva are a game-changer. We finally have clear insights into which gadgets sell best and our profit margins. No more guesswork!",
    name: "Chinedu Okoro",
    role: "Manager, Tech Gadgets Hub",
    avatarFallback: "CO",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    dataAiHint: "professional man tech store manager",
  },
  {
    quote: "As an online-only business, tracking inventory and sales through DMs was a nightmare. Zeneva gave me a proper system to stay organized and look professional.",
    name: "Fatima Sani",
    role: "Founder, Glow Skincare (Online)",
    avatarFallback: "FS",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    dataAiHint: "happy woman small business owner",
  },
  {
    quote: "The best part is how easy it is to use. My staff learned the POS system in one afternoon. It has made our daily operations much faster.",
    name: "Emeka Okafor",
    role: "Proprietor, Nkechi's Confectionery",
    avatarFallback: "EO",
    imageUrl: "https://images.unsplash.com/photo-1596245468238-924eb8703d15?q=80&w=100&auto=format&fit=crop",
    dataAiHint: "male baker smiling bakery",
  },
  {
    quote: "Low stock alerts are a lifesaver. We run a hardware store with thousands of items, and Zeneva ensures we never run out of our most critical products.",
    name: "Ibrahim Musa",
    role: "Owner, BuildRight Hardware",
    avatarFallback: "IM",
    imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=100&auto=format&fit=crop",
    dataAiHint: "confident man hardware store owner",
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section id="testimonials" className="relative py-20 md:py-32 overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop"
            alt="A diverse group of business owners collaborating in a modern workspace"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 z-0 opacity-10"
            data-ai-hint="business collaboration workspace"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50 z-0"></div>
        
        <div className="container relative z-10 text-center">
            <div className="mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Loved by Businesses Like Yours
                </h2>
                <p className="mt-4 max-w-xl mx-auto text-muted-foreground md:text-lg">
                Hear what our satisfied customers have to say about Zeneva.
                </p>
            </div>
            
            <div className="relative h-80 flex items-center justify-center">
                 <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute"
                    >
                         <Card className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm shadow-2xl border-border/20">
                            <CardContent className="p-8">
                                <blockquote className="text-xl italic text-foreground mb-6 relative">
                                    <span className="absolute -top-4 -left-4 text-8xl text-primary/10 font-serif opacity-50">&ldquo;</span>
                                    {currentTestimonial.quote}
                                </blockquote>
                                <div className="flex items-center justify-center mt-8 pt-4 border-t border-dashed border-border/30">
                                    <Avatar className="h-12 w-12 mr-4">
                                        <AvatarImage src={currentTestimonial.imageUrl} alt={currentTestimonial.name} data-ai-hint={currentTestimonial.dataAiHint} />
                                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">{currentTestimonial.avatarFallback}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{currentTestimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>

             <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            currentIndex === index ? 'w-6 bg-primary' : 'bg-muted-foreground/50'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>

        </div>
    </section>
  );
}
