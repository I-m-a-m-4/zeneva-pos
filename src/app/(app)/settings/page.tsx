
"use client";

import *as React from 'react';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/shared/page-title';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Palette, Briefcase, Percent, Building, UserCircle, Bell, DollarSign, ShieldCheck, FileText, DownloadCloud, Eye, EyeOff, Info, KeyRound, Gift, Trophy, Settings2, CheckCircle, Loader2, Ticket } from 'lucide-react'; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context'; 
import type { BusinessSettings, ActivationCode, SubscriptionTier } from '@/types';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { calculateNewTrialEndDate } from '@/lib/utils';
import ReauthDialog from '@/components/app/reauth-dialog';


const mockSubscriptionTiers: Pick<SubscriptionTier, 'id' | 'name'>[] = [
    { id: "free", name: "Free" },
    { id: "pro", name: "Pro" },
    { id: "lifetime", name: "Lifetime" },
    { id: "enterprise", name: "Enterprise" },
];

const ATTEMPTS_KEY = "zeneva-code-attempts";
const MAX_ATTEMPTS = 10;

export default function SettingsPage() {
  const { toast } = useToast();
  const { currentBusinessId, businessSettings, status: authStatus, fetchUserRolesAndSelectFirstBusiness, user, currentBusiness, updateCurrentBusiness } = useAuth();
  
  const [isSaving, setIsSaving] = React.useState<Record<string, boolean>>({});
  const [isReauthOpen, setIsReauthOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(null);
  
  const [businessName, setBusinessName] = React.useState("");
  const [businessAddress, setBusinessAddress] = React.useState("");
  const [businessPhone, setBusinessPhone] = React.useState("");
  const [businessEmail, setBusinessEmail] = React.useState("");

  const [primaryColor, setPrimaryColor] = React.useState("#558BFF");
  const [backgroundColor, setBackgroundColor] = React.useState("#F0F8FF");
  const [accentColor, setAccentColor] = React.useState("#7A53FF");
  
  const [currency, setCurrency] = React.useState("NGN");
  const [timezone, setTimezone] = React.useState("Africa/Lagos");
  const [defaultTaxRate, setDefaultTaxRate] = React.useState("7.5");

  const [paymentBankAccountId, setPaymentBankAccountId] = React.useState("");
  const [paymentBankName, setPaymentBankName] = React.useState("");
  const [paymentInstructions, setPaymentInstructions] = React.useState("");

  const [enableLoyaltyProgram, setEnableLoyaltyProgram] = React.useState(true);
  const [pointsPerUnit, setPointsPerUnit] = React.useState("1"); 
  const [loyaltyPointsForReward, setLoyaltyPointsForReward] = React.useState("1000");
  const [rewardDiscountPercentage, setRewardDiscountPercentage] = React.useState("10");

  const [activationCode, setActivationCode] = React.useState("");
  const [isApplyingCode, setIsApplyingCode] = React.useState(false);
  const [attemptCount, setAttemptCount] = React.useState(0);

  React.useEffect(() => {
    try {
      const storedAttempts = localStorage.getItem(ATTEMPTS_KEY);
      if (storedAttempts) {
        const { count, timestamp } = JSON.parse(storedAttempts);
        // Reset attempts if it's been more than 24 hours
        if (new Date().getTime() - timestamp < 24 * 60 * 60 * 1000) {
          setAttemptCount(count);
        } else {
          localStorage.removeItem(ATTEMPTS_KEY);
        }
      }
    } catch (e) { console.error("Could not read from local storage", e)}
  }, []);

  React.useEffect(() => {
    if (businessSettings) {
      setCurrency(businessSettings.currency || "NGN");
      setTimezone(businessSettings.timezone || "Africa/Lagos");
      setDefaultTaxRate(String(businessSettings.defaultTaxRate || 7.5));
      setPaymentBankAccountId(businessSettings.paymentBankAccountId || "");
      setPaymentBankName(businessSettings.paymentBankName || "");
      setPaymentInstructions(businessSettings.paymentInstructions || "");
      setEnableLoyaltyProgram(businessSettings.loyaltyProgramEnabled ?? true);
      setPointsPerUnit(String(businessSettings.pointsPerUnit || 1));
      setLoyaltyPointsForReward(String(businessSettings.loyaltyPointsForReward || 1000));
      setRewardDiscountPercentage(String(businessSettings.loyaltyRewardDiscountPercentage || 10));
    }
    if (currentBusiness) {
        setBusinessName(currentBusiness.businessName || "My Awesome Store");
        setBusinessAddress(currentBusiness.businessDetails?.address || "");
        setBusinessPhone(currentBusiness.businessDetails?.phone || "");
        setBusinessEmail(currentBusiness.businessDetails?.email || "");
    }

  }, [businessSettings, currentBusiness]);
  
  const onReauthSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleSettingsSubmit = async (formName: string, settingsToSave: Partial<BusinessSettings> | { type: 'businessMeta', data: any }) => {
    if (!currentBusinessId) {
      toast({ variant: "destructive", title: "Error", description: "No active business selected." });
      return;
    }
    
    const needsReauth = ["Financial Settings", "My Account"].includes(formName);
    const saveAction = async () => {
        setIsSaving(prev => ({ ...prev, [formName]: true }));

        try {
          const businessDocRef = doc(db, "businessInstances", currentBusinessId);
          
          if ('type' in settingsToSave && settingsToSave.type === 'businessMeta') {
            const dataToUpdate = {
              businessName: settingsToSave.data.businessName,
              'businessDetails.address': settingsToSave.data.businessAddress,
              'businessDetails.phone': settingsToSave.data.businessPhone,
              'businessDetails.email': settingsToSave.data.businessEmail,
              updatedAt: serverTimestamp()
            };
            await updateDoc(businessDocRef, dataToUpdate);
            updateCurrentBusiness({ ...settingsToSave.data });
          } else {
            const updatedSettings: Record<string, any> = {};
            for (const key in settingsToSave) {
              updatedSettings[`settings.${key}`] = (settingsToSave as Partial<BusinessSettings>)[key as keyof BusinessSettings];
            }
            updatedSettings['updatedAt'] = serverTimestamp();
            await updateDoc(businessDocRef, updatedSettings);
          }
          
          toast({
            variant: "success",
            title: `${formName} Settings Saved`,
            description: `Your ${formName.toLowerCase()} settings have been updated.`,
          });
        } catch (error) {
          console.error(`Error saving ${formName} settings:`, error);
          toast({
            variant: "destructive",
            title: "Save Failed",
            description: `Could not save ${formName.toLowerCase()} settings. ${(error as Error).message}`,
          });
        } finally {
          setIsSaving(prev => ({ ...prev, [formName]: false }));
        }
    }
    
    if (needsReauth) {
        setPendingAction(() => saveAction);
        setIsReauthOpen(true);
    } else {
        saveAction();
    }
  };

  const handleApplyActivationCode = async (event: React.FormEvent) => {
    event.preventDefault();

    if (attemptCount >= MAX_ATTEMPTS) {
      toast({ variant: "destructive", title: "Too Many Attempts", description: "You have exceeded the maximum number of attempts. Please try again tomorrow." });
      return;
    }

    if (!activationCode.trim()) {
      toast({ variant: "destructive", title: "No Code Entered", description: "Please enter an activation code." });
      return;
    }
    if (!currentBusinessId) {
      toast({ variant: "destructive", title: "Error", description: "No business is currently active." });
      return;
    }
    setIsApplyingCode(true);

    try {
      const codesRef = collection(db, "activationCodes");
      const q = query(codesRef, where("id", "==", activationCode.trim()), where("status", "==", "Active"));
      const querySnapshot = await getDocs(q);
      
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count: newAttemptCount, timestamp: new Date().getTime() }));

      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: "Invalid or Used Code", description: `The code you entered is not valid or has already been used. Attempts left: ${MAX_ATTEMPTS - newAttemptCount}` });
        setIsApplyingCode(false);
        return;
      }

      const codeDoc = querySnapshot.docs[0];
      const codeData = codeDoc.data() as ActivationCode;
      
      const newTrialEndDate = calculateNewTrialEndDate(currentBusiness?.trialEndsAt, codeData.duration);
      
      const businessDocRef = doc(db, "businessInstances", currentBusinessId);
      const codeDocRef = doc(db, "activationCodes", codeDoc.id);

      const batch = writeBatch(db);
      
      batch.update(businessDocRef, {
        subscriptionTierId: codeData.tierId,
        trialEndsAt: newTrialEndDate,
        updatedAt: serverTimestamp()
      });
      
      batch.update(codeDocRef, {
        status: 'Used',
        usedAt: new Date().toISOString(),
        usedByInstanceId: currentBusinessId,
        usedByEmail: user?.email,
      });

      await batch.commit();
      
      localStorage.removeItem(ATTEMPTS_KEY); // Reset attempts on success

      if(user) {
        await fetchUserRolesAndSelectFirstBusiness(user.uid);
      }

      toast({
        variant: "success",
        title: "Code Applied Successfully!",
        description: `Your plan has been upgraded to the ${codeData.tierId} tier.`,
      });
      setActivationCode("");
    } catch (error) {
      console.error("Error applying activation code:", error);
      toast({ variant: "destructive", title: "Activation Failed", description: (error as Error).message });
    } finally {
      setIsApplyingCode(false);
    }
  };

  if (authStatus === 'loading') {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading settings...</span></div>;
  }
  if (!businessSettings && authStatus !== 'loading') {
     return <div className="text-center py-10 text-muted-foreground">Could not load business settings. Please ensure a business is selected or try again.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Settings" subtitle="Customize your Zeneva experience and manage core business configurations." />
      
      <ReauthDialog isOpen={isReauthOpen} onOpenChange={setIsReauthOpen} onSuccess={onReauthSuccess} onCancel={() => setPendingAction(null)} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Subscription & Billing
          </CardTitle>
          <CardDescription>
            Manage your Zeneva subscription plan and apply activation codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md bg-muted/40">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <div className="text-lg font-semibold flex items-center gap-2 capitalize">
                  {mockSubscriptionTiers.find(t => t.id === currentBusiness?.subscriptionTierId)?.name || 'Loading...'}
                  <Badge variant="secondary">{currentBusiness?.status}</Badge>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/checkout?plan=pro">Upgrade Plan</Link>
              </Button>
            </div>
            <form onSubmit={handleApplyActivationCode} className="space-y-2">
              <Label htmlFor="activationCode">Have an Activation Code?</Label>
              <div className="flex gap-2">
                <Input 
                  id="activationCode" 
                  value={activationCode} 
                  onChange={e => setActivationCode(e.target.value)} 
                  placeholder="Enter code here"
                  data-ai-hint="activation code input"
                  disabled={isApplyingCode || attemptCount >= MAX_ATTEMPTS}
                />
                <Button type="submit" disabled={isApplyingCode || attemptCount >= MAX_ATTEMPTS}>
                  {isApplyingCode ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
                  Apply Code
                </Button>
              </div>
              {attemptCount >= MAX_ATTEMPTS && <p className="text-xs text-destructive">You have reached the maximum number of attempts for today.</p>}
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Business Details
          </CardTitle>
          <CardDescription>
            Manage your store's fundamental information for Zeneva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
              e.preventDefault();
              handleSettingsSubmit("Business Details", {
                type: 'businessMeta',
                data: { businessName, businessAddress, businessPhone, businessEmail }
              });
            }} className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-1" data-ai-hint="business name input"/>
            </div>
            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea id="businessAddress" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="123 Main St, Anytown, Country" className="mt-1" data-ai-hint="address text area"/>
            </div>
            <div>
              <Label htmlFor="businessPhone">Business Phone</Label>
              <Input id="businessPhone" type="tel" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} placeholder="+2348012345678" className="mt-1" data-ai-hint="phone number input"/>
            </div>
             <div>
              <Label htmlFor="businessEmail">Business Email (for communications)</Label>
              <Input id="businessEmail" type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="contact@mystore.com" className="mt-1" data-ai-hint="email input"/>
            </div>
            <Button type="submit" disabled={isSaving["Business Details"]}>
              {isSaving["Business Details"] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              Save Business Details
            </Button>
          </form>
        </CardContent>
      </Card>
    
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial Settings
          </CardTitle>
          <CardDescription>
            Manage your business's bank account details for Zeneva. This account is displayed during POS payment for 'Bank Transfer'. Requires password re-authentication to save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
              e.preventDefault();
              handleSettingsSubmit("Financial Settings", { paymentBankAccountId, paymentBankName, paymentInstructions });
            }} className="space-y-4">
            <div>
              <Label htmlFor="paymentBankAccountId">Business Bank Account Number (for payments)</Label>
              <Input id="paymentBankAccountId" value={paymentBankAccountId} onChange={e => setPaymentBankAccountId(e.target.value)} placeholder="e.g., 0123456789" className="mt-1" data-ai-hint="account number input"/>
            </div>
             <div>
              <Label htmlFor="paymentBankName">Bank Name</Label>
              <Input id="paymentBankName" value={paymentBankName} onChange={e => setPaymentBankName(e.target.value)} placeholder="e.g., First Bank of Zeneva (Business)" className="mt-1" data-ai-hint="bank name input"/>
            </div>
            <div>
              <Label htmlFor="paymentInstructions">Payment Instructions for Invoices (Optional)</Label>
              <Textarea id="paymentInstructions" value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} placeholder="e.g., Please make payments to the account above. Reference your invoice number." className="mt-1" data-ai-hint="payment instructions text area"/>
            </div>
            <Button type="submit" disabled={isSaving["Financial Settings"]}>
              {isSaving["Financial Settings"] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <KeyRound className="mr-2 h-4 w-4" />}
              Save Financial Settings
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
