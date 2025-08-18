
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Percent, PlusCircle, CalendarDays, Tag, Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Discount } from '@/types';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore";

const newDiscountDefault: Omit<Discount, 'id' | 'createdAt' | 'businessId'> = {
  name: "",
  type: 'Percentage',
  value: 0,
  appliesTo: "All Products",
  status: 'Active',
};


export default function DiscountPage() {
  const [discounts, setDiscounts] = React.useState<Discount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = React.useState(false);
  const [editingDiscount, setEditingDiscount] = React.useState<Partial<Discount> | null>(null);

  const { toast } = useToast();
  const { currentBusinessId } = useAuth();


  React.useEffect(() => {
    if (!currentBusinessId) {
      setIsLoading(false);
      return;
    }

    const fetchDiscounts = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "discounts"), where("businessId", "==", currentBusinessId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedDiscounts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discount));
        setDiscounts(fetchedDiscounts);
      } catch (error) {
        console.error("Error fetching discounts:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch discounts from the database." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscounts();
  }, [currentBusinessId, toast]);

  const handleOpenAddModal = () => {
    setEditingDiscount(newDiscountDefault);
    setIsAddEditModalOpen(true);
  };

  const handleAddEditSubmit = async () => {
    if (!editingDiscount || !editingDiscount.name || editingDiscount.value === undefined) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and value are required." });
      return;
    }
    if (!currentBusinessId) {
      toast({ variant: "destructive", title: "Error", description: "No active business selected." });
      return;
    }

    setIsSaving(true);
    
    try {
        const discountData = {
            ...editingDiscount,
            value: Number(editingDiscount.value) || 0,
            businessId: currentBusinessId,
            updatedAt: serverTimestamp(),
        };

        if (editingDiscount.id) {
            // Update logic would go here
            console.log("Updating discount (not implemented in this mock):", discountData);
        } else {
            const docRef = await addDoc(collection(db, "discounts"), {
                ...discountData,
                createdAt: serverTimestamp(),
            });
            // Refetch or optimistically update
            const newDiscountWithId = { ...discountData, id: docRef.id, createdAt: new Date().toISOString() } as Discount;
            setDiscounts(prev => [newDiscountWithId, ...prev]);
            toast({ title: "Discount Created", description: `${newDiscountWithId.name} has been added.` });
        }
        setIsAddEditModalOpen(false);
        setEditingDiscount(null);
    } catch (error) {
        console.error("Error saving discount:", error);
        toast({ variant: "destructive", title: "Save Failed", description: `Could not save discount: ${(error as Error).message}`});
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Discounts & Promotions" subtitle="Create and manage special offers for your customers.">
         <Button onClick={handleOpenAddModal}>
           <PlusCircle className="mr-2 h-4 w-4" />
            Create New Discount
        </Button>
      </PageTitle>

      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingDiscount?.id ? "Edit Discount" : "Create New Discount"}</DialogTitle>
                  <DialogDescription>
                    {editingDiscount?.id ? "Update discount details." : "Define a new discount or promotion."}
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-1">
                      <Label htmlFor="discountName">Discount Name</Label>
                      <Input id="discountName" value={editingDiscount?.name || ""} onChange={(e) => setEditingDiscount(p => ({...p!, name: e.target.value}))} placeholder="e.g., Weekend Bonanza" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="discountType">Discount Type</Label>
                        <Select value={editingDiscount?.type || "Percentage"} onValueChange={(v) => setEditingDiscount(p => ({...p!, type: v as 'Percentage' | 'Fixed Amount'}))}>
                            <SelectTrigger id="discountType"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Percentage">Percentage (%)</SelectItem>
                                <SelectItem value="Fixed Amount">Fixed Amount (₦)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="discountValue">Value</Label>
                        <Input id="discountValue" type="number" value={editingDiscount?.value || 0} onChange={(e) => setEditingDiscount(p => ({...p!, value: parseFloat(e.target.value) || 0}))} />
                    </div>
                  </div>
                   <div className="space-y-1">
                        <Label htmlFor="appliesTo">Applies To</Label>
                        <Input id="appliesTo" value={editingDiscount?.appliesTo || "All Products"} onChange={(e) => setEditingDiscount(p => ({...p!, appliesTo: e.target.value}))} placeholder="e.g., All Products, Category: Electronics" />
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
                  <Button onClick={handleAddEditSubmit} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                      {isSaving ? "Saving..." : "Save Discount"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>


      <Card>
        <CardHeader>
          <CardTitle>Discount Management</CardTitle>
          <CardDescription>
            Boost sales and attract customers by creating flexible discounts. You can set up percentage-based discounts, fixed amount reductions, 
            apply them to specific products or categories, or define them for entire sales during promotional periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10"><Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" /></div>
          ) : discounts.length > 0 ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search discounts by name or type..." className="w-full md:w-1/2 p-2 border rounded-md bg-background"/>
              </div>
              <div className="space-y-3">
                {discounts.map(discount => (
                  <Card key={discount.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h4 className="font-semibold text-foreground">{discount.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {discount.type}: {discount.type === 'Percentage' ? `${discount.value}%` : `₦${discount.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} off
                        </p>
                        <p className="text-xs text-muted-foreground">Applies to: {discount.appliesTo}</p>
                        {discount.startDate && discount.endDate && (
                          <p className="text-xs text-muted-foreground">
                            Period: {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Badge 
                          variant={discount.status === 'Active' ? 'secondary' : discount.status === 'Scheduled' ? 'outline' : 'destructive'}
                          className={discount.status === 'Active' ? 'bg-green-100 text-green-700 border-green-300' : discount.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
                        >
                          {discount.status}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => alert(`Edit ${discount.name}`)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => alert(`Delete ${discount.name}`)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <Percent className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Discounts Created Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Incentivize purchases and clear stock by setting up various types of discounts. 
                Effective promotions can significantly impact your sales volume.
              </p>
              <Button onClick={handleOpenAddModal}>
                Create Your First Discount
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/> Scheduled Promotions</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Plan your sales events by setting start and end dates for your discounts. (Functionality Planned)</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary"/> Coupon Codes</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Generate unique or generic coupon codes that customers can apply at checkout. (Functionality Planned)</p>
            </CardContent>
        </Card>
      </div>
       <Card className="mt-4">
        <CardHeader>
            <CardTitle>Tips for Effective Discounting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Define Clear Goals:</strong> Are you trying to increase sales volume, attract new customers, or clear old stock?</p>
            <p><strong>Target Wisely:</strong> Apply discounts to specific products, categories, or customer segments for better results.</p>
            <p><strong>Communicate Clearly:</strong> Make sure your customers know about your promotions.</p>
            <p><strong>Track Performance:</strong> Monitor how your discounts are impacting sales and profitability.</p>
        </CardContent>
      </Card>
    </div>
  );
}
