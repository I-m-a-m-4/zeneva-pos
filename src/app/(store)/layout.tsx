// src/app/(store)/layout.tsx
"use client";

import type React from 'react';
import Link from 'next/link';
import { ShoppingCart, Home, Search, Package, UserCircle } from 'lucide-react';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const cartItemCount = 0; // Replace with actual cart count from state/context later
  const params = useParams<{ businessId: string }>();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href={`/b/${params.businessId}/products`} className="flex items-center gap-2">
            <Logo size={28} className="text-primary" />
            <span className="font-semibold text-lg">Zeneva Store</span>
          </Link>

          <div className="flex-1 max-w-md mx-4 hidden sm:flex">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search products..."
                    className="w-full bg-muted pl-8"
                    data-ai-hint="store product search"
                />
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href={`/b/${params.businessId}/products`} aria-label="Products">
                <Package className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/b/${params.businessId}/cart`} aria-label="Shopping Cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>
             <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/dashboard" aria-label="Back to Zeneva App">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
             <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="#" aria-label="Account">
                <UserCircle className="h-5 w-5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {children}
      </main>
      <footer className="border-t bg-muted/50">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Zeneva Store. Powered by Zeneva.
          <p className="mt-1">
            <Link href="/dashboard" className="text-primary underline hover:text-accent">Admin Dashboard</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
