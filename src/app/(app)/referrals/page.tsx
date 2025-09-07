
"use client";

import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Copy, Share2, Users, BarChart3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';

export default function ReferralsPage() {
    const { toast } = useToast();
    const referralCode = "REF123XYZ"; 
    const referralLink = `https://zeneva.app/signup?ref=${referralCode}`;

    const handleCopy = (textToCopy: string, type: 'link' | 'code') => {
        navigator.clipboard.writeText(textToCopy);
        toast({
            title: `${type === 'link' ? 'Link' : 'Code'} Copied!`,
            description: `Your Zeneva referral ${type} has been copied to your clipboard.`,
            variant: "success"
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <PageTitle title="Referrals & Rewards" subtitle="Share Zeneva and earn rewards." />

            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="h-6 w-6" /> Your Referral Dashboard
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                        Invite other business owners to Zeneva. For every new business that signs up and subscribes using your code, you'll both receive a reward!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 p-4 rounded-lg bg-black/20">
                        <label className="text-sm font-medium">Your Unique Referral Code</label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                readOnly
                                value={referralCode}
                                className="font-mono text-lg bg-white/90 text-primary-foreground"
                            />
                            <Button variant="secondary" onClick={() => handleCopy(referralCode, 'code')}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Code
                            </Button>
                        </div>
                    </div>
                     <div className="space-y-2 p-4 rounded-lg bg-black/20">
                        <label className="text-sm font-medium">Your Shareable Link</label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="font-mono text-sm bg-white/90 text-primary-foreground"
                            />
                            <Button variant="secondary" onClick={() => handleCopy(referralLink, 'link')}>
                                <Share2 className="mr-2 h-4 w-4" /> Copy Link
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/> Referral Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-md">
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-muted-foreground">Successful Referrals</p>
                    </div>
                    <div className="p-4 bg-muted rounded-md">
                        <p className="text-2xl font-bold text-green-600">₦6,000</p>
                        <p className="text-sm text-muted-foreground">Total Earned (Simulated)</p>
                    </div>
                    <div className="p-4 bg-muted rounded-md">
                        <p className="text-2xl font-bold text-primary">3</p>
                        <p className="text-sm text-muted-foreground">Pending Invites</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Referred Businesses</CardTitle>
                     <CardDescription>
                        Track the status of businesses you've invited to Zeneva.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-muted-foreground">
                                    <th className="p-2">Business Name</th>
                                    <th className="p-2">Date Joined</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2 text-right">Your Reward</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2 font-medium">Global Imports Inc.</td>
                                    <td className="p-2">2024-07-15</td>
                                    <td className="p-2"><Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">Subscribed</Badge></td>
                                    <td className="p-2 text-right text-green-600 font-medium">+ ₦500</td>
                                </tr>
                                 <tr className="border-b">
                                    <td className="p-2 font-medium">Creative Designs Co.</td>
                                    <td className="p-2">2024-07-20</td>
                                    <td className="p-2"><Badge variant="outline">In Trial</Badge></td>
                                    <td className="p-2 text-right text-muted-foreground">Pending</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
