"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye } from "lucide-react"

const mockReports = [
  {
    id: 1,
    quarter: "2023 - Q1",
    filingDate: "04/25/2023",
    status: "Filed",
    totalMiles: 38945,
    totalGallons: 6254,
    taxPaid: "$1,128.42",
  },
  {
    id: 2,
    quarter: "2022 - Q4",
    filingDate: "01/28/2023",
    status: "Filed",
    totalMiles: 42156,
    totalGallons: 6782,
    taxPaid: "$1,245.87",
  },
  {
    id: 3,
    quarter: "2022 - Q3",
    filingDate: "10/22/2022",
    status: "Filed",
    totalMiles: 45321,
    totalGallons: 7245,
    taxPaid: "$1,356.32",
  },
  {
    id: 4,
    quarter: "2022 - Q2",
    filingDate: "07/26/2022",
    status: "Filed",
    totalMiles: 40125,
    totalGallons: 6420,
    taxPaid: "$1,185.65",
  },
]

export function IftaReportTable() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left text-sm font-medium">Quarter</th>
              <th className="p-2 text-left text-sm font-medium">Filing Date</th>
              <th className="p-2 text-left text-sm font-medium">Status</th>
              <th className="p-2 text-right text-sm font-medium">Total Miles</th>
              <th className="p-2 text-right text-sm font-medium">Total Gallons</th>
              <th className="p-2 text-right text-sm font-medium">Tax Paid</th>
              <th className="p-2 text-center text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockReports.map((report) => (
              <tr key={report.id} className="border-b">
                <td className="p-2 text-sm font-medium">{report.quarter}</td>
                <td className="p-2 text-sm">{report.filingDate}</td>
                <td className="p-2 text-sm">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{report.status}</Badge>
                </td>
                <td className="p-2 text-sm text-right">{report.totalMiles.toLocaleString()}</td>
                <td className="p-2 text-sm text-right">{report.totalGallons.toLocaleString()}</td>
                <td className="p-2 text-sm text-right">{report.taxPaid}</td>
                <td className="p-2 text-sm">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="icon" title="View Report">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Download Report">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
