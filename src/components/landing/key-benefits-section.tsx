
"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, BarChartHorizontalBig, BookOpenCheck } from "lucide-react";
import Image from "next/image";

const benefits = [
  {
    icon: <BookOpenCheck className="h-8 w-8 text-primary mb-3" />,
    title: "Real-Time Inventory Tracking",
    description: "Zeneva provides real-time inventory tracking to prevent stockouts and overselling, ensuring your business runs smoothly.",
    imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1200&auto=format&fit=crop",
    imageHint: "cashier processing a sale with pos system"
  },
  {
    icon: <BarChartHorizontalBig className="h-8 w-8 text-primary mb-3" />,
    title: "Automatic Reordering",
    description: "Set reorder points and let Zeneva automatically generate purchase orders when stock is low, saving you time and effort.",
    imageUrl: "https://images.unsplash.com/photo-1576185250352-17515b331500?q=80&w=1200&auto=format&fit=crop",
    imageHint: "inventory management in a warehouse"
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary mb-3" />,
    title: "Comprehensive Analytics",
    description: "Gain valuable insights with detailed analytics on sales, inventory turnover, and profitability to make data-driven decisions.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    imageHint: "analytics dashboard with charts and graphs"
  },
];

export default function KeyBenefitsSection() {
  return (
    <section id="key-benefits" className="container py-16 md:py-24 text-center">
        <div className="mb-4">
            <span className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            Benefits
          </span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Why Choose Our Inventory Management System
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
            Boost workforce productivity, good efficiency, and stay ahead with smart management insights.
          </p>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="text-left bg-card shadow-lg hover:shadow-xl transition-shadow p-6">
            <CardHeader>
                {benefit.icon}
              <CardTitle>{benefit.title}</CardTitle>
            </CardHeader>
            <CardDescription className="px-6 pb-6 text-base">
              {benefit.description}
            </CardDescription>
            <Image 
                src={benefit.imageUrl} 
                alt={benefit.title} 
                width={400} 
                height={250} 
                className="rounded-lg border shadow-sm mt-4 aspect-video object-cover"
                data-ai-hint={benefit.imageHint}
            />
          </Card>
        ))}
      </div>
    </section>
  );
}
