
"use client";

import PageTitle from '@/components/shared/page-title';
import ReceiptDetails from '@/components/receipts/receipt-details';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download, MessageSquareShare, ImageDown, FileDown, Loader2 } from 'lucide-react'; 
import { notFound, useRouter, useParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { Receipt, Customer } from '@/types';
import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


// Helper function to construct detailed text for sharing
const constructReceiptTextForSharing = (receipt: Receipt | null, customer?: Customer | null): string => {
  if (!receipt) return "Receipt details are unavailable.";

  let itemsSummary = receipt.items.map(item => `${item.itemName} (Qty: ${item.quantity} @ ₦${item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}) = ₦${item.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`).join('\n - ');
  if (itemsSummary) itemsSummary = `\n - ${itemsSummary}`;
  
  const messageParts = [
    `*Receipt from Zeneva*`, 
    `Order ID / Receipt No.: ${receipt.receiptNumber}`,
    `Date: ${new Date(receipt.date).toLocaleDateString()}`,
  ];
  if (receipt.customerName) messageParts.push(`Customer: ${receipt.customerName}`);
  const displayCustomer = receipt.customerDetails || customer;
  if (displayCustomer?.phone) messageParts.push(`Phone: ${displayCustomer.phone}`);

  messageParts.push(
    `Items:${itemsSummary}`,
    `---`,
    `Subtotal: ₦${receipt.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
  );
  if(receipt.discountAmount && receipt.discountAmount > 0) messageParts.push(`Discount: -₦${receipt.discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
  messageParts.push(`Tax: ₦${receipt.tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
  messageParts.push(`*Total: ₦${receipt.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}*`);
  messageParts.push(`Payment Method: ${receipt.paymentMethod}`);
  if (receipt.notes) messageParts.push(`Notes: ${receipt.notes}`);
  messageParts.push(`\nThank you for your business!`);
  messageParts.push(`Generated: ${new Date().toLocaleString()}. Authentic Zeneva Receipt.`);


  return messageParts.join('\n');
};


export default function ReceiptPage() {
  const params = useParams<{ id: string }>();
  const receiptId = params.id;

  const { toast } = useToast();
  const router = useRouter();
  
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = React.useState(false);

  const [receipt, setReceipt] = React.useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);


  React.useEffect(() => {
    if (!receiptId) return;

    const fetchReceipt = async () => {
        setIsLoading(true);
        try {
            const receiptRef = doc(db, 'receipts', receiptId);
            const receiptSnap = await getDoc(receiptRef);

            if (!receiptSnap.exists()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Receipt not found.' });
                notFound();
                return;
            }

            const receiptData = { id: receiptSnap.id, ...receiptSnap.data() } as Receipt;

            if (receiptData.customerId) {
                const customerRef = doc(db, 'customers', receiptData.customerId);
                const customerSnap = await getDoc(customerRef);
                if (customerSnap.exists()) {
                    receiptData.customerDetails = customerSnap.data() as Customer;
                }
            }
            
            setReceipt(receiptData);

        } catch (error) {
            console.error("Error fetching receipt:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load receipt data.' });
        } finally {
            setIsLoading(false);
        }
    };

    fetchReceipt();
  }, [receiptId, toast]); 


  if (isLoading || !receipt) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  const getReceiptElement = () => document.getElementById('receipt-content-area');


  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setIsPrinting(false);
  };


  const handleDownloadPDF = async () => {
    const element = getReceiptElement();
    if (element) {
      setIsGeneratingPDF(true);
      try {
        const { default: html2canvas } = await import('html2canvas');
        const { default: jsPDF } = await import('jspdf');
        
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; 
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`receipt-${receipt.receiptNumber}.pdf`);
        toast({ title: "PDF Downloaded", description: `Receipt ${receipt.receiptNumber}.pdf has been saved.` });
      } catch (error: any) {
        console.error("Error generating PDF:", error);
        if (error.message && (error.message.toLowerCase().includes("module not found") || error.message.toLowerCase().includes("failed to fetch dynamically imported module"))) {
            toast({ variant: "destructive", title: "PDF Generation Failed", description: "Required library (html2canvas/jspdf) could not be loaded. This feature is currently unavailable." });
        } else {
            toast({ variant: "destructive", title: "PDF Error", description: `Could not generate PDF. ${(error as Error).message}` });
        }
      } finally {
        setIsGeneratingPDF(false);
      }
    } else {
      console.error("Receipt content element not found for PDF generation.");
      toast({ variant: "destructive", title: "Error", description: "Receipt content not found for PDF generation." });
    }
  };
  
  const handleDownloadImage = async () => {
    const element = getReceiptElement();
    if (element) {
      setIsGeneratingImage(true);
      try {
        const { default: html2canvas } = await import('html2canvas');

        const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });

        const link = document.createElement('a');
        link.download = `receipt-${receipt.receiptNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: "Image Downloaded", description: `Receipt ${receipt.receiptNumber}.png has been saved.` });
      } catch (error: any) {
        console.error("Error generating image:", error);
        if (error.message && (error.message.toLowerCase().includes("module not found") || error.message.toLowerCase().includes("failed to fetch dynamically imported module"))) {
            toast({ variant: "destructive", title: "Image Generation Failed", description: "Required library (html2canvas) could not be loaded. This feature is currently unavailable." });
        } else {
            toast({ variant: "destructive", title: "Image Error", description: `Could not generate image. ${(error as Error).message}` });
        }
      } finally {
        setIsGeneratingImage(false);
      }
    } else {
      console.error("Receipt content element not found for Image generation.");
      toast({ variant: "destructive", title: "Error", description: "Receipt content not found for image generation." });
    }
  };

  const handleShare = async () => {
    const element = getReceiptElement();
    if (!element || !receipt) {
      toast({ variant: "destructive", title: "Error", description: "Receipt content not found for sharing." });
      return;
    }
    setIsSharing(true);

    const shareTitle = `Receipt ${receipt.receiptNumber} from Zeneva`;
    const receiptText = constructReceiptTextForSharing(receipt, receipt.customerDetails);
    const shareUrl = window.location.href;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      
      let sharedViaApi = false;
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], `receipt-${receipt.receiptNumber}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file], title: shareTitle, text: `Details for receipt ${receipt.receiptNumber}.` })) {
          try {
            await navigator.share({
              files: [file],
              title: shareTitle,
              text: `Details for receipt ${receipt.receiptNumber}.`,
            });
            toast({ title: "Receipt Image Shared", description: "The receipt image has been shared successfully." });
            sharedViaApi = true;
          } catch (shareError: any) {
            console.warn("Image share failed, falling back:", shareError);
            toast({ title: "Image Share Failed", description: "Could not share image directly. Trying text fallback." });
          }
        } else {
             console.warn("navigator.canShare({ files: [...] }) returned false. Browser might not support sharing this file type or data.");
             toast({ title: "Image Share Not Supported", description: "Your browser cannot share this image file directly. Trying text fallback."});
        }
      } else {
         console.warn("navigator.share or blob generation failed for image sharing.");
         if (!navigator.share) toast({ title: "Web Share API Not Supported", description: "Your browser does not support the Web Share API for images. Trying text fallback."});
         else if (!blob) toast({ title: "Image Generation Failed for Share", description: "Could not prepare image for sharing. Trying text fallback."});
      }
      
      if (!sharedViaApi && navigator.share) {
        try {
            await navigator.share({ title: shareTitle, text: receiptText, url: shareUrl });
            toast({ title: "Receipt Shared as Text/Link", description: "Image sharing not fully supported or failed, shared text details instead." });
        } catch (textShareError: any) {
            console.warn("Text share also failed:", textShareError);
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(`${shareTitle}\n${receiptText}\n${shareUrl}`);
                toast({ title: "Receipt Details Copied", description: "Sharing failed. Receipt details copied to clipboard." });
            } else {
                toast({ variant: "destructive", title: "Share Error", description: "Could not share image or text, and clipboard access failed." });
            }
        }
      } else if (!sharedViaApi && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareTitle}\n${receiptText}\n${shareUrl}`);
        toast({ title: "Receipt Details Copied", description: "Sharing not available directly, receipt details copied to clipboard." });
      } else if (!sharedViaApi) {
         toast({ variant: "destructive", title: "Share Not Supported", description: "Your browser does not support sharing files or text." });
      }
    } catch (error: any) {
      console.error("Error preparing or sharing receipt:", error);
      let errorDescription = `Could not share. Error: ${(error as Error).message}`;
      if (error.message && (error.message.toLowerCase().includes("module not found") || error.message.toLowerCase().includes("failed to fetch dynamically imported module"))) {
          errorDescription = "Required library (html2canvas) for image sharing could not be loaded.";
      }

       if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareTitle}\n${receiptText}\n${shareUrl}`);
        toast({ variant: "destructive", title: "Share Error", description: `${errorDescription} Receipt details copied to clipboard.` });
      } else {
        toast({ variant: "destructive", title: "Share Error", description: `${errorDescription} Clipboard access also failed.` });
      }
    } finally {
      setIsSharing(false);
    }
  };
  

  const handleBackNavigation = () => {
    setIsNavigatingBack(true);
    router.back();
  }
  
  const isAnyActionLoading = isGeneratingImage || isGeneratingPDF || isSharing || isPrinting || isNavigatingBack;


  return (
    <div className="flex flex-col gap-6 no-print">
      <PageTitle title={`Receipt ${receipt.receiptNumber}`} subtitle={`Details for receipt dated ${new Date(receipt.date).toLocaleDateString()}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={handleBackNavigation} disabled={isAnyActionLoading}>
                {isNavigatingBack ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                {isNavigatingBack ? "Loading..." : "Back"}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Go to Previous Page</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={handlePrint} disabled={isAnyActionLoading}>
              {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />} Print
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Print Receipt</p></TooltipContent>
        </Tooltip>
         <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={handleShare} disabled={isAnyActionLoading}>
              {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareShare className="mr-2 h-4 w-4" />}
              {isSharing ? "Preparing..." : "Share"}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Share Receipt (Image/Text)</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={handleDownloadImage} disabled={isAnyActionLoading}>
              {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageDown className="mr-2 h-4 w-4" />}
              {isGeneratingImage ? "Generating..." : "Download Image"}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Download as Image (PNG)</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleDownloadPDF} disabled={isAnyActionLoading}>
              {isGeneratingPDF ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Download as PDF</p></TooltipContent>
        </Tooltip>
      </PageTitle>
      
      <ReceiptDetails receipt={receipt} businessName="Zeneva Store Example" />
    </div>
  );
}
