
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { FileSpreadsheet, PlusCircle, Search, Send, User, CalendarDays, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';
}

const mockInvoices: Invoice[] = [
  { id: "inv-001", invoiceNumber: "INV-2024-001", customerName: "Tech Solutions Ltd.", invoiceDate: "2024-07-15", dueDate: "2024-07-30", amount: 75000, status: "Paid" },
  { id: "inv-002", invoiceNumber: "INV-2024-002", customerName: "Global Imports Inc.", invoiceDate: "2024-07-20", dueDate: "2024-08-05", amount: 120500, status: "Unpaid" },
  { id: "inv-003", invoiceNumber: "INV-2024-003", customerName: "Creative Designs Co.", invoiceDate: "2024-06-10", dueDate: "2024-06-25", amount: 45000, status: "Overdue" },
  { id: "inv-004", invoiceNumber: "INV-2024-004", customerName: "Local Bakery Shop", invoiceDate: "2024-07-28", dueDate: "2024-08-12", amount: 15200, status: "Draft" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>(mockInvoices);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Invoices" subtitle="Manage customer invoices and track payments with Zeneva.">
        <Dialog open={isCreateInvoiceModalOpen} onOpenChange={setIsCreateInvoiceModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Invoice in Zeneva</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to generate a new invoice. (Functionality not yet implemented)
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input id="customerName" placeholder="Enter customer name" data-ai-hint="customer name input" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoiceNumber">Invoice Number</Label>
                            <Input id="invoiceNumber" placeholder="INV-00123" data-ai-hint="invoice number input"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="invoiceDate">Invoice Date</Label>
                            <Input id="invoiceDate" type="date" data-ai-hint="date input" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" type="date" data-ai-hint="date input"/>
                        </div>
                    </div>
                    {}
                    <div className="space-y-2">
                        <Label>Invoice Items</Label>
                        <div className="p-4 border rounded-md text-center text-muted-foreground bg-muted/30">
                            <p>Line item entry UI will be here.</p>
                            <p className="text-xs">(e.g., Product/Service, Quantity, Unit Price, Total)</p>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">Notes/Terms</Label>
                        <Textarea id="notes" placeholder="Any additional notes or payment terms" data-ai-hint="notes input text area" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={() => {
                        alert('Saving invoice... (Not yet implemented)');
                        setIsCreateInvoiceModalOpen(false);
                    }}>Save Invoice</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>
            Create, send, and track professional invoices for your sales. Monitor payment statuses and manage outstanding balances efficiently.
            Zeneva helps you streamline your billing process and get paid faster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search invoices by number, customer, or status..." className="w-full md:w-1/2 p-2 border rounded-md bg-background"/>
              </div>
              <div className="space-y-3">
                {invoices.map(invoice => (
                  <Card key={invoice.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{invoice.invoiceNumber} - {invoice.customerName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(invoice.invoiceDate).toLocaleDateString()} | Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                        <p className="text-lg font-medium">₦{invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Badge
                           variant={
                            invoice.status === 'Paid' ? 'secondary' :
                            invoice.status === 'Unpaid' ? 'outline' :
                            invoice.status === 'Overdue' ? 'destructive' :
                            'default'
                           }
                           className={
                            invoice.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-300' :
                            invoice.status === 'Unpaid' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            invoice.status === 'Draft' ? 'bg-blue-100 text-blue-700 border-blue-300' : ''
                           }
                        >
                          {invoice.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => alert(`View invoice ${invoice.invoiceNumber}`)}><Eye className="mr-2 h-4 w-4"/> View/Download</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Edit invoice ${invoice.invoiceNumber}`)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Send invoice ${invoice.invoiceNumber}`)}><Send className="mr-2 h-4 w-4"/> Send</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => alert(`Delete invoice ${invoice.invoiceNumber}`)}><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <FileSpreadsheet className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Invoices Created Yet</h3>
              <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
                Streamline your billing by creating and sending professional invoices directly from Zeneva.
                Effective invoicing helps you get paid on time and maintain healthy cash flow. Key benefits include:
              </p>
               <ul className="text-sm text-muted-foreground list-disc list-inside mb-6 text-left inline-block">
                <li>Professional presentation to clients.</li>
                <li>Easy tracking of paid, unpaid, and overdue amounts.</li>
                <li>Simplified record-keeping for accounting.</li>
                <li>Ability to send payment reminders (planned).</li>
              </ul>
              <Button onClick={() => setIsCreateInvoiceModalOpen(true)}>
                Create Your First Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary"/> Send Invoices (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Directly email invoices to your customers from within Zeneva or generate shareable PDF links.</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Customer Portal (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Allow customers to view their invoice history and make payments through a secure Zeneva portal.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/> Recurring Invoices (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Set up automatic recurring invoices for subscription services or regular retainers with Zeneva.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
