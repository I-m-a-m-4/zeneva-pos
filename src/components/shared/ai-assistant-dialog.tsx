
"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zenevaAssistant, type ZenevaAssistantInput } from '@/ai/flows/zeneva-assistant-flow';
import { Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiAssistantDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AiAssistantDialog({ isOpen, onOpenChange }: AiAssistantDialogProps) {
  const [currentQuestion, setCurrentQuestion] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: currentQuestion,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion("");
    setIsLoading(true);
    setError(null);

    try {
      const input: ZenevaAssistantInput = { question: userMessage.content };
      const response = await zenevaAssistant(input); 
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error calling AI assistant:", err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: "Sorry, I encountered an error trying to respond. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setError("Failed to get a response from the assistant.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col h-[70vh] max-h-[600px]">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Zeneva AI Assistant
          </DialogTitle>
          <DialogDescription>
            Ask me anything about Zeneva's features or how to use the app.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow p-6 space-y-4" ref={scrollAreaRef}>
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-8">
              <Bot size={48} className="mx-auto mb-2 opacity-50" />
              <p>No messages yet. Ask a question to get started!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg max-w-[85%]",
                msg.type === 'user' ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted text-muted-foreground"
              )}
            >
              {msg.type === 'ai' && <Bot className="h-5 w-5 shrink-0 mt-0.5" />}
              <div className="flex-1 break-words">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={cn(
                    "text-xs opacity-70 mt-1",
                     msg.type === 'user' ? "text-right" : "text-left"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.type === 'user' && <User className="h-5 w-5 shrink-0 mt-0.5" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 text-muted-foreground mr-auto">
              <Bot className="h-5 w-5 shrink-0" />
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm italic">Thinking...</span>
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
          <div className="relative">
            <Input
              type="text"
              placeholder="Ask a question..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              className="pr-12 text-sm"
              disabled={isLoading}
              data-ai-hint="chatbot question input"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              disabled={isLoading || !currentQuestion.trim()}
              aria-label="Send question"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive mt-1 text-center">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
