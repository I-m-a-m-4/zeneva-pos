"use client";

import Logo from '@/components/icons/logo';
import Link from 'next/link';
import type React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
       <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Logo size={28} />
            <span className="text-2xl font-semibold">Zeneva</span>
        </Link>
       </div>
      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
