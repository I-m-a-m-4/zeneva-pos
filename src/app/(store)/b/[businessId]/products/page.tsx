// src/app/(store)/b/[businessId]/products/page.tsx
"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { InventoryItem } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Edit, Package, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function StoreProductsPage() {
  const params = useParams<{ businessId: string }>();
  const { toast } = useToast();
  
  const [products, setProducts] = React.useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!params.businessId) return;
    
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsQuery = query(
          collection(db, 'products'),
          where('businessId', '==', params.businessId),
          where('stock', '>', 0)
        );
        const querySnapshot = await getDocs(productsQuery);
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching storefront products:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not load products for this store." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [params.businessId, toast]);
  
  const handleAddToCart = (productName: string) => {
    toast({
      title: "Added to Cart (Simulated)",
      description: `${productName} has been added to your cart.`,
    });
  };

  const handleEditContent = (section: string) => {
    toast({
        title: "Edit Content (Planned)",
        description: `Content editing for '${section}' is a planned Pro feature for business owners.`,
        duration: 5000,
    });
  };


  return (
    <div className="space-y-8">
      <div className="text-center relative group">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome to Our Store!</h1>
        <p className="mt-4 text-lg text-muted-foreground">Browse our collection of high-quality products.</p>
        <Button variant="outline" size="sm" className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditContent('Store Welcome Message')}>
            <Edit className="mr-2 h-3 w-3"/> Edit Welcome
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group relative">
              <Link href={`/b/${params.businessId}/products/${product.id}`} className="block">
                <div className="aspect-[4/3] relative w-full bg-muted">
                  <Image
                    src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint={product.dataAiHint || "product photo e-commerce"}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/E1E3E9/676A73?text=Image+Not+Found'; }}
                  />
                  {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                     <Badge variant="default" className="absolute top-2 right-2 bg-yellow-500 text-black">Low Stock</Badge>
                  )}
                </div>
              </Link>
              <CardContent className="p-4 flex-grow flex flex-col">
                <Link href={`/b/${params.businessId}/products/${product.id}`} className="hover:underline">
                  <h3 className="text-lg font-semibold text-foreground truncate" title={product.name}>{product.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">(123)</span>
                </div>
                <p className="text-xl font-bold text-primary mt-auto">₦{product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <Button className="w-full" onClick={() => handleAddToCart(product.name)}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
              </CardFooter>
               <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-7 w-7" onClick={() => handleEditContent(`Product: ${product.name}`)} title="Edit Product Details (Storefront)">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-muted rounded-lg">
          <Package className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h2 className="text-2xl font-semibold">No Products Available</h2>
          <p className="text-muted-foreground">This store is currently empty. Please check back later!</p>
        </div>
      )}
       <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">This e-commerce storefront is a Pro Feature of Zeneva.</p>
      </div>
    </div>
  );
}
