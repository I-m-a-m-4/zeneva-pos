
"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, ShieldCheck, Smile, TrendingUp, Users, Lock, FileDigit, NotebookPen } from "lucide-react";

const benefits = [
  {
    icon: <Zap className="h-8 w-8 text-primary mb-3 mx-auto" />,
    title: "Effortless Control",
    description: "Intuitive tools from Zeneva put you in command of your inventory and sales, simplifying daily tasks and operations.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary mb-3 mx-auto" />,
    title: "Delegate with Confidence",
    description: "Secure user roles allow you to assign tasks to staff without exposing sensitive business data, so you can grow your team.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary mb-3 mx-auto" />,
    title: "Data-Driven Growth",
    description: "Understand your business better with clear reports. Identify top-selling products and make smarter decisions to increase profits.",
  },
   {
    icon: <ShieldCheck className="h-8 w-8 text-primary mb-3 mx-auto" />,
    title: "Secure Your Profits",
    description: "Minimize errors and track every sale with digital records. A clear audit trail improves accountability and reduces discrepancies.",
  },
];

export default function KeyBenefitsSection() {
  return (
    <section id="key-benefits" className="container py-16 md:py-24 relative text-center">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Go Beyond Chat, Build a Real Business
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
          Zeneva provides the structure and security that messaging apps lack, giving you the foundation to scale professionally.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="text-center bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5">
            <CardHeader className="items-center">
              {benefit.icon}
              <CardTitle className="text-xl">{benefit.title}</CardTitle>
            </CardHeader>
            <CardDescription className="px-6 pb-6 text-sm">
              {benefit.description}
            </CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
