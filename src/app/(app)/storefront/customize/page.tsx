
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Paintbrush, Palette, Briefcase, Eye, Loader2 } from 'lucide-react'; 
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export default function CustomizeStorefrontPage() {
  const { toast } = useToast();
  const { currentBusinessId } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);
  const [storeName, setStoreName] = React.useState("My Awesome Store");
  const [storeDescription, setStoreDescription] = React.useState("Welcome to our store! We sell the best widgets in town.");
  const [primaryColor, setPrimaryColor] = React.useState("#558BFF");
  const [accentColor, setAccentColor] = React.useState("#7A53FF");
  
  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate saving changes
    setTimeout(() => {
      toast({
        title: "Changes Saved (Simulated)",
        description: "Your storefront customization has been saved.",
      });
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Customize Your Storefront" subtitle="Personalize the look and feel of your public-facing store.">
        <Button variant="outline" asChild>
          <Link href={`/b/${currentBusinessId}/products`} target="_blank">
             <Eye className="mr-2 h-4 w-4" /> View Live Store
          </Link>
        </Button>
      </PageTitle>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column for settings */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Store Details
                  </CardTitle>
                  <CardDescription>
                    Set your public store name and a short welcome message or description.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input id="storeName" value={storeName} onChange={e => setStoreName(e.target.value)} className="mt-1" data-ai-hint="store name input"/>
                  </div>
                  <div>
                    <Label htmlFor="storeDescription">Store Welcome Message</Label>
                    <Textarea id="storeDescription" value={storeDescription} onChange={e => setStoreDescription(e.target.value)} placeholder="A brief welcome to your customers..." className="mt-1" data-ai-hint="store welcome message textarea"/>
                  </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Paintbrush className="h-5 w-5 text-primary" />
                    Appearance & Branding
                  </CardTitle>
                  <CardDescription>
                    Choose colors that match your brand identity. Upload a banner image.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label>Store Banner Image</Label>
                         <div className="mt-2 w-full aspect-video rounded-md border-2 border-dashed border-muted bg-muted/50 flex flex-col items-center justify-center relative group" data-ai-hint="image upload box">
                            <Image src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop" layout="fill" objectFit="cover" alt="Store banner" className="rounded-md" data-ai-hint="store banner"/>
                            <Button variant="outline" className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-10">Upload Banner</Button>
                         </div>
                        <p className="text-xs text-muted-foreground mt-1">Recommended size: 1200x400px.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="primaryColor" className="mb-1 block">Primary Color</Label>
                            <div className="flex items-center gap-2">
                              <Input type="color" id="primaryColor" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="p-1 h-10 w-14 block" data-ai-hint="color picker"/>
                              <Input type="text" value={primaryColor} readOnly className="bg-muted" data-ai-hint="color hex code"/>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Used for links, buttons, and highlights.</p>
                        </div>
                         <div>
                            <Label htmlFor="accentColor" className="mb-1 block">Accent Color</Label>
                             <div className="flex items-center gap-2">
                              <Input type="color" id="accentColor" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="p-1 h-10 w-14 block" data-ai-hint="color picker"/>
                              <Input type="text" value={accentColor} readOnly className="bg-muted" data-ai-hint="color hex code"/>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Used for secondary actions or decorative elements.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right column for preview */}
        <div className="lg:col-span-1">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>A rough preview of your storefront.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-4 space-y-4 bg-background">
                         <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">[Banner Image]</p>
                         </div>
                         <h3 className="font-bold text-xl" style={{ color: primaryColor }}>{storeName || "Your Store Name"}</h3>
                         <p className="text-sm text-muted-foreground">{storeDescription || "Your welcome message..."}</p>
                         <Button style={{ backgroundColor: primaryColor }} className="w-full text-white">Example Button</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
