
"use client";

import Link from 'next/link';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as React from 'react';

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#key-benefits", label: "Benefits" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQs" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-transparent bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo size={28} />
          <span className="text-xl font-semibold sm:inline-block">
            Zeneva
          </span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "transition-colors hover:text-white text-primary-foreground/80",
                pathname === link.href && "text-white font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center justify-end space-x-2">
          <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-end md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="w-full h-full bg-primary text-primary-foreground p-0 flex flex-col">
                <SheetHeader className="p-4 flex flex-row items-center justify-between">
                   <Link href="/" className="flex items-center space-x-2" onClick={() => setIsSheetOpen(false)}>
                      <Logo size={28} />
                      <span className="text-xl font-semibold sm:inline-block">
                        Zeneva
                      </span>
                    </Link>
                  <SheetClose asChild>
                     <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Close Menu</span>
                    </Button>
                  </SheetClose>
                </SheetHeader>
                <nav className="flex flex-col items-center justify-center flex-grow space-y-6">
                  {navLinks.map((link) => (
                     <SheetClose asChild key={link.label}>
                        <Link
                        href={link.href}
                        className="transition-colors hover:text-white text-2xl font-medium p-2 rounded-md"
                        onClick={() => setIsSheetOpen(false)}
                        >
                        {link.label}
                        </Link>
                    </SheetClose>
                  ))}
                   <SheetClose asChild>
                        <Button variant="secondary" asChild className="mt-6 bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                            <Link href="/login">Get Started</Link>
                        </Button>
                   </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
      </div>
    </header>
  );
}
