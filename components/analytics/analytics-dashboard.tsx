"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { PerformanceMetrics } from "./performance-metrics"
import { FinancialMetrics } from "./financial-metrics"
import { DriverPerformance } from "./driver-performance"
import { VehicleUtilization } from "./vehicle-utilization"
import { Download, Filter } from "lucide-react"

export function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState("30d")

    // Mock data for PerformanceMetrics
    const performanceData = [
        { date: "2025-04-01", loads: 12, miles: 4250, onTimeDelivery: 95, utilization: 88 },
        { date: "2025-04-02", loads: 14, miles: 4800, onTimeDelivery: 97, utilization: 92 },
        { date: "2025-04-03", loads: 10, miles: 3800, onTimeDelivery: 94, utilization: 85 },
        { date: "2025-04-04", loads: 15, miles: 5100, onTimeDelivery: 96, utilization: 90 },
        { date: "2025-04-05", loads: 11, miles: 3950, onTimeDelivery: 93, utilization: 87 },
        { date: "2025-04-06", loads: 8, miles: 2950, onTimeDelivery: 92, utilization: 82 },
        { date: "2025-04-07", loads: 16, miles: 5300, onTimeDelivery: 98, utilization: 94 }
    ]
    
    const performanceComparisonData = {
        loadCount: { current: 86, previous: 78, change: "10.3" },
        miles: { current: 30150, previous: 28200, change: "6.9" },
        onTimeDelivery: { current: 95.2, previous: 92.5, change: "2.9" },
        utilization: { current: 88.4, previous: 85.1, change: "3.9" }
    }

    // Mock data for FinancialMetrics
    const financialData = [
        { date: "2025-04-01", revenue: 8500, expenses: 5800, profit: 2700 },
        { date: "2025-04-02", revenue: 9200, expenses: 6100, profit: 3100 },
        { date: "2025-04-03", revenue: 7800, expenses: 5400, profit: 2400 },
        { date: "2025-04-04", revenue: 10500, expenses: 6800, profit: 3700 },
        { date: "2025-04-05", revenue: 8900, expenses: 5900, profit: 3000 },
        { date: "2025-04-06", revenue: 6800, expenses: 4900, profit: 1900 },
        { date: "2025-04-07", revenue: 11200, expenses: 7200, profit: 4000 }
    ]
    
    const expenseBreakdown = [
        { category: "Fuel", value: 18400 },
        { category: "Maintenance", value: 8900 },
        { category: "Insurance", value: 7500 },
        { category: "Payroll", value: 35000 },
        { category: "Tolls", value: 3200 }
    ]
    
    const financialSummary = {
        revenue: { current: 62900, previous: 56400, change: "11.5" },
        expenses: { current: 42100, previous: 38700, change: "8.8" },
        profit: { current: 20800, previous: 17700, change: "17.5" },
        margin: { current: "33.1", previous: "31.4", change: "5.4" },
        ratePerMile: { current: "2.09", previous: "2.00", change: "4.5" }
    }

    // Mock data for DriverPerformance
    const driverPerformanceData = [
        { name: "John Smith", miles: 8450, loads: 24, onTime: 97, fuelEfficiency: 6.3, safetyScore: 95, violations: 0 },
        { name: "Maria Garcia", miles: 7800, loads: 21, onTime: 96, fuelEfficiency: 6.8, safetyScore: 98, violations: 0 },
        { name: "Robert Johnson", miles: 6950, loads: 18, onTime: 92, fuelEfficiency: 5.9, safetyScore: 87, violations: 2 },
        { name: "Lisa Chen", miles: 8200, loads: 23, onTime: 98, fuelEfficiency: 7.1, safetyScore: 94, violations: 1 }
    ]

    // Mock data for VehicleUtilization
    const vehicleUtilizationData = [
        { id: "TK-1001", number: "TK-1001", unitNumber: "1001", type: "Class 8", miles: 8950, utilization: 92, fuelEfficiency: 6.2, maintenance: 1200, status: "Active" },
        { id: "TK-1002", number: "TK-1002", unitNumber: "1002", type: "Class 8", miles: 7800, utilization: 88, fuelEfficiency: 5.9, maintenance: 950, status: "Active" },
        { id: "TK-1003", number: "TK-1003", unitNumber: "1003", type: "Class 7", miles: 6500, utilization: 82, fuelEfficiency: 7.1, maintenance: 1450, status: "Maintenance" },
        { id: "TK-1004", number: "TK-1004", unitNumber: "1004", type: "Class 8", miles: 8700, utilization: 94, fuelEfficiency: 6.4, maintenance: 800, status: "Active" }
    ]

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
                            <span className="text-green-500 mr-1">↑ 12%</span> vs previous period
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
                            <span className="text-green-500 mr-1">↑ 8%</span> vs previous period
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
                        <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94.2%</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <span className="text-green-500 mr-1">↑ 2%</span> vs previous period
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
                            <PerformanceMetrics 
                                timeRange={timeRange} 
                                data={performanceData}
                                comparisonData={performanceComparisonData}
                            />
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
                            <FinancialMetrics 
                                timeRange={timeRange} 
                                financialData={financialData}
                                expenseBreakdown={expenseBreakdown}
                                financialSummary={financialSummary}
                            />
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
                            <DriverPerformance 
                                timeRange={timeRange} 
                                data={driverPerformanceData}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vehicles">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Utilization</CardTitle>
                            <CardDescription>Vehicle usage and maintenance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VehicleUtilization 
                                timeRange={timeRange} 
                                data={vehicleUtilizationData}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
