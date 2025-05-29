/**
 * Dispatcher Dashboard Page
 * 
 * Dispatch operations dashboard for managing loads, assigning drivers, and monitoring routes
 */

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { DispatchBoard } from '@/components/dispatch/dispatch-board'
import { LoadForm } from '@/components/dispatch/load-form'
import { Button } from '@/components/ui/button'
import { Plus, Truck, MapPin, Clock, Users } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SystemRoles } from '@/types/abac'

export default async function DispatcherDashboardPage({
  params
}: {
  params: { orgId: string; userId: string }
}) {
  // Verify dispatcher access
  const user = await getCurrentUser()
  if (!user || user.role !== SystemRoles.DISPATCHER) {
    redirect('/sign-in')
  }

  return (
    <>
      <PageHeader />
      <div className="pt-16 space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch Center</h1>
            <p className="text-muted-foreground">
              Manage loads, assign drivers, and monitor fleet operations.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Load
          </Button>
        </div>

        {/* Dispatch Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently dispatched</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Ready for dispatch</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Routes Today</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Scheduled deliveries</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dispatch Board */}
        <Card>
          <CardHeader>
            <CardTitle>Dispatch Board</CardTitle>
            <CardDescription>
              Manage active loads and driver assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              <DispatchBoard loads={ [] } drivers={ [] } vehicles={ [] } />
            </Suspense>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Available Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Available Drivers</CardTitle>
              <CardDescription>
                Drivers ready for new assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingSpinner />}>
                {/* Add available drivers component */}
              </Suspense>
            </CardContent>
          </Card>

          {/* Recent Load Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest load updates and status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingSpinner />}>
                {/* Add recent activity component */}
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Fleet Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>
              Real-time overview of your fleet operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingSpinner />}>
              {/* Add fleet status component */}
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
