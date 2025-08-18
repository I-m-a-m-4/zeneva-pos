
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default function DashboardPreviewSection() {
  return (
    <section id="dashboard-preview" className="container py-16 md:py-24 text-center">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          See Zeneva in Action
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
          Get a sneak peek of our intuitive POS and sales interface. Manage sales, track inventory, and process transactions all in one place with Zeneva.
        </p>
      </div>
      <div className="group/preview perspective-[1000px]">
        <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl border transition-transform duration-500 ease-out group-hover/preview:scale-[1.03] group-hover/preview:rotate-x-4 max-w-5xl mx-auto">
          <Image
            src="https://images.unsplash.com/photo-1606184545585-6a537f078536?q=80&w=1200&auto=format&fit=crop"
            alt="Clean and modern Zeneva dashboard interface showing sales charts, inventory summary, and recent activity for a Nigerian business"
            width={1200}
            height={750}
            className="rounded-lg"
            data-ai-hint="modern software dashboard analytics ecommerce zeneva"
          />
        </div>
      </div>
      <div className="text-center mt-10">
        <Button size="lg" asChild className="transform hover:scale-105 transition-transform duration-200 ease-in-out">
          <Link href="/sales/pos/select-products">
            <Eye className="mr-2 h-5 w-5" /> Explore the App (Demo)
          </Link>
        </Button>
      </div>
    </section>
  );
}
