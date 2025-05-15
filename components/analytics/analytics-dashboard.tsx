"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PerformanceMetrics } from "./performance-metrics";
import { FinancialMetrics } from "./financial-metrics";
import { DriverPerformance } from "./driver-performance";
import { VehicleUtilization } from "./vehicle-utilization";
import { Download, Filter } from "lucide-react";

interface PerformanceData {
  date: string;
  loads: number;
  miles: number;
  onTimeDelivery: number;
  utilization: number;
}

interface PerformanceComparisonData {
  loadCount: { current: number; previous: number; change: string };
  miles: { current: number; previous: number; change: string };
  onTimeDelivery: { current: number; previous: number; change: string };
  utilization: { current: number; previous: number; change: string };
}

interface FinancialData {
  date: string | undefined;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseBreakdown {
  category: string;
  value: number;
}

interface FinancialSummary {
  revenue: { current: number; previous: number; change: string };
  expenses: { current: number; previous: number; change: string };
  profit: { current: number; previous: number; change: string };
  margin: { current: string; previous: string; change: string };
  ratePerMile: { current: string; previous: string; change: string };
}

interface DriverPerformanceDatum {
  name: string;
  miles: number;
  loads: number;
  onTime: number;
  fuelEfficiency: number;
  safetyScore: number;
  violations: number;
}

interface VehicleUtilizationDatum {
  number: string;
  type: string;
  miles: number;
  utilization: number;
  fuelEfficiency: string | number;
  maintenance: number;
  status: string;
  id: string;
  unitNumber: string;
}

export function AnalyticsDashboard({
  performanceData,
  performanceComparisonData,
  financialData,
  expenseBreakdown,
  financialSummary,
  driverPerformanceData,
  vehicleUtilizationData,
}: {
  performanceData: PerformanceData[];
  performanceComparisonData: PerformanceComparisonData;
  financialData: FinancialData[];
  expenseBreakdown: ExpenseBreakdown[];
  financialSummary: FinancialSummary;
  driverPerformanceData: DriverPerformanceDatum[];
  vehicleUtilizationData: VehicleUtilizationDatum[];
}) {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Track key performance indicators and business metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$128,450</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 mr-1">↑ 12%</span> vs previous
              period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42,587</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 mr-1">↑ 8%</span> vs previous
              period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$26,842</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-red-500 mr-1">↑ 5%</span> vs previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On-Time Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 mr-1">↑ 2%</span> vs previous
              period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="drivers">Driver Performance</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Utilization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key operational performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceMetrics timeRange={timeRange} data={performanceData} comparisonData={performanceComparisonData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
              <CardDescription>
                Revenue, costs, and profitability analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialMetrics timeRange={timeRange} financialData={financialData} expenseBreakdown={expenseBreakdown} financialSummary={financialSummary} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance</CardTitle>
              <CardDescription>
                Driver productivity and safety metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DriverPerformance timeRange={timeRange} data={driverPerformanceData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Utilization</CardTitle>
              <CardDescription>
                Vehicle usage and maintenance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleUtilization timeRange={timeRange} data={vehicleUtilizationData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
