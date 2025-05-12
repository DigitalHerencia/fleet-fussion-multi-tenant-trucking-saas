"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

export type IftaReport = {
  id: string | number;
  quarter: string;
  filingDate: string;
  status: string;
  totalMiles: number;
  totalGallons: number;
  taxPaid: string;
};

interface IftaReportTableProps {
  reports: IftaReport[];
}

export function IftaReportTable({ reports }: IftaReportTableProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(report: IftaReport) {
    setDownloading(report.id.toString());
    try {
      const res = await fetch(
        `/api/ifta-report?year=${new Date().getFullYear()}&quarter=${report.quarter.replace("Q", "")}&id=${report.id}`,
      );
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `IFTA_Report_${new Date().getFullYear()}_${report.quarter}.pdf`;
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
              <th className="p-2 text-right text-sm font-medium">
                Total Miles
              </th>
              <th className="p-2 text-right text-sm font-medium">
                Total Gallons
              </th>
              <th className="p-2 text-right text-sm font-medium">Tax Paid</th>
              <th className="p-2 text-center text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b">
                <td className="p-2 text-sm font-medium">{report.quarter}</td>
                <td className="p-2 text-sm">{report.filingDate}</td>
                <td className="p-2 text-sm">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {report.status}
                  </Badge>
                </td>
                <td className="p-2 text-sm text-right">
                  {report.totalMiles.toLocaleString()}
                </td>
                <td className="p-2 text-sm text-right">
                  {report.totalGallons.toLocaleString()}
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
