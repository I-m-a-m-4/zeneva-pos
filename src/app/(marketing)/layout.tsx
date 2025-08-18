
"use client";

import * as React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/navbar';
import Footer from '@/components/landing/footer';
import AiAssistantDialog from '@/components/shared/ai-assistant-dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
  const WHATSAPP_NUMBER = "2349064233805";
  const WHATSAPP_MESSAGE = "Hello Zeneva! I'm interested in learning more about your POS and Inventory Management system.";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {WHATSAPP_NUMBER && (
          <Link
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
            aria-label="Chat on WhatsApp"
            title="Chat on WhatsApp"
          >
            <MessageSquare size={28} />
          </Link>
        )}
        <Button
            variant="default"
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110"
            aria-label="Open AI Chatbot"
            title="AI Assistant"
            onClick={() => setIsAssistantOpen(true)}
        >
            <Bot size={28} />
        </Button>
      </div>
      <AiAssistantDialog isOpen={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
    </div>
  );
}
