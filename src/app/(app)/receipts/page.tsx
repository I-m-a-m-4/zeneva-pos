
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import ReceiptListItem from '@/components/receipts/receipt-list-item';
import { Button } from '@/components/ui/button';
import { FilePlus2, FileText, Download, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import type { Receipt } from '@/types';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ReceiptsPage() {
  const { currentBusinessId } = useAuth();
  const { toast } = useToast();
  const [receipts, setReceipts] = React.useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentBusinessId) {
      setIsLoading(false);
      return;
    }

    const fetchReceipts = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "receipts"),
          where("businessId", "==", currentBusinessId),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedReceipts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Receipt));
        setReceipts(fetchedReceipts);
      } catch (error) {
        console.error("Error fetching receipts:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch receipts.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, [currentBusinessId, toast]);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Sales Receipts" subtitle="Manage and view generated sales receipts with Zeneva.">
        <Button asChild>
          <Link href="/sales/pos/select-products">
            <FilePlus2 className="mr-2 h-4 w-4" />
            Generate New Receipt
          </Link>
        </Button>
      </PageTitle>

      <div className="mb-4">
        <Input placeholder="Search receipts by number or customer..." className="max-w-sm" />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : receipts.length > 0 ? (
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <ReceiptListItem key={receipt.id} receipt={receipt} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Receipts Found</h3>
          <p className="text-muted-foreground mb-4">It looks like you haven't generated any receipts yet with Zeneva.</p>
          <Button asChild>
             <Link href="/sales/pos/select-products">
                Generate Your First Receipt
            </Link>
          </Button>
        </div>
      )}
      {receipts.length > 50 && <p className="text-center text-muted-foreground mt-4">Pagination controls will appear here.</p>}
    </div>
  );
}
