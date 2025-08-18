
"use client";
import *as React from 'react';
import PageTitle from '@/components/shared/page-title';
import SummaryCard from '@/components/dashboard/summary-card';
import { DollarSign, Package, Users, AlertCircle, ShoppingCart, TrendingUp, FileText, ArrowRightCircle, CreditCard, Truck, CheckCircle, Activity, PackageCheck, PackageSearch, FileDigit, Layers, Archive, Award, Send, Gift, Loader2 } from 'lucide-react';
import DashboardClientContent from '@/components/dashboard/dashboard-client-content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Customer, InventoryItem, Receipt } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RewardEmailModal from '@/components/app/reward-email-modal';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface TopSellingItem extends InventoryItem {
  quantitySold: number;
}


export default function DashboardPage() {
  const { currentBusinessId } = useAuth();
  const { toast } = useToast();

  const [isRewardModalOpen, setIsRewardModalOpen] = React.useState(false);
  const [selectedCustomerForReward, setSelectedCustomerForReward] = React.useState<Customer | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [totalStock, setTotalStock] = React.useState(0);
  const [uniqueSkus, setUniqueSkus] = React.useState(0);
  const [lowStockItems, setLowStockItems] = React.useState(0);
  const [totalSalesValue, setTotalSalesValue] = React.useState(0);
  const [totalReceipts, setTotalReceipts] = React.useState(0);
  const [recentOrdersLast7Days, setRecentOrdersLast7Days] = React.useState(0);
  const [topSellingItems, setTopSellingItems] = React.useState<TopSellingItem[]>([]);
  const [topLoyaltyCustomers, setTopLoyaltyCustomers] = React.useState<Customer[]>([]);
  
  const salesOrderLifecycleSteps = [
    { title: "Order Created", icon: ShoppingCart, description: "A new sales order is placed by a customer or staff." },
    { title: "Payment Confirmed", icon: CreditCard, description: "Payment is successfully processed and verified." },
    { title: "Items Picked", icon: Package, description: "Products are gathered from inventory." },
    { title: "Shipped / Ready", icon: Truck, description: "Order is dispatched or made ready for pickup." },
    { title: "Delivered / Collected", icon: CheckCircle, description: "Customer receives the order." },
  ];

  React.useEffect(() => {
    if (!currentBusinessId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productsQuery = query(collection(db, "products"), where("businessId", "==", currentBusinessId));
        const receiptsQuery = query(collection(db, "receipts"), where("businessId", "==", currentBusinessId));
        const customersQuery = query(collection(db, "customers"), where("businessId", "==", currentBusinessId), orderBy("loyaltyPoints", "desc"), limit(3));

        const [productsSnapshot, receiptsSnapshot, customersSnapshot] = await Promise.all([
            getDocs(productsQuery),
            getDocs(receiptsQuery),
            getDocs(customersQuery),
        ]);

        const inventoryItems = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        setTotalStock(inventoryItems.reduce((sum, item) => sum + item.stock, 0));
        setUniqueSkus(inventoryItems.length);
        setLowStockItems(inventoryItems.filter(item => item.stock <= item.lowStockThreshold).length);

        const receipts = receiptsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receipt));
        setTotalSalesValue(receipts.reduce((sum, receipt) => sum + receipt.total, 0));
        setTotalReceipts(receipts.length);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        setRecentOrdersLast7Days(receipts.filter(r => new Date(r.date) > sevenDaysAgo).length);

        const itemSalesCount: Record<string, number> = {};
        receipts.forEach(receipt => {
          receipt.items.forEach(item => {
            const product = inventoryItems.find(p => p.id === item.itemId);
            if (product) { // Ensure product exists before counting
              itemSalesCount[product.name] = (itemSalesCount[product.name] || 0) + item.quantity;
            }
          });
        });

        const sortedItems = Object.entries(itemSalesCount)
          .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
          .slice(0, 3)
          .map(([name, quantitySold]) => {
            const inventoryItem = inventoryItems.find(invItem => invItem.name === name);
            return {
              ...(inventoryItem || { id: name, name: name, sku: 'N/A', stock: 0, price: 0, category: 'N/A', lowStockThreshold: 0 }),
              quantitySold: quantitySold
            } as TopSellingItem;
        });
        setTopSellingItems(sortedItems);
        
        setTopLoyaltyCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load dashboard data from the database.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentBusinessId, toast]);

  const handleSendRewardEmail = (customer: Customer) => {
    setSelectedCustomerForReward(customer);
    setIsRewardModalOpen(true);
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Dashboard" subtitle="Welcome back! Here's your Zeneva business overview." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Sales"
          value={`₦${totalSalesValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          icon={DollarSign}
          description={`${totalReceipts} transactions`}
        />
        <SummaryCard
          title="Total Inventory Units"
          value={totalStock.toLocaleString()}
          icon={Archive}
          description={`${uniqueSkus} unique SKUs`}
        />
        <SummaryCard
          title="Low Stock Alerts"
          value={lowStockItems}
          icon={AlertCircle}
          description={lowStockItems > 0 ? `${lowStockItems} items needing attention` : "All stock levels healthy"}
        />
        <SummaryCard
          title="Recent Orders"
          value={recentOrdersLast7Days}
          icon={ShoppingCart}
          description="In the last 7 days"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Sales Activity
            </CardTitle>
            <CardDescription>Overview of your current sales pipeline stages.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 text-center min-w-[140px] sm:min-w-0">
                <PackageCheck className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{totalReceipts}</p>
                <p className="text-xs text-muted-foreground">Completed Sales</p>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 text-center min-w-[140px] sm:min-w-0">
                <Truck className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">To be Shipped</p>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 text-center min-w-[140px] sm:min-w-0">
                <PackageSearch className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">To be Delivered</p>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 text-center min-w-[140px] sm:min-w-0">
                <FileDigit className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">To be Invoiced</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Inventory Summary
            </CardTitle>
             <CardDescription>Quick look at your stock status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Quantity in Hand</p>
                <p className="text-2xl font-bold">{totalStock.toLocaleString()}</p>
              </div>
              <Archive className="h-8 w-8 text-primary" />
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Quantity to be Received</p>
                <p className="text-2xl font-bold">0</p>
              </div>
               <PackageSearch className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardClientContent />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md md:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Top Loyalty Customers
                </CardTitle>
                <CardDescription>Your most loyal customers by points (Zeneva Loyalty Program).</CardDescription>
            </CardHeader>
            <CardContent>
                {topLoyaltyCustomers.length > 0 ? (
                    <ul className="space-y-3">
                        {topLoyaltyCustomers.map(customer => (
                             <li key={customer.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50">
                                <div className="flex items-center gap-2 min-w-0">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarImage src="" alt={customer.name} data-ai-hint="person avatar placeholder"/>
                                        <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate" title={customer.name}>{customer.name}</p>
                                        <p className="text-xs text-muted-foreground truncate" title={customer.email}>{customer.email}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-semibold text-primary">{customer.loyaltyPoints || 0} pts</p>
                                    <Button variant="ghost" size="xs" className="mt-0.5 text-xs h-auto p-1" onClick={() => handleSendRewardEmail(customer)}>
                                        <Gift className="mr-1 h-3 w-3"/> Send Reward
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No customer loyalty data yet.</p>
                )}
                 <Button variant="link" size="sm" asChild className="mt-3 w-full justify-center">
                    <Link href="/customers">View All Customers</Link>
                </Button>
            </CardContent>
        </Card>
        <Card className="shadow-md md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Selling Items
            </CardTitle>
            <CardDescription>Your most popular products this period (Data from Zeneva).</CardDescription>
          </CardHeader>
          <CardContent>
            {topSellingItems.length > 0 ? (
              <ul className="space-y-3">
                {topSellingItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 text-sm">
                    <Link href={`/inventory/${item.id}`} className="hover:underline text-primary font-medium truncate" title={item.name}>
                      {item.name}
                    </Link>
                    <span className="text-muted-foreground ml-2">{item.quantitySold} sold</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="mx-auto h-12 w-12 opacity-50 mb-3" />
                <p>Top selling items data will appear here once sales are recorded in Zeneva.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Purchase Orders
            </CardTitle>
            <CardDescription>Status of your orders from suppliers. (Data pending in Zeneva)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="mx-auto h-12 w-12 opacity-50 mb-3" />
              <p>Purchase order data will be displayed here in Zeneva.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <ArrowRightCircle className="h-5 w-5 text-primary" />
            Sales Order Lifecycle
          </CardTitle>
          <CardDescription>Understand the typical flow of a sales order in Zeneva.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-4 md:gap-0">
            {salesOrderLifecycleSteps.map((step, index) => (
              <React.Fragment key={step.title}>
                <div className="flex flex-col items-center text-center md:w-1/5 p-3 rounded-lg bg-muted/50 hover:shadow-md transition-shadow">
                  <step.icon className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < salesOrderLifecycleSteps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center w-auto px-2">
                    <ArrowRightCircle className="h-5 w-5 text-muted-foreground/70" />
                  </div>
                )}
                {index < salesOrderLifecycleSteps.length - 1 && (
                  <Separator orientation="vertical" className="md:hidden h-4 mx-auto w-px bg-border my-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
      {selectedCustomerForReward && (
        <RewardEmailModal
          isOpen={isRewardModalOpen}
          onOpenChange={setIsRewardModalOpen}
          customer={selectedCustomerForReward}
          rewardDetails={{
            discountPercentage: "10", 
            businessName: "Zeneva Store" 
          }}
        />
      )}
    </div>
  );
}
