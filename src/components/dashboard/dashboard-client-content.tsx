
"use client";

import dynamic from 'next/dynamic';

const OverviewChart = dynamic(() => import('@/components/dashboard/overview-chart'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full rounded-lg bg-muted animate-pulse"></div>
});
const RecentActivity = dynamic(() => import('@/components/dashboard/recent-activity'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full rounded-lg bg-muted animate-pulse"></div>
});

export default function DashboardClientContent() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <OverviewChart />
      <RecentActivity />
    </div>
  );
}
