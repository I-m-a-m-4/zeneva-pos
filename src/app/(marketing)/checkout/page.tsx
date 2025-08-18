
"use client";

import *as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const VisaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" {...props}>
    <path fill="#fff" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
    <path fill="#0166DE" d="M21.2 16.3h2.6l2.1-7.9h-2.5l-1.3 5.3-.9-5.3h-2.4l2.4 7.9zm-9-7.9h-2.4l-2.4 7.9h2.6l.7-2.6h2.7l.3 2.6h2.4l-2.3-7.9zm-1.1 5.3l.7-3.2.7 3.2h-1.4zM24.8 8.4l-1.9 7.9h2.3l1.9-7.9h-2.3zM8.3 8.4l-1.9 7.9h2.3l1.9-7.9H8.3zM5.1 8.4l-2.3 7.9H5l2.4-7.9H5.1z"/>
    <path fill="#FFC72C" d="M12.2 16.3L14.5 8.4h-2.3l-2.3 7.9h2.3zM27.2 11.2c0-.5-.4-1-.9-1h-3.6c-.5 0-.9.5-.9 1v.1l1.7 5h2.8l-1.8-5.1v-.1zm-1.2-1.2c.2 0 .4.2.4.4v.1h-3.2v-.1c0-.2.2-.4.4-.4h2.4zM32.5 8.4h-2.4l-2.3 7.9h2.3l.5-2.2h2.2l.3 2.2h2.3l-2.3-7.9zm-1.1 5.3l.7-3.2.7 3.2h-1.4z"/>
  </svg>
);
const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" {...props}>
    <path fill="#fff" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"/>
    <path fill="#EB001B" d="M15 12a6 6 0 1112 0 6 6 0 01-12 0z"/>
    <path fill="#F79E1B" d="M22 12a6 6 0 11-12 0 6 6 0 0112 0z"/>
    <path fill="#FF5F00" d="M20.3 12a4.3 4.3 0 01-6.5 3.3 4.3 4.3 0 006.5-3.3z"/>
  </svg>
);
const PaystackLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="100" height="24" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M8.435 5.232H13.635L17.283 18.768H11.931L11.227 15.936H7.931L7.227 18.768H1.875L5.771 5.232H8.435ZM10.875 13.68L9.627 8.544L8.275 13.68H10.875Z" fill="#0D1F3C"/>
        <path d="M26.4761 11.856C26.4761 12.96 26.2841 13.824 25.8041 14.544C25.4201 15.264 24.7481 15.792 23.9321 16.032L27.0281 18.768H23.5721L20.8601 16.272H19.7801V18.768H17.4761V5.232H22.7321C23.8361 5.232 24.7001 5.448 25.3241 5.88C25.9481 6.312 26.2601 6.96 26.2601 7.824C26.2601 8.592 26.0681 9.216 25.5881 9.696C25.1081 10.128 24.4361 10.392 23.6201 10.512C24.0521 10.68 24.3881 10.896 24.7241 11.16C24.9641 11.376 25.1081 11.592 25.1561 11.856H26.4761ZM22.5881 7.968C22.5881 7.44 22.3961 7.08 22.0121 6.888C21.6281 6.696 21.0521 6.6 20.2841 6.6H19.7801V9.264H20.4761C21.8201 9.264 22.5881 8.784 22.5881 7.968Z" fill="#0D1F3C"/>
        <path d="M43.0853 15.36V5.232H40.7813V18.768H43.0853V16.8H43.1813C43.7093 17.592 44.4773 18.096 45.4373 18.312C46.3973 18.528 47.2613 18.624 47.9333 18.624C49.9013 18.624 51.1573 17.928 51.7013 16.536C52.2453 15.144 52.5173 12.984 52.5173 10.056V5.232H50.2133V10.368C50.2133 12.48 50.0693 13.92 49.7813 14.688C49.4933 15.456 48.9173 15.84 48.1493 15.84C47.0453 15.84 46.2293 15.384 45.7013 14.472C45.1733 13.56 44.8853 12.288 44.8853 10.656V5.232H43.0853Z" fill="#0D1F3C"/>
        <path d="M35.6322 12C35.6322 8.208 34.0242 6.072 31.9442 5.544C31.5122 5.4 31.0322 5.304 30.5042 5.232H28.0802V18.768H30.4082V10.416C30.4082 8.4 30.6962 7.08 31.1282 6.84C31.5602 6.6 32.1842 6.744 32.7122 6.984C33.1922 7.224 33.3362 7.728 33.3362 8.496V18.768H35.6322V12Z" fill="#0D1F3C"/>
        <path d="M60.0385 15.36V5.232H57.7345V18.768H60.0385V16.8H60.1345C60.6625 17.592 61.4305 18.096 62.3905 18.312C63.3505 18.528 64.2145 18.624 64.8865 18.624C66.8545 18.624 68.1105 17.928 68.6545 16.536C69.1985 15.144 69.4705 12.984 69.4705 10.056V5.232H67.1665V10.368C67.1665 12.48 67.0225 13.92 66.7345 14.688C66.4465 15.456 65.8705 15.84 65.1025 15.84C64.0005 15.84 63.1825 15.384 62.6545 14.472C62.1265 13.56 61.8385 12.288 61.8385 10.656V5.232H60.0385Z" fill="#0D1F3C"/>
        <path d="M72.0791 5.232L75.9751 18.768H70.6231L69.9191 15.936H66.6231L65.9191 18.768H60.5671L64.4631 5.232H67.1271L72.0791 5.232ZM69.5671 13.68L68.3191 8.544L66.9671 13.68H69.5671Z" fill="#0D1F3C"/>
        <path d="M78.6927 5.232H83.8927L87.5407 18.768H82.1887L81.4847 15.936H78.1887L77.4847 18.768H72.1327L76.0287 5.232H78.6927ZM81.1327 13.68L79.8847 8.544L78.5327 13.68H81.1327Z" fill="#0D1F3C"/>
        <path d="M96.0695 5.232C98.4855 5.232 99.9815 6.048 99.9815 7.824C99.9815 9.12 99.2255 9.936 97.9415 10.368L100 18.768H97.4375L95.7335 11.232H93.1895V18.768H90.8855V5.232H96.0695ZM95.8295 8.784C95.1735 8.784 94.7015 8.496 94.7015 8.016C94.7015 7.536 95.0775 7.272 95.7335 7.272H93.1895V8.784H95.8295Z" fill="#0D1F3C"/>
    </svg>
);


