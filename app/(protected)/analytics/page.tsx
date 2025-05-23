import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Download, BarChart3, DollarSign, Truck, User } from "lucide-react"
import { PerformanceMetrics } from "@/components/analytics/performance-metrics"
import { FinancialMetrics } from "@/components/analytics/financial-metrics"
import { DriverPerformance } from "@/components/analytics/driver-performance"
import { VehicleUtilization } from "@/components/analytics/vehicle-utilization"
import { PageHeader } from "@/components/ui/page-header"

export default function AnalyticsPage() {
  return (
    <><div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader />
      <Button variant="outline" size="sm" className="w-full sm:w-auto">
        <CalendarIcon className="mr-2 h-4 w-4" />
        Last 30 Days
      </Button>
      <Button size="sm" className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" />
        Export Report
      </Button>
    </div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,565</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Count</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">126</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Utilization</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5.1% from last month</p>
          </CardContent>
        </Card>
      </div><Tabs defaultValue="performance" className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for your fleet operations.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Suspense fallback={ <div>Loading performance metrics...</div> }>
                <PerformanceMetrics timeRange={ "" } />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
              <CardDescription>Revenue, expenses, and profitability analysis.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Suspense fallback={ <div>Loading financial metrics...</div> }>
                <FinancialMetrics timeRange={ "" } />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="drivers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance</CardTitle>
              <CardDescription>Analyze driver productivity and efficiency.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Suspense fallback={ <div>Loading driver performance data...</div> }>
                <DriverPerformance timeRange={ "" } />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vehicles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Utilization</CardTitle>
              <CardDescription>Track vehicle usage and maintenance metrics.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Suspense fallback={ <div>Loading vehicle utilization data...</div> }>
                <VehicleUtilization timeRange={ "" } />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
