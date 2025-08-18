
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: 'Zeneva Blog | Business Growth Tips for SMEs',
  description: 'Explore the Zeneva blog for expert tips on inventory management, sales strategies, customer engagement, and business growth for small and medium-sized businesses.',
  openGraph: {
    title: 'Zeneva Blog | Business Growth Tips for SMEs',
    description: 'Your go-to resource for actionable insights to help your business thrive.',
    url: '/blog',
  },
};


export default function BlogPage() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 space-y-16">
      
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-gradient-primary-accent">The Zeneva Blog</h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          Actionable insights, tips, and inspiration to help you run and grow your business.
        </p>
      </section>

      <section className="text-center py-20 border-2 border-dashed border-muted rounded-lg">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h2 className="text-2xl font-semibold">Content Coming Soon</h2>
          <p className="text-muted-foreground mt-2">Our blog is being updated with fresh content. Please check back later!</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/">Back to Home <ArrowRight className="ml-2 h-4 w-4"/></Link>
          </Button>
      </section>

    </div>
  );
}
