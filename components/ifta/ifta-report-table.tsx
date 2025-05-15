"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import type { RawIftaReport } from "@/types/types";

interface IftaReportTableProps {
  reports: Array<RawIftaReport & {
    taxPaid: string;
    filingDate: string;
    quarter: string | number;
  }>;
}

export function IftaReportTable({ reports }: IftaReportTableProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(report: RawIftaReport & { quarter: string | number }) {
    setDownloading(report.id.toString());
    try {
      let quarterNum: number;
      if (typeof report.quarter === "string") {
        const qStr = report.quarter as string;
        quarterNum = qStr.startsWith("Q") ? Number(qStr.substring(1)) : Number(qStr);
      } else if (typeof report.quarter === "number") {
        quarterNum = report.quarter;
      } else {
        quarterNum = 1; // fallback
      }
      const res = await fetch(
        `/api/ifta-report?year=${new Date().getFullYear()}&quarter=${quarterNum}&id=${report.id}`,
      );
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `IFTA_Report_${new Date().getFullYear()}_Q${quarterNum}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

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
            {reports.map((report) => (
              <tr key={report.id} className="border-b">
                <td className="p-2 text-sm font-medium">{typeof report.quarter === "number" ? `Q${report.quarter}` : report.quarter}</td>
                <td className="p-2 text-sm">{report.filingDate ?? report.dueDate}</td>
                <td className="p-2 text-sm">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {report.status ?? "Draft"}
                  </Badge>
                </td>
                <td className="p-2 text-sm text-right">
                  {report.totalMiles ? report.totalMiles.toLocaleString() : 0}
                </td>
                <td className="p-2 text-sm text-right">
                  {report.totalGallons ? report.totalGallons.toLocaleString() : 0}
                </td>
                <td className="p-2 text-sm text-right">{report.taxPaid}</td>
                <td className="p-2 text-sm">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Download Report"
                      onClick={() => handleDownload(report)}
                      disabled={downloading === report.id.toString()}
                    >
                      {downloading === report.id.toString() ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" title="View Report">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
