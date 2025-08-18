
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Cloud, Smartphone, WifiOff, Users, Package, BarChart2, CreditCard, ScanBarcode, ShieldCheck, Smile, Zap } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Streamlined Operations",
    description: "Automate inventory updates with our POS, simplify sales, and reduce manual tasks, giving you more time to focus on growth.",
  },
  {
    icon: <Package className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Smart Inventory Control",
    description: "Always know your exact stock levels. Get low stock alerts, manage product variations, and prevent overselling before it happens.",
  },
  {
    icon: <CreditCard className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Effortless Point of Sale",
    description: "Process sales quickly with our intuitive POS. Generate professional receipts and keep your customers happy and coming back.",
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Insightful Reporting",
    description: "Make data-driven decisions. Understand sales trends, customer behavior, and inventory performance to grow your business.",
  },
   {
    icon: <ShieldCheck className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Clarity & Peace of Mind",
    description: "Digital logs for every transaction provide a clear audit trail. Reduce guesswork, minimize discrepancies, and operate with confidence.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Customer Engagement Tools",
    description: "Build loyalty with features like waitlists for out-of-stock items and a planned rewards system to keep customers engaged.",
  },
  {
    icon: <Cloud className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Cloud-Based & Accessible",
    description: "Access your business data from anywhere, on any device. Your data is secure, synced, and always available.",
  },
  {
    icon: <WifiOff className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Works Offline (PWA)",
    description: "Keep selling even when the internet is down. Our installable Progressive Web App ensures your business never stops.",
  },
  {
    icon: <ScanBarcode className="h-10 w-10 text-primary mb-4 mx-auto" />,
    title: "Barcode Scanning Ready",
    description: "Speed up checkouts and inventory management with integrated barcode scanning support for ultimate efficiency.",
  },
];

export default function FeaturesOverview() {
  return (
    <section id="features" className="py-16 md:py-24 bg-slate-900 text-center text-white bg-pattern-dots-sm">
      <div className="container">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Gain <span className="text-gradient-primary-accent">Effortless Control & Clear Insights</span> to Grow Your Business
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-slate-400 md:text-lg">
            Zeneva is packed with features designed to simplify your operations, provide actionable insights, and help you sell more effectively.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={feature.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s`}}>
              <Card className="flex flex-col items-center text-center shadow-lg hover:shadow-primary/20 transition-shadow duration-300 ease-in-out transform hover:-translate-y-1.5 bg-slate-800/50 backdrop-blur-sm border-white/10 h-full">
                <CardHeader>
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-400">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
