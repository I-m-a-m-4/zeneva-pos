
"use client";

import *as React from 'react';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, LogIn, Eye, EyeOff, Users, Settings, Activity, Trash2, LogOutIcon, Ban, BarChart3, Ticket, Building2, Wrench, CheckCircle, XCircle, PlusCircle, CalendarClock, KeyRound, Loader2, GiftIcon, UsersRound } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BusinessInstance, ActivationCode, SubscriptionTier } from '@/types';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { mockSubscriptionTiers } from '@/lib/data';

const SUPER_ADMIN_PASSWORD = "zenevaaccesssuper"; 

const generateActivationCodeString = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'ZN-';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 8; j++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 2) result += '-';
    }
    return result;
};


export default function SuperAdminPage() {
  const { user, status: authStatus } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const [businessInstances, setBusinessInstances] = React.useState<BusinessInstance[]>([]);
  const [activationCodes, setActivationCodes] = React.useState<ActivationCode[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [codeLabel, setCodeLabel] = React.useState("");
  const [codeTierId, setCodeTierId] = React.useState(mockSubscriptionTiers.find(t => t.id === 'pro')?.id || "");
  const [codeDuration, setCodeDuration] = React.useState("1_month");
  const [isGeneratingCode, setIsGeneratingCode] = React.useState(false);

  React.useEffect(() => {
    if (authStatus === 'loading') return;

    if (!user || user.email !== 'bimex4@gmail.com') {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'This area is restricted.' });
      router.replace('/dashboard');
      return;
    }

    if (!isAuthenticated) {
      setIsPasswordDialogOpen(true);
    } else {
        fetchAdminData();
    }
  }, [user, authStatus, isAuthenticated, router, toast]);

  const fetchAdminData = async () => {
      setIsLoading(true);
      try {
          const bizQuery = query(collection(db, "businessInstances"), orderBy("createdAt", "desc"));
          const codesQuery = query(collection(db, "activationCodes"), orderBy("generatedAt", "desc"));

          const [bizSnapshot, codesSnapshot] = await Promise.all([
              getDocs(bizQuery),
              getDocs(codesQuery)
          ]);

          const bizList = bizSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as BusinessInstance));
          const codesList = codesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActivationCode));
          
          setBusinessInstances(bizList);
          setActivationCodes(codesList);

      } catch (error) {
          console.error("Error fetching admin data:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch platform data.'});
      } finally {
          setIsLoading(false);
      }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === SUPER_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
      toast({ title: "Super Admin Access Granted", description: "Welcome, Imamshaffy!" });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "Incorrect password." });
    }
  };

  const handlePasswordDialogClose = (isOpen: boolean) => {
    if (!isOpen && !isAuthenticated) {
      router.push('/dashboard');
    }
  };

  const handleToggleInstanceStatus = async (instanceId: string) => {
    const instance = businessInstances.find(i => i.id === instanceId);
    if (!instance) return;

    const newStatus = instance.status === 'Active' ? 'Suspended' : 'Active';
    try {
        const instanceRef = doc(db, 'businessInstances', instanceId);
        await updateDoc(instanceRef, { status: newStatus });
        setBusinessInstances(prev => prev.map(i => i.id === instanceId ? { ...i, status: newStatus } : i));
        toast({
            title: `Instance Status Changed`,
            description: `Instance ${instance.businessName} is now ${newStatus}.`,
        });
    } catch(error) {
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update instance status.'});
    }
  };

  const calculateExpiry = (duration: string): string | undefined => {
    const now = new Date();
    if (duration === "lifetime") return undefined;
    const [value, unitPart] = duration.split("_");
    const unit = unitPart.endsWith('s') ? unitPart.slice(0, -1) : unitPart;
    const numValue = parseInt(value);
    if (isNaN(numValue)) return undefined;
    if (unit === "day") now.setDate(now.getDate() + numValue);
    else if (unit === "month") now.setMonth(now.getMonth() + numValue);
    else if (unit === "year") now.setFullYear(now.getFullYear() + numValue);
    else return undefined;
    return now.toISOString();
  };
  
  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeLabel || !codeTierId || !codeDuration) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill all fields." });
      return;
    }
    setIsGeneratingCode(true);
    
    try {
        const newCodeData: Omit<ActivationCode, 'usedAt' | 'usedByInstanceId' | 'usedByEmail'> = {
          id: generateActivationCodeString(),
          label: codeLabel,
          tierId: codeTierId,
          duration: codeDuration as ActivationCode['duration'],
          status: 'Active',
          generatedAt: new Date().toISOString(),
          expiresAt: calculateExpiry(codeDuration),
        };
        await addDoc(collection(db, "activationCodes"), newCodeData);
        setActivationCodes(prev => [newCodeData, ...prev]);
        toast({ title: "Activation Code Generated", description: `Code ${newCodeData.id} created.` });
        setCodeLabel("");
    } catch (error) {
        console.error("Error generating code:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save activation code.'});
    } finally {
        setIsGeneratingCode(false);
    }
  };
  
  const getTierName = (tierId: string) => mockSubscriptionTiers.find(t => t.id === tierId)?.name || "Unknown Tier";
  const formatDuration = (duration: string) => {
    if (duration === 'lifetime') return 'Lifetime';
    const [value, unitPart] = duration.split("_");
    const unit = unitPart.charAt(0).toUpperCase() + unitPart.slice(1);
    return `${value} ${unit}`;
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isPasswordDialogOpen} onOpenChange={handlePasswordDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-destructive" /> Zeneva CEO Access
            </DialogTitle>
            <DialogDescription>
              Enter the super admin password to access the platform dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="superAdminPassword">Password</Label>
              <div className="relative">
                <Input
                  id="superAdminPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter super admin password"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancel & Exit</Button>
            <Button onClick={handlePasswordSubmit}><LogIn className="mr-2 h-4 w-4"/> Authenticate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const totalBusinesses = businessInstances.length;
  const totalPlatformUsers = businessInstances.reduce((sum, instance) => sum + (instance.userCount || 0), 0);
  const totalPlatformRevenue = businessInstances.reduce((sum, instance) => sum + (instance.totalPlatformSpend || 0), 0);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-muted/30">
      <PageTitle title="Zeneva Platform Dashboard" subtitle="CEO & Super Admin Panel" />

      {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 text-primary animate-spin"/></div>
      ) : (
        <>
            <div className="grid md:grid-cols-3 gap-4">
                <Card><CardHeader><CardDescription>Total Businesses</CardDescription><CardTitle className="text-4xl">{totalBusinesses.toLocaleString()}</CardTitle></CardHeader></Card>
                <Card><CardHeader><CardDescription>Total Users (Conceptual)</CardDescription><CardTitle className="text-4xl">{totalPlatformUsers.toLocaleString()}</CardTitle></CardHeader></Card>
                <Card><CardHeader><CardDescription>Total Revenue (Simulated)</CardDescription><CardTitle className="text-4xl text-green-600">₦{totalPlatformRevenue.toLocaleString()}</CardTitle></CardHeader></Card>
            </div>
          
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5 text-primary"/> Activation Code Management</CardTitle>
                <CardDescription>Generate and manage activation codes for subscription tiers.</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleGenerateCode} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6 p-4 border rounded-md bg-background shadow-sm">
                    <div className="space-y-1"><Label htmlFor="codeLabel">Code Label</Label><Input id="codeLabel" value={codeLabel} onChange={e => setCodeLabel(e.target.value)} placeholder="e.g., Q3 Promo" /></div>
                    <div className="space-y-1"><Label htmlFor="codeTier">Subscription Tier</Label><Select value={codeTierId} onValueChange={setCodeTierId}><SelectTrigger id="codeTier"><SelectValue placeholder="Select tier" /></SelectTrigger><SelectContent>{mockSubscriptionTiers.map(tier => (<SelectItem key={tier.id} value={tier.id}>{tier.name}</SelectItem>))}</SelectContent></Select></div>
                    <div className="space-y-1"><Label htmlFor="codeDuration">Duration / Type</Label><Select value={codeDuration} onValueChange={setCodeDuration}><SelectTrigger id="codeDuration"><SelectValue placeholder="Select duration" /></SelectTrigger><SelectContent><SelectItem value="7_days_trial">7 Days Trial</SelectItem><SelectItem value="1_month">1 Month</SelectItem><SelectItem value="3_months">3 Months</SelectItem><SelectItem value="1_year">1 Year</SelectItem><SelectItem value="lifetime">Lifetime</SelectItem></SelectContent></Select></div>
                    <Button type="submit" className="w-full lg:w-auto" disabled={isGeneratingCode}>{isGeneratingCode ? <Loader2 className="animate-spin mr-2"/> : <PlusCircle className="mr-2 h-4 w-4" />}{isGeneratingCode ? "Generating..." : "Generate Code"}</Button>
                </form>

                {activationCodes.length > 0 ? (<div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Label</TableHead><TableHead>Tier</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead><TableHead>Generated</TableHead><TableHead>Expires (Conceptual)</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{activationCodes.map(code => (<TableRow key={code.id}><TableCell className="font-mono">{code.id}</TableCell><TableCell>{code.label}</TableCell><TableCell><Badge variant="secondary">{getTierName(code.tierId)}</Badge></TableCell><TableCell>{formatDuration(code.duration)}</TableCell><TableCell><Badge variant={code.status === 'Active' ? 'default' : 'outline'} className={code.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-400' : code.status === 'Used' ? 'bg-blue-500/20 text-blue-700 border-blue-400' : 'opacity-60'}>{code.status}</Badge></TableCell><TableCell>{new Date(code.generatedAt).toLocaleDateString()}</TableCell><TableCell>{code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'N/A'}</TableCell><TableCell className="text-right"><Button variant="ghost" size="xs" onClick={() => toast({title: `Revoke ${code.id}? (Simulated)`})} className="text-destructive hover:text-destructive/80">Revoke</Button></TableCell></TableRow>))}</TableBody></Table></div>) : <p className="text-muted-foreground text-center">No activation codes generated yet.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary"/> Business Instance Management</CardTitle>
                <CardDescription>Oversee and manage registered business instances on the Zeneva platform.</CardDescription>
                </CardHeader>
                <CardContent>
                {businessInstances.length > 0 ? (<div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Instance ID</TableHead><TableHead>Business Name</TableHead><TableHead>Owner Email</TableHead><TableHead>Subscription Tier</TableHead><TableHead className="text-right">Total Spend (₦)</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{businessInstances.map((instance) => (<TableRow key={instance.id}><TableCell className="font-mono text-xs">{instance.id}</TableCell><TableCell className="font-medium">{instance.businessName}</TableCell><TableCell>{instance.ownerEmail}</TableCell><TableCell><Badge variant="outline">{getTierName(instance.subscriptionTierId)}</Badge></TableCell><TableCell className="text-right font-medium">{(instance.totalPlatformSpend || 0).toLocaleString()}</TableCell><TableCell><Badge variant={instance.status === 'Active' ? 'default' : 'destructive'} className={instance.status === 'Active' ? 'bg-green-100 text-green-700 border-green-300' : ''}>{instance.status}</Badge></TableCell><TableCell className="text-right space-x-1"><Button variant="outline" size="xs" onClick={() => toast({title: `Details for ${instance.businessName}`})}>View Details</Button><Button variant={instance.status === 'Active' ? "destructive" : "secondary"} size="xs" onClick={() => handleToggleInstanceStatus(instance.id)} className={instance.status === 'Active' ? "bg-red-500/80 hover:bg-red-600 text-white" : "bg-green-500/80 hover:bg-green-600 text-white"}>{instance.status === 'Active' ? <XCircle className="mr-1 h-3 w-3"/> : <CheckCircle className="mr-1 h-3 w-3"/>}{instance.status === 'Active' ? 'Suspend' : 'Reactivate'}</Button></TableCell></TableRow>))}</TableBody></Table></div>) : (<p className="text-muted-foreground text-center">No business instances found.</p>)}
                </CardContent>
            </Card>
        </>
      )}
      
       <div className="mt-auto pt-6 text-center">
          <Button variant="link" onClick={() => { setIsAuthenticated(false); setIsPasswordDialogOpen(true); setPasswordInput(""); }}>
            Re-authenticate / Lock Dashboard
          </Button>
        </div>
    </div>
  );
}
