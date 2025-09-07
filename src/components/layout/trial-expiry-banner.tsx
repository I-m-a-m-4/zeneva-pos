
"use client";

import *as React from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { BusinessInstance } from '@/types';

interface TrialExpiryBannerProps {
  currentBusiness: BusinessInstance | null;
}

const TrialExpiryBanner: React.FC<TrialExpiryBannerProps> = ({ currentBusiness }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (currentBusiness && currentBusiness.trialEndsAt) {
      const trialEndDate = new Date(currentBusiness.trialEndsAt);
      const now = new Date();
      
      // Don't show if the user is on a paid plan already (e.g. lifetime)
      if (currentBusiness.subscriptionTierId !== 'free' && currentBusiness.subscriptionTierId !== 'pro') {
          // Assuming 'pro' is a paid tier. Modify if 'pro' can also be a trial.
          // The main logic is: if they are on a *paid* tier, don't show trial warnings.
          const paidTiers = ['pro', 'lifetime', 'enterprise'];
          if (paidTiers.includes(currentBusiness.subscriptionTierId)) {
             setIsVisible(false);
             return;
          }
      }
      
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (trialEndDate < now) {
        setMessage(`Your Zeneva trial for "${currentBusiness.businessName}" has expired. Please upgrade to continue enjoying full access.`);
        setIsVisible(true);
      } else if (trialEndDate <= sevenDaysFromNow) {
        const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setMessage(`Your Zeneva trial for "${currentBusiness.businessName}" ends in ${daysLeft} day(s) on ${trialEndDate.toLocaleDateString()}. Upgrade to ensure uninterrupted service.`);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [currentBusiness]);

  if (!isVisible || !currentBusiness) {
    return null;
  }

  return (
    <div className="bg-yellow-500/20 border border-yellow-600 text-yellow-800 px-4 py-3 rounded-md mb-4 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-3 text-yellow-700" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Link href="/settings">Upgrade Now</Link>
      </Button>
    </div>
  );
};

export default TrialExpiryBanner;
