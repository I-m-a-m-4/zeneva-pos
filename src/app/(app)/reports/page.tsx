
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChartBig, FileSearch, Download, Filter, ShoppingBag, Archive, UsersRound, TrendingDownIcon, FileText, Loader2, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from "firebase/firestore";
import type { Receipt, InventoryItem, Expense } from '@/types';

interface ReportData {
  totalSales: number;
  totalRevenue: number;
  lowStockItemsCount: number;
  totalExpenses: number;
}

export default function ReportsPage() {
  const [reportData, setReportData] = React.useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        // In a real app, these queries would be more complex and likely paginated/filtered by date
        const receiptsQuery = query(collection(db, "receipts"));
        const inventoryQuery = query(collection(db, "products"));
        const expensesQuery = query(collection(db, "expenses"));

        const [receiptsSnapshot, inventorySnapshot, expensesSnapshot] = await Promise.all([
          getDocs(receiptsQuery),
          getDocs(inventoryQuery),
          getDocs(expensesQuery),
        ]);

        const receipts = receiptsSnapshot.docs.map(doc => doc.data() as Receipt);
        const inventoryItems = inventorySnapshot.docs.map(doc => doc.data() as InventoryItem);
        const expenses = expensesSnapshot.docs.map(doc => doc.data() as Expense);

        const totalRevenue = receipts.reduce((sum, receipt) => sum + receipt.total, 0);
        const lowStockItemsCount = inventoryItems.filter(item => item.stock <= item.lowStockThreshold).length;
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        setReportData({
          totalSales: receipts.length,
          totalRevenue,
          lowStockItemsCount,
          totalExpenses,
        });

      } catch (error) {
        console.error("Error generating report data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not generate report data." });
      } finally {
        setIsLoading(false);
      }
    };
    // fetchReportData(); 
    // Commenting out to use mock data for demo purposes, uncomment for live data
    setTimeout(() => {
        setReportData({ totalSales: 152, totalRevenue: 1250000, lowStockItemsCount: 8, totalExpenses: 350000 });
        setIsLoading(false);
    }, 1000);
  }, [toast]);


  const availableReports = [
    { title: "Sales Summary", description: "Overview of total sales, revenue, and profit over selected periods.", icon: ShoppingBag, href: "#", data: reportData ? `${reportData.totalSales} sales | ₦${reportData.totalRevenue.toLocaleString()}` : "Loading..." },
    { title: "Inventory Valuation", description: "Current value of your stock on hand, broken down by item or category.", icon: Archive, href: "#", data: "Feature in development" },
    { title: "Low Stock Report", description: "List of items that are running low or out of stock based on thresholds.", icon: TrendingDownIcon, href: "#", data: reportData ? `${reportData.lowStockItemsCount} items` : "Loading..." },
    { title: "Customer Purchase History", description: "Analyze buying patterns and identify top customers.", icon: UsersRound, href: "#", data: "View All Customers" },
    { title: "Expense Report", description: "Detailed breakdown of your business expenses by category or vendor.", icon: FileText, href: "#", data: reportData ? `Total: ₦${reportData.totalExpenses.toLocaleString()}` : "Loading..." }, 
    { title: "Profit & Loss Statement", description: "Compare revenues against costs and expenses.", icon: BarChart2, href: "#", data: "View Statement"},
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Business Reports & Analytics" subtitle="Gain insights into your business performance.">
         <Button variant="outline" onClick={() => alert("Date range and other filter options would appear here.")}>
            <Filter className="mr-2 h-4 w-4" />
            Filter Reports
        </Button>
        <Button variant="outline" onClick={() => alert("Global export options for reports would appear here.")}>
            <Download className="mr-2 h-4 w-4" />
            Export All (Summary)
        </Button>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Reporting Suite</CardTitle>
          <CardDescription>
            Generate various reports to understand sales trends, inventory levels, customer behavior, financial health, and more. 
            Use these insights to make data-driven decisions and optimize your business operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-20"><Loader2 className="h-12 w-12 text-primary animate-spin mx-auto"/></div>
          ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableReports.map(report => (
                    <Card key={report.title} className="hover:shadow-lg transition-shadow flex flex-col">
                        <CardHeader className="items-start">
                            <report.icon className="h-8 w-8 text-primary mb-3" />
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription className="text-xs h-10">{report.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow mt-auto">
                            <p className="text-sm font-semibold text-muted-foreground mb-4">{report.data}</p>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => alert(`Viewing ${report.title}. Full report generation is pending.`)}>
                                Generate Report
                            </Button>
                        </CardContent>
                    </Card>
                ))}
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
