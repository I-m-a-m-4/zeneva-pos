
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";

const partners = [
    { name: "docusign", logoUrl: "https://www.logo.wine/a/logo/DocuSign/DocuSign-Logo.wine.svg" },
    { name: "AliExpress", logoUrl: "https://www.logo.wine/a/logo/AliExpress/AliExpress-Logo.wine.svg" },
    { name: "MANISCHEWITZ", logoUrl: "https://www.logo.wine/a/logo/Manischewitz/Manischewitz-Logo.wine.svg" },
    { name: "Walmart", logoUrl: "https://www.logo.wine/a/logo/Walmart/Walmart-Logo.wine.svg" },
    { name: "MARKET BASKET", logoUrl: "https://www.logo.wine/a/logo/Market_Basket/Market_Basket-Logo.wine.svg" },
    { name: "TRADER JOE'S", logoUrl: "https://www.logo.wine/a/logo/Trader_Joe's/Trader_Joe's-Logo.wine.svg" },
];

const FeatureCard = ({ title, description, imageUrl, imageHint, className, bgColor = 'bg-background' }: { title: string, description: string, imageUrl: string, imageHint: string, className?: string, bgColor?: string }) => (
    <Card className={`group relative flex flex-col justify-between overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
        <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-auto">
            <Image
                src={imageUrl}
                alt={title}
                width={800}
                height={500}
                className="w-full h-auto object-cover object-left-top border-t"
                data-ai-hint={imageHint}
            />
        </CardContent>
    </Card>
);

export default function FeaturesOverview() {
    return (
        <section id="features" className="py-16 md:py-24 bg-background">
            <div className="container">
                <div className="flex flex-col items-center text-center mb-12">
                    <Badge variant="outline" className="mb-3 text-primary border-primary/50">Features</Badge>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Optimize Your Inventory with Smart Features
                    </h2>
                    <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-lg">
                        Gain full visibility and control over your stock, orders, and suppliers with intuitive solutions designed to streamline your operations.
                    </p>
                </div>

                <div className="relative flex overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)] mb-16">
                    <div className="flex w-max animate-scroll items-center">
                        {[...partners, ...partners].map((partner, index) => (
                             <span key={index} className="mx-8 text-2xl font-semibold text-muted-foreground/60 italic">{partner.name}</span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <FeatureCard
                        className="lg:col-span-3"
                        title="Real-Time Stock Monitoring"
                        description="Track inventory levels across all locations with instant updates."
                        imageUrl="https://ik.imagekit.io/imam/Zeneva/Frame%20143725287.png?updatedAt=1722283038676"
                        imageHint="dashboard stock monitoring widget"
                    />
                    <FeatureCard
                        className="lg:col-span-2"
                        title="Sales & Purchase Analytics"
                        description="Analyze sales trends and purchase patterns with comprehensive reporting tools."
                        imageUrl="https://ik.imagekit.io/imam/Zeneva/Frame%20143725286.png?updatedAt=1722283038597"
                        imageHint="sales analytics chart"
                    />
                    <FeatureCard
                        className="lg:col-span-2"
                        title="Best-Selling Product Insights"
                        description="Identify top-performing products and optimize your inventory for profitability."
                        imageUrl="https://ik.imagekit.io/imam/Zeneva/Frame%20143725285.png?updatedAt=1722283038562"
                        imageHint="best selling products list"
                    />
                    <FeatureCard
                        className="lg:col-span-3"
                        title="Automated Stock Alerts"
                        description="Receive alerts when stock levels are low to avoid outages and streamline reordering."
                        imageUrl="https://ik.imagekit.io/imam/Zeneva/Frame%20143725288.png?updatedAt=1722283038753"
                        imageHint="automated stock alerts UI"
                    />
                    <FeatureCard
                        className="lg:col-span-3"
                        title="Quick Product Add & Update"
                        description="Add new products and update existing listings effortlessly, ensuring your inventory data is always accurate and up-to-date."
                        imageUrl="https://ik.imagekit.io/imam/Zeneva/Frame%20143725289.png?updatedAt=1722283038682"
                        imageHint="add new product form UI"
                    />
                     <FeatureCard
                        className="lg:col-span-2"
                        title="Comprehensive Inventory Listings"
                        description="Easily view and manage all your products in one place with detailed inventory lists, including stock levels, SKUs, and supplier information."
                        imageUrl="https://ik.imagekit.io/imam/Zeneva/Frame%20143725290.png?updatedAt=1722283038675"
                        imageHint="inventory list table view"
                    />
                </div>
            </div>
        </section>
    );
}
