
"use client";

import Link from 'next/link';
import { ChevronRight, ReceiptText, Tags, Percent, FileSpreadsheet, Truck, Globe, Repeat, FileText, Landmark, Users2, BarChartBig, UserCog, Settings, ShieldQuestion, Lightbulb, ActivityIcon, GiftIcon, ShieldAlert, Wrench } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { UserRole } from '@/types';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MoreLink {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  roles: UserRole[];
}

interface MoreLinkGroup {
  title: string;
  links: MoreLink[];
}

const linkGroups: MoreLinkGroup[] = [
    {
        title: "Sales & Customers",
        links: [
            { href: "/sales", icon: ReceiptText, title: "Sales Transactions", description: "View all past sales records.", roles: ['admin', 'manager'] },
            { href: "/customers", icon: Users2, title: "Customers (CRM)", description: "Manage your customer database.", roles: ['admin', 'manager'] },
            { href: "/discount", icon: Percent, title: "Discounts & Promotions", description: "Create and manage special offers.", roles: ['admin', 'manager'] },
        ]
    },
    {
        title: "Financials",
        links: [
            { href: "/cash-flow", icon: Repeat, title: "Cash Flow", description: "Monitor your cash inflows and outflows.", roles: ['admin', 'manager'] },
            { href: "/expenses", icon: FileText, title: "Expenses", description: "Track your business operational costs.", roles: ['admin', 'manager'] },
        ]
    },
    {
        title: "Advanced Tools",
        links: [
            { href: "/reports", icon: BarChartBig, title: "Reports & Analytics", description: "Gain insights into business performance.", roles: ['admin', 'manager', 'vendor_operator'] },
            { href: "/inventory/troubleshoot", icon: Wrench, title: "Troubleshoot Inventory", description: "Find and fix issues in your product data.", roles: ['admin', 'manager'] },
            { href: "/insights", icon: Lightbulb, title: "AI Business Insights", description: "Get AI-powered growth suggestions.", roles: ['admin'] },
        ]
    },
    {
        title: "Administration",
        links: [
            { href: "/settings", icon: Settings, title: "Settings", description: "Configure your business and app settings.", roles: ['admin'] },
            { href: "/users-staff", icon: UserCog, title: "Users & Staff", description: "Manage team access and permissions.", roles: ['admin'] },
            { href: "/audit-logs", icon: ShieldQuestion, title: "Audit Logs", description: "Track critical system activities.", roles: ['admin'] },
        ]
    }
];


const MoreLinkItem = ({ href, icon: Icon, title, description }: Omit<MoreLink, 'roles'>) => (
    <Link href={href} className="flex items-center p-4 hover:bg-muted/50 transition-colors">
        <Icon className="h-6 w-6 text-primary mr-4" />
        <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
);

export default function MorePage() {
    const { currentRole } = useAuth();
    
    const visibleLinkGroups = linkGroups.map(group => ({
        ...group,
        links: group.links.filter(link => link.roles.includes(currentRole!))
    })).filter(group => group.links.length > 0);

    return (
        <div className="pb-16 space-y-6">
            <PageTitle title="Tools & More" subtitle="Access all features and settings from here." />
            {visibleLinkGroups.map(group => (
                 <Card key={group.title}>
                    <CardHeader>
                        <CardTitle className="text-lg">{group.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                        {group.links.map(link => (
                            <MoreLinkItem key={link.href} {...link} />
                        ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
