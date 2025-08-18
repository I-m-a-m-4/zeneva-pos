
"use client"

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, XAxis, YAxis, Bar, CartesianGrid, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { TrendingUp, Loader2 } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import type { Receipt } from '@/types';

const chartConfig = {
  totalSales: {
    label: "Total Sales (₦)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function OverviewChart() {
  const { currentBusinessId } = useAuth();
  const [chartData, setChartData] = React.useState<{ month: string; totalSales: number }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSalesData = async () => {
      if (!currentBusinessId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const receiptsQuery = query(collection(db, "receipts"), where("businessId", "==", currentBusinessId));
        const receiptsSnapshot = await getDocs(receiptsQuery);
        const receipts = receiptsSnapshot.docs.map(doc => doc.data() as Receipt);

        const monthlySales: Record<string, number> = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        receipts.forEach(receipt => {
          const date = new Date(receipt.date);
          const monthIndex = date.getMonth();
          const year = date.getFullYear();
          const currentYear = new Date().getFullYear();
          
          if (year === currentYear) { // Only consider sales from the current year
            const monthName = monthNames[monthIndex];
            monthlySales[monthName] = (monthlySales[monthName] || 0) + receipt.total;
          }
        });

        const formattedData = monthNames.map(month => ({
          month,
          totalSales: monthlySales[month] || 0,
        }));
        
        setChartData(formattedData);

      } catch (error) {
        console.error("Error fetching sales data for chart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [currentBusinessId]);

  const noData = !isLoading && chartData.every(d => d.totalSales === 0);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Monthly sales performance for the current year.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin"/>
          </div>
        ) : noData ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground">
            <TrendingUp className="h-16 w-16 opacity-50 mb-4" />
            <p className="text-lg font-medium">No Sales Data Available</p>
            <p className="text-sm">Sales will appear here once transactions are recorded.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  tickFormatter={(value) => `₦${(Number(value) / 1000).toLocaleString()}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" formatter={(value, name, props) => [`₦${Number(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, props.payload.month]} />}
                />
                <Bar dataKey="totalSales" fill="var(--color-totalSales)" radius={4} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
