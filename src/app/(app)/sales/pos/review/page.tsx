
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, CheckCircle, ShoppingBag, User, CreditCard, ArrowLeft, Loader2, ImageDown, FileDown, ShoppingCart, Phone } from 'lucide-react';
import { usePOS } from '@/context/pos-context';
import PageTitle from '@/components/shared/page-title';
import { useToast } from '@/hooks/use-toast';
import type { Receipt as ReceiptType, POSCartItem, InventoryItem } from '@/types';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/icons/logo';
import { db, isPlaceholderConfig } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, writeBatch, runTransaction, getDoc } from "firebase/firestore";
import Confetti from 'react-confetti';


export default function ReviewSalePage() {
  const router = useRouter();
  const {
    cart,
    selectedCustomer,
    paymentMethod,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    notes,
    resetPOSSession
  } = usePOS();
  const { toast } = useToast();

  const [isCompletingSale, setIsCompletingSale] = React.useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const [currentGeneratedReceiptNumber, setCurrentGeneratedReceiptNumber] = React.useState<string | null>(null);
  const [currentDisplayDate, setCurrentDisplayDate] = React.useState<string | null>(null);

  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [redirectReason, setRedirectReason] = React.useState<string | null>(null);
  const [IconToRender, setIconToRender] = React.useState<React.ElementType>(Loader2);
  const [redirectMessage, setRedirectMessage] = React.useState<string>("Loading POS state...");

  const generateReceiptNumber = React.useCallback(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ZN-${year}${month}${day}-${randomSuffix}`;
  }, []);

  React.useEffect(() => {
    setCurrentGeneratedReceiptNumber(generateReceiptNumber());
    setCurrentDisplayDate(new Date().toLocaleDateString());
  }, [generateReceiptNumber]);


  React.useEffect(() => {
    let shouldRedirect = false;
    let reason = "";
    let path = "";
    let message = "";
    let IconComponent: React.ElementType = Loader2;

    if (cart.length === 0) {
      shouldRedirect = true;
      reason = "cart";
      path = '/sales/pos/select-products';
      message = "Your cart is empty. Redirecting to product selection...";
      IconComponent = ShoppingCart;
    } else if (!paymentMethod) {
      shouldRedirect = true;
      reason = "payment";
      path = '/sales/pos/payment';
      message = "Payment method not selected. Redirecting to payment selection...";
      IconComponent = CreditCard;
    }

    if (shouldRedirect) {
        if (!isRedirecting) {
            setIsRedirecting(true);
            setRedirectReason(reason);
            setRedirectMessage(message);
            setIconToRender(() => IconComponent);
            console.log(`ReviewPage: ${reason} condition met, redirecting to ${path}.`);
            router.replace(path);
        }
    } else if (isRedirecting) {
        setIsRedirecting(false);
        setRedirectReason(null);
    }
  }, [cart, paymentMethod, router, isRedirecting]);


  const getReceiptReviewElement = () => document.getElementById('receipt-review-area');
  const getActionFooterElement = () => document.getElementById('review-page-actions-footer');

  const handlePrint = () => {
    setIsPrinting(true);
    const footerElement = getActionFooterElement();
    if (footerElement) footerElement.classList.add('no-print-in-component');

    window.print();

    if (footerElement) footerElement.classList.remove('no-print-in-component');
    setIsPrinting(false);
  };

  const handleDownloadPDF = async () => {
    const element = getReceiptReviewElement();
    const footerElement = getActionFooterElement();
    if (element) {
      setIsGeneratingPDF(true);
      if (footerElement) footerElement.style.display = 'none';

      try {
        const { default: html2canvas } = await import('html2canvas');
        const { default: jsPDF } = await import('jspdf');

        const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const aspectRatio = imgWidth / imgHeight;
        let pdfImgWidth = pdfWidth - 20;
        let pdfImgHeight = pdfImgWidth / aspectRatio;

        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        if (pdfImgHeight > pdfPageHeight - 20) {
            pdfImgHeight = pdfPageHeight - 20;
            pdfImgWidth = pdfImgHeight * aspectRatio;
        }

        const imgX = (pdfWidth - pdfImgWidth) / 2;
        const imgY = 10;

        pdf.addImage(imgData, 'PNG', imgX, imgY, pdfImgWidth, pdfImgHeight);
        pdf.save(`sale-summary-${currentGeneratedReceiptNumber || 'receipt'}.pdf`);
        toast({ title: "PDF Downloaded", description: `Sale summary PDF saved.`, variant: 'success' });
      } catch (error: any) {
        console.error("Error generating PDF:", error);
        if (error.message && (error.message.toLowerCase().includes("module not found") || error.message.toLowerCase().includes("failed to fetch dynamically imported module"))) {
            toast({ variant: "destructive", title: "PDF Generation Failed", description: "Required library (html2canvas/jspdf) could not be loaded. This feature is currently unavailable." });
        } else {
            toast({ variant: "destructive", title: "PDF Error", description: `Could not generate PDF. ${(error as Error).message}` });
        }
      } finally {
        if (footerElement) footerElement.style.display = '';
        setIsGeneratingPDF(false);
      }
    } else {
      console.error("Sale summary content element not found for PDF generation.");
      toast({ variant: "destructive", title: "Error", description: "Sale summary content not found for PDF." });
    }
  };

  const handleDownloadImage = async () => {
     const element = getReceiptReviewElement();
     const footerElement = getActionFooterElement();
    if (element) {
      setIsGeneratingImage(true);
      if (footerElement) footerElement.style.display = 'none';

      try {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });

        const link = document.createElement('a');
        link.download = `sale-summary-${currentGeneratedReceiptNumber || 'receipt'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: "Image Downloaded", description: `Sale summary image saved.`, variant: 'success' });
      } catch (error: any) {
        console.error("Error generating image:", error);
        if (error.message && (error.message.toLowerCase().includes("module not found") || error.message.toLowerCase().includes("failed to fetch dynamically imported module"))) {
            toast({ variant: "destructive", title: "Image Generation Failed", description: "Required library (html2canvas) could not be loaded. This feature is currently unavailable." });
        } else {
            toast({ variant: "destructive", title: "Image Error", description: `Could not generate image. ${(error as Error).message}` });
        }
      } finally {
        if (footerElement) footerElement.style.display = '';
        setIsGeneratingImage(false);
      }
    } else {
      console.error("Sale summary content element not found for Image generation.");
      toast({ variant: "destructive", title: "Error", description: "Sale summary content not found for image." });
    }
  };

  const updateInventoryAndCustomer = async (cartItems: POSCartItem[]): Promise<void> => {
    await runTransaction(db, async (transaction) => {
        const productUpdates: Promise<void>[] = cartItems.map(async (item) => {
            const productRef = doc(db, "products", item.itemId);
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw new Error(`Product with ID ${item.itemId} not found.`);
            }
            const currentStock = productDoc.data().stock;
            if (currentStock < item.quantity) {
                throw new Error(`Not enough stock for ${item.itemName}. Available: ${currentStock}, Requested: ${item.quantity}`);
            }
            transaction.update(productRef, {
                stock: increment(-item.quantity),
                lastSaleDate: new Date().toISOString()
            });
        });

        await Promise.all(productUpdates);
        
        if (selectedCustomer) {
            const customerRef = doc(db, "customers", selectedCustomer.id);
            transaction.update(customerRef, {
                totalSpent: increment(totalAmount),
                purchaseCount: increment(1),
                lastPurchase: new Date().toISOString(),
            });
        }
    });
  };

  const handleCompleteSale = async () => {
    console.log("ReviewPage: handleCompleteSale triggered.");
    setIsCompletingSale(true);
    
    if (!currentGeneratedReceiptNumber || !paymentMethod) {
        toast({ variant: "destructive", title: "Error", description: "Could not generate receipt number or payment method not set." });
        setIsCompletingSale(false);
        return;
    }
    
    const receiptData: Omit<ReceiptType, 'id' | 'createdAt' | 'updatedAt' | 'businessId'> = {
      receiptNumber: currentGeneratedReceiptNumber,
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      items: cart.map(ci => ({
        itemId: ci.itemId,
        itemName: ci.itemName,
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
        totalPrice: ci.totalPrice,
      })),
      subtotal: subtotal,
      tax: taxAmount,
      discountAmount: discountAmount,
      total: totalAmount,
      paymentMethod: paymentMethod,
      notes: notes,
    };

    if (isPlaceholderConfig()) {
      toast({
        variant: "destructive",
        title: "Firebase Not Configured",
        description: "Please update Firebase credentials in src/lib/firebase.ts to save receipts.",
        duration: 7000,
      });
      setIsCompletingSale(false);
      console.log("Simulated sale completion (Firebase not configured):", receiptData);
      toast({ title: "Sale Completed (Locally Simulated)", description: `Receipt ${receiptData.receiptNumber} processed locally.`, variant: 'success' });
      resetPOSSession();
      console.log("ReviewPage: Sale completed (local sim), navigating to /sales.");
      router.push('/sales');
      return;
    }

    toast({ title: "Processing Sale...", description: "Saving transaction details. Please wait." });

    try {
      await updateInventoryAndCustomer(cart);
      const docRef = await addDoc(collection(db, "receipts"), {
        ...receiptData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast({
        variant: "success",
        title: "Sale Completed!",
        description: `Receipt ${docRef.id} saved and stock updated.`,
        duration: 7000,
      });
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        resetPOSSession();
        router.push(`/receipts/${docRef.id}`);
      }, 4000);
    } catch (error) {
      console.error("Error completing sale transaction:", error);
      toast({ variant: "destructive", title: "Sale Failed", description: `Could not complete the sale: ${(error as Error).message}`});
      setIsCompletingSale(false);
    }
  };

  const handleGoBack = () => {
    setIsNavigatingBack(true);
    router.back();
  }

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <IconToRender className={`w-16 h-16 text-muted-foreground mb-4 ${IconToRender === Loader2 ? 'animate-spin text-primary' : ''}`} />
        <p className="text-lg font-medium text-muted-foreground mt-2">{redirectMessage.split('.')[0]}.</p>
        <p className="text-sm text-muted-foreground">{redirectMessage.split('.')[1] || 'Please wait...'}</p>
        {IconToRender === Loader2 && <Loader2 className="w-8 h-8 text-primary animate-spin mt-4" />}
      </div>
    );
  }


  return (
    <div className="space-y-6 pb-10">
      {showConfetti && <Confetti recycle={false} numberOfPieces={250} />}
      <PageTitle title="Review & Complete Sale" subtitle="Verify transaction details before finalizing with Zeneva.">
        <Button variant="outline" onClick={handleGoBack} size="sm" disabled={isCompletingSale || isGeneratingImage || isGeneratingPDF || isNavigatingBack || isPrinting}>
          {isNavigatingBack ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {isNavigatingBack ? "Loading..." : "Back"}
        </Button>
      </PageTitle>

      <Card className="w-full max-w-2xl mx-auto shadow-xl print-only-this-area relative" id="receipt-review-area">
        <div className="zeneva-watermark">Zeneva</div>
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size={40} className="text-primary" />
              <div>
                <CardTitle className="text-2xl">Sale Preview</CardTitle>
                <CardDescription>Zeneva Point of Sale</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">Transaction Total</p>
              <p className="text-2xl font-bold text-primary">₦{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-1 flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground"/>Billed To:</h4>
              {selectedCustomer ? (
                <>
                  <p className="font-bold text-foreground">{selectedCustomer.name}</p>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && <p className="text-muted-foreground flex items-center gap-1"><Phone size={12}/> {selectedCustomer.phone}</p>}
                </>
              ) : (
                <p className="text-muted-foreground">Walk-in Customer</p>
              )}
            </div>
            <div className="sm:text-right">
              <h4 className="font-semibold mb-1">Order ID / Receipt No.:</h4>
              <p className="text-muted-foreground">{currentGeneratedReceiptNumber || "Generating..."}</p>
              <h4 className="font-semibold mb-1 mt-2">Date:</h4>
              <p className="text-muted-foreground">{currentDisplayDate || "Loading..."}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1 flex items-center"><CreditCard className="mr-2 h-4 w-4 text-muted-foreground"/>Payment Method:</h4>
            <p className="text-muted-foreground">{paymentMethod}</p>
          </div>


          <div>
            <h4 className="font-semibold mb-2 flex items-center"><ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground"/>Items:</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">₦{item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">₦{item.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 items-end">
            {notes && (
                <div className="col-span-2 sm:col-span-1">
                    <h4 className="font-semibold text-sm mb-1">Notes:</h4>
                    <p className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/50 whitespace-pre-wrap">{notes}</p>
                </div>
            )}
            <div className={`space-y-1 text-sm text-right ${notes ? 'col-span-2 sm:col-span-1' : 'col-span-2'}`}>
              <p><span className="text-muted-foreground">Subtotal:</span> ₦{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              {discountAmount > 0 && <p className="text-destructive"><span className="text-muted-foreground">Discount:</span> - ₦{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>}
              <p><span className="text-muted-foreground">Tax:</span> ₦{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="font-bold text-lg text-foreground"><span className="text-muted-foreground">Total:</span> ₦{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-3 text-center text-xs text-muted-foreground border-t bg-muted/20">
            <p>Generated: {currentDisplayDate ? `${currentDisplayDate}, ${new Date().toLocaleTimeString()}` : "Loading..."}. Authentic Zeneva Receipt.</p>
        </CardFooter>
      </Card>
      <div className="w-full max-w-2xl mx-auto no-print" id="review-page-actions-footer">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t mt-4 rounded-b-lg bg-muted/40">
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
              <Button variant="outline" onClick={handlePrint} disabled={isCompletingSale || isGeneratingImage || isGeneratingPDF || isPrinting || !currentGeneratedReceiptNumber}>
                 {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Printer className="mr-2 h-4 w-4"/>}
                 Print
              </Button>
              <Button variant="outline" onClick={handleDownloadImage} disabled={isCompletingSale || isGeneratingImage || isGeneratingPDF || isPrinting || !currentGeneratedReceiptNumber}>
                {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ImageDown className="mr-2 h-4 w-4"/>}
                Download Image
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isCompletingSale || isGeneratingImage || isGeneratingPDF || isPrinting || !currentGeneratedReceiptNumber}>
                {isGeneratingPDF ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4"/>}
                Download PDF
              </Button>
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={handleCompleteSale} disabled={isCompletingSale || isGeneratingImage || isGeneratingPDF || isPrinting || !currentGeneratedReceiptNumber}>
              {isCompletingSale ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <CheckCircle className="mr-2 h-5 w-5"/>}
              {isCompletingSale ? "Finalizing Sale..." : "Complete Sale"}
            </Button>
          </div>
      </div>
      <div className="text-center mt-4 no-print">
        <Button variant="link" onClick={handleGoBack} disabled={isCompletingSale || isGeneratingImage || isGeneratingPDF || isNavigatingBack || isPrinting}>
          {isNavigatingBack ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {isNavigatingBack ? "Loading..." : "Go Back to Edit Sale"}
        </Button>
      </div>
    </div>
  );
}
