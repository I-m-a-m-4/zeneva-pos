
"use client";

import type React from 'react';
import *as React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types';
import { cn } from '@/lib/utils';

interface TrialExpiryBannerProps {
  notifications?: Notification[];
  onDismiss: (notificationId: string) => void;
}

const TrialExpiryBanner: React.FC<TrialExpiryBannerProps> = ({ notifications = [], onDismiss }) => {
  const trialNotification = notifications.find(n => n.type === 'trial' && !n.isRead);

  if (!trialNotification) {
    return null;
  }
  
  const isExpired = trialNotification.description.includes('expired');

  return (
    <div className={cn(
        "px-4 py-3 rounded-md mb-4 flex items-center justify-between shadow-lg border-l-4",
        isExpired ? "bg-destructive/10 border-destructive text-destructive-foreground" : "bg-yellow-500/20 border-yellow-600 text-yellow-800 dark:text-yellow-200"
    )}>
      <div className="flex items-center">
        <AlertTriangle className={cn("h-5 w-5 mr-3", isExpired ? "text-destructive" : "text-yellow-700 dark:text-yellow-200")} />
        <p className="text-sm font-medium">{trialNotification.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/settings">Upgrade Now</Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDismiss(trialNotification.id)}>
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  );
};

export default TrialExpiryBanner;
