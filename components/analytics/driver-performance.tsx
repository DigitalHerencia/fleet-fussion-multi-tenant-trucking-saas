"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface DriverPerformanceProps {
    timeRange: string
}

const mockDriverPerformanceData = [
    {
        name: "John Smith",
        miles: 8450,
        loads: 28,
        onTime: 96,
        fuelEfficiency: 6.4,
        safetyScore: 95,
        violations: 0
    },
    {
        name: "Maria Garcia",
        miles: 7850,
        loads: 26,
        onTime: 92,
        fuelEfficiency: 6.2,
        safetyScore: 92,
        violations: 1
    },
    {
        name: "Robert Johnson",
        miles: 8200,
        loads: 27,
        onTime: 94,
        fuelEfficiency: 6.5,
        safetyScore: 97,
        violations: 0
    },
    {
        name: "Sarah Williams",
        miles: 7650,
        loads: 25,
        onTime: 95,
        fuelEfficiency: 6.3,
        safetyScore: 94,
        violations: 0
    },
    {
        name: "Michael Brown",
        miles: 7950,
        loads: 26,
        onTime: 93,
        fuelEfficiency: 6.1,
        safetyScore: 90,
        violations: 1
    }
]

export function DriverPerformance({ timeRange }: DriverPerformanceProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <h3 className="text-lg font-medium mb-4">Miles Driven by Driver</h3>
                    <ChartContainer
                        config={{
                            miles: {
                                label: "Miles",
                                color: "hsl(var(--chart-1))"
                            }
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={mockDriverPerformanceData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar dataKey="miles" fill="var(--color-miles)" name="Miles" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Safety Score by Driver</h3>
                    <ChartContainer
                        config={{
                            safetyScore: {
                                label: "Safety Score",
                                color: "hsl(var(--chart-2))"
                            }
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={mockDriverPerformanceData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[80, 100]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar
                                    dataKey="safetyScore"
                                    fill="var(--color-safetyScore)"
                                    name="Safety Score"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4">Driver Performance Metrics</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Driver</TableHead>
                            <TableHead className="text-right">Miles</TableHead>
                            <TableHead className="text-right">Loads</TableHead>
                            <TableHead className="text-right">On-Time %</TableHead>
                            <TableHead className="text-right">MPG</TableHead>
                            <TableHead className="text-right">Safety Score</TableHead>
                            <TableHead>Violations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockDriverPerformanceData.map(driver => (
                            <TableRow key={driver.name}>
                                <TableCell className="font-medium">{driver.name}</TableCell>
                                <TableCell className="text-right">
                                    {driver.miles.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">{driver.loads}</TableCell>
                                <TableCell className="text-right">{driver.onTime}%</TableCell>
                                <TableCell className="text-right">
                                    {driver.fuelEfficiency.toFixed(1)}
                                </TableCell>
                                <TableCell className="text-right">{driver.safetyScore}</TableCell>
                                <TableCell>
                                    {driver.violations === 0 ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                            None
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                            {driver.violations}
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
