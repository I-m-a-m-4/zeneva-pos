"use client";

import Link from 'next/link';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Linkedin, Instagram, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as React from 'react';

const VisaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" {...props}>
    <path fill="#fff" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
    <path fill="#0166DE" d="M21.2 16.3h2.6l2.1-7.9h-2.5l-1.3 5.3-.9-5.3h-2.4l2.4 7.9zm-9-7.9h-2.4l-2.4 7.9h2.6l.7-2.6h2.7l.3 2.6h2.4l-2.3-7.9zm-1.1 5.3l.7-3.2.7 3.2h-1.4zM24.8 8.4l-1.9 7.9h2.3l1.9-7.9h-2.3zM8.3 8.4l-1.9 7.9h2.3l1.9-7.9H8.3zM5.1 8.4l-2.3 7.9H5l2.4-7.9H5.1z"/>
    <path fill="#FFC72C" d="M12.2 16.3L14.5 8.4h-2.3l-2.3 7.9h2.3zM27.2 11.2c0-.5-.4-1-.9-1h-3.6c-.5 0-.9.5-.9 1v.1l1.7 5h2.8l-1.8-5.1v-.1zm-1.2-1.2c.2 0 .4.2.4.4v.1h-3.2v-.1c0-.2.2-.4.4-.4h2.4zM32.5 8.4h-2.4l-2.3 7.9h2.3l.5-2.2h2.2l.3 2.2h2.3l-2.3-7.9zm-1.1 5.3l.7-3.2.7 3.2h-1.4z"/>
  </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" {...props}>
    <path fill="#fff" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
    <path fill="#EB001B" d="M15 12a6 6 0 1112 0 6 6 0 01-12 0z"/>
    <path fill="#F79E1B" d="M22 12a6 6 0 11-12 0 6 6 0 0112 0z"/>
    <path fill="#FF5F00" d="M20.3 12a4.3 4.3 0 01-6.5 3.3 4.3 4.3 0 006.5-3.3z"/>
  </svg>
);

const VerveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" {...props}>
    <path fill="#fff" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
    <path fill="#000" d="M18.8 6.4h-3.9l-2.4 11.2h4l.4-2.1h3.3l.4 2.1h4L22.6 6.4h-3.8zm-1.1 7.2l.8-4.2.8 4.2h-1.6z"/>
    <path fill="#F18423" d="M9.1 13.9l-1 1.9c-2-1.1-2.9-2.6-3.1-3.4h4.1v-1H3.3c.1-.8.6-2.5 3.1-3.6l1 1.9c-1.6.8-2 2-2.1 2.3h2.1v1zM35.1 12c0 3.8-2.6 5.8-5.9 6.2-.4-1.3-.7-2.6-.9-3.9.7-.1 1.4-.4 1.8-1 .4-.6.6-1.3.6-2.2 0-.9-.2-1.6-.6-2.2-.4-.6-1.1-1-1.8-1.1.2-1.3.5-2.6.9-3.9 3.3.4 5.9 2.4 5.9 6.1z"/>
    <path fill="#0DB04B" d="M26.7 6.4l-4.1 11.2h4.1l4-11.2h-4z"/>
  </svg>
);


export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');

  const handleSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address to subscribe.",
      });
      return;
    }
    // Simulate subscription
    toast({
      title: "Subscribed!",
      description: `Thank you, ${email}, for subscribing to Zeneva updates! (Simulation)`,
    });
    setEmail(''); // Clear input
  };

  return (
    <footer className="border-t bg-background">
      <div className="container pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size={32} className="text-primary" />
              <span className="text-3xl font-semibold">Zeneva</span>
            </Link>
            <p className="text-sm text-muted-foreground pr-4">
             Gain Effortless Control & Clear Insights to Grow Your Business. Explore our affordable POS and inventory solutions.
            </p>
            <div className="flex space-x-3 pt-2">
              <Link href="https://facebook.com/zenevaapp" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Facebook">
                <Facebook size={20} />
              </Link>
              <Link href="https://x.com/zenevaapp" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Twitter/X">
                <Twitter size={20} />
              </Link>
              <Link href="https://linkedin.com/company/zeneva" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="LinkedIn">
                <Linkedin size={20} />
              </Link>
              <Link href="https://instagram.com/zenevaapp" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Instagram">
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          <div className="text-sm">
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <div className="flex flex-col gap-2.5 text-muted-foreground">
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>

          <div className="text-sm">
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <div className="flex flex-col gap-2.5 text-muted-foreground">
              <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
          
          <div className="text-sm">
            <h4 className="font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-muted-foreground mb-3 text-xs">Get the latest news, feature updates, and tips from Zeneva.</p>
            <form onSubmit={handleSubscription} className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-muted/50 border-border focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email for newsletter"
                data-ai-hint="newsletter email input"
              />
              <Button type="submit" variant="ghost" size="icon" aria-label="Subscribe to newsletter">
                <Send className="h-5 w-5 text-primary" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mb-8">
          <h4 className="font-semibold text-foreground mb-4 text-center">Accepted Payment Methods</h4>
          <div className="flex justify-center items-center gap-4">
            <VisaIcon aria-label="Visa" />
            <MastercardIcon aria-label="Mastercard" />
            <VerveIcon aria-label="Verve" />
          </div>
        </div>
       <div className="border-t pt-8 text-center text-xs text-muted-foreground">
          &copy; {currentYear} Zeneva Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
