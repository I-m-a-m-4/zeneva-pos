
"use client";

import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Repeat, Activity, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react'; 

export default function CashFlowPage() {
  const cashFlowDataAvailable = true; 

  // Mock data for demonstration
  const mockInflows = {
    total: 1250500.75,
    breakdown: [
      { source: "Product Sales", amount: 1200000.00 },
      { source: "Service Fees", amount: 50500.75 },
    ]
  };
  const mockOutflows = {
    total: 450200.50,
    breakdown: [
      { category: "Rent", amount: 150000.00 },
      { category: "Supplier Payments", amount: 250000.00 },
      { category: "Utilities", amount: 50200.50 },
    ]
  };
  const netCashFlow = mockInflows.total - mockOutflows.total;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Cash Flow" subtitle="Monitor your business's cash inflows and outflows with Zeneva.">
        <Button variant="outline" onClick={() => alert("Date range filter options would appear here.")}>
            <Filter className="mr-2 h-4 w-4" />
            Filter by Date
        </Button>
        <Button variant="outline" onClick={() => alert("Export cash flow report options would appear here.")}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
        </Button>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement (Zeneva)</CardTitle>
           <CardDescription>
            View a summary of cash movements within your business over specific periods. This includes cash from sales (inflows), operational expenses (outflows), 
            investments, and financing activities. Understanding your cash flow is crucial for financial health and planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cashFlowDataAvailable ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-green-500/10 border-l-4 border-green-600">
                    <CardHeader>
                        <CardTitle className="text-green-700 flex items-center"><TrendingUp className="mr-2 h-5 w-5"/>Total Inflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-700">₦{mockInflows.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        <p className="text-xs text-muted-foreground">From sales and other income.</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-l-4 border-red-600">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center"><TrendingDown className="mr-2 h-5 w-5"/>Total Outflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-700">₦{mockOutflows.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        <p className="text-xs text-muted-foreground">From expenses and purchases.</p>
                    </CardContent>
                </Card>
                 <Card className={netCashFlow >= 0 ? "bg-blue-500/10 border-l-4 border-blue-600" : "bg-orange-500/10 border-l-4 border-orange-600"}>
                    <CardHeader>
                        <CardTitle className={netCashFlow >= 0 ? "text-blue-700 flex items-center" : "text-orange-700 flex items-center"}>
                            <Repeat className="mr-2 h-5 w-5"/>Net Cash Flow
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                            ₦{netCashFlow.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Inflows - Total Outflows.</p>
                    </CardContent>
                </Card>
              </div>
               <p className="text-sm text-muted-foreground">Detailed cash flow reports, charts visualizing trends, and breakdowns by category will appear here with full data integration in Zeneva.</p>
              {}
              
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <Activity className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Cash Flow Data to Display in Zeneva</h3>
              <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
                Your cash flow summary will be automatically generated based on recorded sales, expenses, and other financial activities. 
                Accurate cash flow statements help you:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mb-6 text-left inline-block">
                <li>Understand your business's liquidity.</li>
                <li>Make informed decisions about spending and investment.</li>
                <li>Identify potential cash shortages or surpluses.</li>
                <li>Plan for future growth and financial obligations.</li>
              </ul>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <Link href="/sales">Record Sales</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/expenses">Record Expenses</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
       <Card className="mt-4">
        <CardHeader>
            <CardTitle>Understanding Cash Flow Components (Zeneva)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Operating Activities:</strong> Cash generated from normal business operations (e.g., sales, payments to suppliers, employee salaries).</p>
            <p><strong>Investing Activities:</strong> Cash related to the purchase or sale of long-term assets (e.g., equipment, property).</p>
            <p><strong>Financing Activities:</strong> Cash related to debt, equity, and dividends (e.g., loans, owner investments, loan repayments).</p>
            <p className="mt-2">Zeneva aims to help you track these to provide a clear picture of your financial health.</p>
        </CardContent>
      </Card>
    </div>
  );
}
