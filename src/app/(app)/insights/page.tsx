
"use client";

import * as React from 'react';
import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, PackageSearch, BarChart3, UsersRound, AlertTriangle, ArrowRightCircle, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateBusinessInsights, type BusinessInsightInput, type BusinessInsightOutput } from '@/ai/flows/business-insights-flow';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import type { InventoryItem, Receipt, SaleItem } from '@/types';


export default function InsightsPage() {
  const { currentRole, currentBusinessId } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [aiInsights, setAiInsights] = React.useState<BusinessInsightOutput['insights']>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentRole !== 'admin') {
      router.replace('/dashboard');
    }
  }, [currentRole, router]);

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    setError(null);
    setAiInsights([]);
    if (!currentBusinessId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Business ID not found.'});
        setIsGenerating(false);
        return;
    }

    try {
        const productsQuery = query(collection(db, "products"), where("businessId", "==", currentBusinessId));
        const receiptsQuery = query(collection(db, "receipts"), where("businessId", "==", currentBusinessId));

        const [productsSnapshot, receiptsSnapshot] = await Promise.all([
            getDocs(productsQuery),
            getDocs(receiptsQuery)
        ]);
        
        const products = productsSnapshot.docs.map(doc => doc.data() as InventoryItem);
        const receipts = receiptsSnapshot.docs.map(doc => doc.data() as Receipt);
        
        if (products.length === 0 || receipts.length === 0) {
            toast({ title: 'Not Enough Data', description: 'Need at least one product and one sale to generate insights.' });
            setIsGenerating(false);
            return;
        }

        const productDataForAI = products.map(p => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            price: p.price,
            category: p.category,
        }));

        const salesDataForAI = receipts.flatMap(r => r.items).map(item => ({
            itemName: item.itemName,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
        }));

        const input: BusinessInsightInput = {
            products: productDataForAI,
            sales: salesDataForAI,
        };

        const result = await generateBusinessInsights(input);
        setAiInsights(result.insights);
        toast({
            variant: "success",
            title: "Insights Generated!",
            description: "Zeneva AI has analyzed your data.",
        });
    } catch (e) {
        console.error("Error generating insights:", e);
        setError("Sorry, the AI assistant encountered an error. Please try again.");
        toast({
            variant: "destructive",
            title: "Error Generating Insights",
            description: "Could not get a response from the AI. Please check the console.",
        });
    } finally {
        setIsGenerating(false);
    }
  }
  
  const getInsightIcon = (type: string) => {
    switch(type) {
      case 'Restock Suggestion': return <PackageSearch className="h-5 w-5 text-blue-500" />;
      case 'Pricing Opportunity': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'Marketing Idea': return <BarChart3 className="h-5 w-5 text-purple-500" />;
      case 'Slow Mover Alert':
      case 'Inventory Warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default: return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  }
  
  const getInsightActionLink = (insight: BusinessInsightOutput['insights'][0]): string => {
    if (insight.suggestedAction?.toLowerCase().includes('discount')) {
      return '/discount';
    }
    if (insight.relatedProductId) {
      return `/inventory/${insight.relatedProductId}`;
    }
    return '#';
  };


  if (currentRole !== 'admin') {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Verifying access...</span></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="AI Business Insights" subtitle="Let Zeneva AI, your Analyst, find opportunities in your data." />
      
      <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-6 w-6 text-primary"/> Your Personal AI Business Analyst</CardTitle>
          <CardDescription>
            Click the button below to have our AI analyze your latest sales and inventory data to provide tailored, actionable suggestions for growth.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <Button size="lg" onClick={handleGenerateInsights} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Sparkles className="mr-2 h-5 w-5"/>}
                {isGenerating ? "Analyzing Your Data..." : "Generate AI Insights"}
            </Button>
            {error && <p className="text-destructive text-sm mt-4">{error}</p>}
        </CardContent>
      </Card>

      {isGenerating && (
        <div className="text-center py-10">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Zeneva AI is processing your business data...</p>
        </div>
      )}

      {aiInsights.length > 0 && (
        <div className="space-y-4">
            {aiInsights.map((insight, index) => (
                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow bg-card">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                       <div className="flex items-center gap-3">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                       </div>
                       <Badge variant={insight.priority === 'High' ? 'destructive' : insight.priority === 'Medium' ? 'default' : 'secondary'}
                        className={insight.priority === 'Medium' ? 'bg-yellow-500/80' : ''}
                       >
                         {insight.priority} Priority
                       </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-semibold">Finding:</p>
                            <p className="text-sm text-muted-foreground italic">"{insight.finding}"</p>
                        </div>
                         <div>
                            <p className="text-sm font-semibold">Implication:</p>
                            <p className="text-sm text-muted-foreground">{insight.implication}</p>
                        </div>
                        <Separator />
                         <div>
                            <p className="text-sm font-semibold text-green-600">Zeneva AI's Recommendation:</p>
                            <p className="text-sm font-medium text-foreground">{insight.recommendation}</p>
                        </div>
                    </CardContent>
                    {insight.suggestedAction && (
                        <CardContent className="pt-2">
                        <Button variant="link" size="sm" asChild className="p-0 h-auto text-primary">
                            <Link href={getInsightActionLink(insight)}>
                                {insight.suggestedAction} <ArrowRightCircle className="ml-1 h-3 w-3"/>
                            </Link>
                        </Button>
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UsersRound className="h-6 w-6 text-primary"/> AI-Powered Market Analysis (Conceptual)</CardTitle>
          <CardDescription>
            Future versions of Zeneva will integrate external market data to provide competitor insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700 flex items-start gap-2 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-500/30">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0"/>
                <div>
                    <strong>Feature Under Development:</strong> The insights below are conceptual examples of what Zeneva AI will provide once integrated with real-time market data APIs.
                </div>
            </div>
             <Card className="shadow-sm bg-card/70">
              <CardHeader className="pb-3">
                 <CardTitle className="text-base flex items-center gap-2">Market Trend: Skincare</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground"><strong>Insight:</strong> Online searches for "Vitamin C Serum" in your region have increased by 25% in the last 30 days.</p>
                <p className="text-xs text-muted-foreground mt-1"><em>Source: Google Trends (Simulated)</em></p>
              </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  );
}
