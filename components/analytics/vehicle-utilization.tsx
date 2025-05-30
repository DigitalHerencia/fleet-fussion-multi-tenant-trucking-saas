"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Vehicle } from "@/types/dispatch"

interface VehicleUtilizationProps {
  timeRange: string
  vehicleData: Vehicle[] // Updated prop type to Vehicle[]
}

export function VehicleUtilization({ timeRange, vehicleData }: VehicleUtilizationProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium mb-4">Miles by Vehicle</h3>
          <ChartContainer
            config={{
              miles: {
                label: "Miles",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="number" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="miles" fill="var(--color-miles)" name="Miles" />
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
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="number" />
                <YAxis domain={[70, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="utilization" fill="var(--color-utilization)" name="Utilization" />
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
            {vehicleData.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.id}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell className="text-right">
                  {vehicle.currentOdometer !== undefined && vehicle.currentOdometer !== null
                    ? vehicle.currentOdometer.toLocaleString()
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {vehicle.lastMaintenanceDate
                    ? vehicle.lastMaintenanceDate.toLocaleString()
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {typeof vehicle.fuelType === 'string'
                    ? vehicle.fuelType.toLocaleString()
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {vehicle.nextMaintenanceDate
                    ? `$${vehicle.nextMaintenanceDate.toLocaleString()}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {vehicle.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Maintenance</Badge>
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
