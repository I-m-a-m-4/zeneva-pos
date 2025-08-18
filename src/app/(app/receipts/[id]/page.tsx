
"use client";

import { getReceiptById } from '@/lib/data';
import PageTitle from '@/components/shared/page-title';
import ReceiptDetails from '@/components/receipts/receipt-details';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, MessageSquareShare, ImageDown, FileDown, Loader2 } from 'lucide-react'; 
import { notFound, useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import type { Receipt } from '@/types';
import * as React from 'react';

// Helper function to construct detailed text for sharing
const constructReceiptTextForSharing = (receipt: Receipt | null): string => {
  if (!receipt) return "Receipt details are unavailable.";

  let itemsSummary = receipt.items.map(item => `${item.itemName} (Qty: ${item.quantity} @ ₦${item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}) = ₦${item.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`).join('\n - ');
  if (itemsSummary) itemsSummary = `\n - ${itemsSummary}`;
  
  const messageParts = [
    `*Receipt from SalePilot*`,
    `Receipt No: ${receipt.receiptNumber}`,
    `Date: ${new Date(receipt.date).toLocaleDateString()}`,
  ];
  if (receipt.customerName) messageParts.push(`Customer: ${receipt.customerName}`);
  
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

  return messageParts.join('\n');
};


export default function ReceiptPage({ params }: ReceiptPageProps) {
  const receipt = getReceiptById(params.id);
  const { toast } = useToast();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (!receipt) {
    notFound();
  }

  const handlePrint = () => {
    window.print();
    toast({
      title: "Printing Receipt",
      description: "Your receipt is being sent to the printer.",
    });
  };

  const getReceiptElement = () => document.getElementById('receipt-content-area');

  const handleDownloadPDF = async () => {
    const element = getReceiptElement();
    if (element) {
      setIsGenerating(true);
      try {
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;
        
        console.log("Receipt element for PDF found:", element);
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });
        console.log("Canvas generated for PDF:", canvas);

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
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: "destructive", title: "PDF Error", description: `Could not generate PDF. ${(error as Error).message}` });
      } finally {
        setIsGenerating(false);
      }
    } else {
      console.error("Receipt content element not found for PDF generation.");
      toast({ variant: "destructive", title: "Error", description: "Receipt content not found for PDF generation." });
    }
  };
  
  const handleDownloadImage = async () => {
    const element = getReceiptElement();
    if (element) {
      setIsGenerating(true);
      try {
        const html2canvas = (await import('html2canvas')).default;

        console.log("Receipt element for Image found:", element);
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight });
        console.log("Canvas generated for Image:", canvas);

        const link = document.createElement('a');
        link.download = `receipt-${receipt.receiptNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: "Image Downloaded", description: `Receipt ${receipt.receiptNumber}.png has been saved.` });
      } catch (error) {
        console.error("Error generating image:", error);
        toast({ variant: "destructive", title: "Image Error", description: `Could not generate image. ${(error as Error).message}` });
      } finally {
        setIsGenerating(false);
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
    setIsGenerating(true);

    const shareTitle = `Receipt ${receipt.receiptNumber} from SalePilot`;
    const receiptText = constructReceiptTextForSharing(receipt);
    const shareUrl = window.location.href;

    try {
      const html2canvas = (await import('html2canvas')).default;
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
            toast({ title: "Receipt Image Shared", description: "The receipt image has been shared." });
            sharedViaApi = true;
          } catch (shareError) {
            console.warn("Image share failed, falling back:", shareError);
            // Fall through to text share if image share specifically fails
          }
        }
      }
      
      if (!sharedViaApi && navigator.share) {
        await navigator.share({ title: shareTitle, text: receiptText, url: shareUrl });
        toast({ title: "Receipt Shared as Text/Link", description: "Image sharing not fully supported by target, shared text details instead." });
      } else if (!sharedViaApi && navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareTitle}\n${receiptText}\n${shareUrl}`);
        toast({ title: "Receipt Details Copied", description: "Sharing not available, receipt details copied to clipboard." });
      } else if (!sharedViaApi) {
         toast({ variant: "destructive", title: "Share Not Supported", description: "Your browser does not support sharing files or text." });
      }
    } catch (error) {
      console.error("Error preparing or sharing receipt:", error);
       if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareTitle}\n${receiptText}\n${shareUrl}`);
        toast({ variant: "destructive", title: "Share Error", description: `Could not share. Receipt details copied to clipboard. Error: ${(error as Error).message}` });
      } else {
        toast({ variant: "destructive", title: "Share Error", description: `Could not share and clipboard access failed. Error: ${(error as Error).message}` });
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleShareToWhatsAppTextOnly = () => {
    if (!receipt) return;
    const text = constructReceiptTextForSharing(receipt);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    toast({ title: "Sharing to WhatsApp", description: "Opening WhatsApp to share receipt details as text." });
  };


  return (
    <div className="flex flex-col gap-6">
      <PageTitle title={`Receipt ${receipt.receiptNumber}`} subtitle={`Details for receipt dated ${new Date(receipt.date).toLocaleDateString()}`}>
        <Button variant="outline" onClick={() => router.back()} disabled={isGenerating}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button variant="outline" onClick={handlePrint} disabled={isGenerating}>
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        <Button variant="outline" onClick={handleShareToWhatsAppTextOnly} disabled={isGenerating}>
          <MessageSquareShare className="mr-2 h-4 w-4" /> To WhatsApp (Text)
        </Button>
         <Button variant="outline" onClick={handleShare} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareShare className="mr-2 h-4 w-4" />}
          {isGenerating ? "Preparing..." : "Share"}
        </Button>
        <Button variant="outline" onClick={handleDownloadImage} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageDown className="mr-2 h-4 w-4" />}
          {isGenerating ? "Generating..." : "Image"}
        </Button>
        <Button onClick={handleDownloadPDF} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          {isGenerating ? "Generating..." : "PDF"}
        </Button>
      </PageTitle>
      
      <ReceiptDetails receipt={receipt} />
    </div>
  );
}
    
