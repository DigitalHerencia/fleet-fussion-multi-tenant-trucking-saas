export const dynamic = "force-dynamic";

import { IftaReportTable } from "@/components/ifta/ifta-report-table";
import type { RawIftaReport } from "@/types/types";
import { getIftaReports } from "@/lib/actions/ifta-actions";

export default async function IFTAPage() {
  // Fetch IFTA reports for the current year and Q1 (example)
  const year = new Date().getFullYear();
  const quarter = 1;
  const reports: RawIftaReport[] = await getIftaReports({ year, quarter, limit: 20 });

  // Transform reports to match IftaReportTable's expected prop type
  const tableReports = reports.map((report) => ({
    id: report.id,
    dueDate: report.dueDate,
    status: report.status,
    totalMiles: report.totalMiles,
    totalGallons: report.totalGallons,
    reportData: report.reportData,
    taxPaid: report.reportData?.taxPaid !== undefined ? report.reportData.taxPaid.toFixed(2) : "0.00",
    filingDate: report.dueDate ?? "",
    quarter: report.quarter, // keep as number for RawIftaReport compatibility
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">IFTA Reports</h1>
      <IftaReportTable reports={tableReports as (RawIftaReport & { taxPaid: string; filingDate: string; quarter: string | number })[]} />
    </div>
  );
}
