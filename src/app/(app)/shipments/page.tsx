
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Truck, PlusCircle, MapPin, PackageSearch, ListOrdered, Navigation, UserCircleIcon, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Shipment {
  id: string;
  orderId?: string;
  trackingNumber: string;
  carrier: string;
  shippingDate: string;
  customerName: string;
  destination: string; // Simplified address
  status: 'Preparing' | 'Shipped' | 'In Transit' | 'Delivered' | 'Delayed';
}

const mockShipments: Shipment[] = [
  { id: "shp-001", orderId: "WEB-1001", trackingNumber: "TRK123456789", carrier: "DHL", shippingDate: "2024-07-29", customerName: "Amina Garba", destination: "Lagos, NG", status: "Shipped" },
  { id: "shp-002", orderId: "SHOPIFY-5023", trackingNumber: "TRK987654321", carrier: "FedEx", shippingDate: "2024-07-28", customerName: "Tunde Adebayo", destination: "Abuja, NG", status: "In Transit" },
  { id: "shp-003", trackingNumber: "TRK555000111", carrier: "Local Courier", shippingDate: "2024-07-30", customerName: "Musa Aliyu", destination: "Kano, NG", status: "Preparing" },
  { id: "shp-004", orderId: "WEB-1000", trackingNumber: "TRK222333444", carrier: "GIG Logistics", shippingDate: "2024-07-25", customerName: "Sarah Okeke", destination: "Port Harcourt, NG", status: "Delivered" },
];


export default function ShipmentsPage() {
  const [shipments, setShipments] = React.useState<Shipment[]>(mockShipments); 
  const [isCreateShipmentModalOpen, setIsCreateShipmentModalOpen] = React.useState(false);


  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Shipments" subtitle="Manage and track your outgoing product shipments.">
         <Dialog open={isCreateShipmentModalOpen} onOpenChange={setIsCreateShipmentModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Shipment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New Shipment</DialogTitle>
                    <DialogDescription>
                        Enter shipment details below. (Functionality not yet implemented)
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="orderId">Order ID (Optional)</Label>
                            <Input id="orderId" placeholder="e.g., ORD-12345" data-ai-hint="order id input"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trackingNumber">Tracking Number</Label>
                            <Input id="trackingNumber" placeholder="Enter tracking number" data-ai-hint="tracking number input"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="carrier">Carrier</Label>
                            <Input id="carrier" placeholder="e.g., DHL, FedEx, Local Courier" data-ai-hint="shipping carrier input"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="shippingDate">Shipping Date</Label>
                            <Input id="shippingDate" type="date" data-ai-hint="date input"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerName">Customer Name</Label>
                        <Input id="customerName" placeholder="Recipient's name" data-ai-hint="customer name input"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shippingAddress">Shipping Address</Label>
                        <Textarea id="shippingAddress" placeholder="Full shipping address" data-ai-hint="address input text area"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shippedItems">Items Shipped (Brief Description)</Label>
                        <Textarea id="shippedItems" placeholder="e.g., 2x T-Shirt, 1x Mug" data-ai-hint="shipped items description text area"/>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={() => {
                        alert('Saving shipment... (Not yet implemented)');
                        setIsCreateShipmentModalOpen(false);
                    }}>Save Shipment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Shipment Tracking &amp; Management</CardTitle>
          <CardDescription>
            Organize and monitor all your product shipments for physical goods. Track packages, update statuses (e.g., Preparing, Shipped, In Transit, Delivered), 
            and manage shipping details like carrier information and tracking numbers. This is crucial for items that require physical delivery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shipments.length > 0 ? (
            <>
               <div className="mb-4 flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search shipments by tracking number, customer, or order ID..." className="w-full md:w-1/2 p-2 border rounded-md bg-background"/>
              </div>
              <div className="space-y-3">
                {shipments.map(shipment => (
                  <Card key={shipment.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-foreground">{shipment.trackingNumber} - {shipment.carrier}</h4>
                            <p className="text-sm text-muted-foreground">
                                To: {shipment.customerName} ({shipment.destination})
                                {shipment.orderId && ` | Order: ${shipment.orderId}`}
                            </p>
                            <p className="text-xs text-muted-foreground">Ship Date: {new Date(shipment.shippingDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <Badge
                                variant={
                                    shipment.status === 'Delivered' ? 'secondary' :
                                    shipment.status === 'Shipped' ? 'default' :
                                    shipment.status === 'In Transit' ? 'outline' :
                                    shipment.status === 'Preparing' ? 'outline' :
                                    'destructive' 
                                }
                                className={
                                    shipment.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                                    shipment.status === 'Shipped' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                    shipment.status === 'In Transit' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                                    shipment.status === 'Preparing' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                    shipment.status === 'Delayed' ? 'bg-orange-100 text-orange-700 border-orange-300' : ''
                                }
                            >
                                {shipment.status}
                            </Badge>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => alert(`View shipment ${shipment.trackingNumber}`)}><Eye className="mr-2 h-4 w-4"/> Track/View Details</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => alert(`Update status for ${shipment.trackingNumber}`)}><Edit className="mr-2 h-4 w-4"/> Update Status</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => alert(`Cancel shipment ${shipment.trackingNumber}`)}><Trash2 className="mr-2 h-4 w-4"/> Cancel Shipment</DropdownMenuItem>
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
              <Truck className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Shipments Logged Yet</h3>
              <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
                Keep your customers informed and your logistics organized by tracking all outgoing shipments of physical products. 
                Log new shipments to maintain clear records of what's been dispatched.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mb-6 text-left inline-block">
                <li>Centralize tracking information.</li>
                <li>Provide customers with shipping updates (planned).</li>
                <li>Manage logistics and identify delivery patterns.</li>
                <li>Link shipments to sales orders for fulfillment (planned).</li>
              </ul>
              <Button onClick={() => setIsCreateShipmentModalOpen(true)}>
                Log Your First Shipment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Navigation className="h-5 w-5 text-primary"/> Carrier Integration (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Automatically fetch tracking updates from major carriers by integrating their APIs.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListOrdered className="h-5 w-5 text-primary"/> Packing Slips (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Generate and print packing slips directly from shipment details for accurate order fulfillment.</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCircleIcon className="h-5 w-5 text-primary"/> Delivery Notifications (Planned)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Automatically notify customers at various stages of the shipping process (e.g., shipped, out for delivery, delivered).</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
