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

interface VehicleUtilizationProps {
    timeRange: string
    data: Array<{
        number: string
        type: string
        miles: number
        utilization: number
        fuelEfficiency: number | string
        maintenance: number
        status: string
        id: string
        unitNumber: string
    }>
}

export function VehicleUtilization({ timeRange, data }: VehicleUtilizationProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <h3 className="text-lg font-medium mb-4">Miles by Vehicle</h3>
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
                                data={data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="number" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar dataKey="miles" fill="var(--chart-2)" name="Miles" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Utilization by Vehicle (%)</h3>
                    <ChartContainer
                        config={{
                            utilization: {
                                label: "Utilization",
                                color: "hsl(var(--chart-3))"
                            }
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="number" />
                                <YAxis domain={[0, 100]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar dataKey="utilization" fill="var(--chart-3)" name="Utilization" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4">Vehicle Performance Metrics</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Vehicle #</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Miles</TableHead>
                            <TableHead className="text-right">Utilization</TableHead>
                            <TableHead className="text-right">MPG</TableHead>
                            <TableHead className="text-right">Maintenance Cost</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(vehicle => (
                            <TableRow key={vehicle.number}>
                                <TableCell className="font-medium">{vehicle.number}</TableCell>
                                <TableCell>{vehicle.type}</TableCell>
                                <TableCell className="text-right">
                                    {vehicle.miles.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">{vehicle.utilization}%</TableCell>
                                <TableCell className="text-right">
                                    {typeof vehicle.fuelEfficiency === "number"
                                        ? vehicle.fuelEfficiency.toFixed(1)
                                        : vehicle.fuelEfficiency}
                                </TableCell>
                                <TableCell className="text-right">
                                    ${vehicle.maintenance.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {vehicle.status === "Active" ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                            Maintenance
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
