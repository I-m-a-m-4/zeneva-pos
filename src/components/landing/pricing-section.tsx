"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { mockSubscriptionTiers } from "@/lib/data"; 

export default function PricingSection() {
  
  const pricingTiers = [
    {
        name: "Basic Plan",
        price: "$29",
        features: ["Manage up to 100 products", "Basic stock monitoring", "Email support"],
        cta: "Get Started",
        popular: false
    },
    {
        name: "Pro Plan",
        price: "$59",
        features: ["Manage up to 5,000 products", "Advanced sales analytics", "Automated stock and reorder alerts", "Phone and email support"],
        cta: "Start Free Trial",
        popular: true
    },
    {
        name: "Enterprise Plan",
        price: "$129",
        features: ["Unlimited products", "Customizable analytics dashboard", "Advanced supply management", "24/7 Priority support"],
        cta: "Contact Us",
        popular: false
    }
  ]

  return (
    <section id="pricing" className="container py-16 md:py-24 text-center">
      <div className="mb-12">
         <span className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            Pricing
          </span>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Choose the Right Plan for Your Growth
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground md:text-lg">
          From basic inventory needs to advanced analytics, our plans are designed to scale with your business.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={`flex flex-col text-center h-full shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2
              ${tier.popular ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
          >
            <CardHeader className="pt-10">
              <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
              <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className={`${tier.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 text-left text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle className={`h-5 w-5 mr-2.5 shrink-0 ${tier.popular ? 'text-primary-foreground/80' : 'text-primary'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                asChild
                className={`w-full transform hover:scale-105 transition-transform duration-200 ease-in-out
                  ${tier.popular ? 'bg-white text-primary hover:bg-gray-200' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                variant={tier.popular ? "default" : "outline"}
              >
                <Link href="/login">{tier.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
