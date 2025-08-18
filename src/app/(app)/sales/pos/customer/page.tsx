
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus, ArrowLeft, CheckCircle, Search, Loader2, ShoppingCart } from 'lucide-react';
import { usePOS } from '@/context/pos-context';
import type { Customer } from '@/types';
import PageTitle from '@/components/shared/page-title';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';


export default function SelectCustomerPage() {
  const router = useRouter();
  const { selectedCustomer, selectCustomer, cart } = usePOS();
  const { toast } = useToast();
  const { currentBusinessId } = useAuth();

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = React.useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = React.useState(false);
  
  const [newCustomerName, setNewCustomerName] = React.useState("");
  const [newCustomerEmail, setNewCustomerEmail] = React.useState("");
  const [newCustomerPhone, setNewCustomerPhone] = React.useState("");

  const [isRedirecting, setIsRedirecting] = React.useState(false);
  
  const [isNavigatingToReview, setIsNavigatingToReview] = React.useState(false);
  const [isSkippingCustomer, setIsSkippingCustomer] = React.useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = React.useState(false);


  React.useEffect(() => {
    if (cart.length === 0 && typeof window !== 'undefined') {
      if (!isRedirecting) {
        setIsRedirecting(true);
        console.log("CustomerPage: Cart empty, redirecting to select-products.");
        router.replace('/sales/pos/select-products');
      }
    } else if (cart.length > 0 && isRedirecting) {
        setIsRedirecting(false); 
    }
  }, [cart, router, isRedirecting]);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      if (!currentBusinessId) return;
      setIsLoading(true);
      try {
        const q = query(collection(db, "customers"), where("businessId", "==", currentBusinessId), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const fetchedCustomers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(fetchedCustomers);
        setFilteredCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load customer data.'});
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [currentBusinessId, toast]);


  React.useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredCustomers(
      customers.filter(customer =>
        customer.name.toLowerCase().includes(lowerSearchTerm) ||
        customer.email.toLowerCase().includes(lowerSearchTerm) ||
        (customer.phone && customer.phone.includes(searchTerm))
      )
    );
  }, [searchTerm, customers]);

  const handleSelectCustomer = (customer: Customer) => {
    selectCustomer(customer);
  };

  const handleSkipAndProceed = () => {
    selectCustomer(null); 
    setIsSkippingCustomer(true);
    console.log("CustomerPage: Skip customer, navigating to review.");
    router.push('/sales/pos/review');
  };

  const handleAddNewCustomerSubmit = async () => {
    if (!newCustomerName || !newCustomerEmail) {
      toast({ variant: "destructive", title: "Validation Error", description: "Name and Email are required for new customer."});
      return;
    }
    if (!currentBusinessId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Business ID not found.'});
        return;
    }
    setIsSavingCustomer(true);
    
    try {
        const newCustomerData = {
          name: newCustomerName,
          email: newCustomerEmail,
          phone: newCustomerPhone,
          businessId: currentBusinessId,
          totalSpent: 0,
          status: "New",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "customers"), newCustomerData);
        
        const newCustomerForState: Customer = {
          id: docRef.id,
          ...newCustomerData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setCustomers(prev => [newCustomerForState, ...prev]); 
        selectCustomer(newCustomerForState); 
        toast({ title: "Customer Added & Selected", description: `${newCustomerName} added and selected.` });
        
        setIsAddCustomerModalOpen(false);
        setNewCustomerName("");
        setNewCustomerEmail("");
        setNewCustomerPhone("");
    } catch(error) {
         toast({ variant: 'destructive', title: 'Error', description: 'Failed to add new customer.'});
         console.error("Error adding customer:", error);
    } finally {
        setIsSavingCustomer(false);
    }
  };

  const handleProceedToReview = () => {
    setIsNavigatingToReview(true);
    console.log("CustomerPage: Next button clicked, navigating to review.");
    router.push('/sales/pos/review');
  };

  const handleBack = () => {
    setIsNavigatingBack(true);
    console.log("CustomerPage: Back button clicked.");
    router.back();
  };
  
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Your cart is empty.</p>
        <p className="text-sm text-muted-foreground">Redirecting to product selection...</p>
        <Loader2 className="w-8 h-8 text-primary animate-spin mt-4" />
      </div>
    );
  }
  if (cart.length === 0 && typeof window !== 'undefined') {
     return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Initializing POS session...</p>
        </div>
     );
  }


  return (
    <div className="space-y-6">
      <PageTitle title="Select Customer (Optional)" subtitle="Assign this sale to an existing customer or add a new one.">
        <Button variant="outline" onClick={handleBack} size="sm" disabled={isNavigatingBack || isNavigatingToReview || isSkippingCustomer}>
          {isNavigatingBack ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
          {isNavigatingBack ? "Loading..." : "Back"}
        </Button>
      </PageTitle>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Customer Association</CardTitle>
          <CardDescription>You can link this sale to a customer for tracking purposes, or proceed as a walk-in.</CardDescription>
           <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background pl-8"
                    data-ai-hint="pos customer search"
                />
            </div>
            <Button variant="outline" onClick={() => setIsAddCustomerModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
          ) : filteredCustomers.length > 0 ? (
            <ScrollArea className="h-[400px] border rounded-md">
              <div className="p-2 space-y-2">
                {filteredCustomers.map(customer => (
                  <Card 
                    key={customer.id} 
                    className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email} {customer.phone && `| ${customer.phone}`}</p>
                        </div>
                        {selectedCustomer?.id === customer.id && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
              <p className="font-medium">No customers found matching "{searchTerm}".</p>
              <p className="text-sm text-muted-foreground">Try a different search or add a new customer.</p>
            </div>
          )}
        </CardContent>
         <CardFooter className="border-t p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
           <div className="text-sm text-muted-foreground">
            Selected Customer: <span className="font-semibold text-primary">{selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}</span>
           </div>
           <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-initial" onClick={handleBack} disabled={isNavigatingBack || isNavigatingToReview || isSkippingCustomer}>
                {isNavigatingBack ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                {isNavigatingBack ? "Loading..." : "Back"}
            </Button>
            <Button onClick={handleProceedToReview} className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700" disabled={isNavigatingBack || isNavigatingToReview || isSkippingCustomer}>
                {isNavigatingToReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isNavigatingToReview ? "Processing..." : "Proceed to Review"} <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
           </div>
        </CardFooter>
         <div className="p-4 text-center">
             <Button variant="link" onClick={handleSkipAndProceed} disabled={isNavigatingBack || isNavigatingToReview || isSkippingCustomer}>
                {isSkippingCustomer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSkippingCustomer ? "Processing..." : "Proceed as Walk-in Customer (Skip Selection)"}
            </Button>
        </div>
      </Card>

      <Dialog open={isAddCustomerModalOpen} onOpenChange={setIsAddCustomerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter details for the new customer. They will be selected for the current sale.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="newCustomerName">Full Name *</Label>
              <Input id="newCustomerName" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="John Doe" data-ai-hint="customer name input" disabled={isSavingCustomer}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="newCustomerEmail">Email *</Label>
              <Input id="newCustomerEmail" type="email" value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} placeholder="john.doe@example.com" data-ai-hint="email input" disabled={isSavingCustomer}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="newCustomerPhone">Phone (Optional)</Label>
              <Input id="newCustomerPhone" type="tel" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="+234801234567" data-ai-hint="phone number input" disabled={isSavingCustomer}/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isSavingCustomer}>Cancel</Button></DialogClose>
            <Button onClick={handleAddNewCustomerSubmit} disabled={isSavingCustomer}>
                {isSavingCustomer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSavingCustomer ? "Adding..." : "Add and Select Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
