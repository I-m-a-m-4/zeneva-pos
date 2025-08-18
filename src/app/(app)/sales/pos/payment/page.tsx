
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, CreditCard, Landmark, MessageSquare, Paperclip, Users, ShoppingCart, Loader2, Banknote } from 'lucide-react';
import { usePOS } from '@/context/pos-context';
import PageTitle from '@/components/shared/page-title';
import type { POSPaymentMethod } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context'; // Import useAuth

const paymentMethods: { value: POSPaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: "Cash", label: "Cash Payment", icon: Banknote }, // Updated icon
  { value: "Card (External POS)", label: "Card (External POS Terminal)", icon: CreditCard },
  { value: "Bank Transfer", label: "Bank Transfer", icon: Landmark },
  { value: "Cheque", label: "Cheque", icon: Paperclip },
  { value: "Other", label: "Other Method", icon: MessageSquare },
];

export default function PaymentPage() {
  const router = useRouter();
  const { 
    cart, 
    subtotal, 
    taxAmount, 
    discountAmount, 
    totalAmount, 
    paymentMethod, 
    setPaymentMethod,
    applyDiscount: setDiscount, 
    setPOSTax,
    notes,
    setPOSNotes,
  } = usePOS();
  const { businessSettings } = useAuth(); // Get businessSettings from AuthContext
  const { toast } = useToast();
  
  const [currentDiscountInput, setCurrentDiscountInput] = React.useState(discountAmount.toString());
  const [currentTaxInput, setCurrentTaxInput] = React.useState(businessSettings?.defaultTaxRate?.toString() || "7.5"); 
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  
  const [isNavigatingToCustomer, setIsNavigatingToCustomer] = React.useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = React.useState(false);


  React.useEffect(() => {
    if (cart.length === 0 && typeof window !== 'undefined') {
      if (!isRedirecting) {
        setIsRedirecting(true);
        router.replace('/sales/pos/select-products');
      }
    } else if (cart.length > 0 && isRedirecting) {
        setIsRedirecting(false); 
    }
  }, [cart, router, isRedirecting]);


  React.useEffect(() => {
    // Initialize tax rate from business settings if available
    if (businessSettings?.defaultTaxRate !== undefined) {
      const rate = businessSettings.defaultTaxRate.toString();
      setCurrentTaxInput(rate);
      setPOSTax(parseFloat(rate));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessSettings?.defaultTaxRate, setPOSTax]); // Only run when businessSettings.defaultTaxRate changes


  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as POSPaymentMethod);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentDiscountInput(value);
  };

  const handleApplyDiscount = () => {
    const newDiscount = parseFloat(currentDiscountInput) || 0;
    if (newDiscount > subtotal) {
      toast({ variant: "destructive", title: "Invalid Discount", description: "Discount cannot be greater than subtotal."});
      setDiscount(0); 
      setCurrentDiscountInput("0");
    } else {
      setDiscount(newDiscount);
    }
  };
  
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentTaxInput(value);
  };

  const handleApplyTaxRate = () => {
      const newTaxRate = parseFloat(currentTaxInput) || 0;
      setPOSTax(newTaxRate);
  };


  const handleProceedToCustomer = () => {
    if (!paymentMethod) {
      toast({ variant: "destructive", title: "Payment Method Required", description: "Please select a payment method." });
      return;
    }
    setIsNavigatingToCustomer(true);
    router.push('/sales/pos/customer');
  };

  const handleBack = () => {
    setIsNavigatingBack(true);
    router.back();
  };

  if (isRedirecting) {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Your cart is empty.</p>
          <p className="text-sm text-muted-foreground">Redirecting to product selection...</p>
          <Loader2 className="w-8 h-8 text-primary animate-spin mt-4" />
        </div>
      );
  }
  if (cart.length === 0 && typeof window !== 'undefined') {
     return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Initializing POS session...</p>
        </div>
     );
  }


  return (
    <div className="space-y-6">
      <PageTitle title="Payment Details" subtitle="Select payment method and confirm transaction amounts.">
        <Button variant="outline" onClick={handleBack} size="sm" disabled={isNavigatingBack || isNavigatingToCustomer}>
          {isNavigatingBack ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {isNavigatingBack ? "Loading..." : "Back"}
        </Button>
      </PageTitle>
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Choose how the customer is paying and adjust totals if needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-2 block">Select Payment Method</Label>
              <RadioGroup value={paymentMethod || ""} onValueChange={handlePaymentMethodChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <Label
                    key={method.value}
                    htmlFor={`payment-${method.value}`}
                    className={`flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors
                      ${paymentMethod === method.value ? "border-primary ring-2 ring-primary bg-primary/10" : "border-muted"}`}
                  >
                    <method.icon className={`mb-2 h-7 w-7 ${paymentMethod === method.value ? "text-primary" : "text-muted-foreground"}`} />
                    <RadioGroupItem value={method.value} id={`payment-${method.value}`} className="sr-only" />
                    <span className={`text-sm font-medium ${paymentMethod === method.value ? "text-primary" : ""}`}>{method.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            
            {paymentMethod === 'Bank Transfer' && businessSettings && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700 text-base">Business Bank Account Details</CardTitle>
                  <CardDescription className="text-blue-600">Please ask the customer to make payment to the following account:</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-1">
                  <p><strong>Account Name:</strong> {businessSettings.paymentBankName || "Not Set"}</p>
                  <p><strong>Account Number:</strong> {businessSettings.paymentBankAccountId || "Not Set"}</p>
                  <p><strong>Bank:</strong> {/* You might need another field for this or include in BankName */} { (businessSettings.paymentBankName || "").includes("Bank") ? "" : "Bank Not Specified"}</p>
                  {businessSettings.paymentInstructions && <p className="mt-2 pt-2 border-t border-blue-200 text-xs">{businessSettings.paymentInstructions}</p>}
                   <p className="text-xs text-blue-600 mt-3">Note: This information is set by the business owner in Settings and cannot be changed here.</p>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="space-y-4">
                <h3 className="text-base font-medium">Adjustments (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="discountAmount">Discount Amount (₦)</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                id="discountAmount"
                                type="number"
                                value={currentDiscountInput}
                                onChange={handleDiscountChange}
                                placeholder="0.00"
                                data-ai-hint="discount amount input"
                            />
                            <Button variant="outline" onClick={handleApplyDiscount}>Apply</Button>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                         <div className="flex gap-2 mt-1">
                            <Input
                                id="taxRate"
                                type="number"
                                value={currentTaxInput}
                                onChange={handleTaxRateChange}
                                placeholder="e.g., 7.5"
                                data-ai-hint="tax rate input"
                            />
                             <Button variant="outline" onClick={handleApplyTaxRate}>Set Rate</Button>
                        </div>
                    </div>
                </div>
            </div>
            
            <Separator />

            <div>
              <Label htmlFor="transactionNotes">Transaction Notes (Optional)</Label>
              <Textarea 
                id="transactionNotes" 
                placeholder="Add any notes for this sale..." 
                value={notes}
                onChange={(e) => setPOSNotes(e.target.value)}
                className="mt-1"
                data-ai-hint="transaction notes textarea"
              />
            </div>

          </CardContent>
        </Card>

        <Card className="md:col-span-1 shadow-lg sticky top-24">
          <CardHeader className="border-b">
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="py-4 space-y-2 text-sm">
             {cart.map(item => (
                <div key={item.itemId} className="flex justify-between items-center text-muted-foreground">
                    <span className="truncate pr-2" title={item.itemName}>{item.itemName} (x{item.quantity})</span>
                    <span>₦{item.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            ))}
            <Separator className="my-2"/>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>₦{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-destructive">
                <span className="text-muted-foreground">Discount:</span>
                <span>- ₦{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({parseFloat(currentTaxInput).toFixed(1)}%):</span>
              <span>₦{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-xl text-primary">
              <span>Total Amount Due:</span>
              <span>₦{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </CardContent>
           <CardFooter className="border-t p-4 flex-col space-y-3">
            <Button className="w-full" onClick={handleProceedToCustomer} disabled={!paymentMethod || cart.length === 0 || isNavigatingToCustomer || isNavigatingBack} size="lg">
                {isNavigatingToCustomer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                {isNavigatingToCustomer ? "Processing..." : "Select Customer & Review"}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleBack} disabled={isNavigatingBack || isNavigatingToCustomer}>
                {isNavigatingBack ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                {isNavigatingBack ? "Loading..." : "Back to Products"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
