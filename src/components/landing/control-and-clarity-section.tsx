
"use client";

import Image from 'next/image';
import { CheckCircle, BarChartHorizontalBig, BookOpenCheck, TrendingUp, NotebookPen } from 'lucide-react';

export default function ControlAndClaritySection() {
  return (
    <section id="control-and-clarity" className="container py-16 md:py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <span className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            More Than Just Chat
          </span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
            Why Zeneva is the Smarter Choice Over WhatsApp Business
          </h2>
          <p className="text-lg text-muted-foreground mb-6 mx-auto lg:mx-0 max-w-xl">
            While WhatsApp is great for customer chats, Zeneva is built to be the operational core of your business, giving you the structure and automation needed for serious growth.
          </p>
          <ul className="space-y-4 text-left max-w-md mx-auto lg:mx-0">
            <li className="flex items-start p-3 rounded-md hover:bg-muted/50 transition-colors duration-200">
              <BookOpenCheck className="h-7 w-7 text-green-500 mr-3 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold">Automated Bookkeeping</h4>
                <p className="text-muted-foreground text-sm">Stop tracking sales in one app and expenses in another. Zeneva integrates your sales, stock, and expenses automatically, giving you a clear financial picture without the manual work.</p>
              </div>
            </li>
             <li className="flex items-start p-3 rounded-md hover:bg-muted/50 transition-colors duration-200">
              <TrendingUp className="h-7 w-7 text-accent mr-3 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold">Real Business Insights</h4>
                <p className="text-muted-foreground text-sm">Don't just guess what's working. Zeneva's reports show your best-selling products and peak sales times, turning your data into actionable growth strategies that WhatsApp can't provide.</p>
              </div>
            </li>
            <li className="flex items-start p-3 rounded-md hover:bg-muted/50 transition-colors duration-200">
              <NotebookPen className="h-7 w-7 text-primary mr-3 shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold">Scale Without Chaos</h4>
                <p className="text-muted-foreground text-sm">As your business grows, chat-based sales become unmanageable. Zeneva provides a structured system for orders, customers, and employees so you can scale efficiently and professionally.</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex justify-center items-center">
          <Image
            src="https://images.unsplash.com/photo-1599658880436-c61792e70672?q=80&w=500&auto=format&fit=crop"
            alt="Calm Nigerian business owner using Zeneva POS on a tablet in a bright, modern retail store"
            width={500}
            height={400}
            className="rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out"
            data-ai-hint="calm nigerian business owner tablet store"
          />
        </div>
      </div>
    </section>
  );
}
