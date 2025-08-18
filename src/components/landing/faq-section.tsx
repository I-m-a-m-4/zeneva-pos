
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import * as React from 'react';
import AiAssistantDialog from "@/components/shared/ai-assistant-dialog";

const faqs = [
  {
    question: "What do I need to start using Zeneva?",
    answer: "All you need is a device with a web browser, like a smartphone, tablet, or computer. Zeneva is cloud-based, so there's no complex software to install. For the best experience, a stable internet connection is recommended, but our PWA allows for offline sales."
  },
  {
    question: "Is my business data secure with Zeneva?",
    answer: "Absolutely. We take data security very seriously. Your data is encrypted and stored securely in the cloud. We also provide user role management, so you can control exactly what your staff can see and do. This is a level of security you don't get with notebooks or simple chat apps."
  },
  {
    question: "Can I import my existing products?",
    answer: "Yes! Zeneva supports importing your products via a CSV file. You can find the 'Import Products (CSV)' option on the Inventory page to quickly get your existing stock into the system."
  },
  {
    question: "How does the free tier work?",
    answer: "Our Free Tier is designed to help new and small businesses get started with professional inventory management at no cost. It includes basic inventory tracking and POS features with a limit on the number of products. You can upgrade to a Pro plan at any time to unlock more features and unlimited products."
  },
  {
    question: "How does Zeneva AI help me?",
    answer: "Zeneva AI acts like your personal business analyst. It reviews your sales and inventory data to give you simple, actionable advice. For example, it can suggest which popular products to restock, identify items that aren't selling well, or even help you find and fix data errors in your inventory."
  }
];

export default function FaqSection() {
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);

  return (
    <>
      <section id="faq" className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
         <div className="mt-12 text-center p-6 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
            <h3 className="text-xl font-semibold text-foreground">Still have questions?</h3>
            <p className="text-muted-foreground mt-2 mb-4">Our AI assistant can provide more specific answers about Zeneva's features.</p>
            <Button onClick={() => setIsAssistantOpen(true)}>
                <Bot className="mr-2 h-5 w-5"/>
                Ask Zeneva AI
            </Button>
        </div>
      </section>
      <AiAssistantDialog isOpen={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
    </>
  );
}
