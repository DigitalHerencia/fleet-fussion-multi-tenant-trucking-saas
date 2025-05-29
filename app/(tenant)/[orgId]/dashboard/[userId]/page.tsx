/**
 * Dashboard Page
 * 
 * Main dashboard showing key metrics, recent activity, and quick actions
 */

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardMetrics } from '@/features/analytics/dashboard-metrics'
import { QuickActions } from '@/features/dashboard/quick-actions'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your fleet.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Key Metrics */}
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardMetrics />
      </Suspense>

      {/* Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your fleet operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
            </Suspense>
          </CardContent>
        </Card>

        {/* Compliance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Alerts</CardTitle>
            <CardDescription>
              Important compliance items requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
            </Suspense>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
            <CardDescription>
              Vehicles requiring maintenance in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}