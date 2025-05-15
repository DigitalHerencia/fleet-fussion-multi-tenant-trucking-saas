"use client";

import { useState } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface FinancialMetricsProps {
  timeRange: string;
  financialData: Array<{
    date: string | undefined;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expenseBreakdown: Array<{ category: string; value: number }>;
  financialSummary: {
    revenue: { current: number; previous: number; change: string };
    expenses: { current: number; previous: number; change: string };
    profit: { current: number; previous: number; change: string };
    margin: { current: string; previous: string; change: string };
    ratePerMile: { current: string; previous: string; change: string };
  };
}

export function FinancialMetrics({
  timeRange,
  financialData,
  expenseBreakdown,
  financialSummary,
}: FinancialMetricsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Financial Metrics ({timeRange})</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th>Date</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {financialData.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.revenue}</td>
                <td>{row.expenses}</td>
                <td>{row.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h4 className="font-medium mt-2">Expense Breakdown</h4>
        <ul className="list-disc ml-6">
          {expenseBreakdown.map((item, i) => (
            <li key={i}>{item.category}: {item.value}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-medium mt-2">Summary</h4>
        <ul className="list-disc ml-6">
          <li>Revenue: {financialSummary.revenue.current} (Prev: {financialSummary.revenue.previous}, Change: {financialSummary.revenue.change})</li>
          <li>Expenses: {financialSummary.expenses.current} (Prev: {financialSummary.expenses.previous}, Change: {financialSummary.expenses.change})</li>
          <li>Profit: {financialSummary.profit.current} (Prev: {financialSummary.profit.previous}, Change: {financialSummary.profit.change})</li>
          <li>Margin: {financialSummary.margin.current} (Prev: {financialSummary.margin.previous}, Change: {financialSummary.margin.change})</li>
          <li>Rate Per Mile: {financialSummary.ratePerMile.current} (Prev: {financialSummary.ratePerMile.previous}, Change: {financialSummary.ratePerMile.change})</li>
        </ul>
      </div>
    </div>
  );
}
