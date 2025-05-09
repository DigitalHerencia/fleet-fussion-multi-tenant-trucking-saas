"use client"

import {
    Line,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Bar,
    BarChart
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface FinancialMetricsProps {
    timeRange: string
    financialData: Array<{
        date: string | undefined
        revenue: number
        expenses: number
        profit: number
    }>
    expenseBreakdown: Array<{
        category: string
        value: number
    }>
    financialSummary: {
        revenue: { current: number, previous: number, change: string }
        expenses: { current: number, previous: number, change: string }
        profit: { current: number, previous: number, change: string }
        margin: { current: string, previous: string, change: string }
        ratePerMile: { current: string, previous: string, change: string }
    }
}

export function FinancialMetrics({ 
    timeRange, 
    financialData, 
    expenseBreakdown, 
    financialSummary 
}: FinancialMetricsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-4">Revenue & Expenses</h3>
                <ChartContainer
                    config={{
                        revenue: {
                            label: "Revenue",
                            color: "hsl(var(--chart-1))"
                        },
                        expenses: {
                            label: "Expenses",
                            color: "hsl(var(--chart-2))"
                        },
                        profit: {
                            label: "Profit",
                            color: "hsl(var(--chart-3))"
                        }
                    }}
                    className="h-[400px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={financialData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip 
                                content={<ChartTooltipContent />} 
                                formatter={(value) => `$${Number(value).toLocaleString()}`}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--color-revenue)"
                                name="Revenue"
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                stroke="var(--color-expenses)"
                                name="Expenses"
                            />
                            <Line
                                type="monotone"
                                dataKey="profit"
                                stroke="var(--color-profit)"
                                name="Profit"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <h3 className="text-lg font-medium mb-4">Expense Breakdown</h3>
                    <ChartContainer
                        config={{
                            value: {
                                label: "Amount",
                                color: "hsl(var(--chart-1))"
                            }
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={expenseBreakdown}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <ChartTooltip 
                                    content={<ChartTooltipContent />} 
                                    formatter={(value) => `$${Number(value).toLocaleString()}`}
                                />
                                <Legend />
                                <Bar dataKey="value" fill="var(--color-value)" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Financial Summary</h3>
                    <div className="rounded-md border">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-2 text-left text-sm font-medium">Metric</th>
                                    <th className="p-2 text-right text-sm font-medium">
                                        Current Period
                                    </th>
                                    <th className="p-2 text-right text-sm font-medium">
                                        Previous Period
                                    </th>
                                    <th className="p-2 text-right text-sm font-medium">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2 text-sm font-medium">Total Revenue</td>
                                    <td className="p-2 text-sm text-right">${financialSummary.revenue.current.toLocaleString()}</td>
                                    <td className="p-2 text-sm text-right">${financialSummary.revenue.previous.toLocaleString()}</td>
                                    <td className={`p-2 text-sm text-right ${Number(financialSummary.revenue.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(financialSummary.revenue.change) >= 0 ? '+' : ''}{financialSummary.revenue.change}%
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 text-sm font-medium">Total Expenses</td>
                                    <td className="p-2 text-sm text-right">${financialSummary.expenses.current.toLocaleString()}</td>
                                    <td className="p-2 text-sm text-right">${financialSummary.expenses.previous.toLocaleString()}</td>
                                    <td className={`p-2 text-sm text-right ${Number(financialSummary.expenses.change) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {Number(financialSummary.expenses.change) >= 0 ? '+' : ''}{financialSummary.expenses.change}%
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 text-sm font-medium">Net Profit</td>
                                    <td className="p-2 text-sm text-right">${financialSummary.profit.current.toLocaleString()}</td>
                                    <td className="p-2 text-sm text-right">${financialSummary.profit.previous.toLocaleString()}</td>
                                    <td className={`p-2 text-sm text-right ${Number(financialSummary.profit.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(financialSummary.profit.change) >= 0 ? '+' : ''}{financialSummary.profit.change}%
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 text-sm font-medium">Profit Margin</td>
                                    <td className="p-2 text-sm text-right">{financialSummary.margin.current}%</td>
                                    <td className="p-2 text-sm text-right">{financialSummary.margin.previous}%</td>
                                    <td className={`p-2 text-sm text-right ${Number(financialSummary.margin.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(financialSummary.margin.change) >= 0 ? '+' : ''}{financialSummary.margin.change}%
                                    </td>
                                </tr>
                                <tr>
                                    <td className="p-2 text-sm font-medium">Revenue per Mile</td>
                                    <td className="p-2 text-sm text-right">${financialSummary.ratePerMile.current}</td>
                                    <td className="p-2 text-sm text-right">${financialSummary.ratePerMile.previous}</td>
                                    <td className={`p-2 text-sm text-right ${Number(financialSummary.ratePerMile.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(financialSummary.ratePerMile.change) >= 0 ? '+' : ''}{financialSummary.ratePerMile.change}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
