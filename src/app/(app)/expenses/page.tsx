
"use client"; 

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardList, PlusCircle, BarChartHorizontalBig, Search, Filter, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from '@/types';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore";

const newExpenseDefault: Omit<Expense, 'id' | 'createdAt' | 'businessId'> = {
  date: new Date().toISOString().split('T')[0],
  description: "",
  category: "Miscellaneous",
  amount: 0,
  status: "Paid",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Partial<Expense> | null>(null);

  const { toast } = useToast();
  const { currentBusinessId } = useAuth();

  React.useEffect(() => {
    if (!currentBusinessId) {
      setIsLoading(false);
      return;
    }

    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "expenses"), where("businessId", "==", currentBusinessId), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedExpenses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch expenses from the database." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, [currentBusinessId, toast]);

  const handleOpenAddModal = () => {
    setEditingExpense(newExpenseDefault);
    setIsAddEditModalOpen(true);
  };

  const handleAddEditSubmit = async () => {
    if (!editingExpense || !editingExpense.description || !editingExpense.amount) {
      toast({ variant: "destructive", title: "Validation Error", description: "Description and amount are required." });
      return;
    }
    if (!currentBusinessId) {
      toast({ variant: "destructive", title: "Error", description: "No active business selected." });
      return;
    }

    setIsSaving(true);
    
    try {
        const expenseData = {
            ...editingExpense,
            amount: Number(editingExpense.amount) || 0,
            businessId: currentBusinessId,
            updatedAt: serverTimestamp(),
        };

        if (editingExpense.id) {
            console.log("Updating expense (not implemented):", expenseData);
        } else {
            const docRef = await addDoc(collection(db, "expenses"), {
                ...expenseData,
                createdAt: serverTimestamp(),
            });
            const newExpenseWithId = { ...expenseData, id: docRef.id } as Expense;
            setExpenses(prev => [newExpenseWithId, ...prev]);
            toast({ title: "Expense Recorded", description: "The expense has been successfully added." });
        }
        setIsAddEditModalOpen(false);
        setEditingExpense(null);
    } catch (error) {
        console.error("Error saving expense:", error);
        toast({ variant: "destructive", title: "Save Failed", description: `Could not save expense: ${(error as Error).message}`});
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Expense Management" subtitle="Track and categorize your business operational costs.">
         <Button onClick={handleOpenAddModal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record New Expense
        </Button>
      </PageTitle>

      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingExpense?.id ? "Edit Expense" : "Record New Expense"}</DialogTitle>
                  <DialogDescription>
                    Enter the details for the business expense.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-1">
                      <Label htmlFor="expenseDescription">Description</Label>
                      <Input id="expenseDescription" value={editingExpense?.description || ""} onChange={(e) => setEditingExpense(p => ({...p!, description: e.target.value}))} placeholder="e.g., Office Rent - July" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label htmlFor="expenseAmount">Amount (₦)</Label>
                          <Input id="expenseAmount" type="number" value={editingExpense?.amount || 0} onChange={(e) => setEditingExpense(p => ({...p!, amount: parseFloat(e.target.value) || 0}))} />
                      </div>
                      <div className="space-y-1">
                          <Label htmlFor="expenseDate">Date</Label>
                          <Input id="expenseDate" type="date" value={editingExpense?.date || new Date().toISOString().split('T')[0]} onChange={(e) => setEditingExpense(p => ({...p!, date: e.target.value}))} />
                      </div>
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor="expenseCategory">Category</Label>
                      <Input id="expenseCategory" value={editingExpense?.category || ""} onChange={(e) => setEditingExpense(p => ({...p!, category: e.target.value}))} placeholder="e.g., Rent, Utilities, Office Supplies" />
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor="expenseVendor">Vendor (Optional)</Label>
                      <Input id="expenseVendor" value={editingExpense?.vendor || ""} onChange={(e) => setEditingExpense(p => ({...p!, vendor: e.target.value}))} placeholder="e.g., Landlord Properties" />
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor="expenseStatus">Status</Label>
                      <Select value={editingExpense?.status || "Paid"} onValueChange={(v) => setEditingExpense(p => ({...p!, status: v as 'Paid' | 'Pending' | 'Reimbursed'}))}>
                          <SelectTrigger id="expenseStatus"><SelectValue/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Reimbursed">Reimbursed</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
                  <Button onClick={handleAddEditSubmit} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                      {isSaving ? "Saving..." : "Save Expense"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Expense Tracking</CardTitle>
          <CardDescription>
            Record all business-related expenses, from supplier payments and rent to utilities and marketing costs. 
            Categorize them for accurate financial reporting and to better understand your operational expenditures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10"><Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" /></div>
          ) : expenses.length > 0 ? (
             <>
              <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
                <div className="flex items-center gap-2 w-full md:w-1/2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search expenses by description, category, or vendor..." className="w-full p-2 border rounded-md bg-background"/>
                </div>
                <Button variant="outline" className="w-full md:w-auto">
                    <Filter className="mr-2 h-4 w-4"/> Filter by Date/Category
                </Button>
              </div>
              <div className="space-y-3">
                {expenses.map(expense => (
                  <Card key={expense.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-foreground">{expense.description}</h4>
                            <p className="text-sm text-muted-foreground">
                                Category: {expense.category} {expense.vendor && `| Vendor: ${expense.vendor}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Date: {new Date(expense.date).toLocaleDateString()} | Amount: ₦{expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <Badge 
                              variant={expense.status === 'Paid' ? 'secondary' : expense.status === 'Pending' ? 'destructive' : 'outline'}
                              className={
                                expense.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-300' :
                                expense.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                expense.status === 'Reimbursed' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''
                              }
                            >
                                {expense.status}
                            </Badge>
                            <Button variant="ghost" size="icon" onClick={() => alert(`Edit ${expense.description}`)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => alert(`Delete ${expense.description}`)}><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <ClipboardList className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Expenses Recorded Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                Keep a clear record of your business spending to manage your budget effectively and prepare for tax season. 
                Proper expense tracking helps you:
              </p>
               <ul className="text-sm text-muted-foreground list-disc list-inside mb-6 text-left inline-block">
                <li>Monitor where your money is going.</li>
                <li>Identify areas for potential cost savings.</li>
                <li>Calculate your business profitability accurately.</li>
                <li>Simplify tax preparation with organized records.</li>
              </ul>
              <Button onClick={handleOpenAddModal}>
                Record Your First Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChartHorizontalBig className="h-5 w-5 text-primary"/> Expense Reporting (Planned)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
                Future updates will include robust expense reporting features. You'll be able to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Generate reports summarizing expenses by category, vendor, or time period.</li>
                <li>Visualize spending trends with charts.</li>
                <li>Export expense data for accounting software or further analysis.</li>
            </ul>
             <Button variant="outline" className="mt-4" asChild>
                <Link href="/reports">Go to Reports (Preview)</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
