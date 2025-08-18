
"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, ShoppingCart, BarChartHorizontalBig, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: <Settings className="h-10 w-10 text-primary mb-3 mx-auto" />,
    title: "1. Easy Setup",
    description: "Configure your business details with Zeneva, add products, and set up users in minutes. No complex installations.",
  },
  {
    icon: <ShoppingCart className="h-10 w-10 text-primary mb-3 mx-auto" />,
    title: "2. Track & Sell",
    description: "Use the intuitive Zeneva POS for sales, and let Zeneva automatically update your stock levels in real-time.",
  },
  {
    icon: <BarChartHorizontalBig className="h-10 w-10 text-primary mb-3 mx-auto" />,
    title: "3. Gain Insights & Grow",
    description: "Access powerful reports from Zeneva to understand your performance, optimize operations, and scale your business confidently.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="container py-16 md:py-24 text-center">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Get Started with <span className="text-gradient-primary-accent">Zeneva</span> in 3 Simple Steps
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
          We've designed Zeneva to be incredibly easy to use, so you can focus on what matters most – your business.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center text-center relative group animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s` }}>
            <Card className="w-full flex-grow flex flex-col items-center p-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 bg-card/90 backdrop-blur-sm">
              <CardHeader className="items-center">
                {step.icon}
                <CardTitle className="text-xl">{step.title}</CardTitle>
              </CardHeader>
              <CardDescription className="px-2 pb-4 text-sm">
                {step.description}
              </CardDescription>
            </Card>
            {index < steps.length - 1 && (
              <ArrowRight className="h-8 w-8 text-primary absolute top-1/2 -right-4 transform -translate-y-1/2 hidden md:block opacity-30 group-hover:opacity-100 transition-opacity" />
            )}
             {index < steps.length - 1 && (
              <ArrowRight className="h-8 w-8 text-primary transform rotate-90 md:hidden my-4 opacity-30 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
