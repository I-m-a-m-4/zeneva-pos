
"use client";

import *as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MailQuestion, Eye, PackageSearch, Send, Users, CalendarDays, Search as SearchIcon, Loader2 } from 'lucide-react';
import type { WaitlistItem, InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import StableImage from '@/components/shared/stable-image';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface AggregatedWaitlistItem {
  productId: string;
  productName: string;
  productSku?: string;
  productImageUrl?: string;
  dataAiHint?: string;
  requesterCount: number;
  requesters: { email: string; requestedAt: string }[];
}

export default function WaitlistPage() {
  const { currentBusinessId } = useAuth();
  const { toast } = useToast();
  
  const [aggregatedWaitlist, setAggregatedWaitlist] = React.useState<AggregatedWaitlistItem[]>([]);
  const [filteredWaitlist, setFilteredWaitlist] = React.useState<AggregatedWaitlistItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isViewRequestersModalOpen, setIsViewRequestersModalOpen] = React.useState(false);
  const [selectedProductForRequesters, setSelectedProductForRequesters] = React.useState<AggregatedWaitlistItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);


  React.useEffect(() => {
    if (!currentBusinessId) {
      setIsLoading(false);
      return;
    }

    const fetchWaitlistData = async () => {
      setIsLoading(true);
      try {
        const waitlistQuery = query(collection(db, "waitlist"), where("businessId", "==", currentBusinessId));
        const waitlistSnapshot = await getDocs(waitlistQuery);
        const waitlistItems = waitlistSnapshot.docs.map(doc => doc.data() as WaitlistItem);
        
        const productMap: Record<string, AggregatedWaitlistItem> = {};

        for (const item of waitlistItems) {
            if (!productMap[item.productId]) {
                const productRef = doc(db, "products", item.productId);
                const productSnap = await getDoc(productRef);
                const productDetails = productSnap.exists() ? productSnap.data() as InventoryItem : null;
                
                productMap[item.productId] = {
                    productId: item.productId,
                    productName: productDetails?.name || item.productName || 'Unknown Product',
                    productSku: productDetails?.sku,
                    productImageUrl: productDetails?.imageUrl,
                    dataAiHint: productDetails?.dataAiHint,
                    requesterCount: 0,
                    requesters: [],
                };
            }
            productMap[item.productId].requesterCount++;
            productMap[item.productId].requesters.push({
                email: item.customerEmail,
                requestedAt: item.requestedAt,
            });
        }
        
        const allAggregated = Object.values(productMap);
        setAggregatedWaitlist(allAggregated);
        setFilteredWaitlist(allAggregated);

      } catch (error) {
        console.error("Error fetching waitlist data:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not fetch waitlist data." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitlistData();
  }, [currentBusinessId, toast]);

  React.useEffect(() => {
    if (!searchTerm) {
      setFilteredWaitlist(aggregatedWaitlist);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = aggregatedWaitlist.filter(item => 
      item.productName.toLowerCase().includes(lowerSearchTerm) ||
      (item.productSku && item.productSku.toLowerCase().includes(lowerSearchTerm))
    );
    setFilteredWaitlist(filtered);
  }, [searchTerm, aggregatedWaitlist]);


  const handleViewRequesters = (product: AggregatedWaitlistItem) => {
    setSelectedProductForRequesters(product);
    setIsViewRequestersModalOpen(true);
  };
  
  const handleSendBatchNotification = (productName: string) => {
    toast({
      title: "Batch Notification Simulated",
      description: `Notifications for "${productName}" have been (simulated) sent to all requesters.`,
      duration: 5000,
    });
    setIsViewRequestersModalOpen(false);
  }

  if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Product Waitlist Management" subtitle="Track customer requests for out-of-stock products." />
      
      <Card>
        <CardHeader>
          <CardTitle>Products with Waitlist Requests</CardTitle>
          <CardDescription>
            Review products that customers are waiting for. Use this information to prioritize restocking and notify customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative w-full md:w-1/2">
              <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background pl-8"
                data-ai-hint="waitlist product search"
              />
            </div>
          </div>

          {filteredWaitlist.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center"># Requesters</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWaitlist.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="hidden sm:table-cell">
                        <StableImage
                          src={item.productImageUrl}
                          placeholder="https://placehold.co/64x64"
                          alt={item.productName}
                          width={48}
                          height={48}
                          className="rounded-md object-cover border"
                          data-ai-hint={item.dataAiHint || "product image small"}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.productSku || 'N/A'}</TableCell>
                      <TableCell className="text-center">{item.requesterCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewRequesters(item)}>
                          <Eye className="mr-2 h-4 w-4" /> View Requesters
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? "No Products Match Your Search" : "No Active Waitlists"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try a different search term to find waitlisted products." 
                  : "Currently, there are no products with customer waitlist requests. This feature will be available on your storefront product pages."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProductForRequesters && (
        <Dialog open={isViewRequestersModalOpen} onOpenChange={setIsViewRequestersModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Requesters for: {selectedProductForRequesters.productName}</DialogTitle>
              <DialogDescription>
                List of customers waiting for this product to be back in stock.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] pr-3">
              <div className="space-y-3 py-4">
                {selectedProductForRequesters.requesters.map((requester, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded-md bg-muted/50">
                    <div className="text-sm">
                        <p className="font-medium text-foreground flex items-center"><Users className="mr-2 h-4 w-4 text-primary" /> {requester.email}</p>
                        <p className="text-xs text-muted-foreground flex items-center"><CalendarDays className="mr-2 h-3 w-3" />Requested: {new Date(requester.requestedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter className="sm:justify-between items-center">
               <p className="text-xs text-muted-foreground text-left hidden sm:block">
                Total Requesters: {selectedProductForRequesters.requesterCount}
              </p>
              <div className="flex gap-2">
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
                <Button onClick={() => handleSendBatchNotification(selectedProductForRequesters.productName)}>
                    <Send className="mr-2 h-4 w-4" /> Send Batch Notification (Simulated)
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
