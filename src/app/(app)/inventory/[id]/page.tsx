
"use client";

import * as React from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { InventoryItem } from '@/types';
import PageTitle from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit3, Trash2, History, BarChart2, Barcode as BarcodeIcon, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, XAxis, YAxis, Bar, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import StableImage from '@/components/shared/stable-image';

const chartConfig = {
  stock: {
    label: "Stock Level",
    color: "hsl(var(--primary))",
  },
  sales: {
    label: "Sales",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

const mockStockHistory = [
  { date: "Jan", stock: 150, sales: 30 },
  { date: "Feb", stock: 120, sales: 40 },
  { date: "Mar", stock: 100, sales: 25 },
  { date: "Apr", stock: 130, sales: 50 },
  { date: "May", stock: 90, sales: 35 },
  { date: "Jun", stock: 110, sales: 45 },
];

export default function InventoryItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [item, setItem] = React.useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!params.id) return;
    const fetchItem = async () => {
      setIsLoading(true);
      try {
        const itemRef = doc(db, 'products', params.id);
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          setItem({ id: itemSnap.id, ...itemSnap.data() } as InventoryItem);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching inventory item:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch item details.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [params.id, toast]);

  const handleEditItem = () => {
    alert(`Editing ${item?.name} - Functionality to be implemented.`);
  };

  const handleDeleteItem = () => {
    toast({
      variant: "destructive",
      title: `Deleted ${item?.name} from Zeneva`,
      description: `${item?.name} has been removed from inventory. (This is a simulation)`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title={item.name} subtitle={`Zeneva Details for SKU: ${item.sku}`}>
        <Button variant="outline" asChild>
          <Link href="/inventory">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>
        <Button variant="outline" onClick={handleEditItem}>
          <Edit3 className="mr-2 h-4 w-4" />
          Edit Item
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Item
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item
                "{item.name}" from your Zeneva inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteItem}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageTitle>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <StableImage
              alt={`${item.name} - Zeneva Product Image`}
              className="aspect-square rounded-lg object-cover w-full border"
              height={300}
              src={item.imageUrl}
              placeholderSrc='https://placehold.co/300x300'
              width={300}
              data-ai-hint={item.dataAiHint || "product photo detail"}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Item Details (Zeneva)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">SKU</p>
                <p className="font-medium">{item.sku}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{item.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Stock</p>
                <p className={`font-medium text-lg ${item.stock <= item.lowStockThreshold ? 'text-destructive' : 'text-green-600'}`}>
                  {item.stock.toLocaleString()} units
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-medium text-lg">₦{item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Low Stock Threshold</p>
                <p className="font-medium">{item.lowStockThreshold.toLocaleString()} units</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Sale Date</p>
                <p className="font-medium">{item.lastSaleDate ? new Date(item.lastSaleDate).toLocaleDateString() : 'N/A'}</p>
              </div>
               <div>
                <p className="text-muted-foreground">Barcode</p>
                <p className="font-medium flex items-center gap-2">
                  {item.barcode || 'N/A'}
                  {item.barcode && <BarcodeIcon className="h-5 w-5" />}
                </p>
              </div>
            </div>
            <Separator />
             {item.description && (
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )}
            <Separator />
            <div>
                <h4 className="font-medium mb-2">Status</h4>
                {item.stock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
                {item.stock > 0 && item.stock <= item.lowStockThreshold && <Badge variant="destructive">Low Stock</Badge>}
                {item.stock > item.lowStockThreshold && <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">In Stock</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Stock & Sales History (Last 6 Months in Zeneva)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={mockStockHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" />
                <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar yAxisId="left" dataKey="stock" fill="var(--color-stock)" radius={4} name="Stock Level"/>
                <Bar yAxisId="right" dataKey="sales" fill="var(--color-sales)" radius={4} name="Units Sold" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Item History & Audit Log (Zeneva)
          </CardTitle>
          <CardDescription>Changes made to this item, stock adjustments, etc. within Zeneva.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Item history log will be displayed here. (e.g., stock updates, price changes)</p>
           <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li><span className="font-medium text-foreground">2024-07-15:</span> Stock updated to 100 units by Admin. Reason: New shipment.</li>
            <li><span className="font-medium text-foreground">2024-06-20:</span> Price changed from ₦75.00 to ₦79.99 by Admin.</li>
            <li><span className="font-medium text-foreground">2024-05-01:</span> Item created by Admin. Initial stock: 50 units.</li>
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}
