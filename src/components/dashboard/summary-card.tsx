import type React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, description, icon: Icon, trend, trendDirection }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p className={`text-xs mt-1 ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
