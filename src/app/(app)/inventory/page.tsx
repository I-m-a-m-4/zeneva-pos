
"use client";

import Link from 'next/link';
import PageTitle from '@/components/shared/page-title';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, Download, Upload, Info, FileText, Settings2, AlertTriangle, ShieldCheck, Loader2, Wrench, DatabaseBackup, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import type { InventoryItem } from '@/types';
import *as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, where, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from '@/context/auth-context';


const IMPORT_CACHE_KEY = "zeneva-csv-import-cache";

function generateBarcode(sku: string): string {
  const timestampSuffix = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ZN-${timestampSuffix}-${randomSuffix}`;
}


export default function InventoryPage() {
  const { toast } = useToast();
  const { currentBusinessId } = useAuth();
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = React.useState(true);
  
  const [stagedImport, setStagedImport] = React.useState<InventoryItem[]>([]);
  const [isSavingStaged, setIsSavingStaged] = React.useState(false);


  const fetchInventory = React.useCallback(async () => {
    if (!currentBusinessId) {
      setIsLoadingInventory(false);
      return;
    }

    setIsLoadingInventory(true);
    try {
      const q = query(
        collection(db, "products"), 
        where("businessId", "==", currentBusinessId), 
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const items: InventoryItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        } as InventoryItem);
      });
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching inventory from Firestore:", error);
      toast({ variant: "destructive", title: "Error Fetching Inventory", description: "Could not load products from cloud." });
    } finally {
      setIsLoadingInventory(false);
    }
  }, [currentBusinessId, toast]);

  React.useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  React.useEffect(() => {
    try {
        const cachedData = localStorage.getItem(IMPORT_CACHE_KEY);
        if (cachedData) {
            setStagedImport(JSON.parse(cachedData));
        }
    } catch (error) {
        console.error("Failed to parse staged import data from localStorage", error);
        localStorage.removeItem(IMPORT_CACHE_KEY);
    }
  }, []);

  const categories = inventoryItems.length > 0 ? Array.from(new Set(inventoryItems.map(item => item.category))) : [];

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [generateBarcodesOnImport, setGenerateBarcodesOnImport] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const convertToCSV = (data: InventoryItem[]) => {
    if (data.length === 0) return "ID,Name,SKU,Stock,Price,Category,Low Stock Threshold,Last Sale Date,Description,Image URL,Barcode,Data AI Hint\n";

    const headers = ["ID", "Name", "SKU", "Stock", "Price", "Category", "Low Stock Threshold", "Last Sale Date", "Description", "Image URL", "Barcode", "Data AI Hint"];
    const rows = data.map(item =>
      [
        item.id,
        `"${(item.name || "").replace(/"/g, '""')}"`,
        item.sku || "",
        item.stock,
        item.price,
        item.category || "",
        item.lowStockThreshold,
        item.lastSaleDate || "",
        `"${(item.description || "").replace(/"/g, '""')}"`,
        item.imageUrl || "",
        item.barcode || "",
        item.dataAiHint || ""
      ].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const handleExportCSV = () => {
    if (inventoryItems.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no inventory items to export. The CSV will contain headers only.",
        variant: "default"
      });
    }

    const csvData = convertToCSV(inventoryItems);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'zeneva_inventory_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        variant: "success",
        title: "Export Successful",
        description: inventoryItems.length > 0 ? "Inventory data has been exported as CSV." : "CSV with headers exported. No items were present in the inventory.",
      });
    } else {
       toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Your browser does not support direct CSV download.",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const parseCSV = (csvText: string): Omit<InventoryItem, 'id' | 'dataAiHint'>[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        toast({ title: "CSV Error", description: "CSV file is empty or has no data rows.", variant: "destructive" });
        return [];
    }
    const headerLine = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const headerMap: Record<string, number> = {};
    const headerSynonyms: Record<string, string[]> = {
        name: ['product name', 'item name'],
        sku: ['stock keeping unit'],
        stock: ['quantity', 'on hand'],
        price: ['cost', 'unit price'],
        category: ['product category', 'group'],
        lowStockThreshold: ['low stock', 'reorder point', 'low stock alert'],
        barcode: ['upc', 'ean'],
        imageUrl: ['image', 'image url', 'photo'],
    };
    headerLine.forEach((header, index) => {
        let mapped = false;
        for (const standardHeader in headerSynonyms) {
            if (header === standardHeader || headerSynonyms[standardHeader].includes(header)) {
                headerMap[standardHeader] = index;
                mapped = true;
                break;
            }
        }
        if (!mapped) headerMap[header] = index;
    });
    
    const requiredHeaders = ["name", "sku", "stock", "price", "category", "lowStockThreshold"];
    const missingHeaders = requiredHeaders.filter(reqHeader => headerMap[reqHeader] === undefined);

    if (missingHeaders.length > 0) {
        toast({
            title: "CSV Header Error",
            description: `Missing required column(s): ${missingHeaders.join(', ')}. Please check your file.`,
            variant: "destructive",
            duration: 10000
        });
        return [];
    }

    const dataRows = lines.slice(1);
    const parsedItems: Omit<InventoryItem, 'id' | 'dataAiHint'>[] = [];
    let skippedRows = 0;

    dataRows.forEach((line, index) => {
        if (!line.trim()) return;
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(value => value.trim().replace(/^"|"$/g, ''));
        try {
            const name = values[headerMap['name']];
            const sku = values[headerMap['sku']];
            const stock = parseInt(values[headerMap['stock']]);
            const price = parseFloat(values[headerMap['price']]);
            const category = values[headerMap['category']];
            const lowStockThreshold = parseInt(values[headerMap['lowStockThreshold']]);
            if (!name || !sku || isNaN(stock) || isNaN(price) || !category || isNaN(lowStockThreshold)) {
                skippedRows++; return;
            }
            parsedItems.push({ name, sku, stock, price, category, lowStockThreshold, barcode: values[headerMap['barcode']], description: values[headerMap['description']], imageUrl: values[headerMap['imageUrl']] });
        } catch (e) { skippedRows++; }
    });

    if (skippedRows > 0) toast({ title: "Import Warning", description: `${skippedRows} row(s) were skipped due to missing/invalid data.` });
    return parsedItems;
  };


  const handleProcessImport = async () => {
    if (!selectedFile) {
      toast({ title: "No File Selected", description: "Please select a CSV file.", variant: "destructive" });
      return;
    }
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast({ title: "File Error", description: "Could not read the file.", variant: "destructive" });
        setIsUploading(false); return;
      }
      const parsedData = parseCSV(text);
      if (parsedData.length > 0) {
        localStorage.setItem(IMPORT_CACHE_KEY, JSON.stringify(parsedData));
        setStagedImport(parsedData as InventoryItem[]);
        toast({ variant: "success", title: "Data Staged Successfully!", description: `${parsedData.length} products are ready to be saved to the cloud.` });
      }
      setIsImportDialogOpen(false);
      setSelectedFile(null);
      setGenerateBarcodesOnImport(false);
      if (document.getElementById('csvFile') as HTMLInputElement) (document.getElementById('csvFile') as HTMLInputElement).value = "";
      setIsUploading(false);
    };
    reader.onerror = () => { toast({ title: "File Read Error", variant: "destructive" }); setIsUploading(false); };
    reader.readAsText(selectedFile);
  };
  
  const handleSaveStagedToCloud = async () => {
    if (!currentBusinessId) {
      toast({ title: "No Business Selected", variant: "destructive" });
      return;
    }
    if (stagedImport.length === 0) {
      toast({ title: "No Staged Data", description: "There's no data to save." });
      return;
    }
    setIsSavingStaged(true);
    toast({ title: "Saving to Cloud...", description: `Saving ${stagedImport.length} products to Firestore.` });

    try {
        const batch = writeBatch(db);
        stagedImport.forEach(item => {
            const docRef = doc(collection(db, "products")); // Auto-generate ID
            const itemToSave = {
                ...item,
                businessId: currentBusinessId,
                barcode: item.barcode || (generateBarcodesOnImport ? generateBarcode(item.sku) : undefined),
                dataAiHint: item.name.split(' ').slice(0, 2).join(' ').toLowerCase() || "product",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            batch.set(docRef, itemToSave);
        });
        await batch.commit();
        toast({ variant: "success", title: "Save Complete!", description: `${stagedImport.length} products saved to Firestore.` });
        localStorage.removeItem(IMPORT_CACHE_KEY);
        setStagedImport([]);
        await fetchInventory(); // Refresh the main inventory list
    } catch (error) {
        console.error("Error saving staged data to Firestore:", error);
        toast({ title: "Save Failed", description: "Could not save products to Firestore.", variant: "destructive" });
    } finally {
        setIsSavingStaged(false);
    }
  }

  const handleClearStaged = () => {
    localStorage.removeItem(IMPORT_CACHE_KEY);
    setStagedImport([]);
    toast({ title: "Staged Data Cleared", description: "The imported product data has been cleared from local storage."});
  }


  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Inventory Management" subtitle="Track and manage your product stock with Zeneva.">
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogTrigger asChild><Button variant="outline"><Upload className="mr-2 h-4 w-4" />Import Products (CSV)</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Products from CSV</DialogTitle>
              <DialogDescription>Upload a CSV file to add products. The data will be staged for review before saving to the cloud.</DialogDescription>
            </DialogHeader>
            <Card className="bg-muted/50 p-4">
              <CardDescription className="text-xs space-y-1">
                <p className="font-bold text-foreground">Required Columns:</p><p><code>Name</code>, <code>SKU</code>, <code>Stock</code>, <code>Price</code>, <code>Category</code>, <code>Low Stock Threshold</code></p>
                <p className="font-bold text-foreground mt-2">Optional Columns:</p><p><code>Barcode</code>, <code>Description</code>, <code>Image URL</code></p>
              </CardDescription>
            </Card>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="csvFile" className="text-right">CSV File</Label>
                <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} className="col-span-3" disabled={isUploading}/>
              </div>
              <div className="flex items-center space-x-2 pl-4 col-start-2 col-span-3">
                <Checkbox id="generateBarcodesOnImport" checked={generateBarcodesOnImport} onCheckedChange={(checked) => setGenerateBarcodesOnImport(Boolean(checked))} disabled={isUploading} />
                <Label htmlFor="generateBarcodesOnImport" className="text-sm font-normal">Auto-generate barcodes for products (if missing)</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" onClick={() => { setSelectedFile(null); if (document.getElementById('csvFile') as HTMLInputElement) (document.getElementById('csvFile') as HTMLInputElement).value = ""; setGenerateBarcodesOnImport(false); }} disabled={isUploading}>Cancel</Button></DialogClose>
              <Button onClick={handleProcessImport} disabled={!selectedFile || isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} {isUploading ? "Processing..." : "Upload and Stage"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={handleExportCSV}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
        <Button asChild><Link href="/inventory/add"><FilePlus2 className="mr-2 h-4 w-4" />Add Product</Link></Button>
      </PageTitle>

      {stagedImport.length > 0 && (
        <Card className="bg-blue-50 border-l-4 border-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800"><DatabaseBackup className="h-6 w-6"/>Staged Import</CardTitle>
                <CardDescription className="text-blue-700">You have <strong>{stagedImport.length}</strong> products from a CSV import ready to be saved to your cloud database.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
                <Button onClick={handleSaveStagedToCloud} disabled={isSavingStaged}>
                    {isSavingStaged ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    {isSavingStaged ? "Saving..." : "Save to Cloud"}
                </Button>
                <Button variant="destructive" onClick={handleClearStaged}>Clear Staged Data</Button>
            </CardContent>
        </Card>
      )}

      {isLoadingInventory ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="all">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <Input placeholder="Search products..." className="max-w-sm bg-background" />
              <div className="flex gap-2">
                <Select disabled={categories.length === 0}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map(category => (<SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>))}</SelectContent>
                </Select>
                <Select disabled={inventoryItems.length === 0}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem><SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="stock-asc">Stock (Low to High)</SelectItem><SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem><SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <TabsList className="ml-auto hidden sm:flex">
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all"><InventoryTable items={inventoryItems} onItemsChange={setInventoryItems} /></TabsContent>
            <TabsContent value="low-stock"><InventoryTable items={inventoryItems.filter(item => item.stock > 0 && item.stock <= item.lowStockThreshold)} onItemsChange={setInventoryItems} /></TabsContent>
            <TabsContent value="out-of-stock"><InventoryTable items={inventoryItems.filter(item => item.stock === 0)} onItemsChange={setInventoryItems} /></TabsContent>
          </Tabs>
        )}
      {inventoryItems.length > 50 && <p className="text-center text-muted-foreground mt-4">Pagination controls will appear here.</p>}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" />Inventory Health & Troubleshooting</CardTitle>
          <CardDescription>Use our troubleshooting tool to find and fix data issues in your inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">A dedicated troubleshooting area with automated checks and AI-powered suggestions to help you quickly identify and resolve inventory discrepancies.</p>
          <Button variant="outline" asChild><Link href="/inventory/troubleshoot">Go to Troubleshoot Area</Link></Button>
        </CardContent>
      </Card>

    </div>
  );
}
