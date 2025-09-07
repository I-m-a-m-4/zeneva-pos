
"use client"

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, Info, ShoppingCart, ListChecks, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Alert, Receipt } from "@/types";

interface ActivityItemBase {
  id: string;
  date: string;
}
interface AlertActivity extends ActivityItemBase, Alert {
  activityType: 'alert';
}
interface SaleActivity extends ActivityItemBase, Receipt {
  activityType: 'sale';
}
interface StaticActivity extends ActivityItemBase {
  activityType: 'static';
  title: string;
  message: string;
  icon: React.ElementType;
  iconColor?: string;
  href?: string;
}

type CombinedActivity = AlertActivity | SaleActivity | StaticActivity;


export default function RecentActivity() {
  const combinedActivities: CombinedActivity[] = [
      { id: 'static-1', activityType: 'static', title: 'Welcome to Zeneva!', message: 'Explore the dashboard and start managing your inventory.', date: new Date().toISOString(), icon: Info, iconColor: 'text-primary' },
      { id: 'static-2', activityType: 'static', title: 'Low Stock: Sample Product', message: 'Stock for "Sample Product" is at 5 units. Consider reordering.', date: new Date(Date.now() - 3600000).toISOString(), icon: AlertTriangle, iconColor: 'text-yellow-500', href:'#' },
      { id: 'static-3', activityType: 'static', title: 'Sale: #INV-00001', message: 'New sale recorded for ₦12,500.00.', date: new Date(Date.now() - 7200000).toISOString(), icon: ShoppingCart, iconColor: 'text-green-500', href: '#' },
      { id: 'static-4', activityType: 'static', title: 'New Product Added', message: '"Super Widget X" added to inventory.', date: new Date(Date.now() - 10800000).toISOString(), icon: Package, iconColor: 'text-blue-500', href: '#' },
  ];

  combinedActivities.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest alerts, sales, and system events.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[370px] pr-3">
          {combinedActivities.length > 0 ? (
            <ul className="space-y-4">
              {combinedActivities.map((activity) => (
                <li key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {activity.activityType === 'alert' ? (
                      activity.severity === 'critical' ? <AlertTriangle className="h-5 w-5 text-destructive" /> :
                      activity.severity === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> :
                      <Info className="h-5 w-5 text-primary" />
                    ) : activity.activityType === 'sale' ? (
                      <ShoppingCart className="h-5 w-5 text-green-500" />
                    ) : activity.activityType === 'static' ? (
                      <activity.icon className={`h-5 w-5 ${activity.iconColor || 'text-muted-foreground'}`} />
                    ): null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.activityType === 'alert' ? activity.title : 
                       activity.activityType === 'sale' ? `Sale: ${activity.receiptNumber}` :
                       activity.activityType === 'static' ? activity.title : ''}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.activityType === 'alert' ? activity.message : 
                       activity.activityType === 'sale' ? `Total: ₦${activity.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` :
                       activity.activityType === 'static' ? activity.message : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  {activity.activityType === 'alert' && !(activity as AlertActivity).read && (
                     <Badge variant="outline" className="text-xs bg-accent text-accent-foreground">New</Badge>
                  )}
                  {(activity.activityType === 'sale' || (activity.activityType === 'static' && activity.href)) && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={activity.activityType === 'sale' ? `/receipts/${activity.id}` : activity.href || '#'}>View</Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <ListChecks className="h-16 w-16 opacity-50 mb-4" />
              <p className="text-lg font-medium">No Recent Activity</p>
              <p className="text-sm">Alerts and sales will appear here as they happen.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
