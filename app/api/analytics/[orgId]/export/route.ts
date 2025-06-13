import ExcelJS from 'exceljs';

async function generateExcelExport(data: any, metrics?: string[]) {
  const workbook = new ExcelJS.Workbook();

  // Main Data Sheet
  const mainData = prepareDataForExport(data.current || [], metrics);
  const mainSheet = workbook.addWorksheet('Analytics Data');
  if (mainData.length) {
    mainSheet.columns = Object.keys(mainData[0]).map(key => ({ header: key, key }));
    mainSheet.addRows(mainData);
  }

  // Comparison Data Sheet
  if (data.previous) {
    const comparisonData = prepareDataForExport(data.previous, metrics);
    const comparisonSheet = workbook.addWorksheet('Previous Period');
    if (comparisonData.length) {
      comparisonSheet.columns = Object.keys(comparisonData[0]).map(key => ({ header: key, key }));
      comparisonSheet.addRows(comparisonData);
    }
  }

  // Summary Sheet
  if (data.comparison) {
    const summaryData = [
      { metric: 'Revenue Change', value: `${data.comparison.revenueChange?.percentage || 0}%` },
      { metric: 'Loads Change', value: `${data.comparison.loadsChange?.percentage || 0}%` },
      { metric: 'Miles Change', value: `${data.comparison.milesChange?.percentage || 0}%` },
    ];
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric' },
      { header: 'Value', key: 'value' }
    ];
    summarySheet.addRows(summaryData);
  }

  // Write buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="analytics-export-${Date.now()}.xlsx"`,
    },
  });
}
