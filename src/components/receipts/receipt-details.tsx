
import type React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Receipt } from '@/types';
import Logo from '@/components/icons/logo';
import { User, Phone } from 'lucide-react';

interface ReceiptDetailsProps {
  receipt: Receipt;
  businessName?: string; 
}

const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({ receipt, businessName }) => {
  const displayBusinessName = businessName || "Zeneva"; 

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg print-only-this-area relative" id="receipt-content-area">
      <div className="zeneva-watermark" style={{ top: '25%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)' }}>Zeneva</div>
      <div className="zeneva-watermark" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)' }}>Zeneva</div>
      <div className="zeneva-watermark" style={{ top: '75%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)' }}>Zeneva</div>
      
      <CardHeader className="bg-muted/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} className="text-primary" />
            <div>
              <CardTitle className="text-2xl">{displayBusinessName}</CardTitle>
              <CardDescription>Sales Receipt</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">Order ID / Receipt No.: {receipt.receiptNumber}</p>
            <p className="text-sm text-muted-foreground">Date: {new Date(receipt.date).toLocaleDateString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {receipt.customerName && (
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-1"><User size={16}/> Billed To:</h4>
            <p className="text-muted-foreground font-bold">{receipt.customerName}</p>
            {receipt.customerDetails?.email && <p className="text-xs text-muted-foreground">{receipt.customerDetails.email}</p>}
            {receipt.customerDetails?.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={12}/> {receipt.customerDetails.phone}</p>}
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipt.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">₦{item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                <TableCell className="text-right">₦{item.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Payment Method:</h4>
            <p className="text-muted-foreground">{receipt.paymentMethod}</p>
             {receipt.notes && (
              <div className="mt-2">
                <h4 className="font-semibold text-sm mb-1">Notes:</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{receipt.notes}</p>
              </div>
            )}
          </div>
          <div className="text-right space-y-1">
            <p><span className="text-muted-foreground">Subtotal:</span> ₦{receipt.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            {receipt.discountAmount && receipt.discountAmount > 0 && (
                 <p className="text-destructive"><span className="text-muted-foreground">Discount:</span> - ₦{receipt.discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            )}
            <p><span className="text-muted-foreground">Tax:</span> ₦{receipt.tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="font-bold text-lg"><span className="text-muted-foreground">Total:</span> ₦{receipt.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 text-center text-xs text-muted-foreground border-t bg-muted/20">
        <p>Generated: {new Date().toLocaleString()}. Authentic Zeneva Receipt.</p>
        <p>Thank you for your business with {displayBusinessName}!</p>
      </CardFooter>
    </Card>
  );
};

export default ReceiptDetails;
