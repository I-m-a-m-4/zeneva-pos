
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import type { SubscriptionTier } from "@/types";

// Since mock data is removed, we'll define a placeholder here
const mockSubscriptionTiers: SubscriptionTier[] = [
    { id: "free", name: "Free", priceMonthly: 0, features: ["50 Products", "1 User", "Basic POS"], cta: "Get Started Free", href: "/login" },
    { id: "pro", name: "Pro", priceMonthly: 7500, priceYearly: 75000, features: ["Unlimited Products", "5 Users", "Full POS & CRM", "AI Insights"], cta: "Choose Pro", href: "/checkout?plan=pro", popular: true },
    { id: "lifetime", name: "Lifetime", priceLifetime: 250000, features: ["All Pro Features", "Lifetime Updates", "Priority Support"], cta: "Get Lifetime", href: "/checkout?plan=lifetime" },
    { id: "enterprise", name: "Enterprise", features: ["Custom Solutions", "Dedicated Support", "API Access"], cta: "Contact Sales", href: "/contact" }
];

export default function PricingSection() {
  
  const getPlanHref = (tier: typeof mockSubscriptionTiers[0]): string => {
    if (tier.id === 'enterprise') {
        return tier.href;
    }
    // Updated to handle cases where login is the intended action
    return tier.id === 'free' ? '/login' : `/checkout?plan=${tier.id}`;
  };

  return (
    <section id="pricing" className="container py-16 md:py-24 text-center">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Simple, Transparent, and Affordable Pricing for Zeneva
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground md:text-lg">
          Choose the Zeneva plan that's right for your business. Our free inventory management tier helps you start with no cost. No hidden fees, cancel anytime.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {mockSubscriptionTiers && mockSubscriptionTiers.length > 0 ? (
          mockSubscriptionTiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 p-0.5
              ${tier.popular ? `bg-gradient-to-br ${tier.gradient || 'from-primary to-accent'}` : 'bg-border/30'}`}
          >
            <Card
              className={`flex flex-col text-center h-full ${tier.popular ? '' : 'bg-card'}`}
            >
              {tier.popular && (
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                      <Star className="h-3 w-3" /> Most Popular
                    </span>
                  </div>
                </div>
              )}
              <CardHeader className="pt-10">
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="min-h-[40px]">
                  {tier.id === 'pro' ? "For growing businesses that need more power and insights from Zeneva." :
                   tier.id === 'free' ? "Perfect for new businesses getting started with Zeneva's free inventory management." :
                   tier.id === 'lifetime' ? "One-time payment for ultimate value and long-term access to Zeneva." :
                   "Tailored Zeneva solutions for larger operations and franchises."}
                </CardDescription>
                <div className="mt-4">
                  {tier.priceMonthly !== undefined && tier.priceYearly !== undefined && tier.id === 'pro' ? (
                    <>
                      <div className="mb-1">
                        <span className="text-4xl font-bold">₦{tier.priceMonthly.toLocaleString()}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        or <span className="font-semibold text-primary">₦{tier.priceYearly.toLocaleString()}</span>/year (Save ~16%)
                      </p>
                    </>
                  ) : tier.priceLifetime !== undefined ? (
                     <div>
                        <span className="text-4xl font-bold">₦{tier.priceLifetime.toLocaleString()}</span>
                        <span className="text-muted-foreground block text-sm">One-time payment</span>
                     </div>
                  ) : tier.priceMonthly !== undefined ? (
                    <div>
                        <span className="text-4xl font-bold">₦{tier.priceMonthly.toLocaleString()}</span>
                        <span className="text-muted-foreground">/month</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold">Custom</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3 text-left text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      {feature.includes("(Coming Soon)") ?
                        <Sparkles className="h-4 w-4 text-yellow-500 mr-2.5 shrink-0 mt-0.5" /> :
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2.5 shrink-0 mt-0.5" />
                      }
                      <span>{feature.replace("Zeneva", "")}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button
                  asChild
                  className={`w-full transform hover:scale-105 transition-transform duration-200 ease-in-out shadow-md
                    ${tier.popular ? (tier.gradient ? `bg-gradient-to-r ${tier.gradient} text-white hover:opacity-90` : 'bg-primary text-primary-foreground hover:bg-primary/90') : 'bg-card text-card-foreground border border-primary hover:bg-primary/10'}`}
                  variant={tier.popular ? "default" : "outline"}
                >
                  <Link href={getPlanHref(tier)}>{tier.cta.replace("Zeneva", "")}</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))
        ) : (
          <p className="col-span-full text-muted-foreground">Pricing plans are currently unavailable. Please check back later.</p>
        )}
      </div>
    </section>
  );
}
