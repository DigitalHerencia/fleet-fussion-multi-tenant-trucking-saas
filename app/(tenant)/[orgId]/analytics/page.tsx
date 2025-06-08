import { Suspense } from 'react';
import {
  DollarSign,
  Truck,
  BarChart3,
  User,
  CalendarIcon,
  Download,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PerformanceMetrics } from '@/components/analytics/performance-metrics';
import { FinancialMetrics } from '@/components/analytics/financial-metrics';
import { DriverPerformance } from '@/components/analytics/driver-performance';
import { VehicleUtilization } from '@/components/analytics/vehicle-utilization';
import {
  getDashboardSummary,
  getPerformanceAnalytics,
  getFinancialAnalytics,
  getDriverAnalytics,
  getVehicleAnalytics,
} from '@/lib/fetchers/analyticsFetchers';

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const timeRange = '30d';

  // Fetch all analytics data in parallel
  const [
    summary,
    performanceDataRaw,
    financialDataRaw,
    driverPerformanceMetricsRaw,
    vehicleDataRaw,
  ] = await Promise.all([
    getDashboardSummary(orgId, timeRange),
    getPerformanceAnalytics(orgId, timeRange),
    getFinancialAnalytics(orgId, timeRange),
    getDriverAnalytics(orgId, timeRange),
    getVehicleAnalytics(orgId, timeRange),
  ]);

  // Defensive: ensure arrays/objects for all analytics data
  const performanceData = Array.isArray(performanceDataRaw)
    ? performanceDataRaw
    : [];
  const driverPerformanceMetrics = Array.isArray(driverPerformanceMetricsRaw)
    ? driverPerformanceMetricsRaw
    : [];
  const vehicleData = Array.isArray(vehicleDataRaw) ? vehicleDataRaw : [];
  const financialData =
    financialDataRaw &&
    typeof financialDataRaw === 'object' &&
    financialDataRaw !== null
      ? {
          revenue: Array.isArray((financialDataRaw as any).revenue)
            ? (financialDataRaw as any).revenue
            : [],
          expenses: Array.isArray((financialDataRaw as any).expenses)
            ? (financialDataRaw as any).expenses
            : [],
          profitMargin: Array.isArray((financialDataRaw as any).profitMargin)
            ? (financialDataRaw as any).profitMargin
            : [],
        }
      : { revenue: [], expenses: [], profitMargin: [] };

  // Metrics for cards
  const metrics = [
    {
      icon: <DollarSign className="h-4 w-4 text-[hsl(var(--info))]" />,
      label: 'Total Revenue',
      value: summary ? `$${summary.totalRevenue.toLocaleString()}` : '-',
      change:
        summary && summary.totalRevenue && summary.averageRevenuePerMile
          ? `Avg $${summary.averageRevenuePerMile.toFixed(2)}/mile`
          : '',
    },
    {
      icon: <Truck className="h-4 w-4 text-[hsl(var(--info))]" />,
      label: 'Total Miles',
      value: summary ? summary.totalMiles.toLocaleString() : '-',
      change:
        summary && summary.totalMiles ? `Loads: ${summary.totalLoads}` : '',
    },
    {
      icon: <BarChart3 className="h-4 w-4 text-[hsl(var(--info))]" />,
      label: 'Load Count',
      value: summary ? summary.totalLoads.toLocaleString() : '-',
      change:
        summary && summary.totalLoads
          ? `Drivers: ${summary.activeDrivers}`
          : '',
    },
    {
      icon: <User className="h-4 w-4 text-[hsl(var(--info))]" />,
      label: 'Active Vehicles',
      value: summary ? summary.activeVehicles.toLocaleString() : '-',
      change: summary && summary.activeVehicles ? `Active` : '',
    },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-6 bg-neutral-900 p-6 pt-8">
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-extrabold text-white">
            Analytics Dashboard
          </h1>
          <p className="text-base text-white/90">
            Track and analyze fleet performance metrics
          </p>
        </div>
        <div className="mt-4 flex flex-row gap-2 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-white"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button size="sm" className="bg-blue-500 font-semibold text-white">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <Card
            className="flex min-h-[120px] flex-col justify-between rounded-md border border-gray-200 bg-black"
            key={i}
          >
            <CardHeader className="flex flex-row items-center justify-between pt-4 pb-0">
              <div className="flex items-center gap-2">
                {m.icon}
                <span className="text-sm font-medium text-white">
                  {m.label}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-end pt-2 pb-4">
              <span className="text-4xl leading-tight font-extrabold text-white">
                {m.value}
              </span>
              <span className="text-muted-foreground mt-1 text-xs">
                {m.change}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="mt-4">
          <Card className="rounded-md border border-gray-200 bg-black">
            <CardHeader className="pt-4 pb-2">
              <span className="text-lg font-bold text-white">
                Performance Metrics
              </span>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-4">
              <PerformanceMetrics
                timeRange={timeRange}
                performanceData={performanceData}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financial" className="mt-4">
          <Card className="rounded-md border border-gray-200 bg-black">
            <CardHeader className="pt-4 pb-2">
              <span className="text-lg font-bold text-white">
                Financial Metrics
              </span>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-4">
              <FinancialMetrics
                timeRange={timeRange}
                financialData={financialData.revenue}
                expenseBreakdown={financialData.expenses}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="drivers" className="mt-4">
          <Card className="rounded-md border border-gray-200 bg-black">
            <CardHeader className="pt-4 pb-2">
              <span className="text-lg font-bold text-white">
                Driver Performance
              </span>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-4">
              <DriverPerformance
                timeRange={timeRange}
                driverPerformanceMetrics={driverPerformanceMetrics}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vehicles" className="mt-4">
          <Card className="rounded-md border border-gray-200 bg-black">
            <CardHeader className="pt-4 pb-2">
              <span className="text-lg font-bold text-white">
                Vehicle Utilization
              </span>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-4">
              <VehicleUtilization
                timeRange={timeRange}
                vehicleData={vehicleData}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
