import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { KPIGrid } from '@/components/dashboard/kpi-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ComplianceAlerts } from '@/components/dashboard/compliance-alerts';
import { getDashboardData } from '@/lib/fetchers/dashboardFetchers';
import { refreshDashboardData } from '@/lib/actions/dashboardActions';

interface DashboardPageProps {
  params: Promise<{ orgId: string; userId?: string }>;
}

async function DashboardContent({ orgId }: { orgId: string }) {
  const dashboardData = await getDashboardData(orgId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Fleet operations overview and quick actions
          </p>
        </div>
        <form action={async (formData: FormData) => {
          await refreshDashboardData(orgId, formData);
        }}>
          <Button variant="outline" size="sm" type="submit">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </form>
      </div>

      {/* KPI Cards */}
      <KPIGrid kpis={dashboardData.kpis} />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions actions={dashboardData.quickActions} />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity activities={dashboardData.recentActivity} />
        </div>

        {/* Compliance Alerts */}
        <div className="lg:col-span-1">
          <ComplianceAlerts alerts={dashboardData.alerts} orgId={orgId} />
        </div>
      </div>

      {/* Additional Dashboard Widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Fleet Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Vehicles</span>
                <span className="font-medium">{dashboardData.metrics.totalVehicles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className="font-medium text-green-600">{dashboardData.metrics.availableVehicles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">In Maintenance</span>
                <span className="font-medium text-yellow-600">{dashboardData.metrics.maintenanceVehicles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Drivers</span>
                <span className="font-medium">{dashboardData.metrics.totalDrivers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Drivers</span>
                <span className="font-medium text-green-600">{dashboardData.metrics.activeDrivers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Load Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Load Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Loads</span>
                <span className="font-medium">{dashboardData.metrics.totalLoads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Loads</span>
                <span className="font-medium text-blue-600">{dashboardData.metrics.activeLoads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Critical Alerts</span>
                <span className={`font-medium ${dashboardData.metrics.criticalAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {dashboardData.metrics.criticalAlerts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Compliance Score</span>
                <span className="font-medium text-green-600">{dashboardData.metrics.complianceScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { orgId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-6">
      <Suspense 
        fallback={
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        }
      >
        <DashboardContent orgId={orgId} />
      </Suspense>
    </div>
  );
}
