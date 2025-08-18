
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Target, Lightbulb, Users, Handshake, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: 'About Zeneva | Our Mission and Story',
  description: 'Learn about Zeneva\'s mission to empower SMEs with effortless POS and inventory management tools. Discover our story and the team dedicated to your business growth.',
  openGraph: {
    title: 'About Zeneva | Our Mission and Story',
    description: 'Discover the story behind Zeneva and our commitment to helping businesses thrive with smart, accessible technology.',
    url: '/about',
  },
};

const teamMembers = [
  { name: "Your Name", role: "CEO & Founder", imageHint: "male CEO portrait professional" },
  { name: "Technical Co-Founder", role: "CTO (Seeking)", imageHint: "question mark icon" },
  { name: "Growth Co-Founder", role: "COO / Growth (Seeking)", imageHint: "chart graph icon" },
];

export default function AboutPage() {
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 space-y-16">
      
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-gradient-primary-accent">Our Mission</h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
          To empower Small and Medium-sized Enterprises (SMEs) everywhere with simple, powerful, and affordable technology that provides <span className="font-semibold text-primary">effortless control</span> and <span className="font-semibold text-primary">clear insights</span> for sustainable growth.
        </p>
      </section>

      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">The Zeneva Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Zeneva was born from a simple observation: countless talented entrepreneurs were being held back by manual processes, inventory chaos, and a lack of clear data. We saw businesses with incredible potential struggling with stock discrepancies, tedious record-keeping, and the stress of not knowing their true financial standing.
              </p>
              <p>
                We believed there had to be a better way. A way that didn't require expensive, complicated software. We set out to build a tool that was not just a piece of technology, but a genuine partner for growth—intuitive to use, powerful in its capabilities, and built with the unique challenges of growing businesses in mind. That's how Zeneva started.
              </p>
            </div>
          </div>
          <div className="h-64 md:h-full w-full relative">
             <Image src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop" alt="A collage showing the journey of a small business from manual bookkeeping to using the Zeneva POS system." layout="fill" objectFit="cover" data-ai-hint="business journey technology growth" />
          </div>
        </div>
      </Card>

      <section>
        <h2 className="text-3xl font-bold text-center mb-10">Our Core Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Lightbulb, title: "Simplicity", description: "Technology should be an enabler, not a hurdle. We design for clarity and ease of use." },
            { icon: Users, title: "Customer-Centric", description: "Our users are our partners. We build based on their needs and feedback." },
            { icon: Target, title: "Empowerment", description: "We provide the tools and insights that give business owners control over their destiny." },
            { icon: Handshake, title: "Integrity", description: "We are committed to transparency, security, and being a trustworthy partner." },
          ].map(value => (
            <Card key={value.title} className="text-center p-6 hover:shadow-lg transition-shadow">
              <value.icon className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-10">The Founding Team</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map(member => (
            <div key={member.name} className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                <AvatarImage src={member.role.includes("Seeking") ? "" : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fDE?q=80&w=100&auto=format&fit=crop`} alt={`Portrait of ${member.name}`} data-ai-hint={member.imageHint} />
                <AvatarFallback>{member.role.includes("Seeking") ? "?" : member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className={`font-medium ${member.role.includes("Seeking") ? "text-amber-500" : "text-primary"}`}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center bg-muted/50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-3">Join Us on Our Journey</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Ready to take control of your business and unlock its full potential? Start with Zeneva today.</p>
          <Button size="lg" asChild>
              <Link href="/#pricing">View Pricing and Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
      </section>

    </div>
  );
}
