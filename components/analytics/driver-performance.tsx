"use client";

import { useState } from "react";
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

interface DriverPerformanceProps {
  timeRange: string;
  data: Array<{
    name: string;
    miles: number;
    loads: number;
    onTime: number;
    fuelEfficiency: number;
    safetyScore: number;
    violations: number;
  }>;
}

export function DriverPerformance({ timeRange, data }: DriverPerformanceProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium mb-4">Miles Driven by Driver</h3>
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
            {data.map((driver) => (
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
                <TableCell className="text-right">
                  {driver.safetyScore}
                </TableCell>
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
  );
}
