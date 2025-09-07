
"use client";

import Link from 'next/link';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Instagram, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme, setTheme } = useTheme();

  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
      <div className="container pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo size={32} className="text-primary" />
              <span className="text-3xl font-semibold text-foreground">Zeneva</span>
            </Link>
            <p className="text-sm pr-4">
             Gain Effortless Control & Clear Insights to Grow Your Business.
            </p>
            <div className="flex space-x-3 pt-2">
              <Link href="#" className="hover:text-primary"><Facebook size={20} /></Link>
              <Link href="#" className="hover:text-primary"><Twitter size={20} /></Link>
              <Link href="#" className="hover:text-primary"><Linkedin size={20} /></Link>
              <Link href="#" className="hover:text-primary"><Instagram size={20} /></Link>
            </div>
          </div>

          <div className="text-sm">
            <h4 className="font-semibold text-foreground mb-4">About</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <Link href="#" className="hover:text-primary transition-colors">Careers</Link>
            </div>
          </div>
          
          <div className="text-sm">
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <Link href="/#faq" className="hover:text-primary transition-colors">FAQ</Link>
              <Link href="#" className="hover:text-primary transition-colors">Help Center</Link>
            </div>
          </div>

          <div className="text-sm">
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
       <div className="border-t dark:border-gray-800 pt-8 flex flex-col sm:flex-row justify-start items-center text-xs gap-4">
          <p>&copy; {currentYear} Zeneva. All rights reserved.</p>
          <div className="flex items-center gap-2">
             <span>Theme:</span>
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:bg-muted h-7 w-7"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
             </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
