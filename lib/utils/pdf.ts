import PDFDocument from "pdfkit"

export function exportToPDF(title: string, rows: Record<string, any>[]): Buffer {
    const doc = new PDFDocument({ margin: 30 })
    const buffers: Buffer[] = []
    doc.on("data", buffers.push.bind(buffers))
    doc.on("end", () => {})

    doc.fontSize(18).text(title, { align: "center" })
    doc.moveDown()

    if (rows.length > 0 && rows[0]) {
        const headers = Object.keys(rows[0])
        doc.fontSize(12).text(headers.join(" | "))
        doc.moveDown(0.5)
        rows.forEach(row => {
            doc.text(headers.map(h => String(row[h] ?? "")).join(" | "))
        })
    } else {
        doc.text("No data available.")
    }

    doc.end()
    return Buffer.concat(buffers)
}
