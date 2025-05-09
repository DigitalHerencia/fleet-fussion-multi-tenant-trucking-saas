import { NextRequest, NextResponse } from "next/server"
import { getIftaReports } from "@/lib/fetchers/ifta"
import PDFDocument from "pdfkit"

// /api/ifta/report?year=2024&quarter=2&id=REPORT_ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year = Number(searchParams.get("year"))
  const quarter = Number(searchParams.get("quarter"))
  const id = searchParams.get("id")
  if (!year || !quarter || !id) {
    return NextResponse.json({ error: "Missing year, quarter, or id" }, { status: 400 })
  }

  // Fetch the report data
  const reports = await getIftaReports({ year, quarter, limit: 1 })
  const report = reports.find(r => r.id === id)
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  // Create PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const chunks: Buffer[] = []
  doc.on("data", chunk => chunks.push(chunk))
  doc.on("end", () => {})

  // Title
  doc.fontSize(20).text(`IFTA Quarterly Report`, { align: "center" })
  doc.moveDown()
  doc.fontSize(14).text(`Year: ${year} | Quarter: Q${quarter}`)
  doc.text(`Status: ${report.status}`)
  doc.text(
    `Filing Date: ${
      report.submittedDate
        ? new Date(report.submittedDate).toLocaleDateString()
        : "N/A"
    }`
  )
  doc.moveDown()
  doc.fontSize(12).text(`Total Miles: ${report.totalMiles.toLocaleString()}`)
  doc.text(`Total Gallons: ${report.totalGallons.toLocaleString()}`)
  // Calculate total tax paid from jurisdictions if available
  const taxPaid =
    Array.isArray(report.reportData?.jurisdictions)
      ? report.reportData.jurisdictions.reduce(
          (sum: number, j: any) => sum + (Number(j.taxOwed) || 0),
          0
        )
      : null
  doc.text(`Tax Paid: ${taxPaid !== null ? `$${taxPaid.toFixed(2)}` : "N/A"}`)
  doc.moveDown()

  // Jurisdiction breakdown (if available)
  if (report.reportData?.jurisdictions) {
    doc.fontSize(14).text("Jurisdiction Breakdown:")
    doc.moveDown(0.5)
    doc.fontSize(11)
    report.reportData.jurisdictions.forEach((j: any) => {
      doc.text(
        `${j.state}: Miles: ${j.miles}, Gallons: ${j.gallons}, Tax Owed: $${j.taxOwed}`
      )
    })
    doc.moveDown()
  }

  doc.end()
  const pdfBuffer = await new Promise<Buffer>(resolve => {
    const bufs: Buffer[] = []
    doc.on("data", d => bufs.push(d))
    doc.on("end", () => resolve(Buffer.concat(bufs)))
  })

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=IFTA_Report_${year}_Q${quarter}.pdf`
    }
  })
}
