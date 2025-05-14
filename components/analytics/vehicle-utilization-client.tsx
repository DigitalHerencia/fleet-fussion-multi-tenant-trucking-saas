"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContentSection } from "@/components/layouts/content-layout";
import { FlexLayout } from "@/components/layouts/flex-layout";

interface VehicleUtilizationClientProps {
  timeRange: string;
  data: Array<{
    number: string;
    type: string;
    miles: number;
    utilization: number;
    fuelEfficiency: number | string;
    maintenance: number;
    status: string;
    id: string;
    unitNumber: string;
  }>;
}

/**
 * Client component for displaying vehicle utilization data
 * Renders interactive charts and tables for monitoring fleet performance
 */
export function VehicleUtilizationClient({
  timeRange,
  data,
}: VehicleUtilizationClientProps) {
  return (
    <div className="space-y-6">
      <FlexLayout direction="row" gap="md" className="grid md:grid-cols-2">
        <ContentSection title="Miles by Vehicle">
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
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="number" />
                <YAxis />
                <ChartTooltip
                  content={({ payload, active }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent>
                          <div>
                            <p className="font-medium">Vehicle {data.number}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.type}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex justify-between items-center gap-8">
                              <p className="text-sm text-muted-foreground">
                                Miles:
                              </p>
                              <p className="font-medium">
                                {data.miles.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </ChartTooltipContent>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="miles" fill="hsl(var(--chart-1))" name="Miles" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ContentSection>

        <ContentSection title="Utilization by Vehicle">
          <ChartContainer
            config={{
              utilization: {
                label: "Utilization %",
                color: "hsl(var(--chart-2))",
              },
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
                <ChartTooltip
                  content={({ payload, active }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent>
                          <div>
                            <p className="font-medium">Vehicle {data.number}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.type}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex justify-between items-center gap-8">
                              <p className="text-sm text-muted-foreground">
                                Utilization:
                              </p>
                              <p className="font-medium">{data.utilization}%</p>
                            </div>
                          </div>
                        </ChartTooltipContent>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="utilization"
                  fill="hsl(var(--chart-2))"
                  name="Utilization %"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ContentSection>
      </FlexLayout>

      <ContentSection
        title="Fleet Performance Details"
        description={`Data for the last ${timeRange}`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Miles</TableHead>
              <TableHead className="text-right">Utilization</TableHead>
              <TableHead className="text-right">MPG</TableHead>
              <TableHead className="text-right">Maintenance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.number}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      vehicle.status === "Active" ? "outline" : "secondary"
                    }
                    className={vehicle.status === "Active" ? "bg-green-50" : ""}
                  >
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {vehicle.miles.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {vehicle.utilization}%
                </TableCell>
                <TableCell className="text-right">
                  {typeof vehicle.fuelEfficiency === "number"
                    ? vehicle.fuelEfficiency.toFixed(1)
                    : vehicle.fuelEfficiency}
                </TableCell>
                <TableCell className="text-right">
                  ${vehicle.maintenance}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ContentSection>
    </div>
  );
}
