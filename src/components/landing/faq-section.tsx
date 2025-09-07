"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "Our free trial gives you full access to the Pro Plan for 14 days. No credit card is required to start. You can explore all the features and see how our system can benefit your business. At the end of the trial, you can choose to upgrade or downgrade to a plan that suits your needs."
  },
  {
    question: "Can I manage multiple locations with this system?",
    answer: "Yes, our Enterprise Plan is designed for businesses with multiple locations. It allows you to manage inventory, sales, and analytics across all your stores from a single, centralized dashboard, providing a unified view of your entire operation."
  },
  {
    question: "Is this platform suitable for small and large businesses?",
    answer: "Absolutely. Our platform is built to be scalable. The Basic Plan is perfect for small businesses and startups, while the Pro and Enterprise plans offer advanced features needed for larger operations to manage complex inventory and gain deeper insights."
  },
  {
    question: "What kind of support is included?",
    answer: "All our plans come with email support. The Pro Plan includes phone and email support, and our Enterprise Plan offers 24/7 priority support with a dedicated account manager to ensure you get the help you need, whenever you need it."
  },
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer: "Yes, you have the flexibility to change your plan at any time directly from your account settings. When you upgrade, you'll get immediate access to the new features. If you downgrade, the changes will take effect at the start of your next billing cycle."
  },
  {
    question: "How easy is it to set up the system?",
    answer: "Our system is designed for a quick and easy setup. With our user-friendly interface, you can get your inventory management system up and running in minutes. We also provide clear documentation and support to guide you through the process."
  }
];

export default function FaqSection() {
  return (
    <section id="faq" className="container py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="md:sticky top-24">
          <span className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            FAQ
          </span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Got questions? We have answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <div className="mx-auto w-full">
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
      </div>
    </section>
  );
}
