
"use client"; 

import PageTitle from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, DollarSign, PlusCircle, Search, PiggyBank, Edit, Trash2 } from 'lucide-react';

interface OtherIncome {
  id: string;
  date: string;
  source: string;
  description: string;
  amount: number;
  category: string; // e.g., Services, Rent, Interest
}

const mockOtherIncomes: OtherIncome[] = [
  { id: "inc-001", date: "2024-07-10", source: "Consulting Gig", description: "Project Alpha consultation fee", amount: 50000, category: "Services" },
  { id: "inc-002", date: "2024-07-15", source: "Rental Unit B", description: "Monthly rent payment", amount: 120000, category: "Rental Income" },
  { id: "inc-003", date: "2024-07-25", source: "Bank Savings", description: "Interest earned for Q2", amount: 2500, category: "Interest" },
  { id: "inc-004", date: "2024-07-28", source: "Workshop Fee", description: "Paid workshop participation", amount: 15000, category: "Services" },
];

export default function OtherIncomesPage() {
  const otherIncomes: OtherIncome[] = mockOtherIncomes; 

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Other Income Sources" subtitle="Record and track miscellaneous revenue streams.">
        <Button onClick={() => alert('Record Other Income form/modal would appear here. (Not yet implemented)')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Record New Income
        </Button>
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>Miscellaneous Income Recording</CardTitle>
          <CardDescription>
            Log any income that doesn't come directly from your primary product sales. This could include revenue from services,
            consulting fees, rental income, interest earned, or other non-typical revenue streams.
            Properly tracking all income sources gives you a complete financial picture of your business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {otherIncomes.length > 0 ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search income by source or description..." className="w-full md:w-1/2 p-2 border rounded-md bg-background"/>
              </div>
              <div className="space-y-3">
                {otherIncomes.map(income => (
                  <Card key={income.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{income.source} - {income.category}</h4>
                        <p className="text-sm text-muted-foreground">{income.description}</p>
                        <p className="text-xs text-muted-foreground">Date: {new Date(income.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1 mt-2 sm:mt-0">
                        <p className="text-lg font-medium text-green-600">
                            + ₦{income.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => alert(`Edit income from ${income.source}`)}><Edit className="mr-1 h-3 w-3"/>Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => alert(`Delete income from ${income.source}`)}><Trash2 className="mr-1 h-3 w-3"/>Delete</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <DollarSign className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Other Incomes Recorded Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Gain a holistic view of your business's financial performance by tracking all revenue sources, 
                not just sales. This is important for:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mb-6 text-left inline-block">
                <li>Accurate profit and loss statements.</li>
                <li>Comprehensive financial analysis.</li>
                <li>Identifying diverse revenue streams.</li>
                <li>Better budgeting and forecasting.</li>
              </ul>
               <Button onClick={() => alert('Record Other Income form/modal would appear here. (Not yet implemented)')}>
                Record Your First Miscellaneous Income
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><PiggyBank className="h-5 w-5 text-primary"/> Examples of Other Income</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
                <li>Service fees (e.g., repairs, installations, consultations)</li>
                <li>Rental income from property or equipment</li>
                <li>Commissions earned</li>
                <li>Interest from bank accounts or investments</li>
                <li>Sale of assets not part of regular inventory</li>
                <li>Grants or subsidies received</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
