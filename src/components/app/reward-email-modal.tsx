
"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/types';
import { Send, Gift, Mail, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import emailjs from '@emailjs/browser';

interface RewardEmailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  customer: Customer | null;
  rewardDetails: {
    discountPercentage: string;
    businessName: string;
  };
}

const generateMockCouponCode = (customerId: string) => {
    return `LOYALTY-${customerId.substring(0,4).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

export default function RewardEmailModal({ isOpen, onOpenChange, customer, rewardDetails }: RewardEmailModalProps) {
  const { toast } = useToast();
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailBody, setEmailBody] = React.useState("");
  const [couponCode, setCouponCode] = React.useState("");
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  React.useEffect(() => {
    if (customer && rewardDetails) {
      const generatedCode = generateMockCouponCode(customer.id);
      setCouponCode(generatedCode);
      setEmailSubject(`A Special Reward Just For You, ${customer.name}! 🎁`);
      setEmailBody(
`Hi ${customer.name},

Thank you for being such a valued customer of ${rewardDetails.businessName || "our store"}! We truly appreciate your continued support.

As a token of our appreciation, please accept this special reward from Zeneva:

**Your Unique Reward Code: ${generatedCode}**

Use this code to get **${rewardDetails.discountPercentage}% off** your next purchase with us.

We look forward to serving you again soon!

Best regards,
The Team at ${rewardDetails.businessName || "Zeneva"}`
      );
    }
  }, [customer, rewardDetails]);

  const handleSendEmail = async () => {
    if (!customer || !customer.email) {
      toast({ variant: "destructive", title: "Missing Information", description: "Customer email is missing." });
      return;
    }
    
    // Check for placeholder EmailJS credentials
    const SERVICE_ID = "YOUR_SERVICE_ID"; // Replace with your actual EmailJS Service ID
    const TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // Replace with your actual EmailJS Template ID
    const PUBLIC_KEY = "YOUR_PUBLIC_KEY"; // Replace with your actual EmailJS Public Key

    if ([SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY].some(key => key.startsWith("YOUR_"))) {
        toast({
            variant: "destructive",
            title: "Email Service Not Configured",
            description: "Please configure your EmailJS credentials to send live emails."
        });
        
        // Simulate success locally
        setIsSendingEmail(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
            variant: "success",
            title: "Email Prepared (Simulation)",
            description: `Email for ${customer.name} with code ${couponCode} is ready.`
        });
        setShowConfetti(true);
        setIsSendingEmail(false);
        setTimeout(() => {
            setShowConfetti(false);
            onOpenChange(false);
        }, 5000);
        return;
    }
    
    setIsSendingEmail(true);
    const templateParams = {
      to_name: customer.name,
      to_email: customer.email,
      from_name: rewardDetails.businessName,
      subject: emailSubject,
      message: emailBody.replace(/\n/g, '<br>'), // EmailJS might prefer HTML
      coupon_code: couponCode,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      toast({ variant: "success", title: "Email Sent!", description: `Reward email successfully sent to ${customer.name}.` });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to send email:', error);
      toast({ variant: "destructive", title: "Email Send Failed", description: "Could not send the email. Check credentials or try again." });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary"/> Send Reward Email to {customer.name} (Zeneva)
          </DialogTitle>
          <DialogDescription>
            Review and send a special reward email to your loyal customer. The coupon code is a placeholder.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-3">
          <div className="space-y-1">
            <Label htmlFor="customerEmail">To (Email)</Label>
            <Input id="customerEmail" value={customer.email} readOnly className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emailSubject">Subject</Label>
            <Input
              id="emailSubject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject"
              data-ai-hint="email subject input"
              disabled={isSendingEmail}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emailBody">Body</Label>
            <Textarea
              id="emailBody"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={10}
              placeholder="Write your email message..."
              data-ai-hint="email body textarea"
              disabled={isSendingEmail}
            />
          </div>
           <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-500/30">
            <p><strong>Note:</strong> EmailJS integration is required for actual email sending. The coupon code <strong>({couponCode})</strong> is a placeholder and not yet tracked by the system.</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSendingEmail}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSendEmail} disabled={isSendingEmail}>
            {isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSendingEmail ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
