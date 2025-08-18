
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TypewriterEffectProps {
  text: string;
  className?: string;
  cursorClassName?: string;
}

export default function TypewriterEffect({ text, className, cursorClassName }: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    // Reset animation if text changes
    setCurrentIndex(0);
    setDisplayedText('');
  }, [text]);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100); // Adjust typing speed here

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className={cn(className)}>
      {displayedText}
      <span className={cn("animate-pulse ml-1", cursorClassName)}>|</span>
    </span>
  );
}
