
"use client";

import * as React from "react";
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Eye, Inbox, Barcode as BarcodeIcon, FilePlus2, Upload, UserPlus } from "lucide-react";
import type { InventoryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AddWaiterModal from '@/components/app/add-waiter-modal';
import StableImage from "../shared/stable-image";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface InventoryTableProps {
  items: InventoryItem[];
  onItemsChange: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export function InventoryTable({ items, onItemsChange }: InventoryTableProps) {
  const { toast } = useToast();
  const [isWaiterModalOpen, setIsWaiterModalOpen] = React.useState(false);
  const [selectedProductForWaiter, setSelectedProductForWaiter] = React.useState<InventoryItem | null>(null);

  const handleEditItem = (itemName: string) => {
    // In a real app, this would open a modal with the item's data pre-filled.
    // For now, we link to the add page in a conceptual "edit mode".
    toast({ title: "Edit Action", description: "To edit, please use the 'Add Product' page for now. Full edit-in-place is planned."});
  };

  const handleDeleteItem = async (itemToDelete: InventoryItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${itemToDelete.name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, "products", itemToDelete.id));
        onItemsChange(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
        toast({
            variant: "destructive",
            title: "Product Deleted",
            description: `"${itemToDelete.name}" has been removed from your inventory.`,
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        toast({
            variant: "destructive",
            title: "Delete Failed",
            description: "Could not delete the product from the database.",
        });
    }
  };


  const handleOpenAddWaiterModal = (item: InventoryItem) => {
    setSelectedProductForWaiter(item);
    setIsWaiterModalOpen(true);
  };

  if (items.length === 0) {
    return (
      <Card className="shadow-md border-2 border-dashed border-muted">
        <CardHeader className="text-center">
            <Inbox className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <CardTitle className="text-xl font-semibold">Your Inventory is Empty</CardTitle>
            <CardDescription className="text-muted-foreground">
              No products found yet. Get started by adding products manually or importing them via a CSV file.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
           <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/inventory/add">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Add Product Manually
              </Link>
            </Button>
            <Button variant="outline" onClick={() => {
                const importButton = document.querySelector('button:has(svg.lucide-upload)') as HTMLButtonElement | null;
                if (importButton) {
                    importButton.click();
                } else {
                    toast({ title: "Action Hint", description: "Click the 'Import Products (CSV)' button above to upload your inventory."});
                }
            }}>
                <Upload className="mr-2 h-4 w-4" />
                Import from CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="hidden lg:table-cell">Barcode</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price (₦)</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="hidden sm:table-cell">
                      <StableImage
                        alt={item.name}
                        className="aspect-square rounded-md object-cover border"
                        height="64"
                        src={item.imageUrl}
                        placeholderSrc="https://placehold.co/64x64"
                        width="64"
                        data-ai-hint={item.dataAiHint || "product item small"}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/inventory/${item.id}`} className="hover:underline text-primary">
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.barcode ? (
                        <span className="flex items-center gap-1">
                          <BarcodeIcon className="h-4 w-4 text-muted-foreground" />
                          {item.barcode}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.stock <= item.lowStockThreshold ? (
                        <Badge variant={item.stock === 0 ? "destructive" : "default"} className={item.stock > 0 && item.stock <= item.lowStockThreshold ? "bg-yellow-500 text-black" : ""}>
                          {item.stock.toLocaleString()} {item.stock === 0 ? '(Out)' : item.stock <=item.lowStockThreshold ? '(Low)' : ''}
                        </Badge>
                      ) : (
                        item.stock.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu for {item.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/inventory/${item.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditItem(item.name)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {item.stock === 0 && (
                            <DropdownMenuItem onClick={() => handleOpenAddWaiterModal(item)}>
                              <UserPlus className="mr-2 h-4 w-4" /> Add to Waitlist
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedProductForWaiter && (
        <AddWaiterModal
          isOpen={isWaiterModalOpen}
          onOpenChange={setIsWaiterModalOpen}
          product={selectedProductForWaiter}
        />
      )}
    </>
  );
}

export default InventoryTable;
