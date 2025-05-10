"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface PerformanceMetricsProps {
    timeRange: string
    data: Array<{
        date: string
        loads: number
        miles: number
        onTimeDelivery: number
        utilization: number
    }>
    comparisonData: {
        loadCount: { current: number; previous: number; change: string }
        miles: { current: number; previous: number; change: string }
        onTimeDelivery: { current: number; previous: number; change: string }
        utilization: { current: number; previous: number; change: string }
    }
}

export function PerformanceMetrics({ timeRange, data, comparisonData }: PerformanceMetricsProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <h3 className="text-lg font-medium mb-4">Loads Delivered</h3>
                    <ChartContainer
                        config={{
                            loads: {
                                label: "Loads",
                                color: "hsl(var(--chart-1))"
                            }
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="loads"
                                    stroke="var(--color-loads)"
                                    name="Loads"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Miles Driven</h3>
                    <ChartContainer
                        config={{
                            miles: {
                                label: "Miles",
                                color: "hsl(var(--chart-2))"
                            }
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="miles"
                                    stroke="var(--color-miles)"
                                    name="Miles"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">On-Time Delivery (%)</h3>
                    <ChartContainer
                        config={{
                            onTimeDelivery: {
                                label: "On-Time Delivery",
                                color: "hsl(var(--chart-3))"
                            }
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[80, 100]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="onTimeDelivery"
                                    stroke="var(--color-onTimeDelivery)"
                                    name="On-Time Delivery"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Fleet Utilization (%)</h3>
                    <ChartContainer
                        config={{
                            utilization: {
                                label: "Utilization",
                                color: "hsl(var(--chart-4))"
                            }
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[80, 100]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="utilization"
                                    stroke="var(--color-utilization)"
                                    name="Utilization"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>

            <div className="rounded-md border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="p-2 text-left text-sm font-medium">Metric</th>
                            <th className="p-2 text-right text-sm font-medium">Current Period</th>
                            <th className="p-2 text-right text-sm font-medium">Previous Period</th>
                            <th className="p-2 text-right text-sm font-medium">Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-2 text-sm font-medium">Total Loads</td>
                            <td className="p-2 text-sm text-right">
                                {comparisonData.loadCount.current}
                            </td>
                            <td className="p-2 text-sm text-right">
                                {comparisonData.loadCount.previous}
                            </td>
                            <td
                                className={`p-2 text-sm text-right ${Number(comparisonData.loadCount.change) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                                {Number(comparisonData.loadCount.change) >= 0 ? "+" : ""}
                                {comparisonData.loadCount.change}%
                            </td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 text-sm font-medium">Total Miles</td>
                            <td className="p-2 text-sm text-right">
                                {comparisonData.miles.current.toLocaleString()}
                            </td>
                            <td className="p-2 text-sm text-right">
                                {comparisonData.miles.previous.toLocaleString()}
                            </td>
                            <td
                                className={`p-2 text-sm text-right ${Number(comparisonData.miles.change) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                                {Number(comparisonData.miles.change) >= 0 ? "+" : ""}
                                {comparisonData.miles.change}%
                            </td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 text-sm font-medium">On-Time Delivery Rate</td>
                            <td className="p-2 text-sm text-right">
                                {comparisonData.onTimeDelivery.current}%
                            </td>
                            <td className="p-2 text-sm text-right">
                                {comparisonData.onTimeDelivery.previous}%
                            </td>
                            <td
                                className={`p-2 text-sm text-right ${Number(comparisonData.onTimeDelivery.change) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                                {Number(comparisonData.onTimeDelivery.change) >= 0 ? "+" : ""}
                                {comparisonData.onTimeDelivery.change}%
                            </td>
                        </tr>
                        <tr>
                            <td className="p-2 text-sm font-medium">Fleet Utilization</td>
                            <td className="p-2 text-sm text-right">
                                {comparisonData.utilization.current}%
                            </td>
                            <td className="p-2 text-sm text-right">
                                {comparisonData.utilization.previous}%
                            </td>
                            <td
                                className={`p-2 text-sm text-right ${Number(comparisonData.utilization.change) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                                {Number(comparisonData.utilization.change) >= 0 ? "+" : ""}
                                {comparisonData.utilization.change}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
