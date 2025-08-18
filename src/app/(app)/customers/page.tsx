
"use client"; 

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, UserPlus, BarChart3, Mail, Heart, Search, Filter, FileText, PhoneCall, Users2, MoreVertical, Trash2, Edit, MessageSquare, HomeIcon, Info, CalendarIcon, Tag, Coins, UserCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Customer } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDocs, query, orderBy, where } from "firebase/firestore";
import { useAuth } from '@/context/auth-context';

const newCustomerDefault: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'businessId'> = {
  name: "", email: "", phone: "", whatsappNumber: "", address: "", notes: "", totalSpent: 0, status: "New", customerSince: new Date().toISOString().split('T')[0], purchaseCount: 0, tags: [], loyaltyPoints: 0,
};

export default function CustomersPage() {
  const { currentBusinessId } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = React.useState<Customer[]>([]); 
  const [filteredCustomers, setFilteredCustomers] = React.useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = React.useState(true);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = React.useState<Partial<Customer> | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const [statusFilter, setStatusFilter] = React.useState<Customer['status'] | 'all'>('all');
  const [whatsAppFilter, setWhatsAppFilter] = React.useState<'all' | 'yes' | 'no'>('all');
  const [loyaltyFilter, setLoyaltyFilter] = React.useState<'all' | 'yes' | 'no'>('all');
  const [isSavingCustomer, setIsSavingCustomer] = React.useState(false);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      if (!currentBusinessId) {
        setIsLoadingCustomers(false);
        return;
      }
      setIsLoadingCustomers(true);
      try {
        const q = query(collection(db, "customers"), where("businessId", "==", currentBusinessId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedCustomers: Customer[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedCustomers.push({ 
              id: doc.id, 
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          } as Customer);
        });
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Error fetching customers from Firestore:", error);
        toast({ variant: "destructive", title: "Error Fetching Customers", description: "Could not load customers. Please check your connection." });
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, [currentBusinessId, toast]);


  React.useEffect(() => {
    let tempCustomers = [...customers];
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempCustomers = tempCustomers.filter(customer =>
        customer.name.toLowerCase().includes(lowerSearchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(lowerSearchTerm)) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.tags && customer.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
      );
    }
    
    if (statusFilter !== 'all') {
      tempCustomers = tempCustomers.filter(c => c.status === statusFilter);
    }
    if (whatsAppFilter !== 'all') {
      tempCustomers = tempCustomers.filter(c => whatsAppFilter === 'yes' ? !!c.whatsappNumber : !c.whatsappNumber);
    }
    if (loyaltyFilter !== 'all') {
      tempCustomers = tempCustomers.filter(c => loyaltyFilter === 'yes' ? (c.loyaltyPoints || 0) > 0 : (c.loyaltyPoints || 0) === 0);
    }

    setFilteredCustomers(tempCustomers);
  }, [searchTerm, customers, statusFilter, whatsAppFilter, loyaltyFilter]);

  const handleOpenAddModal = () => {
    setEditingCustomer(newCustomerDefault);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer({ ...customer, tags: customer.tags ? [...customer.tags] : [] });
    setIsAddEditModalOpen(true);
  };

  const handleOpenViewModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };
  
  const handleOpenDeleteAlert = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteAlertOpen(true);
  };

  const handleAddEditCustomerSubmit = async () => {
    if (!editingCustomer || !editingCustomer.name || !editingCustomer.email) {
        toast({ variant: "destructive", title: "Validation Error", description: "Name and Email are required."});
        return;
    }
    if (!currentBusinessId) {
        toast({ variant: "destructive", title: "Error", description: "No active business found."});
        return;
    }
    setIsSavingCustomer(true);

    const customerDataToSave = {
        ...newCustomerDefault,
        name: editingCustomer.name!,
        email: editingCustomer.email!,
        phone: editingCustomer.phone || "",
        whatsappNumber: editingCustomer.whatsappNumber || "",
        address: editingCustomer.address || "",
        notes: editingCustomer.notes || "",
        totalSpent: Number(editingCustomer.totalSpent || 0),
        status: editingCustomer.status || 'New',
        customerSince: editingCustomer.customerSince || new Date().toISOString().split('T')[0],
        purchaseCount: Number(editingCustomer.purchaseCount || 0),
        tags: Array.isArray(editingCustomer.tags) ? editingCustomer.tags : ((editingCustomer.tags as unknown as string || "").split(',').map(t => t.trim()).filter(t => t)),
        loyaltyPoints: Number(editingCustomer.loyaltyPoints || 0),
        updatedAt: serverTimestamp(),
        businessId: currentBusinessId,
    };
    
    if (editingCustomer.id) { 
      try {
        const customerRef = doc(db, "customers", editingCustomer.id);
        await updateDoc(customerRef, customerDataToSave);
        setCustomers(prev => prev.map(c => c.id === editingCustomer!.id ? { ...c, ...customerDataToSave, id: editingCustomer!.id } as Customer : c));
        toast({ variant: "success", title: "Customer Updated", description: `${editingCustomer.name}'s details updated in Firestore.` });
      } catch (error) {
        console.error("Error updating customer in Firestore:", error);
        toast({ variant: "destructive", title: "Update Failed", description: "Could not update customer in Firestore."});
      }
    } else { 
      try {
        const docRef = await addDoc(collection(db, "customers"), {
            ...customerDataToSave,
            createdAt: serverTimestamp(),
        });
        const newDbCustomer: Customer = { ...customerDataToSave, id: docRef.id, createdAt: new Date().toISOString() } as Customer;
        setCustomers(prev => [newDbCustomer, ...prev]);
        toast({ variant: "success", title: "Customer Added", description: `${customerDataToSave.name} added to Firestore.` });
      } catch (error) {
        console.error("Error adding customer to Firestore:", error);
        toast({ variant: "destructive", title: "Add Failed", description: "Could not add customer to Firestore."});
      }
    }
    setIsAddEditModalOpen(false);
    setEditingCustomer(null);
    setIsSavingCustomer(false);
  };

  const handleDeleteCustomer = async () => {
    if (selectedCustomer) {
      try {
        await deleteDoc(doc(db, "customers", selectedCustomer.id));
        setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
        toast({ variant: "destructive", title: "Customer Deleted", description: `${selectedCustomer.name} removed from Firestore.` });
      } catch (error) {
        console.error("Error deleting customer from Firestore:", error);
        toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete customer from Firestore."});
      }
    }
    setIsDeleteAlertOpen(false);
    setSelectedCustomer(null);
  };
  
  const parseTags = (tagsString: string | undefined): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  const formatTags = (tagsArray: string[] | undefined): string => {
    if (!tagsArray) return "";
    return tagsArray.join(', ');
  };


  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Customer Relationship Management (CRM)" subtitle="Build and nurture lasting relationships with your valued customers.">
        <Button onClick={handleOpenAddModal}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Customer
        </Button>
      </PageTitle>

      <Dialog open={isAddEditModalOpen} onOpenChange={(isOpen) => {
          setIsAddEditModalOpen(isOpen);
          if (!isOpen) setEditingCustomer(null);
      }}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>{editingCustomer?.id ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                  <DialogDescription>
                      {editingCustomer?.id ? "Update the customer's details below." : "Enter the details for the new customer."}
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-3">
                  <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name</Label>
                      <Input id="customerName" placeholder="e.g., John Doe" value={editingCustomer?.name || ""} onChange={e => setEditingCustomer(prev => ({...prev!, name: e.target.value}))} data-ai-hint="customer name input"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email Address</Label>
                      <Input id="customerEmail" type="email" placeholder="e.g., john.doe@example.com" value={editingCustomer?.email || ""} onChange={e => setEditingCustomer(prev => ({...prev!, email: e.target.value}))} data-ai-hint="email input"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone Number</Label>
                      <Input id="customerPhone" type="tel" placeholder="e.g., +2348012345678" value={editingCustomer?.phone || ""} onChange={e => setEditingCustomer(prev => ({...prev!, phone: e.target.value}))} data-ai-hint="phone number input"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="customerWhatsApp">WhatsApp Number (Optional)</Label>
                      <Input id="customerWhatsApp" type="tel" placeholder="e.g., 2348012345678 (no +)" value={editingCustomer?.whatsappNumber || ""} onChange={e => setEditingCustomer(prev => ({...prev!, whatsappNumber: e.target.value}))} data-ai-hint="whatsapp number input"/>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="customerAddress">Address (Optional)</Label>
                      <Textarea id="customerAddress" placeholder="Enter customer's address" value={editingCustomer?.address || ""} onChange={e => setEditingCustomer(prev => ({...prev!, address: e.target.value}))} data-ai-hint="address input text area"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="customerSince">Customer Since (Optional)</Label>
                      <Input id="customerSince" type="text" placeholder="YYYY-MM-DD or descriptive" value={editingCustomer?.customerSince || ""} onChange={e => setEditingCustomer(prev => ({...prev!, customerSince: e.target.value}))} data-ai-hint="date string input"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="customerStatus">Status</Label>
                      <select id="customerStatus" value={editingCustomer?.status || "New"} onChange={e => setEditingCustomer(prev => ({...prev!, status: e.target.value as Customer['status']}))} className="w-full p-2 border rounded-md bg-background">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="New">New</option>
                      </select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="customerTags">Tags (comma-separated, optional)</Label>
                      <Input id="customerTags" placeholder="e.g., VIP, Frequent Buyer" value={formatTags(editingCustomer?.tags)} onChange={e => setEditingCustomer(prev => ({...prev!, tags: parseTags(e.target.value)}))} data-ai-hint="tags input"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="customerLoyalty">Loyalty Points (Optional)</Label>
                      <Input id="customerLoyalty" type="number" placeholder="0" value={editingCustomer?.loyaltyPoints || 0} onChange={e => setEditingCustomer(prev => ({...prev!, loyaltyPoints: parseInt(e.target.value) || 0 }))} data-ai-hint="number input"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="customerNotes">Notes (Optional)</Label>
                      <Textarea id="customerNotes" placeholder="Any additional notes about the customer" value={editingCustomer?.notes || ""} onChange={e => setEditingCustomer(prev => ({...prev!, notes: e.target.value}))} data-ai-hint="notes input text area"/>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline" disabled={isSavingCustomer}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddEditCustomerSubmit} disabled={isSavingCustomer}>
                    {isSavingCustomer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSavingCustomer ? "Saving..." : "Save Customer"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {selectedCustomer && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><UserCircle className="h-6 w-6 text-primary"/> {selectedCustomer.name}</DialogTitle>
                    <DialogDescription>Customer Profile Details</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4 max-h-[70vh] overflow-y-auto pr-3 text-sm">
                    <div className="flex justify-between"><span><strong>Email:</strong></span> <span>{selectedCustomer.email}</span></div>
                    {selectedCustomer.phone && <div className="flex justify-between"><span><strong>Phone:</strong></span> <span>{selectedCustomer.phone}</span></div>}
                    {selectedCustomer.whatsappNumber && <div className="flex justify-between"><span><strong>WhatsApp:</strong></span> <a href={`https://wa.me/${selectedCustomer.whatsappNumber.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><MessageSquare size={14}/> {selectedCustomer.whatsappNumber}</a></div>}
                    {selectedCustomer.address && <div className="flex justify-between"><span><strong>Address:</strong></span> <span className="text-right">{selectedCustomer.address}</span></div>}
                    <Separator />
                    <div className="flex justify-between"><span><strong>Status:</strong></span> <Badge variant={selectedCustomer.status === 'Active' ? 'secondary' : selectedCustomer.status === 'New' ? 'outline' : 'destructive'} className={selectedCustomer.status === 'Active' ? 'bg-green-100 text-green-700 border-green-300' : ''}>{selectedCustomer.status}</Badge></div>
                    {selectedCustomer.customerSince && <div className="flex justify-between"><span><strong>Customer Since:</strong></span> <span>{selectedCustomer.customerSince}</span></div>}
                    <div className="flex justify-between"><span><strong>Total Spent:</strong></span> <span>₦{selectedCustomer.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                    {selectedCustomer.lastPurchase && <div className="flex justify-between"><span><strong>Last Purchase:</strong></span> <span>{new Date(selectedCustomer.lastPurchase).toLocaleDateString()}</span></div>}
                    <div className="flex justify-between"><span><strong>Purchase Count:</strong></span> <span>{selectedCustomer.purchaseCount || 0}</span></div>
                    <div className="flex justify-between"><span><strong>Loyalty Points:</strong></span> <span>{selectedCustomer.loyaltyPoints || 0}</span></div>
                    {selectedCustomer.tags && selectedCustomer.tags.length > 0 && (
                        <div>
                            <strong>Tags:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {selectedCustomer.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                        </div>
                    )}
                    {selectedCustomer.notes && <Separator />}
                    {selectedCustomer.notes && <div><strong>Notes:</strong><p className="text-muted-foreground whitespace-pre-wrap">{selectedCustomer.notes}</p></div>}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button>Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedCustomer?.name}'s record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCustomer(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-destructive hover:bg-destructive/90">Delete Customer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users2 className="h-6 w-6 text-primary" /> Your Customer Database</CardTitle>
          <CardDescription>
            Maintain a comprehensive database of your customers. Track purchase history, manage contact information, and gain insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Search customers by name, email, phone, or tag..." 
                        className="w-full bg-background pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-ai-hint="customer search input"
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                            <Filter className="mr-2 h-4 w-4"/> Filter Customers
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Status</Label>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Customer['status'] | 'all')} className="w-full p-2 border rounded-md bg-background text-sm">
                                <option value="all">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="New">New</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Has WhatsApp</Label>
                            <select value={whatsAppFilter} onChange={e => setWhatsAppFilter(e.target.value as 'all' | 'yes' | 'no')} className="w-full p-2 border rounded-md bg-background text-sm">
                                <option value="all">Any</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                         <div className="space-y-1">
                            <Label className="text-xs">Has Loyalty Points</Label>
                            <select value={loyaltyFilter} onChange={e => setLoyaltyFilter(e.target.value as 'all' | 'yes' | 'no')} className="w-full p-2 border rounded-md bg-background text-sm">
                                <option value="all">Any</option>
                                <option value="yes">Yes (Points > 0)</option>
                                <option value="no">No (Points = 0)</option>
                            </select>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => {
                            setStatusFilter('all');
                            setWhatsAppFilter('all');
                            setLoyaltyFilter('all');
                        }} className="w-full text-xs">Clear Filters</Button>
                    </PopoverContent>
                </Popover>
            </div>
          {isLoadingCustomers ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredCustomers.length > 0 ? (
             <>
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="hidden md:table-cell">WhatsApp</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Total Spent (₦)</TableHead>
                        <TableHead className="hidden xl:table-cell">Last Purchase</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Tags</TableHead>
                        <TableHead className="text-right">Loyalty Pts</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.map(customer => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">{customer.email}</TableCell>
                            <TableCell>
                                {customer.phone ? <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a> : 'N/A'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {customer.whatsappNumber ? (
                                    <a href={`https://wa.me/${customer.whatsappNumber.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 hover:underline flex items-center gap-1">
                                        <MessageSquare size={14}/> Chat
                                    </a>
                                ) : 'N/A'}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-right">{customer.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                            <TableCell className="hidden xl:table-cell">{customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant={customer.status === 'Active' ? 'secondary' : customer.status === 'New' ? 'outline' : 'destructive'}
                                 className={customer.status === 'Active' ? 'bg-green-100 text-green-700 border-green-300' : ''}
                                >
                                    {customer.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                    {(customer.tags || []).map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">{customer.loyaltyPoints || 0}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Actions for {customer.name}</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenViewModal(customer)}>
                                        <Users className="mr-2 h-4 w-4" /> View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenEditModal(customer)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Customer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleOpenDeleteAlert(customer)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <Users className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Customers Found</h3>
              <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
                Your customer list is empty or your filters returned no results.
                Start building your customer database to better understand their needs and personalize interactions.
              </p>
              <Button onClick={handleOpenAddModal}>
                Add Your First Customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Comprehensive Profiles</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Store detailed customer information, including contact details, purchase history, notes, and custom tags for segmentation.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary"/> Loyalty &amp; Rewards System</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Track loyalty points and purchase counts to identify and reward your most valuable customers, fostering retention.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/> Customer Analytics (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Future updates will include analytics on customer segments, lifetime value, and purchasing patterns for targeted marketing.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
