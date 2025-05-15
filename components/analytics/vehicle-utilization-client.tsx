"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ContentSection } from "@/components/layouts/content-layout";
import { FlexLayout } from "@/components/layouts/flex-layout";

/**
 * Client component for displaying vehicle utilization data
 * Renders interactive charts and tables for monitoring fleet performance
 */
export function VehicleUtilizationClient({
  timeRange,
  data,
}: {
  timeRange: string;
  data: Array<{
    number: string;
    type: string;
    miles: number;
    utilization: number;
    fuelEfficiency: string | number;
    maintenance: number;
    status: string;
    id: string;
    unitNumber: string;
  }>;
}) {
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border">
            <thead>
              <tr>
                <th>Unit Number</th>
                <th>Type</th>
                <th>Miles</th>
                <th>Utilization</th>
                <th>Fuel Efficiency</th>
                <th>Maintenance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.unitNumber}</td>
                  <td>{vehicle.type}</td>
                  <td>{vehicle.miles}</td>
                  <td>{vehicle.utilization}</td>
                  <td>{vehicle.fuelEfficiency}</td>
                  <td>{vehicle.maintenance}</td>
                  <td>{vehicle.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>
    </div>
  );
}
