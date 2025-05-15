import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { auth } from "@clerk/nextjs/server";
import { getIftaReports } from "@/lib/actions/ifta-actions";
import type { RawIftaReport } from "@/types/ifta-report";

export async function GET(req: NextRequest) {
  // Require authenticated user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const quarter = Number(searchParams.get("quarter"));
  const id = searchParams.get("id");
  if (!year || !quarter || !id) {
    return NextResponse.json(
      { error: "Missing year, quarter, or id" },
      { status: 400 },
    );
  }

  // Fetch the report data
  let reports: RawIftaReport[];
  try {
    reports = await getIftaReports({ year, quarter, limit: 10 });
  } catch (err) {
    console.error("Error fetching IFTA reports:", err);
    // TODO: integrate alerting for fetch failures
    return NextResponse.json(
      { error: "Failed to fetch IFTA reports" },
      { status: 500 }
    );
  }
  const report = reports.find((r) => r.id === id);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Create PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // Example PDF content (customize as needed)
  doc.fontSize(20).text("IFTA Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Year: ${year}`);
  doc.text(`Quarter: ${quarter}`);
  doc.text(`Report ID: ${id}`);
  doc.moveDown();
  doc.text("Summary:");
  doc.text(JSON.stringify(report, null, 2));

  doc.end();
  await new Promise((resolve) => doc.on("end", resolve));
  const pdfBuffer = Buffer.concat(chunks);
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=ifta-report-${id}.pdf`,
    },
  });
}
