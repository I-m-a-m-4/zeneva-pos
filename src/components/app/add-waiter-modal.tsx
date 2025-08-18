
"use client";

import *as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { InventoryItem, WaitlistItem } from '@/types';
import { UserPlus, Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AddWaiterModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: InventoryItem | null;
}

export default function AddWaiterModal({ isOpen, onOpenChange, product }: AddWaiterModalProps) {
  const { toast } = useToast();
  const { currentBusinessId } = useAuth();
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleAddWaiter = async () => {
    if (!product || !currentBusinessId) {
      toast({ variant: "destructive", title: "Error", description: "Product or business information is missing." });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(customerEmail)) {
        toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email address." });
        return;
    }
    
    setIsSaving(true);
    
    const newWaiter: Omit<WaitlistItem, 'id' | 'createdAt'> = {
        productId: product.id,
        productName: product.name,
        customerEmail: customerEmail,
        requestedAt: new Date().toISOString(),
        notified: false,
        businessId: currentBusinessId,
    };

    try {
        await addDoc(collection(db, "waitlist"), {
            ...newWaiter,
            createdAt: serverTimestamp(),
        });
        toast({
            variant: "success",
            title: "Added to Waitlist",
            description: `${customerEmail} will be notified when ${product.name} is back in stock.`,
        });
        setCustomerEmail("");
        onOpenChange(false);
    } catch (error) {
        console.error("Error adding to waitlist:", error);
        toast({ variant: "destructive", title: "Save Failed", description: "Could not add customer to the waitlist." });
    } finally {
        setIsSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary"/> Add Customer to Waitlist
          </DialogTitle>
          <DialogDescription>
            Add a customer to the waitlist for the product: <strong>{product.name}</strong> (SKU: {product.sku}).
            They will be (conceptually) notified when it's back in stock.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="productName" className="text-sm font-medium">Product</Label>
            <Input id="productName" value={`${product.name} (Out of Stock)`} readOnly className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input 
              id="customerEmail" 
              type="email"
              value={customerEmail} 
              onChange={(e) => setCustomerEmail(e.target.value)} 
              placeholder="Enter customer's email address"
              data-ai-hint="customer email input"
              disabled={isSaving}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setCustomerEmail("")} disabled={isSaving}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddWaiter} disabled={!customerEmail.trim() || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            {isSaving ? "Adding..." : "Add to Waitlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
