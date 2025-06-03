/**
 * Dashboard Page
 * 
 * Main dashboard showing key metrics, recent activity, and quick actions
 */

import { Suspense } from 'react'
import FleetOverviewHeader from '@/features/dashboard/fleet-overview-header'
import KpiGrid from '@/features/dashboard/kpi-grid'
import QuickActionsWidget from '@/features/dashboard/quick-actions-widget'
import RecentAlertsWidget from '@/features/dashboard/recent-alerts-widget'
import TodaysScheduleWidget from '@/features/dashboard/todays-schedule-widget'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'

export default function DashboardPage() {
  return (
    <div className="pt-8 space-y-6 p-6 min-h-screen bg-neutral-900">
      {/* Fleet Overview Header */}
      <Suspense fallback={<DashboardSkeleton />}>
        <FleetOverviewHeader />
      </Suspense>

      {/* Bottom Widgets Grid (now on top) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<DashboardSkeleton />}>
          <QuickActionsWidget />
        </Suspense>
        <Suspense fallback={<DashboardSkeleton />}>
          <RecentAlertsWidget />
        </Suspense>
        <Suspense fallback={<DashboardSkeleton />}>
          <TodaysScheduleWidget />
        </Suspense>
      </div>

      {/* KPI Grid */}
      <div>
        <Suspense fallback={<DashboardSkeleton />}>
          <KpiGrid />
        </Suspense>
      </div>
    </div>
  )
}