export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [planId, setPlanId] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [email, setEmail] = React.useState('');
  
  React.useEffect(() => {
    setPlanId(searchParams.get('plan'));
  }, [searchParams]);

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Logic for payment submission
  };

  if (!planId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading subscription details...</p>
      </div>
    );
  }

  // Placeholder data for summary, as mock data file is removed
  const planName = planId.charAt(0).toUpperCase() + planId.slice(1) + " Plan";
  const price = planId === 'pro' ? 7500 : planId === 'lifetime' ? 250000 : 0;
  const isFreeTier = planId === 'free';
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Side: Order Summary */}
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pricing
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-md">
                <div>
                  <h3 className="font-semibold">{planName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {planId === 'lifetime' ? 'One-time Payment' : (isFreeTier ? 'No cost' : 'Billed Monthly')}
                  </p>
                </div>
                <div className="text-lg font-bold">
                  ₦{price.toLocaleString()}
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₦{price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (7.5%)</span>
                  <span>₦{(price * 0.075).toLocaleString()}</span>
                </div>
                 <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>₦{(price * 1.075).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Payment Form */}
        <div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-green-600"/> Secure Checkout</CardTitle>
              <CardDescription>Enter your payment details below.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePaymentSubmit}>
            <CardContent>
              {isFreeTier ? (
                 <div className="text-center p-6 bg-green-50 border border-green-200 rounded-md">
                    <h3 className="font-semibold text-green-800">You're selecting the Free Tier!</h3>
                    <p className="text-sm text-green-700 mt-2">No payment is needed. Click below to start using Zeneva immediately.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input id="cardholderName" placeholder="e.g., Ada Eze" required data-ai-hint="cardholder name input"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                        <Input id="cardNumber" placeholder="0000 0000 0000 0000" required data-ai-hint="card number input" />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM / YY" required data-ai-hint="card expiry input"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" required data-ai-hint="card cvc input"/>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-4">
               <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Lock className="mr-2 h-5 w-5" />}
                {isProcessing ? 'Processing...' : (isFreeTier ? 'Complete Setup' : `Pay ₦${(price * 1.075).toLocaleString()} Securely`)}
              </Button>
              <div className="flex items-center justify-center gap-4 pt-2">
                <PaystackLogo className="h-5" />
                <VisaIcon className="h-6"/>
                <MastercardIcon className="h-6"/>
              </div>
              <p className="text-xs text-muted-foreground text-center">Your payment is processed securely by Paystack.</p>
            </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
