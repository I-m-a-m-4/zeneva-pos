
"use client";

import *as React from 'react';
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
import type { BusinessSettings, ActivationCode } from '@/types';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { mockSubscriptionTiers } from '@/lib/data';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { calculateNewTrialEndDate } from '@/lib/utils';


const dummyVendorPolicyTemplate = `
**Zeneva Inventory Vendor/Operator Agreement**

This agreement outlines the terms and conditions for vendors/operators using the Zeneva Inventory system provided by [Business Name].

**1. Access and Use:**
   - Access is granted solely for performing assigned duties related to sales, inventory, or other specified tasks.
   - User credentials (username/password) must be kept confidential and not shared.
   - Unauthorized access or use of system features is strictly prohibited.

**2. Data Integrity & Accuracy:**
   - All data entered (sales, stock adjustments, customer information) must be accurate and truthful.
   - Any discrepancies or errors identified must be reported to management immediately.

**3. Inventory Management:**
   - Follow all prescribed procedures for recording stock movements (inflows, outflows, transfers).
   - Report any damaged, expired, or missing stock promptly through the designated channels.

**4. Sales Processing:**
   - Accurately record all sales transactions.
   - Handle cash and other payment methods according to company policy.
   - Issue receipts for all transactions.

**5. Confidentiality:**
   - Business data, customer information, sales figures, and any proprietary information accessed through Zeneva Inventory are confidential and must not be disclosed to third parties.

**6. System Security:**
   - Do not attempt to bypass security measures or access restricted areas of the system.
   - Report any suspected security vulnerabilities immediately.

**7. Compliance:**
   - Comply with all company policies and procedures related to the use of Zeneva Inventory.
   - Adherence to this agreement is a condition of continued access to the system.

**Breach of this agreement may result in disciplinary action, up to and including termination of access and/or employment/contract, and legal action if applicable.**

By signing below, you acknowledge that you have read, understood, and agree to abide by the terms of this Vendor/Operator Agreement.

---
Signature: _________________________
Date: _________________________
Printed Name: _________________________
`;

const OWNER_ACCESS_KEY_STORAGE = "zeneva-inventory-owner-access-key";

