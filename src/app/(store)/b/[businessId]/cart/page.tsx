// src/app/(store)/b/[businessId]/cart/page.tsx
"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Minus, Plus, ArrowLeft, CreditCard, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  sku: string;
}

const initialCartItems: CartItem[] = [
  { id: "item-001", name: "Premium Wireless Mouse", price: 7500, quantity: 1, imageUrl: "https://images.unsplash.com/photo-1527814050087-379381547922?q=80&w=64&auto=format&fit=crop", sku: "WM-PREM-001" },
  { id: "item-008", name: "Bluetooth Headphones", price: 12500, quantity: 2, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=64&auto=format&fit=crop", sku: "HP-BT-002" },
];

interface CartPageProps {
  params: {
    businessId: string;
  };
}

export default function CartPage({ params }: CartPageProps) {
  const [cartItems, setCartItems] = React.useState<CartItem[]>(initialCartItems);
  const { toast } = useToast();

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: `${cartItems.find(item => item.id === itemId)?.name} removed from cart.`,
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingEstimate = cartItems.length > 0 ? 1500 : 0;
  const taxEstimate = subtotal * 0.075;
  const total = subtotal + shippingEstimate + taxEstimate;

  const handleCheckout = () => {
    toast({
        title: "Proceeding to Checkout (Simulated)",
        description: "You would now be redirected to a secure payment page.",
        duration: 5000,
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Your Shopping Cart</h1>
        <Button variant="outline" asChild>
          <Link href={`/b/${params.businessId}/products`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
          </Link>
        </Button>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center w-[120px]">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right w-[50px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Image
                            src={item.imageUrl || "https://placehold.co/64x64.png"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover border"
                            data-ai-hint="product item small cart"
                          />
                        </TableCell>
                        <TableCell>
                          <Link href={`/b/${params.businessId}/products/${item.id}`} className="font-medium hover:underline">{item.name}</Link>
                          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center border rounded-md w-[100px] mx-auto">
                            <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8">
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input type="number" value={item.quantity} readOnly className="w-10 h-8 text-center border-0 focus-visible:ring-0 bg-transparent p-0" />
                            <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-8 w-8">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">₦{(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive" aria-label="Remove item">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping (Estimated)</span>
                  <span>₦{shippingEstimate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes (Estimated)</span>
                  <span>₦{taxEstimate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₦{total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full" onClick={handleCheckout}>
                  <CreditCard className="mr-2 h-5 w-5" /> Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Discount Code</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <Input placeholder="Enter discount code" data-ai-hint="discount code input"/>
                    <Button variant="outline">Apply</Button>
                </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-muted rounded-lg">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any products yet.</p>
          <Button size="lg" asChild>
            <Link href={`/b/${params.businessId}/products`}>Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}