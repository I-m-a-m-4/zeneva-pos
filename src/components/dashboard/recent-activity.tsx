
"use client"

import * as React from 'react';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Info, ShoppingCart, ListChecks, Package, Loader2 } from "lucide-react";
import type { Receipt } from "@/types";
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

interface ActivityItemBase {
  id: string;
  date: string;
  activityType: 'sale' | 'system_event';
}

interface SaleActivity extends ActivityItemBase, Receipt {
  activityType: 'sale';
}

interface SystemEventActivity extends ActivityItemBase {
  activityType: 'system_event';
  title: string;
  message: string;
  icon: React.ElementType;
  iconColor?: string;
}

type CombinedActivity = SaleActivity | SystemEventActivity;

export default function RecentActivity() {
  const { currentBusinessId } = useAuth();
  const [activities, setActivities] = React.useState<CombinedActivity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentBusinessId) {
      setIsLoading(false);
      return;
    }

    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const receiptsQuery = query(
          collection(db, "receipts"),
          where("businessId", "==", currentBusinessId),
          orderBy("date", "desc"),
          limit(10)
        );
        const receiptsSnapshot = await getDocs(receiptsQuery);
        const saleActivities: SaleActivity[] = receiptsSnapshot.docs.map(doc => ({
          ...(doc.data() as Receipt),
          id: doc.id,
          activityType: 'sale'
        }));
        
        const welcomeActivity: SystemEventActivity = {
            id: 'welcome-event',
            activityType: 'system_event',
            title: 'Welcome to Zeneva!',
            message: 'Explore the dashboard and start managing your inventory.',
            date: new Date().toISOString(),
            icon: Info,
            iconColor: 'text-primary'
        };

        const combined = [...saleActivities, welcomeActivity];
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivities(combined);

      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [currentBusinessId]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest sales and system events.</CardDescription>
      </CardHeader>
      <CardContent>
         <ScrollArea className="h-[370px] pr-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : activities.length > 0 ? (
            <ul className="space-y-4">
              {activities.map((activity) => (
                <li key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {activity.activityType === 'sale' ? (
                      <ShoppingCart className="h-5 w-5 text-green-500" />
                    ) : (
                      <activity.icon className={`h-5 w-5 ${activity.iconColor || 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.activityType === 'sale' ? `Sale: #${activity.receiptNumber}` : activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                       {activity.activityType === 'sale' ? `Total: ₦${activity.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                  {activity.activityType === 'sale' && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/receipts/${activity.id}`}>View</Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <ListChecks className="h-16 w-16 opacity-50 mb-4" />
              <p className="text-lg font-medium">No Recent Activity</p>
              <p className="text-sm">Sales and alerts will appear here as they happen.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
