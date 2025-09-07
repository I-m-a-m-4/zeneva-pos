
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart, PlusCircle, ReceiptText, BarChart, Search, Filter, Printer, CreditCardIcon, Info, MoreVertical, Eye, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Receipt } from '@/types';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';


type SaleTransaction = Receipt;

export default function SalesPage() {
  const [salesTransactions, setSalesTransactions] = React.useState<SaleTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { currentBusinessId } = useAuth();


  React.useEffect(() => {
    if (!currentBusinessId) {
        setIsLoading(false);
        return;
    };

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const q = query(
                collection(db, "receipts"),
                where("businessId", "==", currentBusinessId),
                orderBy("date", "desc"),
                limit(10) // Fetch latest 10 sales for this page
            );
            const querySnapshot = await getDocs(q);
            const sales = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receipt));
            setSalesTransactions(sales);
        } catch (error) {
            console.error("Error fetching sales transactions:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch recent sales.'});
        } finally {
            setIsLoading(false);
        }
    };
    fetchSales();
  }, [currentBusinessId, toast]);

  const handleNewSale = () => {
    router.push('/sales/pos/select-products');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Sales & Point of Sale (POS)" subtitle="Manage transactions and process sales efficiently with Zeneva.">
        <Button onClick={handleNewSale}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Sale (Open POS)
        </Button>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales Transactions</CardTitle>
          <CardDescription>
            View a list of your most recent transactions.
            Filter, search, and view details for each sale.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>
          ) : salesTransactions.length > 0 ? (
            <>
              <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
                 <div className="flex items-center gap-2 w-full md:w-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search sales by ID, customer, or item..." className="w-full p-2 border rounded-md bg-background"/>
                </div>
                <Button variant="outline" className="w-full md:w-auto">
                    <Filter className="mr-2 h-4 w-4"/> Filter by Date/Status
                </Button>
              </div>
              <div className="space-y-3">
                {salesTransactions.map(sale => (
                  <Card key={sale.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          <Link href={`/receipts/${sale.id}`} className="hover:underline text-primary">
                            {sale.receiptNumber}
                          </Link>
                          {sale.customerName && ` - ${sale.customerName}`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(sale.date).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="mt-1">{sale.paymentMethod}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <p className="text-lg font-medium">
                          ₦{sale.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/receipts/${sale.id}`}><Eye className="mr-2 h-4 w-4"/> View Receipt</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Printing receipt ${sale.receiptNumber}`)}><Printer className="mr-2 h-4 w-4"/> Print Receipt</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
               <div className="mt-6 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/receipts">View All Receipts</Link>
                  </Button>
                </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Sales Recorded Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Once you start making sales through the Zeneva POS, your transaction history will appear here.
              </p>
              <Button onClick={handleNewSale}>
                Launch POS & Start Your First Sale
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-primary"/> Receipt Management</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Easily generate, view, print, or share digital receipts for every transaction with Zeneva.</p>
                <Button variant="outline" size="sm" asChild><Link href="/receipts">View All Receipts</Link></Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Printer className="h-5 w-5 text-primary"/> Receipt Printing Explained</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Zeneva uses browser-based printing. For standard receipts, ensure your A4/Letter printer is connected.
                    For "hot printers" (thermal receipt printers), specialized setup or third-party software might be needed as direct web-to-thermal printing is complex.
                    The "Print" button on a receipt page will use your browser's print dialog.
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCardIcon className="h-5 w-5 text-primary"/> Payment Processing (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                    Direct integration with payment gateways (e.g., Stripe, Paystack) is planned for future updates to process card payments seamlessly in Zeneva.
                    For now, record payments as "Cash," "Card (External POS)," or other manual methods. The business owner can set bank account details in Settings for reference.
                </p>
                 <Button variant="outline" size="sm" asChild><Link href="/settings">Go to Settings</Link></Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5 text-primary"/> Sales Analytics (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Track sales performance, identify trends, and understand your best-selling products and peak sales times through detailed reports in Zeneva.</p>
                 <Button variant="outline" size="sm" asChild><Link href="/reports">Go to Reports</Link></Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
