
"use client";

import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, PackageSearch, Settings, LinkIcon, BellRing, MoreVertical, Eye, Edit, TruckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface OnlineOrder {
  id: string;
  orderId: string;
  customerName: string;
  date: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  source: string; // e.g., "Website", "Shopify"
}

const mockOnlineOrders: OnlineOrder[] = [
  { id: "online-001", orderId: "WEB-1001", customerName: "Amina Garba", date: "2024-07-28", totalAmount: 12500, status: "Processing", source: "Website" },
  { id: "online-002", orderId: "SHOPIFY-5023", customerName: "Tunde Adebayo", date: "2024-07-27", totalAmount: 8800, status: "Shipped", source: "Shopify" },
  { id: "online-003", orderId: "WEB-1002", customerName: "Chioma Nwosu", date: "2024-07-29", totalAmount: 32000, status: "Pending", source: "Website" },
  { id: "online-004", orderId: "SHOPIFY-5024", customerName: "Musa Aliyu", date: "2024-07-26", totalAmount: 5400, status: "Delivered", source: "Shopify" },
];

export default function OnlineOrdersPage() {
  const onlineOrders: OnlineOrder[] = mockOnlineOrders;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Online Orders" subtitle="Manage orders from your e-commerce channels and integrations with Zeneva.">
        <Button variant="outline" onClick={() => alert('Online store integration settings for Zeneva would appear here.')}>
            <Settings className="mr-2 h-4 w-4"/>
            Configure Integrations
        </Button>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Online Order Management Hub (Zeneva)</CardTitle>
          <CardDescription>
            Track and manage orders received through your e-commerce platform (e.g., Shopify, WooCommerce - integrations planned) or other online sales channels.
            View order details, update statuses, manage fulfillment, and communicate with customers, all from Zeneva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onlineOrders.length > 0 ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <PackageSearch className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search online orders by ID, customer, or status..." className="w-full md:w-1/2 p-2 border rounded-md bg-background"/>
              </div>
              <div className="space-y-3">
                {onlineOrders.map(order => (
                  <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-foreground">{order.orderId} - {order.customerName}</h4>
                            <p className="text-sm text-muted-foreground">
                                Date: {new Date(order.date).toLocaleDateString()} | Source: {order.source}
                            </p>
                            <p className="text-lg font-medium">₦{order.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <Badge
                                variant={
                                    order.status === 'Delivered' ? 'secondary' :
                                    order.status === 'Shipped' ? 'default' :
                                    order.status === 'Processing' ? 'outline' :
                                    order.status === 'Pending' ? 'outline' :
                                    'destructive'
                                }
                                className={
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                    order.status === 'Processing' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : ''
                                }
                            >
                                {order.status}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => alert(`View order ${order.orderId}`)}><Eye className="mr-2 h-4 w-4"/> View Details</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => alert(`Update status for ${order.orderId}`)}><Edit className="mr-2 h-4 w-4"/> Update Status</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => alert(`Process shipment for ${order.orderId}`)}><TruckIcon className="mr-2 h-4 w-4"/> Ship Order</DropdownMenuItem>
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
              <Globe className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Online Orders Yet or Integrations Not Configured</h3>
              <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
                Connect Zeneva to your online store(s) to automatically sync orders.
                This centralizes your order management, whether sales happen in-store or online. Benefits include:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mb-6 text-left inline-block">
                <li>Unified view of all orders.</li>
                <li>Streamlined fulfillment process.</li>
                <li>Inventory synchronization across channels (planned).</li>
                <li>Improved customer service with quick access to order details.</li>
              </ul>
              <Button onClick={() => alert('Online store integration settings for Zeneva would appear here.')}>
                <LinkIcon className="mr-2 h-4 w-4"/>
                Connect Your Online Store (Planned)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-primary"/> Real-time Notifications (Planned)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Get notified instantly when new online orders are received in Zeneva, so you can process them promptly. (Requires integration setup)
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
