
// src/app/(store)/b/[businessId]/products/[id]/page.tsx
"use client";

import * as React from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import type { InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, ArrowLeft, Star, Minus, Plus, CheckCircle, AlertTriangle, Truck, Edit, Loader2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ businessId: string; id: string }>();
  const { toast } = useToast();
  
  const [product, setProduct] = React.useState<InventoryItem | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    if (!params.id || !params.businessId) {
        setIsLoading(false);
        notFound();
        return;
    }
    
    const fetchProductData = async () => {
        setIsLoading(true);
        try {
            const productRef = doc(db, 'products', params.id);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists() && productSnap.data().businessId === params.businessId) {
                const fetchedProduct = { id: productSnap.id, ...productSnap.data() } as InventoryItem;
                setProduct(fetchedProduct);
                
                // Fetch related products
                const relatedQuery = query(
                    collection(db, 'products'),
                    where('businessId', '==', params.businessId),
                    where('category', '==', fetchedProduct.category),
                    where('stock', '>', 0)
                );
                const relatedSnap = await getDocs(relatedQuery);
                const fetchedRelated = relatedSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem))
                    .filter(p => p.id !== fetchedProduct.id)
                    .slice(0, 4);
                setRelatedProducts(fetchedRelated);
            } else {
                notFound();
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load product details.' });
            notFound();
        } finally {
            setIsLoading(false);
        }
    };

    fetchProductData();
  }, [params.id, params.businessId, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="h-16 w-16 animate-spin text-primary"/></div>;
  }
  
  if (!product) {
    return notFound(); 
  }

  const handleAddToCart = () => {
    if (!product) return;
    toast({
      title: "Added to Cart (Simulated)",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (product && quantity >= product.stock) {
        toast({ variant: "destructive", title: "Stock Limit Reached", description: `Only ${product.stock.toLocaleString()} units available.`});
    }
  };
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  
  const handleEditContent = (section: string) => {
    toast({
        title: "Edit Content (Planned)",
        description: `Content editing for '${section}' is a planned Pro feature for business owners.`,
        duration: 5000,
    });
  };

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      {product && (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 relative group">
            <div className="aspect-square relative w-full bg-muted rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.imageUrl || "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop"}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.dataAiHint || "product detail large"}
                priority
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/E1E3E9/676A73?text=Image+Not+Found'; }}
              />
               <Button variant="outline" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => handleEditContent('Product Images')}>
                <Edit className="mr-2 h-3 w-3"/> Edit Images
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,0].map(i => (
                <div key={i} className="aspect-square bg-muted rounded">
                    <Image src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop&ixid=${i}`} alt={`Thumbnail ${i+1}`} width={100} height={100} className="object-cover rounded" data-ai-hint="product thumbnail"/>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 relative group">
             <Button variant="outline" size="sm" className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => handleEditContent('Product Main Details (Name, Price, etc.)')}>
                <Edit className="mr-2 h-3 w-3"/> Edit Details
            </Button>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
            
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">(123 reviews)</span>
                <Separator orientation="vertical" className="h-4 mx-3" />
                <Link href="#" className="text-sm text-primary hover:underline">Write a review</Link>
            </div>

            <p className="text-3xl font-semibold text-primary">₦{product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            
            {product.description && (
              <div className="text-muted-foreground space-y-2 relative group/desc">
                <h2 className="text-lg font-semibold text-foreground">Description</h2>
                <p className="text-sm leading-relaxed">{product.description}</p>
                 <Button variant="link" size="xs" className="absolute top-0 right-0 opacity-0 group-hover/desc:opacity-100 transition-opacity text-xs p-0 h-auto" onClick={() => handleEditContent('Product Description')}>
                    <Edit className="mr-1 h-3 w-3"/> Edit
                </Button>
              </div>
            )}

            <div className="space-y-2">
                 {product.stock > 0 ? (
                    product.stock <= product.lowStockThreshold ? (
                        <Badge variant="default" className="bg-yellow-500 text-black flex items-center gap-1.5 w-fit">
                            <AlertTriangle className="h-4 w-4" /> Low Stock ({product.stock.toLocaleString()} left)
                        </Badge>
                    ) : (
                         <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1.5 w-fit">
                            <CheckCircle className="h-4 w-4" /> In Stock
                        </Badge>
                    )
                ) : (
                     <Badge variant="destructive" className="flex items-center gap-1.5 w-fit">
                        <AlertTriangle className="h-4 w-4" /> Out of Stock
                    </Badge>
                )}
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                <p className="text-xs text-muted-foreground">Category: {product.category}</p>
            </div>


            <div className="flex items-center gap-4">
              <Label htmlFor="quantity" className="text-sm font-medium">Quantity:</Label>
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={decrementQuantity} className="h-9 w-9" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </Button>
                <Input 
                    id="quantity"
                    type="number" 
                    value={quantity} 
                    readOnly 
                    className="w-12 h-9 text-center border-0 focus-visible:ring-0 bg-transparent"
                    aria-label="Current quantity"
                />
                <Button variant="ghost" size="icon" onClick={incrementQuantity} className="h-9 w-9" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button 
                size="lg" 
                className="w-full" 
                onClick={handleAddToCart} 
                disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            <Card className="mt-6 bg-muted/50">
                <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Truck className="h-5 w-5 text-primary"/>
                        <span>Estimated Delivery: 3-5 business days</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-5 w-5 text-green-600"/>
                        <span>Easy Returns & Exchanges</span>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold tracking-tight mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <Link href={`/b/${params.businessId}/products/${relatedProduct.id}`} className="block">
                    <div className="aspect-[4/3] relative w-full bg-muted">
                    <Image
                        src={relatedProduct.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                        data-ai-hint={relatedProduct.dataAiHint || "product photo related"}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x225/E1E3E9/676A73?text=No+Img'; }}
                    />
                    </div>
                    <CardContent className="p-3">
                    <h3 className="text-sm font-semibold text-foreground truncate" title={relatedProduct.name}>{relatedProduct.name}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{relatedProduct.category}</p>
                    <p className="text-md font-bold text-primary">₦{relatedProduct.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </CardContent>
                </Link>
                </Card>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}
