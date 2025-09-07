
"use client";

import *as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldQuestion, Filter, Search, CalendarDays, UserCircle, ListFilter, Loader2 } from 'lucide-react';
import type { AuditLogEntry } from '@/types';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function AuditLogsPage() {
  const { currentRole, currentBusinessId, user, status: authStatus } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (authStatus !== 'loading' && currentRole !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    if (currentBusinessId && user) {
      setIsLoading(true);
      const logsQuery = query(
        collection(db, "auditLogs"), // This assumes a top-level `auditLogs` collection
        where("businessId", "==", currentBusinessId),
        orderBy("timestamp", "desc"),
        limit(50)
      );
      getDocs(logsQuery).then(snapshot => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry));
        setAuditLogs(logs);
      }).catch(error => {
        console.error("Error fetching audit logs:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch audit logs.'});
      }).finally(() => setIsLoading(false));
    }
  }, [currentRole, router, currentBusinessId, user, toast, authStatus]);

  if (authStatus === 'loading' || (currentRole !== 'admin' && authStatus !== 'unauthenticated')) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Verifying access...</span></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Audit Logs" subtitle="Track critical system activities and changes within your Zeneva Inventory." />
      
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Review a detailed history of important actions performed within your business instance. This helps in maintaining security and accountability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs by user email, action type, or details..."
                className="w-full bg-background pl-8"
                data-ai-hint="audit log search"
              />
            </div>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filter Logs
            </Button>
          </div>

          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : auditLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Timestamp</TableHead>
                    <TableHead className="w-[200px]">User</TableHead>
                    <TableHead>Action Type</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {new Date(log.timestamp as string).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <UserCircle className="h-4 w-4 text-muted-foreground"/> 
                           <span className="text-sm font-medium truncate" title={log.userEmail || log.userId}>{log.userEmail || log.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{log.actionType}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <pre className="whitespace-pre-wrap max-w-md overflow-auto text-muted-foreground">
                            {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <ListFilter className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Audit Logs Found</h3>
              <p className="text-muted-foreground">
                Critical system activities will be logged here as they occur.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
