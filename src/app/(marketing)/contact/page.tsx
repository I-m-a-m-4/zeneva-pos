
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MessageSquare, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What do I need to start using Zeneva?",
    answer: "All you need is a device with a web browser, like a smartphone, tablet, or computer. Zeneva is cloud-based, so there's no complex software to install. For the best experience, a stable internet connection is recommended, but our PWA allows for offline sales."
  },
  {
    question: "Is my business data secure with Zeneva?",
    answer: "Absolutely. We take data security very seriously. Your data is encrypted and stored securely in the cloud. We also recommend setting strong passwords and managing user roles carefully within the app for an added layer of security."
  },
  {
    question: "Can I import my existing products?",
    answer: "Yes! Zeneva supports importing your products via a CSV file. You can find the 'Import Products (CSV)' option on the Inventory page to quickly get your existing stock into the system."
  },
  {
    question: "How does the free tier work?",
    answer: "Our Free Tier is designed to help new and small businesses get started with professional inventory management at no cost. It includes basic inventory tracking and POS features with a limit on the number of products. You can upgrade to a Pro plan at any time to unlock more features and unlimited products."
  },
];

export default function ContactPage() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-gradient-primary-accent">Get in Touch</h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          We're here to help! Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-12">
        {/* --- Contact Form Section --- */}
        <div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="e.g., Ada" data-ai-hint="first name input" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="e.g., Eze" data-ai-hint="last name input" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" data-ai-hint="email input" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="How can we help you?" rows={5} data-ai-hint="message text area" />
                </div>
                <Button type="submit" className="w-full" size="lg">Send Message</Button>
              </form>
            </CardContent>
          </Card>
           <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-center">Or reach us directly:</h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="outline" asChild><a href="mailto:support@zeneva.app"><Mail className="mr-2 h-4 w-4"/> support@zeneva.app</a></Button>
                <Button variant="outline" asChild><a href="tel:+2349064233805"><Phone className="mr-2 h-4 w-4"/> +234 906 423 3805</a></Button>
            </div>
           </div>
        </div>

        {/* --- FAQ Section --- */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><HelpCircle className="h-6 w-6 text-primary"/> Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
