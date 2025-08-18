
"use client";

import type React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Receipt } from '@/types';
import { Eye, Download, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";

interface ReceiptListItemProps {
  receipt: Receipt;
}

const ReceiptListItem: React.FC<ReceiptListItemProps> = ({ receipt }) => {
  const { toast } = useToast();

  const handlePrint = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    alert("This would trigger the print dialog for this specific receipt.");
  };

  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    alert(`This would start a download for receipt ${receipt.receiptNumber}.`);
  };


  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href={`/receipts/${receipt.id}`} className="block">
            <h3 className="text-lg font-semibold text-primary hover:underline">
              {receipt.receiptNumber}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">
            Date: {new Date(receipt.date).toLocaleDateString()}
          </p>
          {receipt.customerName && (
            <p className="text-sm text-muted-foreground">
              Customer: {receipt.customerName}
            </p>
          )}
          <Badge variant="outline" className="mt-1">{receipt.paymentMethod}</Badge>
        </div>
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <p className="text-lg font-medium text-foreground sm:text-right">
                Total: ₦{receipt.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <div className="flex gap-2 mt-1 sm:mt-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/receipts/${receipt.id}`}>
                <Eye className="mr-1.5 h-4 w-4" /> View
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
             <Button variant="ghost" size="sm" onClick={handlePrint}>
              <Printer className="mr-1.5 h-4 w-4" /> Print
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptListItem;
