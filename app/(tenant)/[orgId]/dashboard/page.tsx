/**
 * Organization Dashboard Page
 * Displays fleet overview metrics and widgets.
 */
import { Suspense } from 'react';

import FleetOverviewHeader from '@/features/dashboard/fleet-overview-header';
import KpiGrid from '@/features/dashboard/kpi-grid';
import QuickActionsWidget from '@/features/dashboard/quick-actions-widget';
import RecentAlertsWidget from '@/features/dashboard/recent-alerts-widget';
import TodaysScheduleWidget from '@/features/dashboard/todays-schedule-widget';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ orgId: string; userId?: string }>;
}) {
  const { orgId, userId } = await params;

  return (
    <div className="min-h-screen space-y-6 bg-neutral-900 p-6 pt-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <FleetOverviewHeader orgId={orgId} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<DashboardSkeleton />}>
          <QuickActionsWidget />
        </Suspense>
        <Suspense fallback={<DashboardSkeleton />}>
          <RecentAlertsWidget orgId={orgId} />
        </Suspense>
        <Suspense fallback={<DashboardSkeleton />}>
          <TodaysScheduleWidget orgId={orgId} />
        </Suspense>
      </div>

      <div>
        <Suspense fallback={<DashboardSkeleton />}>
          <KpiGrid orgId={orgId} />
        </Suspense>
      </div>
    </div>
  );
}
