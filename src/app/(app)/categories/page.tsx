
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tags, PlusCircle, ListTree, Search, Edit, Trash, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { InventoryItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface Category {
  name: string;
  productCount: number;
}

export default function CategoriesPage() {
  const { currentBusinessId } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentBusinessId) {
        setIsLoading(false);
        return;
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const productsQuery = query(collection(db, "products"), where("businessId", "==", currentBusinessId));
            const querySnapshot = await getDocs(productsQuery);
            const products = querySnapshot.docs.map(doc => doc.data() as InventoryItem);
            
            const categoryCounts = products.reduce((acc, product) => {
                const categoryName = product.category || "Uncategorized";
                acc[categoryName] = (acc[categoryName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const fetchedCategories = Object.entries(categoryCounts).map(([name, productCount]) => ({
                name,
                productCount,
            })).sort((a,b) => a.name.localeCompare(b.name));

            setCategories(fetchedCategories);

        } catch (error) {
            console.error("Error fetching categories:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load product categories.' });
        } finally {
            setIsLoading(false);
        }
    };

    fetchCategories();
  }, [currentBusinessId, toast]);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Product Categories" subtitle="Group your products for better organization and reporting.">
        <Button onClick={() => alert('Add New Category form/modal would appear here. (Not yet implemented)')}>
           <PlusCircle className="mr-2 h-4 w-4" />
            Add New Category
        </Button>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>
            Efficiently organize your product catalog by creating and managing categories. 
            Well-defined categories make it easier for you to track inventory, analyze sales performance by product group, and for customers to find products (if using an online store component).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : categories.length > 0 ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search categories..." className="w-full md:w-1/2 p-2 border rounded-md bg-background"/>
              </div>
              <ul className="space-y-3">
                {categories.map(cat => (
                  <li key={cat.name} className="p-4 border rounded-lg flex justify-between items-center hover:shadow-md transition-shadow bg-muted/30">
                    <div>
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Editing category: ${cat.name}`)} className="text-primary hover:text-primary">
                        <Edit className="mr-1 h-4 w-4"/> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => alert(`Deleting category: ${cat.name}`)}>
                        <Trash className="mr-1 h-4 w-4"/> Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <Tags className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Categories Defined Yet</h3>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                Organize your products effectively by grouping them into categories. 
                This helps in managing your inventory, filtering products, and understanding sales trends better.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mb-6 text-left inline-block">
                <li>Improve product discoverability.</li>
                <li>Simplify inventory management and stock-taking.</li>
                <li>Enable targeted promotions and discounts.</li>
                <li>Generate insightful sales reports per category.</li>
              </ul>
              <Button onClick={() => alert('Add New Category form/modal would appear here. (Not yet implemented)')}>
                Create Your First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListTree className="h-5 w-5 text-primary"/> Hierarchical Categories (Planned)</CardTitle>
            <CardDescription>Future enhancements will allow for creating sub-categories for even more granular organization (e.g., Electronics &gt; Mobile Phones &gt; Smartphones).</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
