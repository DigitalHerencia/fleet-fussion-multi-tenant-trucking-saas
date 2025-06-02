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
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton' // Corrected import

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-900 p-4 md:p-6 lg:p-8">
      {/* Fleet Overview Header */}
      <Suspense fallback={<Skeleton className="h-12 w-full" />}>
        <FleetOverviewHeader />
      </Suspense>

      {/* KPI Grid */}
      <Suspense fallback={<DashboardSkeleton />}>
        <KpiGrid />
      </Suspense>

      {/* Bottom Widgets Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-8">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <QuickActionsWidget />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <RecentAlertsWidget />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <TodaysScheduleWidget />
        </Suspense>
      </div>
    </div>
  )
}

// Helper Skeleton component (can be moved to a shared UI file)
// For now, defining it here if not already globally available or part of a library like ShadCN
// If you have a Skeleton component from a UI library, prefer using that.
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-800 animate-pulse rounded-md ${className}`} />
)