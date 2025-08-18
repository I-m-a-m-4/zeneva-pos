
"use client";

import type React from 'react';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { DownloadCloud, CheckCircle, PowerOff } from 'lucide-react'; 
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaDownloadButton() {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      console.log("'beforeinstallprompt' event fired and stashed. App is installable.");
    };

    const appInstalledHandler = () => {
      console.log("App installed event fired.");
      setIsAppInstalled(true);
      setIsInstallable(false); 
      setDeferredPrompt(null); 
       toast({
        title: "Installation Successful!",
        description: "Zeneva has been added to your device for easier access.",
      });
    };

    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
        console.log("App is already installed (standalone mode check).");
        setIsAppInstalled(true);
        setIsInstallable(false);
      } else {
        console.log("App not installed (standalone mode check).");
        window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
        console.log("Added 'beforeinstallprompt' event listener.");
      }
      window.addEventListener('appinstalled', appInstalledHandler);
      console.log("Added 'appinstalled' event listener.");
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
        window.removeEventListener('appinstalled', appInstalledHandler);
        console.log("Cleaned up PWA event listeners.");
      }
    };
  }, [toast]);

  const handlePwaDownload = async () => {
    console.log("handlePwaDownload clicked. isAppInstalled:", isAppInstalled, "deferredPrompt:", !!deferredPrompt);
    if (isAppInstalled) {
      toast({
        title: "App Already Installed",
        description: "Zeneva is already installed on your device.",
      });
      return;
    }

    if (deferredPrompt) {
      console.log("Deferred prompt exists, showing it.");
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
          toast({
            title: "Installation Cancelled",
            description: "You can install Zeneva later from the browser menu.",
          });
        }
      } catch (error) {
         toast({
            title: "Installation Prompt Error",
            description: "There was an issue showing the installation prompt.",
            variant: "destructive"
          });
          console.error("Error during prompt() or userChoice:", error);
      }
      setDeferredPrompt(null);
      setIsInstallable(false); 
    } else {
      toast({
        title: "App Installation Not Available",
        description: "PWA installation is not currently available in your browser or the app might already be installed. Try adding to Home Screen from your browser's menu.",
        duration: 7000,
      });
      console.log("Deferred prompt is null. Cannot show install prompt.");
    }
  };

  if (isAppInstalled) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Zeneva App is Installed" disabled>
          <CheckCircle />
          <span>App Installed</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const canPromptInstall = !!deferredPrompt && isInstallable;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={canPromptInstall ? "Install Zeneva App" : "App Install Not Ready"}
        onClick={handlePwaDownload}
        disabled={!canPromptInstall}
      >
        {canPromptInstall ? <DownloadCloud /> : <PowerOff className="opacity-50" />}
        <span>Install App</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
