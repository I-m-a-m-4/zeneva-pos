
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="container py-16 md:py-24 text-center">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Loved by Businesses Like Yours
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground md:text-lg">
          Hear what our satisfied customers have to say about Zeneva.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.name}
            className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 text-left bg-card/90 backdrop-blur-sm"
          >
            <CardContent className="pt-6">
              <blockquote className="text-lg italic text-foreground mb-6 relative">
                 <span className="absolute -top-2 -left-3 text-6xl text-primary/30 font-serif">&ldquo;</span>
                {testimonial.quote}
                 <span className="absolute -bottom-6 -right-0 text-6xl text-primary/30 font-serif">&rdquo;</span>
              </blockquote>
              <div className="flex items-center mt-8 pt-4 border-t border-dashed">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} data-ai-hint={testimonial.dataAiHint} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold">{testimonial.avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
