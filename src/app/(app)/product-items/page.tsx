
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListPlus, FilePlus2, ScanBarcode, Edit3, Layers, Search, PackageOpen, MoreVertical, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockInventoryItems } from '@/lib/data';
import type { InventoryItem } from '@/types';
import { Separator } from '@/components/ui/separator';
import StableImage from '@/components/shared/stable-image';

type GroupedProducts = {
  [key: string]: InventoryItem[];
};

export default function ProductItemsPage() {
  const [groupedProducts, setGroupedProducts] = React.useState<GroupedProducts>({});

  React.useEffect(() => {
    const groupByCategoryAndName = mockInventoryItems.reduce((acc, item) => {
      const key = `${item.category}__${item.name}`; // Group by category and name
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as GroupedProducts);
    setGroupedProducts(groupByCategoryAndName);
  }, []);

  const hasProducts = mockInventoryItems.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Product Item Management" subtitle="Manage individual product SKUs and their variations.">
        <Button asChild>
          <Link href="/inventory/add">
            <ListPlus className="mr-2 h-4 w-4" />
            Add New Product Item
          </Link>
        </Button>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Detailed Product Item Control</CardTitle>
          <CardDescription>
            View, add, and manage all your product items and their variants (e.g., by size or color). 
            Each unique item variation should have its own SKU.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasProducts ? (
             <>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search product items by name, SKU, or attribute..." className="w-full md:w-1/2 p-2 border rounded-md bg-background"/>
              </div>
              <div className="space-y-4">
                {Object.entries(groupedProducts).map(([groupKey, items]) => {
                  const [category, name] = groupKey.split('__');
                  return (
                    <Card key={groupKey} className="p-4 hover:shadow-md transition-shadow bg-muted/20">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Layers className="h-5 w-5 text-primary" /> 
                          {name} <Badge variant="outline">{category}</Badge>
                        </h3>
                         <Button variant="ghost" size="sm" asChild>
                           <Link href={`/inventory/add?name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}`}>
                              <FilePlus2 className="mr-2 h-4 w-4"/> Add Variant
                           </Link>
                         </Button>
                      </div>
                      <Separator />
                      <div className="mt-3 space-y-2">
                        {items.map(item => (
                           <Card key={item.id} className="p-3 bg-card shadow-sm">
                             <div className="flex items-center gap-4">
                              <StableImage
                                alt={item.name}
                                className="aspect-square rounded-md object-cover border hidden sm:block"
                                height="48"
                                src={item.imageUrl}
                                placeholder="https://placehold.co/48x48"
                                width="48"
                                data-ai-hint={item.dataAiHint || "product item small"}
                              />
                              <div className="flex-grow">
                                <p className="font-medium text-foreground">{item.variantDescription || 'Base Item'}</p>
                                <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                                <p className="text-xs text-muted-foreground">
                                  Stock: <span className="font-semibold">{item.stock.toLocaleString()}</span> units | Price: <span className="font-semibold">₦{item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild><Link href={`/inventory/${item.id}`}><PackageOpen className="mr-2 h-4 w-4"/> View Full Details</Link></DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => alert(`Edit ${item.name}`)}><Edit3 className="mr-2 h-4 w-4"/> Edit Item</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => alert(`Delete ${item.name}`)}><Trash2 className="mr-2 h-4 w-4"/> Delete Item</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                           </Card>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
          <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
            <FilePlus2 className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Detailed Product Items Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Go beyond basic stock counts. Define rich product information to improve your operations:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside mb-6 text-left inline-block">
                <li>Manage product variations (size, color, material).</li>
                <li>Add detailed descriptions and specifications.</li>
                <li>Track supplier details and costs (planned).</li>
                <li>Set up complex pricing rules (planned).</li>
            </ul>
            <Button asChild>
              <Link href="/inventory/add"> 
                Add Your First Detailed Product Item
              </Link>
            </Button>
          </div>
          )}
        </CardContent>
      </Card>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary"/> Product Variations</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Easily manage products that come in multiple options, like different sizes or colors, each with its own SKU and stock level.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ScanBarcode className="h-5 w-5 text-primary"/> Barcode & SKU Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Assign and manage unique SKUs and barcodes for efficient tracking and point-of-sale operations.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Edit3 className="h-5 w-5 text-primary"/> Rich Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Add comprehensive descriptions, images, and custom fields to capture all relevant product information.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
