
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MinusCircle, Search, Package, ShoppingCart, ArrowLeft, Trash2, XCircle, Loader2, AlertTriangle, ShieldCheck, LayoutGrid, List, Grid3x3 } from 'lucide-react';
import { usePOS } from '@/context/pos-context';
import type { InventoryItem, POSCartItem } from '@/types';
import PageTitle from '@/components/shared/page-title';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { db, isPlaceholderConfig } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { mockInventoryItems } from '@/lib/data';
import StableImage from '@/components/shared/stable-image';

const ITEMS_PER_PAGE = 40;
type LayoutView = 'grid' | 'compact-grid' | 'list';

export default function SelectProductsPage() {
  const router = useRouter();
  const { cart, addItemToCart, updateItemQuantity, removeItemFromCart, subtotal, totalAmount, taxAmount, discountAmount, clearCart } = usePOS();
  const { toast } = useToast();
  const { currentBusiness, currentRole, currentBusinessId } = useAuth();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [layout, setLayout] = React.useState<LayoutView>('grid');

  const [allProducts, setAllProducts] = React.useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [isNavigatingToPayment, setIsNavigatingToPayment] = React.useState(false);
  const [isNavigatingToDashboard, setIsNavigatingToDashboard] = React.useState(false);

  const isTrialActive = currentBusiness?.trialEndsAt && new Date(currentBusiness.trialEndsAt) > new Date();
  const hasPaidSubscription = currentBusiness?.subscriptionTierId === 'pro' || currentBusiness?.subscriptionTierId === 'lifetime' || currentBusiness?.subscriptionTierId === 'enterprise';
  const hasAccessToPOS = currentRole === 'admin' || currentRole === 'manager';
  
  const canUsePOS = hasAccessToPOS && (isTrialActive || hasPaidSubscription);

  React.useEffect(() => {
    const fetchProducts = async () => {
        if (!currentBusinessId) return;
        setIsLoading(true);
        if (isPlaceholderConfig()) {
            console.warn("Firebase not configured, using mock product data for POS.");
            setAllProducts(mockInventoryItems);
        } else {
            try {
                const q = query(collection(db, "products"), where("businessId", "==", currentBusinessId), orderBy("name"));
                const querySnapshot = await getDocs(q);
                const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
                setAllProducts(products);
                if (products.length === 0) {
                     toast({
                        title: "No Products Found",
                        description: "Your inventory is empty. Please add products to start selling.",
                        variant: "destructive",
                        duration: 7000,
                    });
                     router.push('/inventory/add');
                }
            } catch (error) {
                console.error("Error fetching products for POS:", error);
                toast({ title: "Error Loading Products", description: "Could not fetch product data from the database.", variant: "destructive" });
            }
        }
        setIsLoading(false);
    };
    
    fetchProducts();
    
  }, [currentBusinessId, toast, router]);

  React.useEffect(() => {
    const savedLayout = localStorage.getItem('zeneva-pos-layout') as LayoutView;
    if (savedLayout && ['grid', 'compact-grid', 'list'].includes(savedLayout)) {
      setLayout(savedLayout);
    }
  }, []);

  const handleSetLayout = (newLayout: LayoutView) => {
    setLayout(newLayout);
    localStorage.setItem('zeneva-pos-layout', newLayout);
  };


  const [displayTaxRate, setDisplayTaxRate] = React.useState(7.5);

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddToCart = (product: InventoryItem) => {
    const cartItem = cart.find(item => item.itemId === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    if (product.stock <= 0) {
      toast({ variant: "destructive", title: "Out of Stock", description: `${product.name} is currently out of stock.` });
      return;
    }
    if (quantityInCart >= product.stock) {
       toast({ variant: "destructive", title: "Stock Limit Reached", description: `Cannot add more ${product.name}. Max stock available.` });
      return;
    }
    addItemToCart(product, 1);
  };

  const handleUpdateQuantity = (itemId: string, change: number) => {
    const cartItem = cart.find(item => item.itemId === itemId);
    if (!cartItem) return;

    const product = allProducts.find(p => p.id === itemId);
    if (!product) return;

    const newQuantity = cartItem.quantity + change;

    if (newQuantity <= 0) {
      removeItemFromCart(itemId);
      toast({ title: "Item Removed", description: `${cartItem.itemName} removed from cart.` });
    } else if (newQuantity > product.stock) {
      toast({ variant: "destructive", title: "Stock Limit Reached", description: `Only ${product.stock.toLocaleString()} units of ${cartItem.itemName} available.` });
      updateItemQuantity(itemId, product.stock);
    } else {
      updateItemQuantity(itemId, newQuantity);
    }
  };

  const handleQuantityInputChange = (itemId: string, value: string) => {
    const cartItem = cart.find(item => item.itemId === itemId);
    if (!cartItem) return;
    const product = allProducts.find(p => p.id === itemId);
    if (!product) return;

    if (value === "") {
      return;
    }

    const newQuantity = parseInt(value, 10);

    if (isNaN(newQuantity)) {
        return;
    }
    
    if (newQuantity <= 0) {
      updateItemQuantity(itemId, 1);
      toast({ title: "Minimum Quantity", description: `Quantity set to 1.` });
    } else if (newQuantity > product.stock) {
      updateItemQuantity(itemId, product.stock);
      toast({ variant: "destructive", title: "Stock Limit Reached", description: `Only ${product.stock.toLocaleString()} units of ${product.name} available. Quantity set to max.` });
    } else {
      updateItemQuantity(itemId, newQuantity);
    }
  };

  const handleQuantityInputBlur = (itemId: string, value: string) => {
    const cartItem = cart.find(item => item.itemId === itemId);
    if (!cartItem) return;
    const product = allProducts.find(p => p.id === itemId);
    if (!product) return;

    let newQuantity = parseInt(value, 10);

    if (isNaN(newQuantity) || newQuantity <= 0) {
      updateItemQuantity(itemId, 1); 
    } else if (newQuantity > product.stock) {
      updateItemQuantity(itemId, product.stock);
    }
  };


  const handleClearCart = () => {
    clearCart();
    toast({ title: "Cart Cleared", description: "All items have been removed from the cart." });
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      toast({ variant: "destructive", title: "Empty Cart", description: "Please add items to the cart to proceed." });
      return;
    }
    setIsNavigatingToPayment(true);
    router.push('/sales/pos/payment');
  };
  
  const handleDashboard = () => {
    setIsNavigatingToDashboard(true);
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Loading Products...</p>
            <p className="text-sm text-muted-foreground">Preparing your POS session.</p>
        </div>
    );
  }

  if (!hasAccessToPOS) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Access Restricted</h2>
            <p className="text-muted-foreground mt-2 max-w-md">Your user role does not have permission to access the Point of Sale system. Please contact your business administrator.</p>
            <Button onClick={handleDashboard} className="mt-6">Go to Dashboard</Button>
        </div>
    );
  }

  if (!canUsePOS) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <ShieldCheck className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold">Subscription Required</h2>
            <p className="text-muted-foreground mt-2 max-w-md">Your trial has ended or your subscription is inactive. Please upgrade your plan to continue using the Point of Sale system.</p>
            <Button onClick={() => router.push('/settings')} className="mt-6">
                Upgrade Your Plan
            </Button>
        </div>
    );
  }

  if (allProducts.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <Package className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <p className="text-lg font-medium">Your inventory is empty.</p>
            <p className="text-sm text-muted-foreground">Please add some products to start selling.</p>
            <Button asChild className="mt-4"><Link href="/inventory/add">Add Product</Link></Button>
        </div>
      );
  }


  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-var(--header-height,100px)-2rem)]">
      <Card className="flex-1 min-w-0 flex flex-col shadow-xl">
        <CardHeader>
          <PageTitle title="Point of Sale - Select Products" subtitle="Search and add products to the current sale.">
            <Button variant="outline" onClick={handleDashboard} size="sm" disabled={isNavigatingToPayment || isNavigatingToDashboard}>
               {isNavigatingToDashboard ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
               {isNavigatingToDashboard ? "Loading..." : "Dashboard"}
            </Button>
          </PageTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-background pl-8"
                data-ai-hint="pos product search"
              />
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                <Button variant={layout === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetLayout('grid')} className="h-8 w-8"><LayoutGrid className="h-4 w-4"/></Button>
                <Button variant={layout === 'compact-grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetLayout('compact-grid')} className="h-8 w-8"><Grid3x3 className="h-4 w-4"/></Button>
                <Button variant={layout === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => handleSetLayout('list')} className="h-8 w-8"><List className="h-4 w-4"/></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-full">
            {paginatedProducts.length > 0 ? (
              <div className={cn("p-4", 
                layout === 'grid' && "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
                layout === 'compact-grid' && "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3",
                layout === 'list' && "space-y-2"
              )}>
                {paginatedProducts.map(product => {
                    const inCartItem = cart.find(item => item.itemId === product.id);
                    const quantityInCart = inCartItem?.quantity ?? 0;
                    const isOutOfStock = product.stock <= 0;
                    const isMaxInCart = !isOutOfStock && quantityInCart >= product.stock;

                    if (layout === 'list') {
                        return (
                             <Card key={product.id} className="p-2 flex items-center gap-3">
                                <StableImage
                                    src={product.imageUrl} placeholder="https://placehold.co/64x64" alt={product.name}
                                    width={64} height={64} className="rounded-md object-cover border" data-ai-hint={product.dataAiHint || 'product photo'}
                                />
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                    <p className="text-xs text-muted-foreground">Stock: {product.stock.toLocaleString()}</p>
                                </div>
                                <p className="font-bold text-primary w-24 text-right">₦{product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                <Button className="w-32" onClick={() => handleAddToCart(product)} disabled={isOutOfStock || isMaxInCart}>
                                    <ShoppingCart className="mr-2 h-4 w-4" /> 
                                    {isOutOfStock ? "Out of Stock" : (isMaxInCart ? "Max in Cart" : "Add to Cart")}
                                </Button>
                            </Card>
                        )
                    }

                    return (
                      <Card key={product.id} className={cn("overflow-hidden flex flex-col", layout === 'compact-grid' ? 'shadow-sm' : 'shadow-lg')}>
                        <div className={cn("relative w-full bg-muted", layout === 'compact-grid' ? 'aspect-square' : 'aspect-video')}>
                          <StableImage
                            src={product.imageUrl}
                            placeholder={`https://placehold.co/${layout === 'compact-grid' ? '300x300' : '400x300'}`}
                            alt={product.name}
                            fill
                            className="object-cover"
                            data-ai-hint={product.dataAiHint || "product photo ecommerce"}
                          />
                           {isOutOfStock && <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>}
                           {product.stock > 0 && product.stock <= product.lowStockThreshold && <Badge variant="default" className="absolute top-2 right-2 bg-yellow-500 text-black">Low Stock</Badge>}
                        </div>
                        <CardContent className={cn("flex-grow flex flex-col", layout === 'compact-grid' ? 'p-2' : 'p-3')}>
                          <h3 className={cn("font-medium text-foreground", layout === 'compact-grid' ? 'text-xs truncate' : 'text-sm')} title={product.name}>{product.name}</h3>
                          <p className={cn("font-bold text-primary", layout === 'compact-grid' ? 'text-sm mt-0.5' : 'text-md mt-1')}>₦{product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </CardContent>
                        <CardFooter className={cn("border-t", layout === 'compact-grid' ? 'p-2' : 'p-3')}>
                          <Button
                            className="w-full" size={layout === 'compact-grid' ? 'sm' : 'default'}
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock || isMaxInCart}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" /> {isOutOfStock ? "Out" : (isMaxInCart ? "Max" : "Add")}
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <Package className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {allProducts.length > 0 && searchTerm ? "No products match your search." : "No products available."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {allProducts.length > 0 && searchTerm ? "Try adjusting your search term." : "Add products to your inventory to begin."}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="border-t p-4 flex justify-center items-center gap-2">
            <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </CardFooter>
        )}
      </Card>

      <Card className="lg:w-[400px] xl:w-[450px] 2xl:w-[500px] flex-shrink-0 flex flex-col shadow-xl h-full">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            Current Sale
            {cart.length > 0 && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleClearCart} title="Clear Cart">
                <XCircle className="h-5 w-5" />
              </Button>
            )}
          </CardTitle>
          <CardDescription>Items added to this transaction.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 opacity-50 mb-3" />
                <p>Your cart is empty.</p>
                <p className="text-xs">Add products from the list.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.itemId} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                    <StableImage
                      src={item.imageUrl}
                      placeholder="https://placehold.co/36x36"
                      alt={item.itemName}
                      width={36} height={36}
                      className="rounded object-cover border flex-shrink-0"
                      data-ai-hint="cart item image small"
                    />
                    <div className="flex-grow min-w-0 mx-1">
                      <p className="text-sm font-medium" title={item.itemName}>{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">₦{item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-0 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.itemId, -1)}><MinusCircle className="h-4 w-4" /></Button>
                       <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityInputChange(item.itemId, e.target.value)}
                        onBlur={(e) => handleQuantityInputBlur(item.itemId, e.target.value)}
                        className="w-12 h-8 text-center border-0 focus-visible:ring-0 bg-transparent p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label={`Quantity for ${item.itemName}`}
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantity(item.itemId, 1)}><PlusCircle className="h-4 w-4" /></Button>
                    </div>
                    <p className="text-sm font-semibold text-right min-w-[7rem] flex-shrink-0">₦{item.totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4 flex-col space-y-3">
          <div className="w-full space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span>₦{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-destructive"><span>Discount:</span><span>- ₦{discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>}
            <div className="flex justify-between"><span>Tax ({displayTaxRate.toFixed(1)}%):</span><span>₦{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>₦{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
          </div>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={handleDashboard} disabled={isNavigatingToPayment || isNavigatingToDashboard}>
                {isNavigatingToDashboard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                {isNavigatingToDashboard ? "Loading..." : "Cancel Sale"}
            </Button>
            <Button className="flex-1" onClick={handleProceedToPayment} disabled={cart.length === 0 || isNavigatingToPayment || isNavigatingToDashboard}>
                {isNavigatingToPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isNavigatingToPayment ? "Processing..." : "Proceed to Payment"} <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
