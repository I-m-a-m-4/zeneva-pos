
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lightbulb, Wrench, AlertTriangle, ArrowRight, Loader2, Sparkles, BrainCircuit, CheckCircle, PackageSearch, Tag, DollarSign, Copy, FileWarning } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { InventoryItem } from '@/types';
import { productTroubleshoot, type ProductTroubleshootInput, type ProductTroubleshootOutput } from '@/ai/flows/product-troubleshoot-flow';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

type IssueType = 'No Price' | 'No Category' | 'Potential Duplicate';

interface ProductIssue {
  type: IssueType;
  message: string;
  items: InventoryItem[];
}

export default function TroubleshootPage() {
  const { currentBusinessId } = useAuth();
  const { toast } = useToast();
  
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [issues, setIssues] = React.useState<ProductIssue[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [aiAnalysis, setAiAnalysis] = React.useState<ProductTroubleshootOutput['suggestions']>([]);

  React.useEffect(() => {
    if (!currentBusinessId) {
      setIsLoading(false);
      return;
    }
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "products"), where("businessId", "==", currentBusinessId));
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        setInventory(fetchedItems);
      } catch (error) {
        console.error("Error fetching inventory for troubleshooting:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Data",
          description: "Could not fetch inventory items.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, [currentBusinessId, toast]);

  React.useEffect(() => {
    const findIssues = () => {
      if (inventory.length === 0) {
        setIssues([]);
        return;
      }
      const foundIssues: ProductIssue[] = [];

      // Find items with no price
      const noPriceItems = inventory.filter(item => !item.price || item.price <= 0);
      if (noPriceItems.length > 0) {
        foundIssues.push({ type: 'No Price', message: 'These items are missing a price and won\'t appear in the POS correctly.', items: noPriceItems });
      }

      // Find items with no category
      const noCategoryItems = inventory.filter(item => !item.category || item.category.trim() === '');
      if (noCategoryItems.length > 0) {
        foundIssues.push({ type: 'No Category', message: 'Items without a category are harder to track in reports.', items: noCategoryItems });
      }

      // Find potential duplicates (simple name-based check)
      const nameCounts = inventory.reduce((acc, item) => {
        const name = item.name.toLowerCase().trim();
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const duplicateNames = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);
      if (duplicateNames.length > 0) {
        const duplicateItems = inventory.filter(item => duplicateNames.includes(item.name.toLowerCase().trim()));
        foundIssues.push({ type: 'Potential Duplicate', message: 'These items share the same name, which might indicate duplicate product groups. Ensure variants have unique SKUs.', items: duplicateItems });
      }
      
      setIssues(foundIssues);
    };

    findIssues();
  }, [inventory]);

  const handleAiAnalysis = async () => {
    if (inventory.length === 0) {
        toast({ title: "No Data", description: "There are no products in your inventory to analyze."});
        return;
    }
    setIsGenerating(true);
    setAiAnalysis([]);
    try {
        const input: ProductTroubleshootInput = { products: inventory.map(({id, name, sku, stock, price, category, description}) => ({id, name, sku, stock, price, category, description})) };
        const result = await productTroubleshoot(input);
        setAiAnalysis(result.suggestions);
        toast({
            title: "Analysis Complete!",
            description: "Zeneva AI has reviewed your product data.",
            variant: "success",
        });
    } catch (e) {
        console.error("Error running AI analysis:", e);
        toast({
            variant: "destructive",
            title: "AI Analysis Error",
            description: "Could not get a response from the AI. Please try again.",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const getIssueIcon = (type: IssueType) => {
    switch (type) {
        case 'No Price': return <DollarSign className="h-5 w-5 text-destructive" />;
        case 'No Category': return <Tag className="h-5 w-5 text-yellow-600" />;
        case 'Potential Duplicate': return <Copy className="h-5 w-5 text-blue-600" />;
        default: return <FileWarning className="h-5 w-5 text-muted-foreground" />;
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Inventory Troubleshooting" subtitle="Identify and fix potential issues in your product data." />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary"/> Automated Data Check</CardTitle>
          <CardDescription>
            This scan automatically checks for common data problems in your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map(issue => (
                <Card key={issue.type} className="bg-muted/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getIssueIcon(issue.type)} {issue.type} ({issue.items.length} found)
                    </CardTitle>
                    <CardDescription className="text-xs">{issue.message}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {issue.items.slice(0, 5).map(item => (
                        <li key={item.id} className="flex justify-between items-center text-sm p-2 border-b">
                          <div>
                            <p className="font-medium">{item.name} {item.variantDescription && `(${item.variantDescription})`}</p>
                            <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/inventory/${item.id}`}>View/Edit</Link>
                          </Button>
                        </li>
                      ))}
                      {issue.items.length > 5 && <li className="text-center text-xs text-muted-foreground pt-2">...and {issue.items.length - 5} more.</li>}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-foreground">No Common Issues Found!</h3>
              <p>Your product data looks clean based on our automated checks.</p>
            </div>
          )}
        </CardContent>
      </Card>

       <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-6 w-6 text-primary"/> AI-Powered Analysis</CardTitle>
          <CardDescription>
            Let Zeneva AI perform a deeper analysis on your inventory for optimization suggestions beyond simple data checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <Button size="lg" onClick={handleAiAnalysis} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Sparkles className="mr-2 h-5 w-5"/>}
                {isGenerating ? "Analyzing Products..." : "Get AI Analysis"}
            </Button>
        </CardContent>
        {isGenerating && (
            <CardContent className="text-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Zeneva is thinking...</p>
            </CardContent>
        )}
        {aiAnalysis.length > 0 && (
            <CardContent className="space-y-3">
                {aiAnalysis.map((suggestion, index) => (
                    <Card key={index} className="shadow-sm">
                        <CardHeader className="pb-2">
                           <CardTitle className="text-base flex items-center gap-2">{suggestion.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                           {suggestion.affectedProductIds && suggestion.affectedProductIds.length > 0 && (
                             <div className="mt-2 text-xs">
                                <p className="font-semibold">Related Products:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                {suggestion.affectedProductIds.map(id => {
                                    const product = inventory.find(p => p.id === id);
                                    return product ? <Badge key={id} variant="secondary">{product.name}</Badge> : null;
                                })}
                                </div>
                             </div>
                           )}
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        )}
      </Card>

    </div>
  );
}