export default function SettingsPage() {
  const { toast } = useToast();
  const { currentBusinessId, businessSettings, status: authStatus, fetchUserRolesAndSelectFirstBusiness, user, currentBusiness, updateCurrentBusiness } = useAuth();
  
  const [isSaving, setIsSaving] = React.useState<Record<string, boolean>>({});
  
  // Form states, initialized from businessSettings or defaults
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

  const [vendorPolicy, setVendorPolicy] = React.useState(dummyVendorPolicyTemplate);
  const [enableVendorPolicy, setEnableVendorPolicy] = React.useState(false);

  const [currentOwnerPassword, setCurrentOwnerPassword] = React.useState("");
  const [newOwnerPassword, setNewOwnerPassword] = React.useState("");
  const [confirmNewOwnerPassword, setConfirmNewOwnerPassword] = React.useState("");
  const [showCurrentOwnerPassword, setShowCurrentOwnerPassword] = React.useState(false);
  const [showNewOwnerPassword, setShowNewOwnerPassword] = React.useState(false);
  const [showConfirmNewOwnerPassword, setShowConfirmNewOwnerPassword] = React.useState(false);

  const [enableLoyaltyProgram, setEnableLoyaltyProgram] = React.useState(true);
  const [pointsPerUnit, setPointsPerUnit] = React.useState("1"); 
  const [loyaltyPointsForReward, setLoyaltyPointsForReward] = React.useState("1000");
  const [rewardDiscountPercentage, setRewardDiscountPercentage] = React.useState("10");

  const [activationCode, setActivationCode] = React.useState("");
  const [isApplyingCode, setIsApplyingCode] = React.useState(false);

  React.useEffect(() => {
    if (businessSettings) {
      setCurrency(businessSettings.currency || "NGN");
      setTimezone(businessSettings.timezone || "Africa/Lagos");
      setDefaultTaxRate(String(businessSettings.defaultTaxRate || 7.5));
      setPaymentBankAccountId(businessSettings.paymentBankAccountId || "");
      setPaymentBankName(businessSettings.paymentBankName || "");
      setPaymentInstructions(businessSettings.paymentInstructions || "");
      setEnableVendorPolicy(businessSettings.vendorPolicyEnabled || false);
      setVendorPolicy(businessSettings.vendorPolicyText || dummyVendorPolicyTemplate);
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

  const handleSettingsSubmit = async (formName: string, settingsToSave: Partial<BusinessSettings> | { type: 'businessMeta', data: any }) => {
    if (!currentBusinessId) {
      toast({ variant: "destructive", title: "Error", description: "No active business selected." });
      return;
    }
    setIsSaving(prev => ({ ...prev, [formName]: true }));

    try {
      const businessDocRef = doc(db, "businessInstances", currentBusinessId);
      
      if ('type' in settingsToSave && settingsToSave.type === 'businessMeta') {
        const dataToUpdate = {
          businessName: settingsToSave.data.businessName,
          'businessDetails.address': settingsToSave.data.businessAddress,
          'businessDetails.phone': settingsToSave.data.businessPhone,
          'businessDetails.email': settingsToSave.data.businessEmail,
          updatedAt: new Date()
        };
        await updateDoc(businessDocRef, dataToUpdate);
        updateCurrentBusiness({ ...settingsToSave.data });
      } else {
        const updatedSettings: Record<string, any> = {};
        for (const key in settingsToSave) {
          updatedSettings[`settings.${key}`] = (settingsToSave as Partial<BusinessSettings>)[key as keyof BusinessSettings];
        }
        updatedSettings['updatedAt'] = new Date();
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
  };
  
  const handleOwnerPasswordChangeSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newOwnerPassword !== confirmNewOwnerPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
      });
      return;
    }
    if (newOwnerPassword.length < 6) {
        toast({
            variant: "destructive",
            title: "Password Too Short",
            description: "New password must be at least 6 characters long.",
        });
        return;
    }
    try {
      localStorage.setItem(OWNER_ACCESS_KEY_STORAGE, newOwnerPassword);
      toast({
        variant: "success",
        title: "Owner Access Password Updated",
        description: "The password for accessing User & Staff Management has been changed (locally stored).",
      });
      setCurrentOwnerPassword("");
      setNewOwnerPassword("");
      setConfirmNewOwnerPassword("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Storage Error",
        description: "Could not save the new password. LocalStorage might be disabled or full.",
      });
    }
  };


  const handleLoyaltySettingsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSettingsSubmit("Loyalty Program", {
        loyaltyProgramEnabled: enableLoyaltyProgram,
        pointsPerUnit: parseFloat(pointsPerUnit) || 1,
        loyaltyPointsForReward: parseInt(loyaltyPointsForReward) || 1000,
        loyaltyRewardDiscountPercentage: parseFloat(rewardDiscountPercentage) || 10,
    } as any);
  };

  const handleApplyActivationCode = async (event: React.FormEvent) => {
    event.preventDefault();
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

      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: "Invalid or Used Code", description: "The activation code you entered is not valid or has already been used." });
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
        updatedAt: new Date()
      });
      
      batch.update(codeDocRef, {
        status: 'Used',
        usedAt: new Date().toISOString(),
        usedByInstanceId: currentBusinessId,
        usedByEmail: user?.email,
      });

      await batch.commit();
      
      // Update local auth context to reflect changes immediately
      if(user) {
        await fetchUserRolesAndSelectFirstBusiness(user);
      }

      toast({
        variant: "success",
        title: "Code Applied Successfully!",
        description: `Your plan has been upgraded to ${mockSubscriptionTiers.find(t => t.id === codeData.tierId)?.name || 'the new tier'}.`,
      });
      setActivationCode("");
    } catch (error) {
      console.error("Error applying activation code:", error);
      toast({ variant: "destructive", title: "Activation Failed", description: (error as Error).message });
    } finally {
      setIsApplyingCode(false);
    }
  };

  const handleDownloadPolicy = () => {
    if (!vendorPolicy.trim()) {
      toast({
        variant: "destructive",
        title: "Policy Empty",
        description: "There is no policy content to download.",
      });
      return;
    }

    const blob = new Blob([vendorPolicy], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'zeneva_vendor_policy.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      variant: "success",
      title: "Policy Downloaded",
      description: "The vendor policy has been downloaded as a .txt file.",
    });
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
                <p className="text-lg font-semibold flex items-center gap-2">
                  {mockSubscriptionTiers.find(t => t.id === currentBusiness?.subscriptionTierId)?.name || 'Loading...'}
                  <Badge variant="secondary">{currentBusiness?.status}</Badge>
                </p>
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
                />
                <Button type="submit" disabled={isApplyingCode}>
                  {isApplyingCode ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
                  Apply Code
                </Button>
              </div>
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
            <Paintbrush className="h-5 w-5 text-primary" />
            Brand Customization (Zeneva)
          </CardTitle>
          <CardDescription>
            Personalize the app's appearance to match your brand. (Theme changes may require app refresh)
          </CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={(e) => {
              e.preventDefault();
              toast({ variant: "success", title: "Brand Customization Saved (Locally Applied)", description: "Colors applied. Full theme saving requires backend and globals.css update." });
            }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="primaryColor" className="mb-1 block">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input type="color" id="primaryColor" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="p-1 h-10 w-14 block" data-ai-hint="color picker"/>
                  <Input type="text" value={primaryColor} readOnly className="bg-muted" data-ai-hint="color hex code"/>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Used for main actions, active states, and highlights.</p>
              </div>
              <div>
                <Label htmlFor="backgroundColor" className="mb-1 block">Background Color</Label>
                 <div className="flex items-center gap-2">
                  <Input type="color" id="backgroundColor" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="p-1 h-10 w-14 block" data-ai-hint="color picker"/>
                  <Input type="text" value={backgroundColor} readOnly className="bg-muted" data-ai-hint="color hex code"/>
                </div>
                <p className="text-xs text-muted-foreground mt-1">The main background color of the application.</p>
              </div>
              <div>
                <Label htmlFor="accentColor" className="mb-1 block">Accent Color</Label>
                <div className="flex items-center gap-2">
                  <Input type="color" id="accentColor" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="p-1 h-10 w-14 block" data-ai-hint="color picker"/>
                  <Input type="text" value={accentColor} readOnly className="bg-muted" data-ai-hint="color hex code"/>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Highlights key interactive elements and calls to action.</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Button type="submit" disabled={isSaving["Brand Customization"]}>
                 {isSaving["Brand Customization"] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Save Customizations
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Loyalty & Rewards Program (Zeneva)
          </CardTitle>
          <CardDescription>
            Configure your customer loyalty program. Define how points are earned and what rewards customers can unlock.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoyaltySettingsSubmit} className="space-y-6">
            <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
              <Switch 
                id="enableLoyaltyProgram" 
                checked={enableLoyaltyProgram}
                onCheckedChange={setEnableLoyaltyProgram}
              />
              <Label htmlFor="enableLoyaltyProgram" className="text-base">Enable Customer Loyalty Program</Label>
            </div>

            {enableLoyaltyProgram && (
              <>
                <div className="space-y-2 p-4 border rounded-md bg-muted/40 shadow-sm">
                    <h4 className="font-medium text-md text-foreground flex items-center gap-2"><Gift className="h-4 w-4 text-primary"/> How Customers Earn Points:</h4>
                    <div className="space-y-1">
                        <Label htmlFor="pointsPerUnit" className="text-sm">Points Earned per unit of currency spent</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="pointsPerUnit" 
                                type="number" 
                                value={pointsPerUnit}
                                onChange={(e) => setPointsPerUnit(e.target.value)}
                                placeholder="e.g., 1" 
                                className="w-24" 
                                data-ai-hint="points per unit input"
                            />
                            <span>points per {businessSettings?.currency || '...'}1.00</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Example: If set to '1', a customer spending 100 units earns 100 points.</p>
                    </div>
                </div>
                
                <Separator />

                <div className="space-y-4 p-4 border rounded-md bg-muted/40 shadow-sm">
                    <h4 className="font-medium text-md text-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600"/> Defining Rewards:</h4>
                    <p className="text-sm text-muted-foreground">Set up reward tiers. When a customer accumulates enough points, they can redeem them for a reward.</p>
                    
                    <div className="p-3 border rounded-md bg-background">
                        <Label className="font-semibold text-sm">Default Reward Tier (Example)</Label>
                        <p className="text-xs text-muted-foreground mb-2">Configure the primary reward customers can achieve.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor="loyaltyPointsForReward">Points Needed for Reward</Label>
                              <Input 
                                id="loyaltyPointsForReward" 
                                type="number" 
                                value={loyaltyPointsForReward}
                                onChange={(e) => setLoyaltyPointsForReward(e.target.value)}
                                placeholder="e.g., 1000" 
                                className="mt-1" 
                                data-ai-hint="loyalty points threshold input"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="rewardDiscountPercentage">Reward: Discount Percentage (%)</Label>
                              <Input 
                                id="rewardDiscountPercentage" 
                                type="number" 
                                step="0.1" 
                                value={rewardDiscountPercentage}
                                onChange={(e) => setRewardDiscountPercentage(e.target.value)}
                                placeholder="e.g., 10" 
                                className="mt-1" 
                                data-ai-hint="discount percentage input"
                              />
                            </div>
                        </div>
                         <div className="mt-3 space-y-1">
                            <Label>Reward Type (Conceptual)</Label>
                              <Select defaultValue="percentage_discount">
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select reward type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage_discount">Percentage Discount on Next Purchase</SelectItem>
                                  <SelectItem value="fixed_amount_off" disabled>Fixed Amount Off (Planned)</SelectItem>
                                  <SelectItem value="free_item" disabled>Specific Free Item (Planned)</SelectItem>
                                </SelectContent>
                              </Select>
                               <p className="text-xs text-muted-foreground mt-1">The discount percentage above is the primary active reward mechanism for this tier.</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2"> (Support for multiple reward tiers and more complex reward types is planned.)</p>
                </div>
              </>
            )}
            <div className="mt-6">
                <Button type="submit" disabled={isSaving["Loyalty Program"]}>
                  {isSaving["Loyalty Program"] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Save Loyalty Settings
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Regional Settings
          </CardTitle>
          <CardDescription>
            Set your currency, timezone, and other regional preferences for Zeneva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
              e.preventDefault();
              handleSettingsSubmit("Regional Settings", { currency, timezone });
            }} className="space-y-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full md:w-[280px] mt-1">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                  <SelectItem value="GHS">Ghanaian Cedi (₵)</SelectItem>
                  <SelectItem value="KES">Kenyan Shilling (KSh)</SelectItem>
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground mt-1">This will change the currency symbol across Zeneva.</p>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select name="timezone" value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full md:w-[280px] mt-1">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Lagos">(GMT+01:00) West Africa Time</SelectItem>
                  <SelectItem value="America/New_York">(GMT-04:00) Eastern Time</SelectItem>
                  <SelectItem value="Europe/London">(GMT+01:00) London</SelectItem>
                   <SelectItem value="Africa/Nairobi">(GMT+03:00) East Africa Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSaving["Regional Settings"]}>
              {isSaving["Regional Settings"] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              Save Regional Settings
            </Button>
          </form>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" />
            Tax Configuration
          </CardTitle>
          <CardDescription>
            Set up default tax rates for your sales. Applied during POS transactions in Zeneva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
              e.preventDefault();
              handleSettingsSubmit("Tax Configuration", { defaultTaxRate: parseFloat(defaultTaxRate) || 0 });
            }} className="space-y-4">
            <div>
              <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
              <Input id="defaultTaxRate" type="number" value={defaultTaxRate} onChange={e => setDefaultTaxRate(e.target.value)} step="0.01" placeholder="e.g., 7.5" className="mt-1 w-full md:w-[180px]" data-ai-hint="tax rate input"/>
            </div>
             <Button type="submit" disabled={isSaving["Tax Configuration"]}>
                {isSaving["Tax Configuration"] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Save Tax Settings
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
            Manage your business's bank account details for Zeneva. This account is displayed during POS payment for 'Bank Transfer' to prevent fraud.
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
               <p className="text-xs text-muted-foreground mt-1">This account number will be displayed to customers for bank transfer payments via POS. Only Admins can change this.</p>
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
              {isSaving["Financial Settings"] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              Save Financial Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Owner Access Control (Zeneva)
          </CardTitle>
          <CardDescription>
            Set or change the password required to access the User & Staff Management section.
            <br />
            <strong className="text-destructive text-xs">Warning: For this prototype, the password is saved in browser localStorage and is not fully secure.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOwnerPasswordChangeSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentOwnerPassword">Current Access Password (Simulated)</Label>
              <div className="relative">
                <Input 
                  id="currentOwnerPassword" 
                  type={showCurrentOwnerPassword ? "text" : "password"} 
                  value={currentOwnerPassword}
                  onChange={(e) => setCurrentOwnerPassword(e.target.value)}
                  placeholder="Enter current password (if set)" 
                  className="mt-1" 
                  data-ai-hint="password input current"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 mt-0.5"
                  onClick={() => setShowCurrentOwnerPassword(!showCurrentOwnerPassword)}
                >
                  {showCurrentOwnerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="newOwnerPassword">New Access Password (min. 6 characters)</Label>
               <div className="relative">
                <Input 
                  id="newOwnerPassword" 
                  type={showNewOwnerPassword ? "text" : "password"} 
                  value={newOwnerPassword}
                  onChange={(e) => setNewOwnerPassword(e.target.value)}
                  placeholder="Enter new access password" 
                  className="mt-1" 
                  data-ai-hint="password input new"
                />
                 <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 mt-0.5"
                  onClick={() => setShowNewOwnerPassword(!showNewOwnerPassword)}
                >
                  {showNewOwnerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmNewOwnerPassword">Confirm New Access Password</Label>
              <div className="relative">
                <Input 
                  id="confirmNewOwnerPassword" 
                  type={showConfirmNewOwnerPassword ? "text" : "password"} 
                  value={confirmNewOwnerPassword}
                  onChange={(e) => setConfirmNewOwnerPassword(e.target.value)}
                  placeholder="Confirm new access password" 
                  className="mt-1" 
                  data-ai-hint="password input confirm"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 mt-0.5"
                  onClick={() => setShowConfirmNewOwnerPassword(!showConfirmNewOwnerPassword)}
                >
                  {showConfirmNewOwnerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit">Set/Update Access Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Vendor Policy Management (Zeneva)
          </CardTitle>
          <CardDescription>
            Define terms and conditions for vendors or staff operating the system. This can be presented to them for agreement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
              e.preventDefault();
              handleSettingsSubmit("Vendor Policy", { vendorPolicyEnabled: enableVendorPolicy, vendorPolicyText: vendorPolicy });
            }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendorPolicyText">Policy Document Text</Label>
              <Textarea 
                id="vendorPolicyText" 
                value={vendorPolicy} 
                onChange={(e) => setVendorPolicy(e.target.value)} 
                className="mt-1 min-h-[200px] font-mono text-xs"
                data-ai-hint="policy text editor"
              />
              <p className="text-xs text-muted-foreground">
                Edit the template above to create your business-specific vendor/operator policy for Zeneva. 
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="enableVendorPolicySwitch" 
                checked={enableVendorPolicy}
                onCheckedChange={setEnableVendorPolicy}
              />
              <Label htmlFor="enableVendorPolicySwitch">Enable Vendor Policy Agreement Requirement</Label>
            </div>
            <div className="flex gap-2">
                <Button type="submit" disabled={isSaving["Vendor Policy"]}>
                    {isSaving["Vendor Policy"] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Save Policy Settings
                </Button>
                <Button type="button" variant="outline" onClick={handleDownloadPolicy}>
                    <DownloadCloud className="mr-2 h-4 w-4"/>
                    Download Policy
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            My Account (Owner Profile for Zeneva)
          </CardTitle>
          <CardDescription>Manage your primary business owner profile and account preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ownerEmail">Email Address (Login)</Label>
            <Input id="ownerEmail" type="email" value={user?.email || ""} readOnly className="bg-muted" data-ai-hint="email display readonly"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Change Password (Conceptual - Requires Firebase Auth Integration)</Label>
            <div className="relative">
                <Input id="currentPassword" type="password" placeholder="Current Password" data-ai-hint="password input current"/>
            </div>
             <div className="relative">
                <Input id="newPassword" type="password" placeholder="New Password" data-ai-hint="password input new"/>
            </div>
             <div className="relative">
                <Input id="confirmNewPassword" type="password" placeholder="Confirm New Password" data-ai-hint="password input confirm"/>
            </div>
          </div>
           <Button variant="outline" onClick={() => toast({ title: "Update Profile (Conceptual)", description: "Owner profile update and password change requires full Firebase Authentication integration."})}>Update Profile</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Outlet Management (Zeneva)
          </CardTitle>
          <CardDescription>Manage your store locations or branches if you have multiple. (Functionality Planned)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Configure multiple store outlets, each with potentially separate inventory and staff assignments. This is planned for future versions.</p>
            <Button variant="outline" onClick={() => toast({ title: "Manage Outlets (Planned)", description: "Multi-outlet management is a planned feature."})}>Manage Outlets</Button>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings (Zeneva)
          </CardTitle>
          <CardDescription>Control how you receive alerts and updates. (Functionality Planned)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="lowStockAlerts" className="flex flex-col">
                    <span>Low Stock Alerts</span>
                    <span className="text-xs text-muted-foreground">Receive notifications for items nearing their reorder point.</span>
                </Label>
                <Switch id="lowStockAlerts" defaultChecked/>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="newOrderAlerts" className="flex flex-col">
                    <span>New Online Order Alerts (if applicable)</span>
                    <span className="text-xs text-muted-foreground">Get notified for new orders from integrated online stores.</span>
                </Label>
                <Switch id="newOrderAlerts" />
            </div>
            <Button variant="outline" onClick={() => toast({ title: "Save Notifications (Planned)", description: "Notification preferences will be saved with backend integration."})}>Save Notification Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}

    